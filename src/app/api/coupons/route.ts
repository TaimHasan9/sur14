import { db } from "@/db";
import { coupons } from "@/db/schema";
import { requireAdmin, logAdminActivity } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin("coupons.view");
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  return Response.json({ coupons: rows });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Customer validate mode
    if (body.validate) {
      const code = String(body.code || "").trim().toUpperCase();
      const subtotal = Number(body.subtotal || 0);
      const rows = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1);
      if (rows.length === 0 || !rows[0].isActive) {
        return Response.json({ error: "Invalid or inactive coupon code" }, { status: 400 });
      }
      const c = rows[0];
      if (c.expiresAt && new Date(c.expiresAt) < new Date()) {
        return Response.json({ error: "Coupon has expired" }, { status: 400 });
      }
      if (c.usageLimit && c.usedCount >= c.usageLimit) {
        return Response.json({ error: "Coupon usage limit reached" }, { status: 400 });
      }
      if (subtotal < c.minOrder) {
        return Response.json({ error: `Minimum order of ৳${c.minOrder} required for this coupon` }, { status: 400 });
      }
      let discount = c.type === "percent" ? Math.round((subtotal * c.value) / 100) : c.value;
      if (c.maxDiscount) discount = Math.min(discount, c.maxDiscount);
      return Response.json({ ok: true, code: c.code, discount });
    }

    // Admin/Manager create coupon
    const admin = await requireAdmin("coupons.manage");
    if (!admin) return Response.json({ error: "Unauthorized: coupons.manage permission required" }, { status: 403 });

    const { code, type, value, minOrder, maxDiscount, usageLimit, expiresAt } = body;
    if (!code || value === undefined) {
      return Response.json({ error: "Coupon code and value are required" }, { status: 400 });
    }
    const inserted = await db
      .insert(coupons)
      .values({
        code: String(code).trim().toUpperCase(),
        type: type || "percent",
        value: Number(value),
        minOrder: Number(minOrder || 0),
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      })
      .returning();

    await logAdminActivity({
      actor: admin,
      action: "coupon.create",
      entityType: "coupon",
      entityId: inserted[0].id,
      summary: `Created coupon "${inserted[0].code}" (${inserted[0].value}${inserted[0].type === "percent" ? "%" : " BDT"})`,
      details: { code: inserted[0].code, type: inserted[0].type, value: inserted[0].value, usageLimit: inserted[0].usageLimit },
      req,
    });

    return Response.json({ ok: true, coupon: inserted[0] });
  } catch (e) {
    console.error("coupon error", e);
    return Response.json({ error: "Coupon operation failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin("coupons.manage");
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 403 });
  try {
    const body = await req.json();
    const { id, isActive, usageLimit, minOrder, maxDiscount, value } = body;
    if (!id) return Response.json({ error: "Coupon ID required" }, { status: 400 });

    const update: Record<string, unknown> = {};
    if (isActive !== undefined) update.isActive = !!isActive;
    if (usageLimit !== undefined) update.usageLimit = usageLimit ? Number(usageLimit) : null;
    if (minOrder !== undefined) update.minOrder = Number(minOrder);
    if (maxDiscount !== undefined) update.maxDiscount = maxDiscount ? Number(maxDiscount) : null;
    if (value !== undefined) update.value = Number(value);

    const updated = await db.update(coupons).set(update).where(eq(coupons.id, id)).returning();
    if (updated.length === 0) return Response.json({ error: "Coupon not found" }, { status: 404 });

    await logAdminActivity({
      actor: admin,
      action: "coupon.update",
      entityType: "coupon",
      entityId: updated[0].id,
      summary: `Updated coupon "${updated[0].code}"`,
      details: update,
      req,
    });

    return Response.json({ ok: true, coupon: updated[0] });
  } catch (e) {
    console.error("coupon PATCH error", e);
    return Response.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const admin = await requireAdmin("coupons.delete");
  if (!admin) return Response.json({ error: "Unauthorized: coupons.delete permission required" }, { status: 403 });
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return Response.json({ error: "Coupon ID required" }, { status: 400 });

    const deleted = await db.delete(coupons).where(eq(coupons.id, id)).returning();
    if (deleted.length > 0) {
      await logAdminActivity({
        actor: admin,
        action: "coupon.delete",
        entityType: "coupon",
        entityId: deleted[0].id,
        summary: `Deleted coupon "${deleted[0].code}"`,
        details: { code: deleted[0].code },
        req,
      });
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error("coupon DELETE error", e);
    return Response.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
