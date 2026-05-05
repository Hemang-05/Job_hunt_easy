// ============================================================
// dashboard/middleware.ts
// Clerk middleware — runs on every request before page renders
//
// SYSTEM DESIGN: Auth enforced at the edge (Vercel/CDN layer),
// not inside the page. Unauthenticated requests never reach
// the Server Component — they're redirected before any DB
// query runs. This is the correct place for auth guards.
// ============================================================

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define which routes require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/answers((?!/sync).*)',
  '/api/applications(.*)'
])

const isPublicApiRoute = createRouteMatcher([
  '/api/generate(.*)',
  '/api/sync(.*)',
  '/api/answers/sync',
  '/api/resume/sync'
])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect()
  }
})

export const config = {
  matcher: [
    // Match all routes except static files and Next internals
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
