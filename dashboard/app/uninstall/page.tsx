'use client'

import { useState } from 'react'
import { Send, CheckCircle2, RefreshCw, Heart, Zap, Bug, Lightbulb, DollarSign, LayoutGrid } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const CHROME_STORE_URL = 'https://chrome.google.com/webstore/detail/job-hunt-easy/YOUR_EXTENSION_ID'

const REASONS = [
  { value: 'technical', label: 'Had bugs or technical issues', icon: Bug },
  { value: 'difficult', label: 'Too difficult to use', icon: LayoutGrid },
  { value: 'missing', label: 'Missing features I need', icon: Lightbulb },
  { value: 'expensive', label: 'Pricing felt too high', icon: DollarSign },
  { value: 'alternative', label: 'Found a better alternative', icon: Zap },
]

export default function UninstallPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedReason, setSelectedReason] = useState('')
  const [feedback, setFeedback] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1200))
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#080616] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-[32px] flex items-center justify-center mx-auto border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-white tracking-tight">Thank you for your feedback</h1>
            <p className="text-white/50 font-medium leading-relaxed">
              We genuinely read every response. Your input helps us build something better.
            </p>
          </div>
          <div className="pt-4 space-y-3">
            <a
              href={CHROME_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3.5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4" />
              Reactivate Extension
            </a>
            <Link
              href="/"
              className="block text-center text-white/30 hover:text-white/60 text-sm font-medium transition-colors py-2"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080616] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-lg w-full relative z-10">
        {/* Logo + Header */}
        <div className="text-center mb-10 space-y-5">
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Job Hunt Easy"
              width={64}
              height={64}
              className="rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.3)]"
            />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 text-xs font-bold tracking-widest uppercase">
              <Heart className="w-3 h-3" />
              We&apos;ll Miss You
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
              Please Stay — We&apos;re<br />
              <span className="text-indigo-400">Getting Better</span>
            </h1>
            <p className="text-white/50 text-base font-medium leading-relaxed max-w-sm mx-auto">
              We&apos;re actively improving Job Hunt Easy every week. Your feedback helps us fix what matters most.
            </p>
          </div>

          {/* Reactivate CTA — prominent above feedback form */}
          <a
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-8 py-3.5 rounded-2xl transition-all hover:scale-[1.03] active:scale-[0.98] shadow-[0_8px_30px_rgba(99,102,241,0.3)]"
          >
            <RefreshCw className="w-4 h-4" />
            Reactivate Extension
          </a>
        </div>

        {/* Feedback Form */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 space-y-6">
          <p className="text-xs font-black text-white/30 uppercase tracking-widest text-center">
            Or help us improve — 30 second survey
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reason pills */}
            <div className="space-y-3">
              <label className="text-xs font-black text-white/40 uppercase tracking-widest">
                Why did you uninstall?
              </label>
              <div className="grid grid-cols-1 gap-2">
                {REASONS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelectedReason(value)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-left text-sm font-medium transition-all ${
                      selectedReason === value
                        ? 'border-indigo-500/60 bg-indigo-500/15 text-white'
                        : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white/80 hover:bg-white/[0.06]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${selectedReason === value ? 'text-indigo-400' : 'text-white/30'}`} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Open feedback */}
            <div className="space-y-2">
              <label className="text-xs font-black text-white/40 uppercase tracking-widest">
                Anything else you&apos;d like us to know?
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what we can improve..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/40 transition-all text-sm font-medium hover:bg-white/[0.07] resize-none placeholder-white/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white/10 hover:bg-white/15 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 border border-white/10"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Feedback
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-white/15 text-xs font-bold tracking-widest uppercase">
          © {new Date().getFullYear()} Job Hunt Easy
        </p>
      </div>
    </div>
  )
}
