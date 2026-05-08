'use client'

import { useEffect } from 'react'

export default function URLCleaner() {
  useEffect(() => {
    // Clean up Dodo Payments parameters from the URL after the page loads
    // This keeps the address bar clean for the user
    if (typeof window !== 'undefined' && window.location.search) {
      const url = new URL(window.location.href)
      url.searchParams.delete('success')
      url.searchParams.delete('subscription_id')
      url.searchParams.delete('status')
      url.searchParams.delete('email')
      
      window.history.replaceState({}, '', url.pathname)
    }
  }, [])

  return null
}
