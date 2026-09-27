import { requireAdmin, logAdminActivity } from "@/lib/auth";
import { ensureCatalogSeeded } from "@/lib/auto-seed";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET() {
  const admin = await requireAdmin("system.manage");
  if (!admin) {
    return Response.json(
      { error: "Public seed endpoint is disabled. Super Admin authentication required." },
      { status: 403 }
    );
  }
  return Response.json({
    secured: true,
    forceResetAllowed: false,
    message: "Protected seed endpoint active for Super Admin only.",
  });
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    if (url.searchParams.has("force")) {
      return Response.json(
        { error: "Forbidden: Database reset via force=1 is permanently disabled for security." },
        { status: 403 }
      );
    }

    const admin = await requireAdmin("system.manage");
    const headerSecret = req.headers.get("x-seed-secret");
    const validSecret = process.env.SEED_SECRET && headerSecret === process.env.SEED_SECRET;

    if (!admin && !validSecret) {
      return Response.json(
        { error: "Forbidden: Public seed endpoint is disabled. Super Admin authorization required." },
        { status: 403 }
      );
    }

    const result = await ensureCatalogSeeded();

    if (admin) {
      await logAdminActivity({
        actor: admin,
        action: "system.seed",
        entityType: "system",
        summary: `Triggered non-destructive catalog seed (${result.products} products, ${result.categories} categories)`,
        details: result,
        req,
      });
    }

    return Response.json({
      ok: true,
      message: "Non-destructive catalog seed verified",
      ...result,
    });
  } catch (e) {
    console.error("seed error", e);
    return Response.json({ error: "Seed failed" }, { status: 500 });
  }
}
