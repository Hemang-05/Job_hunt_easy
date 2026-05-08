import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// ─── Verify Dodo webhook signature ─────────────────────────
async function verifySignature(req: NextRequest, body: string): Promise<boolean> {
  const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY
  if (!webhookKey) {
    console.error('[Dodo Webhook] Missing DODO_PAYMENTS_WEBHOOK_KEY')
    return false
  }

  const signature = req.headers.get('webhook-signature')
  const timestamp  = req.headers.get('webhook-timestamp')
  const webhookId  = req.headers.get('webhook-id')

  if (!signature || !timestamp || !webhookId) {
    console.error('[Dodo Webhook] Missing signature headers')
    return false
  }

  try {
    // Dodo signs: "{webhook-id}.{webhook-timestamp}.{body}"
    const signedContent = `${webhookId}.${timestamp}.${body}`

    // The secret is base64-encoded after "whsec_" prefix
    const secret = webhookKey.startsWith('whsec_')
      ? webhookKey.slice(6)
      : webhookKey

    const keyBytes = Uint8Array.from(atob(secret), c => c.charCodeAt(0))
    const cryptoKey = await crypto.subtle.importKey(
      'raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    )

    const encoder = new TextEncoder()
    const signatureBytes = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(signedContent))
    const computedSig = btoa(String.fromCharCode(...Array.from(new Uint8Array(signatureBytes))))

    // signature header may contain multiple sigs like "v1,xxxx v1,yyyy"
    const signatures = signature.split(' ')
    return signatures.some(sig => {
      const sigValue = sig.startsWith('v1,') ? sig.slice(3) : sig
      return sigValue === computedSig
    })
  } catch (err) {
    console.error('[Dodo Webhook] Signature verification error:', err)
    return false
  }
}

// ─── Upgrade user to pro in Supabase ───────────────────────
async function upgradeUserToPro(userId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: userId,
        plan: 'pro',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

  if (error) {
    console.error('[Dodo Webhook] Supabase upsert error:', error.message)
    throw error
  }

  console.log(`[Dodo Webhook] ✅ User ${userId} upgraded to pro`)
}

// ─── Main POST handler ──────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.text()

  // 1. Verify signature
  const isValid = await verifySignature(req, body)
  if (!isValid) {
    console.error('[Dodo Webhook] ❌ Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // 2. Parse event
  let event: any
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  console.log('[Dodo Webhook] Event received:', event.type)

  // 3. Handle relevant events
  const { type, data } = event

  if (type === 'payment.succeeded' || type === 'subscription.active') {
    // userId is passed as metadata when creating the checkout session
    const userId = data?.metadata?.userId
    
    if (!userId) {
      console.error('[Dodo Webhook] ❌ No userId found in event metadata')
      return NextResponse.json({ received: true, warning: 'No userId in metadata' })
    }

    try {
      await upgradeUserToPro(userId)
    } catch (err) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
  }

  if (type === 'subscription.canceled' || type === 'subscription.deleted') {
    const userId = data?.metadata?.userId

    if (userId) {
      console.log(`[Dodo Webhook] ⬇️ Downgrading user ${userId} to free`)
      const supabase = createClient()
      await supabase
        .from('profiles')
        .update({ plan: 'free', updated_at: new Date().toISOString() })
        .eq('user_id', userId)
    }
  }

  // Always return 200 so Dodo knows we received it
  return NextResponse.json({ received: true })
}
