'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MessageSquare, Star, Send, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function UninstallPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500))
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
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-white tracking-tight">Thank you for the feedback</h1>
            <p className="text-white/50 font-medium leading-relaxed">
              We&apos;ve received your survey. Your input helps us make Job Hunt Easy better for everyone.
            </p>
          </div>
          <div className="pt-8">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080616] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full relative z-10">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white/40 tracking-widest uppercase mb-4">
            Survey
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">We&apos;re sorry to see you go</h1>
          <p className="text-white/50 text-lg font-medium leading-relaxed">
            Could you help us improve with a 30 second survey?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-tile p-10 space-y-8">
          <div className="grid grid-cols-1 gap-8">
            {/* Reason Dropdown */}
            <div className="space-y-3">
              <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">
                What made you uninstall?*
              </label>
              <div className="relative group">
                <select 
                  required
                  className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-4 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium group-hover:bg-white/[0.08]"
                >
                  <option value="" className="bg-[#0d1c30]">Select a reason...</option>
                  <option value="technical" className="bg-[#0d1c30]">Technical issues / Bugs</option>
                  <option value="difficult" className="bg-[#0d1c30]">Too difficult to use</option>
                  <option value="missing" className="bg-[#0d1c30]">Missing key features</option>
                  <option value="expensive" className="bg-[#0d1c30]">Too expensive</option>
                  <option value="other" className="bg-[#0d1c30]">Found a better alternative</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                  <MessageSquare className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Ease of Use Dropdown */}
            <div className="space-y-3">
              <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">
                How would you rate our ease of use?*
              </label>
              <div className="relative group">
                <select 
                  required
                  className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-4 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium group-hover:bg-white/[0.08]"
                >
                  <option value="" className="bg-[#0d1c30]">Select a rating...</option>
                  <option value="5" className="bg-[#0d1c30]">5 - Excellent</option>
                  <option value="4" className="bg-[#0d1c30]">4 - Very Good</option>
                  <option value="3" className="bg-[#0d1c30]">3 - Average</option>
                  <option value="2" className="bg-[#0d1c30]">2 - Poor</option>
                  <option value="1" className="bg-[#0d1c30]">1 - Very Poor</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                  <Star className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Features Textarea */}
            <div className="space-y-3">
              <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">
                Issue and/or missing features
              </label>
              <textarea 
                placeholder="Tell us more about your experience..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium hover:bg-white/[0.08] resize-none"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-3">
              <label className="text-xs font-black text-white/40 uppercase tracking-widest ml-1">
                Your email (optional)
              </label>
              <input 
                type="email"
                placeholder="email@example.com"
                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium hover:bg-white/[0.08]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-[#1A1953] font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-[#1A1953]/20 border-t-[#1A1953] rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Feedback
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-12 text-white/20 text-xs font-bold tracking-widest uppercase">
          &copy; {new Date().getFullYear()} Job Hunt Easy. All rights reserved.
        </p>
      </div>
    </div>
  )
}
