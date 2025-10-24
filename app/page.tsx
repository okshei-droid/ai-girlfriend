// app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PersonaCard from "@/components/PersonaCard";

const LS_PERSONA = "persona";
const LS_MESSAGES = "chat_messages";

export default function HomeHub() {
  const router = useRouter();
  const [hasHistory, setHasHistory] = useState(false);

  // Kolla om det finns sparad historik (localStorage)
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LS_MESSAGES);
      setHasHistory(!!cached && cached.length > 2);
    } catch {
      setHasHistory(false);
    }
  }, []);

  const pageTitle = useMemo(() => "Välj persona", []);

  function startWith(id: string) {
    try {
      localStorage.setItem(LS_PERSONA, id);
    } catch {}
    router.push("/chat");
  }

  function continueChat() {
    router.push("/chat");
  }

  return (
    <main className="min-h-dvh bg-gradient-to-b from-[#0b0f1a] to-[#0e1526] text-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{pageTitle}</h1>
          <p className="mt-2 text-white/70">Välj vem du vill prata med. Du kan byta när som helst.</p>
        </header>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <PersonaCard
            id="luna"
            title="Luna"
            subtitle="Varm, empatisk coach"
            description="Hjälper dig sortera tankar, speglar känslor, föreslår minsta möjliga nästa steg. Tydlig men mjuk."
            accentFrom="from-indigo-400"
            accentTo="to-fuchsia-500"
            onStart={startWith}
            onContinue={() => continueChat()}
            canContinue={hasHistory}
          />
          <PersonaCard
            id="freja"
            title="Freja"
            subtitle="No-nonsense strateg"
            description="Rakt på sak, prioriterar, skär bort brus. Levererar planer, beslutsstöd och trade-offs."
            accentFrom="from-emerald-400"
            accentTo="to-teal-500"
            onStart={startWith}
            onContinue={() => continueChat()}
            canContinue={hasHistory}
          />
          <PersonaCard
            id="echo"
            title="Echo"
            subtitle="Kreativ idégenerator"
            description="Lekfull, genererar många varianter, analogier och hookar. Passar brainstorming och copy."
            accentFrom="from-amber-400"
            accentTo="to-rose-500"
            onStart={startWith}
            onContinue={() => continueChat()}
            canContinue={hasHistory}
          />
        </section>
      </div>
    </main>
  );
}
