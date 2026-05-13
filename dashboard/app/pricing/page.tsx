import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/server'
import PricingClient from './PricingClient'

import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function PricingPage() {
  const headersList = headers()
  const userCountry = headersList.get('x-vercel-ip-country') || 'US'
  
  const user = await currentUser()
  let plan: 'free' | 'pro' | null = null

  if (user) {
    const supabase = createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('user_id', user.id)
      .single()
    
    plan = profile?.plan === 'pro' ? 'pro' : 'free'
  }

  const initialUser = user ? {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress || ''
  } : null

  return <PricingClient initialUser={initialUser} initialPlan={plan} userCountry={userCountry} />
}
