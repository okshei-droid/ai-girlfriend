import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

/** Minimal, lintsäker typ för cookie-options */
type CookieOpts = {
  path?: string
  domain?: string
  maxAge?: number
  expires?: Date
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'lax' | 'strict' | 'none'
}

export function supabaseServer() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options?: CookieOpts) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options?: CookieOpts) {
          cookieStore.set({ name, value: '', ...options })
        }
      }
    }
  )
}
