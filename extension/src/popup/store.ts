// ============================================================
// popup/store.ts
//
// Zustand store for the Popup UI.
// SYSTEM DESIGN: This store is the Popup's local state.
// It is NOT shared with the content script or service worker.
// To persist, it writes to chrome.storage.
// ============================================================

import { create } from 'zustand'
import { API_BASE_URL } from '../shared/utils'
import type { Settings, Resume, CachedAnswer } from '@fillr/types'
import { DEFAULT_SETTINGS } from '@fillr/types'

interface ExtensionStore {
  // State
  settings: Settings
  resume: Resume | null
  answerCache: CachedAnswer[]
  isLoaded: boolean
  isSaving: boolean

  // Actions
  loadFromStorage: () => Promise<void>
  updateSettings: (partial: Partial<Settings>) => Promise<void>
  setResume: (resume: Resume) => Promise<void>
  clearCache: () => Promise<void>
}

export const useExtensionStore = create<ExtensionStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  resume: null,
  answerCache: [],
  isLoaded: false,
  isSaving: false,

  loadFromStorage: async () => {
    // 1. Fetch current dashboard user
    let currentUserId: string | null = null
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' })
      const data = await res.json()
      currentUserId = data.userId
    } catch (err) {
      console.debug('[Fillr] Could not fetch current user, falling back to local-only mode:', err)
    }

    const local = await chrome.storage.local.get({ resume: null, answerCache: [] })
    const sync = await chrome.storage.sync.get({ settings: DEFAULT_SETTINGS })

    let resume = local.resume
    let answerCache = local.answerCache

    // 2. Enforce account isolation if logged in
    if (currentUserId && resume) {
      if (resume.userId && resume.userId !== currentUserId) {
        console.warn('[Fillr] Account mismatch! Clearing local resume.')
        resume = null
        answerCache = []
        await chrome.storage.local.set({ resume: null, answerCache: [] })
      }
    }

    // 3. Persist current user ID state
    if (currentUserId) {
      await chrome.storage.local.set({ currentUserId })
    }

    set({
      resume,
      answerCache,
      settings: sync.settings,
      isLoaded: true,
    })
  },

  updateSettings: async (partial) => {
    const updated = { ...get().settings, ...partial }
    set({ settings: updated, isSaving: true })
    await chrome.storage.sync.set({ settings: updated })
    set({ isSaving: false })
  },

  setResume: async (resume) => {
    set({ resume, isSaving: true })
    await chrome.storage.local.set({ resume })
    set({ isSaving: false })
  },

  clearCache: async () => {
    set({ answerCache: [] })
    await chrome.storage.local.set({ answerCache: [] })
  },
}))
