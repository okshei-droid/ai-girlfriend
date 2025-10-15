import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export function supabaseServer() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Läs alla cookies som Supabase behöver
        getAll() {
          return cookieStore.getAll()
        },
        // Sätt alla cookies som Supabase vill skriva/uppdatera
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options })
          })
        },
      },
    }
  )
}
