import Link from 'next/link'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 font-sans selection:bg-indigo-500/30 text-slate-200">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold tracking-tight shadow-lg shadow-indigo-500/20">
            J
          </div>
          <span className="font-semibold text-white tracking-tight text-xl">Job Hunt Easy</span>
        </div>
        <div className="flex items-center gap-5">
          <SignedOut>
            <Link
              href="/sign-in"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up?redirect_url=/install"
              className="text-sm bg-white text-slate-900 px-5 py-2.5 rounded-full font-semibold hover:bg-slate-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95"
            >
              Get started free
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Dashboard →
            </Link>
            <div className="ring-2 ring-indigo-500/20 rounded-full p-0.5">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-8 pt-32 pb-20 text-center relative">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-indigo-500/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none"></div>
        
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          AI-powered · Works on any form
        </div>
        
        <h1 className="text-6xl sm:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-8">
          Fill any form with AI
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            using your resume
          </span>
        </h1>
        
        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
          Job applications, scholarships, visa forms — upload your resume once
          and let an expert AI answer any question exactly in your voice.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <SignedOut>
            <Link
              href="/sign-up?redirect_url=/install"
              className="group relative bg-indigo-600 text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              Add to Chrome — it's free
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/install"
              className="group relative bg-indigo-600 text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              Install the Extension
            </Link>
          </SignedIn>
        </div>
        <p className="text-sm text-slate-500 mt-6 flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          Your resume never leaves your device. 100% private.
        </p>
      </div>

      {/* How it works */}
      <div id="how-it-works" className="max-w-5xl mx-auto px-8 py-24 relative border-t border-white/5">
        <h2 className="text-3xl font-bold text-white text-center mb-16 tracking-tight">
          Three steps to effortless applications
        </h2>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              step: '01',
              icon: '📄',
              title: 'Upload your resume',
              desc: 'Drop your PDF in the extension. It gets parsed and stored locally — never sent to our servers.',
            },
            {
              step: '02',
              icon: 'click',
              title: 'Click any form field',
              desc: 'Our button automatically appears on any input field across the web. Click it to trigger the AI.',
            },
            {
              step: '03',
              icon: '✨',
              title: 'Review and submit',
              desc: 'The perfect answer streams in instantly, tailored uniquely to your background. Edit if needed, then submit.',
            },
          ].map(({ step, title, desc, icon }) => (
            <div key={step} className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-colors overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-hover:via-indigo-500/50 transition-all"></div>
              <div className="text-4xl mb-6 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform origin-left">
                {icon === 'click' ? (
                  <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
                ) : icon}
              </div>
              <div className="text-sm font-bold text-indigo-400 mb-2 tracking-widest uppercase">Step {step}</div>
              <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">{title}</h3>
              <p className="text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Placeholder */}
      <div className="max-w-5xl mx-auto px-8 py-24 border-t border-white/5 text-center">
         <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Simple Pricing</h2>
         <p className="text-slate-400 mb-12">Start for free. Upgrade when you need more power.</p>
         
         <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto text-left">
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10">
               <h3 className="text-xl font-semibold text-white mb-2">Free</h3>
               <div className="text-3xl font-bold text-white mb-6">$0<span className="text-base font-normal text-slate-500">/mo</span></div>
               <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-slate-300"><span className="text-emerald-400">✓</span> Standard Qwen AI Model</li>
                  <li className="flex items-center gap-3 text-slate-300"><span className="text-emerald-400">✓</span> Unlimited short answers</li>
                  <li className="flex items-center gap-3 text-slate-300"><span className="text-emerald-400">✓</span> Up to 2 regenerations per question</li>
               </ul>
               <Link href="/sign-up?redirect_url=/install" className="block text-center bg-white/[0.05] hover:bg-white/[0.1] text-white px-6 py-3 rounded-full font-medium transition-colors border border-white/10">Get Started</Link>
            </div>
            
            <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-500/10 to-transparent border border-indigo-500/30 relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Popular</div>
               <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
               <div className="text-3xl font-bold text-white mb-6">$9<span className="text-base font-normal text-slate-500">/mo</span></div>
               <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-slate-300"><span className="text-emerald-400">✓</span> Premium Models (Claude, Gemini, GPT-4o)</li>
                  <li className="flex items-center gap-3 text-slate-300"><span className="text-emerald-400">✓</span> Unlimited regenerations</li>
                  <li className="flex items-center gap-3 text-slate-300"><span className="text-emerald-400">✓</span> Automatic Job Tracking Dashboard</li>
               </ul>
               {/* MONETIZE: Connect to Stripe Checkout */}
               <Link href="/sign-up?redirect_url=/install" className="block text-center bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-full font-medium transition-colors shadow-[0_0_15px_rgba(99,102,241,0.4)]">Upgrade to Pro</Link>
            </div>
         </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-slate-500 text-sm border-t border-white/5">
        Created by Hemang M <span className="opacity-70 font-medium">( Job Hunt Easy )</span>
      </footer>
    </main>
  )
}
