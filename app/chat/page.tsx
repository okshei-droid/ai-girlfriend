// app/chat/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import ModePicker from "@/components/ModePicker";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  conversation_id?: string;
};

const LS_KEY = "chat_messages";
const PERSONA_KEY = "persona";
const MODE_KEY = "luna_mode";
const CONV_KEY = "conversation_id";

export default function ChatPage() {
  const [persona, setPersona] = useState<string>("luna");
  const [mode, setMode] = useState<"mjuk" | "rak" | "kreativ">("mjuk");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasPinged, setHasPinged] = useState(false); // en gång/check-in per session
  const endRef = useRef<HTMLDivElement | null>(null);
  const headerTitle = useMemo(() => "Luna", []);

  // === Hjälpare ===
  function pushAssistant(text: string) {
    const next = [...messages, { role: "assistant", content: text, conversation_id: conversationId ?? undefined }] as Message[];
    setMessages(next);
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
  }

  function greetingFor(m: "mjuk" | "rak" | "kreativ") {
    // PG-13, varm & charmig (“älskling / mitt hjärta” nämns med varsamhet)
    if (m === "mjuk") {
      return "Hej mitt hjärta 💞 Hur mår du idag? Vill du berätta vad som känns viktigast just nu så tar vi det lugnt, steg för steg.";
    } else if (m === "rak") {
      return "Hej älskling. Ska vi ta det rakt på sak? Säg vad som brinner mest just nu så prioriterar vi och tar första steget.";
    }
    return "Hej du ✨ Hur känns det idag? Jag är här för dig – säg en sak som skulle göra din kväll lite bättre så hittar vi något fint tillsammans.";
  }

  // === Init: läs LS + ev. DB + auto-greeting om tom konversation ===
  useEffect(() => {
    try {
      const p = localStorage.getItem(PERSONA_KEY);
      if (p) setPersona(p);
      const m = localStorage.getItem(MODE_KEY);
      if (m === "mjuk" || m === "rak" || m === "kreativ") setMode(m);
      const conv = localStorage.getItem(CONV_KEY);
      if (conv) setConversationId(conv);
      const cached = localStorage.getItem(LS_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length) {
          setMessages(parsed);
        } else {
          // tom historik => hälsa direkt
          setMessages([{ role: "assistant", content: greetingFor(m === "mjuk" || m === "rak" || m === "kreativ" ? m : "mjuk") }]);
        }
      } else {
        // ingen LS => hälsa direkt
        setMessages([{ role: "assistant", content: greetingFor(m === "mjuk" || m === "rak" || m === "kreativ" ? m : "mjuk") }]);
      }
    } catch {
      setMessages([{ role: "assistant", content: greetingFor("mjuk") }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // DB-hämtning om conversationId finns
  useEffect(() => {
    (async () => {
      if (!conversationId) return;
      try {
        const res = await fetch(`/api/history?conversation_id=${conversationId}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const dbMessages = (data?.messages ?? []) as Message[];
        if (dbMessages.length) {
          setMessages(dbMessages);
          localStorage.setItem(LS_KEY, JSON.stringify(dbMessages));
        }
      } catch {}
    })();
  }, [conversationId]);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check-in efter 60s tystnad (en gång)
  useEffect(() => {
    if (hasPinged) return;
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.role !== "assistant") {
      const t = setTimeout(() => {
        pushAssistant(mode === "rak"
          ? "Jag är kvar här om du vill ta ett snabbt första steg nu. Vad vill du prioritera, älskling?"
          : mode === "kreativ"
          ? "Ska vi hitta på något mysigt för kvällen? Ge mig en hint så trollar jag fram 3 förslag 💫"
          : "Jag lyssnar. Om det känns segt att börja – säg bara en liten sak som tynger så tar vi den först, mitt hjärta.");
        setHasPinged(true);
      }, 60000);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, hasPinged, mode]);

  async function send() {
    const text = input.trim();
    if (!text || isLoading) return;

    setIsLoading(true);
    setInput("");

    const next = [...messages, { role: "user", content: text, conversation_id: conversationId ?? undefined }] as Message[];
    setMessages(next);
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}

    try {
      // romanceLevel = 2 (PG-13) under huven, ingen extra UI
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, persona, mode, romanceLevel: 2 }),
      });
      if (!res.ok) throw new Error("Chat API error");

      const data = await res.json();
      const reply = (data?.reply ?? "").toString();

      const finalMessages = [...next, { role: "assistant", content: reply, conversation_id: conversationId ?? undefined }] as Message[];
      setMessages(finalMessages);
      try { localStorage.setItem(LS_KEY, JSON.stringify(finalMessages)); } catch {}

      // Spara i DB
      try {
        const saveRes = await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation_id: conversationId ?? undefined,
            messages: [
              { role: "user", content: text, conversation_id: conversationId ?? undefined },
              { role: "assistant", content: reply, conversation_id: conversationId ?? undefined },
            ],
          }),
        });
        if (saveRes.ok) {
          const saved = await saveRes.json();
          if (saved?.conversation_id && !conversationId) {
            setConversationId(saved.conversation_id);
            try { localStorage.setItem(CONV_KEY, saved.conversation_id); } catch {}
          }
        }
      } catch {}
    } catch (e) {
      console.error(e);
      alert("Chat API error – kontrollera /api/chat.");
    } finally {
      setIsLoading(false);
    }
  }

  function resetHistory() {
    try {
      localStorage.removeItem(LS_KEY);
      localStorage.removeItem(CONV_KEY);
    } catch {}
    setMessages([{ role: "assistant", content: greetingFor(mode) }]);
    setConversationId(null);
  }

  function updateMode(m: "mjuk" | "rak" | "kreativ") {
    setMode(m);
    // när läge byts, “bekräfta” med en kort assisterande replik (valbart)
    pushAssistant(
      m === "rak"
        ? "Okej, vi kör rakt på sak. Vad vill du fatta beslut om först?"
        : m === "kreativ"
        ? "Okej! Låt oss leka fram idéer 💫 Ge mig ett litet frö så sår vi något fint."
        : "Jag är med dig, mjukt och lugnt. Vad känns viktigast just nu?"
    );
    try { localStorage.setItem(MODE_KEY, m); } catch {}
  }

  return (
    <main className="flex min-h-dvh flex-col bg-[#0b0f1a] text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0b0f1a]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0b0f1a]/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="rounded-lg border border-white/20 px-2 py-1 text-xs text-white/80 hover:bg-white/10">
              ← Till start
            </Link>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-fuchsia-500 ring-2 ring-white/20">
              <span className="text-xs font-bold text-white">L</span>
            </div>
            <div>
              <div className="text-sm font-semibold leading-none">{headerTitle}</div>
              <div className="text-[11px] text-white/60">Läge: {mode}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ModePicker value={mode} onChange={updateMode} compact />
          </div>
        </div>
      </header>

      {/* MESSAGES */}
      <section className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <div className="flex flex-col gap-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed ${
                m.role === "user"
                  ? "self-end bg-white text-gray-900"
                  : "self-start bg-white/10 text-white"
              }`}
            >
              {m.content}
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </section>

      {/* INPUT */}
      <footer className="sticky bottom-0 z-10 border-t border-white/10 bg-[#0b0f1a]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0b0f1a]/60">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
            <input
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-[15px] outline-none placeholder:text-white/50"
              placeholder={isLoading ? "Skriver..." : `Skriv ett meddelande till ${headerTitle}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              disabled={isLoading}
            />
            <button
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:shadow active:scale-[.98] disabled:opacity-40"
              onClick={send}
              disabled={isLoading || !input.trim()}
            >
              Skicka
            </button>
            <button
              className="rounded-xl border border-white/20 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
              onClick={resetHistory}
              title="Rensa meddelanden (lokalt och conv-id)"
            >
              Nollställ
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}
