import { supabaseServer } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export default async function AuthGate({ children }: { children: React.ReactNode }) {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <>{children}</>
}
