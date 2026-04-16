import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = auth()
  
  // Always return 200, but with userId null if not authenticated
  return NextResponse.json({ userId: userId || null })
}
