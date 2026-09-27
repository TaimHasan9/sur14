import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { requireAdmin, logAdminActivity } from "@/lib/auth";
import { ensureCatalogSeeded } from "@/lib/auto-seed";
import { eq, sql, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await ensureCatalogSeeded().catch(() => {});
    const url = new URL(req.url);
    const includeAll = url.searchParams.get("all") === "1";

    const query = db
      .select({
        id: categories.id,
        name: categories.name,
        nameBn: categories.nameBn,
        slug: categories.slug,
        description: categories.description,
        icon: categories.icon,
        imageUrl: categories.imageUrl,
        gradient: categories.gradient,
        isActive: categories.isActive,
        sortOrder: categories.sortOrder,
        productCount: sql<number>`cast(count(${products.id}) as int)`,
      })
      .from(categories)
      .leftJoin(products, eq(products.categoryId, categories.id));

    const rows = includeAll
      ? await query.groupBy(categories.id).orderBy(asc(categories.sortOrder))
      : await query.where(eq(categories.isActive, true)).groupBy(categories.id).orderBy(asc(categories.sortOrder));

    return Response.json({ categories: rows });
  } catch (e) {
    console.error("categories GET error", e);
    return Response.json({ error: "Failed to load categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await requireAdmin("categories.create");
  if (!admin) {
    return Response.json({ error: "Unauthorized: categories.create permission required" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { name, nameBn, slug, description, icon, imageUrl, gradient, sortOrder, isActive } = body;
    if (!name || !slug) return Response.json({ error: "Category name and slug are required" }, { status: 400 });

    const inserted = await db
      .insert(categories)
      .values({
        name: String(name).trim(),
        nameBn: nameBn ? String(nameBn).trim() : null,
        slug: String(slug).trim().toLowerCase(),
        description: description || null,
        icon: icon || "📦",
        imageUrl: imageUrl || null,
        gradient: gradient || "from-emerald-500 to-teal-600",
        sortOrder: Number(sortOrder || 0),
        isActive: isActive !== undefined ? !!isActive : true,
      })
      .returning();

    await logAdminActivity({
      actor: admin,
      action: "category.create",
      entityType: "category",
      entityId: inserted[0].id,
      summary: `Created category "${inserted[0].name}" (/${inserted[0].slug})`,
      details: { slug: inserted[0].slug, name: inserted[0].name },
      req,
    });

    return Response.json({ ok: true, category: inserted[0] });
  } catch (e) {
    console.error("categories POST error", e);
    return Response.json({ error: "Failed to create category (slug must be unique)" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const admin = await requireAdmin("categories.edit");
  if (!admin) {
    return Response.json({ error: "Unauthorized: categories.edit permission required" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return Response.json({ error: "Category ID is required" }, { status: 400 });

    const update: Record<string, unknown> = {};
    for (const k of ["name", "nameBn", "slug", "description", "icon", "imageUrl", "gradient", "sortOrder", "isActive"]) {
      if (body[k] !== undefined) update[k] = body[k];
    }

    const updated = await db.update(categories).set(update).where(eq(categories.id, id)).returning();
    if (updated.length === 0) return Response.json({ error: "Category not found" }, { status: 404 });

    await logAdminActivity({
      actor: admin,
      action: "category.update",
      entityType: "category",
      entityId: updated[0].id,
      summary: `Updated category "${updated[0].name}"`,
      details: update,
      req,
    });

    return Response.json({ ok: true, category: updated[0] });
  } catch (e) {
    console.error("categories PUT error", e);
    return Response.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const admin = await requireAdmin("categories.delete");
  if (!admin) {
    return Response.json({ error: "Unauthorized: categories.delete permission required" }, { status: 403 });
  }
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return Response.json({ error: "Category ID is required" }, { status: 400 });

    const deleted = await db.delete(categories).where(eq(categories.id, id)).returning();
    if (deleted.length > 0) {
      await logAdminActivity({
        actor: admin,
        action: "category.delete",
        entityType: "category",
        entityId: deleted[0].id,
        summary: `Deleted category "${deleted[0].name}"`,
        details: { id, name: deleted[0].name },
        req,
      });
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error("categories DELETE error", e);
    return Response.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
