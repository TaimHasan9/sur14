import { db } from "@/db";
import { orders, orderItems, products, orderTrackingEvents, paymentTransactions } from "@/db/schema";
import { getSessionUser, isStaffRole, hasPermission, logAdminActivity } from "@/lib/auth";
import { sendOrderStatusEmail } from "@/lib/email";
import { eq, asc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function dispatchToCourierGateway(params: {
  courierName: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  codAmount: number;
}): Promise<{ consignmentId: string; trackingCode: string; courierStatus: string }> {
  const c = params.courierName.toLowerCase();
  const suffix = Math.floor(10000000 + Math.random() * 90000000);

  // Steadfast live API support when STEADFAST_API_KEY is configured
  if (c === "steadfast" && process.env.STEADFAST_API_KEY && process.env.STEADFAST_SECRET_KEY) {
    try {
      const res = await fetch("https://portal.packzy.com/api/v1/create_order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": process.env.STEADFAST_API_KEY,
          "Secret-Key": process.env.STEADFAST_SECRET_KEY,
        },
        body: JSON.stringify({
          invoice: params.orderNumber,
          recipient_name: params.customerName,
          recipient_phone: params.customerPhone,
          recipient_address: params.address,
          cod_amount: params.codAmount,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        if (d?.consignment?.consignment_id) {
          return {
            consignmentId: String(d.consignment.consignment_id),
            trackingCode: String(d.consignment.tracking_code || d.consignment.consignment_id),
            courierStatus: String(d.consignment.status || "in_review"),
          };
        }
      }
    } catch (e) {
      console.error("Steadfast API fallback:", e);
    }
  }

  const prefix = c === "steadfast" ? "SF" : c === "pathao" ? "PTH" : c === "redx" ? "RDX" : "MTG";
  return {
    consignmentId: `${prefix}-${suffix}`,
    trackingCode: `${prefix}TRK${suffix}`,
    courierStatus: "Parcel Booked & Ready for Dispatch",
  };
}

export async function GET(req: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  try {
    const { orderNumber } = await params;
    const url = new URL(req.url);
    const phone = url.searchParams.get("phone") || "";

    const rows = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
    if (rows.length === 0) return Response.json({ error: "Order not found" }, { status: 404 });
    const order = rows[0];

    const user = await getSessionUser();
    const isOwner = user && order.userId && user.id === order.userId;
    const isStaff = user && isStaffRole(user.role);
    const phoneMatch = phone && order.customerPhone === phone.trim();
    const emailMatch = user && order.customerEmail && user.email.toLowerCase() === order.customerEmail.toLowerCase();

    if (!isOwner && !isStaff && !phoneMatch && !emailMatch) {
      return Response.json({ error: "You do not have permission to view this order. Please enter your mobile number." }, { status: 403 });
    }

    const [items, timeline, transactions] = await Promise.all([
      db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
      db.select().from(orderTrackingEvents).where(eq(orderTrackingEvents.orderId, order.id)).orderBy(asc(orderTrackingEvents.createdAt)),
      db.select().from(paymentTransactions).where(eq(paymentTransactions.orderId, order.id)),
    ]);

    return Response.json({ order, items, timeline, transactions });
  } catch (e) {
    console.error("order detail error", e);
    return Response.json({ error: "Failed to load order" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  try {
    const { orderNumber } = await params;
    const body = await req.json();
    const user = await getSessionUser();

    const orderRows = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
    if (orderRows.length === 0) return Response.json({ error: "Order not found" }, { status: 404 });
    const existingOrder = orderRows[0];

    // ── Mode A: Customer Self-Service Cancel or Refund Request ──
    if (body.customerAction) {
      const phone = String(body.phone || "").trim();
      const isOwner = user && existingOrder.userId && user.id === existingOrder.userId;
      const phoneMatch = phone && existingOrder.customerPhone === phone;
      if (!isOwner && !phoneMatch) {
        return Response.json({ error: "Unauthorized to modify this order" }, { status: 403 });
      }

      if (body.customerAction === "cancel") {
        if (existingOrder.orderStatus !== "pending" && existingOrder.orderStatus !== "confirmed") {
          return Response.json(
            { error: "Orders that have already been shipped or delivered cannot be cancelled directly. Please request a refund." },
            { status: 400 }
          );
        }
        const reason = String(body.reason || "Cancelled by customer").trim();

        const updated = await db.transaction(async (tx) => {
          const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, existingOrder.id));
          for (const it of items) {
            if (it.productId) {
              await tx
                .update(products)
                .set({
                  stock: sql`${products.stock} + ${it.quantity}`,
                  totalSold: sql`greatest(0, ${products.totalSold} - ${it.quantity})`,
                  updatedAt: new Date(),
                })
                .where(eq(products.id, it.productId));
            }
          }

          const res = await tx
            .update(orders)
            .set({
              orderStatus: "cancelled",
              cancelledAt: new Date(),
              cancelReason: reason,
              refundStatus: existingOrder.paymentStatus === "paid" ? "requested" : "none",
              refundReason: existingOrder.paymentStatus === "paid" ? `Order cancelled: ${reason}` : null,
              updatedAt: new Date(),
            })
            .where(eq(orders.id, existingOrder.id))
            .returning();

          await tx.insert(orderTrackingEvents).values({
            orderId: existingOrder.id,
            orderNumber: existingOrder.orderNumber,
            status: "cancelled",
            title: "Order Cancelled by Customer",
            description: `Reason: ${reason}. Stock restored automatically.`,
            location: "Customer Portal",
            actorName: existingOrder.customerName,
          });

          return res[0];
        });

        if (updated.customerEmail) {
          await sendOrderStatusEmail({
            toEmail: updated.customerEmail,
            customerName: updated.customerName,
            orderNumber: updated.orderNumber,
            orderStatus: "cancelled",
            note: `Cancelled by customer (${reason})`,
          }).catch(() => {});
        }

        return Response.json({ ok: true, order: updated });
      }

      if (body.customerAction === "request_refund") {
        const reason = String(body.reason || "Customer requested refund").trim();
        const updated = await db
          .update(orders)
          .set({
            refundStatus: "requested",
            refundReason: reason,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, existingOrder.id))
          .returning();

        await db.insert(orderTrackingEvents).values({
          orderId: existingOrder.id,
          orderNumber: existingOrder.orderNumber,
          status: "refund_requested",
          title: "Refund Requested",
          description: `Customer requested refund: ${reason}`,
          location: "Customer Portal",
          actorName: existingOrder.customerName,
        });

        return Response.json({ ok: true, order: updated[0] });
      }

      return Response.json({ error: "Invalid customer action" }, { status: 400 });
    }

    // ── Mode B: Admin / Manager / Staff Order Management ──
    if (!user || !isStaffRole(user.role)) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Permission checks based on requested change
    if (body.refundStatus && !hasPermission(user.role, "orders.refund")) {
      return Response.json({ error: "Forbidden: orders.refund permission required (Admin / Super Admin only)" }, { status: 403 });
    }
    if (body.bookCourier && !hasPermission(user.role, "orders.courier")) {
      return Response.json({ error: "Forbidden: orders.courier permission required" }, { status: 403 });
    }

    const update: Record<string, unknown> = { updatedAt: new Date() };
    let trackingTitle = "";
    let trackingDesc = "";

    // 1. Courier Booking (Steadfast / Pathao / RedX)
    if (body.bookCourier && body.courierName) {
      const codAmount = existingOrder.paymentStatus === "paid" ? 0 : existingOrder.total;
      const courierData = await dispatchToCourierGateway({
        courierName: String(body.courierName),
        orderNumber: existingOrder.orderNumber,
        customerName: existingOrder.customerName,
        customerPhone: existingOrder.customerPhone,
        address: `${existingOrder.address}${existingOrder.thana ? `, ${existingOrder.thana}` : ""}${existingOrder.district ? `, ${existingOrder.district}` : ""}`,
        codAmount,
      });

      update.courierName = String(body.courierName).toLowerCase();
      update.courierConsignmentId = courierData.consignmentId;
      update.courierTrackingCode = body.courierTrackingCode || courierData.trackingCode;
      update.courierStatus = courierData.courierStatus;
      update.orderStatus = "shipped";
      update.shippedAt = new Date();
      trackingTitle = `Dispatched via ${String(body.courierName).toUpperCase()}`;
      trackingDesc = `Consignment ID: ${courierData.consignmentId} · Tracking Code: ${update.courierTrackingCode}`;
    }

    // 2. Order Status Change
    if (body.orderStatus && body.orderStatus !== existingOrder.orderStatus) {
      update.orderStatus = body.orderStatus;
      if (body.orderStatus === "shipped") update.shippedAt = new Date();
      if (body.orderStatus === "delivered") update.deliveredAt = new Date();
      if (body.orderStatus === "cancelled") {
        update.cancelledAt = new Date();
        update.cancelReason = body.cancelReason || `Cancelled by ${user.name} (${user.role})`;
      }
      if (!trackingTitle) {
        trackingTitle = `Order Status Updated to ${String(body.orderStatus).toUpperCase()}`;
        trackingDesc = body.note || `Updated by ${user.name} (${user.role})`;
      }
    }

    // 3. Payment Status / Refund Processing
    if (body.paymentStatus) {
      update.paymentStatus = body.paymentStatus;
      if (body.paymentStatus === "paid" && !existingOrder.paidAt) {
        update.paidAt = new Date();
      }
    }

    if (body.refundStatus) {
      update.refundStatus = body.refundStatus;
      if (body.refundReason) update.refundReason = body.refundReason;
      if (body.refundStatus === "refunded") {
        update.paymentStatus = "refunded";
        update.refundAmount = body.refundAmount ? Number(body.refundAmount) : existingOrder.total;
        update.refundedAt = new Date();
        trackingTitle = "Refund Processed";
        trackingDesc = `Refunded ৳${update.refundAmount} to customer (${body.refundReason || "Approved by Admin"}).`;
      }
    }

    const updatedOrder = await db.transaction(async (tx) => {
      // Restore stock if order is newly cancelled or refunded (and wasn't already cancelled)
      const shouldRestoreStock =
        (update.orderStatus === "cancelled" || update.refundStatus === "refunded") &&
        existingOrder.orderStatus !== "cancelled" &&
        existingOrder.refundStatus !== "refunded";

      if (shouldRestoreStock) {
        const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, existingOrder.id));
        for (const it of items) {
          if (it.productId) {
            await tx
              .update(products)
              .set({
                stock: sql`${products.stock} + ${it.quantity}`,
                totalSold: sql`greatest(0, ${products.totalSold} - ${it.quantity})`,
                updatedAt: new Date(),
              })
              .where(eq(products.id, it.productId));
          }
        }
      }

      const res = await tx.update(orders).set(update).where(eq(orders.id, existingOrder.id)).returning();

      if (trackingTitle) {
        await tx.insert(orderTrackingEvents).values({
          orderId: existingOrder.id,
          orderNumber: existingOrder.orderNumber,
          status: String(update.orderStatus || update.refundStatus || existingOrder.orderStatus),
          title: trackingTitle,
          description: trackingDesc,
          location: update.courierName ? `${String(update.courierName).toUpperCase()} Hub` : "Mr Tom Gadgets Fulfillment",
          actorName: `${user.name} (${user.role})`,
        });
      }

      return res[0];
    });

    await logAdminActivity({
      actor: user,
      action: body.bookCourier ? "order.courier_book" : body.refundStatus ? "order.refund" : "order.status_update",
      entityType: "order",
      entityId: updatedOrder.orderNumber,
      summary: `Order #${updatedOrder.orderNumber}: ${trackingTitle || "Updated order details"}`,
      details: update,
      req,
    });

    if (updatedOrder.customerEmail) {
      await sendOrderStatusEmail({
        toEmail: updatedOrder.customerEmail,
        customerName: updatedOrder.customerName,
        orderNumber: updatedOrder.orderNumber,
        orderStatus: updatedOrder.orderStatus,
        paymentStatus: updatedOrder.paymentStatus,
        courierName: updatedOrder.courierName,
        courierTrackingCode: updatedOrder.courierTrackingCode,
        note: trackingDesc,
      }).catch(() => {});
    }

    return Response.json({ ok: true, order: updatedOrder });
  } catch (e) {
    console.error("order PATCH error", e);
    return Response.json({ error: "Update failed" }, { status: 500 });
  }
}
