import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// ─── CORS for Chrome Extension requests ────────────────────
function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '*'
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export async function OPTIONS(req: Request) {
  return NextResponse.json({}, { headers: corsHeaders(req) })
}

export async function GET(req: NextRequest) {
  try {
    const cors = corsHeaders(req)
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: cors })
    }

    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0] // 'YYYY-MM-DD'

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    // If no profile exists yet, return default free state
    if (!profile) {
      return NextResponse.json({
        plan: 'free',
        sessionsToday: 0,
        fillsToday: 0,
        maxSessions: 5
      }, { headers: cors })
    }

    // Reset logic if last activity is not today
    let sessionsToday = profile.sessions_today
    let fillsToday = profile.fills_today

    if (profile.last_activity_date !== today) {
      sessionsToday = 0
      fillsToday = 0
    }

    return NextResponse.json({
      plan: profile.plan,
      sessions_used: sessionsToday,
      fills_used: fillsToday,
      sessions_limit: profile.plan === 'pro' ? -1 : 5,
      reset_in: 'midnight UTC'
    }, { headers: cors })

  } catch (error: any) {
    console.error('[API Usage] Error:', error.message)
    const cors = corsHeaders(req)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: cors })
  }
}
