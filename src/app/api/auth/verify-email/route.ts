import { db } from "@/db";
import { users } from "@/db/schema";
import { getSessionUser, generateNumericOtp } from "@/lib/auth";
import { sendEmailVerificationEmail } from "@/lib/email";
import { eq } from "drizzle-orm";

// POST: verify code OR resend code (if body.resend === true)
export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return Response.json({ error: "Please log in first" }, { status: 401 });
    }

    const body = await req.json();
    const rows = await db.select().from(users).where(eq(users.id, sessionUser.id)).limit(1);
    if (rows.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    const user = rows[0];

    if (user.emailVerified) {
      return Response.json({ ok: true, alreadyVerified: true, message: "Email is already verified." });
    }

    if (body.resend) {
      const code = generateNumericOtp();
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await db
        .update(users)
        .set({
          emailVerificationToken: code,
          emailVerificationExpires: expires,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      await sendEmailVerificationEmail({
        toEmail: user.email,
        name: user.name,
        token: code,
      });

      return Response.json({
        ok: true,
        resent: true,
        message: "Verification code sent to your email.",
        verificationCodePreview: !process.env.RESEND_API_KEY ? code : undefined,
      });
    }

    const code = String(body.code || body.token || "").trim();
    if (!code) {
      return Response.json({ error: "Verification code is required" }, { status: 400 });
    }

    if (
      !user.emailVerificationToken ||
      user.emailVerificationToken !== code ||
      (user.emailVerificationExpires && new Date(user.emailVerificationExpires) < new Date())
    ) {
      return Response.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    await db
      .update(users)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return Response.json({ ok: true, verified: true, message: "Email verified successfully!" });
  } catch (e) {
    console.error("verify email error", e);
    return Response.json({ error: "Email verification failed" }, { status: 500 });
  }
}
