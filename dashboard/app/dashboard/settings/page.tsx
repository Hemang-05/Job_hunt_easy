'use client'

import { UserProfile, useUser } from '@clerk/nextjs'
import { User, Mail, ShieldCheck } from 'lucide-react'

export default function SettingsPage() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) return <div className="animate-pulse h-96 glass-tile w-full bg-white/50" />

  return (
    <div className="max-w-5xl space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Account Settings</h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Manage your Job Hunt Easy identity and security.
          </p>
        </div>
        
        {/* Custom Profile Preview */}
        <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 overflow-hidden">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <div>
            <div className="text-sm font-black text-gray-900">{user?.fullName || user?.firstName}</div>
            <div className="text-xs text-gray-400 font-bold tracking-tight">{user?.primaryEmailAddress?.emailAddress}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="glass-tile p-6 bg-white">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">Privacy & Security</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              We take your security seriously. Use multi-factor authentication to keep your job application data safe.
            </p>
            <div className="mt-6 flex items-center gap-3 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Secure Connection</span>
            </div>
          </div>
        </div>

        {/* Clerk Component Column */}
        <div className="md:col-span-2">
          <div className="glass-tile overflow-hidden w-full bg-white">
            <UserProfile
              routing="hash"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  cardBox: "w-full shadow-none",
                  card: "bg-transparent shadow-none border-0 w-full",
                  navbar: "hidden", 
                  pageScrollBox: "p-8 w-full max-w-full",
                  headerTitle: "text-gray-900 font-black text-2xl",
                  headerSubtitle: "text-gray-400 font-medium",
                  userPreviewMainIdentifier: "text-gray-900 font-bold opacity-100",
                  userPreviewSecondaryIdentifier: "text-gray-500 opacity-90 font-medium",
                  profileSectionTitleText: "text-gray-900 font-black uppercase tracking-widest text-[10px] opacity-100 border-b border-gray-100 pb-4 mb-6",
                  profileSectionPrimaryButton: "text-blue-600 hover:text-blue-700 font-bold",
                  formFieldLabel: "text-gray-700 font-bold mb-2 opacity-100",
                  formFieldInput: "bg-white border-gray-200 text-gray-900 focus:border-blue-600 rounded-xl px-4 py-3 shadow-sm",
                  formButtonPrimary: "bg-blue-600 text-white hover:bg-blue-700 font-bold px-6 py-3 rounded-xl shadow-sm",
                  breadcrumbs: "hidden",
                  scrollBox: "bg-transparent",
                  navbarMobileMenuButton: "text-gray-700",
                  accordionTriggerButton: "text-gray-900 font-bold",
                  badge: "bg-blue-50 text-blue-600 border border-blue-200 font-bold uppercase tracking-tighter text-[10px] px-2 py-0.5",
                  identityPreviewText: "text-gray-900 font-bold opacity-100",
                  identityPreviewEditButton: "text-blue-600 hover:text-blue-700",
                  activeDeviceIcon: "text-blue-600",
                  formFieldSuccessText: "text-emerald-600",
                  formFieldErrorText: "text-red-600",
                  alertText: "text-gray-700",
                  socialButtonsBlockButton: "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm",
                  socialButtonsBlockButtonText: "text-gray-700 font-bold opacity-100",
                  formFieldAction: "text-blue-600 hover:text-blue-700",
                  dividerLine: "bg-gray-200",
                  dividerText: "text-gray-400 font-black uppercase tracking-widest text-[10px]",
                  p: "text-gray-550 font-medium",
                  span: "text-gray-500 font-medium",
                  button: "text-gray-700 font-bold",
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
