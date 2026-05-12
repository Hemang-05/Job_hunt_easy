import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  try {
    const { reason, text } = await req.json()
    const { userId } = auth()
    const user = await currentUser()
    
    const email = user?.emailAddresses?.[0]?.emailAddress || null

    const supabase = createClient()

    // We assume there's an 'uninstall_feedback' table.
    // If it fails, we catch the error but return success to the UI anyway 
    // to not disrupt the user experience during uninstallation.
    const { error } = await supabase
      .from('uninstall_feedback')
      .insert({
        user_id: userId || null,
        email: email,
        reason: reason || 'unknown',
        feedback_text: text || '',
      })

    if (error) {
      console.error('[API Feedback] Insert error:', error.message)
      // We still return 200 so the frontend shows the success state
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[API Feedback] Exception:', err.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
