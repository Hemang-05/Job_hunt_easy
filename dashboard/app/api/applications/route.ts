import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createUserClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { client: supabase } = await createUserClient()
    const { data: applications, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ applications })
  } catch (err: any) {
    console.error('[API] GET /api/applications error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
