// app/chat/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  conversation_id?: string;
};

const LS_KEY = "chat_messages";
const PERSONA_KEY = "persona";

export default function ChatPage() {
  const [persona, setPersona] = useState<string>("luna");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  // Läs persona + historik från localStorage
  useEffect(() => {
    try {
      const p = localStorage.getItem(PERSONA_KEY);
      if (p) setPersona(p);
    } catch {}

    try {
      const cached = localStorage.getItem(LS_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) setMessages(parsed);
      }
    } catch {}
  }, []);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const headerTitle = useMemo(() => {
    switch (persona) {
      case "luna":
        return "Luna";
      case "freja":
        return "Freja";
      case "echo":
        return "Echo";
      default:
        return "Luna";
    }
  }, [persona]);

  async function send() {
    const text = input.trim();
    if (!text || isLoading) return;

    setIsLoading(true);
    setInput("");

    const next = [...messages, { role: "user", content: text }] as Message[];
    setMessages(next);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {}

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, persona }),
      });
      if (!res.ok) throw new Error("Chat API error");

      const data = await res.json();
      const reply = (data?.reply ?? "").toString();

      const finalMessages = [...next, { role: "assistant", content: reply }] as Message[];
      setMessages(finalMessages);
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(finalMessages));
      } catch {}
    } catch (e) {
      console.error(e);
      alert("Chat API error – kontrollera /api/chat i Vercel-loggarna.");
    } finally {
      setIsLoading(false);
    }
  }

  function resetHistory() {
    try {
      localStorage.removeItem(LS_KEY);
    } catch {}
    setMessages([]);
  }

  return (
    <main className="flex min-h-dvh flex-col bg-[#0b0f1a] text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0b0f1a]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0b0f1a]/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-fuchsia-500 ring-2 ring-white/20">
              <span className="text-xs font-bold text-white">
                {headerTitle.charAt(0)}
              </span>
            </div>
            <div>
              <div className="text-sm font-semibold leading-none">{headerTitle}</div>
              <div className="text-[11px] text-white/60">Persona: {persona}</div>
            </div>
          </div>
          <button
            className="text-xs rounded-lg border border-white/20 px-2.5 py-1 text-white/80 hover:bg-white/10"
            onClick={resetHistory}
          >
            Nollställ historik
          </button>
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
          </div>
        </div>
      </footer>
    </main>
  );
}
