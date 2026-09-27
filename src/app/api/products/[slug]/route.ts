import { db } from "@/db";
import { products, categories, reviews } from "@/db/schema";
import { requireAdmin, logAdminActivity } from "@/lib/auth";
import { eq, and, ne, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const rows = await db
      .select({
        id: products.id,
        categoryId: products.categoryId,
        name: products.name,
        nameBn: products.nameBn,
        slug: products.slug,
        description: products.description,
        descriptionBn: products.descriptionBn,
        price: products.price,
        comparePrice: products.comparePrice,
        costPrice: products.costPrice,
        stock: products.stock,
        sku: products.sku,
        images: products.images,
        emoji: products.emoji,
        gradient: products.gradient,
        featured: products.featured,
        isActive: products.isActive,
        isNew: products.isNew,
        discountPercent: products.discountPercent,
        ratingAvg: products.ratingAvg,
        ratingCount: products.ratingCount,
        totalSold: products.totalSold,
        tags: products.tags,
        createdAt: products.createdAt,
        categoryName: categories.name,
        categoryBn: categories.nameBn,
        categorySlug: categories.slug,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.slug, slug))
      .limit(1);
    if (rows.length === 0) return Response.json({ error: "Product not found" }, { status: 404 });
    const product = rows[0];

    const reviewRows = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.productId, product.id), eq(reviews.isApproved, true)))
      .orderBy(desc(reviews.createdAt))
      .limit(20);

    let related: typeof rows = [];
    if (product.categoryId) {
      related = await db
        .select({
          id: products.id,
          categoryId: products.categoryId,
          name: products.name,
          nameBn: products.nameBn,
          slug: products.slug,
          description: products.description,
          descriptionBn: products.descriptionBn,
          price: products.price,
          comparePrice: products.comparePrice,
          costPrice: products.costPrice,
          stock: products.stock,
          sku: products.sku,
          images: products.images,
          emoji: products.emoji,
          gradient: products.gradient,
          featured: products.featured,
          isActive: products.isActive,
          isNew: products.isNew,
          discountPercent: products.discountPercent,
          ratingAvg: products.ratingAvg,
          ratingCount: products.ratingCount,
          totalSold: products.totalSold,
          tags: products.tags,
          createdAt: products.createdAt,
          categoryName: categories.name,
          categoryBn: categories.nameBn,
          categorySlug: categories.slug,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(and(eq(products.categoryId, product.categoryId), ne(products.id, product.id), eq(products.isActive, true)))
        .limit(4);
    }

    return Response.json({ product, reviews: reviewRows, related });
  } catch (e) {
    console.error("product detail error", e);
    return Response.json({ error: "Failed to load product" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await requireAdmin("products.edit");
  if (!admin) return Response.json({ error: "Unauthorized: products.edit permission required" }, { status: 403 });
  try {
    const { slug } = await params;
    const body = await req.json();
    const update: Record<string, unknown> = {};
    for (const k of [
      "name",
      "nameBn",
      "categoryId",
      "description",
      "descriptionBn",
      "price",
      "comparePrice",
      "costPrice",
      "stock",
      "sku",
      "images",
      "emoji",
      "gradient",
      "featured",
      "isActive",
      "isNew",
      "tags",
    ]) {
      if (body[k] !== undefined) update[k] = body[k];
    }
    if (body.price !== undefined || body.comparePrice !== undefined) {
      const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
      if (rows.length > 0) {
        const price = body.price !== undefined ? Number(body.price) : rows[0].price;
        const comp = body.comparePrice !== undefined ? Number(body.comparePrice) : rows[0].comparePrice;
        update.discountPercent = comp && comp > price ? Math.round(((comp - price) / comp) * 100) : 0;
      }
    }
    update.updatedAt = new Date();
    const updated = await db.update(products).set(update).where(eq(products.slug, slug)).returning();
    if (updated.length === 0) return Response.json({ error: "Product not found" }, { status: 404 });

    await logAdminActivity({
      actor: admin,
      action: "product.update",
      entityType: "product",
      entityId: updated[0].id,
      summary: `Updated product "${updated[0].name}" (/${slug})`,
      details: update,
      req,
    });

    return Response.json({ ok: true, product: updated[0] });
  } catch (e) {
    console.error("product PUT error", e);
    return Response.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await requireAdmin("products.delete");
  if (!admin) return Response.json({ error: "Unauthorized: products.delete permission required" }, { status: 403 });
  try {
    const { slug } = await params;
    const deleted = await db.delete(products).where(eq(products.slug, slug)).returning();
    if (deleted.length > 0) {
      await logAdminActivity({
        actor: admin,
        action: "product.delete",
        entityType: "product",
        entityId: deleted[0].id,
        summary: `Deleted product "${deleted[0].name}" (/${slug})`,
        details: { slug, name: deleted[0].name },
        req,
      });
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error("product DELETE error", e);
    return Response.json({ error: "Delete failed" }, { status: 500 });
  }
}
