'use client'

import { UserProfile, useUser } from '@clerk/nextjs'
import { User, Mail, ShieldCheck } from 'lucide-react'

export default function SettingsPage() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) return <div className="animate-pulse h-96 glass-tile w-full" />

  return (
    <div className="max-w-5xl space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Account Settings</h1>
          <p className="text-white/50 mt-2 text-sm font-medium">
            Manage your Job Hunt Easy identity and security.
          </p>
        </div>
        
        {/* Custom Profile Preview */}
        <div className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-2xl border border-white/5">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="" className="w-full h-full rounded-xl object-cover" />
            ) : (
              <User className="w-6 h-6 text-indigo-400" />
            )}
          </div>
          <div>
            <div className="text-sm font-black text-white">{user?.fullName || user?.firstName}</div>
            <div className="text-xs text-white/40 font-bold tracking-tight">{user?.primaryEmailAddress?.emailAddress}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="glass-tile p-6">
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Privacy & Security</h3>
            <p className="text-sm text-white/50 font-medium leading-relaxed">
              We take your security seriously. Use multi-factor authentication to keep your job application data safe.
            </p>
            <div className="mt-6 flex items-center gap-3 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Secure Connection</span>
            </div>
          </div>
        </div>

        {/* Clerk Component Column */}
        <div className="md:col-span-2">
          <div className="glass-tile overflow-hidden w-full">
            <UserProfile
              routing="hash"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  cardBox: "w-full shadow-none",
                  card: "bg-transparent shadow-none border-0 w-full",
                  navbar: "hidden", 
                  pageScrollBox: "p-8 w-full max-w-full",
                  headerTitle: "text-white font-black text-2xl",
                  headerSubtitle: "text-white/40 font-medium",
                  userPreviewMainIdentifier: "text-white font-bold opacity-100",
                  userPreviewSecondaryIdentifier: "text-white opacity-90 font-medium",
                  profileSectionTitleText: "text-white font-black uppercase tracking-widest text-[10px] opacity-100 border-b border-white/5 pb-4 mb-6",
                  profileSectionPrimaryButton: "text-indigo-400 hover:text-indigo-300 font-bold",
                  formFieldLabel: "text-white font-bold mb-2 opacity-100",
                  formFieldInput: "bg-white/5 border-white/10 text-white focus:border-indigo-500 rounded-xl px-4 py-3",
                  formButtonPrimary: "bg-white text-[#1A1953] hover:bg-slate-100 font-black px-6 py-3 rounded-xl",
                  breadcrumbs: "hidden",
                  scrollBox: "bg-transparent",
                  navbarMobileMenuButton: "text-white",
                  accordionTriggerButton: "text-white font-bold",
                  badge: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-black uppercase tracking-tighter text-[10px] px-2 py-0.5",
                  identityPreviewText: "text-white font-bold opacity-100",
                  identityPreviewEditButton: "text-indigo-400 hover:text-indigo-300",
                  activeDeviceIcon: "text-indigo-400",
                  formFieldSuccessText: "text-emerald-400",
                  formFieldErrorText: "text-red-400",
                  alertText: "text-white/70",
                  socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10",
                  socialButtonsBlockButtonText: "text-white font-bold opacity-100",
                  formFieldAction: "text-indigo-400 hover:text-indigo-300",
                  dividerLine: "bg-white/5",
                  dividerText: "text-white/20 font-black uppercase tracking-widest text-[10px]",
                  p: "text-white/70 font-medium",
                  span: "text-white/80 font-medium",
                  button: "text-white font-bold",
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
