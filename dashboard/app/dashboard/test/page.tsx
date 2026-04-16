import { currentUser, auth } from '@clerk/nextjs/server'
import { createClient, createUserClient } from '@/lib/supabase/server'

export default async function TestChecklistPage() {
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="p-8 text-red-500">
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
      authMessage = `Authenticated as ${user.id} (${user.emailAddresses[0]?.emailAddress})`
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
      supabaseMessage = `Connected to database via Service Role. Counted ${count ?? 0} answers (all users).`
    }
  } catch (e: any) {
    supabaseMessage = `Supabase client error: ${e.message || JSON.stringify(e)}`
  }

  // 3. API Check - Resume Sync
  let resumeApiValid = false
  let resumeApiMessage = ''
  try {
    const res = await fetch('http://localhost:3000/api/resume/sync', { method: 'POST', body: '{}' })
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
    const res = await fetch('http://localhost:3000/api/answers/sync', { method: 'POST', body: '{}' })
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
      color: 'bg-indigo-500',
      icon: '👤'
    },
    { 
      title: 'Supabase DB', 
      valid: supabaseValid, 
      message: supabaseMessage,
      color: 'bg-[#3ecf8e]',
      icon: '⚡'
    },
    { 
      title: 'Resume API (/api/resume/sync)', 
      valid: resumeApiValid, 
      message: resumeApiMessage,
      color: 'bg-amber-500',
      icon: '📄'
    },
    { 
      title: 'Answers API (/api/answers/sync)', 
      valid: answersApiValid, 
      message: answersApiMessage,
      color: 'bg-blue-500',
      icon: '⌨'
    },
  ]

  return (
    <div className="max-w-3xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          Developer Checklist
          <span className="text-xs font-normal bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">DEV MODE</span>
        </h1>
        <p className="text-gray-500 mt-1">Live status of Fillr internal services.</p>
      </div>

      <div className="bg-white border text-sm border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50 shadow-sm">
        {checks.map((check, i) => (
          <div key={i} className="p-5 flex items-start gap-4 hover:bg-gray-50 transition-colors">
            <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0 ${
              check.valid ? check.color : 'bg-gray-200'
            }`}>
              {check.valid ? check.icon : '×'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-semibold text-gray-900">{check.title}</div>
                {check.valid ? (
                  <span className="text-[10px] uppercase tracking-wider font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Operational</span>
                ) : (
                  <span className="text-[10px] uppercase tracking-wider font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Issue Detected</span>
                )}
              </div>
              <div className={`mt-2 font-mono text-xs p-3 rounded-lg border whitespace-pre-wrap ${
                check.valid 
                  ? 'bg-gray-50 border-gray-100 text-gray-700' 
                  : 'bg-red-50 border-red-100 text-red-700 font-medium shadow-sm'
              }`}>
                {check.message}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!supabaseValid && (
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
          <h3 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
            <span>💡</span> How to make Supabase "Green"?
          </h3>
          <ul className="mt-2 text-xs text-amber-700 space-y-1.5 list-disc ml-4">
            <li>Ensure <b>NEXT_PUBLIC_SUPABASE_URL</b> and <b>NEXT_PUBLIC_SUPABASE_ANON_KEY</b> are in <code className="bg-amber-100/50 px-1 rounded">.env.local</code></li>
            <li>In Supabase, run the queries in <code className="bg-amber-100/50 px-1 rounded">dashboard/supabase-schema.sql</code> to create tables and RLS policies.</li>
            <li>In Clerk Dashboard, create a <b>JWT Template</b> named <code className="bg-amber-100/50 px-1 rounded">supabase</code>.</li>
          </ul>
        </div>
      )}
    </div>
  )
}
