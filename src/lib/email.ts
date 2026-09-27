import { db } from "@/db";
import { emailLogs } from "@/db/schema";

interface SendEmailInput {
  to: string;
  subject: string;
  template: "order_confirmation" | "order_status" | "email_verification" | "password_reset" | "refund_update";
  orderNumber?: string;
  html: string;
  meta?: Record<string, unknown>;
}

export async function sendSystemEmail(input: SendEmailInput): Promise<{ ok: boolean; id?: string }> {
  const from = process.env.EMAIL_FROM || "Mr Tom Gadgets <no-reply@mrtomgadgets.com>";
  const resendKey = process.env.RESEND_API_KEY;
  let status = "logged";
  let provider = "db_mailbox";

  if (resendKey && input.to && !input.to.endsWith("@phone.local")) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from,
          to: [input.to],
          subject: input.subject,
          html: input.html,
        }),
      });
      if (res.ok) {
        status = "sent";
        provider = "resend";
      } else {
        status = "logged";
      }
    } catch (e) {
      console.error("Resend email error:", e);
      status = "logged";
    }
  }

  try {
    const inserted = await db
      .insert(emailLogs)
      .values({
        toEmail: input.to || "customer@mrtomgadgets.com",
        subject: input.subject,
        template: input.template,
        orderNumber: input.orderNumber || null,
        bodyHtml: input.html,
        status,
        provider,
        meta: input.meta || {},
      })
      .returning();
    return { ok: true, id: inserted[0]?.id };
  } catch (e) {
    console.error("Email log insert failed:", e);
    return { ok: false };
  }
}

export async function sendOrderConfirmationEmail(params: {
  toEmail: string;
  customerName: string;
  orderNumber: string;
  invoiceNumber: string;
  total: number;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  paymentMethod: string;
  paymentStatus: string;
  address: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}) {
  const itemsHtml = params.items
    .map(
      (it) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">${it.name} × ${it.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-weight:bold;">৳${(it.price * it.quantity).toLocaleString()}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <div style="background:#16243d;color:#fff;padding:24px;">
        <h2 style="margin:0;color:#F27F20;">Mr Tom Gadgets</h2>
        <p style="margin:6px 0 0;font-size:14px;opacity:0.9;">Order Confirmation — #${params.orderNumber}</p>
      </div>
      <div style="padding:24px;color:#1f2937;">
        <p>Hi <strong>${params.customerName}</strong>,</p>
        <p>Thank you for your order! Your order <strong>#${params.orderNumber}</strong> (Invoice: <strong>${params.invoiceNumber}</strong>) has been received.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
          ${itemsHtml}
          <tr><td style="padding-top:10px;color:#6b7280;">Subtotal</td><td style="padding-top:10px;text-align:right;">৳${params.subtotal.toLocaleString()}</td></tr>
          <tr><td style="color:#6b7280;">Delivery Charge</td><td style="text-align:right;">৳${params.deliveryCharge.toLocaleString()}</td></tr>
          ${params.discount > 0 ? `<tr><td style="color:#16a34a;">Discount</td><td style="text-align:right;color:#16a34a;">-৳${params.discount.toLocaleString()}</td></tr>` : ""}
          <tr><td style="padding-top:8px;font-weight:bold;font-size:16px;">Total</td><td style="padding-top:8px;text-align:right;font-weight:bold;font-size:18px;color:#F27F20;">৳${params.total.toLocaleString()}</td></tr>
        </table>
        <p style="font-size:13px;color:#4b5563;">
          <strong>Payment:</strong> ${params.paymentMethod.toUpperCase()} (${params.paymentStatus.toUpperCase()})<br/>
          <strong>Delivery Address:</strong> ${params.address}
        </p>
        <p style="font-size:12px;color:#9ca3af;margin-top:20px;">Track your order anytime at /track-order?code=${params.orderNumber}</p>
      </div>
    </div>
  `;

  return sendSystemEmail({
    to: params.toEmail,
    subject: `Order Confirmed #${params.orderNumber} — Mr Tom Gadgets`,
    template: "order_confirmation",
    orderNumber: params.orderNumber,
    html,
    meta: { total: params.total, invoiceNumber: params.invoiceNumber },
  });
}

