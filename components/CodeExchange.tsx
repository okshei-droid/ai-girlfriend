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
      try {
        await supabase.auth.exchangeCodeForSession(window.location.href)
      } catch (_) {
        // ignore; vi försöker ändå redirecta hem
      } finally {
        // Rensa code/state ur URL:en
        const url = new URL(window.location.href)
        url.searchParams.delete('code')
        url.searchParams.delete('state')
        window.history.replaceState({}, '', url.toString())
        // Gå till hemsidan (persona-hub)
        router.replace('/')
      }
    })()
  }, [params, router])

  return null
}
