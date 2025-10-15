'use client'

import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  async function sendLink(e: React.FormEvent) {
    e.preventDefault()
    const supabase = supabaseBrowser()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/chat` }
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
