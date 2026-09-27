import { db } from "@/db";
import { orders, paymentTransactions, orderTrackingEvents } from "@/db/schema";
import { verifyWebhookSignature } from "@/lib/payment";
import { sendOrderStatusEmail } from "@/lib/email";
import { eq } from "drizzle-orm";

export interface WebhookEventPayload {
  id: string;
  type: "payment_intent.succeeded" | "checkout.session.completed" | "payment_intent.payment_failed";
  data: {
    orderNumber: string;
    sessionId: string;
    transactionId: string;
    amount: number;
    gateway: string;
    cardBrand?: string;
    cardLast4?: string;
    failureReason?: string;
  };
}

export async function handleVerifiedWebhookEvent(event: WebhookEventPayload) {
  const { orderNumber, sessionId, transactionId, amount, gateway, cardBrand, cardLast4, failureReason } = event.data;
  const isSuccess = event.type === "payment_intent.succeeded" || event.type === "checkout.session.completed";

  const result = await db.transaction(async (tx) => {
    const orderRows = await tx.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
    if (orderRows.length === 0) {
      throw new Error("ORDER_NOT_FOUND");
    }
    const order = orderRows[0];

    // Verify amount matches order total on server
    if (Number(amount) !== order.total) {
      throw new Error(`AMOUNT_MISMATCH: expected ${order.total}, got ${amount}`);
    }

    // Update or insert paymentTransaction
    const existingTx = await tx
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.sessionId, sessionId))
      .limit(1);

    if (existingTx.length > 0) {
      await tx
        .update(paymentTransactions)
        .set({
          transactionId,
          status: isSuccess ? "succeeded" : "failed",
          cardBrand: cardBrand || null,
          cardLast4: cardLast4 || null,
          verifiedByServer: true,
          rawPayload: event as unknown as Record<string, unknown>,
          updatedAt: new Date(),
        })
        .where(eq(paymentTransactions.id, existingTx[0].id));
    } else {
      await tx.insert(paymentTransactions).values({
        orderId: order.id,
        orderNumber: order.orderNumber,
        gateway: gateway || "stripe",
        sessionId,
        transactionId,
        amount: order.total,
        currency: "BDT",
        status: isSuccess ? "succeeded" : "failed",
        cardBrand: cardBrand || null,
        cardLast4: cardLast4 || null,
        verifiedByServer: true,
        rawPayload: event as unknown as Record<string, unknown>,
      });
    }

    // Update order paymentStatus (and confirm order if paid)
    const nextOrderStatus = isSuccess && order.orderStatus === "pending" ? "confirmed" : order.orderStatus;
    const updatedOrders = await tx
      .update(orders)
      .set({
        paymentStatus: isSuccess ? "paid" : "failed",
        paymentGateway: gateway || order.paymentGateway || "stripe",
        paymentTransactionId: transactionId,
        paidAt: isSuccess ? new Date() : null,
        orderStatus: nextOrderStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id))
      .returning();

    await tx.insert(orderTrackingEvents).values({
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: isSuccess ? nextOrderStatus : "payment_failed",
      title: isSuccess ? "Payment Verified & Order Confirmed" : "Payment Failed",
      description: isSuccess
        ? `Verified ${gateway.toUpperCase()} payment of ৳${order.total.toLocaleString()} (Txn: ${transactionId}${cardLast4 ? `, ${cardBrand || "Card"} •••• ${cardLast4}` : ""}).`
        : `Payment attempt failed (${failureReason || "Declined by gateway"}). You can retry payment anytime.`,
      location: "Payment Gateway Webhook",
      actorName: "Gateway Verifier",
    });

    return updatedOrders[0];
  });

  if (result.customerEmail) {
    await sendOrderStatusEmail({
      toEmail: result.customerEmail,
      customerName: result.customerName,
      orderNumber: result.orderNumber,
      orderStatus: result.orderStatus,
      paymentStatus: result.paymentStatus,
      note: isSuccess
        ? `Payment verified via ${gateway.toUpperCase()} (Transaction ID: ${transactionId}).`
        : `Payment attempt failed: ${failureReason || "Card declined"}.`,
    }).catch(() => {});
  }

  return result;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature =
      req.headers.get("stripe-signature") ||
      req.headers.get("x-payment-signature");

    const verification = verifyWebhookSignature(rawBody, signature);
    if (!verification.valid) {
      return Response.json(
        { error: `Webhook signature verification failed: ${verification.error}` },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody) as WebhookEventPayload;
    if (!event?.type || !event?.data?.orderNumber) {
      return Response.json({ error: "Invalid webhook event payload" }, { status: 400 });
    }

    const updatedOrder = await handleVerifiedWebhookEvent(event);
    return Response.json({
      ok: true,
      verified: true,
      orderNumber: updatedOrder.orderNumber,
      paymentStatus: updatedOrder.paymentStatus,
      orderStatus: updatedOrder.orderStatus,
    });
  } catch (e) {
    console.error("Payment webhook error:", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Webhook processing failed" },
      { status: 400 }
    );
  }
}
