'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseClient'

export default function CodeExchange() {
  const router = useRouter()

  useEffect(() => {
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    if (!code) return

    ;(async () => {
      const supabase = supabaseBrowser()
      const { error } = await supabase.auth.exchangeCodeForSession(url.toString())
      if (error) {
        console.error('exchangeCodeForSession error:', error.message)
        router.replace('/login')
        return
      }
      // Rensa parametern och gå till /chat
      router.replace('/chat')
    })()
  }, [router])

  return null
}
