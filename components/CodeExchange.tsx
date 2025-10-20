'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseClient'

export default function CodeExchange() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const code = params.get('code')
    if (!code) return

    ;(async () => {
      const supabase = supabaseBrowser()
      // Byter in 'code' mot en session (PKCE flow)
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
      // Rensa URL:en från code/state så den blir snygg
      const url = new URL(window.location.href)
      url.searchParams.delete('code')
      url.searchParams.delete('state')
      window.history.replaceState({}, '', url.toString())

      // Oavsett om det lyckas eller ej, försök ta användaren till hemsidan
      router.replace('/')
    })()
  }, [params, router])

  return null
}
