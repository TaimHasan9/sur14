import { db } from "@/db";
import { orders, products, users, categories, reviews, adminActivityLogs } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { ensureCatalogSeeded } from "@/lib/auto-seed";
import { sql, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin("dashboard.view");
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensureCatalogSeeded().catch(() => {});
    const [rev, ordCount, prodCount, userCount, catCount, revCount, lowStock, recentOrders, topProducts, statusGroups, recentLogs] =
      await Promise.all([
        db.select({ total: sql<number>`coalesce(sum(${orders.total}),0)` }).from(orders).where(sql`${orders.orderStatus} != 'cancelled'`),
        db.select({ c: sql<number>`count(*)` }).from(orders),
        db.select({ c: sql<number>`count(*)` }).from(products),
        db.select({ c: sql<number>`count(*)` }).from(users),
        db.select({ c: sql<number>`count(*)` }).from(categories),
        db.select({ c: sql<number>`count(*)` }).from(reviews),
        db.select().from(products).where(sql`${products.stock} < 20`).orderBy(products.stock).limit(8),
        db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6),
        db.select().from(products).orderBy(desc(products.totalSold)).limit(6),
        db.select({ status: orders.orderStatus, c: sql<number>`count(*)` }).from(orders).groupBy(orders.orderStatus),
        db.select().from(adminActivityLogs).orderBy(desc(adminActivityLogs.createdAt)).limit(10),
      ]);
    return Response.json({
      revenue: Number(rev[0]?.total ?? 0),
      orders: Number(ordCount[0]?.c ?? 0),
      products: Number(prodCount[0]?.c ?? 0),
      users: Number(userCount[0]?.c ?? 0),
      categories: Number(catCount[0]?.c ?? 0),
      reviews: Number(revCount[0]?.c ?? 0),
      lowStock,
      recentOrders,
      topProducts,
      statusGroups,
      recentLogs,
      currentAdmin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (e) {
    console.error("admin stats error", e);
    return Response.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
