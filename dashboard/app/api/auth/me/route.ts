import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin')
  const allowedOrigin = origin || process.env.NEXT_PUBLIC_APP_URL || '*'
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
  }
}

export async function OPTIONS(req: Request) {
  return NextResponse.json({}, { headers: corsHeaders(req) })
}

export async function GET(req: Request) {
  const { userId } = auth()
  const cors = corsHeaders(req)
  
  // Always return 200, but with userId null if not authenticated
  return NextResponse.json({ userId: userId || null }, { headers: cors })
}
