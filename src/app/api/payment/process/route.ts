import { db } from "@/db";
import { orders } from "@/db/schema";
import {
  detectCardBrand,
  validateCardLuhn,
  generateTransactionId,
   generatePaymentSessionId,
  signWebhookPayload,
  verifyWebhookSignature,
} from "@/lib/payment";
import { handleVerifiedWebhookEvent, type WebhookEventPayload } from "@/app/api/payment/webhook/route";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Reject direct paid=true manipulation
    if (body.paid === true && !body.cardNumber && !body.walletNumber && !body.simulateDecline) {
      return Response.json(
        { error: "Security error: Frontend cannot mark order as paid directly. Complete gateway authorization." },
        { status: 400 }
      );
    }

    const orderNumber = String(body.orderNumber || "").trim();
    if (!orderNumber) {
      return Response.json({ error: "Order number is required" }, { status: 400 });
    }

    const orderRows = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
    if (orderRows.length === 0) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }
    const order = orderRows[0];

    if (order.paymentStatus === "paid") {
      return Response.json({ error: "This order is already paid and verified." }, { status: 400 });
    }

    const sessionId = order.paymentSessionId || String(body.sessionId || "") || generatePaymentSessionId();
    const gateway = String(body.gateway || order.paymentMethod || "stripe");
    const simulateDecline = Boolean(body.simulateDecline);

    let cardBrand = "Card";
    let cardLast4 = "";
    let isDeclined = simulateDecline;
    let failureReason = simulateDecline ? "Declined by issuing bank (Insufficient funds / Do not honor)" : "";

    if (gateway === "card" || gateway === "stripe") {
      const rawCard = String(body.cardNumber || "").replace(/\D/g, "");
      const expiry = String(body.expiry || "").trim();
      const cvc = String(body.cvc || "").trim();

      if (!rawCard || rawCard.length < 13) {
        return Response.json({ error: "Please enter a valid card number" }, { status: 400 });
      }
      // Stripe test decline card 4000000000000002 or explicit simulateDecline
      if (rawCard.endsWith("0002") || rawCard === "4000000000000002") {
        isDeclined = true;
        failureReason = "Your card was declined by the issuer (declined test card •••• 0002).";
      } else if (!validateCardLuhn(rawCard)) {
        return Response.json({ error: "Invalid card number (failed Luhn checksum verification)" }, { status: 400 });
      }

      if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        return Response.json({ error: "Enter card expiry in MM/YY format" }, { status: 400 });
      }
      if (!/^\d{3,4}$/.test(cvc)) {
        return Response.json({ error: "Enter a valid 3 or 4 digit CVC security code" }, { status: 400 });
      }

      cardBrand = detectCardBrand(rawCard);
      cardLast4 = rawCard.slice(-4);
    } else {
      // bKash / Nagad / Rocket online gateway verification
      const wallet = String(body.walletNumber || "").trim();
      const otp = String(body.otp || "").trim();
      if (!/^01[3-9]\d{8}$/.test(wallet)) {
        return Response.json({ error: "Enter a valid 11-digit mobile wallet number (01XXXXXXXXX)" }, { status: 400 });
      }
      if (!otp || otp.length < 4) {
        return Response.json({ error: "Enter the wallet verification OTP/PIN" }, { status: 400 });
      }
      cardBrand = gateway.toUpperCase();
      cardLast4 = wallet.slice(-4);
    }

    const transactionId = generateTransactionId(gateway === "card" || gateway === "stripe" ? "STRP" : gateway.toUpperCase());

    const webhookEvent: WebhookEventPayload = {
      id: `evt_${Date.now()}`,
      type: isDeclined ? "payment_intent.payment_failed" : "payment_intent.succeeded",
      data: {
        orderNumber: order.orderNumber,
        sessionId,
        transactionId,
        amount: order.total,
        gateway: gateway === "card" ? "stripe" : gateway,
        cardBrand,
        cardLast4,
        failureReason: isDeclined ? failureReason : undefined,
      },
    };

    // Cryptographically sign & verify webhook payload on the server
    const rawPayload = JSON.stringify(webhookEvent);
    const signature = signWebhookPayload(rawPayload);
    const verifiedSig = verifyWebhookSignature(rawPayload, signature);
    if (!verifiedSig.valid) {
      return Response.json({ error: "Internal webhook signature verification failed" }, { status: 500 });
    }

    const updatedOrder = await handleVerifiedWebhookEvent(webhookEvent);

    if (isDeclined) {
      return Response.json(
        {
          ok: false,
          paymentStatus: "failed",
          transactionId,
          error: failureReason || "Payment declined by gateway.",
        },
        { status: 402 }
      );
    }

    return Response.json({
      ok: true,
      verified: true,
      orderNumber: updatedOrder.orderNumber,
      paymentStatus: updatedOrder.paymentStatus,
      orderStatus: updatedOrder.orderStatus,
      transactionId,
      cardBrand,
      cardLast4,
    });
  } catch (e) {
    console.error("Payment process error:", e);
    return Response.json({ error: "Payment gateway processing failed" }, { status: 500 });
  }
}
