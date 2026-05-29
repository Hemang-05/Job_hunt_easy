import React, { useEffect, useState } from 'react'
import { useExtensionStore } from '../store'
import { DEFAULT_SETTINGS, SUPPORTED_MODELS } from '@job-hunt-easy/types'
import type { AnswerTone } from '@job-hunt-easy/types'
import { API_BASE_URL } from '../../shared/utils'

// ─── Model Selector ────────────────────────────────────────

export function ModelSelector({ plan = 'free' }: { plan?: 'free' | 'pro' }) {
  const { settings, updateSettings } = useExtensionStore()
  const [showUpsell, setShowUpsell] = useState(false)

  useEffect(() => {
    const currentModel = SUPPORTED_MODELS.find((m) => m.id === settings.model)
    if (!currentModel || (plan !== 'pro' && !currentModel.free)) {
      updateSettings({ model: DEFAULT_SETTINGS.model })
    }
  }, [plan, settings.model, updateSettings])

  function handleModelChange(modelId: string) {
    const selected = SUPPORTED_MODELS.find((m) => m.id === modelId)

    if (selected && !selected.free && plan !== 'pro') {
      setShowUpsell(true)
      return
    }

    setShowUpsell(false)
    updateSettings({ model: modelId })
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-gray-500">AI Model</label>
      <select
        value={settings.model}
        onChange={(e) => handleModelChange(e.target.value)}
        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-600 bg-white text-gray-900 shadow-sm"
      >
        <optgroup label="Free Models" className="bg-white text-gray-900">
          {SUPPORTED_MODELS.filter(m => m.free).map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </optgroup>
        <optgroup label="Premium Models (Pro)" className="bg-white text-gray-900">
          {SUPPORTED_MODELS.filter(m => !m.free).map((m) => (
            <option key={m.id} value={m.id}>
              {m.label.replace(' (Pro)', '')} {plan === 'pro' ? '✦' : '🔒'}
            </option>
          ))}
        </optgroup>
      </select>

      {showUpsell && (
        <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5">
          <div className="text-xs font-black text-indigo-950 mb-1">Unlock premium AI models</div>
          <p className="text-[11px] text-indigo-700 leading-relaxed mb-3">
            Pro includes premium models, unlimited applications, and no 5-session daily cap.
          </p>
          <button
            onClick={() => chrome.tabs.create({ url: `${API_BASE_URL}/pricing` })}
            className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-[11px] font-black text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            View Pro pricing
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Tone Selector ──────────────────────────────────────────

const TONES: Array<{ value: AnswerTone; label: string; desc: string }> = [
  { value: 'professional', label: 'Professional', desc: 'Formal, confident' },
  { value: 'casual',       label: 'Casual',       desc: 'Warm, conversational' },
  { value: 'concise',      label: 'Concise',      desc: '1-2 sentences max' },
]

export function ToneSelector() {
  const { settings, updateSettings } = useExtensionStore()

  return (
    <div className="space-y-1.5 pt-2">
      <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Answer Tone</label>
      <div className="grid grid-cols-3 gap-2">
        {TONES.map((tone) => (
          <button
            key={tone.value}
            onClick={() => updateSettings({ tone: tone.value })}
            className={`p-2 rounded-lg border text-left transition-all ${
              settings.tone === tone.value
                ? 'border-blue-600 bg-blue-50/50 shadow-[0_0_10px_rgba(37,99,235,0.08)]'
                : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className={`text-[11px] font-bold ${settings.tone === tone.value ? 'text-blue-700' : 'text-gray-700'}`}>
              {tone.label}
            </div>
            <div className={`text-[9px] mt-0.5 leading-tight ${settings.tone === tone.value ? 'text-blue-500/80' : 'text-gray-400'}`}>{tone.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Cache Stats ────────────────────────────────────────────

export function CacheStats() {
  const { answerCache, clearCache } = useExtensionStore()

  const totalAnswers = answerCache.length
  const totalUses = answerCache.reduce((sum, a) => sum + a.usedCount, 0)
  const staleCount = answerCache.filter(
    (a) => a.resumeVersionWhenGenerated < (useExtensionStore.getState().resume?.version ?? 0)
  ).length

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Saved answers', value: totalAnswers },
          { label: 'Total uses',    value: totalUses },
          { label: 'Stale',         value: staleCount },
        ].map(({ label, value }) => (
          <div key={label} className="text-center p-2.5 bg-white border border-gray-200/80 rounded-xl shadow-sm">
            <div className="text-lg font-black text-gray-900">{value}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{label}</div>
          </div>
        ))}
      </div>

      {staleCount > 0 && (
        <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-2.5 rounded-lg font-semibold leading-relaxed">
          {staleCount} answer{staleCount > 1 ? 's were' : ' was'} generated with an older resume version.
          They'll be flagged when used.
        </div>
      )}

      {totalAnswers > 0 ? (
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to clear all cached answers? This cannot be undone.')) {
              clearCache()
            }
          }}
          className="w-full text-[11px] font-bold uppercase tracking-wider text-red-600 hover:text-red-700 border border-red-200 rounded-lg py-2.5 bg-white hover:bg-red-50 transition-colors shadow-sm"
        >
          Clear all cached answers
        </button>
      ) : (
        <p className="text-xs text-gray-400 text-center py-4 italic font-bold">
          No answers cached yet. Fill a form field to get started.
        </p>
      )}
    </div>
  )
}
