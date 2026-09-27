import { db } from "@/db";
import { reviews, products } from "@/db/schema";
import { getSessionUser, requireAdmin, logAdminActivity } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const all = url.searchParams.get("all");

  if (all === "1") {
    const admin = await requireAdmin("reviews.moderate");
    if (!admin) return Response.json({ error: "Unauthorized" }, { status: 403 });
    const rows = await db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        productName: products.name,
        productSlug: products.slug,
        userId: reviews.userId,
        userName: reviews.userName,
        rating: reviews.rating,
        comment: reviews.comment,
        isApproved: reviews.isApproved,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .leftJoin(products, eq(reviews.productId, products.id))
      .orderBy(desc(reviews.createdAt))
      .limit(100);
    return Response.json({ reviews: rows });
  }

  const productId = url.searchParams.get("productId");
  if (!productId) return Response.json({ reviews: [] });
  const rows = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.isApproved, true)))
    .orderBy(desc(reviews.createdAt))
    .limit(30);
  return Response.json({ reviews: rows });
}

export async function POST(req: Request) {
  try {
    const rl = await checkRateLimit(req, {
      endpoint: "review",
      maxRequests: 5,
      windowSeconds: 300,
    });
    if (!rl.allowed) {
      return Response.json({ error: rl.error || "Too many reviews submitted. Please wait." }, { status: 429 });
    }

    const user = await getSessionUser();
    const body = await req.json();
    const { productId, rating, comment, userName } = body;
    if (!productId || !rating) return Response.json({ error: "Rating is required" }, { status: 400 });
    const r = Number(rating);
    if (r < 1 || r > 5) return Response.json({ error: "Rating must be between 1 and 5" }, { status: 400 });

    const inserted = await db
      .insert(reviews)
      .values({
        productId,
        userId: user?.id ?? null,
        userName: user?.name || (userName ? String(userName).trim() : "Customer"),
        rating: r,
        comment: comment ? String(comment).trim().slice(0, 1000) : null,
        isApproved: true,
      })
      .returning();

    const prod = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (prod.length > 0) {
      const oldCount = prod[0].ratingCount || 0;
      const oldAvg = prod[0].ratingAvg || 0;
      const newCount = oldCount + 1;
      const newAvg = Math.round(((oldAvg * oldCount + r) / newCount) * 10) / 10;
      await db.update(products).set({ ratingCount: newCount, ratingAvg: newAvg }).where(eq(products.id, productId));
    }

    return Response.json({ ok: true, review: inserted[0] });
  } catch (e) {
    console.error("review POST error", e);
    return Response.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin("reviews.moderate");
  if (!admin) return Response.json({ error: "Unauthorized: reviews.moderate permission required" }, { status: 403 });
  try {
    const body = await req.json();
    const { id, isApproved } = body;
    if (!id || isApproved === undefined) return Response.json({ error: "Review ID and status required" }, { status: 400 });

    const updated = await db
      .update(reviews)
      .set({ isApproved: !!isApproved })
      .where(eq(reviews.id, id))
      .returning();

    if (updated.length === 0) return Response.json({ error: "Review not found" }, { status: 404 });

    await logAdminActivity({
      actor: admin,
      action: "review.moderate",
      entityType: "review",
      entityId: updated[0].id,
      summary: `${updated[0].isApproved ? "Approved" : "Hidden"} review by ${updated[0].userName}`,
      details: { id, isApproved: updated[0].isApproved },
      req,
    });

    return Response.json({ ok: true, review: updated[0] });
  } catch (e) {
    console.error("review PATCH error", e);
    return Response.json({ error: "Failed to moderate review" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const admin = await requireAdmin("reviews.delete");
  if (!admin) return Response.json({ error: "Unauthorized: reviews.delete permission required" }, { status: 403 });
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return Response.json({ error: "Review ID required" }, { status: 400 });

    const deleted = await db.delete(reviews).where(eq(reviews.id, id)).returning();
    if (deleted.length > 0) {
      await logAdminActivity({
        actor: admin,
        action: "review.delete",
        entityType: "review",
        entityId: deleted[0].id,
        summary: `Deleted review by ${deleted[0].userName}`,
        details: { id, userName: deleted[0].userName },
        req,
      });
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error("review DELETE error", e);
    return Response.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
