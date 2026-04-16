import React from 'react'
import { useExtensionStore } from '../store'
import { SUPPORTED_MODELS } from '@fillr/types'
import type { AnswerTone } from '@fillr/types'

// ─── Model Selector ────────────────────────────────────────

export function ModelSelector() {
  const { settings, updateSettings } = useExtensionStore()

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-700">AI Model</label>
      <select
        value={settings.model}
        onChange={(e) => updateSettings({ model: e.target.value })}
        className="w-full text-xs border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
      >
        {SUPPORTED_MODELS.map((m) => (
          <option key={m.id} value={m.id}>{m.label}</option>
        ))}
      </select>
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
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-700">Answer Tone</label>
      <div className="grid grid-cols-3 gap-1.5">
        {TONES.map((tone) => (
          <button
            key={tone.value}
            onClick={() => updateSettings({ tone: tone.value })}
            className={`p-2 rounded-md border text-left transition-colors ${
              settings.tone === tone.value
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`text-xs font-medium ${settings.tone === tone.value ? 'text-indigo-700' : 'text-gray-700'}`}>
              {tone.label}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{tone.desc}</div>
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
          <div key={label} className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-800">{value}</div>
            <div className="text-xs text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      {staleCount > 0 && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md">
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
          className="w-full text-xs text-red-500 hover:text-red-600 border border-red-200 rounded-md py-2 hover:bg-red-50 transition-colors"
        >
          Clear all cached answers
        </button>
      ) : (
        <p className="text-xs text-gray-400 text-center py-2">
          No answers cached yet. Fill a form field to get started.
        </p>
      )}
    </div>
  )
}
