import { checkRateLimit } from "@/lib/rate-limit";
import { localAnswer } from "@/mtg/utils/chatApi";

export async function POST(req: Request) {
  try {
    const rl = await checkRateLimit(req, {
      endpoint: "chat",
      maxRequests: 25,
      windowSeconds: 60,
    });
    if (!rl.allowed) {
      return Response.json(
        { error: rl.error || "Too many chat messages. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const message = String(body.message || "").trim();
    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const reply = localAnswer(message);
    return Response.json({ ok: true, text: reply, ai: false });
  } catch (e) {
    console.error("chat API error", e);
    return Response.json({ error: "Chat request failed" }, { status: 500 });
  }
}
