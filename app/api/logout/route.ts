import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

function supabaseServer() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set() {}, // Next hanterar set/remove via Response
        remove() {},
      },
    }
  )
}

export async function POST() {
  const supabase = supabaseServer()
  // Logga ut och låt Supabase rensa auth-cookies
  await supabase.auth.signOut()
  return NextResponse.json({ ok: true }, { status: 200 })
}
