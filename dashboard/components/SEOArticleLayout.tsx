'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { ArrowLeft, CheckCircle } from 'lucide-react'

interface SEOArticleLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  publishDate?: string
}

export function SEOArticleLayout({ children, title, subtitle, publishDate }: SEOArticleLayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen font-sans text-[#E0E4F5] selection:bg-white/20 overflow-x-hidden relative" style={{ backgroundColor: '#2F2FE4' }}>
      {/* Background noise/gradients to match landing page */}
      <div
        className="fixed inset-0 z-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-4 px-6 bg-[#2F2FE4]/90 backdrop-blur-md shadow-lg shadow-black/10 border-b border-white/5' : 'py-6 px-6'}`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-sm border border-white/30">
              J
            </div>
            <span className="font-bold text-white tracking-tight hidden sm:block">Job Hunt Easy</span>
          </Link>
          <div className="flex items-center gap-6 text-sm font-semibold">
            <SignedOut>
              <Link href="/sign-up?redirect_url=/install" className="bg-white text-[#2F2FE4] px-6 py-2.5 rounded-2xl font-bold hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(255,255,255,0.25)] transition-all">
                Add to Chrome — Free
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="text-white hover:text-indigo-400 transition-colors">Dashboard</Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Article Header */}
      <header className="pt-32 pb-16 px-6 relative z-10 border-b border-white/5">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-bold mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-white/60 font-medium leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
          {publishDate && (
            <p className="text-white/30 text-xs font-bold tracking-widest uppercase mt-8">
              Updated: {publishDate}
            </p>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-6 py-16 relative z-10">
        <article className="
          [&>h2]:text-3xl [&>h2]:font-black [&>h2]:text-white [&>h2]:mt-12 [&>h2]:mb-6 [&>h2]:tracking-tight
          [&>h3]:text-2xl [&>h3]:font-black [&>h3]:text-white [&>h3]:mt-10 [&>h3]:mb-4
          [&>p]:text-white/70 [&>p]:leading-relaxed [&>p]:font-medium [&>p]:mb-6 [&>p]:text-lg
          [&>ul]:text-white/70 [&>ul]:font-medium [&>ul]:mb-6 [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-2 [&>ul>li]:leading-relaxed
          [&>ol]:text-white/70 [&>ol]:font-medium [&>ol]:mb-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol>li]:mb-2 [&>ol>li]:leading-relaxed
          [&>strong]:text-white [&>strong]:font-bold
          [&>a]:text-white [&>a]:underline [&>a]:font-bold hover:[&>a]:opacity-80 [&>a]:transition-opacity
        ">
          {children}
        </article>

        {/* Inline CTA block for the article body */}
        <div className="mt-16 p-8 md:p-10 bg-white/5 border border-white/10 rounded-3xl text-center shadow-xl">
          <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Tired of typing out applications manually?</h3>
          <p className="text-white/80 font-medium mb-8">Job Hunt Easy is a free Chrome Extension that uses AI to autofill Workday, Greenhouse, and Lever forms in seconds.</p>
          <ul className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mb-8 text-sm font-bold text-white/90">
            <li className="flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Free forever</li>
            <li className="flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> 100% Private</li>
            <li className="flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Supports all major ATS</li>
          </ul>
          <Link href="/sign-up?redirect_url=/install" className="inline-block bg-white text-[#2F2FE4] px-8 py-4 rounded-2xl font-black text-lg hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(255,255,255,0.25)] transition-all">
            Install the Extension Now
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 text-center relative z-10">
        <p className="text-white/30 text-sm font-bold tracking-wider">
          © {new Date().getFullYear()} Job Hunt Easy. Built to help you land faster.
        </p>
      </footer>
    </div>
  )
}
