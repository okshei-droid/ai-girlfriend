'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  // ✅ Om användaren redan är inloggad → hoppa direkt till /chat
  useEffect(() => {
    (async () => {
      const supabase = supabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) router.replace('/chat')
    })()
  }, [router])

  async function sendLink(e: React.FormEvent) {
    e.preventDefault()
    const supabase = supabaseBrowser()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Hård redirect till din live-domän + /chat
        emailRedirectTo: 'https://ai-girlfriend-plum.vercel.app/chat',
      },
    })
    if (error) alert(error.message)
    else setSent(true)
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      {sent ? (
        <p>Check your email for a magic login link ✉️</p>
      ) : (
        <form onSubmit={sendLink} className="space-y-3">
          <input
            className="w-full border p-2 rounded"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
          />
          <button className="w-full bg-black text-white p-2 rounded">
            Send magic link
          </button>
        </form>
      )}
    </div>
  )
}
