# AGENTS.md

Instructions for AI coding agents working in this repository.

## What this is

StarChart is a multi-franchise media navigation platform for finding where to
start, what context matters, and where to go next across film, television,
comics, and games. It recommends an entry point based on a character, era,
storyline, or recent viewing experience, and explains why that starting point
fits and which prerequisites matter.

The project is in early development. The application foundation, route
structure, API surfaces, database access layer, and provider abstractions
exist; most product experiences on the roadmap are not yet built.

Rollout proceeds franchise by franchise, starting with DCU Chapter One as a
contained proof of concept, then Marvel Cinematic Universe, then Marvel and DC
Comics, then other franchises (Star Wars, Remedy Connected Universe, Power
Rangers, Super Sentai, etc.).

## Repository layout

This is a two-service repo: a Next.js frontend and a FastAPI backend.

```text
web/                   Next.js 16 / React 19 frontend
  src/
    app/               App Router pages, layouts, and API routes
      (public)/        Public routes
      (auth)/          Sign-in / sign-up (Clerk)
      (dashboard)/     Authenticated dashboard, admin
    components/        Shared UI and layout components (components/ui = shadcn)
    features/          Feature-specific components, hooks, and types
      admin/
      import/
    hooks/             Shared hooks
    lib/               AI, db, and external integrations
    types/             Shared API and database types
  AGENTS.md            Next.js-specific agent rules (breaking changes vs. training data)

backend/               FastAPI backend
  app/
    main.py
  pyproject.toml       uv-managed Python project (requires Python >= 3.14)

Notes/                 Running notebook of researched software-engineering
                       answers (see "Code notebook" below)
```

The backend is intentionally minimal right now (just `app/main.py`) — it was
stripped back from an earlier, more elaborate layered scaffold. Add structure
(routes, services, repositories, etc.) only as real endpoints need it, not
speculatively.

## Technology

**Frontend (`web/`):**
* Next.js 16 and React 19
* TypeScript
* Tailwind CSS 4
* Clerk authentication
* TanStack Query
* Zod
* Framer Motion

**Backend (`backend/`):**
* Python >= 3.14, managed with `uv`
* FastAPI
* SurrealDB (via the `surrealdb` Python and JS/TS clients)

The AI layer (`web/src/lib/ai/`) is intended to stay provider-agnostic:
product logic should not be coupled to one embedding/recommendation vendor.

## Evidence and sources

Do not rely on model training data or memory as evidence for technical claims.
Before answering any technical or software-engineering question, verify the
material claims with at least one current source.

* For library or framework behavior, prefer documentation or source code for
  the exact installed version. If that is unavailable, use the current official
  documentation or release notes.
* For broader engineering claims, use primary research, an applicable standard,
  official documentation, or a reliable technical article.
* For claims about StarChart, inspect the actual repository. Do not infer current
  behavior from roadmap text, intended architecture, or model memory.
* Link the sources actually used in the conversational answer. If sources
  disagree, explain the disagreement and do not silently choose one.
* If a claim cannot be verified, say so plainly. Do not fill the gap with an
  uncited recollection or present it as established fact.

## Working in `web/`

Read `web/AGENTS.md` before touching frontend code — this Next.js version has
breaking changes relative to older training data; check
`node_modules/next/dist/docs/` for current APIs and conventions before writing
Next.js-specific code.

Setup:
```bash
cd web
npm install
```

Requires a `.env.local` with Clerk keys:
```dotenv
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

Commands:
```bash
npm run dev     # http://localhost:3000
npm run lint
npm run build
npm start
```

## Working in `backend/`

Python project managed with `uv`. Run backend commands from `backend/`.

```bash
cd backend
uv sync
uv run fastapi dev app/main.py   # or the project's configured entry point
```

## Code notebook (`Notes/`)

Only write or append to the code notebook when the user explicitly asks to
write a note. When the user asks for a note:

1. Use web search/fetch to research a current, accurate answer — don't answer
   from memory alone for anything version-sensitive (framework/library
   behavior, best practices, API shapes).
2. Answer the user's question directly in the conversation first.
3. Write (or append to) an entry under `Notes/` capturing the answer for future
   reference.

Conventions for entries:
* One file per topic: `Notes/<kebab-case-topic>.md` (e.g.
  `Notes/fastapi-essentials.md`). If a later question extends an existing
  topic, append a new dated section to that file instead of creating a
  near-duplicate.
* Each entry starts with a `# Topic` heading and the date, then the
  substance as concise notes (not a transcript of the conversation) —
  concepts, gotchas, code snippets worth remembering.
* End each entry with a `## Sources` list of the URLs actually used.
* Keep entries terse and skimmable — this is a reference notebook, not
  a tutorial or a blog post.

## Conventions

* Get explicit sign-off from the user before writing code or introducing/using
  a library — including libraries already present as transitive dependencies.
  Discuss the approach first; don't implement unilaterally.
* Don't treat this README/AGENTS.md description of product features as a
  completed release checklist — much of it is the intended direction, not
  current behavior. Check the actual code (`web/src/app`, `backend/app`)
  before assuming a feature exists.
* Keep franchise/continuity data modeling grounded in the current proof of
  concept (DCU Chapter One) rather than building for the full planned catalog
  up front.
* Respect the frontend/backend split — UI and route logic belongs in `web/`,
  data access and domain logic belongs in `backend/`.
