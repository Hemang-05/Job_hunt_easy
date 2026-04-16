// ============================================================
// @fillr/types — single source of truth for all data shapes
// Both the extension and dashboard import from here
// ============================================================

// ─── Resume ────────────────────────────────────────────────

export type ChunkType = 'experience' | 'education' | 'skills' | 'projects' | 'summary' | 'other'

export interface ResumeChunk {
  id: string
  type: ChunkType
  content: string
  keywords: string[]     // extracted for relevance scoring
}

export interface Resume {
  id: string
  fileName: string
  rawText: string
  chunks: ResumeChunk[]
  uploadedAt: number     // unix timestamp
  version: number        // bump this on every re-upload → cache invalidation
  sizeKb: number
  userId?: string        // Tied to Clerk user ID
}

// ─── Answer Cache ──────────────────────────────────────────

export interface CachedAnswer {
  id: string
  questionHash: string          // normalized hash for lookup
  questionText: string          // original text for display
  answer: string
  generatedAt: number
  lastUsedAt: number
  usedCount: number
  resumeVersionWhenGenerated: number  // stale check: compare to Resume.version
  pageUrl?: string              // which site this was filled on
  generationCount?: number      // track regenerations for free tier limits
}

export const FREE_GENERATION_LIMIT = 2


// ─── Settings ──────────────────────────────────────────────

export type AnswerTone = 'professional' | 'casual' | 'concise'

export interface Settings {
  model: string              // e.g. "anthropic/claude-sonnet-4-5"
  enabled: boolean
  tone: AnswerTone
  maxAnswerLength: number    // token limit for answers
  showButtonOn: 'focus' | 'hover'
  syncWithDashboard: boolean // if true, answers saved to Supabase too
}

// ─── Messages (Extension inter-component protocol) ─────────
// Every message between Content Script ↔ Service Worker
// must be one of these shapes — no loose objects

export interface FillRequestMessage {
  type: 'FILL_REQUEST'
  payload: {
    question: string
    fieldId: string          // unique DOM identifier to target the right field
    pageUrl: string
    pageTitle: string
    isRegeneration?: boolean // true if the user is regenerating an existing answer
    jobContext?: {
      companyName?: string
      roleTitle?: string
      platform?: string
    }
  }
}

export interface StreamChunkMessage {
  type: 'STREAM_CHUNK'
  payload: {
    chunk: string
    fieldId: string
  }
}

export interface StreamDoneMessage {
  type: 'STREAM_DONE'
  payload: {
    fieldId: string
    fullAnswer: string
    fromCache: boolean
  }
}

export interface ErrorMessage {
  type: 'ERROR'
  payload: {
    fieldId: string
    code: ErrorCode
    message: string
  }
}

export interface KeepAliveMessage {
  type: 'KEEP_ALIVE'
}

export interface GetStorageMessage {
  type: 'GET_STORAGE'
  payload: { key: keyof ExtensionStorage }
}

// Union type — every possible message is one of these
export type ExtensionMessage =
  | FillRequestMessage
  | StreamChunkMessage
  | StreamDoneMessage
  | ErrorMessage
  | KeepAliveMessage
  | GetStorageMessage

// ─── Error Codes ───────────────────────────────────────────

export type ErrorCode =
  | 'API_KEY_MISSING'
  | 'RESUME_NOT_FOUND'
  | 'API_RATE_LIMITED'
  | 'API_ERROR'
  | 'STORAGE_FULL'
  | 'PARSE_ERROR'
  | 'UPGRADE_REQUIRED'

// ─── Chrome Storage Schema ─────────────────────────────────
// chrome.storage.local holds this shape
// chrome.storage.sync holds Settings (small, syncs across devices)

export interface ExtensionStorage {
  resume: Resume | null
  answerCache: CachedAnswer[]
  settings: Settings
  currentUserId?: string | null
}

// ─── Supabase DB Schema (for dashboard) ───────────────────

export interface DBUser {
  id: string
  email: string
  created_at: string
}

export interface DBAnswer {
  id: string
  user_id: string
  question_hash: string
  question_text: string
  answer: string
  used_count: number
  page_url: string | null
  created_at: string
  updated_at: string
}

export interface DBResume {
  id: string
  user_id: string
  file_name: string
  version: number
  created_at: string
}

export interface DBApplication {
  id: string
  user_id: string
  company_name: string | null
  role_title: string | null
  platform: string | null
  created_at: string
}

// ─── AI Provider ───────────────────────────────────────────

export type AIProvider = 'openrouter' | 'google'

export interface OpenRouterConfig {
  apiKey: string
  model: string
  maxTokens: number
  stream: boolean
}

// Models we support — only models with active API keys are enabled
export const SUPPORTED_MODELS = [
  {
    id: 'qwen/qwen3-235b-a22b:free',
    label: 'Qwen 3 235B (Free)',
    provider: 'openrouter' as AIProvider,
    free: true,
  },

  // ── MONETIZE: Uncomment and restrict to paid users ──────
  // {
  //   id: 'google/gemini-2.0-flash-exp',
  //   label: 'Gemini 2.0 Flash (Pro)',
  //   provider: 'openrouter' as AIProvider,
  //   free: false,
  // },
  // {
  //   id: 'gemini-2.5-flash',
  //   label: 'Gemini 2.5 Flash (Pro)',
  //   provider: 'google' as AIProvider,
  //   free: false,
  // },
  // {
  //   id: 'anthropic/claude-sonnet-4-5',
  //   label: 'Claude Sonnet 4.5 (Pro)',
  //   provider: 'openrouter' as AIProvider,
  //   free: false,
  // },
  // {
  //   id: 'openai/gpt-4o',
  //   label: 'GPT-4o (Pro)',
  //   provider: 'openrouter' as AIProvider,
  //   free: false,
  // },
] as const

export const DEFAULT_SETTINGS: Settings = {
  model: 'qwen/qwen3-235b-a22b:free',
  enabled: true,
  tone: 'professional',
  maxAnswerLength: 300,
  showButtonOn: 'focus',
  syncWithDashboard: true,
}
