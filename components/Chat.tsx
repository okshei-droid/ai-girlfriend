'use client'
import { useEffect, useRef, useState } from 'react'

type Msg = { role: 'user' | 'assistant', content: string }
const LSTORE_KEY = 'luna_chat_history_v1'

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [style, setStyle] = useState<'romance' | 'comfort' | 'flirty'>('romance')
  const [convId, setConvId] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // 1) Läs lokalt först
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LSTORE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Msg[]
        if (Array.isArray(parsed)) setMessages(parsed)
      }
    } catch {}
  }, [])

  // 2) Läs molnhistorik
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/history', { method: 'GET' })
        if (!res.ok) return
        const data = await res.json() as { messages: Msg[]; conversationId: string | null }
        if (data?.messages?.length > 0) setMessages(data.messages)
        if (data?.conversationId) setConvId(data.conversationId)
      } catch {}
    })()
  }, [])

  // 3) Spara lokalt vid ändring
  useEffect(() => {
    try { localStorage.setItem(LSTORE_KEY, JSON.stringify(messages)) } catch {}
  }, [messages])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send() {
    if (!input.trim()) return
    const text = input
    setInput('')
    const next = [...messages, { role: 'user', content: text }]
    setMessages(next)

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: convId, message: text, style })
    })

    if (!res.ok) {
      const msg = res.status === 429 ? 'Daily limit reached. Upgrade to continue 💫' : 'Something went wrong.'
      setMessages(m => [...m, { role: 'assistant', content: msg }])
      // spara åtminstone user-meddelandet i molnet
      try {
        await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId: convId, messages: [{ role: 'user', content: text }] })
        })
      } catch {}
      return
    }

    const data = await res.json() as { reply: string; conversationId?: string }
    if (data.conversationId && !convId) setConvId(data.conversationId)
    const withReply = [...next, { role: 'assistant', content: data.reply }]
    setMessages(withReply)

    // spara båda i molnet
    try {
      const saveRes = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: convId ?? data.conversationId ?? null,
          messages: [{ role: 'user', content: text }, { role: 'assistant', content: data.reply }]
        })
      })
      const saved = await saveRes.json()
      if (saved?.conversationId && !convId) setConvId(saved.conversationId)
    } catch {}
  }

  function clearHistory() {
    localStorage.removeItem(LSTORE_KEY)
    setMessages([])
    setConvId(null)
  }

  async function logout() {
    try { await fetch('/api/logout', { method: 'POST' }) } catch {}
    setMenuOpen(false)
    window.location.href = '/login'
  }

  return (
    <div className="max-w-2xl mx-auto p-4 min-h-[100dvh]
                    bg-[radial-gradient(60%_40%_at_50%_0%,_var(--luna-tint),_transparent_70%)]">

      {/* Header-kort */}
      <div className="mb-4 rounded-2xl bg-white/70 backdrop-blur border p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/icons/avatar-luna.png"
              alt="Luna"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[var(--luna-accent)]"
            />
            <div>
              <div className="font-semibold leading-tight">Luna</div>
              <div className="text-xs text-gray-600">AI Companion</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="border p-2 rounded-xl bg-white/80 backdrop-blur
                         focus:outline-none focus:ring-2 focus:ring-[var(--luna-accent)]"
              value={style}
              onChange={(e) => setStyle(e.target.value as 'romance'|'comfort'|'flirty')}
            >
              <option value="romance">Romance</option>
              <option value="comfort">Comfort</option>
              <option value="flirty">Flirty</option>
            </select>

            <button
              onClick={() => setMenuOpen(v => !v)}
              className="h-10 w-10 grid place-items-center rounded-xl bg-white/80 border hover:bg-white"
              aria-label="Open menu"
              title="Menu"
            >
              ⋯
            </button>
          </div>
        </div>

        {/* Info-rad */}
        <div className="text-xs text-gray-600 mt-2">
          You can chat in any language — Luna will follow you.
        </div>
      </div>

      {/* FIXED DROPDOWN MENY */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="fixed right-4 top-16 z-50 w-48 rounded-xl bg-white shadow-lg border overflow-hidden">
            <button
              onClick={() => { setMenuOpen(false); clearHistory() }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50"
            >
              Reset chat
            </button>
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
            >
              Log out
            </button>
          </div>
        </>
      )}

      {/* Messages */}
      <div className="border rounded-2xl bg-white/70 backdrop-blur p-3 min-h-[50vh]">
        {messages.map((m, i) => (
          <div key={i} className={`mb-3 ${m.role === 'user' ? 'text-right' : ''}`}>
            <div
              className={`inline-block px-3 py-2 rounded-2xl
                         ${m.role === 'user'
                           ? 'bg-[var(--luna-accent)] text-white'
                           : 'bg-gray-100 text-gray-800'}`}
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 border p-2 rounded-xl bg-white/80 backdrop-blur
                     focus:outline-none focus:ring-2 focus:ring-[var(--luna-accent)]"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Tell Luna what’s on your mind…"
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button
          onClick={send}
          className="px-4 py-2 rounded-xl text-white font-medium"
          style={{ background: 'var(--luna-accent)' }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
