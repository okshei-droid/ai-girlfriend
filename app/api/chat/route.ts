// app/api/chat/route.ts
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "gpt-4o"; // eller "gpt-4o-mini"
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type Msg = { role: "user" | "assistant" | "system"; content: string };

function toRole(r: unknown): Msg["role"] {
  if (r === "user" || r === "assistant" || r === "system") return r;
  return "system";
}

function clampRomance(n: any): 0 | 1 | 2 {
  const v = Number(n);
  if (v === 1) return 1;
  if (v === 2) return 2;
  return 0;
}

// Säker basprompt för Luna + läges-/romance-tillsatser (PG-13)
function systemPromptFor(
  persona: string,
  mode: "mjuk" | "rak" | "kreativ",
  romance: 0 | 1 | 2
): string {
  const base = [
    "Du är Luna – varm, lojal och lösningsorienterad AI-kompanjon.",
    "Svara på användarens språk. Var respektfull, empatisk och konkret.",
    "Säkerhetsram: Inga explicita sexuella detaljer, inget minderårigt innehåll, ingen självskada eller olaglig rådgivning.",
    "Uppmuntra samtycke och sunda gränser. Vid tecken på kris: föreslå professionellt stöd (eskalera varsamt).",
  ];

  const modeAdd =
    mode === "mjuk"
      ? "Prioritera känslospegling, normalisera upplevelser, sammanfatta kort och föreslå minsta möjliga nästa steg."
      : mode === "rak"
      ? "Var rakt på sak: prioritera, skär bort brus, ge beslutstöd och korta listor med nästa steg."
      : "Var idérik och lekfull: ge flera varianter, analogier och mjuka romantiska idéer – men håll allt PG-13.";

  const romanceAdd =
    romance === 0
      ? "Håll en neutral, varm ton utan flört. Undvik romantiska komplimanger."
      : romance === 1
      ? "Tillåt lätt flirt och varsamma komplimanger när det passar, alltid respektfullt och PG-13."
      : "Öka värmen och charmiga formuleringar (romantik-light, PG-13). Undvik explicita sexuella detaljer; avböj vänligt sådana förfrågningar och föreslå känslomässig närhet istället.";

  return [base.join(" "), modeAdd, romanceAdd].join(" ");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const persona = (body?.persona as string) || "luna";
    const mode = (body?.mode as "mjuk" | "rak" | "kreativ") || "mjuk";
    const romanceLevel = clampRomance(body?.romanceLevel);

    const raw = Array.isArray(body?.messages) ? body.messages : [];
    const history: Msg[] = raw
      .map((m: any): Msg => ({ role: toRole(m?.role), content: (m?.content ?? "").toString() }))
      .slice(-20);

    const messages: Msg[] = [
      { role: "system", content: systemPromptFor(persona, mode, romanceLevel) },
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
      JSON.stringify({ error: "Chat API (OpenAI) fel. " + (e?.message || "") }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
