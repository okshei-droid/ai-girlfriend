import { NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { supabaseServer } from '@/lib/supabaseServer'
import { buildSystemPrompt } from '@/lib/prompts'

type Style = 'romance' | 'comfort' | 'flirty'

export async function POST(req: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { conversationId, message, style } = await req.json() as {
    conversationId?: string
    message: string
    style?: Style
  }

  if (!message?.trim()) {
    return NextResponse.json({ error: 'empty' }, { status: 400 })
  }

  const supabase = await supabaseServer()

  // 1) Ensure conversation
  let convId = conversationId
  if (!convId) {
    const { data: persona } = await supabase
      .from('personas')
      .select('id')
      .eq('slug', 'luna')
      .maybeSingle()

    const { data: conv, error: convErr } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        persona_id: persona?.id,
        title: 'Chat with Luna'
      })
      .select('id')
      .single()

    if (convErr) {
      console.error('DB error (create conversation):', convErr)
      return NextResponse.json({ error: 'db_error' }, { status: 500 })
    }
    convId = conv.id
  }

  // 2) Save user message
  await supabase.from('messages').insert({
    conversation_id: convId!,
    role: 'user',
    content: message
  })

  // 3) Build system prompt
  const sys = buildSystemPrompt(style ?? 'romance')

  // 4) Call OpenAI
  const oaRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: message },
      ],
      max_tokens: 300,
      temperature: 0.8,
    }),
  })

  if (!oaRes.ok) {
    const errText = await oaRes.text().catch(()=> '')
    console.error('OpenAI error:', oaRes.status, errText)
    return NextResponse.json({ error: 'openai_error' }, { status: 500 })
  }

  const data = await oaRes.json() as any
  const reply: string = data?.choices?.[0]?.message?.content ?? '…'

  // 5) Save assistant message
  await supabase.from('messages').insert({
    conversation_id: convId!,
    role: 'assistant',
    content: reply
  })

  // 6) Return to client
  return NextResponse.json({ conversationId: convId, reply })
}
