import { createHmac, timingSafeEqual, randomBytes } from "crypto";

export function getWebhookSecret(): string {
  return (
    process.env.STRIPE_WEBHOOK_SECRET ||
    process.env.PAYMENT_WEBHOOK_SECRET ||
    "whsec_mrtom_gateway_secret_2026"
  );
}

/**
 * Generates a Stripe-compatible HMAC-SHA256 signature header: `t=<timestamp>,v1=<hex>`
 */
export function signWebhookPayload(payload: string, secret = getWebhookSecret(), timestamp = Math.floor(Date.now() / 1000)): string {
  const signedPayload = `${timestamp}.${payload}`;
  const signature = createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");
  return `t=${timestamp},v1=${signature}`;
}

/**
 * Verifies a Stripe-compatible `t=...,v1=...` HMAC-SHA256 webhook signature.
 */
export function verifyWebhookSignature(
  payload: string,
  signatureHeader: string | null,
  secret = getWebhookSecret(),
  toleranceSeconds = 300
): { valid: boolean; error?: string } {
  if (!signatureHeader) {
    return { valid: false, error: "Missing webhook signature header" };
  }
  const parts = signatureHeader.split(",");
  const tPart = parts.find((p) => p.startsWith("t="));
  const v1Part = parts.find((p) => p.startsWith("v1="));
  if (!tPart || !v1Part) {
    return { valid: false, error: "Malformed signature header" };
  }
  const timestamp = Number(tPart.slice(2));
  const receivedSig = v1Part.slice(3);
  if (!timestamp || !receivedSig) {
    return { valid: false, error: "Invalid timestamp or signature" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > toleranceSeconds) {
    return { valid: false, error: "Webhook timestamp outside tolerance window" };
  }

  const expectedSig = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex");

  try {
    const a = Buffer.from(receivedSig, "hex");
    const b = Buffer.from(expectedSig, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { valid: false, error: "Signature mismatch" };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid signature encoding" };
  }
}

export function detectCardBrand(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, "");
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  return "Card";
}

export function validateCardLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function generatePaymentSessionId(): string {
  return `cs_mrtom_${randomBytes(16).toString("hex")}`;
}

export function generateTransactionId(prefix = "TXN"): string {
  return `${prefix}_${Date.now().toString(36).toUpperCase()}_${randomBytes(4).toString("hex").toUpperCase()}`;
}
