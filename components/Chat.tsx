'use client'
import { useEffect, useRef, useState } from 'react'

type Msg = { role: 'user' | 'assistant', content: string }

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [style, setStyle] = useState<'romance' | 'comfort' | 'flirty'>('romance')
  const [convId, setConvId] = useState<string>()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send() {
    if (!input.trim()) return
    const text = input
    setInput('')
    setMessages(m => [...m, { role: 'user', content: text }])
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: convId, message: text, style })
    })
    if (!res.ok) {
      const msg = res.status === 429 ? 'Daily limit reached. Upgrade to continue 💫' : 'Something went wrong.'
      setMessages(m => [...m, { role: 'assistant', content: msg }])
      return
    }
    const data = await res.json()
    if (data.conversationId && !convId) setConvId(data.conversationId)
    setMessages(m => [...m, { role: 'assistant', content: data.reply }])
  }

  return (
    <div className="max-w-2xl mx-auto p-4 min-h-[100dvh]
                    bg-[radial-gradient(60%_40%_at_50%_0%,_var(--luna-tint),_transparent_70%)]">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src="/icons/avatar-luna.png"
            alt="Luna"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[var(--luna-accent)]"
          />
          <div>
            <div className="font-semibold">Luna</div>
            <div className="text-xs text-gray-500">AI Companion</div>
          </div>
        </div>

        <select
          className="border p-2 rounded-xl bg-white/80 backdrop-blur
                     focus:outline-none focus:ring-2 focus:ring-[var(--luna-accent)]"
          value={style}
          onChange={(e) => setStyle(e.target.value as any)}
        >
          <option value="romance">Romance</option>
          <option value="comfort">Comfort</option>
          <option value="flirty">Flirty</option>
        </select>
      </div>

      {/* Messages */}
      <div className="border rounded-2xl bg-white/70 backdrop-blur p-3 min-h-[50vh]">
        {messages.map((m, i) => (
          <div key={i} className={`mb-3 ${m.role === 'user' ? 'text-right' : ''}`}>
            <div
              className={`inline-block px-3 py-2 rounded-2xl
                         ${m.role === 'user'
                           ? 'bg-[var(--luna-accent)] text-white'
                           : 'bg-gray-100'}`}
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
