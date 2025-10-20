import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

type Msg = { role: 'user'|'assistant', content: string }

// Server-Supabase med cookie-stöd (SSR)
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

/** GET /api/history
 * Hämtar senaste konversation + alla meddelanden för inloggad user
 */
export async function GET() {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ messages: [], conversationId: null }, { status: 200 })

  const { data: convs } = await supabase
    .from('conversations')
    .select('id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  if (!convs || convs.length === 0) {
    return NextResponse.json({ messages: [], conversationId: null }, { status: 200 })
  }

  const conversationId = convs[0].id
  const { data: msgs } = await supabase
    .from('messages')
    .select('role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  return NextResponse.json({ messages: (msgs ?? []) as Msg[], conversationId }, { status: 200 })
}

/** POST /api/history
 * Body: { conversationId?: string, messages: Msg[] }
 * Skapar conversation vid behov och lägger till messages.
 */
export async function POST(req: Request) {
  const supabase = supabaseServer()
  const body = await req.json().catch(() => ({}))
  const inputMessages = (body?.messages ?? []) as Msg[]
  let conversationId = body?.conversationId as string | undefined

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // Tillåt tyst “miss” för anonyma – vi sparar inte i molnet då
    return NextResponse.json({ saved: false, reason: 'anonymous' }, { status: 200 })
  }

  if (!conversationId) {
    const { data: conv, error: convErr } = await supabase
      .from('conversations')
      .insert({ user_id: user.id })
      .select('id')
      .single()
    if (convErr || !conv) return NextResponse.json({ error: 'failed_to_create_conversation' }, { status: 500 })
    conversationId = conv.id
  }

  if (inputMessages.length > 0) {
    const rows = inputMessages.map(m => ({
      conversation_id: conversationId!,
      role: m.role,
      content: m.content
    }))
    const { error: insErr } = await supabase.from('messages').insert(rows)
    if (insErr) return NextResponse.json({ error: 'failed_to_insert_messages' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, conversationId }, { status: 200 })
}
