import { db } from "@/db";
import { rateLimits } from "@/db/schema";
import { eq } from "drizzle-orm";

export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export async function checkRateLimit(
  req: Request,
  options: {
    endpoint: "login" | "register" | "checkout" | "review" | "contact" | "chat" | "forgot_password";
    maxRequests: number;
    windowSeconds: number;
    blockDurationSeconds?: number;
    identifier?: string;
  }
): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number; error?: string }> {
  const ip = getClientIp(req);
  const key = `${options.endpoint}:${ip}${options.identifier ? `:${options.identifier.toLowerCase()}` : ""}`.slice(0, 195);
  const now = new Date();

  try {
    const existing = await db.select().from(rateLimits).where(eq(rateLimits.key, key)).limit(1);

    if (existing.length > 0) {
      const row = existing[0];

      // Check if currently blocked
      if (row.blockedUntil && new Date(row.blockedUntil) > now) {
        const retryAfter = Math.ceil((new Date(row.blockedUntil).getTime() - now.getTime()) / 1000);
        return {
          allowed: false,
          remaining: 0,
          retryAfterSeconds: retryAfter,
          error: `Too many requests (${options.endpoint}). Please try again in ${retryAfter}s.`,
        };
      }

      // Check if window has expired
      if (new Date(row.resetAt) <= now) {
        const nextReset = new Date(now.getTime() + options.windowSeconds * 1000);
        await db
          .update(rateLimits)
          .set({ count: 1, resetAt: nextReset, blockedUntil: null, updatedAt: now })
          .where(eq(rateLimits.key, key));
        return { allowed: true, remaining: options.maxRequests - 1, retryAfterSeconds: 0 };
      }

      // Increment within active window
      const newCount = row.count + 1;
      if (newCount > options.maxRequests) {
        const blockSec = options.blockDurationSeconds ?? options.windowSeconds;
        const blockedUntil = new Date(now.getTime() + blockSec * 1000);
        await db
          .update(rateLimits)
          .set({ count: newCount, blockedUntil, updatedAt: now })
          .where(eq(rateLimits.key, key));
        return {
          allowed: false,
          remaining: 0,
          retryAfterSeconds: blockSec,
          error: `Too many attempts on ${options.endpoint}. Locked for ${blockSec} seconds.`,
        };
      }

      await db
        .update(rateLimits)
        .set({ count: newCount, updatedAt: now })
        .where(eq(rateLimits.key, key));

      return {
        allowed: true,
        remaining: Math.max(0, options.maxRequests - newCount),
        retryAfterSeconds: 0,
      };
    }

    // First request in window
    const resetAt = new Date(now.getTime() + options.windowSeconds * 1000);
    await db
      .insert(rateLimits)
      .values({
        key,
        endpoint: options.endpoint,
        count: 1,
        resetAt,
        blockedUntil: null,
        updatedAt: now,
      })
      .onConflictDoNothing();

    return { allowed: true, remaining: options.maxRequests - 1, retryAfterSeconds: 0 };
  } catch (e) {
    console.error("Rate limit check error", e);
    return { allowed: true, remaining: 1, retryAfterSeconds: 0 };
  }
}

export async function clearRateLimit(req: Request, endpoint: string, identifier?: string) {
  const ip = getClientIp(req);
  const key = `${endpoint}:${ip}${identifier ? `:${identifier.toLowerCase()}` : ""}`.slice(0, 195);
  await db.delete(rateLimits).where(eq(rateLimits.key, key)).catch(() => {});
}
