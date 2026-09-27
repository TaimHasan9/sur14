import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, validateStrongPassword } from "@/lib/auth";
import { checkRateLimit, clearRateLimit } from "@/lib/rate-limit";
import { eq, or } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const identifier = String(body.identifier || body.email || "").trim();
    const token = String(body.token || body.code || "").trim();
    const newPassword = String(body.newPassword || body.password || "");

    if (!identifier || !token || !newPassword) {
      return Response.json({ error: "Email/mobile, reset code, and new password are required" }, { status: 400 });
    }

    const rl = await checkRateLimit(req, {
      endpoint: "forgot_password",
      maxRequests: 6,
      windowSeconds: 600,
      identifier: identifier.toLowerCase(),
    });
    if (!rl.allowed) {
      return Response.json({ error: rl.error }, { status: 429 });
    }

    const pwCheck = validateStrongPassword(newPassword);
    if (!pwCheck.valid) {
      return Response.json({ error: pwCheck.error }, { status: 400 });
    }

    const norm = identifier.toLowerCase();
    const rows = await db
      .select()
      .from(users)
      .where(or(eq(users.email, norm), eq(users.phone, identifier)))
      .limit(1);

    if (rows.length === 0) {
      return Response.json({ error: "Invalid account or reset code" }, { status: 400 });
    }

    const user = rows[0];
    if (
      !user.passwordResetToken ||
      user.passwordResetToken !== token ||
      !user.passwordResetExpires ||
      new Date(user.passwordResetExpires) < new Date()
    ) {
      return Response.json({ error: "Invalid or expired password reset code" }, { status: 400 });
    }

    await db
      .update(users)
      .set({
        passwordHash: hashPassword(newPassword),
        passwordResetToken: null,
        passwordResetExpires: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await clearRateLimit(req, "login", norm);

    return Response.json({
      ok: true,
      message: "Password has been reset successfully. You can now log in with your new password.",
    });
  } catch (e) {
    console.error("reset password error", e);
    return Response.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
