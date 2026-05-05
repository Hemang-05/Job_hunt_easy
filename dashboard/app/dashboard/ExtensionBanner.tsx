'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Zap } from 'lucide-react'

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
    <div className="glass-tile p-8 mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group">
      {/* Animated glow effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none group-hover:bg-indigo-600/20 transition-colors duration-700"></div>
      
      <div className="relative z-10 text-center sm:text-left">
        <h3 className="font-black text-2xl text-white mb-2 flex items-center justify-center sm:justify-start gap-3">
          <Zap className="w-6 h-6 text-indigo-400 fill-indigo-400" /> Install the Job Hunt Easy Extension
        </h3>
        <p className="text-white/50 text-sm font-medium max-w-md">
          You need the browser extension to autofill job applications across the web. Get it now to start applying 5× faster.
        </p>
      </div>
      <Link 
        href="/install" 
        className="cta-white relative z-10 shrink-0 px-8 py-4 text-base font-bold"
      >
        Install Now
      </Link>
    </div>
  )
}
