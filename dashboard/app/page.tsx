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

  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "Product Designer",
      landed: "Landed at Airbnb",
      quote: "Applying to 20 jobs a day used to be a full-time nightmare. Job Hunt Easy cut my application time down to seconds. I actually had time to prepare for interviews!",
      avatar: "SJ"
    },
    {
      name: "David Chen",
      role: "Software Engineer",
      landed: "Landed at Stripe",
      quote: "The Workday autofill is magic. It handles those annoying 'experience' blocks perfectly. 10/10 would recommend to anyone in the job market.",
      avatar: "DC"
    },
    {
      name: "Marcus Thorne",
      role: "Marketing Manager",
      landed: "Landed at HubSpot",
      quote: "I was skeptical about AI form filling, but this is different. It's accurate, fast, and stays on my device. It gave me my life back during my search.",
      avatar: "MT"
    }
  ]

  return (
    <main className="min-h-screen bg-[#FBF9F6] font-sans selection:bg-[#D4A94A]/30 text-[#1A5F6A] overflow-x-hidden">
      {/* Custom Styles */}
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
        .bg-deep-teal { background-color: #1A5F6A; }
        .text-deep-teal { color: #1A5F6A; }
        .bg-gold { background-color: #D4A94A; }
        .text-gold { color: #D4A94A; }
        .border-deep-teal { border-color: #1A5F6A; }
        .bg-warm-beige { background-color: #F5F2EE; }
        
        .sticky-cta {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1rem;
          background: rgba(251, 249, 246, 0.9);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(26, 95, 106, 0.1);
          z-index: 50;
          display: none;
        }
        @media (max-width: 640px) {
          .sticky-cta { display: block; }
        }
      `}} />

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto border-b border-deep-teal/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-deep-teal flex items-center justify-center text-white font-bold tracking-tight shadow-md">
            J
          </div>
          <span className="font-bold text-deep-teal tracking-tight text-xl">Job Hunt Easy</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <Link href="#how-it-works" className="hidden sm:block font-medium text-deep-teal/70 hover:text-deep-teal transition-colors">How it works</Link>
          <Link href="#pricing" className="hidden sm:block font-medium text-deep-teal/70 hover:text-deep-teal transition-colors">Pricing</Link>
          <SignedOut>
            <Link
              href="/sign-up?redirect_url=/install"
              className="bg-deep-teal text-white px-5 py-2.5 rounded-full font-bold hover:opacity-90 transition-all shadow-md active:scale-95"
            >
              Get started free
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="font-bold text-deep-teal hover:opacity-70 transition-colors"
            >
              Dashboard →
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center relative">
        <div className="inline-flex items-center gap-2 bg-[#D4A94A]/10 border border-[#D4A94A]/20 text-[#D4A94A] text-xs font-bold px-4 py-1.5 rounded-full mb-8 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4A94A] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4A94A]"></span>
          </span>
          ⭐ Trusted by 10,000+ job seekers · Works on Workday, Greenhouse & Lever
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-extrabold text-deep-teal tracking-tight leading-[1.05] mb-8">
          Your Resume. One Click.
          <br />
          <span className="text-gold">Job Applied.</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-deep-teal/70 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
          Stop retyping the same details on every application. Job Hunt Easy autofills Workday, Greenhouse, Lever & more — in under 3 seconds.
        </p>
        
        <div className="flex flex-col items-center justify-center gap-4">
          <Link
            href="/sign-up?redirect_url=/install"
            className="w-full sm:w-auto bg-gold text-white px-10 py-5 rounded-xl text-xl font-black hover:opacity-90 transition-all shadow-[0_8px_30px_rgb(212,169,74,0.3)] hover:-translate-y-0.5 active:translate-y-0"
          >
            Add to Chrome Free — Start Applying Faster
          </Link>
          <p className="text-sm font-semibold text-deep-teal/50">
            No credit card. No signup friction. Just faster job hunting.
          </p>
        </div>

        {/* Demo Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-black text-deep-teal mb-4">Watch it work in 3 seconds</h2>
          <div className="max-w-4xl mx-auto rounded-3xl border-4 border-deep-teal/5 bg-deep-teal/[0.02] aspect-video flex flex-col items-center justify-center p-8 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-deep-teal/5 pointer-events-none"></div>
            <div className="w-20 h-20 rounded-full bg-deep-teal flex items-center justify-center text-white shadow-xl mb-6 cursor-pointer hover:scale-110 transition-transform">
              <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4.5 3.5v13l11-6.5-11-6.5z"/></svg>
            </div>
            <p className="text-deep-teal/40 font-bold uppercase tracking-widest text-sm">[ DEMO VIDEO OF WORKDAY AUTOFILL ]</p>
          </div>
          <p className="mt-6 text-deep-teal/60 font-medium italic">
            See how Job Hunt Easy fills an entire Workday application — name, experience, cover letter — while you grab your coffee.
          </p>
        </div>
      </div>

      {/* Platform Marquee */}
      <div className="w-full py-12 border-y border-deep-teal/5 bg-deep-teal/[0.01] overflow-hidden relative">
        <div className="flex whitespace-nowrap overflow-hidden group">
          <div className="flex gap-16 items-center animate-scroll">
            {platforms.concat(platforms).map((p, i) => (
              <div key={i} className={`text-2xl text-deep-teal/20 hover:text-deep-teal transition-all cursor-default select-none ${p.style}`}>
                {p.name}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#FBF9F6] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#FBF9F6] to-transparent z-10 pointer-events-none"></div>
      </div>

      {/* How it works */}
      <div id="how-it-works" className="max-w-6xl mx-auto px-6 py-24 relative">
        <h2 className="text-4xl sm:text-5xl font-black text-deep-teal text-center mb-16 tracking-tight leading-tight">
          Three steps. Zero repetition.
          <br />
          Hundreds of applications.
        </h2>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              step: '01',
              title: 'Drop your resume once',
              sub: 'PDF upload takes 5 seconds. It never leaves your device.',
              icon: '📄'
            },
            {
              step: '02',
              title: 'Hit the Fill button on any job form',
              sub: 'Our AI button appears automatically on every supported job board — no setup needed.',
              icon: '⚡'
            },
            {
              step: '03',
              title: 'Review, tweak, submit',
              sub: 'Every answer is yours to approve. AI suggests, you decide.',
              icon: '✨'
            },
          ].map(({ step, title, sub, icon }) => (
            <div key={step} className="p-8 rounded-3xl bg-warm-beige border border-deep-teal/10 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-6">{icon}</div>
              <div className="text-xs font-black text-gold mb-2 tracking-widest uppercase">Step {step}</div>
              <h3 className="text-xl font-bold text-deep-teal mb-3 tracking-tight">{title}</h3>
              <p className="text-deep-teal/60 font-medium leading-relaxed">{sub}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link
            href="/sign-up?redirect_url=/install"
            className="inline-block bg-gold text-white px-8 py-4 rounded-xl text-lg font-black hover:opacity-90 transition-all shadow-lg active:scale-95"
          >
            Try It Free — Add to Chrome
          </Link>
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="bg-deep-teal py-24 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Don't take our word for it.</h2>
            <p className="text-white/60 font-medium text-lg italic">Join thousands of job seekers getting their time back.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center font-bold text-white shadow-lg">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold">{t.name}</div>
                    <div className="text-sm text-white/50">{t.role}</div>
                  </div>
                </div>
                <p className="text-lg leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="text-sm font-black text-gold tracking-wide">{t.landed}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-black text-deep-teal text-center mb-16 tracking-tight">Built for job seekers, not recruiters.</h2>
          <div className="grid sm:grid-cols-2 gap-12">
            {[
              { title: 'Your data stays on your device. Always.', desc: 'We never store, share, or sell your resume. Period.', icon: '🛡️' },
              { title: 'You apply. We stay out of it.', desc: 'We don\'t hand your info to employers or third parties. Your search, your control.', icon: '🤐' },
              { title: 'Every word is yours to approve.', desc: 'AI fills the field, you read it before you click submit. No surprises.', icon: '👀' },
              { title: 'Bank-grade encryption on every request.', desc: 'Your communication with AI models are encrypted and never logged.', icon: '🔒' },
            ].map((item, i) => (
              <div key={i} className="flex gap-6">
                <div className="flex-shrink-0 text-3xl">{item.icon}</div>
                <div>
                  <h4 className="font-bold text-deep-teal mb-2 text-xl leading-tight">{item.title}</h4>
                  <p className="text-deep-teal/60 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="max-w-6xl mx-auto px-6 py-24 text-center">
         <h2 className="text-4xl sm:text-5xl font-black text-deep-teal mb-4 tracking-tight">Start free. Upgrade when you're landing interviews.</h2>
         <p className="text-deep-teal/60 mb-16 max-w-xl mx-auto text-lg font-medium leading-relaxed">Stop wasting time on forms. Start focusing on your career.</p>
         
         <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left items-stretch">
            <div className="p-10 rounded-[2.5rem] bg-warm-beige border border-deep-teal/10 flex flex-col relative shadow-sm">
               <h3 className="text-2xl font-black text-deep-teal mb-1">Get Started</h3>
               <p className="text-sm font-bold text-deep-teal/40 mb-6 italic">Perfect for casual job seekers</p>
               <div className="text-5xl font-black text-deep-teal mb-8">$0<span className="text-lg font-bold text-deep-teal/30">/mo</span></div>
               <ul className="space-y-4 mb-10 flex-grow">
                  <li className="flex items-center gap-3 text-deep-teal/70 font-medium"><span className="text-gold font-bold text-xl">✓</span> Autofill basic form fields</li>
                  <li className="flex items-center gap-3 text-deep-teal/70 font-medium"><span className="text-gold font-bold text-xl">✓</span> Up to 5 AI answers per day</li>
                  <li className="flex items-center gap-3 text-deep-teal/70 font-medium"><span className="text-gold font-bold text-xl">✓</span> Works on all job boards</li>
               </ul>
               <Link href="/sign-up?redirect_url=/install" className="block text-center border-2 border-deep-teal text-deep-teal px-6 py-4 rounded-xl font-black hover:bg-deep-teal hover:text-white transition-all active:scale-95">Start for Free</Link>
            </div>
            
            <div className="p-10 rounded-[2.5rem] bg-deep-teal text-white relative flex flex-col shadow-2xl overflow-hidden group">
               <div className="absolute top-0 right-0 bg-gold text-white text-xs font-black px-6 py-2 rounded-bl-2xl uppercase tracking-wider shadow-lg">Best for Active Job Seekers</div>
               <h3 className="text-2xl font-black mb-1">Pro Plan</h3>
               <p className="text-sm font-bold text-white/40 mb-6 italic">Cancel anytime. Most users land a job before month 2.</p>
               <div className="text-5xl font-black mb-8">$9<span className="text-lg font-bold text-white/30">/mo</span></div>
               <ul className="space-y-4 mb-10 flex-grow">
                  <li className="flex items-center gap-3 text-white/80 font-medium"><span className="text-gold font-black text-xl">✓</span> Unlimited long-form AI answers</li>
                  <li className="flex items-center gap-3 text-white/80 font-medium"><span className="text-gold font-black text-xl">✓</span> Smart Application Tracking</li>
                  <li className="flex items-center gap-3 text-white/80 font-medium"><span className="text-gold font-black text-xl">✓</span> Custom Job-Specific responses</li>
                  <li className="flex items-center gap-3 text-white/80 font-medium"><span className="text-gold font-black text-xl">✓</span> Premium Models (Claude, GPT-4o)</li>
               </ul>
               <Link href="/sign-up?redirect_url=/install" className="block text-center bg-gold text-white px-6 py-4 rounded-xl font-black transition-all hover:opacity-90 shadow-[0_8px_25px_rgba(212,169,74,0.3)] mb-4">Get Unlimited — $9/mo</Link>
               <p className="text-xs text-center font-bold text-white/40 group-hover:text-gold transition-colors uppercase tracking-widest">Join thousands already using Pro to land faster</p>
            </div>
         </div>
      </div>

      {/* Bottom CTA Closer */}
      <div className="bg-deep-teal py-24 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,169,74,0.1),transparent)] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl sm:text-6xl font-black mb-6 tracking-tight">Still filling forms manually?</h2>
          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            Every job application takes 20–40 minutes of your life. Job Hunt Easy gives that back.
          </p>
          <Link
            href="/sign-up?redirect_url=/install"
            className="inline-block bg-gold text-white px-12 py-5 rounded-xl text-2xl font-black hover:opacity-90 transition-all shadow-2xl active:scale-95 mb-6"
          >
            Add to Chrome — It's Free
          </Link>
          <p className="text-sm font-bold text-white/40 uppercase tracking-widest italic">
            Takes 30 seconds to install. Works immediately.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-16 border-t border-deep-teal/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
             <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded bg-deep-teal flex items-center justify-center text-white text-xs font-bold">J</div>
                <span className="font-bold text-deep-teal tracking-tight">Job Hunt Easy</span>
             </div>
             <p className="text-deep-teal/60 text-sm max-w-xs font-medium leading-relaxed">
               Job Hunt Easy is a Chrome extension that uses AI to autofill job applications on Workday, Greenhouse, Lever, LinkedIn, Indeed, and Ashby — saving job seekers hours of repetitive typing every week.
             </p>
          </div>
          <div>
            <h4 className="text-deep-teal font-black mb-6 text-sm uppercase tracking-widest">Product</h4>
            <ul className="space-y-4 text-sm text-deep-teal/60 font-bold">
              <li><Link href="#how-it-works" className="hover:text-deep-teal transition-colors">How it works</Link></li>
              <li><Link href="#pricing" className="hover:text-deep-teal transition-colors">Pricing</Link></li>
              <li><a href="#" className="hover:text-deep-teal transition-colors">Chrome Web Store</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-deep-teal font-black mb-6 text-sm uppercase tracking-widest">Support</h4>
            <ul className="space-y-4 text-sm text-deep-teal/60 font-bold">
              <li><a href="#" className="hover:text-deep-teal transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-deep-teal transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-deep-teal transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-deep-teal/5 text-deep-teal/40 text-xs font-black uppercase tracking-widest">
          <div>© {new Date().getFullYear()} Job Hunt Easy. AI job application autofill.</div>
          <div className="flex items-center gap-6">
             <a href="#" className="hover:text-deep-teal transition-colors">Twitter</a>
             <a href="#" className="hover:text-deep-teal transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>

      {/* Sticky Mobile CTA */}
      <div className="sticky-cta">
        <Link
          href="/sign-up?redirect_url=/install"
          className="block w-full bg-gold text-white py-4 rounded-xl font-black text-center shadow-lg"
        >
          Add to Chrome Free
        </Link>
      </div>
    </main>
  )
}
