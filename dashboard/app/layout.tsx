// ============================================================
// dashboard/app/layout.tsx
// Root layout — wraps everything with Clerk auth provider
// ============================================================

import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Montserrat } from 'next/font/google'
import './globals.css'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'] })

export const metadata: Metadata = {
  title: 'Job Hunt Easy — AI Autofill for Job Applications | Workday, Greenhouse, Lever',
  description: 'Autofill job applications in seconds using your resume. Works on Workday, Greenhouse, Lever & more. Free Chrome extension.',
  verification: {
    google: 'SFp8QNYquB87M5k7wxv44G3bP1j5h2BbviGRwy1HHIY',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={montserrat.className}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
