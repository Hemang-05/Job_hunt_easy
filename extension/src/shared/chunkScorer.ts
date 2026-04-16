// ============================================================
// shared/chunkScorer.ts
//
// SYSTEM DESIGN: Instead of sending the full resume to the AI
// (expensive, noisy), we score each chunk against the question
// and send only the top N. This is the lightweight version of
// RAG (Retrieval Augmented Generation).
// ============================================================

import type { ResumeChunk } from '@fillr/types'

// Keywords that signal which chunk type is most relevant
const QUESTION_SIGNALS: Record<string, string[]> = {
  experience: ['experience', 'work', 'job', 'role', 'position', 'career', 'background', 'history', 'previous', 'past'],
  skills:     ['skill', 'technology', 'stack', 'proficient', 'expertise', 'technical', 'tool', 'language', 'framework'],
  education:  ['degree', 'study', 'university', 'college', 'academic', 'qualification', 'gpa', 'graduate'],
  projects:   ['project', 'built', 'developed', 'created', 'portfolio', 'side project', 'personal'],
  summary:    ['about', 'yourself', 'introduction', 'overview', 'tell me', 'who are you', 'describe yourself'],
}

export function scoreChunks(
  question: string,
  chunks: ResumeChunk[]
): ResumeChunk[] {
  const q = question.toLowerCase()

  const scored = chunks.map((chunk) => {
    let score = 0

    // 1. Keyword overlap between question and chunk content
    const chunkWords = chunk.content.toLowerCase().split(/\W+/)
    const questionWords = q.split(/\W+/)
    const overlap = questionWords.filter((w) => w.length > 3 && chunkWords.includes(w))
    score += overlap.length * 2

    // 2. Keyword overlap with chunk's extracted keywords
    const keywordHits = chunk.keywords.filter((k) =>
      q.includes(k.toLowerCase())
    )
    score += keywordHits.length * 3

    // 3. Chunk type relevance to question type
    for (const [chunkType, signals] of Object.entries(QUESTION_SIGNALS)) {
      if (chunk.type === chunkType) {
        const typeHits = signals.filter((s) => q.includes(s))
        score += typeHits.length * 4
      }
    }

    // 4. Always include summary if it exists (provides context)
    if (chunk.type === 'summary') score += 2

    return { chunk, score }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .map((s) => s.chunk)
}
