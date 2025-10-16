'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseClient'
import Chat from '@/components/Chat'

export default function ChatPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser()

      // 1) Växla ev. ?code=... till session-cookie
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(url.toString())
        if (error) {
          console.error('exchangeCodeForSession error:', error.message)
          router.replace('/login')
          return
        }
        // Ta bort ?code ur adressen
        url.searchParams.delete('code')
        window.history.replaceState({}, '', url.toString())
      }

      // 2) Kolla om user nu är inloggad
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }

      // 3) Allt klart → rendera chat
      setReady(true)
    })()
  }, [router])

  if (!ready) {
    return (
      <div style={{ maxWidth: 640, margin: '40px auto', fontFamily: 'sans-serif' }}>
        Loading chat…
      </div>
    )
  }

  return <Chat />
}
