import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function supabaseServer() {
  // I Next 15 kan cookies() vara asynkron
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Läs alla cookies Supabase behöver
        getAll() {
          return cookieStore.getAll()
        },
        // Skriv/uppdatera alla cookies som Supabase begär
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options as CookieOptions)
            })
          } catch {
            // no-op vid edge-restriktioner
          }
        },
      },
    }
  )
}
