// app/api/chat/route.ts
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Välj modell
const MODEL = "gpt-4o"; // eller "gpt-4o-mini" om du vill snabbare/billigare

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Msg = { role: "user" | "assistant" | "system"; content: string };

function toRole(r: unknown): Msg["role"] {
  if (r === "user" || r === "assistant" || r === "system") return r;
  return "system";
}

function systemPromptFor(persona: string): string {
  switch (persona) {
    case "luna":
      return [
        "Du är Luna – varm, empatisk och lösningsorienterad coach.",
        "Svara kort först, erbjud fördjupning på begäran.",
        "Spegla känslor, sammanfatta, och föreslå minsta möjliga nästa steg."
      ].join(" ");
    case "freja":
      return [
        "Du är Freja – no-nonsense strateg.",
        "Prioritera hårt, var konkret och rakt på sak.",
        "Ge beslutstöd, trade-offs och checklistor. Inget fluff."
      ].join(" ");
    case "echo":
      return [
        "Du är Echo – kreativ idégenerator.",
        "Ge flera varianter, analogier, hooks och twistar.",
        "Var lekfull men tydlig. Förslag i punktlistor."
      ].join(" ");
    default:
      return "Du är en hjälpsam assistent. Svara vänligt, korrekt och på svenska.";
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const persona = (body?.persona as string) || "luna";

    const raw = Array.isArray(body?.messages) ? body.messages : [];
    const history: Msg[] = raw
      .map((m: any): Msg => ({
        role: toRole(m?.role),
        content: (m?.content ?? "").toString(),
      }))
      .slice(-20);

    const messages: Msg[] = [
      { role: "system", content: systemPromptFor(persona) },
      ...history,
    ];

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
