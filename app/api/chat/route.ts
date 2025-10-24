// app/api/chat/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Läs in body (även om vi inte använder allt)
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const persona = body?.persona ?? "luna";

    // Stabilt testsvar (mock)
    const reply =
      persona === "luna"
        ? "Jag är Luna 🌙 — allt funkar! Vill du slå på riktig AI? Säg till så byter vi till OpenAI-versionen."
        : "Allt funkar! (MOCK-svar).";

    return new Response(JSON.stringify({ reply }), {
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
