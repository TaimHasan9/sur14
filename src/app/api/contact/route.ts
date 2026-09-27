import { db } from "@/db";
import { contacts } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin("dashboard.view");
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await db.select().from(contacts).orderBy(desc(contacts.createdAt)).limit(50);
  return Response.json({ messages: rows });
}

export async function POST(req: Request) {
  try {
    const rl = await checkRateLimit(req, {
      endpoint: "contact",
      maxRequests: 5,
      windowSeconds: 300,
    });
    if (!rl.allowed) {
      return Response.json({ error: rl.error || "Too many contact submissions. Please wait." }, { status: 429 });
    }

    const body = await req.json();
    const { name, phone, email, subject, message } = body;
    if (!name || !message) return Response.json({ error: "Name and message are required" }, { status: 400 });
    const inserted = await db
      .insert(contacts)
      .values({
        name: String(name).trim().slice(0, 100),
        phone: phone ? String(phone).trim().slice(0, 20) : null,
        email: email ? String(email).trim().slice(0, 255) : null,
        subject: subject ? String(subject).trim().slice(0, 200) : null,
        message: String(message).trim().slice(0, 2000),
      })
      .returning();
    return Response.json({ ok: true, id: inserted[0].id });
  } catch (e) {
    console.error("contact error", e);
    return Response.json({ error: "Failed to send message" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const admin = await requireAdmin("dashboard.view");
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.id || !body.status) return Response.json({ error: "ID and status required" }, { status: 400 });
  const updated = await db.update(contacts).set({ status: String(body.status) }).where(eq(contacts.id, body.id)).returning();
  return Response.json({ ok: true, message: updated[0] });
}
