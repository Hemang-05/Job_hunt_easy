'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { CheckCircle, Zap } from 'lucide-react'
import { useBrowser } from '@/hooks/useBrowser'

export default function InstallExtensionPage() {
  const { user } = useUser()
  const [isInstalled, setIsInstalled] = useState(false)
  const browserName = useBrowser()
  const extText = browserName ? (browserName === 'Safari' || browserName === 'Firefox' ? 'Get Extension' : `Add to ${browserName}`) : 'Get Extension'

  const CHROME_STORE_URL = "https://chromewebstore.google.com/detail/iapgnkfpabeiocdjibgcifidmmjgjpja?utm_source=item-share-cb"

  useEffect(() => {
    // Check if the extension is already installed
    // The content script sets this attribute on the html element
    const checkInstallation = () => {
      const installed = document.documentElement.getAttribute('data-job-hunt-easy-installed') === 'true'
      setIsInstalled(installed)
    }

    checkInstallation()
    
    // Also listen for changes (in case they install and come back)
    const observer = new MutationObserver(checkInstallation)
    observer.observe(document.documentElement, { attributes: true })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-[#080616] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl glass-tile p-10 text-center relative z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-indigo-500 rounded-b-full"></div>
        
        {isInstalled ? (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 mx-auto bg-indigo-500/10 rounded-[28px] flex items-center justify-center mb-8 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
              <CheckCircle className="w-10 h-10 text-indigo-400" />
            </div>

            <h1 className="text-3xl font-black text-white tracking-tight mb-4">
              Extension Installed!
            </h1>
            
            <p className="text-white/50 text-lg mb-10 leading-relaxed font-medium">
              Great! The extension is active. Now, let&apos;s make sure you can find it easily when you need it.
            </p>

            <div className="bg-white/5 rounded-3xl p-8 mb-10 text-left border border-white/5">
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-6">Pro Tip: Pin it for easy access</h3>
              <ol className="space-y-5 text-white/70 text-sm font-medium">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xs">1</span>
                  <span>Click the <b>Extensions puzzle icon</b> (🧩) in the top right of Chrome.</span>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xs">2</span>
                  <span>Find <b>Job Hunt Easy</b> in the list.</span>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xs">3</span>
                  <span>Click the <b>Pin icon</b> (📌) to keep it visible!</span>
                </li>
              </ol>
            </div>

            <Link 
              href="/dashboard"
              className="cta-white inline-flex items-center justify-center gap-3 w-full px-8 py-5 text-lg font-black"
            >
              Go to Dashboard →
            </Link>
          </div>
        ) : (
          <div>
            <div className="w-20 h-20 mx-auto bg-indigo-500/10 rounded-[28px] flex items-center justify-center mb-8 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
              <Zap className="w-10 h-10 text-indigo-400 fill-indigo-400" />
            </div>

            <h1 className="text-4xl font-black text-white tracking-tight mb-4">
              Welcome aboard! 🚀
            </h1>
            
            <p className="text-white/50 text-lg mb-10 leading-relaxed font-medium">
              You&apos;re just one click away from never typing a job application manually again.
            </p>

            <a 
              href={CHROME_STORE_URL}
              target="_blank" 
              rel="noopener noreferrer"
              className="cta-white inline-flex items-center justify-center gap-3 w-full px-8 py-5 text-lg font-black"
            >
              {extText}
            </a>

            <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center justify-center gap-4 text-sm font-bold">
              <span className="text-white/30">Already installed the extension?</span>
              <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest text-xs">
                Go to dashboard →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
