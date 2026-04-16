import './index.css'
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useExtensionStore } from './store'
import { ResumeUploader } from './components/ResumeUploader'
import { ModelSelector, ToneSelector, CacheStats } from './components/Settings'

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
    <div className="w-80 bg-white font-sans">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <span className="text-indigo-600 text-lg">✦</span>
        <span className="font-semibold text-gray-900">Fillr</span>
        <span className="ml-auto text-xs text-gray-400">AI Form Filler</span>
      </div>

      {/* Status bar */}
      <div className={`px-4 py-2 text-xs font-medium flex items-center gap-2 ${
        settings.enabled ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
      }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${settings.enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
        {settings.enabled ? 'Active on this page' : 'Paused'}
        <button
          onClick={() => useExtensionStore.getState().updateSettings({ enabled: !settings.enabled })}
          className="ml-auto text-xs underline"
        >
          {settings.enabled ? 'Pause' : 'Enable'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {(['settings', 'resume', 'cache'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
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
      <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400 text-center">
        Resume stays on your device. Never uploaded.
      </div>
    </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<React.StrictMode><Popup /></React.StrictMode>)
