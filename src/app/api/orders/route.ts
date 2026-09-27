import { db } from "@/db";
import { orders } from "@/db/schema";
import { getSessionUser, isStaffRole } from "@/lib/auth";
import { eq, desc, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET: my orders (customer) or all orders (staff/manager/admin/super_admin with ?all=1)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const all = url.searchParams.get("all");
    const status = url.searchParams.get("status");
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") || 10)));
    const offset = (page - 1) * limit;

    const user = await getSessionUser();

    if (all === "1") {
      if (!user || !isStaffRole(user.role)) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }
      const conds = [];
      if (status) conds.push(eq(orders.orderStatus, status));
      const where = conds.length ? and(...conds) : undefined;
      const [rows, countRows] = await Promise.all([
        db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(limit).offset(offset),
        db.select({ c: sql<number>`count(*)` }).from(orders).where(where),
      ]);
      return Response.json({ orders: rows, total: Number(countRows[0]?.c ?? 0), page, limit });
    }

    if (!user) return Response.json({ orders: [], total: 0 });
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, user.id))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);
    const countRows = await db.select({ c: sql<number>`count(*)` }).from(orders).where(eq(orders.userId, user.id));
    return Response.json({ orders: rows, total: Number(countRows[0]?.c ?? 0), page, limit });
  } catch (e) {
    console.error("orders GET error", e);
    return Response.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
