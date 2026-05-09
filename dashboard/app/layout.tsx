// ============================================================
// dashboard/app/layout.tsx
// Root layout — wraps everything with Clerk auth provider
// ============================================================

import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Montserrat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://jobhunteasy.com'),
  title: {
    default: 'Job Hunt Easy — AI Autofill for Job Applications',
    template: '%s | Job Hunt Easy'
  },
  description: 'Autofill job applications in seconds using your resume. Works on Workday, Greenhouse, Lever, LinkedIn, Indeed & more. Free Chrome extension.',
  keywords: [
    'Job automation', 
    'Automate job application', 
    'job applications', 
    'Job hunt automation',
    'AI job application filler',
    'Workday autofill',
    'Greenhouse autofill',
    'Lever autofill',
    'AI resume matcher',
    'Chrome extension for job seekers'
  ],
  authors: [{ name: 'Job Hunt Easy Team' }],
  creator: 'Job Hunt Easy',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://jobhunteasy.com',
    title: 'Job Hunt Easy — Apply to Jobs 5x Faster with AI',
    description: 'Stop retyping the same details on every application. Job Hunt Easy autofills Workday, Greenhouse & Lever in under 3 seconds.',
    siteName: 'Job Hunt Easy',
    images: [
      {
        url: '/og-image.png', // The image you are adding
        width: 1200,
        height: 630,
        alt: 'Job Hunt Easy Dashboard and Extension',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Job Hunt Easy — Apply to Jobs 5x Faster with AI',
    description: 'Stop retyping the same details on every application. Job Hunt Easy autofills Workday, Greenhouse & Lever in under 3 seconds.',
    images: ['/og-image.png'],
    creator: '@JobHuntEasy', // Placeholder, change if you have a Twitter handle
  },
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
          <Analytics />
          {/* Service Worker Killer — prevents "old project" caching issues on localhost */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(registrations => {
                    for (let registration of registrations) {
                      registration.unregister();
                      console.log('[Dev] Unregistered stray Service Worker');
                    }
                  });
                }
              `,
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  )
}
