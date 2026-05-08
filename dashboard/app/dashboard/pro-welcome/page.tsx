import Link from 'next/link'
import { CheckCircle, Sparkles, Zap, Brain, ArrowRight } from 'lucide-react'
import { createUserClient } from '@/lib/supabase/server'
import URLCleaner from './URLCleaner'

const PRO_BENEFITS = [
  {
    title: 'Unlimited applications',
    description: 'Fill as many job applications as you want without the daily free limit.',
    icon: <Zap className="w-5 h-5 text-indigo-300" />,
  },
  {
    title: 'Premium AI models',
    description: 'Use faster and smarter models for stronger answers on long forms.',
    icon: <Brain className="w-5 h-5 text-indigo-300" />,
  },
  {
    title: 'Priority workflow',
    description: 'Keep moving through Workday, Greenhouse, Lever, and other job boards.',
    icon: <Sparkles className="w-5 h-5 text-indigo-300" />,
  },
]

export default async function ProWelcomePage() {
  let plan = 'free'

  try {
    const { client, userId } = await createUserClient()
    const { data: profile } = await client
      .from('profiles')
      .select('plan')
      .eq('user_id', userId)
      .maybeSingle()

    plan = profile?.plan === 'pro' ? 'pro' : 'free'
  } catch {
    plan = 'free'
  }

  const isPro = plan === 'pro'

  return (
    <div className="max-w-4xl space-y-8">
      <URLCleaner />
      <div className="glass-tile p-10 sm:p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-9 h-9 text-emerald-300" />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-indigo-200 mb-5">
          {isPro ? 'Pro is active' : 'Payment received'}
        </div>

        <h1 className="text-4xl font-black tracking-tight text-white mb-4">
          {isPro ? 'Welcome to Pro' : 'Welcome to Pro'}
        </h1>
        <p className="text-white/55 max-w-2xl mx-auto leading-relaxed font-medium">
          {isPro
            ? 'You now have unlimited autofill sessions and premium AI models. Open a job application, choose the model you want, and keep applying without hitting the free limit.'
            : 'Your payment was successful. Your Pro access is being activated by the payment webhook and should appear in a moment. You can still head back to your workflow now.'}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/install"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-black text-[#1A1953] hover:bg-slate-100 transition-colors"
          >
            Start filling applications
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {PRO_BENEFITS.map((benefit) => (
          <div key={benefit.title} className="glass-tile p-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-400/20 flex items-center justify-center mb-4">
              {benefit.icon}
            </div>
            <h2 className="text-white font-black mb-2">{benefit.title}</h2>
            <p className="text-sm text-white/45 font-medium leading-relaxed">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
