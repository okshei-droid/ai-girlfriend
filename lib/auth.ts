import { supabaseServer } from './supabaseServer'
export async function getUser() {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
