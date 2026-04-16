import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createUserClient } from '@/lib/supabase/server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createUserClient()
    
    // Explicitly check how many rows were affected to handle the 404 case
    const { count, error } = await supabase
      .from('answers')
      .delete({ count: 'exact' })
      .eq('id', params.id)
      .eq('user_id', userId)

    if (error) throw error

    if (count === 0) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[API] DELETE /api/answers/[id] error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
