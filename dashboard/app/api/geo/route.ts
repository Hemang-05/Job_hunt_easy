import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export function GET(req: Request) {
  const country = req.headers.get('x-vercel-ip-country') || 'US'
  return NextResponse.json({ country })
}
