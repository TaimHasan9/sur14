import { db } from "@/db";
import { adminActivityLogs, emailLogs } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const admin = await requireAdmin("logs.view");
  if (!admin) {
    return Response.json({ error: "Unauthorized: logs.view permission required" }, { status: 403 });
  }

  const url = new URL(req.url);
  const entityType = url.searchParams.get("entityType") || "";
  const type = url.searchParams.get("type") || "activity";

  if (type === "emails") {
    const emails = await db.select().from(emailLogs).orderBy(desc(emailLogs.createdAt)).limit(80);
    return Response.json({ emails });
  }

  const logs = entityType
    ? await db
        .select()
        .from(adminActivityLogs)
        .where(eq(adminActivityLogs.entityType, entityType))
        .orderBy(desc(adminActivityLogs.createdAt))
        .limit(100)
    : await db.select().from(adminActivityLogs).orderBy(desc(adminActivityLogs.createdAt)).limit(100);

  return Response.json({ logs });
}
