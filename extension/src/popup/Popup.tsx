import './index.css'
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useExtensionStore } from './store'
import { ResumeUploader } from './components/ResumeUploader'
import { ModelSelector, ToneSelector, CacheStats } from './components/Settings'

import { API_BASE_URL } from '../shared/utils'

function UsageBar() {
  const [usage, setUsage] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsage() {
      try {
        // Read Clerk's session cookie from the dashboard domain
        const cookie = await chrome.cookies.get({
          url: API_BASE_URL,
          name: '__session'
        })

        if (!cookie?.value) {
          // Not signed in to dashboard
          setLoading(false)
          return
        }

        const res = await fetch(`${API_BASE_URL}/api/usage`, {
          headers: {
            'Cookie': `__session=${cookie.value}`
          }
        })
        const data = await res.json()
        setUsage(data)
      } catch (err) {
        console.debug('[Job Hunt Easy] Usage fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUsage()
  }, [])

  if (loading) {
    return <div className="px-4 py-2 text-xs text-white/50 animate-pulse border-b border-white/5 relative z-10 bg-black/20">Loading limits...</div>
  }

  if (!usage || usage.error) {
    return (
      <div className="px-4 py-2 text-[11px] text-amber-500/80 bg-amber-500/10 border-b border-white/5 relative z-10">
        Sign in at <a href="https://job-hunt-easy-dashboard.vercel.app" target="_blank" className="underline">Dashboard</a> to track usage
      </div>
    )
  }

  if (usage.plan === 'pro') {
    return (
      <div className="px-4 py-2 flex items-center justify-between text-xs border-b border-white/5 bg-gradient-to-r from-[#2F2FE4]/20 to-purple-500/20 relative z-10">
        <span className="text-white font-medium flex items-center gap-1"><span className="text-emerald-400">✦</span> Pro Plan</span>
        <span className="text-white/60">Unlimited applications</span>
      </div>
    )
  }

  const percent = Math.min(100, Math.max(0, (usage.sessions_used / usage.sessions_limit) * 100))

  return (
    <div className="px-4 py-2.5 border-b border-white/5 bg-white/5 relative z-10">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-white/90 font-medium">{usage.sessions_used} / {usage.sessions_limit} applications today</span>
        <a href="https://job-hunt-easy-dashboard.vercel.app/pricing" target="_blank" className="text-[#6366f1] hover:text-white transition-colors font-bold">Upgrade →</a>
      </div>
      <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/10">
        <div className="h-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] transition-all" style={{ width: `${percent}%` }} />
      </div>
      <div className="text-[10px] text-white/40 mt-1.5 text-right uppercase tracking-wider font-bold">
        Resets in {usage.reset_in}
      </div>
    </div>
  )
}

function Popup() {
  const { settings, resume, isLoaded, loadFromStorage } = useExtensionStore()
  const [activeTab, setActiveTab] = useState<'settings' | 'resume' | 'cache'>('settings')

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
    <div className="w-80 bg-[#080616] font-sans text-[#E0E4F5] border border-white/10 shadow-2xl relative overflow-hidden">
      {/* Background glow to match the premium feel */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(47,47,228,0.2)_0%,transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 relative z-10">
        <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-white text-[10px] font-black border border-white/20">
          J
        </div>
        <span className="font-bold text-white">Job Hunt Easy</span>
        <span className="ml-auto text-[10px] uppercase tracking-wider font-bold text-white/40">AI Filler</span>
      </div>

      <UsageBar />

      {/* Status bar */}
      <div className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 border-b border-white/5 ${
        settings.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/50'
      } relative z-10`}>
        <div className={`w-2 h-2 rounded-full ${settings.enabled ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-white/30'}`} />
        {settings.enabled ? 'Active on this page' : 'Extension Paused'}
        <button
          onClick={() => useExtensionStore.getState().updateSettings({ enabled: !settings.enabled })}
          className={`ml-auto text-[10px] uppercase tracking-wider px-2 py-1 rounded transition-colors ${
            settings.enabled ? 'bg-emerald-500/20 hover:bg-emerald-500/30' : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          {settings.enabled ? 'Pause' : 'Enable'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 relative z-10 bg-black/20">
        {(['settings', 'resume', 'cache'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all relative ${
              activeTab === tab
                ? 'text-white'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2F2FE4] shadow-[0_0_8px_rgba(47,47,228,0.8)]" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 relative z-10 bg-[#080616]/50">
        {activeTab === 'settings' && (
          <>
            <ModelSelector />
            <ToneSelector />
          </>
        )}
        {activeTab === 'resume' && <ResumeUploader />}
        {activeTab === 'cache' && <CacheStats />}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10 bg-black/40 text-[10px] text-white/30 text-center space-y-1 relative z-10">
        <div className="font-medium text-emerald-500/80">✦ 100% Private (No data leaves device)</div>
        <div className="tracking-widest uppercase">Job Hunt Easy</div>
      </div>
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<React.StrictMode><Popup /></React.StrictMode>)
