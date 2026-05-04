import Link from 'next/link'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

export default function LandingPage() {
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
    <main className="min-h-screen bg-slate-950 font-sans selection:bg-indigo-500/30 text-slate-200 overflow-x-hidden">
      {/* Custom Marquee Animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}} />

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
        <div className="flex items-center gap-5 text-sm">
          <Link href="#how-it-works" className="hidden sm:block text-slate-400 hover:text-white transition-colors">How it works</Link>
          <Link href="#pricing" className="hidden sm:block text-slate-400 hover:text-white transition-colors">Pricing</Link>
          <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
          <SignedOut>
            <Link
              href="/sign-in"
              className="font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up?redirect_url=/install"
              className="bg-white text-slate-900 px-5 py-2.5 rounded-full font-semibold hover:bg-slate-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95"
            >
              Get started free
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
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
      <div className="max-w-5xl mx-auto px-8 pt-24 pb-16 text-center relative">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-indigo-500/20 rounded-full blur-[120px] -z-10 mix-blend-screen pointer-events-none"></div>
        
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Trusted by Job Seekers · Works on Workday, Greenhouse & Lever
        </div>
        
        <h1 className="text-6xl sm:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-8">
          Apply to jobs 5x faster
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            using your resume
          </span>
        </h1>
        
        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
          Stop filling the same job application again and again. Upload your resume once 
          and let AI autofill repetitive forms instantly.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <SignedOut>
            <Link
              href="/sign-up?redirect_url=/install"
              className="group relative bg-indigo-600 text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              Add to Chrome — It's Free
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/install"
              className="group relative bg-indigo-600 text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              Install the Extension
            </Link>
          </SignedIn>
        </div>

        {/* Product Visual Placeholder */}
        <div className="mt-20 max-w-4xl mx-auto rounded-3xl border border-white/10 bg-slate-900/50 aspect-video flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 group-hover:opacity-100 transition-opacity"></div>
          <svg className="w-16 h-16 text-indigo-500/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
          <h3 className="text-xl font-semibold text-white/60 mb-2">[ PRODUCT DEMO VIDEO / GIF ]</h3>
          <p className="text-slate-500 max-w-md">
            Show a Workday form being filled automatically by the extension in 3 seconds. 
            Highlight the "Fill with AI" button in action.
          </p>
        </div>
      </div>

      {/* Platform Support Section (Infinite Marquee) */}
      <div className="w-full py-16 border-y border-white/5 bg-white/[0.01] overflow-hidden relative">
        <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-10">Works seamlessly with</p>
        
        <div className="flex whitespace-nowrap overflow-hidden group">
          <div className="flex gap-20 items-center animate-scroll">
            {/* First Set of Logos */}
            {platforms.map((p, i) => (
              <div key={i} className={`text-3xl text-white/40 hover:text-white transition-all cursor-default select-none ${p.style}`}>
                {p.name}
              </div>
            ))}
            {/* Duplicate Set for Infinite Loop */}
            {platforms.map((p, i) => (
              <div key={`dup-${i}`} className={`text-3xl text-white/40 hover:text-white transition-all cursor-default select-none ${p.style}`}>
                {p.name}
              </div>
            ))}
          </div>
        </div>
        
        {/* Faded Edges for Smooth Look */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none"></div>
      </div>

      {/* How it works */}
      <div id="how-it-works" className="max-w-5xl mx-auto px-8 py-32 relative">
        <h2 className="text-4xl font-bold text-white text-center mb-20 tracking-tight">
          How to apply in seconds
        </h2>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              step: '01',
              icon: '📄',
              title: 'Upload your resume',
              desc: 'Drop your PDF in the extension. It stays stored locally on your device for 100% privacy.',
            },
            {
              step: '02',
              icon: 'click',
              title: 'Click the AI button',
              desc: 'Our "Fill with AI" button appears instantly on any job application form field.',
            },
            {
              step: '03',
              icon: '✨',
              title: 'Review and Submit',
              desc: 'AI generates answers based on your experience. Review, tweak if needed, and hit submit.',
            },
          ].map(({ step, title, desc, icon }) => (
            <div key={step} className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-colors overflow-hidden text-center">
              <div className="text-4xl mb-6 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform flex justify-center">
                {icon === 'click' ? (
                  <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
                ) : icon}
              </div>
              <div className="text-sm font-bold text-indigo-400 mb-2 tracking-widest uppercase">Step {step}</div>
              <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">{title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-indigo-600/5 py-32 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-16 tracking-tight">Why users trust Job Hunt Easy</h2>
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10 text-left">
            {[
              { title: '100% Private', desc: 'Your resume and data are stored locally. We never sell your personal info.' },
              { title: 'No Recruiter Spam', desc: 'We don\'t share your applications with third parties. You stay in control.' },
              { title: 'Full Transparency', desc: 'The AI answers appear in the fields. You review every word before submitting.' },
              { title: 'Secure & Encrypted', desc: 'All communications with AI models are encrypted and temporary.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">✓</div>
                <div>
                  <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="max-w-5xl mx-auto px-8 py-32 text-center">
         <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Simple, outcome-based pricing</h2>
         <p className="text-slate-400 mb-20 max-w-xl mx-auto text-lg leading-relaxed">Start applying faster today. Upgrade only when you need unlimited power.</p>
         
         <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto text-left items-stretch">
            <div className="p-10 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col relative overflow-hidden">
               <h3 className="text-2xl font-bold text-white mb-2">Free Forever</h3>
               <div className="text-4xl font-black text-white mb-8">$0<span className="text-lg font-normal text-slate-500">/mo</span></div>
               <ul className="space-y-4 mb-10 flex-grow">
                  <li className="flex items-center gap-3 text-slate-300"><span className="text-emerald-400">✓</span> Autofill basic form fields</li>
                  <li className="flex items-center gap-3 text-slate-300"><span className="text-emerald-400">✓</span> Up to 5 AI answers per day</li>
                  <li className="flex items-center gap-3 text-slate-300"><span className="text-emerald-400">✓</span> Works on all job boards</li>
               </ul>
               <Link href="/sign-up?redirect_url=/install" className="block text-center bg-white text-slate-900 px-6 py-4 rounded-full font-bold transition-all hover:scale-105">Get Started Free</Link>
            </div>
            
            <div className="p-10 rounded-3xl bg-gradient-to-b from-indigo-500/10 to-transparent border border-indigo-500/30 relative flex flex-col overflow-hidden">
               <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider">Most Popular</div>
               <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
               <div className="text-4xl font-black text-white mb-8">$9<span className="text-lg font-normal text-slate-500">/mo</span></div>
               <ul className="space-y-4 mb-10 flex-grow">
                  <li className="flex items-center gap-3 text-slate-300 font-medium"><span className="text-indigo-400 font-bold">✓</span> Unlimited long-form AI answers</li>
                  <li className="flex items-center gap-3 text-slate-300"><span className="text-indigo-400 font-bold">✓</span> Smart Application Tracking</li>
                  <li className="flex items-center gap-3 text-slate-300"><span className="text-indigo-400 font-bold">✓</span> Custom Job-Specific responses</li>
                  <li className="flex items-center gap-3 text-slate-300"><span className="text-indigo-400 font-bold">✓</span> Premium Models (Claude, GPT-4o)</li>
               </ul>
               <Link href="/sign-up?redirect_url=/install" className="block text-center bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-105">Upgrade to Pro</Link>
            </div>
         </div>
      </div>

      {/* SEO / Trust Section */}
      <div className="max-w-4xl mx-auto px-8 py-20 border-t border-white/5 text-center text-slate-500 text-sm leading-relaxed">
        <h3 className="text-white text-lg font-semibold mb-6">Built for Modern Job Seekers</h3>
        <p className="mb-4">
          Job Hunt Easy is the leading AI-powered Chrome extension designed specifically for the modern job application landscape. 
          By focusing on Applicant Tracking Systems (ATS) like Workday, Greenhouse, and Lever, we help job seekers navigate 
          repetitive forms without the manual burnout.
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-medium">
          <span>AI Autofill for Job Applications</span>
          <span>•</span>
          <span>Workday Form Assistant</span>
          <span>•</span>
          <span>Greenhouse Auto-fill</span>
          <span>•</span>
          <span>Lever AI Helper</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-8 py-16 border-t border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
             <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">J</div>
                <span className="font-bold text-white tracking-tight">Job Hunt Easy</span>
             </div>
             <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
               The fastest way to apply to jobs using your resume and AI. 
               Built to save you hours of repetitive typing.
             </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6 text-sm">Product</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Chrome Web Store</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6 text-sm">Legal & Support</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-white/5 text-slate-600 text-xs font-medium">
          <div>© {new Date().getFullYear()} Job Hunt Easy. All rights reserved.</div>
          <div className="flex items-center gap-6">
             <a href="#" className="hover:text-white transition-colors">Twitter</a>
             <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
