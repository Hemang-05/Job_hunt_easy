// ============================================================
// SERVICE WORKER (background/index.ts)
//
// SYSTEM DESIGN RECAP:
// - Only component that can call external APIs (OpenRouter)
// - Only component that can read/write chrome.storage
// - Cannot touch the DOM — ever
// - Communicates with content script via chrome.runtime.sendMessage
// - Chrome may kill this after 30s idle → keep-alive ping from content script
// ============================================================

import type {
  ExtensionMessage,
  FillRequestMessage,
  ExtensionStorage,
  CachedAnswer,
  ResumeChunk,
  Settings,
} from '@fillr/types'
import { DEFAULT_SETTINGS, FREE_GENERATION_LIMIT } from '@fillr/types'
import { hashQuestion, normalizeQuestion } from '../shared/utils'
import { buildPrompt } from '../shared/promptBuilder'
import { scoreChunks } from '../shared/chunkScorer'

// ─── Keep-alive ────────────────────────────────────────────
// Chrome kills idle service workers. The content script pings
// us every 20s to prevent that during active sessions.

chrome.runtime.onMessage.addListener((message: ExtensionMessage) => {
  if (message.type === 'KEEP_ALIVE') return true
})

// ─── Main message router ───────────────────────────────────

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender, sendResponse) => {
    if (message.type === 'FILL_REQUEST') {
      // Must return true to keep the message channel open for async response
      handleFillRequest(message, sender.tab?.id)
      return true
    }
  }
)

// ─── Core handler ──────────────────────────────────────────

async function handleFillRequest(
  message: FillRequestMessage,
  tabId: number | undefined
) {
  if (!tabId) return

  const { question, fieldId, pageUrl } = message.payload

  try {
    // Step 1: Load everything we need from storage
    const storage = await getStorage()
    const { resume, answerCache, settings } = storage

    // Step 2: Validate preconditions and account matching
    if (!resume) {
      sendToTab(tabId, {
        type: 'ERROR',
        payload: { fieldId, code: 'RESUME_NOT_FOUND', message: 'Upload your resume in Fillr settings first' },
      })
      return
    }

    // Security: Check for account mismatch
    try {
      const res = await fetch('http://localhost:3000/api/auth/me', { credentials: 'include' })
      const data = await res.json()
      const currentUserId = data.userId

      // If logged in, enforce ownership match
      if (currentUserId && resume.userId && resume.userId !== currentUserId) {
        sendToTab(tabId, {
          type: 'ERROR',
          payload: { 
            fieldId, 
            code: 'RESUME_NOT_FOUND', 
            message: 'Resume account mismatch. Please re-upload your resume in the extension popup.' 
          },
        })
        return
      }
    } catch (err) {
      console.debug('[Fillr] Auth check failed (offline?), proceeding with local resume:', err)
    }

    // Step 3: Check cache
    // SYSTEM DESIGN: hash the normalized question so "Why this role?" and
    // "Why do you want this role?" can potentially match
    const hash = hashQuestion(normalizeQuestion(question))
    const cached = answerCache.find(
      (a) =>
        a.questionHash === hash &&
        a.resumeVersionWhenGenerated === resume.version // stale check
    )

    // Check limits for regeneration
    if (message.payload.isRegeneration && cached) {
      const genCount = cached.generationCount ?? 1
      if (genCount >= FREE_GENERATION_LIMIT) {
        // MONETIZE: Remove limit for paid users
        sendToTab(tabId, {
          type: 'ERROR',
          payload: { fieldId, code: 'UPGRADE_REQUIRED', message: 'Free limit reached for this question. Upgrade to generate again.' },
        })
        return
      }
    } else if (cached && !message.payload.isRegeneration) {
      // Cache hit → send immediately, no API call needed
      sendToTab(tabId, {
        type: 'STREAM_DONE',
        payload: { fieldId, fullAnswer: cached.answer, fromCache: true },
      })
      // Update usage stats async
      updateCacheEntry(hash, answerCache)
      return
    }

    // Step 4: Select relevant resume chunks
    // SYSTEM DESIGN: only send what's relevant → fewer tokens → less cost
    const relevantChunks = scoreChunks(question, resume.chunks).slice(0, 3)

    // Step 5: Build prompt
    const prompt = buildPrompt(question, relevantChunks, settings.tone)

    // Step 6: Stream from OpenRouter
    await streamFromAPI({
      prompt,
      settings,
      tabId,
      fieldId,
      onComplete: async (fullAnswer) => {
        // Save to cache after successful generation
        await saveToCache({
          question,
          hash,
          answer: fullAnswer,
          resumeVersion: resume.version,
          pageUrl,
          answerCache,
          isRegeneration: message.payload.isRegeneration,
          existingCached: cached
        })
        
        // Sync to Dashboard (Phase 1)
        syncToDashboard({ 
          question, 
          hash, 
          answer: fullAnswer, 
          pageUrl,
          jobContext: message.payload.jobContext 
        })
      },
    })
  } catch (err) {
    const error = err as Error
    console.error('[Fillr] handleFillRequest error:', error.message)

    sendToTab(tabId, {
      type: 'ERROR',
      payload: {
        fieldId,
        code: 'API_ERROR',
        message: error.message ?? 'Something went wrong',
      },
    })
  }
}

