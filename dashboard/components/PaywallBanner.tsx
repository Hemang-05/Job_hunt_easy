import React from 'react'
import Link from 'next/link'

export default function PaywallBanner({ feature, description }: { feature: string, description: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      
      <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
        {feature} is a Pro feature
      </h2>
      
      <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
        {description} Upgrade to Fillr Pro to unlock this and premium AI models.
      </p>
      
      <Link 
        href="/dashboard/settings" 
        className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
      >
        <span>Upgrade to Pro</span>
        <span className="text-indigo-200 text-sm font-normal">— $9/mo</span>
      </Link>
    </div>
  )
}
