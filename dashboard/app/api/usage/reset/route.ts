import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// DEV ONLY: Reset the user's daily session count for testing
export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient()

  // Reset profile counters
  await supabase
    .from('profiles')
    .update({
      sessions_today: 0,
      fills_today: 0,
      last_activity_date: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  // Delete today's sessions
  const today = new Date().toISOString().split('T')[0]
  await supabase
    .from('sessions')
    .delete()
    .eq('user_id', userId)
    .gte('started_at', `${today}T00:00:00.000Z`)

  return NextResponse.json({ success: true, message: 'Usage reset to 0/5' })
}
