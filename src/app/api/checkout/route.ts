import { db } from "@/db";
import {
  orders,
  orderItems,
  products,
  cartItems,
  coupons,
  analyticsEvents,
  orderTrackingEvents,
  paymentTransactions,
} from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { ensureCatalogSeeded } from "@/lib/auto-seed";
import { generatePaymentSessionId } from "@/lib/payment";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { eq, and, gte, or, isNull, lt, gt, sql } from "drizzle-orm";

function genOrderNumber(): string {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `MTG${rand}`;
}

function genInvoiceNumber(orderNumber: string): string {
  const yr = new Date().getFullYear();
  return `INV-${yr}-${orderNumber}`;
}

export async function POST(req: Request) {
  try {
    // 1. Rate limiting on checkout endpoint
    const rl = await checkRateLimit(req, {
      endpoint: "checkout",
      maxRequests: 10,
      windowSeconds: 300,
      blockDurationSeconds: 300,
    });
    if (!rl.allowed) {
      return Response.json({ error: rl.error || "Too many checkout requests. Please wait a moment." }, { status: 429 });
    }

    await ensureCatalogSeeded().catch(() => {});

    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      address,
      district,
      thana,
      paymentMethod,
      couponCode,
      notes,
      guestId,
      expectedTotal,
    } = body;

    // Security check: explicitly reject any attempt to pass paid=true or paymentStatus='paid' from frontend
    if (body.paid === true || body.paymentStatus === "paid") {
      return Response.json(
        { error: "Security violation: Payment status cannot be set from client. Server-side gateway verification is required." },
        { status: 400 }
      );
    }

    if (!customerName || !customerPhone || !address) {
      return Response.json({ error: "Name, mobile number, and address are required" }, { status: 400 });
    }
    if (!/^01[3-9]\d{8}$/.test(String(customerPhone).trim())) {
      return Response.json({ error: "Enter a valid Bangladesh mobile number (01XXXXXXXXX)" }, { status: 400 });
    }

    const validPaymentMethods = new Set(["cod", "card", "bkash", "nagad", "rocket"]);
    const method = validPaymentMethods.has(String(paymentMethod)) ? String(paymentMethod) : "cod";

    const user = await getSessionUser();

    // 2. Resolve requested cart lines (deduplicate slugs so a user cannot split same slug into two lines to bypass stock check)
    const rawLines: Array<{ slug: string; qty: number }> = [];
    if (Array.isArray(body.lines) && body.lines.length > 0) {
      for (const d of body.lines) {
        const qty = Math.floor(Number(d?.qty) || 0);
        if (!d?.slug || qty <= 0 || qty > 20) {
          return Response.json({ error: "Invalid item quantity in cart" }, { status: 400 });
        }
        rawLines.push({ slug: String(d.slug).trim(), qty });
      }
    } else if (user) {
      const cart = await db
        .select({ slug: products.slug, qty: cartItems.quantity })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.userId, user.id));
      rawLines.push(...cart);
    } else if (guestId) {
      const cart = await db
        .select({ slug: products.slug, qty: cartItems.quantity })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.guestId, String(guestId)));
      rawLines.push(...cart);
    }

    if (rawLines.length === 0) {
      return Response.json({ error: "Your cart is empty" }, { status: 400 });
    }

    const mergedLinesMap = new Map<string, number>();
    for (const l of rawLines) {
      mergedLinesMap.set(l.slug, (mergedLinesMap.get(l.slug) || 0) + l.qty);
    }
    const slugLines = Array.from(mergedLinesMap.entries()).map(([slug, qty]) => ({ slug, qty }));

    // 3. Execute atomic database transaction for:
    //    - Product existence, active status, price & atomic stock decrement (race-condition safe)
    //    - Coupon validation & atomic usage increment (race-condition safe)
    //    - Order & orderItems insertion
    //    - Initial tracking event & payment session creation
    //    - Cart cleanup
    const txResult = await db.transaction(async (tx) => {
      const verifiedLines: Array<{
        productId: string;
        name: string;
        nameBn: string | null;
        price: number;
        quantity: number;
        img?: string;
        emoji?: string | null;
      }> = [];

      let subtotal = 0;

      for (const l of slugLines) {
        const rows = await tx.select().from(products).where(eq(products.slug, l.slug)).limit(1);
        if (rows.length === 0) {
          throw new Error(`PRODUCT_NOT_FOUND:${l.slug}`);
        }
        const p = rows[0];
        if (!p.isActive) {
          throw new Error(`PRODUCT_INACTIVE:${p.name}`);
        }
        if (p.price <= 0) {
          throw new Error(`INVALID_PRICE:${p.name}`);
        }

        // Atomic conditional UPDATE to prevent race conditions when two buyers purchase the last item simultaneously
        const decremented = await tx
          .update(products)
          .set({
            stock: sql`${products.stock} - ${l.qty}`,
            totalSold: sql`${products.totalSold} + ${l.qty}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(products.id, p.id),
              eq(products.isActive, true),
              gte(products.stock, l.qty)
            )
          )
          .returning();

        if (decremented.length === 0) {
          throw new Error(`INSUFFICIENT_STOCK:${p.name}:${p.stock}`);
        }

        subtotal += p.price * l.qty;
        const imgs = (p.images as string[]) || [];
        verifiedLines.push({
          productId: p.id,
          name: p.name,
          nameBn: p.nameBn,
          price: p.price,
          quantity: l.qty,
          img: imgs[0],
          emoji: p.emoji,
        });
      }

      const isDhaka = district && /dhaka|ঢাকা|inside/i.test(String(district)) && !/outside/i.test(String(district));
      const deliveryCharge = subtotal >= 2000 ? 0 : isDhaka ? 60 : 120;

      let discount = 0;
      let appliedCoupon: string | null = null;

      if (couponCode && String(couponCode).trim()) {
        const code = String(couponCode).trim().toUpperCase();
        const cRows = await tx.select().from(coupons).where(eq(coupons.code, code)).limit(1);
        if (cRows.length === 0 || !cRows[0].isActive) {
          throw new Error("COUPON_INVALID");
        }
        const c = cRows[0];
        if (c.expiresAt && new Date(c.expiresAt) < new Date()) {
          throw new Error("COUPON_EXPIRED");
        }
        if (subtotal < c.minOrder) {
          throw new Error(`COUPON_MIN_ORDER:${c.minOrder}`);
        }

        // Atomic conditional coupon usage increment to prevent coupon usage-limit race conditions
        const updatedCoupon = await tx
          .update(coupons)
          .set({ usedCount: sql`${coupons.usedCount} + 1` })
          .where(
            and(
              eq(coupons.id, c.id),
              eq(coupons.isActive, true),
              or(isNull(coupons.usageLimit), lt(coupons.usedCount, coupons.usageLimit)),
              or(isNull(coupons.expiresAt), gt(coupons.expiresAt, new Date()))
            )
          )
          .returning();

        if (updatedCoupon.length === 0) {
          throw new Error("COUPON_LIMIT_REACHED");
        }

        discount = c.type === "percent" ? Math.round((subtotal * c.value) / 100) : c.value;
        if (c.maxDiscount) discount = Math.min(discount, c.maxDiscount);
        appliedCoupon = c.code;
      }

      const total = Math.max(0, subtotal + deliveryCharge - discount);

      // Verify total if client sent expectedTotal
      if (expectedTotal !== undefined && expectedTotal !== null && Number(expectedTotal) > 0) {
        if (Math.abs(Number(expectedTotal) - total) > 60) {
          // Allow 60 BDT Inside/Outside Dhaka delivery difference, reject any price/discount tampering
          throw new Error(`TOTAL_MISMATCH:${total}`);
        }
      }

      const orderNumber = genOrderNumber();
      const invoiceNumber = genInvoiceNumber(orderNumber);
      const paymentSessionId = method !== "cod" ? generatePaymentSessionId() : null;
      const paymentGateway = method === "card" ? "stripe" : method === "cod" ? "cod" : method;

      const inserted = await tx
        .insert(orders)
        .values({
          orderNumber,
          invoiceNumber,
          userId: user?.id ?? null,
          customerName: String(customerName).trim(),
          customerPhone: String(customerPhone).trim(),
          customerEmail: customerEmail ? String(customerEmail).trim() : user?.email ?? null,
          address: String(address).trim(),
          district: district ? String(district).trim() : null,
          thana: thana ? String(thana).trim() : null,
          paymentMethod: method,
          paymentStatus: "pending", // Always pending until verified by server/webhook or COD delivery
          paymentGateway,
          paymentSessionId,
          orderStatus: "pending",
          subtotal,
          deliveryCharge,
          discount,
          total,
          couponCode: appliedCoupon,
          notes: notes ? String(notes).trim() : null,
        })
        .returning();

      const order = inserted[0];

      await tx.insert(orderItems).values(
        verifiedLines.map((l) => ({
          orderId: order.id,
          productId: l.productId,
          productName: l.name,
          productBn: l.nameBn,
          price: l.price,
          quantity: l.quantity,
          image: l.img,
          emoji: l.emoji || "📦",
        }))
      );

      await tx.insert(orderTrackingEvents).values({
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: "pending",
        title: "Order Placed",
        description:
          method === "cod"
            ? "Order received (Cash on Delivery). Awaiting confirmation."
            : `Order created. Awaiting ${method.toUpperCase()} payment verification.`,
        location: "Mr Tom Gadgets Online",
        actorName: String(customerName).trim(),
      });

      if (paymentSessionId) {
        await tx.insert(paymentTransactions).values({
          orderId: order.id,
          orderNumber: order.orderNumber,
          gateway: paymentGateway,
          sessionId: paymentSessionId,
          amount: total,
          currency: "BDT",
          status: "pending",
          verifiedByServer: false,
        });
      }

      if (user) {
        await tx.delete(cartItems).where(eq(cartItems.userId, user.id));
      } else if (guestId) {
        await tx.delete(cartItems).where(eq(cartItems.guestId, String(guestId)));
      }

      return { order, verifiedLines, subtotal, deliveryCharge, discount, total, paymentSessionId };
    });

    // 4. Analytics event (non-blocking)
    await db
      .insert(analyticsEvents)
      .values({
        sessionId: String(guestId || "server").slice(0, 60),
        userId: user?.id ?? null,
        type: "purchase",
        label: txResult.order.orderNumber,
        path: "/checkout",
        meta: {
          total: txResult.total,
          items: txResult.verifiedLines.reduce((s, l) => s + l.quantity, 0),
          phone: String(customerPhone).trim(),
        },
      })
      .catch(() => {});

    // 5. Send Order Confirmation Email
    const recipientEmail =
      (customerEmail && String(customerEmail).trim()) ||
      user?.email ||
      `${String(customerPhone).trim()}@customer.mrtomgadgets.com`;

    await sendOrderConfirmationEmail({
      toEmail: recipientEmail,
      customerName: txResult.order.customerName,
      orderNumber: txResult.order.orderNumber,
      invoiceNumber: txResult.order.invoiceNumber || `INV-${txResult.order.orderNumber}`,
      total: txResult.total,
      subtotal: txResult.subtotal,
      deliveryCharge: txResult.deliveryCharge,
      discount: txResult.discount,
      paymentMethod: txResult.order.paymentMethod,
      paymentStatus: txResult.order.paymentStatus,
      address: `${txResult.order.address}${txResult.order.thana ? `, ${txResult.order.thana}` : ""}${txResult.order.district ? `, ${txResult.order.district}` : ""}`,
      items: txResult.verifiedLines.map((l) => ({
        name: l.name,
        quantity: l.quantity,
        price: l.price,
      })),
    }).catch(() => {});

    return Response.json({
      ok: true,
      orderNumber: txResult.order.orderNumber,
      invoiceNumber: txResult.order.invoiceNumber,
      orderId: txResult.order.id,
      total: txResult.total,
      paymentMethod: txResult.order.paymentMethod,
      paymentStatus: txResult.order.paymentStatus,
      paymentSessionId: txResult.paymentSessionId,
      requiresOnlinePayment: txResult.order.paymentMethod !== "cod",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.startsWith("PRODUCT_NOT_FOUND:")) {
      return Response.json({ error: `Product "${msg.split(":")[1]}" does not exist.` }, { status: 400 });
    }
    if (msg.startsWith("PRODUCT_INACTIVE:")) {
      return Response.json({ error: `"${msg.split(":")[1]}" is currently unavailable.` }, { status: 400 });
    }
    if (msg.startsWith("INVALID_PRICE:")) {
      return Response.json({ error: `Invalid product price for "${msg.split(":")[1]}".` }, { status: 400 });
    }
    if (msg.startsWith("INSUFFICIENT_STOCK:")) {
      const [, name, stock] = msg.split(":");
      return Response.json({ error: `"${name}" — only ${stock} left in stock.` }, { status: 409 });
    }
    if (msg === "COUPON_INVALID") {
      return Response.json({ error: "Coupon code is not valid or inactive." }, { status: 400 });
    }
    if (msg === "COUPON_EXPIRED") {
      return Response.json({ error: "Coupon code has expired." }, { status: 400 });
    }
    if (msg.startsWith("COUPON_MIN_ORDER:")) {
      return Response.json({ error: `This coupon requires a minimum order of ৳${msg.split(":")[1]}.` }, { status: 400 });
    }
    if (msg === "COUPON_LIMIT_REACHED") {
      return Response.json({ error: "Coupon usage limit has been reached." }, { status: 409 });
    }
    if (msg.startsWith("TOTAL_MISMATCH:")) {
      return Response.json({ error: `Order total mismatch. Server calculated ৳${msg.split(":")[1]}. Please refresh your cart.` }, { status: 400 });
    }
    console.error("checkout error", e);
    return Response.json({ error: "Something went wrong placing the order" }, { status: 500 });
  }
}
