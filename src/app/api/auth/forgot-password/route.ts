import { db } from "@/db";
import { users } from "@/db/schema";
import { generateNumericOtp } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";
import { eq, or } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const identifier = String(body.identifier || body.email || "").trim();
    if (!identifier) {
      return Response.json({ error: "Please enter your registered email or mobile number" }, { status: 400 });
    }

    const rl = await checkRateLimit(req, {
      endpoint: "forgot_password",
      maxRequests: 5,
      windowSeconds: 600,
      blockDurationSeconds: 900,
      identifier: identifier.toLowerCase(),
    });
    if (!rl.allowed) {
      return Response.json({ error: rl.error }, { status: 429 });
    }

    const norm = identifier.toLowerCase();
    const rows = await db
      .select()
      .from(users)
      .where(or(eq(users.email, norm), eq(users.phone, identifier)))
      .limit(1);

    if (rows.length === 0) {
      return Response.json({ error: "No account found with that email or mobile number" }, { status: 404 });
    }

    const user = rows[0];
    const resetCode = generateNumericOtp();
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await db
      .update(users)
      .set({
        passwordResetToken: resetCode,
        passwordResetExpires: expires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await sendPasswordResetEmail({
      toEmail: user.email,
      name: user.name,
      token: resetCode,
    });

    return Response.json({
      ok: true,
      message: "Password reset code has been sent to your email.",
      // Provided in sandbox when external SMTP/Resend key is not set so testing works seamlessly
      resetCodePreview: !process.env.RESEND_API_KEY ? resetCode : undefined,
    });
  } catch (e) {
    console.error("forgot password error", e);
    return Response.json({ error: "Failed to process password reset request" }, { status: 500 });
  }
}
