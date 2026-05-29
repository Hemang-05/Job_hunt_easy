import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import { LayoutDashboard, Database, FileCode, CheckCircle2, AlertCircle } from 'lucide-react'
import { headers } from 'next/headers'

export default async function TestChecklistPage() {
  const host = headers().get('host')
  const protocol = host?.includes('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`

  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="p-8 text-red-500 font-bold">
        This page is only available in development mode.
      </div>
    )
  }

  // 1. Clerk Check
  let clerkValid = false
  let authMessage = ''
  try {
    const user = await currentUser()
    if (user) {
      clerkValid = true
      authMessage = `Authenticated as ${user.id}\n${user.emailAddresses[0]?.emailAddress}`
    } else {
      authMessage = 'Not authenticated'
    }
  } catch (e: any) {
    authMessage = `Clerk error: ${e.message}`
  }

  // 2. Supabase Check
  let supabaseValid = false
  let supabaseMessage = ''
  try {
    const supabase = createClient()
    const { count, error } = await supabase
      .from('answers')
      .select('*', { count: 'exact', head: true })

    if (error) {
      supabaseMessage = `Supabase error: ${JSON.stringify(error, null, 2)}`
    } else {
      supabaseValid = true
      supabaseMessage = `Connected to database via Service Role.\nCounted ${count ?? 0} answers (all users).`
    }
  } catch (e: any) {
    supabaseMessage = `Supabase client error: ${e.message || JSON.stringify(e)}`
  }

  // 3. API Check - Resume Sync
  let resumeApiValid = false
  let resumeApiMessage = ''
  try {
    const res = await fetch(`${baseUrl}/api/resume/sync`, { method: 'POST', body: '{}' })
    if (res.status === 404) {
      resumeApiMessage = 'Route not found (404)'
    } else {
      resumeApiValid = true
      resumeApiMessage = `Route exists (returned status ${res.status})`
    }
  } catch (e: any) {
    resumeApiMessage = `Fetch failed: ${e.message}`
  }

  // 4. API Check - Answers Sync
  let answersApiValid = false
  let answersApiMessage = ''
  try {
    const res = await fetch(`${baseUrl}/api/answers/sync`, { method: 'POST', body: '{}' })
    if (res.status === 404) {
      answersApiMessage = 'Route not found (404)'
    } else {
      answersApiValid = true
      answersApiMessage = `Route exists (returned status ${res.status})`
    }
  } catch (e: any) {
    answersApiMessage = `Fetch failed: ${e.message}`
  }

  const checks = [
    { 
      title: 'Clerk Auth', 
      valid: clerkValid, 
      message: authMessage,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    { 
      title: 'Supabase DB', 
      valid: supabaseValid, 
      message: supabaseMessage,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      icon: <Database className="w-5 h-5" />
    },
    { 
      title: 'Resume API Sync', 
      valid: resumeApiValid, 
      message: resumeApiMessage,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      icon: <FileCode className="w-5 h-5" />
    },
    { 
      title: 'Answers API Sync', 
      valid: answersApiValid, 
      message: answersApiMessage,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      icon: <FileCode className="w-5 h-5" />
    },
  ]

  return (
    <div className="max-w-5xl space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Status</h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">Live status of Job Hunt Easy internal services.</p>
        </div>
        <div className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-[10px] font-black text-gray-500 tracking-widest uppercase">
          Dev Mode Active
        </div>
      </div>

      <div className="glass-tile overflow-hidden divide-y divide-gray-100 bg-white">
        {checks.map((check, i) => (
          <div key={i} className="p-8 flex items-start gap-6 hover:bg-gray-50/50 transition-colors group">
            <div className={`mt-1 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              check.valid ? `${check.bg} ${check.color}` : 'bg-gray-50 text-gray-300'
            }`}>
              {check.valid ? check.icon : <AlertCircle className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="font-bold text-gray-900 text-lg tracking-tight">{check.title}</div>
                {check.valid ? (
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Operational
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[10px] font-black text-red-700 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-200">
                    <AlertCircle className="w-3 h-3" /> Issue Detected
                  </div>
                )}
              </div>
              <div className={`font-mono text-[11px] p-5 rounded-2xl border transition-all ${
                check.valid 
                  ? 'bg-gray-50 border-gray-100 text-gray-500' 
                  : 'bg-red-50 border-red-100 text-red-700 font-medium'
              }`}>
                {check.message}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!supabaseValid && (
        <div className="bg-amber-50 border border-amber-200 p-8 rounded-3xl">
          <h3 className="text-sm font-black text-amber-800 uppercase tracking-widest flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5" /> Database Configuration Required
          </h3>
          <ul className="text-xs text-gray-600 space-y-3 font-medium">
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
              Check <code className="bg-gray-150 px-1.5 py-0.5 rounded text-amber-900 border border-gray-200">.env.local</code> for Supabase keys.
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
              Run the schema in <code className="bg-gray-150 px-1.5 py-0.5 rounded text-amber-900 border border-gray-200">supabase-schema.sql</code>.
            </li>
            <li className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
              Verify Clerk JWT template named <code className="bg-gray-150 px-1.5 py-0.5 rounded text-amber-900 border border-gray-200">supabase</code>.
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
