// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ModePicker from "@/components/ModePicker";

const LS_PERSONA = "persona";        // "luna"
const LS_MODE = "luna_mode";         // "mjuk" | "rak" | "kreativ"
const LS_MESSAGES = "chat_messages";
const LS_CONV_ID = "conversation_id";

export default function Home() {
  const router = useRouter();
  const [hasHistory, setHasHistory] = useState(false);
  const [mode, setMode] = useState<"mjuk" | "rak" | "kreativ">("mjuk");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(LS_MESSAGES);
      setHasHistory(!!cached && cached.length > 2);
      const m = localStorage.getItem(LS_MODE);
      if (m === "mjuk" || m === "rak" || m === "kreativ") setMode(m);
    } catch {}
  }, []);

  function startChat() {
    try {
      localStorage.setItem(LS_PERSONA, "luna");
      localStorage.setItem(LS_MODE, mode);
      // valfritt: börja “nytt” genom att nolla conv-id
      localStorage.removeItem(LS_CONV_ID);
    } catch {}
    router.push("/chat");
  }

  function continueChat() {
    router.push("/chat");
  }

  return (
    <main className="min-h-dvh bg-gradient-to-b from-[#0b0f1a] to-[#0e1526] text-white">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Möt Luna</h1>
            <p className="mt-2 text-white/80">
              Din varma, lojala AI-kompanjon. Hon hjälper dig att landa, välja och komma vidare – i din takt.
            </p>
            <p className="mt-2 text-white/60 text-sm">
              <strong>Språk:</strong> Skriv på vilket språk du vill – Luna svarar på samma.
            </p>
          </div>

          <div>
            <button
              className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
              onClick={() => setShowSettings((s) => !s)}
              aria-expanded={showSettings}
            >
              ⚙️ Inställningar
            </button>
            {showSettings && (
              <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                <div className="text-white/70">Standardläge för Luna:</div>
                <div className="mt-2">
                  <ModePicker
                    value={mode}
                    onChange={(m) => {
                      setMode(m);
                      try { localStorage.setItem(LS_MODE, m); } catch {}
                    }}
                  />
                </div>
                <p className="mt-2 text-white/60">
                  Du kan alltid byta läge inne i chatten.
                </p>
              </div>
            )}
          </div>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Välj hur du vill börja</h2>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={startChat}
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:shadow active:scale-[.98]"
            >
              Starta chat med Luna
            </button>
            <button
              onClick={continueChat}
              disabled={!hasHistory}
              className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white/90 hover:bg-white/10 disabled:opacity-40"
              title={!hasHistory ? "Ingen tidigare konversation här" : "Fortsätt där du var"}
            >
              Fortsätt chat
            </button>

            <div className="ml-auto">
              <div className="text-xs text-white/60 mb-1">Snabbval: läge</div>
              <ModePicker
                value={mode}
                onChange={(m) => {
                  setMode(m);
                  try { localStorage.setItem(LS_MODE, m); } catch {}
                }}
                compact
              />
            </div>
          </div>
        </section>

        <section className="mt-6 text-white/70 text-sm leading-relaxed">
          <p>Tips: Säg vad som känns viktigast just nu. Luna speglar, sorterar och föreslår minsta möjliga nästa steg – alltid respektfullt.</p>
        </section>
      </div>
    </main>
  );
}
