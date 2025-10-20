'use client'

import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      const supabase = supabaseBrowser()
      const redirectTo =
        (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin) + '/'
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      })
      if (error) throw error
      setSent(true)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.')
    }
  }

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      {sent ? (
        <p className="text-sm text-gray-700">
          Check your email for a magic link. Open it on this device.
        </p>
      ) : (
        <form onSubmit={sendMagicLink} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border p-2 rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded text-white"
            style={{ background: 'var(--luna-accent)' }}
          >
            Send magic link
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      )}
    </main>
  )
}
