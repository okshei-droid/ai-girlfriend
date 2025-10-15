import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'
import { buildSystemPrompt } from '@/lib/prompts'

export async function POST(req: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { conversationId, message, style } = await req.json() as {
    conversationId?: string
    message: string
    style?: 'romance'|'comfort'|'flirty'
  }

  if (!message?.trim()) return NextResponse.json({ error: 'empty' }, { status: 400 })

  const supabase = supabaseServer()

  // Ensure conversation
  let convId = conversationId
  if (!convId) {
    const { data: persona } = await supabase.from('personas').select('id').eq('slug','luna').maybeSingle()
    const { data: conv, error } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, persona_id: persona?.id, title: 'Chat with Luna' })
      .select('id')
      .single()
    if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 })
    convId = conv.id
  }

  // Save user message
  await supabase.from('messages').insert({ conversation_id: convId!, role: 'user', content: message })

  // Build system prompt
  const sys = buildSystemPrompt(style ?? 'romance')

  // Call OpenAI
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: message }
      ],
      max_tokens: 300,
      temperature: 0.8
    })
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('OpenAI error:', err)
    return NextResponse.json({ error: 'openai_error' }, { status: 500 })
  }
  const data = await res.json()
  const reply = data.choices?.[0]?.message?.content ?? '…'

  // Save assistant message
  await supabase.from('messages').insert({ conversation_id: convId!, role: 'assistant', content: reply })

  return NextResponse.json({ conversationId: convId, reply })
}
