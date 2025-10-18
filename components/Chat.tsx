'use client'

import { useEffect, useRef, useState } from 'react'

type Msg = { role: 'user'|'assistant', content: string }
type Style = 'romance' | 'comfort' | 'flirty'

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [style, setStyle] = useState<Style>('romance')
  const [convId, setConvId] = useState<string | undefined>(undefined)
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  async function send() {
    if (!input.trim()) return
    const text = input
    setInput('')
    setMessages(m => [...m, { role: 'user', content: text }])
    setTyping(true)

    const res = await fetch('/api/chat', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ conversationId: convId, message: text, style })
    })

    setTyping(false)

    if (!res.ok) {
      const msg = res.status===429 ? 'Daily limit reached. Upgrade to continue 💫' : 'Something went wrong.'
      setMessages(m=>[...m, { role:'assistant', content: msg }])
      return
    }
    const data = await res.json() as { conversationId?: string; reply: string }
    if (data.conversationId && !convId) setConvId(data.conversationId)
    setMessages(m=>[...m, { role:'assistant', content: data.reply }])
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[--gray-200] bg-gray-200" />
          <div>
            <div className="font-semibold">Luna</div>
            <div className="text-xs text-gray-500">AI Companion</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="border p-2 rounded-xl"
            value={style}
            onChange={(e)=> setStyle(e.target.value as Style)}
          >
            <option value="romance">Romance</option>
            <option value="comfort">Comfort</option>
            <option value="flirty">Flirty</option>
          </select>
          <button
            onClick={()=>{ setMessages([]); setConvId(undefined) }}
            className="border px-3 py-2 rounded-xl"
          >
            New chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="border rounded-2xl bg-white/70 backdrop-blur p-3 min-h-[60vh]">
        {messages.map((m,i)=>(
          <div key={i} className={`mb-3 ${m.role==='user'?'text-right':''}`}>
            <div className={`inline-block px-3 py-2 rounded-2xl ${m.role==='user'?'bg-black text-white':'bg-gray-100'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {typing && (
          <div className="mb-3">
            <div className="inline-block px-3 py-2 rounded-2xl bg-gray-100 italic opacity-80">
              Luna is typing…
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 border p-2 rounded-xl"
          value={input}
          onChange={e=>setInput(e.target.value)}
          placeholder="Tell Luna what’s on your mind…"
          onKeyDown={(e)=> e.key==='Enter' && send()}
        />
        <button onClick={send} className="bg-black text-white px-4 py-2 rounded-xl">Send</button>
      </div>
    </div>
  )
}
