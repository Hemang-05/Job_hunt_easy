import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createUserClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { client: supabase } = await createUserClient()
    const { data: answers, error } = await supabase
      .from('answers')
      .select('*')
      .eq('user_id', userId)
      .order('used_count', { ascending: false })

    if (error) throw error

    return NextResponse.json({ answers })
  } catch (err: any) {
    console.error('[API] GET /api/answers error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
