import { Suspense } from 'react'
import { currentUser } from '@clerk/nextjs/server'
import { createUserClient } from '@/lib/supabase/server'
import Loading from './loading'
import ExtensionBanner from './ExtensionBanner'
import Link from 'next/link'

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
    <div className="max-w-4xl space-y-8">
      <ExtensionBanner />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName} 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Here's what Fillr has saved you this month.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Saved answers',  value: totalAnswers,  sub: 'total in library' },
          { label: 'Total uses',     value: totalUses,           sub: 'fields filled' },
          { label: 'Top question',   value: topAnswer?.used_count ?? 0, sub: topAnswer?.question_text ? topAnswer.question_text.slice(0, 24) + '…' : 'none yet' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="text-3xl font-bold text-gray-900">{value}</div>
            <div className="text-sm font-medium text-gray-700 mt-1">{label}</div>
            <div className="text-xs text-gray-400 mt-0.5 truncate">{sub}</div>
          </div>
        ))}
      </div>

      {/* Recent answers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent answers</h2>
          <Link href="/dashboard/answers" className="text-sm text-indigo-600 hover:underline">
            View all →
          </Link>
        </div>

        {answers && answers.length > 0 ? (
          <div className="space-y-3">
            {answers.map((answer) => (
              <div
                key={answer.id}
                className="bg-white rounded-xl p-4 border border-gray-100"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {answer.question_text}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {answer.answer}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xs font-medium text-indigo-600">
                      {answer.used_count}×
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {answer.page_url
                        ? new URL(answer.page_url).hostname
                        : 'unknown site'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 border border-gray-100 text-center">
            <div className="text-3xl mb-3">✦</div>
            <div className="text-sm font-medium text-gray-700">No answers yet</div>
            <div className="text-xs text-gray-400 mt-1">
              Open a job application and click the Fillr button on any form field.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
