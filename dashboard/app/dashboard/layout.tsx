// ============================================================
// dashboard/app/dashboard/layout.tsx
// Protected layout — Clerk middleware redirects unauthenticated
// users to /sign-in before this even renders
// ============================================================

import { UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { SidebarNav } from '@/components/SidebarNav'
import { LayoutDashboard, FileText, Briefcase, User, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard',               label: 'Overview',       icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/dashboard/answers',       label: 'Saved Answers',  icon: <FileText className="w-5 h-5" /> },
  { href: '/dashboard/applications',  label: 'Applications',   icon: <Briefcase className="w-5 h-5" /> },
  { href: '/dashboard/resume',        label: 'Resume',         icon: <User className="w-5 h-5" /> },
  { href: '/dashboard/settings',      label: 'Settings',       icon: <Settings className="w-5 h-5" /> },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  return (
    <div className="min-h-screen bg-[#080616] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      {/* ─── MAIN DASHBOARD ISLAND ─── */}
      <div className="w-full max-w-[1600px] h-[calc(100vh-4rem)] bg-[#0d1c30] rounded-[28px] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.6)] flex overflow-hidden relative">
        
        {/* Subtle shine on the main island */}
        <div 
          className="absolute inset-0 pointer-events-none z-0" 
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 40%)' }}
        />

        {/* Sidebar */}
        <aside className="w-64 border-r border-white/5 flex flex-col relative z-10 bg-white/2 backdrop-blur-md">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-8">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              J
            </div>
            <span className="font-bold text-white tracking-tight text-lg">Job Hunt Easy</span>
          </div>
  
          {/* Nav */}
          <SidebarNav 
            items={NAV_ITEMS} 
            showDevChecklist={user.emailAddresses.some(e => e.emailAddress === 'hemangm08@gmail.com')} 
          />
  
          {/* User */}
          <div className="px-6 py-6 border-t border-white/5 flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-[10px] text-white/40 truncate font-medium">
                {user.emailAddresses[0]?.emailAddress}
              </div>
            </div>
          </div>
        </aside>
  
        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-auto relative z-10 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  )
}
