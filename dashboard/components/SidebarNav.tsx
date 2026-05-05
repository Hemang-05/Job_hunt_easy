'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

interface SidebarNavProps {
  items: NavItem[]
  showDevChecklist?: boolean
}

export function SidebarNav({ items, showDevChecklist }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-4 py-4 space-y-2">
      {items.map(({ href, label, icon }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-300 ${
              isActive
                ? 'bg-white/10 text-white font-bold shadow-[0_4px_20px_rgba(255,255,255,0.05)] border border-white/10'
                : 'text-white/50 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <span className={`text-lg ${isActive ? 'text-indigo-400' : 'text-white/30'}`}>{icon}</span>
            {label}
          </Link>
        )
      })}

      {showDevChecklist && (
        <div className="mt-8 pt-6 border-t border-white/5 px-2">
          <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4 ml-2">
            Admin Tools
          </div>
          <Link
            href="/dashboard/test"
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-300 ${
              pathname === '/dashboard/test'
                ? 'bg-indigo-500/10 text-white font-bold border border-indigo-500/20'
                : 'text-white/40 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <span className={`text-lg ${pathname === '/dashboard/test' ? 'text-indigo-400' : 'text-white/20'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-terminal"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
            </span>
            System Status
          </Link>
        </div>
      )}
    </nav>
  )
}
