import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'

// Setup CORS proxy headers specifically for Chrome Extension UI
function setCorsHeaders(req: Request, res: NextResponse) {
  const origin = req.headers.get('origin') || '*'
  res.headers.set('Access-Control-Allow-Origin', origin)
  res.headers.set('Access-Control-Allow-Credentials', 'true')
  res.headers.set('Access-Control-Allow-Methods', 'OPTIONS, POST')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return res
}

export async function OPTIONS(req: Request) {
  return setCorsHeaders(req, NextResponse.json({}))
}

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return setCorsHeaders(req, NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
    }

    const body = await req.json()
    const supabase = createClient()

    if (body.type === 'resume') {
      const { fileName, version } = body
      if (!fileName || version === undefined) {
        return setCorsHeaders(req, NextResponse.json({ error: 'Missing resume fields' }, { status: 400 }))
      }

      const { error } = await supabase
        .from('resumes')
        .insert({
          user_id: userId,
          file_name: fileName,
          version: version
        })

      if (error) throw error
      return setCorsHeaders(req, NextResponse.json({ success: true }))
    }

    // Handle application tracking (Phase 4)
    if (body.jobContext && (body.jobContext.companyName || body.jobContext.roleTitle)) {
      const { companyName, roleTitle, platform } = body.jobContext
      
      // Simple deduplication: Check if we already tracked this job in the last 24h
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      
      let query = supabase
        .from('applications')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', yesterday)
        .limit(1)

      if (companyName) query = query.eq('company_name', companyName)
      if (roleTitle) query = query.eq('role_title', roleTitle)

      const { data: existingApp } = await query

      if (!existingApp || existingApp.length === 0) {
        await supabase.from('applications').insert({
          user_id: userId,
          company_name: companyName || null,
          role_title: roleTitle || null,
          platform: platform || null
        })
      }
    }

    // Default to handling answer analytics
    const { question, hash, answer, pageUrl } = body

    if (!question || !hash || !answer) {
      return setCorsHeaders(req, NextResponse.json({ error: 'Missing answer fields' }, { status: 400 }))
    }
    
    // Check if the answer already exists for this user and question hash
    const { data: existingAnswer } = await supabase
      .from('answers')
      .select('id, used_count')
      .eq('user_id', userId)
      .eq('question_hash', hash)
      .limit(1)
      .maybeSingle()

    if (existingAnswer) {
      // Update the existing answer and increment usage
      const { error } = await supabase
        .from('answers')
        .update({
          answer: answer,
          used_count: existingAnswer.used_count + 1,
          page_url: pageUrl || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAnswer.id)

      if (error) throw error
    } else {
      // Insert as a new answer
      const { error } = await supabase
        .from('answers')
        .insert({
          user_id: userId,
          question_hash: hash,
          question_text: question,
          answer: answer,
          page_url: pageUrl || null
        })

      if (error) throw error
    }

    return setCorsHeaders(req, NextResponse.json({ success: true }))

  } catch (error: any) {
    console.error('[API Sync] Error:', error.message)
    return setCorsHeaders(req, NextResponse.json({ error: 'Internal Server Error' }, { status: 500 }))
  }
}
