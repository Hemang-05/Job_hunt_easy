// ============================================================
// shared/utils.ts
// Utility functions used by both background and content script
// ============================================================

// ─── Environment configuration ─────────────────────────────
/// <reference types="vite/client" />
export const API_BASE_URL = import.meta.env.MODE === 'development'
  ? 'http://localhost:3000'
  : 'https://job-hunt-easy-dashboard.vercel.app'

// ─── Question normalization ────────────────────────────────
// SYSTEM DESIGN: We normalize before hashing so that:
// "Why do you want THIS role?" and "why do you want this role"
// produce the same hash → cache hit instead of redundant API call

export function normalizeQuestion(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')   // strip punctuation
    .replace(/\s+/g, ' ')           // collapse whitespace
    .split(' ')
    .sort()                         // order-independent matching
    .join(' ')
}

// Simple djb2 hash — fast, good distribution, no crypto needed
export function hashQuestion(normalized: string): string {
  let hash = 5381
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 33) ^ normalized.charCodeAt(i)
  }
  return (hash >>> 0).toString(16)  // unsigned 32-bit hex
}

// ─── Prompt injection guard ────────────────────────────────
// SYSTEM DESIGN: Malicious forms could put "ignore previous
// instructions" in their label text. We strip it before it
// reaches the AI prompt. (Threat from Phase 5 security analysis)

const INJECTION_PATTERNS = [
  /ignore (previous|prior|all) instructions/i,
  /system prompt/i,
  /you are now/i,
  /disregard/i,
  /jailbreak/i,
]

export function sanitizeQuestion(raw: string): string {
  let text = raw
    .slice(0, 500)                        // hard cap at 500 chars
    .replace(/<[^>]*>/g, '')              // strip HTML tags
    .replace(/[^\x20-\x7E\n]/g, '')      // ascii printable only
    .trim()

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      console.warn('[Job Hunt Easy] Possible prompt injection attempt detected, sanitizing')
      text = text.replace(pattern, '[removed]')
    }
  }

  return text
}

// ─── Storage size estimate ─────────────────────────────────

export function estimateSizeKb(obj: unknown): number {
  return Math.round(new Blob([JSON.stringify(obj)]).size / 1024)
}

// ─── Unique field ID generation ─────────────────────────────
// Creates a stable ID for a form field so we can target it
// across message passing even if the element has no id attr

export function getFieldId(el: HTMLElement): string {
  if (el.id) return `id:${el.id}`

  const rect = el.getBoundingClientRect()
  const tag = el.tagName.toLowerCase()
  return `pos:${tag}:${Math.round(rect.top)}:${Math.round(rect.left)}`
}
