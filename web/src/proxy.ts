import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// ASSUMED: these are the routes accessible without a Clerk session.
// Every route not listed here will be protected by auth.protect() below.
// Review this list carefully — anything missing will return a 401 to logged-out users.
const isPublicRoute = createRouteMatcher([
  '/',
  '/admin(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/admin(.*)'
])

// clerkMiddleware runs on every request matched by config.matcher below.
// auth.protect() redirects unauthenticated users to the sign-in page.
// ASSUMED: no role-based checks yet — any authenticated user passes.
// When admin-only routes are needed, use auth().then check sessionClaims for a role.
export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

// This matcher is the standard Next.js + Clerk pattern.
// It excludes static files and Next.js internals so the middleware
// only runs on actual page and API requests.
// The trpc line is included by default — remove it if you're not using tRPC.
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/:path*',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
