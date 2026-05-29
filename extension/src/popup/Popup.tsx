import './index.css'
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useExtensionStore } from './store'
import { ResumeUploader } from './components/ResumeUploader'
import { ModelSelector, ToneSelector, CacheStats } from './components/Settings'

import { API_BASE_URL } from '../shared/utils'

function UsageBar({ onUsage }: { onUsage: (usage: any | null) => void }) {
  const [usage, setUsage] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsage() {
      try {
        // On localhost, SameSite=Lax cookies are not sent in cross-site extension requests.
        // We manually read the Clerk session cookie and send it in the Authorization header.
        const cookie = await chrome.cookies.get({
          url: API_BASE_URL,
          name: '__session'
        })

        const headers: Record<string, string> = {}
        if (cookie?.value) {
          headers['Authorization'] = `Bearer ${cookie.value}`
        }

        const res = await fetch(`${API_BASE_URL}/api/usage`, {
          headers,
          // We still keep credentials: 'include' for production environments
          credentials: 'include'
        })

        if (res.status === 401) {
          onUsage(null)
          setLoading(false)
          return
        }

        const data = await res.json()
        setUsage(data)
        onUsage(data)
      } catch (err) {
        console.debug('[Job Hunt Easy] Usage fetch failed:', err)
        onUsage(null)
      } finally {
        setLoading(false)
      }
    }
    fetchUsage()
  }, [])

  if (loading) {
    return <div className="px-4 py-2 text-xs text-gray-400 animate-pulse border-b border-gray-200/60 relative z-10 bg-white/50">Loading limits...</div>
  }

  if (!usage || usage.error) {
    return (
      <div className="px-4 py-2 text-[11px] text-amber-800 bg-amber-50 border-b border-gray-200/60 relative z-10">
        Sign in at <a href={API_BASE_URL} target="_blank" className="underline font-bold text-amber-900">Dashboard</a> to track usage
      </div>
    )
  }

  if (usage.plan === 'pro') {
    return (
      <div className="px-4 py-2.5 flex items-center justify-between text-xs border-b border-gray-200/60 bg-gradient-to-r from-blue-50 to-indigo-50 relative z-10">
        <div className="flex flex-col">
          <span className="text-gray-900 font-bold flex items-center gap-1"><span className="text-blue-600">✦</span> Pro Plan</span>
          {usage.email && <span className="text-[10px] text-gray-500">{usage.email}</span>}
        </div>
        <span className="text-blue-600 font-bold bg-blue-100/50 px-2 py-0.5 rounded-full border border-blue-200 text-[10px] uppercase">Unlimited</span>
      </div>
    )
  }

  const percent = Math.min(100, Math.max(0, (usage.sessions_used / usage.sessions_limit) * 100))

  return (
    <div className="px-4 py-3 border-b border-gray-200/60 bg-white relative z-10">
      <div className="flex justify-between items-start text-xs mb-2">
        <div className="flex flex-col">
          <span className="text-gray-900 font-bold">{usage.sessions_used} / {usage.sessions_limit} applications today</span>
          {usage.email && <span className="text-[10px] text-gray-400 mt-0.5">{usage.email}</span>}
        </div>
        <a href={`${API_BASE_URL}/pricing`} target="_blank" className="text-blue-600 hover:text-blue-700 transition-colors font-bold text-[11px] uppercase tracking-wider">Upgrade →</a>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
        <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all" style={{ width: `${percent}%` }} />
      </div>
      <div className="text-[9px] text-gray-400 mt-2 text-right uppercase tracking-wider font-bold">
        Resets in {usage.reset_in}
      </div>
    </div>
  )
}

function Popup() {
  const { settings, resume, isLoaded, loadFromStorage } = useExtensionStore()
  const [activeTab, setActiveTab] = useState<'settings' | 'resume' | 'cache'>('settings')
  const [accountPlan, setAccountPlan] = useState<'free' | 'pro'>('free')

  useEffect(() => {
    loadFromStorage()
  }, [])

  if (!isLoaded) {
    return (
      <div className="w-80 h-48 flex items-center justify-center">
        <div className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="w-[400px] bg-[#F5F5F7] font-sans text-gray-900 border border-gray-200/80 shadow-2xl relative overflow-hidden">
      {/* Background glow matching landing page premium styling */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.06)_0%,transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200/60 bg-white relative z-10">
        <img
          src="/icons/logo.png"
          alt="Job Hunt Easy"
          className="w-6 h-6 rounded-full object-cover"
        />
        <span className="font-bold text-gray-900 tracking-tight">Job Hunt Easy</span>
        <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border ${
          accountPlan === 'pro'
            ? 'bg-blue-50 text-blue-600 border-blue-200'
            : 'bg-gray-100 text-gray-500 border-gray-200'
        }`}>
          {accountPlan === 'pro' ? 'Pro' : 'Free'}
        </span>
        <span className="ml-auto text-[10px] uppercase tracking-wider font-bold text-gray-400">AI Filler</span>
      </div>

      <UsageBar onUsage={(usage) => setAccountPlan(usage?.plan === 'pro' ? 'pro' : 'free')} />

      {/* Status bar */}
      <div className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 border-b border-gray-200/60 ${
        settings.enabled ? 'bg-emerald-50/50 text-emerald-700' : 'bg-gray-100/50 text-gray-500'
      } relative z-10`}>
        <div className={`w-2 h-2 rounded-full ${settings.enabled ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-gray-400'}`} />
        {settings.enabled ? 'Active on this page' : 'Extension Paused'}
        <button
          onClick={() => useExtensionStore.getState().updateSettings({ enabled: !settings.enabled })}
          className={`ml-auto text-[10px] uppercase tracking-wider px-2 py-1 rounded transition-all font-bold ${
            settings.enabled ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          {settings.enabled ? 'Pause' : 'Enable'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200/60 relative z-10 bg-white">
        {(['settings', 'resume', 'cache'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-all relative ${
              activeTab === tab
                ? 'text-blue-600'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 shadow-[0_2px_8px_rgba(37,99,235,0.4)]" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4 relative z-10 bg-[#F5F5F7]">
        {activeTab === 'settings' && (
          <>
            <ModelSelector plan={accountPlan} />
            <ToneSelector />
          </>
        )}
        {activeTab === 'resume' && <ResumeUploader />}
        {activeTab === 'cache' && <CacheStats />}
      </div>

      {/* Footer */}
      <div className="px-4 py-3.5 border-t border-gray-200/60 bg-gray-50 text-[10px] text-gray-400 text-center space-y-1 relative z-10">
        <div className="font-semibold text-emerald-600/90">✦ 100% Private (No data leaves device)</div>
        <div className="tracking-widest uppercase font-bold text-gray-500">Job Hunt Easy</div>
      </div>
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<React.StrictMode><Popup /></React.StrictMode>)
