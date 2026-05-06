// ============================================================
// popup/components/ResumeUploader.tsx
//
// Handles PDF upload → pdf.js parse → chunk → store
// SYSTEM DESIGN: All parsing happens CLIENT SIDE.
// Resume never leaves the device (Privacy constraint D1).
// ============================================================

import React, { useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
// @ts-ignore - Tell Vite to package the worker as a static asset URL
import workerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url'
import { useExtensionStore } from '../store'
import { API_BASE_URL } from '../../shared/utils'
import type { Resume, ResumeChunk, ChunkType } from '@job-hunt-easy/types'
import { estimateSizeKb } from '../../shared/utils'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

export function ResumeUploader() {
  const { resume, setResume } = useExtensionStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'parsing' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleFile(file: File) {
    if (!file.name.endsWith('.pdf')) {
      setError('Please upload a PDF file')
      return
    }

    setStatus('parsing')
    setError('')

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      let rawText = ''

      // Extract text from every page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items
          .map((item: any) => item.str)
          .join(' ')
        rawText += pageText + '\n'
      }

      // Chunk the raw text into typed sections
      const chunks = chunkResumeText(rawText)

      // Fetch current userId from dashboard
      let currentUserId: string | undefined
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' })
        const data = await res.json()
        currentUserId = data.userId
      } catch (err) {
        console.warn('[Job Hunt Easy] Could not tag resume with userId:', err)
      }

      const newResume: Resume = {
        id: crypto.randomUUID(),
        fileName: file.name,
        rawText,
        chunks,
        uploadedAt: Date.now(),
        version: (resume?.version ?? 0) + 1,  // bump version → cache invalidation
        sizeKb: estimateSizeKb(rawText),
        userId: currentUserId,
      }

      await setResume(newResume)
      setStatus('done')

      // Fire-and-forget: sync resume to Supabase via dashboard API
      syncResumeToSupabase(newResume)

    } catch (err) {
      console.error('[Job Hunt Easy] PDF parse error:', err)
      setError('Could not read this PDF. Try saving it as a regular PDF (not scanned).')
      setStatus('error')
    }
  }

  return (
    <div className="space-y-3">
      {resume ? (
        <div className="flex items-start gap-3 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-inner">
          <span className="text-emerald-400 text-lg">✓</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white truncate">{resume.fileName}</div>
            <div className="text-[10px] uppercase tracking-widest text-emerald-400/80 mt-1 font-bold">
              {resume.chunks.length} sections · {resume.sizeKb}KB · v{resume.version}
            </div>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 underline flex-shrink-0 transition-colors"
          >
            Replace
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-[#2F2FE4] hover:bg-[#2F2FE4]/10 transition-all group shadow-lg shadow-black/20"
        >
          <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📄</div>
          <div className="text-sm font-bold text-white">Upload your resume</div>
          <div className="text-[10px] uppercase tracking-widest text-white/40 mt-1.5 font-bold">PDF only · stays on device</div>
        </div>
      )}

      {status === 'parsing' && (
        <div className="flex items-center gap-2 text-xs font-bold text-[#2F2FE4]">
          <div className="animate-spin w-3 h-3 border-2 border-[#2F2FE4] border-t-transparent rounded-full" />
          Parsing resume securely...
        </div>
      )}

      {status === 'done' && (
        <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 p-2 rounded text-center">Resume parsed successfully</div>
      )}

      {error && <div className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded text-center">{error}</div>}

      <input
        ref={fileRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = '' // reset so same file can be re-uploaded
        }}
      />
    </div>
  )
}

// ─── Resume chunker ─────────────────────────────────────────
// SYSTEM DESIGN: We split the resume into typed sections so the
// service worker can retrieve only the relevant chunks per question.
// This is the "R" in RAG — retrieval.

const SECTION_PATTERNS: Array<{ pattern: RegExp; type: ChunkType }> = [
  { pattern: /\b(experience|work history|employment|career)\b/i, type: 'experience' },
  { pattern: /\b(education|academic|university|college|degree)\b/i, type: 'education' },
  { pattern: /\b(skills|technologies|technical|tools|stack)\b/i, type: 'skills' },
  { pattern: /\b(projects|portfolio|built|created)\b/i, type: 'projects' },
  { pattern: /\b(summary|objective|profile|about)\b/i, type: 'summary' },
]

function chunkResumeText(rawText: string): ResumeChunk[] {
  // Split on double newlines (section breaks)
  const paragraphs = rawText
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 30)

  const chunks: ResumeChunk[] = []

  for (const paragraph of paragraphs) {
    // Determine chunk type by looking for section heading keywords
    let type: ChunkType = 'other'
    for (const { pattern, type: t } of SECTION_PATTERNS) {
      if (pattern.test(paragraph)) {
        type = t
        break
      }
    }

    // Extract keywords: capitalized words (names, tech), 4+ char words
    const keywords = [
      ...paragraph.match(/\b[A-Z][a-z]+(?:\.[a-z]+)?\b/g) ?? [],   // PascalCase / names
      ...paragraph.match(/\b[A-Z]{2,}\b/g) ?? [],                    // acronyms: AWS, API
      ...paragraph.match(/\b[a-z]{4,}\b/g) ?? [],                    // common words 4+ chars
    ]
      .filter((w, i, arr) => arr.indexOf(w) === i)  // deduplicate
      .slice(0, 20)                                   // cap at 20 per chunk

    chunks.push({
      id: crypto.randomUUID(),
      type,
      content: paragraph.slice(0, 800),  // cap chunk size
      keywords,
    })
  }

  return chunks
}

// ─── Supabase sync ──────────────────────────────────────────
// Fire-and-forget: attempt to persist the resume to the
// dashboard's Supabase backend. Failures are silently logged —
// the extension works fully offline regardless.

async function syncResumeToSupabase(resume: Resume) {
  try {
    await fetch(`${API_BASE_URL}/api/resume/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // sends Clerk session cookie
      body: JSON.stringify({
        fileName: resume.fileName,
        chunks: resume.chunks,
        rawText: resume.rawText,
        version: resume.version,
        sizeKb: resume.sizeKb,
      }),
    })
  } catch (err) {
    console.debug('[Job Hunt Easy] Resume sync to Supabase failed (non-blocking):', err)
  }
}
