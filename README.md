# StarChart

StarChart is a comics discovery app. It answers the question "which kind of story is where?"

Describe the story you want in plain language, such as "the story where Bane breaks Batman's back", and StarChart finds it across issues, series, eras, and collected editions. From there you can see where the story sits in its publisher's history and what to read next.

> StarChart is in early development. The repository contains Clerk sign-in, an admin dashboard shell, and a backend provider search feature. Most of the product described below is planned, not built.

## Product vision

StarChart is designed to answer questions such as:

* Which stories match what I'm looking for?
* Where was that story published, and which collected edition contains it?
* Where does it sit in the publisher's history, universe, and era?
* What comes next after the story, issue, or series I just read?

The core ideas:

* **Natural-language story search:** Search stories, series, and eras by what happens in them, then narrow results by publisher, universe, era, series, character, and creator.
* **What comes next:** The next issue in the series, the next part of the story arc, the series that continues this one, and the collected edition that contains it.
* **Reading lists and maps:** Ordered lists of series, issues, collected editions, or stories, grouped into maps with points where a reader leaves for a crossover and returns.
* **Facts from data, judgment from people:** Story facts come from imported comics data. Opinions about what matters come from reading lists and maps made by people. No language model writes answers or catalog data.

StarChart is built for a small group of readers, with three roles: administrators, moderators, and viewers.

## Planned product areas

| Area | Purpose |
| --- | --- |
| Search | Find stories, series, and eras by description, with filters |
| Record pages | Stories, issues, series, collected editions, eras, characters, and creators |
| What comes next | Rule-based next steps from series, story arcs, continuations, and collected editions |
| Reading lists and maps | Ordered lists with optional importance, grouped into longer journeys |
| Progress | Track planned, in-progress, completed, and skipped reading |
| Dashboard | Featured reading lists and maps from moderators |
| Admin | Import comics, manage eras, and manage users and roles |

## Data

The catalog is seeded from the [Grand Comics Database](https://www.comics.org/) data dump, limited to the publishers StarChart covers. [Metron](https://metron.cloud/) is used to search for and import material not yet in the catalog.

## Technology

**Frontend (`web/`):** a Next.js 16 / React 19 app today, planned to become a React single-page application.

* TypeScript
* Tailwind CSS 4
* Clerk authentication
* TanStack Query
* Zod
* Framer Motion

**Backend (`backend/`):** all business rules live here so future clients can share one API.

* Python 3.14+, managed with `uv`
* FastAPI
* SurrealDB, including vector indexes for search
* A local embedding model for search (provisional: served through Ollama)

## Repository structure

```text
web/                   Frontend
  src/
    app/               Pages and layouts
    components/        Shared UI and layout components
    features/          Feature-specific components, hooks, and services
    hooks/             Shared hooks
    lib/               Shared utilities
    types/             Shared API types
backend/               FastAPI backend
  app/
    main.py            Creates the app and registers routers
    features/          One folder per feature
Notes/                 Researched engineering notes
```

## Local development

### Prerequisites

1. Node.js compatible with Next.js 16, and npm
2. Python 3.14+ and [uv](https://docs.astral.sh/uv/)
3. A Clerk application
4. A Metron account for provider search

### Frontend

Create `web/.env.local`:

```dotenv
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

Then run:

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Other commands: `npm run lint`, `npm run build`, `npm start`.

### Backend

Create `backend/.env` with the provider settings read by `backend/app/features/search/external/config.py`:

```dotenv
TMDB_BASE_URL=
TMDB_IMAGE_BASE_URL=
TMDB_API_KEY=
METRON_BASE_URL=
METRON_IMAGE_BASE_URL=
METRON_API_KEY=
```

Then run:

```bash
cd backend
uv sync
uv run fastapi dev app/main.py
```

## Project status

StarChart is a private, early-stage project. The immediate goal is to load a small, real slice of comics data and validate the data model and search before expanding coverage. Features in this README describe the intended product direction and should not be interpreted as a completed release checklist.
