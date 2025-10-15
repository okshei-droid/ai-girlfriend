'use client'
import { useEffect, useRef, useState } from 'react'

type Msg = { role: 'user'|'assistant', content: string }

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [style, setStyle] = useState<'romance'|'comfort'|'flirty'>('romance')
  const [convId, setConvId] = useState<string>()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  async function send() {
    if (!input.trim()) return
    const text = input
    setInput('')
    setMessages(m=>[...m, { role:'user', content: text }])
    const res = await fetch('/api/chat', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ conversationId: convId, message: text, style })
    })
    if (!res.ok) {
      const msg = res.status===429 ? 'Daily limit reached. Upgrade to continue 💫' : 'Something went wrong.'
      setMessages(m=>[...m, { role:'assistant', content: msg }])
      return
    }
    const data = await res.json()
    if (data.conversationId && !convId) setConvId(data.conversationId)
    setMessages(m=>[...m, { role:'assistant', content: data.reply }])
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-3">
        <select className="border p-2 rounded" value={style} onChange={e=>setStyle(e.target.value as any)}>
          <option value="romance">Romance</option>
          <option value="comfort">Comfort</option>
          <option value="flirty">Flirty</option>
        </select>
      </div>

      <div className="border rounded p-3 min-h-[50vh]">
        {messages.map((m,i)=>(
          <div key={i} className={`mb-3 ${m.role==='user'?'text-right':''}`}>
            <div className={`inline-block px-3 py-2 rounded ${m.role==='user'?'bg-black text-white':'bg-gray-100'}`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 border p-2 rounded"
          value={input}
          onChange={e=>setInput(e.target.value)}
          placeholder="Tell Luna what’s on your mind…"
          onKeyDown={(e)=> e.key==='Enter' && send()}
        />
        <button onClick={send} className="bg-black text-white px-4 py-2 rounded">Send</button>
      </div>
    </div>
  )
}
