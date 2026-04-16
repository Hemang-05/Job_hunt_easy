import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

// Admin client — bypasses RLS, used for all server operations
// We enforce data isolation manually by filtering with .eq('user_id', userId)
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// Returns both the client and the current user's ID
// Always use .eq('user_id', userId) on every query to isolate user data
export async function createUserClient() {
  const { userId } = auth()
  if (!userId) throw new Error('Not authenticated')
  
  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
  
  return { client, userId }
}
