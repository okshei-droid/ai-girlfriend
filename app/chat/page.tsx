'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseClient'
import Chat from '@/components/Chat'

export default function ChatPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser()

      // Om du kommer via ?code=... växla den till en session
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      if (code) {
        await supabase.auth.exchangeCodeForSession(url.toString())
        url.searchParams.delete('code')
        window.history.replaceState({}, '', url.toString())
      }

      // Kolla om användaren är inloggad
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.replace('/login')
        return
      }

      setUser(data.user)
      setLoading(false)
    })()
  }, [router])

  if (loading) {
    return (
      <main style={{maxWidth: 640, margin: '40px auto', fontFamily: 'sans-serif'}}>
        <p>Checking session...</p>
      </main>
    )
  }

  return <Chat />
}
