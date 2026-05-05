import { Suspense } from 'react'
import { currentUser } from '@clerk/nextjs/server'
import { createUserClient } from '@/lib/supabase/server'
import Loading from './loading'
import ExtensionBanner from './ExtensionBanner'
import Link from 'next/link'
import { Sparkles, Zap, Star } from 'lucide-react'

export default async function DashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardContent />
    </Suspense>
  )
}

async function DashboardContent() {
  const user = await currentUser()
  let client, userId

  let answers: any[] = []
  let totalAnswers = 0
  let topAnswer = null
  let totalUses = 0

  try {
    const result = await createUserClient()
    client = result.client
    userId = result.userId

    // 1. Get 5 most recent answers
    const { data: recentData } = await client
      .from('answers')
      .select('id, question_text, answer, used_count, page_url, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(5)
    
    if (recentData) answers = recentData

    // 2. Get total answer count
    const { count } = await client
      .from('answers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    
    if (count) totalAnswers = count

    // 3. Get single most-used answer
    const { data: topData } = await client
      .from('answers')
      .select('question_text, used_count')
      .eq('user_id', userId)
      .order('used_count', { ascending: false })
      .limit(1)
      .maybeSingle()
    
    if (topData) topAnswer = topData

    // 4. Calculate total uses (sum of used_count across all answers)
    const { data: usesData } = await client
      .from('answers')
      .select('used_count')
      .eq('user_id', userId)
    
    if (usesData) {
      totalUses = usesData.reduce((sum: number, a: { used_count: number }) => sum + (a.used_count || 0), 0)
    }

  } catch (err) {
    console.error('[Dashboard] Error fetching from Supabase:', err)
  }

  return (
    <div className="max-w-5xl space-y-10">
      <ExtensionBanner />
      
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-white/50 mt-2 text-sm font-medium">
          Here&apos;s how Job Hunt Easy is supercharging your applications.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Saved answers',  value: totalAnswers,  sub: 'Total in library', icon: <Sparkles className="w-5 h-5 text-indigo-400" /> },
          { label: 'Total uses',     value: totalUses,           sub: 'Fields filled', icon: <Zap className="w-5 h-5 text-indigo-400" /> },
          { label: 'Top question',   value: topAnswer?.used_count ?? 0, sub: topAnswer?.question_text ? topAnswer.question_text.slice(0, 20) + '…' : 'None yet', icon: <Star className="w-5 h-5 text-indigo-400" /> },
        ].map(({ label, value, sub, icon }) => (
          <div key={label} className="glass-tile p-6 relative group">
            <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-100 transition-opacity">
              {icon}
            </div>
            <div className="text-4xl font-black text-white mb-1">{value}</div>
            <div className="text-sm font-bold text-white/80">{label}</div>
            <div className="text-xs text-white/40 mt-1 font-medium">{sub}</div>
          </div>
        ))}
      </div>

      {/* Recent answers */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Recent Answers</h2>
          <Link href="/dashboard/answers" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            View all library →
          </Link>
        </div>

        {answers && answers.length > 0 ? (
          <div className="grid gap-4">
            {answers.map((answer) => (
              <div
                key={answer.id}
                className="glass-tile p-5 hover:translate-x-1"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white mb-1 truncate">
                      {answer.question_text}
                    </div>
                    <div className="text-xs text-white/50 line-clamp-1 font-medium leading-relaxed">
                      {answer.answer}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xs font-black text-indigo-400 uppercase tracking-wider">
                      {answer.used_count} uses
                    </div>
                    <div className="text-[10px] text-white/30 mt-1 font-bold uppercase tracking-tighter">
                      {answer.page_url
                        ? new URL(answer.page_url).hostname
                        : 'Unknown site'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-tile p-12 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white/20" />
            </div>
            <div className="text-lg font-bold text-white">No answers yet</div>
            <p className="text-sm text-white/40 mt-2 max-w-xs mx-auto font-medium">
              Open any job application and use the Job Hunt Easy button to start saving time.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
