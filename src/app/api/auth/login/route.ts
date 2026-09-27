import { db } from "@/db";
import { users, analyticsEvents } from "@/db/schema";
import { verifyPassword, createSession } from "@/lib/auth";
import { checkRateLimit, clearRateLimit } from "@/lib/rate-limit";
import { ensureCatalogSeeded } from "@/lib/auto-seed";
import { mergeGuestCart } from "@/app/api/cart/route";
import { eq, or, sql } from "drizzle-orm";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function POST(req: Request) {
  try {
    await ensureCatalogSeeded().catch(() => {});
    const body = await req.json();
    const identifier = String(body.identifier || body.email || "").trim();
    const password = String(body.password || "");

    if (!identifier || !password) {
      return Response.json({ error: "Mobile/Email and password required" }, { status: 400 });
    }

    const norm = identifier.toLowerCase();

    // 1. Rate limit check per IP + identifier
    const rl = await checkRateLimit(req, {
      endpoint: "login",
      maxRequests: 7,
      windowSeconds: 300,
      blockDurationSeconds: 900,
      identifier: norm,
    });
    if (!rl.allowed) {
      return Response.json(
        { error: rl.error || "Too many login attempts. Please wait 15 minutes before trying again." },
        { status: 429 }
      );
    }

    const rows = await db
      .select()
      .from(users)
      .where(or(eq(users.email, norm), eq(users.phone, identifier)))
      .limit(1);

    if (rows.length === 0) {
      return Response.json({ error: "Invalid mobile/email or password" }, { status: 401 });
    }

    const user = rows[0];

    if (user.isBlocked) {
      return Response.json({ error: "Your account has been suspended. Please contact support." }, { status: 403 });
    }

    // 2. Check account-level brute-force lockout
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const waitMin = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 60000);
      return Response.json(
        { error: `Account temporarily locked due to multiple failed password attempts. Try again in ${waitMin} minute(s) or reset your password.` },
        { status: 429 }
      );
    }

    if (!verifyPassword(password, user.passwordHash)) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      const lockedUntil =
        attempts >= MAX_FAILED_ATTEMPTS
          ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
          : null;

      await db
        .update(users)
        .set({
          failedLoginAttempts: attempts,
          lockedUntil,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      const left = Math.max(0, MAX_FAILED_ATTEMPTS - attempts);
      return Response.json(
        {
          error:
            left > 0
              ? `Invalid mobile/email or password (${left} attempt${left === 1 ? "" : "s"} remaining before temporary lockout)`
              : `Account locked for ${LOCKOUT_MINUTES} minutes due to ${MAX_FAILED_ATTEMPTS} failed login attempts.`,
        },
        { status: 401 }
      );
    }

    // Successful login: reset failed attempts & rate limit
    await db
      .update(users)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await clearRateLimit(req, "login", norm);
    await createSession(user.id);
    if (body.guestId) await mergeGuestCart(String(body.guestId), user.id);

    await db
      .insert(analyticsEvents)
      .values({
        sessionId: String(body.guestId || "server").slice(0, 60),
        userId: user.id,
        type: "login",
        label: user.email,
        path: "/account",
      })
      .catch(() => {});

    return Response.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
        address: user.address,
        district: user.district,
      },
    });
  } catch (e) {
    console.error("login error", e);
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}

void sql;
