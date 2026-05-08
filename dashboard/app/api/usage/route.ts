import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// ─── CORS for Chrome Extension requests ────────────────────
function corsHeaders(req: Request) {
  const origin = req.headers.get('origin')
  
  // When allow-credentials is true, allow-origin cannot be '*'
  // We must return the actual origin or a specific allowed origin
  const allowedOrigin = origin || process.env.NEXT_PUBLIC_APP_URL || '*'
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
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
        sessions_used: 0,
        fills_used: 0,
        sessions_limit: 5,
        reset_in: 'midnight UTC'
      }, { headers: cors })
    }

    // Reset logic if last activity is not today
    let sessionsToday = profile.sessions_today
    let fillsToday = profile.fills_today

    if (profile.last_activity_date !== today) {
      sessionsToday = 0
      fillsToday = 0
    }

    // Fetch user email from Clerk
    const { currentUser } = await import('@clerk/nextjs/server')
    const user = await currentUser()
    const email = user?.emailAddresses?.[0]?.emailAddress

    return NextResponse.json({
      plan: profile.plan,
      email: email, // Added email to response
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
