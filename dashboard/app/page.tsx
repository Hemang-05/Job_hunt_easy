'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Montserrat } from 'next/font/google'
import { Sparkles, Star, Repeat, Zap, TrendingUp, FileText, CheckCircle, Shield, EyeOff, Eye, Lock, Play, Check, X } from 'lucide-react'
import { useBrowser } from '@/hooks/useBrowser'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['500', '600', '700', '800', '900'] })

const ctas = [
  'Apply to 100 jobs in the time it takes to apply to 10',
  'More applications. More interviews. Less burnout.',
  'Stop retyping. Start interviewing.'
] as const

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const browserName = useBrowser()
  const extText = browserName ? (browserName === 'Safari' || browserName === 'Firefox' ? 'Get Extension' : `Add to ${browserName}`) : 'Get Extension'
  const [isIndia, setIsIndia] = useState(false)

  const [ctaIndex, setCtaIndex] = useState(0)
  const [ctaFade, setCtaFade] = useState(true)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible')
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el))

    // Detect India via IP to respect VPNs, fallback to timezone
    fetch('/api/geo')
      .then(res => res.json())
      .then(data => {
        if (data.country === 'IN') setIsIndia(true)
      })
      .catch(() => {
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
          if (tz === 'Asia/Calcutta' || tz === 'Asia/Kolkata') setIsIndia(true)
        } catch (e) {}
      })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCtaFade(false)
      setTimeout(() => {
        setCtaIndex((prev) => (prev + 1) % ctas.length)
        setCtaFade(true)
      }, 200)
    }, 3000)
    return () => clearInterval(interval)
  }, [])  

  const handleCtaSelect = (index: number) => {
    if (index === ctaIndex) return
    setCtaFade(false)
    setTimeout(() => {
      setCtaIndex(index)
      setCtaFade(true)
    }, 200)
  }

  const platforms = [
    { name: 'Workday', style: 'italic font-black tracking-tighter' },
    { name: 'Greenhouse', style: 'font-bold tracking-tight' },
    { name: 'Lever', style: 'font-medium tracking-wide' },
    { name: 'LinkedIn', style: 'font-extrabold' },
    { name: 'Indeed', style: 'font-black tracking-tighter italic' },
    { name: 'Ashby', style: 'font-semibold tracking-tight' },
    { name: 'Bullhorn', style: 'font-bold' },
    { name: 'SmartRecruiters', style: 'font-black tracking-tight' },
  ]

  return (
    <main
      className={`min-h-screen font-sans selection:bg-blue-200/40 text-[#1A1B2E] overflow-x-hidden relative ${montserrat.className}`}
      style={{ backgroundColor: '#F5F5F7' }}
    >
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Job Hunt Easy",
            "operatingSystem": "ChromeOS, Windows, macOS, Linux",
            "applicationCategory": "BrowserApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "description": "An AI-powered Chrome extension that autofills job applications on Workday, Greenhouse, Lever, and other major ATS platforms using your resume.",
            "url": "https://jobhunteasy.com"
          })
        }}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        /* Fade up */
        .fade-up {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1);
        }
        .fade-up.is-visible { opacity:1; transform:translateY(0); }
        .delay-100 { transition-delay: 100ms; }
        .delay-200 { transition-delay: 200ms; }
        .delay-300 { transition-delay: 300ms; }
        .delay-400 { transition-delay: 400ms; }

        /* Marquee */
        @keyframes scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll { animation: scroll 40s linear infinite; }
        .animate-scroll:hover { animation-play-state: paused; }

        /* Testimonial marquee — slower */
        @keyframes testimonial-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-testimonial-scroll { animation: testimonial-scroll 60s linear infinite; }
        .animate-testimonial-scroll:hover { animation-play-state: paused; }

        /* Step number decorative */
        .step-num {
          position: absolute;
          bottom: -12px;
          right: -8px;
          font-size: 160px;
          font-weight: 900;
          line-height: 1;
          color: rgba(0,0,0,0.04);
          pointer-events: none;
          user-select: none;
          letter-spacing: -8px;
        }

        /* Pro plan inner highlight */
        .pro-inner {
          background: rgba(37,99,235,0.04);
          border: 1px solid rgba(37,99,235,0.12);
          border-radius: 20px;
        }
        `
      }} />

      {/* ─── NAVBAR ─────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'py-3 px-6' : 'py-6 px-6'}`}>
        <div className={`mx-auto flex items-center justify-between transition-all duration-500 border ${isScrolled ? 'nav-scrolled max-w-5xl px-6 py-3' : 'max-w-[1440px] border-transparent rounded-full'}`}>
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Job Hunt Easy" width={32} height={32} className="rounded-full" />
            <span className="font-bold text-gray-900 tracking-tight text-xl hidden sm:block">Job Hunt Easy</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-semibold">
            <Link href="#how-it-works" className="hidden sm:block text-gray-500 hover:text-gray-900 transition-colors">How it works</Link>
            <Link href="#pricing" className="hidden sm:block text-gray-500 hover:text-gray-900 transition-colors">Pricing</Link>
            <SignedOut>
              <Link href="/sign-up?redirect_url=/install" className="cta-blue px-6 py-2.5 text-sm">
                Get started free
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="font-bold text-gray-900 hover:text-blue-600 transition-colors">Dashboard →</Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* ─── PAGE WRAPPER — padded so tiles breathe ─── */}
      <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 pt-24 pb-8 relative z-10">
        {/* ─── MAIN OVERARCHING TILE ─── */}
        <div className="bg-white rounded-[40px] sm:rounded-[60px] p-6 sm:p-12 border border-gray-200/60 shadow-[0_8px_40px_rgba(0,0,0,0.04)] space-y-6 relative overflow-hidden">

          {/* ══ HERO TILE ══════════════════════════════════════════ */}
          <div className="glass-tile overflow-hidden fade-up" style={{ minHeight: '560px' }}>
            <div className="relative flex flex-col md:flex-row min-h-[560px]">

              {/* Left Content Container */}
              <div className="relative z-10 flex flex-col justify-center px-6 sm:px-14 py-10 md:py-16 md:w-[58%] flex-shrink-0">
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 glass-pill text-gray-600 text-xs font-bold px-5 py-2 mb-8 w-fit">
                  <Sparkles className="w-4 h-4 text-blue-600" /> AI-Powered Job Application Autofill
                </div>

                {/* Rotating Headline */}
                <div className="mb-6 min-h-[120px] sm:min-h-[140px] flex flex-col justify-center">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-[1.05]">
                    <span className={`block transition-all duration-200 ${
                      ctaFade ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
                    }`}>
                      {ctas[ctaIndex]}
                    </span>
                  </h1>

                  {/* Pagination / Testing Dots */}
                  <div className="flex gap-2 mt-4 select-none">
                    {ctas.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCtaSelect(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === ctaIndex 
                            ? 'w-6 bg-blue-600' 
                            : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Test CTA Option ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Sub-headline description */}
                <p className="text-base sm:text-lg text-gray-500 mb-8 max-w-lg leading-relaxed">
                  Job Hunt Easy autofills every field on <strong className="text-gray-700">Workday, LinkedIn, Greenhouse, Lever, Naukri, Internshala</strong> and 1000+ more — using your resume and AI. What takes 30 minutes now takes 3.
                </p>

                {/* Stat Strip */}
                <div className="flex flex-wrap gap-3 mb-8">
                  {[
                    { icon: '⚡', stat: '10x faster', sub: 'than manual' },
                    { icon: '📋', stat: '3 mins/application', sub: 'vs 30 mins manual' },
                    { icon: '🎯', stat: '4x more interviews', sub: 'by applying to more jobs' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 px-4 py-2.5 rounded-full" style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}>
                      <span className="text-base">{item.icon}</span>
                      <div>
                        <div className="text-gray-900 text-xs font-extrabold leading-tight">{item.stat}</div>
                        <div className="text-gray-400 text-[10px] font-semibold leading-tight">{item.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <SignedOut>
                    <Link href="/sign-up?redirect_url=/install" className="cta-blue px-9 py-4 text-base flex items-center gap-2">
                      Add to Chrome — It&apos;s Free
                    </Link>
                    <Link href="#how-it-works" className="cta-ghost px-9 py-4 text-base flex items-center gap-2">
                      <Play className="w-4 h-4" /> Watch Demo
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard" className="cta-blue px-9 py-4 text-base">
                      Go to Dashboard
                    </Link>
                    <Link href="#how-it-works" className="cta-ghost px-9 py-4 text-base flex items-center gap-2">
                      <Play className="w-4 h-4" /> Watch Demo
                    </Link>
                  </SignedIn>
                </div>

                {/* Trust Strip */}
                <div className="mt-8 grid grid-cols-2 gap-y-3 gap-x-6">
                  {[
                    'Works on Workday',
                    'AI-generated answers',
                    'Privacy-first',
                    'Setup in under 2 minutes',
                    'No credit card',
                    'Free forever plan'
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-500 text-xs font-bold">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> {text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Comparison Block */}
              <div className="relative md:absolute md:right-8 md:top-10 md:bottom-10 md:w-[42%] flex flex-col justify-center hidden md:flex">
                <div className="p-8 border border-gray-200 bg-[#FFFFFF] rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] scale-105">
                  <h3 className="text-gray-600 font-extrabold text-center mb-6 uppercase tracking-widest text-sm">Why Wait?</h3>
                  
                  <div className="space-y-4">
                    {/* Headers */}
                    <div className="grid grid-cols-2 gap-6 border-b border-gray-100 pb-3">
                      <div className="text-gray-500 text-xs font-bold uppercase">Manual Applying</div>
                      <div className="text-blue-600 text-xs font-extrabold uppercase">Job Hunt Easy</div>
                    </div>

                    {[
                      { bad: '20–30 mins/app', good: '2–5 mins/app' },
                      { bad: 'Repetitive typing', good: 'One-click autofill' },
                      { bad: 'Burnout', good: 'Apply more, stress less' },
                      { bad: '8 apps/day max', good: '50+ apps/day' },
                      { bad: 'Miss deadlines', good: 'Never miss a role' },
                    ].map((row, i) => (
                      <div key={i} className="grid grid-cols-2 gap-6 items-center">
                        <div className="flex items-center gap-2.5 text-gray-700 font-semibold text-sm">
                          <X className="w-4 h-4 text-red-600 flex-shrink-0" /> {row.bad}
                        </div>
                        <div className="flex items-center gap-2.5 text-gray-900 font-bold text-sm">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> {row.good}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-5 border-t border-gray-100 text-center">
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                      <Zap className="w-4 h-4 fill-yellow-400 text-yellow-500" /> Save ~15 hours/week
                    </div>
                  </div>
                </div>
                <p className="text-center text-gray-400 text-xs font-semibold mt-4 italic">Most Pro users land their first interview within 11 days</p>
              </div>
            </div>
          </div>

          {/* ══ TESTIMONIAL MARQUEE STRIP ═══════════════════════════ */}
          <div className="overflow-hidden py-5 fade-up delay-100" style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="overflow-hidden">
              <div className="flex gap-5 whitespace-nowrap animate-testimonial-scroll items-center px-5">
                {[
                  { stars: '★★★★★', quote: '"Got 3 interviews in my first week"' },
                  { stars: '★★★★★', quote: '"Applied to 40 jobs in one afternoon"' },
                  { stars: '★★★★★', quote: '"This should be illegal, it\'s so good"' },
                  { stars: '★★★★★', quote: '"Got 3 interviews in my first week"' },
                  { stars: '★★★★★', quote: '"Applied to 40 jobs in one afternoon"' },
                  { stars: '★★★★★', quote: '"This should be illegal, it\'s so good"' },
                ].map((t, i) => (
                  <div key={i} className="inline-flex items-center gap-3 text-sm select-none px-5 py-3 rounded-full flex-shrink-0" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <span className="text-yellow-400 text-xs tracking-wider">{t.stars}</span>
                    <span className="text-gray-500 font-medium italic">{t.quote}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest mt-3">Trusted by 2,800+ job seekers</p>
          </div>

          {/* ══ PLATFORM MARQUEE ════════════════════════════════════ */}
          <div className="glass-tile px-8 py-5 overflow-hidden fade-up delay-200">
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest whitespace-nowrap flex-shrink-0">Works on</span>
              <div className="flex-1 overflow-hidden">
                <div className="flex gap-5 whitespace-nowrap animate-scroll">
                  {platforms.concat(platforms).map((p, i) => (
                    <span
                      key={i}
                      className={`glass-pill px-5 py-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-default select-none ${p.style}`}
                      style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ══ THREE PAIN-POINT CARDS ══════════════════════════════ */}
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                step: '01',
                headline: 'Stop Answering the Same Questions Twice',
                sub: 'Upload your resume once — Job Hunt Easy reads it and never asks you to retype your experience again.',
                icon: <Repeat className="w-8 h-8 text-blue-600" />,
              },
              {
                step: '02',
                headline: 'One Click Fills the Whole Form',
                sub: 'Long answers, short fields, cover letters — every section handled in seconds. Not copy-paste. Actual AI.',
                icon: <Zap className="w-8 h-8 text-blue-600" />,
              },
              {
                step: '03',
                headline: 'More Applications. More Interviews.',
                sub: 'Apply 5× faster and multiply your chances. The job market is a numbers game — now the numbers are on your side.',
                icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
              },
            ].map((card, i) => (
              <div
                key={card.step}
                className={`glass-tile p-8 sm:p-10 relative overflow-hidden flex flex-col justify-start fade-up delay-${(i + 1) * 100}`}
                style={{ minHeight: '280px' }}
              >
                <div className="step-num">{card.step}</div>
                <div className="mb-4 relative z-10">{card.icon}</div>
                <div className="relative z-10">
                  <h4 className="text-2xl font-black text-gray-900 mb-3 leading-tight tracking-tight">{card.headline}</h4>
                  <p className="text-gray-500 text-sm sm:text-base font-medium leading-relaxed">{card.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ══ HOW IT WORKS ════════════════════════════════════════ */}
          <div id="how-it-works" className="glass-tile p-12 sm:p-16 fade-up">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 text-center mb-4 tracking-tight leading-tight">
              Three Steps. Zero Repetition.
            </h2>
            <p className="text-center text-gray-500 font-semibold mb-14 text-lg">Hundreds of applications.</p>

            <div className="flex flex-col gap-8 md:gap-12 mb-14 max-w-4xl mx-auto">
              {[
                { step: '01', icon: <FileText className="w-8 h-8 text-blue-600" />, title: 'Drop your resume once', sub: 'PDF upload takes 5 seconds. It never leaves your device — 100% private.', align: 'self-start' },
                { step: '02', icon: <Sparkles className="w-8 h-8 text-blue-600" />, title: 'Hit Fill on any job form', sub: 'Our AI button appears automatically on every supported job board. No setup, no config.', align: 'self-end' },
                { step: '03', icon: <CheckCircle className="w-8 h-8 text-blue-600" />, title: 'Review, tweak, submit', sub: 'Every answer is yours to approve. AI suggests, you decide. Always.', align: 'self-start' },
              ].map((item, i) => (
                <div
                  key={item.step}
                  className={`relative overflow-hidden rounded-[24px] p-8 sm:p-10 flex flex-col fade-up delay-${(i + 1) * 100} w-full md:w-[65%] ${item.align} shadow-[0_12px_40px_rgba(0,0,0,0.04)] border border-gray-100 hover:border-gray-200/80 hover:-translate-y-1 transition-all duration-300`}
                  style={{
                    background: '#FFFFFF',
                    minHeight: '220px',
                  }}
                >
                  <div className="step-num">{item.step}</div>
                  <div className="mb-4 relative z-10">{item.icon}</div>
                  <h4 className="text-2xl font-black text-gray-900 mb-3 relative z-10">{item.title}</h4>
                  <p className="text-gray-600 text-base font-semibold leading-relaxed relative z-10">{item.sub}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link href="/sign-up?redirect_url=/install" className="cta-blue inline-block px-10 py-4 text-base">
                Try It Free — {extText}
              </Link>
            </div>
          </div>

          {/* ══ TRUST SECTION ═══════════════════════════════════════ */}
          <div className="glass-tile p-12 sm:p-16 fade-up">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 text-center mb-14 tracking-tight">
              Built for Job Seekers, Not Recruiters.
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { icon: <Shield className="w-6 h-6 text-blue-600" />, title: 'Your data stays on your device. Always.', desc: 'We never store, share, or sell your resume. Period.' },
                { icon: <EyeOff className="w-6 h-6 text-blue-600" />, title: 'You apply. We stay out of it.', desc: "No third-party sharing. Your search, your control." },
                { icon: <Eye className="w-6 h-6 text-blue-600" />, title: 'Every word is yours to approve.', desc: 'AI fills the field, you read it before you click submit. No surprises.' },
                { icon: <Lock className="w-6 h-6 text-blue-600" />, title: 'Bank-grade encryption on every request.', desc: 'Your communication with AI models is encrypted and never logged.' },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex gap-5 items-start p-7 rounded-[20px] fade-up delay-${(i % 2) * 100}`}
                  style={{
                    background: 'rgba(0,0,0,0.02)',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.12)' }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-lg mb-1.5 leading-snug">{item.title}</h4>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══ PRICING TILE ════════════════════════════════════════ */}
          <div id="pricing" className="glass-tile p-12 sm:p-16 fade-up">
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 text-center mb-16 tracking-tight leading-tight">
              Start Free. Upgrade When<br />You&apos;re Landing Interviews.
            </h2>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
              {/* Free Card */}
              <div className="flex flex-col rounded-[24px] p-8 sm:p-10 border border-gray-200 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-3">Free</p>
                <div className="text-5xl font-black text-gray-900 mb-1">$0<span className="text-xl text-gray-400 font-bold">/mo</span></div>
                <p className="text-sm text-gray-400 italic mb-8">For casual job seekers</p>

                <div className="space-y-4 flex-grow mb-10">
                  {['Autofill basic form fields', 'Up to 5 AI answers per day', 'Works on all job boards'].map(f => (
                    <div key={f} className="flex items-center gap-3 text-gray-600 font-semibold text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> {f}
                    </div>
                  ))}
                </div>

                <SignedOut>
                  <Link href="/sign-up?redirect_url=/install" className="cta-ghost w-full py-4 text-base text-center block">
                    Start for Free
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard" className="cta-ghost w-full py-4 text-base text-center block">
                    Go to Dashboard
                  </Link>
                </SignedIn>
              </div>

              {/* Pro Card */}
              <div className="flex flex-col rounded-[24px] p-8 sm:p-10 relative border-2 border-blue-500/30 shadow-[0_8px_40px_rgba(37,99,235,0.10)]" style={{ background: 'linear-gradient(180deg, rgba(37,99,235,0.03) 0%, #FFFFFF 100%)' }}>
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-blue-700 whitespace-nowrap"
                  style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.18)' }}
                >
                  Best for Active Job Seekers
                </div>

                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-3 mt-2">Pro Plan</p>
                <div className="text-5xl font-black text-gray-900 mb-1">{isIndia ? '₹299' : '$9.99'}<span className="text-xl text-gray-400 font-bold">{isIndia ? '' : '/mo'}</span></div>
                <p className="text-sm text-gray-400 italic mb-8">{isIndia ? 'One-time payment. Lifetime access.' : 'Cancel anytime. Most users land before month 2.'}</p>

                <div className="space-y-4 flex-grow mb-10">
                  {[
                    'Everything in Free',
                    'Unlimited long-form AI answers',
                    'Smart Application Tracking',
                    'Custom Job-Specific responses',
                    'Premium Models (Claude, GPT-4o)',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-3 text-gray-900 font-semibold text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" /> {f}
                    </div>
                  ))}
                </div>

                <SignedOut>
                  <Link href="/sign-up?redirect_url=/pricing" className="cta-blue w-full py-4 text-base text-center block">
                    {isIndia ? 'Get Lifetime Access — ₹299' : 'Get Unlimited — $9.99/mo'}
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/pricing" className="cta-blue w-full py-4 text-base text-center block">
                    {isIndia ? 'Get Lifetime Access — ₹299' : 'Get Unlimited — $9.99/mo'}
                  </Link>
                </SignedIn>
                <p className="text-gray-400 text-xs font-semibold mt-4 italic text-center">Join thousands already using Pro to land faster</p>
              </div>
            </div>
          </div>

          {/* ══ BOTTOM CTA TILE ══════════════════════════════════════ */}
          <div className="glass-tile p-14 sm:p-20 text-center relative overflow-hidden fade-up">
            {/* Inner radial glow */}
            <div
              className="absolute inset-0 pointer-events-none rounded-[28px]"
              style={{ background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.04) 0%, transparent 70%)' }}
            />
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-5 tracking-tight relative z-10">
              Still Filling Forms Manually?
            </h2>
            <p className="text-gray-500 text-lg font-medium mb-12 max-w-xl mx-auto leading-relaxed relative z-10">
              Every job application takes 20–40 minutes of your life.<br />Job Hunt Easy gives that back.
            </p>
            <SignedOut>
              <Link
                href="/sign-up?redirect_url=/install"
                className="cta-blue inline-block px-14 py-5 text-xl relative z-10 mb-5"
              >
                {extText}
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="cta-blue inline-block px-14 py-5 text-xl relative z-10 mb-5"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
            <p className="text-gray-400 text-xs font-semibold tracking-wide relative z-10">
              Takes 30 seconds to install. Works immediately.
            </p>
          </div>

          {/* ══ FOOTER ═══════════════════════════════════════════════ */}
          <div className="glass-tile p-10 sm:p-14 fade-up">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-5">
                  <Image src="/logo.png" alt="Job Hunt Easy" width={28} height={28} className="rounded-full" />
                  <span className="font-black text-gray-900 text-lg tracking-tight">Job Hunt Easy</span>
                </div>
                <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-xs">
                  AI Chrome extension that autofills job applications on Workday, Greenhouse, Lever, LinkedIn, Indeed & Ashby — saving job seekers hours every week.
                </p>
              </div>
              <div>
                <h4 className="text-gray-500 font-black text-xs uppercase tracking-widest mb-5">Product</h4>
                <ul className="space-y-3 text-sm text-gray-400 font-semibold">
                  <li><Link href="#how-it-works" className="hover:text-gray-900 transition-colors">How it works</Link></li>
                  <li><Link href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</Link></li>
                  <li><a href="#" className="hover:text-gray-900 transition-colors">Chrome Web Store</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-gray-500 font-black text-xs uppercase tracking-widest mb-5">Support</h4>
                <ul className="space-y-3 text-sm text-gray-400 font-semibold">
                  <li><a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-gray-900 transition-colors">Contact Support</a></li>
                </ul>
              </div>
            </div>
            <div
              className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-gray-400 text-xs font-semibold"
              style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
            >
              <span>© {new Date().getFullYear()} Job Hunt Easy. AI job application autofill · Workday · Greenhouse · Lever</span>
              <div className="flex gap-5">
                <Link href="/blog" className="hover:text-gray-900 transition-colors">Blog & Resources</Link>
                <a href="#" className="hover:text-gray-900 transition-colors">Twitter</a>
                <a href="#" className="hover:text-gray-900 transition-colors">LinkedIn</a>
              </div>
            </div>
          </div>
        </div>{/* end main tile */}
      </div>{/* end page wrapper */}

      {/* ─── STICKY MOBILE CTA ──────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 p-4 z-50 sm:hidden"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(0,0,0,0.06)' }}
      >
        <SignedOut>
          <Link
            href="/sign-up?redirect_url=/install"
            className="cta-blue block w-full py-4 text-center text-base"
          >
            {extText}
          </Link>
        </SignedOut>
        <SignedIn>
          <Link
            href="/dashboard"
            className="cta-blue block w-full py-4 text-center text-base"
          >
            Go to Dashboard
          </Link>
        </SignedIn>
      </div>

    </main>
  )
}
