// ============================================================
// dashboard/app/dashboard/layout.tsx
// Protected layout — Clerk middleware redirects unauthenticated
// users to /sign-in before this even renders
// ============================================================

import { UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { SidebarNav } from '@/components/SidebarNav'

const NAV_ITEMS = [
  { href: '/dashboard',               label: 'Overview',       icon: '◈' },
  { href: '/dashboard/answers',       label: 'Saved Answers',  icon: '◎' },
  { href: '/dashboard/applications',  label: 'Applications',   icon: '💼' },
  { href: '/dashboard/resume',        label: 'Resume',         icon: '◻' },
  { href: '/dashboard/settings',      label: 'Settings',       icon: '◇' },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-100">
          <span className="text-indigo-600 text-lg">✦</span>
          <span className="font-semibold text-gray-900">Fillr</span>
        </div>

        {/* Nav */}
        <SidebarNav 
          items={NAV_ITEMS} 
          showDevChecklist={process.env.NODE_ENV === 'development'} 
        />

        {/* User */}
        <div className="px-4 py-4 border-t border-gray-100 flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-xs text-gray-400 truncate">
              {user.emailAddresses[0]?.emailAddress}
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
