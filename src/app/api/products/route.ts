import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { requireAdmin, logAdminActivity } from "@/lib/auth";
import { ensureCatalogSeeded } from "@/lib/auto-seed";
import { eq, and, or, ilike, gte, lte, desc, asc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await ensureCatalogSeeded().catch(() => {});
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "";
    const category = url.searchParams.get("category") || "";
    const sort = url.searchParams.get("sort") || "newest";
    const featured = url.searchParams.get("featured") || "";
    const isNew = url.searchParams.get("isNew") || "";
    const includeInactive = url.searchParams.get("all") === "1";
    const minPrice = Number(url.searchParams.get("minPrice") || 0);
    const maxPrice = Number(url.searchParams.get("maxPrice") || 0);
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 12)));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (!includeInactive) {
      conditions.push(eq(products.isActive, true));
    }
    if (q) {
      conditions.push(
        or(
          ilike(products.name, `%${q}%`),
          ilike(products.nameBn, `%${q}%`),
          ilike(products.description, `%${q}%`),
          ilike(products.sku, `%${q}%`)
        ) as never
      );
    }
    if (category) {
      const cat = await db.select().from(categories).where(eq(categories.slug, category)).limit(1);
      if (cat.length > 0) conditions.push(eq(products.categoryId, cat[0].id));
      else conditions.push(sql`false`);
    }
    if (featured === "1") conditions.push(eq(products.featured, true));
    if (isNew === "1") conditions.push(eq(products.isNew, true));
    if (minPrice > 0) conditions.push(gte(products.price, minPrice));
    if (maxPrice > 0) conditions.push(lte(products.price, maxPrice));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    let orderBy: ReturnType<typeof desc> | ReturnType<typeof asc> = desc(products.createdAt);
    if (sort === "price-low") orderBy = asc(products.price);
    else if (sort === "price-high") orderBy = desc(products.price);
    else if (sort === "popular") orderBy = desc(products.totalSold);
    else if (sort === "rating") orderBy = desc(products.ratingAvg);
    else if (sort === "discount") orderBy = desc(products.discountPercent);

    const [rows, countRows] = await Promise.all([
      db
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
        .where(where)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      db.select({ c: sql<number>`count(*)` }).from(products).where(where),
    ]);

    const total = Number(countRows[0]?.c ?? 0);
    return Response.json({ products: rows, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (e) {
    console.error("products GET error", e);
    return Response.json({ error: "Failed to load products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await requireAdmin("products.create");
  if (!admin) return Response.json({ error: "Unauthorized: products.create permission required" }, { status: 403 });
  try {
    const body = await req.json();
    const {
      name,
      nameBn,
      slug,
      categoryId,
      description,
      descriptionBn,
      price,
      comparePrice,
      costPrice,
      stock,
      sku,
      images,
      emoji,
      featured,
      isNew,
      isActive,
      tags,
    } = body;
    if (!name || !slug || price === undefined) {
      return Response.json({ error: "Name, slug, and price are required" }, { status: 400 });
    }
    const numPrice = Number(price);
    const numComp = comparePrice ? Number(comparePrice) : null;
    const discount = numComp && numComp > numPrice ? Math.round(((numComp - numPrice) / numComp) * 100) : 0;

    const inserted = await db
      .insert(products)
      .values({
        name: String(name).trim(),
        nameBn: nameBn ? String(nameBn).trim() : null,
        slug: String(slug).trim().toLowerCase(),
        categoryId: categoryId || null,
        description: description || null,
        descriptionBn: descriptionBn || null,
        price: numPrice,
        comparePrice: numComp,
        costPrice: costPrice ? Number(costPrice) : null,
        stock: Math.max(0, Number(stock ?? 0)),
        sku: sku ? String(sku).trim() : `MTG-${Date.now().toString(36).toUpperCase()}`,
        images: Array.isArray(images) ? images : images ? [String(images)] : [],
        emoji: emoji || "📦",
        featured: !!featured,
        isNew: !!isNew,
        isActive: isActive !== undefined ? !!isActive : true,
        discountPercent: discount,
        tags: Array.isArray(tags) ? tags : [],
      })
      .returning();

    await logAdminActivity({
      actor: admin,
      action: "product.create",
      entityType: "product",
      entityId: inserted[0].id,
      summary: `Created product "${inserted[0].name}" (৳${inserted[0].price}, stock: ${inserted[0].stock})`,
      details: { slug: inserted[0].slug, price: inserted[0].price, stock: inserted[0].stock },
      req,
    });

    return Response.json({ ok: true, product: inserted[0] });
  } catch (e) {
    console.error("products POST error", e);
    return Response.json({ error: "Failed to create product (slug must be unique)" }, { status: 500 });
  }
}
