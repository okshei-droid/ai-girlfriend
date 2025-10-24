// app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PersonaCard from "@/components/PersonaCard";

export default function HomeHub() {
  const router = useRouter();
  const [hasHistory, setHasHistory] = useState(false);

  // Kolla om det finns lokalt sparade meddelanden (från 1.4-logiken)
  useEffect(() => {
    try {
      const cached = localStorage.getItem("chat_messages");
      setHasHistory(!!cached && cached.length > 2);
    } catch {
      setHasHistory(false);
    }
  }, []);

  const startWithLuna = () => {
    try {
      localStorage.setItem("persona", "luna");
    } catch {}
    router.push("/chat");
  };

  const continueChat = () => {
    // Om vi har historik så hoppar vi direkt till chatten
    router.push("/chat");
  };

  const pageTitle = useMemo(() => "Välj persona", []);

  return (
    <main className="min-h-dvh bg-gradient-to-b from-[#0b0f1a] to-[#0e1526] text-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{pageTitle}</h1>
          <p className="mt-2 text-white/70">
            Välj vem du vill prata med. Du kan när som helst byta senare.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <PersonaCard
            title="Luna"
            subtitle="Varm, tydlig, lösningsorienterad"
            description="Snabb, empatisk AI-kompis som hjälper dig strukturera tankar, ta beslut och få saker gjorda – utan krångel."
            onStart={startWithLuna}
            onContinue={continueChat}
            canContinue={hasHistory}
            imageSrc="/luna.png"
          />
          {/* Fler personas senare – t.ex. Aurora, Coach Nova, etc. */}
        </section>
      </div>
    </main>
  );
}