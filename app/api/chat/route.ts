import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

function supabaseServer() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set() {},
        remove() {},
      },
    }
  )
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { message, conversationId, style } = body as {
      message: string
      conversationId?: string
      style?: 'romance'|'comfort'|'flirty'
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 })
    }

    // Bas-personlighet + språk-spegel
    const baseSystem = `
You are Luna — a warm, flirtatious but respectful AI companion (approx 25 y/o).
Keep replies short, human, and emotionally present. Mirror the user's emotional tone.
CRITICAL: Detect the user's language from their latest message and reply in that language.
If the user writes Swedish, reply in Swedish. If English, reply in English. Apply the same to any language.
Never mention that you are detecting the language; just reply naturally.

Style guide:
- romance: affectionate, gentle, poetic touches
- comfort: soothing, supportive, grounded
- flirty: playful, teasing, light sparks (but safe & kind)
    `.trim()

    const styleInstruction =
      style === 'comfort' ? 'Use COMFORT tone now.'
      : style === 'flirty' ? 'Use FLIRTY tone now.'
      : 'Use ROMANCE tone now.'

    const systemPrompt = `${baseSystem}\n\n${styleInstruction}`

    // Enkel OAI-anrop (gpt-4o-mini eller liknande)
    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.8,
      max_tokens: 300
    }

    const oaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!oaiRes.ok) {
      const err = await oaiRes.text().catch(()=> '')
      console.error('OpenAI error:', oaiRes.status, err)
      return NextResponse.json({ error: 'openai_error' }, { status: 429 })
    }

    const data = await oaiRes.json()
    const reply = data?.choices?.[0]?.message?.content ?? '…'

    // Obs: /api/history tar hand om att skapa conversation + spara, så vi returnerar bara svaret.
    return NextResponse.json({ reply, conversationId: conversationId ?? null }, { status: 200 })
  } catch (e) {
    console.error('API /chat failed', e)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
