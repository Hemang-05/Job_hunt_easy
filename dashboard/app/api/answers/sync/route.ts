import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { questionHash, questionText, answer, pageUrl } = body

    if (!questionHash || !questionText || !answer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient()

    // Check if this user already has an answer for this question hash
    const { data: existing } = await supabase
      .from('answers')
      .select('id, used_count')
      .eq('user_id', userId)
      .eq('question_hash', questionHash)
      .single()

    if (existing) {
      // Update existing: bump used_count, refresh answer and timestamp
      const { error } = await supabase
        .from('answers')
        .update({
          answer,
          used_count: existing.used_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (error) throw error
    } else {
      // Insert new answer row
      const { error } = await supabase
        .from('answers')
        .insert({
          user_id: userId,
          question_hash: questionHash,
          question_text: questionText,
          answer,
          used_count: 1,
          page_url: pageUrl,
        })

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[API] /api/answers/sync error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
