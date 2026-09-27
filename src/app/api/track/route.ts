import { db } from "@/db";
import { analyticsEvents, visitorSessions } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const ALLOWED = new Set([
  "page_view", "product_view", "click", "search",
  "add_to_cart", "remove_from_cart", "checkout_start", "purchase",
  "login", "register", "logout", "wishlist", "compare",
  "img_impression", "img_load", "img_error",
]);

type Incoming = {
  type: string;
  label?: string;
  path?: string;
  productSlug?: string;
  meta?: Record<string, unknown>;
};

/** Beacon endpoint — receives batched analytics events from the frontend. */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionId = String(body.sessionId || "").slice(0, 60);
    const events = Array.isArray(body.events) ? (body.events as Incoming[]).slice(0, 60) : [];
    if (!sessionId || events.length === 0) return Response.json({ ok: true });

    const user = await getSessionUser().catch(() => null);
    const ua = (req.headers.get("user-agent") || "").slice(0, 100);
    const device = /mobile|android|iphone/i.test(ua) ? "mobile" : /tablet|ipad/i.test(ua) ? "tablet" : "desktop";
    const referrer = (req.headers.get("referer") || "").slice(0, 500);

    // upsert session
    const pageViews = events.filter((e) => e.type === "page_view").length;
    await db
      .insert(visitorSessions)
      .values({
        id: sessionId,
        userId: user?.id ?? null,
        userEmail: user?.email ?? null,
        lastSeen: new Date(),
        pageCount: pageViews,
        device,
        referrer: referrer || null,
      })
      .onConflictDoUpdate({
        target: visitorSessions.id,
        set: {
          lastSeen: new Date(),
          pageCount: sql`${visitorSessions.pageCount} + ${pageViews}`,
          ...(user ? { userId: user.id, userEmail: user.email } : {}),
        },
      });

    const rows = events
      .filter((e) => e && ALLOWED.has(e.type))
      .map((e) => ({
        sessionId,
        userId: user?.id ?? null,
        type: e.type.slice(0, 30),
        label: e.label ? String(e.label).slice(0, 500) : null,
        path: e.path ? String(e.path).slice(0, 500) : null,
        productSlug: e.productSlug ? String(e.productSlug).slice(0, 300) : null,
        meta: (e.meta as Record<string, unknown>) ?? {},
      }));

    if (rows.length > 0) {
      await db.insert(analyticsEvents).values(rows);
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error("track error", e);
    return Response.json({ ok: true }); // never break the frontend
  }
}
