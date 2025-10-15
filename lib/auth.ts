import { supabaseServer } from './supabaseServer'

export async function getUser() {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
