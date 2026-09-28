# Frontend Framework Decision

Date: 2026-09-28

## Current evidence

* The frontend has 34 source files and roughly 1,366 lines of TypeScript and TSX.
* The working import experience is client-side React using state and TanStack Query.
* Next.js server behavior currently provides one initial categories fetch, Clerk proxy middleware, metadata, and font loading.
* There are no Next.js Route Handlers and no substantial server-rendered public pages.
* The read services use Server Functions to call FastAPI. Next.js documents that Server Actions are queued and are primarily intended for mutations.
* The Clerk proxy currently lists `/admin(.*)` as public twice. Therefore `auth.protect()` does not protect admin routes.
* FastAPI currently has no authentication middleware and no CORS configuration.
* Frontend Zod schemas manually duplicate backend response schemas.

## Recommendation

Use a Vite React single-page application with React Router and TanStack Query. Let FastAPI be the only application server.

Do not throw away the presentation work. Port the UI components, Tailwind styles, feature components, query keys, and useful Zod schemas. Replace the Next.js app directory, Server Functions, Clerk Next.js middleware, and Next.js provider shell.

Suggested ownership:

* React owns pages, route guards, user interaction, loading states, and query cache.
* FastAPI owns authentication enforcement, authorization, validation, providers, database access, and error responses.
* API query functions return data or throw a typed error.
* Empty search results remain successful data.

## Required migration work

* Add explicit allowed frontend origins with FastAPI `CORSMiddleware`.
* Replace `@clerk/nextjs` with the React SDK.
* Send a Clerk session token to FastAPI and verify it on every protected backend request.
* Add browser routing and configure the static host to send application paths to `index.html`.
* Change private server environment access to a browser-safe API base URL.
* Keep authorization in FastAPI. A client route guard is user experience, not security.

## Tradeoff

A browser-only SPA does not provide request-time server rendering for public discovery pages. If search engine indexing, rich social previews, or server-rendered public pages become an immediate requirement, reconsider Next.js or introduce targeted prerendering. The current admin proof of concept does not use those benefits.

## Sources

* https://vite.dev/guide/
* https://reactrouter.com/start/declarative/routing
* https://clerk.com/docs/react/getting-started/quickstart
* https://clerk.com/docs/guides/sessions/manual-jwt-verification
* https://fastapi.tiangolo.com/tutorial/cors/
* https://nextjs.org/docs/app/guides/backend-for-frontend