// ─── AI streaming ──────────────────────────────────────────
// The /api/generate route returns OpenAI-compatible SSE for all
// providers. We parse the SSE and forward chunks to content script.

async function streamFromAPI({
  prompt,
  settings,
  tabId,
  fieldId,
  onComplete,
}: {
  prompt: string
  settings: Settings
  tabId: number
  fieldId: string
  onComplete: (fullAnswer: string) => Promise<void>
}) {
  console.debug('[Fillr] Calling /api/generate with model:', settings.model)

  const response = await fetch('http://localhost:3000/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      prompt,
      model: settings.model,
      max_tokens: settings.maxAnswerLength,
      tone: settings.tone
    }),
  })

  if (!response.ok) {
    const errBody = await response.text().catch(() => '')
    console.error('[Fillr] API error:', response.status, errBody)
    if (response.status === 429) {
      throw new Error('API rate limited — try again in a moment')
    }
    throw new Error(`Fillr: API error ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || ''
  console.debug('[Fillr] Response content-type:', contentType)

  let fullAnswer = ''

  // ── Path A: JSON response (non-streaming) ──────────────
  if (contentType.includes('application/json')) {
    const json = await response.json()
    console.debug('[Fillr] Got JSON response:', JSON.stringify(json).slice(0, 200))
    const text =
      json.choices?.[0]?.message?.content ||
      json.choices?.[0]?.delta?.content ||
      json.candidates?.[0]?.content?.parts?.[0]?.text ||
      ''
    if (text) {
      fullAnswer = text
      sendToTab(tabId, {
        type: 'STREAM_CHUNK',
        payload: { chunk: text, fieldId },
      })
    }
  }
  // ── Path B: SSE stream ─────────────────────────────────
  else {
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let rawBody = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      rawBody += chunk
      buffer += chunk
      const lines = buffer.split('\n')

      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data:') || line.includes('[DONE]')) continue
        try {
          const json = JSON.parse(line.slice(5).trim())
          // OpenAI-compatible delta format (from OpenRouter or our Google proxy)
          const text =
            json.choices?.[0]?.delta?.content ??
            json.choices?.[0]?.message?.content ??
            ''
          if (text) {
            fullAnswer += text
            sendToTab(tabId, {
              type: 'STREAM_CHUNK',
              payload: { chunk: text, fieldId },
            })
          }
        } catch {
          // Malformed SSE line — skip
        }
      }
    }

    // If streaming produced nothing, try parsing rawBody as a single JSON blob
    // Some free OpenRouter models ignore stream:true and return plain JSON
    if (!fullAnswer && rawBody.trim()) {
      console.debug('[Fillr] SSE produced no text. Raw body:', rawBody.slice(0, 300))
      try {
        // Try to find any data: line
        const dataLine = rawBody.split('\n').find(l => l.startsWith('data:') && !l.includes('[DONE]'))
        const jsonStr = dataLine ? dataLine.slice(5).trim() : rawBody.trim()
        const json = JSON.parse(jsonStr)
        const text =
          json.choices?.[0]?.message?.content ||
          json.choices?.[0]?.delta?.content ||
          json.candidates?.[0]?.content?.parts?.[0]?.text ||
          ''
        if (text) {
          fullAnswer = text
          sendToTab(tabId, {
            type: 'STREAM_CHUNK',
            payload: { chunk: text, fieldId },
          })
        }
      } catch {
        console.error('[Fillr] Could not parse API response. Raw:', rawBody.slice(0, 300))
      }
    }
  }

  // ── Final: send result or error ────────────────────────
  if (fullAnswer) {
    console.debug('[Fillr] Stream complete. Answer length:', fullAnswer.length)
    sendToTab(tabId, {
      type: 'STREAM_DONE',
      payload: { fieldId, fullAnswer, fromCache: false },
    })
    await onComplete(fullAnswer)
  } else {
    console.error('[Fillr] API returned empty answer')
    sendToTab(tabId, {
      type: 'ERROR',
      payload: {
        fieldId,
        code: 'API_ERROR',
        message: 'AI returned an empty response — try again',
      },
    })
  }
}

// ─── Storage helpers ───────────────────────────────────────

async function getStorage(): Promise<ExtensionStorage> {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      { resume: null, answerCache: [] },
      (local) => {
        chrome.storage.sync.get({ settings: DEFAULT_SETTINGS }, (sync) => {
          resolve({
            resume: local.resume,
            answerCache: local.answerCache,
            settings: sync.settings,
          })
        })
      }
    )
  })
}

async function saveToCache({
  question,
  hash,
  answer,
  resumeVersion,
  pageUrl,
  answerCache,
  isRegeneration,
  existingCached
}: {
  question: string
  hash: string
  answer: string
  resumeVersion: number
  pageUrl: string
  answerCache: CachedAnswer[]
  isRegeneration?: boolean
  existingCached?: CachedAnswer
}) {
  if (isRegeneration && existingCached) {
    // Update existing entry instead of creating a new one
    const updatedCache = answerCache.map((entry) => 
      entry.id === existingCached.id 
        ? { 
            ...entry, 
            answer, 
            generationCount: (entry.generationCount ?? 1) + 1,
            lastUsedAt: Date.now()
          } 
        : entry
    )
    chrome.storage.local.set({ answerCache: updatedCache })
    return
  }

  const newEntry: CachedAnswer = {
    id: crypto.randomUUID(),
    questionHash: hash,
    questionText: question,
    answer,
    generatedAt: Date.now(),
    lastUsedAt: Date.now(),
    usedCount: 1,
    resumeVersionWhenGenerated: resumeVersion,
    pageUrl,
    generationCount: 1, // Start at 1 for brand new questions
  }

  // SYSTEM DESIGN: Evict if we're approaching the 10MB limit
  const updatedCache = await evictIfNeeded([...answerCache, newEntry])
  chrome.storage.local.set({ answerCache: updatedCache })
}

async function updateCacheEntry(hash: string, cache: CachedAnswer[]) {
  const updated = cache.map((entry) =>
    entry.questionHash === hash
      ? { ...entry, usedCount: entry.usedCount + 1, lastUsedAt: Date.now() }
      : entry
  )
  chrome.storage.local.set({ answerCache: updated })
}

// ─── Cache eviction ─────────────────────────────────────────
// SYSTEM DESIGN: LRU + LFU hybrid scoring
// Remove the least recently AND least frequently used entries
// when storage approaches the 8MB soft limit

async function evictIfNeeded(cache: CachedAnswer[]): Promise<CachedAnswer[]> {
  const SOFT_LIMIT_BYTES = 8 * 1024 * 1024 // 8MB → warn before 10MB wall

  return new Promise((resolve) => {
    chrome.storage.local.getBytesInUse(null, (bytes) => {
      if (bytes < SOFT_LIMIT_BYTES) {
        resolve(cache)
        return
      }

      // Score each entry — lower score = evict first
      const scored = cache
        .map((entry) => {
          const daysSinceUsed = (Date.now() - entry.lastUsedAt) / 86_400_000
          const recency = 1 / (daysSinceUsed + 1)
          const frequency = Math.log(entry.usedCount + 1)
          return { entry, score: recency + frequency }
        })
        .sort((a, b) => a.score - b.score)

      // Remove bottom 20%
      const removeCount = Math.floor(scored.length * 0.2)
      const kept = scored.slice(removeCount).map((s) => s.entry)

      console.log(`[Fillr] Evicted ${removeCount} cache entries (storage near limit)`)
      resolve(kept)
    })
  })
}

// ─── Utility ───────────────────────────────────────────────

function sendToTab(tabId: number, message: ExtensionMessage) {
  chrome.tabs.sendMessage(tabId, message).catch((err) => {
    // Tab may have closed — this is fine
    console.debug('[Fillr] sendToTab failed (tab likely closed):', err.message)
  })
}

// ─── Dashboard Sync ────────────────────────────────────────

async function syncToDashboard(payload: { 
  question: string, 
  hash: string, 
  answer: string, 
  pageUrl: string,
  jobContext?: { companyName?: string, roleTitle?: string, platform?: string }
}) {
  try {
    await fetch('http://localhost:3000/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Automatically passes Clerk __session cookies!
      body: JSON.stringify(payload)
    })
  } catch (err) {
    console.debug('[Fillr] Sync to dashboard failed:', err)
  }
}
