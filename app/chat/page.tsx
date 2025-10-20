// app/chat/page.tsx
import Chat from '@/components/Chat'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'

function supabaseServer() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set() {}, // vi skriver inte cookies här
        remove() {},
      },
    }
  )
}

export default async function ChatPage() {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Ingen loop: bara presentera länk till /login
    return (
      <main className="max-w-md mx-auto p-6">
        <h1 className="text-xl font-semibold mb-2">Please sign in</h1>
        <p className="text-gray-600 mb-4">Your session seems missing or expired.</p>
        <Link href="/login" className="underline text-blue-600">Go to login</Link>
      </main>
    )
  }

  return <Chat />
}
