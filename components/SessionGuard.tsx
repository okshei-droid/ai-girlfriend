'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseClient'

export default function SessionGuard() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const code = params.get('code')
    if (!code) return

    ;(async () => {
      const supabase = supabaseBrowser()
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
      if (error) {
        console.error('exchangeCodeForSession error:', error.message)
        router.replace('/login')
        return
      }
      router.replace('/chat')
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
