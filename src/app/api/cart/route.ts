import { db } from "@/db";
import { cartItems, products } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

/** Slug-based cart API (matches the Mr Tom Gadgets frontend).
 *  GET  ?guestId=…            → { lines: [{slug, qty}] }
 *  POST {sync, lines, guestId} → replace whole cart (from frontend state)
 *  POST {slug, qty, guestId}   → add/increment one line
 *  PUT  {slug, qty, guestId}   → set qty (0 = remove)
 *  DELETE ?slug=&guestId=      → remove line (or whole cart if no slug)
 */

async function resolveId(slug: string): Promise<string | null> {
  const rows = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
  return rows[0]?.id ?? null;
}

async function ownerKey(guestId: string) {
  const user = await getSessionUser();
  return { user, guestId };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const { user, guestId } = await ownerKey(url.searchParams.get("guestId") || "");
    let rows: Array<{ slug: string; qty: number }> = [];
    if (user) {
      const r = await db
        .select({ slug: products.slug, qty: cartItems.quantity })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.userId, user.id));
      rows = r.map((x) => ({ slug: x.slug, qty: x.qty }));
    } else if (guestId) {
      const r = await db
        .select({ slug: products.slug, qty: cartItems.quantity })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.guestId, guestId));
      rows = r.map((x) => ({ slug: x.slug, qty: x.qty }));
    }
    return Response.json({ lines: rows });
  } catch (e) {
    console.error("cart GET error", e);
    return Response.json({ lines: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const guestId = String(body.guestId || "");
    const { user } = await ownerKey(guestId);

    // full sync from frontend state
    if (body.sync && Array.isArray(body.lines)) {
      const lines = (body.lines as Array<{ slug: string; qty: number }>).slice(0, 60);
      if (user) {
        await db.delete(cartItems).where(eq(cartItems.userId, user.id));
        for (const l of lines) {
          const pid = await resolveId(String(l.slug));
          if (!pid) continue;
          await db.insert(cartItems).values({ userId: user.id, productId: pid, quantity: Math.max(1, Math.min(10, Number(l.qty) || 1)) });
        }
      } else if (guestId) {
        await db.delete(cartItems).where(eq(cartItems.guestId, guestId));
        for (const l of lines) {
          const pid = await resolveId(String(l.slug));
          if (!pid) continue;
          await db.insert(cartItems).values({ guestId, productId: pid, quantity: Math.max(1, Math.min(10, Number(l.qty) || 1)) });
        }
      }
      return Response.json({ ok: true });
    }

    // single add
    const slug = String(body.slug || "");
    const qty = Math.max(1, Math.min(10, Number(body.quantity || body.qty || 1)));
    if (!slug) return Response.json({ error: "Product আবশ্যক" }, { status: 400 });
    const pid = await resolveId(slug);
    if (!pid) return Response.json({ ok: true }); // product not in DB yet (static catalog) — frontend keeps it locally

    const prod = await db.select().from(products).where(eq(products.id, pid)).limit(1);
    if (prod.length > 0 && prod[0].stock < qty) {
      return Response.json({ error: `দুঃখিত! স্টকে মাত্র ${prod[0].stock}টি আছে` }, { status: 400 });
    }

    if (user) {
      const ex = await db.select().from(cartItems).where(and(eq(cartItems.userId, user.id), eq(cartItems.productId, pid))).limit(1);
      if (ex.length > 0) {
        await db.update(cartItems).set({ quantity: Math.min(10, ex[0].quantity + qty) }).where(eq(cartItems.id, ex[0].id));
      } else {
        await db.insert(cartItems).values({ userId: user.id, productId: pid, quantity: qty });
      }
    } else {
      if (!guestId) return Response.json({ error: "Guest session missing" }, { status: 400 });
      const ex = await db.select().from(cartItems).where(and(eq(cartItems.guestId, guestId), eq(cartItems.productId, pid))).limit(1);
      if (ex.length > 0) {
        await db.update(cartItems).set({ quantity: Math.min(10, ex[0].quantity + qty) }).where(eq(cartItems.id, ex[0].id));
      } else {
        await db.insert(cartItems).values({ guestId, productId: pid, quantity: qty });
      }
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error("cart POST error", e);
    return Response.json({ error: "কার্টে যোগ ব্যর্থ" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const slug = String(body.slug || "");
    const qty = Number(body.qty ?? body.quantity ?? 1);
    const guestId = String(body.guestId || "");
    const { user } = await ownerKey(guestId);
    const pid = await resolveId(slug);
    if (!pid) return Response.json({ ok: true });

    const cond = user
      ? and(eq(cartItems.userId, user.id), eq(cartItems.productId, pid))
      : guestId
        ? and(eq(cartItems.guestId, guestId), eq(cartItems.productId, pid))
        : null;
    if (!cond) return Response.json({ ok: true });
    if (qty <= 0) {
      await db.delete(cartItems).where(cond);
    } else {
      await db.update(cartItems).set({ quantity: Math.min(10, qty) }).where(cond);
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error("cart PUT error", e);
    return Response.json({ error: "Update ব্যর্থ" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug") || "";
    const guestId = url.searchParams.get("guestId") || "";
    const { user } = await ownerKey(guestId);
    if (slug) {
      const pid = await resolveId(slug);
      if (!pid) return Response.json({ ok: true });
      if (user) await db.delete(cartItems).where(and(eq(cartItems.userId, user.id), eq(cartItems.productId, pid)));
      else if (guestId) await db.delete(cartItems).where(and(eq(cartItems.guestId, guestId), eq(cartItems.productId, pid)));
    } else if (user) {
      await db.delete(cartItems).where(eq(cartItems.userId, user.id));
    } else if (guestId) {
      await db.delete(cartItems).where(eq(cartItems.guestId, guestId));
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error("cart DELETE error", e);
    return Response.json({ error: "Delete ব্যর্থ" }, { status: 500 });
  }
}

/** Move all guest cart lines to a user (called on login/register). */
export async function mergeGuestCart(guestId: string, userId: string) {
  if (!guestId) return;
  try {
    const guestLines = await db.select().from(cartItems).where(eq(cartItems.guestId, guestId));
    for (const g of guestLines) {
      const ex = await db
        .select()
        .from(cartItems)
        .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, g.productId)))
        .limit(1);
      if (ex.length > 0) {
        await db
          .update(cartItems)
          .set({ quantity: Math.min(10, ex[0].quantity + g.quantity) })
          .where(eq(cartItems.id, ex[0].id));
        await db.delete(cartItems).where(eq(cartItems.id, g.id));
      } else {
        await db.update(cartItems).set({ userId, guestId: null }).where(eq(cartItems.id, g.id));
      }
    }
  } catch (e) {
    console.error("merge cart error", e);
  }
}