export async function sendOrderStatusEmail(params: {
  toEmail: string;
  customerName: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus?: string;
  courierName?: string | null;
  courierTrackingCode?: string | null;
  note?: string;
}) {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <div style="background:#16243d;color:#fff;padding:20px 24px;">
        <h2 style="margin:0;color:#F27F20;">Mr Tom Gadgets — Order Update</h2>
      </div>
      <div style="padding:24px;color:#1f2937;">
        <p>Hello <strong>${params.customerName}</strong>,</p>
        <p>The status of your order <strong>#${params.orderNumber}</strong> has been updated to: <strong style="color:#F27F20;text-transform:uppercase;">${params.orderStatus}</strong>.</p>
        ${params.paymentStatus ? `<p><strong>Payment Status:</strong> ${params.paymentStatus.toUpperCase()}</p>` : ""}
        ${params.courierName ? `<p><strong>Courier:</strong> ${params.courierName.toUpperCase()} ${params.courierTrackingCode ? `(Tracking Code: <b>${params.courierTrackingCode}</b>)` : ""}</p>` : ""}
        ${params.note ? `<p><strong>Note:</strong> ${params.note}</p>` : ""}
        <p style="font-size:13px;color:#6b7280;margin-top:16px;">View live tracking & invoice at /track-order?code=${params.orderNumber}</p>
      </div>
    </div>
  `;

  return sendSystemEmail({
    to: params.toEmail,
    subject: `Order #${params.orderNumber} is now ${params.orderStatus.toUpperCase()} — Mr Tom Gadgets`,
    template: "order_status",
    orderNumber: params.orderNumber,
    html,
    meta: { orderStatus: params.orderStatus, courierName: params.courierName, courierTrackingCode: params.courierTrackingCode },
  });
}

export async function sendEmailVerificationEmail(params: {
  toEmail: string;
  name: string;
  token: string;
}) {
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;padding:24px;">
      <h2 style="color:#16243d;margin-top:0;">Verify Your Email — Mr Tom Gadgets</h2>
      <p>Hello <strong>${params.name}</strong>,</p>
      <p>Use the verification code below to verify your email address:</p>
      <div style="background:#fff7ed;border:2px dashed #F27F20;border-radius:8px;padding:16px;text-align:center;font-size:26px;font-weight:900;letter-spacing:4px;color:#F27F20;margin:16px 0;">
        ${params.token}
      </div>
      <p style="font-size:13px;color:#6b7280;">This verification code expires in 24 hours.</p>
    </div>
  `;
  return sendSystemEmail({
    to: params.toEmail,
    subject: `Verify your account (${params.token}) — Mr Tom Gadgets`,
    template: "email_verification",
    html,
    meta: { verificationCode: params.token },
  });
}

export async function sendPasswordResetEmail(params: {
  toEmail: string;
  name: string;
  token: string;
}) {
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;padding:24px;">
      <h2 style="color:#16243d;margin-top:0;">Password Reset — Mr Tom Gadgets</h2>
      <p>Hello <strong>${params.name}</strong>,</p>
      <p>We received a request to reset your password. Enter this reset code on the Reset Password screen:</p>
      <div style="background:#fef2f2;border:2px dashed #ef4444;border-radius:8px;padding:16px;text-align:center;font-size:26px;font-weight:900;letter-spacing:4px;color:#dc2626;margin:16px 0;">
        ${params.token}
      </div>
      <p style="font-size:13px;color:#6b7280;">This code is valid for 30 minutes. If you did not request this, please ignore this email.</p>
    </div>
  `;
  return sendSystemEmail({
    to: params.toEmail,
    subject: `Password Reset Code (${params.token}) — Mr Tom Gadgets`,
    template: "password_reset",
    html,
    meta: { resetCode: params.token },
  });
}
