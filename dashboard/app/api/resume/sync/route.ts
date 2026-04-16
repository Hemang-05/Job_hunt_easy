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
    const { fileName, chunks, rawText, version, sizeKb } = body

    if (!fileName || !chunks) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient()

    // Upsert the resume into the database
    // We use user_id as the unique constraint (requires UNIQUE constraint on user_id in DB,
    // or we're just creating a new record each time. Let's assume user_id is unique or we 
    // update where user_id matches). Wait, Supabase upserts require a unique constraint.
    // If user_id is not unique, we can just check if it exists and update, or insert.
    // Let's do a select then an update/insert to be safe and avoid conflict errors if no unique constraint exists,
    // OR we can use the match clause.

    const { data: existing } = await supabase
      .from('resumes')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existing) {
      const { error } = await supabase
        .from('resumes')
        .update({
          file_name: fileName,
          chunks,
          raw_text: rawText,
          version,
          size_kb: sizeKb,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('resumes')
        .insert({
          user_id: userId,
          file_name: fileName,
          chunks,
          raw_text: rawText,
          version,
          size_kb: sizeKb,
        })

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[API] /api/resume/sync error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
