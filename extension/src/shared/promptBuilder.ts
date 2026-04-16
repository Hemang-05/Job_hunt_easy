// ============================================================
// shared/promptBuilder.ts
//
// SYSTEM DESIGN: The prompt is the API contract between our
// system and the AI model. Bad prompt = unpredictable output.
// We inject safety constraints and structure directly here.
// ============================================================

import type { ResumeChunk, AnswerTone } from '@fillr/types'

export function buildPrompt(
  question: string,
  chunks: ResumeChunk[],
  tone: AnswerTone
): string {
  const background = chunks.map((c) => c.content).join('\n\n')

  const toneInstruction = {
    professional: 'Write in a professional, confident tone suitable for a formal application.',
    casual:       'Write in a warm, conversational tone — friendly but still competent.',
    concise:      'Be extremely concise. 1-2 sentences maximum unless the question requires more.',
  }[tone]

  return `You are an expert career agent helping a job applicant answer an online application question.

## Applicant's Resume/Background Data
\`\`\`
${background}
\`\`\`

## Application Question to Answer
"${question}"

## Critical Instructions
1. READ THE QUESTION CAREFULLY. If it contains multiple parts (e.g. "What did you build? What was the stack?"), you MUST address every single part in your response.
2. Pick ONE highly relevant project or experience from the applicant's background to focus on if asked for a specific example. Do not give a generic summary of their whole career.
3. If the background does not contain the exact information asked for, synthesize the closest possible relevant skills without inventing lies.
4. Answer directly in the first person ("I", "my").
5. ${toneInstruction}
6. STRICTLY NO making up companies, timelines, or technologies not present in the background.
7. STRICTLY NO "filler" phrases, greetings, subject lines, or AI disclaimers (e.g. "Here is an answer:", "Based on the background").
8. Get straight to the point. Answer ONLY what is asked. Keep it under 150 words unless the question demands a longer essay.

Answer:`
}
