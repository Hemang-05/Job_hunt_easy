'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ExtensionBanner() {
  const [installed, setInstalled] = useState<boolean | null>(null)
  
  useEffect(() => {
    // Wait for the extension's content script to inject its attribute
    const checkInstallation = () => {
      const isInstalled = document.documentElement.hasAttribute('data-job-hunt-easy-installed')
      setInstalled(isInstalled)
    }

    checkInstallation()
    // Check multiple times in case of delayed execution
    setTimeout(checkInstallation, 500)
    setTimeout(checkInstallation, 1500)
  }, [])

  // If we haven't determined yet, or it is installed, don't show the banner
  if (installed === null || installed === true) return null

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-indigo-500/25 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="relative z-10 text-center sm:text-left">
        <h3 className="font-bold text-xl mb-1 flex items-center justify-center sm:justify-start gap-2">
          <span>🚀</span> Install the Job Hunt Easy Extension
        </h3>
        <p className="text-indigo-100 text-sm">
          You need the browser extension to autofill job applications across the web.
        </p>
      </div>
      <Link 
        href="/install" 
        className="relative z-10 shrink-0 bg-white text-indigo-700 px-6 py-3 rounded-full font-bold hover:bg-slate-50 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 text-sm"
      >
        Install Now
      </Link>
    </div>
  )
}
