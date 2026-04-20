// ============================================================
// dashboard/app/layout.tsx
// Root layout — wraps everything with Clerk auth provider
// ============================================================

import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Job Hunt Easy — AI Form Filler',
  description: 'Fill any form with AI using your resume',
  verification: {
    google: 'SFp8QNYquB87M5k7wxv44G3bP1j5h2BbviGRwy1HHIY',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
