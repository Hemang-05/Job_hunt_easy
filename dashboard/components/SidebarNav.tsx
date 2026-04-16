'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  icon: string
}

interface SidebarNavProps {
  items: NavItem[]
  showDevChecklist?: boolean
}

export function SidebarNav({ items, showDevChecklist }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {items.map(({ href, label, icon }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className={isActive ? 'text-indigo-500' : 'text-gray-400'}>{icon}</span>
            {label}
          </Link>
        )
      })}

      {showDevChecklist && (
        <Link
          href="/dashboard/test"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mt-4 font-medium ${
            pathname === '/dashboard/test'
              ? 'bg-amber-100 text-amber-800'
              : 'text-amber-600 bg-amber-50 hover:bg-amber-100 hover:text-amber-700'
          }`}
        >
          <span className="text-amber-500">🧪</span>
          Dev Checklist
        </Link>
      )}
    </nav>
  )
}
