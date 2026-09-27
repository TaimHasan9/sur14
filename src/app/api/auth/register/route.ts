import { db } from "@/db";
import { users, analyticsEvents } from "@/db/schema";
import { hashPassword, createSession, validateStrongPassword, generateNumericOtp } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEmailVerificationEmail } from "@/lib/email";
import { mergeGuestCart } from "@/app/api/cart/route";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const rl = await checkRateLimit(req, {
      endpoint: "register",
      maxRequests: 5,
      windowSeconds: 600,
      blockDurationSeconds: 900,
    });
    if (!rl.allowed) {
      return Response.json({ error: rl.error || "Too many registration attempts. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const { name, email, phone, password } = body;

    if (!name || !password) {
      return Response.json({ error: "Name and password required" }, { status: 400 });
    }
    if (!email && !phone) {
      return Response.json({ error: "Mobile number or email required" }, { status: 400 });
    }

    const pwCheck = validateStrongPassword(String(password));
    if (!pwCheck.valid) {
      return Response.json({ error: pwCheck.error }, { status: 400 });
    }

    const emailNorm = email ? String(email).trim().toLowerCase() : `user${Date.now()}@phone.local`;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return Response.json({ error: "Enter a valid email address" }, { status: 400 });
    }

    const existing = await db.select().from(users).where(eq(users.email, emailNorm)).limit(1);
    if (existing.length > 0) {
      return Response.json({ error: "An account with this email already exists" }, { status: 400 });
    }

    const verifyCode = generateNumericOtp();
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const inserted = await db
      .insert(users)
      .values({
        name: String(name).trim(),
        email: emailNorm,
        phone: phone ? String(phone).trim() : null,
        passwordHash: hashPassword(String(password)),
        role: "customer",
        emailVerified: false,
        emailVerificationToken: verifyCode,
        emailVerificationExpires: verifyExpires,
      })
      .returning();

    await sendEmailVerificationEmail({
      toEmail: emailNorm,
      name: inserted[0].name,
      token: verifyCode,
    }).catch(() => {});

    await createSession(inserted[0].id);
    if (body.guestId) await mergeGuestCart(String(body.guestId), inserted[0].id);

    await db
      .insert(analyticsEvents)
      .values({
        sessionId: String(body.guestId || "server").slice(0, 60),
        userId: inserted[0].id,
        type: "register",
        label: inserted[0].email,
        path: "/account",
      })
      .catch(() => {});

    return Response.json({
      ok: true,
      verificationSent: true,
      // Returned in non-production or when RESEND_API_KEY is not configured so user can verify immediately in sandbox
      verificationHint: !process.env.RESEND_API_KEY ? verifyCode : undefined,
      user: {
        id: inserted[0].id,
        name: inserted[0].name,
        email: inserted[0].email,
        phone: inserted[0].phone,
        role: inserted[0].role,
        emailVerified: inserted[0].emailVerified,
      },
    });
  } catch (e) {
    console.error("register error", e);
    return Response.json({ error: "Registration failed" }, { status: 500 });
  }
}
