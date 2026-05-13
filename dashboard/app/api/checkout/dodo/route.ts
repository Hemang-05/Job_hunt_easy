// ============================================================
// dashboard/app/api/checkout/dodo/route.ts
// Creates a Dodo Payments subscription checkout link
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Security: ensure the userId in body matches the logged-in user
    if (body.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const apiKey = process.env.DODO_PAYMENTS_API_KEY
    const country = req.headers.get('x-vercel-ip-country') || 'US'
    const isIndia = country === 'IN'
    
    // Use the INR product ID for Indian users, otherwise fallback to the standard USD product
    const productId = isIndia 
      ? 'pdt_0Nej6KuJmIuWVHrgq0kTn' 
      : process.env.NEXT_PUBLIC_DODO_PRODUCT_ID

    // Dynamically determine the app URL based on the request origin
    // This ensures that if the user is using a Cloudflare tunnel (HTTPS), 
    // they are redirected back to the tunnel URL instead of localhost (HTTP),
    // which prevents losing the session and being asked to sign in again.
    const origin = req.headers.get('origin')
    const appUrl = origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (!apiKey || !productId) {
      console.error('[Checkout] Missing env vars')
      return NextResponse.json({ error: 'Payment configuration error' }, { status: 500 })
    }

    // Get user's email from Clerk to pass to Dodo as a new customer
    const user = await currentUser()
    const email = user?.emailAddresses?.[0]?.emailAddress

    if (!email) {
      return NextResponse.json({ error: 'No email found for user' }, { status: 400 })
    }

    // Build request body — customer must be NewCustomer or AttachExistingCustomer
    // We use NewCustomer (email) since we don't store Dodo customer IDs
    // billing.country is REQUIRED by Dodo — user can change it at checkout
    const requestBody = {
      product_id: productId,
      quantity: 1,
      payment_link: true,
      customer: {
        email: email,
        name: user?.fullName || undefined,
      },
      billing: {
        country: 'US', // Required field — Dodo lets user change this at checkout
      },
      metadata: {
        userId: userId, // ← This is how webhook identifies which user to upgrade
      },
      return_url: `${appUrl}/dashboard/pro-welcome?success=true`,
    }

    // Use the production endpoint if we are not on localhost
    const isLocal = appUrl.includes('localhost') || appUrl.includes('127.0.0.1')
    const dodoBaseUrl = isLocal ? 'https://test.dodopayments.com' : 'https://live.dodopayments.com'

    console.log(`[Checkout] Creating session via ${dodoBaseUrl} for:`, email)

    const response = await fetch(`${dodoBaseUrl}/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[Checkout] Dodo API error:', data)
      return NextResponse.json(
        { error: data?.message || 'Failed to create checkout session' },
        { status: response.status }
      )
    }

    const checkoutUrl = data.payment_link

    if (!checkoutUrl) {
      console.error('[Checkout] No payment_link in response:', data)
      return NextResponse.json({ error: 'No checkout URL returned' }, { status: 500 })
    }

    console.log('[Checkout] ✅ Checkout URL created')
    return NextResponse.json({ checkoutUrl })

  } catch (error: any) {
    console.error('[Checkout] Unexpected error:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
