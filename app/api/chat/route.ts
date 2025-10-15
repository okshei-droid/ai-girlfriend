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
    style?: 'romance' | 'comfort' | 'flirty'
  }

  if (!message?.trim()) return NextResponse.json({ error: 'empty' }, { status: 400 })

  const supabase = await supabaseServer() // <-- viktigt

  // Ensure conversation ...
  // (resten av din befintliga kod oförändrad)
}
