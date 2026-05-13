'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Montserrat } from 'next/font/google'
import { Sparkles, Star, Repeat, Zap, TrendingUp, FileText, CheckCircle, Shield, EyeOff, Eye, Lock, Play, Check, X } from 'lucide-react'
import heroBg from '../public/hero-bg.png'
import { useBrowser } from '@/hooks/useBrowser'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['500', '600', '700', '800', '900'] })

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const browserName = useBrowser()
  const extText = browserName ? (browserName === 'Safari' || browserName === 'Firefox' ? 'Get Extension' : `Add to ${browserName}`) : 'Get Extension'
  const [isIndia, setIsIndia] = useState(false)

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
      className={`min-h-screen font-sans selection:bg-white/20 text-[#E0E4F5] overflow-x-hidden relative ${montserrat.className}`}
      style={{ backgroundColor: '#2F2FE4' }}
    >
      {/* Noise texture over solid blue bg */}
      <div
        className="fixed inset-0 z-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Subtle radial darker vignette at edges */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(22,46,147,0.55) 0%, transparent 70%)',
        }}
      />

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
        /* Glass tile — floats over solid blue */
        .glass-tile {
          background: linear-gradient(
            160deg,
            rgba(255,255,255,0.11) 0%,
            rgba(255,255,255,0.04) 100%
          );
          backdrop-filter: blur(32px) saturate(160%);
          -webkit-backdrop-filter: blur(32px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.18);
          border-bottom-color: rgba(255,255,255,0.08);
          border-right-color: rgba(255,255,255,0.08);
          border-radius: 28px;
          box-shadow:
            0 2px 0 rgba(255,255,255,0.15) inset,
            0 20px 60px rgba(8,6,22,0.35),
            0 1px 0 rgba(255,255,255,0.1);
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease, border-color 0.35s ease;
        }
        .glass-tile:hover {
          transform: translateY(-5px);
          border-color: rgba(255,255,255,0.28);
          box-shadow:
            0 2px 0 rgba(255,255,255,0.18) inset,
            0 28px 70px rgba(8,6,22,0.45);
        }

        /* Pill variant */
        .glass-pill {
          background: rgba(255,255,255,0.10);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 999px;
        }

        /* Navbar pill when scrolled */
        .nav-scrolled {
          background: linear-gradient(
            160deg,
            rgba(255,255,255,0.12) 0%,
            rgba(255,255,255,0.05) 100%
          );
          backdrop-filter: blur(24px) saturate(140%);
          -webkit-backdrop-filter: blur(24px) saturate(140%);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 999px;
          box-shadow: 0 12px 40px rgba(8,6,22,0.4);
        }

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

        /* White CTA button */
        .cta-white {
          background: #ffffff;
          color: #1A1953;
          border-radius: 14px;
          font-weight: 500;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          box-shadow: 0 0 0 0 rgba(255,255,255,0.3);
        }
        .cta-white:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 40px rgba(255,255,255,0.25);
        }
        .cta-white:active { transform: scale(0.97); }

        /* Outlined ghost CTA */
        .cta-ghost {
          background: rgba(255,255,255,0.08);
          color: #ffffff;
          border: 1.5px solid rgba(255,255,255,0.35);
          border-radius: 14px;
          font-weight: 700;
          transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
        }
        .cta-ghost:hover {
          background: rgba(255,255,255,0.16);
          border-color: rgba(255,255,255,0.6);
          transform: translateY(-2px);
        }

        /* Step number decorative */
        .step-num {
          position: absolute;
          bottom: -12px;
          right: -8px;
          font-size: 160px;
          font-weight: 900;
          line-height: 1;
          color: rgba(255,255,255,0.06);
          pointer-events: none;
          user-select: none;
          letter-spacing: -8px;
        }

        /* Pro plan inner highlight */
        .pro-inner {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 20px;
        }
        `
      }} />

      {/* ─── NAVBAR ─────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'py-3 px-6' : 'py-6 px-6'}`}>
        <div className={`mx-auto flex items-center justify-between transition-all duration-500 border ${isScrolled ? 'nav-scrolled max-w-5xl px-6 py-3' : 'max-w-[1440px] border-transparent rounded-full'}`}>
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Job Hunt Easy" width={32} height={32} className="rounded-full" />
            <span className="font-bold text-white tracking-tight text-xl hidden sm:block">Job Hunt Easy</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-semibold">
            <Link href="#how-it-works" className="hidden sm:block text-white/70 hover:text-white transition-colors">How it works</Link>
            <Link href="#pricing" className="hidden sm:block text-white/70 hover:text-white transition-colors">Pricing</Link>
            <SignedOut>
              <Link href="/sign-up?redirect_url=/install" className="cta-white px-6 py-2.5 text-sm">
                Get started free
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="font-bold text-white hover:text-white/80 transition-colors">Dashboard →</Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* ─── PAGE WRAPPER — padded so tiles breathe on blue ─── */}
      <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 pt-24 pb-8 relative z-10">
        {/* ─── MAIN OVERARCHING TILE ─── */}
        <div className="bg-[#0d1c30] rounded-[40px] sm:rounded-[60px] p-6 sm:p-12 border border-[rgba(255,255,255,0.15)] shadow-[0_40px_100px_rgba(8,6,22,0.8)] space-y-6 relative overflow-hidden">
          
          {/* Shiny overlay for the dark tile */}
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(7, 3, 35, 0.57) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.03) 100%)',
            }}
          />

        {/* ══ HERO TILE ══════════════════════════════════════════ */}
        <div className="glass-tile overflow-hidden fade-up" style={{ minHeight: '560px' }}>
          {/* Hero image fills right ~55% */}
          <div className="relative flex flex-col md:flex-row min-h-[560px]">

            {/* Left Content Container */}
            <div className="relative z-10 flex flex-col justify-center px-6 sm:px-14 py-10 md:py-16 md:w-[58%] flex-shrink-0">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 glass-pill text-white/80 text-xs font-bold px-5 py-2 mb-8 w-fit">
                <Sparkles className="w-4 h-4 text-white" /> AI-Powered Job Application Autofill
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05] mb-6">
                Stop Filling the Same Job Applications <span className="text-white/50">Again and Again</span>
              </h1>

              <p className="text-base sm:text-lg text-white/75 mb-10 max-w-lg leading-relaxed">
                Job Hunt Easy autofills applications across <strong>Workday, LinkedIn, Greenhouse, Lever</strong>, and more using your resume and AI-generated answers.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <SignedOut>
                  <Link href="/sign-up?redirect_url=/install" className="cta-white px-9 py-4 text-base flex items-center gap-2">
                    {extText}
                  </Link>
                  <Link href="#how-it-works" className="cta-ghost px-9 py-4 text-base flex items-center gap-2">
                    <Play className="w-4 h-4" /> Watch Demo
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard" className="cta-white px-9 py-4 text-base">
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
                  'Setup in under 2 minutes'
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/60 text-xs font-bold">
                    <CheckCircle className="w-4 h-4 text-green-400" /> {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison Block */}
            <div className="relative md:absolute md:right-8 md:top-10 md:bottom-10 md:w-[42%] flex flex-col justify-center hidden md:flex">
              <div className="glass-tile p-8 border-white/20 bg-white/5 backdrop-blur-xl scale-105">
                <h3 className="text-white font-bold text-center mb-8 uppercase tracking-widest text-sm opacity-50">Why Wait?</h3>
                
                <div className="space-y-6">
                  {/* Headers */}
                  <div className="grid grid-cols-2 gap-6 border-b border-white/10 pb-3">
                    <div className="text-white/40 text-xs font-black uppercase">Manual Applying</div>
                    <div className="text-blue-400 text-xs font-black uppercase">Job Hunt Easy</div>
                  </div>

                  {/* Row 1 */}
                  <div className="grid grid-cols-2 gap-6 items-center">
                    <div className="flex items-center gap-3 text-white/60 text-sm">
                      <X className="w-4 h-4 text-red-400 flex-shrink-0" /> 20–30 mins/app
                    </div>
                    <div className="flex items-center gap-3 text-white font-bold text-sm">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" /> 2–5 mins
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-2 gap-6 items-center">
                    <div className="flex items-center gap-3 text-white/60 text-sm">
                      <X className="w-4 h-4 text-red-400 flex-shrink-0" /> Repetitive typing
                    </div>
                    <div className="flex items-center gap-3 text-white font-bold text-sm">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" /> One-click autofill
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="grid grid-cols-2 gap-6 items-center">
                    <div className="flex items-center gap-3 text-white/60 text-sm">
                      <X className="w-4 h-4 text-red-400 flex-shrink-0" /> Burnout
                    </div>
                    <div className="flex items-center gap-3 text-white font-bold text-sm">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" /> Faster applications
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-white/10 text-center">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest">
                    <Zap className="w-4 h-4 fill-yellow-400 text-yellow-400" /> Save ~15 hours/week
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ PLATFORM MARQUEE ════════════════════════════════════ */}
        <div className="glass-tile px-8 py-5 overflow-hidden fade-up delay-100">
          <div className="flex items-center gap-4">
            <span className="text-white/35 text-xs font-bold uppercase tracking-widest whitespace-nowrap flex-shrink-0">Works on</span>
            <div className="flex-1 overflow-hidden">
              <div className="flex gap-5 whitespace-nowrap animate-scroll">
                {platforms.concat(platforms).map((p, i) => (
                  <span
                    key={i}
                    className={`glass-pill px-5 py-1.5 text-sm text-white/65 hover:text-white transition-colors cursor-default select-none ${p.style}`}
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
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
              icon: <Repeat className="w-8 h-8 text-white/90" />,
            },
            {
              step: '02',
              headline: 'One Click Fills the Whole Form',
              sub: 'Long answers, short fields, cover letters — every section handled in seconds. Not copy-paste. Actual AI.',
              icon: <Zap className="w-8 h-8 text-white/90" />,
            },
            {
              step: '03',
              headline: 'More Applications. More Interviews.',
              sub: 'Apply 5× faster and multiply your chances. The job market is a numbers game — now the numbers are on your side.',
              icon: <TrendingUp className="w-8 h-8 text-white/90" />,
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
                <h4 className="text-2xl font-black text-white mb-3 leading-tight tracking-tight">{card.headline}</h4>
                <p className="text-white/85 text-sm sm:text-base font-medium leading-relaxed">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ══ HOW IT WORKS ════════════════════════════════════════ */}
        <div id="how-it-works" className="glass-tile p-12 sm:p-16 fade-up">
          <h2 className="text-4xl sm:text-5xl font-black text-white text-center mb-4 tracking-tight leading-tight">
            Three Steps. Zero Repetition.
          </h2>
          <p className="text-center text-white/45 font-semibold mb-14 text-lg">Hundreds of applications.</p>

          <div className="grid md:grid-cols-3 gap-6 mb-14">
            {[
              { step: '01', icon: <FileText className="w-8 h-8 text-white/90" />, title: 'Drop your resume once', sub: 'PDF upload takes 5 seconds. It never leaves your device — 100% private.' },
              { step: '02', icon: <Sparkles className="w-8 h-8 text-white/90" />, title: 'Hit Fill on any job form', sub: 'Our AI button appears automatically on every supported job board. No setup, no config.' },
              { step: '03', icon: <CheckCircle className="w-8 h-8 text-white/90" />, title: 'Review, tweak, submit', sub: 'Every answer is yours to approve. AI suggests, you decide. Always.' },
            ].map((item, i) => (
              <div
                key={item.step}
                className={`relative overflow-hidden rounded-[20px] p-8 sm:p-9 flex flex-col fade-up delay-${(i + 1) * 100}`}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  minHeight: '280px',
                }}
              >
                <div className="step-num">{item.step}</div>
                <div className="mb-4 relative z-10">{item.icon}</div>
                <h4 className="text-xl font-black text-white mb-2 relative z-10">{item.title}</h4>
                <p className="text-white/80 text-sm font-medium leading-relaxed relative z-10">{item.sub}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/sign-up?redirect_url=/install" className="cta-white inline-block px-10 py-4 text-base">
              Try It Free — {extText}
            </Link>
          </div>
        </div>

        {/* ══ TRUST SECTION ═══════════════════════════════════════ */}
        <div className="glass-tile p-12 sm:p-16 fade-up">
          <h2 className="text-4xl sm:text-5xl font-black text-white text-center mb-14 tracking-tight">
            Built for Job Seekers, Not Recruiters.
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { icon: <Shield className="w-6 h-6 text-white/90" />, title: 'Your data stays on your device. Always.', desc: 'We never store, share, or sell your resume. Period.' },
              { icon: <EyeOff className="w-6 h-6 text-white/90" />, title: 'You apply. We stay out of it.', desc: "No third-party sharing. Your search, your control." },
              { icon: <Eye className="w-6 h-6 text-white/90" />, title: 'Every word is yours to approve.', desc: 'AI fills the field, you read it before you click submit. No surprises.' },
              { icon: <Lock className="w-6 h-6 text-white/90" />, title: 'Bank-grade encryption on every request.', desc: 'Your communication with AI models is encrypted and never logged.' },
            ].map((item, i) => (
              <div
                key={i}
                className={`flex gap-5 items-start p-7 rounded-[20px] fade-up delay-${(i % 2) * 100}`}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.11)',
                }}
              >
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-black text-white text-lg mb-1.5 leading-snug">{item.title}</h4>
                  <p className="text-white/55 text-sm font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ PRICING TILE ════════════════════════════════════════ */}
        <div id="pricing" className="glass-tile p-12 sm:p-16 fade-up">
          <h2 className="text-4xl sm:text-5xl font-black text-white text-center mb-16 tracking-tight leading-tight">
            Start Free. Upgrade When<br />You're Landing Interviews.
          </h2>

          {/* Free plan */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-10">
            <div className="text-center md:text-left flex-shrink-0">
              <p className="text-white/50 text-sm font-bold uppercase tracking-widest mb-2">Get Started</p>
              <div className="text-6xl font-black text-white">$0<span className="text-2xl text-white/40">/mo</span></div>
              <p className="text-sm text-white/40 italic mt-2">For casual job seekers</p>
            </div>
            <div className="space-y-3 flex-grow">
              {['Autofill basic form fields', 'Up to 5 AI answers per day', 'Works on all job boards'].map(f => (
                <div key={f} className="flex items-center gap-3 text-white/80 font-semibold text-sm">
                  <span className="text-white font-black">✓</span> {f}
                </div>
              ))}
            </div>
            <SignedOut>
              <Link href="/sign-up?redirect_url=/install" className="cta-ghost px-10 py-4 text-base whitespace-nowrap">
                Start for Free
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="cta-ghost px-10 py-4 text-base whitespace-nowrap">
                Go to Dashboard
              </Link>
            </SignedIn>
          </div>

          {/* Divider */}
          <div className="w-full h-px mb-10" style={{ background: 'rgba(255,255,255,0.12)' }} />

          {/* Pro plan */}
          <div className="pro-inner p-8 sm:p-10 relative">
            <div
              className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white whitespace-nowrap"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              Best for Active Job Seekers
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-10">
              <div className="text-center md:text-left flex-shrink-0">
                <p className="text-white/50 text-sm font-bold uppercase tracking-widest mb-2">Pro Plan</p>
                <div className="text-6xl font-black text-white">{isIndia ? '₹299' : '$9.99'}<span className="text-2xl text-white/40">{isIndia ? '' : '/mo'}</span></div>
                <p className="text-sm text-white/40 italic mt-2 max-w-[180px]">{isIndia ? 'One-time payment. Lifetime access.' : 'Cancel anytime. Most users land before month 2.'}</p>
              </div>
              <div className="space-y-3 flex-grow">
                {[
                  'Unlimited long-form AI answers',
                  'Smart Application Tracking',
                  'Custom Job-Specific responses',
                  'Premium Models (Claude, GPT-4o)',
                ].map(f => (
                  <div key={f} className="flex items-center gap-3 text-white font-semibold text-sm">
                    <span className="text-white font-black">✓</span> {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <SignedOut>
                <Link href="/sign-up?redirect_url=/pricing" className="cta-white inline-block w-full max-w-md px-8 py-5 text-lg">
                  {isIndia ? 'Get Lifetime Access — ₹299' : 'Get Unlimited — $9.99/mo'}
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/pricing" className="cta-white inline-block w-full max-w-md px-8 py-5 text-lg">
                  {isIndia ? 'Get Lifetime Access — ₹299' : 'Get Unlimited — $9.99/mo'}
                </Link>
              </SignedIn>
              <p className="text-white/35 text-xs font-semibold mt-4 italic">Join thousands already using Pro to land faster</p>
            </div>
          </div>
        </div>

        {/* ══ BOTTOM CTA TILE ══════════════════════════════════════ */}
        <div className="glass-tile p-14 sm:p-20 text-center relative overflow-hidden fade-up">
          {/* Inner radial glow */}
          <div
            className="absolute inset-0 pointer-events-none rounded-[28px]"
            style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.07) 0%, transparent 70%)' }}
          />
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 tracking-tight relative z-10">
            Still Filling Forms Manually?
          </h2>
          <p className="text-white/60 text-lg font-medium mb-12 max-w-xl mx-auto leading-relaxed relative z-10">
            Every job application takes 20–40 minutes of your life.<br />Job Hunt Easy gives that back.
          </p>
          <SignedOut>
            <Link
              href="/sign-up?redirect_url=/install"
              className="cta-white inline-block px-14 py-5 text-xl relative z-10 mb-5"
            >
              {extText}
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="cta-white inline-block px-14 py-5 text-xl relative z-10 mb-5"
            >
              Go to Dashboard
            </Link>
          </SignedIn>
          <p className="text-white/35 text-xs font-semibold tracking-wide relative z-10">
            Takes 30 seconds to install. Works immediately.
          </p>
        </div>

        {/* ══ FOOTER ═══════════════════════════════════════════════ */}
        <div className="glass-tile p-10 sm:p-14 fade-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-5">
                <Image src="/logo.png" alt="Job Hunt Easy" width={28} height={28} className="rounded-full" />
                <span className="font-black text-white text-lg tracking-tight">Job Hunt Easy</span>
              </div>
              <p className="text-white/40 text-sm font-medium leading-relaxed max-w-xs">
                AI Chrome extension that autofills job applications on Workday, Greenhouse, Lever, LinkedIn, Indeed & Ashby — saving job seekers hours every week.
              </p>
            </div>
            <div>
              <h4 className="text-white/60 font-black text-xs uppercase tracking-widest mb-5">Product</h4>
              <ul className="space-y-3 text-sm text-white/40 font-semibold">
                <li><Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Chrome Web Store</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white/60 font-black text-xs uppercase tracking-widest mb-5">Support</h4>
              <ul className="space-y-3 text-sm text-white/40 font-semibold">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>
          <div
            className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-white/25 text-xs font-semibold"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span>© {new Date().getFullYear()} Job Hunt Easy. AI job application autofill · Workday · Greenhouse · Lever</span>
            <div className="flex gap-5">
              <Link href="/blog" className="hover:text-white transition-colors">Blog & Resources</Link>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
        </div>{/* end main tile */}
      </div>{/* end page wrapper */}

      {/* ─── STICKY MOBILE CTA ──────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 p-4 z-50 sm:hidden"
        style={{ background: 'rgba(22,46,147,0.8)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.12)' }}
      >
        <SignedOut>
          <Link
            href="/sign-up?redirect_url=/install"
            className="cta-white block w-full py-4 text-center text-base"
          >
            {extText}
          </Link>
        </SignedOut>
        <SignedIn>
          <Link
            href="/dashboard"
            className="cta-white block w-full py-4 text-center text-base"
          >
            Go to Dashboard
          </Link>
        </SignedIn>
      </div>

    </main>
  )
}

//       </div>

//       {/* HERO OVERLAPPING THREE CARDS */}
//       <div className="max-w-[1440px] mx-auto px-6 -mt-16 relative z-20 mb-24">
//         <div className="grid md:grid-cols-3 gap-6">
//           {[
//             { step: '01', text: 'Drop your resume once. It never leaves your device.' },
//             { step: '02', text: 'AI Fill button appears on every supported job board automatically.' },
//             { step: '03', text: 'Review every answer before you submit. You stay in control.' },
//           ].map((item, i) => (
//             <div key={item.step} className={`glass-tile p-8 relative overflow-hidden fade-up delay-${(i + 1) * 100} min-h-[220px] flex flex-col justify-start`}>
//               <div className="absolute -bottom-8 -right-4 text-[160px] font-black text-[rgba(47,47,228,0.12)] leading-none select-none pointer-events-none">
//                 {item.step}
//               </div>
//               <p className="text-xl font-bold text-[#FAF3E1] relative z-10 leading-snug max-w-[85%]">{item.text}</p>
//             </div>
//           ))}
//         </div>

//         {/* Platform Marquee */}
//         <div className="w-full mt-16 relative overflow-hidden fade-up delay-300">
//           <div className="flex whitespace-nowrap overflow-hidden group">
//             <div className="flex gap-6 items-center animate-scroll">
//               {platforms.concat(platforms).map((p, i) => (
//                 <div key={i} className={`glass-pill px-6 py-2 text-[#E0E4F5]/70 border-[rgba(47,47,228,0.2)] bg-[rgba(47,47,228,0.05)] text-base hover:text-[#FAF3E1] hover:bg-[rgba(47,47,228,0.15)] transition-all cursor-default select-none ${p.style}`}>
//                   {p.name}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>


//       </div>

//       {/* How it works */}
//       <div id="how-it-works" className="bg-[#080616] py-24 relative">
//         <div className="max-w-[1440px] mx-auto px-6">
//           <h2 className={`${montserrat.className} text-4xl sm:text-5xl font-bold text-[#FAF3E1] text-center mb-20 tracking-tight leading-tight fade-up`}>
//             Three steps. Zero repetition.<br />
//             <span className="text-[#E0E4F5]/60">Hundreds of applications.</span>
//           </h2>
//           <div className="grid md:grid-cols-3 gap-8 mb-16">
//             {[
//               {
//                 step: '01',
//                 title: 'Drop your resume once',
//                 sub: 'PDF upload takes 5 seconds. It never leaves your device.',
//                 icon: '📄'
//               },
//               {
//                 step: '02',
//                 title: 'Hit Fill on any job form',
//                 sub: 'Our AI button appears automatically on every supported job board — no setup needed.',
//                 icon: '✨'
//               },
//               {
//                 step: '03',
//                 title: 'Review, tweak, submit',
//                 sub: 'Every answer is yours to approve. AI suggests, you decide.',
//                 icon: '✅'
//               },
//             ].map(({ step, title, sub, icon }, i) => (
//               <div key={step} className={`glass-tile p-10 relative overflow-hidden fade-up delay-${(i + 1) * 100} min-h-[340px] flex flex-col justify-center`}>
//                 <div className="absolute -bottom-6 -right-2 text-[160px] font-black text-[rgba(47,47,228,0.12)] leading-none select-none pointer-events-none">
//                   {step}
//                 </div>
//                 <div className="text-4xl mb-8 relative z-10">{icon}</div>
//                 <h3 className={`${montserrat.className} text-2xl font-bold text-[#FAF3E1] mb-3 tracking-tight relative z-10`}>{title}</h3>
//                 <p className="text-[#E0E4F5]/80 font-medium leading-relaxed relative z-10 max-w-[90%]">{sub}</p>
//               </div>
//             ))}
//           </div>
//           <div className="text-center mt-12 fade-up delay-300">
//             <Link
//               href="/sign-up?redirect_url=/install"
//               className="inline-block bg-[#2F2FE4] text-[#FFFFFF] px-10 py-4 rounded-[14px] text-lg font-bold hover:-translate-y-1 transition-all shadow-[0_0_32px_rgba(47,47,228,0.5)] active:scale-95"
//             >
//               Try It Free — Add to Chrome
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* Trust Section */}
//       <div className="py-24 relative">
//         <div className="max-w-6xl mx-auto px-6">
//           <h2 className={`${montserrat.className} text-4xl sm:text-5xl font-bold text-[#FAF3E1] text-center mb-16 tracking-tight fade-up`}>Built for job seekers, not recruiters.</h2>
//           <div className="grid sm:grid-cols-2 gap-8">
//             {[
//               { title: 'Your data stays on your device. Always.', desc: 'We never store, share, or sell your resume. Period.', icon: '🛡️' },
//               { title: 'You apply. We stay out of it.', desc: 'We don\'t hand your info to employers or third parties. Your search, your control.', icon: '🤐' },
//               { title: 'Every word is yours to approve.', desc: 'AI fills the field, you read it before you click submit. No surprises.', icon: '👀' },
//               { title: 'Bank-grade encryption on every request.', desc: 'Your communication with AI models is encrypted and never logged.', icon: '🔒' },
//             ].map((item, i) => (
//               <div key={i} className={`glass-tile p-8 flex gap-6 items-start fade-up delay-${(i % 2) * 100}`}>
//                 <div className="flex-shrink-0 text-3xl glass-pill w-14 h-14 flex items-center justify-center border-[rgba(47,47,228,0.3)] bg-[rgba(47,47,228,0.1)] shadow-inner">{item.icon}</div>
//                 <div>
//                   <h4 className={`${montserrat.className} font-bold text-[#FAF3E1] mb-2 text-xl leading-tight`}>{item.title}</h4>
//                   <p className="text-[#E0E4F5]/80 font-medium leading-relaxed">{item.desc}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Pricing */}
//       <div id="pricing" className="max-w-4xl mx-auto px-6 py-24 text-center">
//         <h2 className={`${montserrat.className} text-4xl sm:text-5xl font-bold text-[#FAF3E1] mb-16 tracking-tight fade-up`}>Start free. Upgrade when you're landing interviews.</h2>

//         <div className="glass-tile p-10 sm:p-14 text-left relative fade-up delay-100 flex flex-col items-center">

//           {/* Top Block - Free Plan */}
//           <div className="w-full flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
//             <div className="text-center md:text-left">
//               <h3 className={`${montserrat.className} text-3xl font-bold text-[#FAF3E1] mb-2`}>Get Started</h3>
//               <div className="text-5xl font-bold text-[#FAF3E1] mb-4">$0<span className="text-lg text-[#E0E4F5]/50">/mo</span></div>
//               <p className="text-sm font-medium text-[#E0E4F5]/60 italic">For casual job seekers</p>
//             </div>
//             <div className="flex-grow">
//               <div className="space-y-4">
//                 <div className="flex items-start gap-3 text-[#E0E4F5]/90 font-medium"><span className="text-[#2F2FE4] font-bold mt-0.5">✓</span> Autofill basic form fields</div>
//                 <div className="flex items-start gap-3 text-[#E0E4F5]/90 font-medium"><span className="text-[#2F2FE4] font-bold mt-0.5">✓</span> Up to 5 AI answers per day</div>
//                 <div className="flex items-start gap-3 text-[#E0E4F5]/90 font-medium"><span className="text-[#2F2FE4] font-bold mt-0.5">✓</span> Works on all job boards</div>
//               </div>
//             </div>
//             <div className="w-full md:w-auto text-center">
//               <Link href="/sign-up?redirect_url=/install" className="inline-block glass-pill border-[rgba(47,47,228,0.5)] text-[#FAF3E1] px-10 py-4 rounded-[14px] font-bold hover:bg-[rgba(47,47,228,0.15)] transition-all">Start for Free</Link>
//             </div>
//           </div>

//           {/* Divider */}
//           <div className="w-full h-px bg-[rgba(47,47,228,0.2)] mb-12"></div>

//           {/* Bottom Block - Pro Plan */}
//           <div className="w-full relative bg-[rgba(22,46,147,0.15)] p-8 sm:p-10 rounded-2xl border border-[rgba(47,47,228,0.2)]">
//             <div className="absolute -top-4 left-1/2 -translate-x-1/2 glass-pill bg-[rgba(47,47,228,0.2)] border-[rgba(47,47,228,0.4)] text-[#FFFFFF] text-xs font-bold px-4 py-1.5 uppercase tracking-wider shadow-[0_0_15px_rgba(47,47,228,0.3)]">Best for Active Job Seekers</div>

//             <div className="flex flex-col md:flex-row justify-between items-center gap-10">
//               <div className="text-center md:text-left flex-shrink-0">
//                 <h3 className={`${montserrat.className} text-3xl font-bold text-[#FAF3E1] mb-2`}>Pro Plan</h3>
//                 <div className="text-5xl font-bold text-[#FAF3E1] mb-4">$9<span className="text-lg text-[#E0E4F5]/50">/mo</span></div>
//                 <p className="text-sm font-medium text-[#E0E4F5]/60 italic max-w-xs">Cancel anytime. Most users land before month 2.</p>
//               </div>

//               <div className="flex-grow space-y-4">
//                 <div className="flex items-start gap-3 text-[#FAF3E1] font-medium"><span className="text-[#2F2FE4] font-bold mt-0.5">✓</span> Unlimited long-form AI answers</div>
//                 <div className="flex items-start gap-3 text-[#FAF3E1] font-medium"><span className="text-[#2F2FE4] font-bold mt-0.5">✓</span> Smart Application Tracking</div>
//                 <div className="flex items-start gap-3 text-[#FAF3E1] font-medium"><span className="text-[#2F2FE4] font-bold mt-0.5">✓</span> Custom Job-Specific responses</div>
//                 <div className="flex items-start gap-3 text-[#FAF3E1] font-medium"><span className="text-[#2F2FE4] font-bold mt-0.5">✓</span> Premium Models (Claude, GPT-4o)</div>
//               </div>
//             </div>

//             <div className="w-full mt-10 text-center flex flex-col items-center">
//               <Link href="/sign-up?redirect_url=/install" className="block w-full text-center bg-[#2F2FE4] text-[#FFFFFF] px-8 py-5 rounded-[14px] font-bold hover:-translate-y-1 transition-all shadow-[0_0_32px_rgba(47,47,228,0.5)] active:scale-95 text-lg">Get Unlimited — $9/mo</Link>
//               <p className="text-sm font-medium text-[#E0E4F5]/60 mt-4 italic">Join thousands already using Pro to land faster</p>
//             </div>
//           </div>

//         </div>
//       </div>

//       {/* Bottom CTA Closer */}
//       <div className="py-24 text-center relative px-6">
//         <div className="max-w-5xl mx-auto glass-tile p-14 sm:p-24 relative z-10 fade-up shadow-[0_20px_50px_rgba(8,6,22,0.6)]">
//           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(47,47,228,0.15),transparent_70%)] rounded-[28px] pointer-events-none"></div>
//           <h2 className={`${montserrat.className} text-4xl sm:text-5xl font-bold mb-6 tracking-tight text-[#FAF3E1] relative z-10`}>Still filling forms manually?</h2>
//           <p className="text-lg text-[#E0E4F5]/80 mb-12 max-w-2xl mx-auto font-medium leading-relaxed relative z-10">
//             Every job application takes 20–40 minutes of your life. Job Hunt Easy gives that back.
//           </p>
//           <Link
//             href="/sign-up?redirect_url=/install"
//             className="inline-block bg-[#2F2FE4] text-[#FFFFFF] px-12 py-5 rounded-[14px] text-xl font-bold hover:-translate-y-1 transition-all shadow-[0_0_32px_rgba(47,47,228,0.5)] active:scale-95 mb-6 relative z-10"
//           >
//             Add to Chrome
//           </Link>
//           <p className="text-sm font-medium text-[#E0E4F5]/60 tracking-wide relative z-10">
//             Takes 30 seconds to install. Works immediately.
//           </p>
//         </div>
//       </div>

//       {/* Footer */}
//       <footer className="max-w-[1440px] mx-auto px-6 py-16 mt-10">
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16 border-t border-[rgba(47,47,228,0.2)] pt-16">
//           <div className="col-span-2">
//             <div className="flex items-center gap-2 mb-6 opacity-80 hover:opacity-100 transition-opacity">
//               <div className="w-6 h-6 rounded bg-[rgba(47,47,228,0.2)] flex items-center justify-center text-[#FAF3E1] text-xs font-bold border border-[rgba(47,47,228,0.4)]">J</div>
//               <span className={`${montserrat.className} font-bold text-[#FAF3E1] tracking-tight text-lg`}>Job Hunt Easy</span>
//             </div>
//             <p className="text-[#E0E4F5]/60 text-sm max-w-sm font-medium leading-relaxed">
//               Job Hunt Easy is a Chrome extension that uses AI to autofill job applications on Workday, Greenhouse, Lever, LinkedIn, Indeed, and Ashby — saving job seekers hours of repetitive typing every week.
//             </p>
//           </div>
//           <div>
//             <h4 className="text-[#FAF3E1]/80 font-bold mb-6 text-sm uppercase tracking-wider">Product</h4>
//             <ul className="space-y-4 text-sm text-[#E0E4F5]/60 font-medium">
//               <li><Link href="#how-it-works" className="hover:text-[#FAF3E1] transition-colors">How it works</Link></li>
//               <li><Link href="#pricing" className="hover:text-[#FAF3E1] transition-colors">Pricing</Link></li>
//               <li><a href="#" className="hover:text-[#FAF3E1] transition-colors">Chrome Web Store</a></li>
//             </ul>
//           </div>
//           <div>
//             <h4 className="text-[#FAF3E1]/80 font-bold mb-6 text-sm uppercase tracking-wider">Support</h4>
//             <ul className="space-y-4 text-sm text-[#E0E4F5]/60 font-medium">
//               <li><a href="#" className="hover:text-[#FAF3E1] transition-colors">Privacy Policy</a></li>
//               <li><a href="#" className="hover:text-[#FAF3E1] transition-colors">Terms of Service</a></li>
//               <li><a href="#" className="hover:text-[#FAF3E1] transition-colors">Contact Support</a></li>
//             </ul>
//           </div>
//         </div>
//         <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-[rgba(47,47,228,0.1)] text-[#E0E4F5]/40 text-xs font-medium">
//           <div>© {new Date().getFullYear()} Job Hunt Easy. AI job application autofill.</div>
//           <div className="flex items-center gap-6">
//             <a href="#" className="hover:text-[#FAF3E1] transition-colors">Twitter</a>
//             <a href="#" className="hover:text-[#FAF3E1] transition-colors">LinkedIn</a>
//           </div>
//         </div>
//       </footer>

//       {/* Sticky Mobile CTA */}
//       <div className="fixed bottom-0 left-0 right-0 p-4 z-50 sm:hidden glass-tile rounded-b-none border-b-0 border-x-0 bg-[#080616]/80">
//         <Link
//           href="/sign-up?redirect_url=/install"
//           className="block w-full bg-[#2F2FE4] text-[#FFFFFF] py-4 rounded-[14px] font-bold text-center shadow-[0_0_24px_rgba(47,47,228,0.4)]"
//         >
//           Add to Chrome Free
//         </Link>
//       </div>
//     </main>
//   )
// }
