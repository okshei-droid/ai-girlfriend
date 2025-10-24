// app/api/history/route.ts
// Stabil Supabase-integration via service role (ingen cookies/Next 15-problem).
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type Msg = { role: "user" | "assistant" | "system"; content: string; conversation_id?: string };

function required(name: string, v?: string) {
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function getClient() {
  return createClient(required("SUPABASE_URL", supabaseUrl), required("SUPABASE_SERVICE_ROLE_KEY", supabaseServiceKey), {
    auth: { persistSession: false },
  });
}

// GET /api/history?conversation_id=xyz
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const conversation_id = url.searchParams.get("conversation_id");
    if (!conversation_id) {
      return new Response(JSON.stringify({ messages: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = getClient();
    const { data, error } = await supabase
      .from("messages")
      .select("role, content, conversation_id, created_at")
      .eq("conversation_id", conversation_id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return new Response(JSON.stringify({ messages: data ?? [] }), {
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

// POST /api/history
// body: { conversation_id?: string, messages: Msg[] }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const incoming: Msg[] = Array.isArray(body?.messages) ? body.messages : [];
    let conversation_id: string =
      (typeof body?.conversation_id === "string" && body.conversation_id) ||
      Math.random().toString(36).slice(2, 10);

    if (!incoming.length) {
      return new Response(JSON.stringify({ ok: true, conversation_id }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const rows = incoming.map((m) => ({
      conversation_id,
      role: m.role,
      content: m.content,
    }));

    const supabase = getClient();
    const { error } = await supabase.from("messages").insert(rows);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, conversation_id }), {
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
