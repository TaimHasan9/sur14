import { db } from "@/db";
import { sql } from "drizzle-orm";
import { ensureCatalogSeeded } from "@/lib/auto-seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    // Ensure catalog and initial Super Admin exist (idempotent & non-destructive)
    await ensureCatalogSeeded().catch((err) => console.error("Initial auto-seed warning:", err));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
