'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Zap, X, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

const FREE_FEATURES = [
  { text: '5 autofill sessions per day', included: true },
  { text: 'Works on Workday, Greenhouse, Lever', included: true },
  { text: 'Resume-based autofill', included: true },
  { text: 'Unlimited sessions', included: false },
  { text: 'Priority AI models', included: false },
  { text: 'Early access to new features', included: false },
]

const PRO_FEATURES = [
  { text: 'Unlimited autofill sessions', included: true },
  { text: 'Works on Workday, Greenhouse, Lever', included: true },
  { text: 'Resume-based autofill', included: true },
  { text: 'Priority AI models', included: true },
  { text: 'Early access to new features', included: true },
  { text: 'Priority support', included: true },
]

async function createCheckoutSession(userId: string): Promise<string> {
  const res = await fetch('/api/checkout/dodo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to create checkout session')
  }

  const { checkoutUrl } = await res.json()
  return checkoutUrl
}

interface PricingClientProps {
  initialUser: {
    id: string
    email: string
  } | null
  initialPlan: 'free' | 'pro' | null
}

export default function PricingClient({ initialUser, initialPlan }: PricingClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<'free' | 'pro' | null>(initialPlan)
  const [error, setError] = useState<string | null>(null)

  // Sync plan if user is logged in but plan is null
  useEffect(() => {
    if (!initialUser || plan !== null) return

    async function loadPlan() {
      try {
        const res = await fetch('/api/usage')
        if (res.ok) {
          const data = await res.json()
          setPlan(data.plan === 'pro' ? 'pro' : 'free')
        } else {
          setPlan('free')
        }
      } catch {
        setPlan('free')
      }
    }
    loadPlan()
  }, [initialUser, plan])

  async function handleUpgrade() {
    if (!initialUser) {
      router.push('/sign-up?redirect_url=/pricing')
      return
    }

    if (plan === 'pro') {
      router.push('/dashboard/pro-welcome')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const checkoutUrl = await createCheckoutSession(initialUser.id)
      window.location.href = checkoutUrl
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const isPro = plan === 'pro'

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-4 py-20">
      {/* Back to Dashboard */}
      <div className="w-full max-w-3xl mb-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm font-medium transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Dashboard
        </button>
      </div>

      <div className="text-center mb-14">
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="Job Hunt Easy" width={48} height={48} className="rounded-xl" />
        </div>
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-indigo-400 text-sm font-medium mb-6">
          <Zap className="w-3.5 h-3.5" />
          Simple pricing
        </div>
        <h1 className="text-4xl md:text-5xl font-800 tracking-tight mb-4">
          Apply faster, <span className="text-indigo-400">without limits</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Upgrade to Pro and never hit the daily limit again.
        </p>

        {initialUser && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-gray-300">
            <span>{initialUser.email}</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 font-bold uppercase tracking-wider text-white">
              {isPro ? 'Pro' : 'Free'}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* Free Plan */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 flex flex-col">
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Free</p>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-700">$0</span>
              <span className="text-gray-500 mb-1">/month</span>
            </div>
            <p className="text-gray-500 text-sm mt-2">Get started, no card needed</p>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {FREE_FEATURES.map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-sm">
                {f.included ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-gray-600 shrink-0" />
                )}
                <span className={f.included ? 'text-gray-300' : 'text-gray-600'}>
                  {f.text}
                </span>
              </li>
            ))}
          </ul>

          <button
            disabled={!!initialUser}
            onClick={() => router.push('/sign-up?redirect_url=/dashboard')}
            className="w-full rounded-xl py-3 text-sm font-600 bg-white/5 text-gray-500 border border-white/10 disabled:cursor-not-allowed enabled:cursor-pointer enabled:hover:bg-white/10 enabled:text-white"
          >
            {initialUser ? (isPro ? 'Included with Pro' : 'Current plan') : 'Start free'}
          </button>
        </div>

        {/* Pro Plan */}
        <div className="rounded-2xl border border-indigo-500/40 bg-indigo-500/[0.07] p-8 flex flex-col relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-medium text-indigo-400 uppercase tracking-wider">Pro</p>
              <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full border border-indigo-500/30">
                Best for active job seekers
              </span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-700">$9.99</span>
              <span className="text-gray-400 mb-1">/month</span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Cancel anytime</p>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {PRO_FEATURES.map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-sm">
                <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-gray-200">{f.text}</span>
              </li>
            ))}
          </ul>

          {error && (
            <p className="text-red-400 text-xs mb-3 text-center">{error}</p>
          )}

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full rounded-xl py-3 text-sm font-600 bg-indigo-500 text-white flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4" />
            {loading ? 'Starting checkout...' : isPro ? 'Manage Subscription' : 'Upgrade to Pro'}
          </button>

          <p className="text-center text-gray-600 text-xs mt-3">
            Secure checkout by Dodo Payments
          </p>
        </div>
      </div>

      <div className="mt-16 max-w-lg w-full space-y-4 text-sm text-gray-500 text-center">
        <p>Your plan upgrades instantly after payment</p>
        <p>Cancel anytime from your account settings</p>
        <p>Limits reset daily at midnight UTC on the free plan</p>
      </div>
    </main>
  )
}
