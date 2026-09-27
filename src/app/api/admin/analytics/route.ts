import { db } from "@/db";
import { analyticsEvents, visitorSessions, orders, orderItems } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { sql, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await requireAdmin("dashboard.view");
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const url = new URL(req.url);
    const days = Math.min(90, Math.max(1, Number(url.searchParams.get("days") || 30)));
    const since = sql`now() - (${days} || ' days')::interval`;

    const [
      overviewRows, funnelRows, topViewed, topClicks, topSearches,
      recentLogins, topBuyers, recentEvents, imgHealth, imgErrors,
      daily, topPages, deviceRows,
    ] = await Promise.all([
      // overview counts by type
      db.select({ type: analyticsEvents.type, c: sql<number>`count(*)::int` })
        .from(analyticsEvents).where(sql`${analyticsEvents.createdAt} >= ${since}`).groupBy(analyticsEvents.type),
      // sessions count
      db.select({ c: sql<number>`count(*)::int` }).from(visitorSessions).where(sql`${visitorSessions.lastSeen} >= ${since}`),
      // top viewed products
      db.select({ slug: analyticsEvents.productSlug, views: sql<number>`count(*)::int`, visitors: sql<number>`count(distinct ${analyticsEvents.sessionId})::int` })
        .from(analyticsEvents)
        .where(sql`${analyticsEvents.createdAt} >= ${since} and ${analyticsEvents.type} = 'product_view' and ${analyticsEvents.productSlug} is not null`)
        .groupBy(analyticsEvents.productSlug).orderBy(desc(sql`count(*)`)).limit(12),
      // top clicked buttons
      db.select({ label: analyticsEvents.label, c: sql<number>`count(*)::int` })
        .from(analyticsEvents)
        .where(sql`${analyticsEvents.createdAt} >= ${since} and ${analyticsEvents.type} = 'click'`)
        .groupBy(analyticsEvents.label).orderBy(desc(sql`count(*)`)).limit(15),
      // top searches
      db.select({ label: analyticsEvents.label, c: sql<number>`count(*)::int` })
        .from(analyticsEvents)
        .where(sql`${analyticsEvents.createdAt} >= ${since} and ${analyticsEvents.type} = 'search'`)
        .groupBy(analyticsEvents.label).orderBy(desc(sql`count(*)`)).limit(10),
      // recent logins
      db.select({ label: analyticsEvents.label, createdAt: analyticsEvents.createdAt, sessionId: analyticsEvents.sessionId })
        .from(analyticsEvents)
        .where(sql`${analyticsEvents.createdAt} >= ${since} and ${analyticsEvents.type} in ('login','register')`)
        .orderBy(desc(analyticsEvents.createdAt)).limit(15),
      // per-customer purchases (ke koita product kinlo)
      db.select({
        phone: orders.customerPhone,
        name: sql<string>`max(${orders.customerName})`,
        ordersCount: sql<number>`count(distinct ${orders.id})::int`,
        items: sql<number>`coalesce(sum(${orderItems.quantity}),0)::int`,
        spent: sql<number>`coalesce(sum(distinct ${orders.total}),0)::int`,
      })
        .from(orders)
        .leftJoin(orderItems, sql`${orderItems.orderId} = ${orders.id}`)
        .where(sql`${orders.createdAt} >= ${since} and ${orders.orderStatus} != 'cancelled'`)
        .groupBy(orders.customerPhone)
        .orderBy(desc(sql`sum(distinct ${orders.total})`))
        .limit(15),
      // recent events feed
      db.select({
        type: analyticsEvents.type, label: analyticsEvents.label, path: analyticsEvents.path,
        productSlug: analyticsEvents.productSlug, createdAt: analyticsEvents.createdAt,
      })
        .from(analyticsEvents).orderBy(desc(analyticsEvents.createdAt)).limit(30),
      // img health
      db.select({ type: analyticsEvents.type, c: sql<number>`count(*)::int` })
        .from(analyticsEvents)
        .where(sql`${analyticsEvents.createdAt} >= ${since} and ${analyticsEvents.type} like 'img\\_%'`)
        .groupBy(analyticsEvents.type),
      // top broken images
      db.select({ src: analyticsEvents.label, c: sql<number>`count(*)::int` })
        .from(analyticsEvents)
        .where(sql`${analyticsEvents.createdAt} >= ${since} and ${analyticsEvents.type} = 'img_error'`)
        .groupBy(analyticsEvents.label).orderBy(desc(sql`count(*)`)).limit(8),
      // daily series
      db.select({
        day: sql<string>`to_char(${analyticsEvents.createdAt}, 'MM-DD')`,
        views: sql<number>`count(*) filter (where ${analyticsEvents.type} = 'page_view')::int`,
        carts: sql<number>`count(*) filter (where ${analyticsEvents.type} = 'add_to_cart')::int`,
      })
        .from(analyticsEvents)
        .where(sql`${analyticsEvents.createdAt} >= now() - interval '14 days'`)
        .groupBy(sql`to_char(${analyticsEvents.createdAt}, 'MM-DD')`)
        .orderBy(sql`to_char(${analyticsEvents.createdAt}, 'MM-DD')`),
      // top pages
      db.select({ path: analyticsEvents.path, c: sql<number>`count(*)::int` })
        .from(analyticsEvents)
        .where(sql`${analyticsEvents.createdAt} >= ${since} and ${analyticsEvents.type} = 'page_view'`)
        .groupBy(analyticsEvents.path).orderBy(desc(sql`count(*)`)).limit(10),
      // devices
      db.select({ device: visitorSessions.device, c: sql<number>`count(*)::int` })
        .from(visitorSessions).where(sql`${visitorSessions.lastSeen} >= ${since}`).groupBy(visitorSessions.device),
    ]);

    // revenue + orders in range
    const [revRows, ordRows] = await Promise.all([
      db.select({ total: sql<number>`coalesce(sum(${orders.total}),0)::int` })
        .from(orders).where(sql`${orders.createdAt} >= ${since} and ${orders.orderStatus} != 'cancelled'`),
      db.select({ c: sql<number>`count(*)::int` })
        .from(orders).where(sql`${orders.createdAt} >= ${since}`),
    ]);

    const byType: Record<string, number> = {};
    for (const r of overviewRows) byType[r.type] = Number(r.c);

    return Response.json({
      days,
      sessions: Number(funnelRows[0]?.c ?? 0),
      byType,
      revenue: Number(revRows[0]?.total ?? 0),
      ordersCount: Number(ordRows[0]?.c ?? 0),
      funnel: {
        productViews: byType.product_view ?? 0,
        addToCart: byType.add_to_cart ?? 0,
        checkoutStart: byType.checkout_start ?? 0,
        purchases: byType.purchase ?? 0,
      },
      topViewed, topClicks, topSearches, recentLogins, topBuyers,
      recentEvents, imgHealth, imgErrors, daily, topPages, devices: deviceRows,
    });
  } catch (e) {
    console.error("analytics error", e);
    return Response.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
