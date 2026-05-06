import React from 'react'
import { useExtensionStore } from '../store'
import { SUPPORTED_MODELS } from '@job-hunt-easy/types'
import type { AnswerTone } from '@job-hunt-easy/types'

// ─── Model Selector ────────────────────────────────────────

export function ModelSelector() {
  const { settings, updateSettings } = useExtensionStore()

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-white/50">AI Model</label>
      <select
        value={settings.model}
        onChange={(e) => updateSettings({ model: e.target.value })}
        className="w-full text-xs border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2F2FE4] bg-black/40 text-white shadow-inner"
      >
        {SUPPORTED_MODELS.map((m) => (
          <option key={m.id} value={m.id} className="bg-[#080616]">{m.label}</option>
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
    <div className="space-y-1.5 pt-2">
      <label className="text-xs font-bold uppercase tracking-widest text-white/50">Answer Tone</label>
      <div className="grid grid-cols-3 gap-2">
        {TONES.map((tone) => (
          <button
            key={tone.value}
            onClick={() => updateSettings({ tone: tone.value })}
            className={`p-2 rounded-lg border text-left transition-all ${
              settings.tone === tone.value
                ? 'border-[#2F2FE4] bg-[#2F2FE4]/10 shadow-[0_0_10px_rgba(47,47,228,0.3)]'
                : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className={`text-[11px] font-bold ${settings.tone === tone.value ? 'text-white' : 'text-white/70'}`}>
              {tone.label}
            </div>
            <div className="text-[9px] text-white/40 mt-0.5 leading-tight">{tone.desc}</div>
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
          <div key={label} className="text-center p-2 bg-white/5 border border-white/5 rounded-xl">
            <div className="text-lg font-black text-white">{value}</div>
            <div className="text-[10px] text-white/50 uppercase tracking-wider">{label}</div>
          </div>
        ))}
      </div>

      {staleCount > 0 && (
        <div className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg font-medium leading-relaxed">
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
          className="w-full text-[11px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg py-2 hover:bg-red-500/10 transition-colors"
        >
          Clear all cached answers
        </button>
      ) : (
        <p className="text-xs text-white/30 text-center py-4 italic font-medium">
          No answers cached yet. Fill a form field to get started.
        </p>
      )}
    </div>
  )
}
