// app/api/chat/route.ts
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Modellval
const MODEL = "gpt-4o"; // alternativ: "gpt-4o-mini"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chatmeddelandets typ
type Msg = { role: "user" | "assistant" | "system"; content: string };

function toRole(r: unknown): Msg["role"] {
  if (r === "user" || r === "assistant" || r === "system") return r;
  return "system";
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const persona = (body?.persona as string) || "luna";

    // Ta emot historik och normalisera till vår Msg-typ
    const raw = Array.isArray(body?.messages) ? body.messages : [];
    const history: Msg[] = raw
      .map((m: any): Msg => ({
        role: toRole(m?.role),
        content: (m?.content ?? "").toString(),
      }))
      .slice(-20);

    const systemPrompt =
      persona === "luna"
        ? "Du är Luna: varm, tydlig, lösningsorienterad. Svara kort först, fördjupa på begäran. Svara på svenska om inget annat önskas."
        : "Du är en hjälpsam assistent. Svara vänligt och korrekt.";

    const messages: Msg[] = [{ role: "system", content: systemPrompt }, ...history];

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.7,
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Jag är här. Vad vill du göra nu?";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("OpenAI route error:", e?.message || e);
    return new Response(
      JSON.stringify({
        error:
          "Chat API (OpenAI) fel. Kontrollera OPENAI_API_KEY / modell / nätverk. " +
          (e?.message || ""),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
