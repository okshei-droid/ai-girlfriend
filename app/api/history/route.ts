// app/api/history/route.ts
// Mockad historik (in-memory) för lokal utveckling.
// Tar bort fel från Supabase/cookies i Next 15 tills vi kopplar riktig DB igen.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Enkel in-memory store (för lokal dev; NOLL persistering över omstart)
type Msg = { role: "user" | "assistant" | "system"; content: string; conversation_id?: string };
const store = new Map<string, Msg[]>();

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

// GET /api/history?conversation_id=xyz  → hämtar meddelanden (eller tomt)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const convId = url.searchParams.get("conversation_id");
    if (convId && store.has(convId)) {
      return new Response(JSON.stringify({ messages: store.get(convId) ?? [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    // Ingen conversation_id → returnera tomt (så UI inte kraschar)
    return new Response(JSON.stringify({ messages: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// POST /api/history  body: { conversation_id?: string, messages: Msg[] }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const incoming: Msg[] = Array.isArray(body?.messages) ? body.messages : [];
    let convId: string = body?.conversation_id || newId();

    const prev = store.get(convId) ?? [];
    const next = [...prev, ...incoming];
    store.set(convId, next);

    return new Response(JSON.stringify({ ok: true, conversation_id: convId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
