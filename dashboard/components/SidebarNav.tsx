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
                ? 'bg-blue-50 text-blue-600 font-bold shadow-sm border border-blue-100'
                : 'text-gray-500 hover:bg-gray-100/50 hover:text-gray-900 border border-transparent'
            }`}
          >
            <span className={`text-lg ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>{icon}</span>
            {label}
          </Link>
        )
      })}

      {showDevChecklist && (
        <div className="mt-8 pt-6 border-t border-gray-200/60 px-2">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-2">
            Admin Tools
          </div>
          <Link
            href="/dashboard/test"
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-300 ${
              pathname === '/dashboard/test'
                ? 'bg-blue-50 text-blue-600 font-bold border border-blue-100'
                : 'text-gray-500 hover:bg-gray-100/50 hover:text-gray-900 border border-transparent'
            }`}
          >
            <span className={`text-lg ${pathname === '/dashboard/test' ? 'text-blue-600' : 'text-gray-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-terminal"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
            </span>
            System Status
          </Link>
        </div>
      )}
    </nav>
  )
}
