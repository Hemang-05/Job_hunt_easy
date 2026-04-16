import { NextResponse } from 'next/server'
import { SUPPORTED_MODELS } from '@fillr/types'

// ─── CORS for Chrome Extension requests ────────────────────
function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '*'
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'OPTIONS, POST',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export async function OPTIONS(req: Request) {
  return NextResponse.json({}, { headers: corsHeaders(req) })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { prompt, model: rawModel, max_tokens } = body
    const cors = corsHeaders(req)

    // Fallback for retired models stored in old extension settings
    let model = rawModel
    if (model === 'gemini-2.5-flash-preview-05-20') {
      console.log('[API Generate] Mapping retired model to stable: gemini-2.5-flash')
      model = 'gemini-2.5-flash'
    }

    // Determine provider from the SUPPORTED_MODELS list
    const modelEntry = SUPPORTED_MODELS.find((m) => m.id === model)
    const provider = modelEntry?.provider ?? 'openrouter'

    console.log(`[API Generate] Processing request: model="${model}" (original="${rawModel}"), provider="${provider}"`)

    if (provider === 'google') {
      return handleGoogleAI({ prompt, model, max_tokens, cors, req })
    } else {
      return handleOpenRouter({ prompt, model, max_tokens, cors, req })
    }
  } catch (error: any) {
    console.error('[API Generate] Exception:', error.message)
    const cors = corsHeaders(req)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: cors })
  }
}

// ─── Google Generative Language API (Gemini) ────────────────
async function handleGoogleAI({
  prompt,
  model,
  max_tokens,
  cors,
  req,
}: {
  prompt: string
  model: string
  max_tokens: number
  cors: Record<string, string>
  req: Request
}) {
  const GOOGLE_AI_KEY = process.env.GOOGLE_AI_API_KEY
  if (!GOOGLE_AI_KEY) {
    console.error('[API Generate] Missing GOOGLE_AI_API_KEY in .env.local')
    return NextResponse.json(
      { error: 'Google AI API key is not configured' },
      { status: 500, headers: cors }
    )
  }

  // Google Generative Language API streaming endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${GOOGLE_AI_KEY}`

  const googleRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: max_tokens || 300,
      },
    }),
  })

  if (!googleRes.ok) {
    const errText = await googleRes.text()
    console.error('[API Generate] Google AI error:', googleRes.status, errText)
    return NextResponse.json(
      { error: `Google AI upstream error: ${googleRes.status}` },
      { status: googleRes.status, headers: cors }
    )
  }

  // Google streams SSE with {"candidates":[{"content":{"parts":[{"text":"..."}]}}]}
  // We need to transform this to OpenAI-compatible SSE format so the extension
  // background script can parse it uniformly.
  const reader = googleRes.body!.getReader()
  const decoder = new TextDecoder()

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data:') && !line.includes('[DONE]')) {
            try {
              const json = JSON.parse(line.slice(5).trim())
              const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
              if (text) {
                // Re-emit in OpenAI-compatible format
                const openAIChunk = {
                  choices: [{ delta: { content: text } }],
                }
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(openAIChunk)}\n\n`)
                )
              }
            } catch {
              // skip malformed lines
            }
          }
        }
      }
    },
  })

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      ...cors,
    },
  })
}

// ─── OpenRouter (OpenAI-compatible) ────────────────────────
async function handleOpenRouter({
  prompt,
  model,
  max_tokens,
  cors,
  req,
}: {
  prompt: string
  model: string
  max_tokens: number
  cors: Record<string, string>
  req: Request
}) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
  if (!OPENROUTER_API_KEY) {
    console.error('[API Generate] Missing OPENROUTER_API_KEY in .env.local')
    return NextResponse.json(
      { error: 'Server AI configuration is missing' },
      { status: 500, headers: cors }
    )
  }

  const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://fillr.app',
      'X-Title': 'Fillr SaaS',
    },
    body: JSON.stringify({
      model,
      max_tokens,
      stream: true,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!openRouterRes.ok) {
    const errText = await openRouterRes.text()
    console.error('[API Generate] OpenRouter error:', openRouterRes.status, errText)
    return NextResponse.json(
      { error: `OpenRouter upstream error: ${openRouterRes.status}` },
      { status: openRouterRes.status, headers: cors }
    )
  }

  // Pass-through the SSE stream directly
  return new Response(openRouterRes.body, {
    status: openRouterRes.status,
    headers: {
      'Content-Type': openRouterRes.headers.get('Content-Type') || 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      ...cors,
    },
  })
}
