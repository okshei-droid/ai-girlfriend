import { supabaseServer } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export default async function AuthGate({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer() // <-- viktigt
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <>{children}</>
}
