'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

export default function InstallExtensionPage() {
  const { user } = useUser()
  const [isInstalled, setIsInstalled] = useState(false)

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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 font-sans">
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <div className="max-w-xl w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        {isInstalled ? (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 mx-auto bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-white tracking-tight mb-4">
              Extension Installed! 🎉
            </h1>
            
            <p className="text-slate-400 text-lg mb-8 leading-relaxed font-light">
              Great! The extension is active. Now, let&apos;s make sure you can find it easily when you need it.
            </p>

            <div className="bg-white/5 rounded-2xl p-6 mb-8 text-left border border-white/10">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4">Pro Tip: Pin it for easy access</h3>
              <ol className="space-y-4 text-slate-300 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">1</span>
                  <span>Click the <b>Extensions puzzle icon</b> (🧩) in the top right of Chrome.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">2</span>
                  <span>Find <b>Job Hunt Easy</b> in the list.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">3</span>
                  <span>Click the <b>Pin icon</b> (📌) to keep it visible!</span>
                </li>
              </ol>
            </div>

            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center gap-3 w-full px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]"
            >
              Go to Dashboard →
            </Link>
          </div>
        ) : (
          <div>
            <div className="w-20 h-20 mx-auto bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-8 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>

            <h1 className="text-3xl font-bold text-white tracking-tight mb-4">
              Welcome aboard{user?.firstName ? `, ${user.firstName}` : ''}! 🚀
            </h1>
            
            <p className="text-slate-400 text-lg mb-10 leading-relaxed font-light">
              You&apos;re just one click away from never typing a job application manually again. 
              Install the Job Hunt Easy Chrome extension to get started.
            </p>

            <a 
              href={CHROME_STORE_URL}
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 w-full px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-15h2v6h-2zM4.515 15.536l1.414-1.414 4.243 4.243-1.414 1.414zM18.07 9.879l1.414 1.414-4.243 4.243-1.414-1.414z"/>
              </svg>
              Add to Chrome
            </a>

            <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center justify-center gap-4 text-sm text-slate-500">
              <span>Already installed the extension?</span>
              <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Go to dashboard →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
