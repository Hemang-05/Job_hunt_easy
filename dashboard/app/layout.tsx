// ============================================================
// dashboard/app/layout.tsx
// Root layout — wraps everything with Clerk auth provider
// ============================================================

import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Job Hunt Easy — AI Autofill for Job Applications | Workday, Greenhouse, Lever',
  description: 'Autofill job applications in seconds using your resume. Job Hunt Easy\'s Chrome extension works on Workday, Greenhouse, Lever & more. Free to start.',
  verification: {
    google: 'SFp8QNYquB87M5k7wxv44G3bP1j5h2BbviGRwy1HHIY',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={plusJakartaSans.className}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
