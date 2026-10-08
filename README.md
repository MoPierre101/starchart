# StarChart

StarChart is a comics discovery app. It answers the question "which kind of story is where?"

Describe the story you want in plain language, such as "the story where Bane breaks Batman's back", and StarChart finds it across issues, series, and eras. From there you can see where the story sits in its publisher's history and what to read next.

> StarChart is in early development. The repository contains Clerk sign-in, an admin dashboard shell, and the scripts that load comics data into SurrealDB. Most of the product described below is planned, not built.

## Product vision

StarChart is designed to answer questions such as:

* Which stories match what I'm looking for?
* Where was that story published?
* Where does it sit in the publisher's history and era?
* What comes next after the story, issue, or series I just read?

The core ideas:

* **Natural-language story search:** Search stories and eras by what happens in them, then narrow results by publisher, era, series, and creator.
* **What comes next:** The next issue in the series, the next part of the story arc, and the series that continues this one.
* **Reading lists and maps:** Ordered lists of series, issues, or stories, grouped into maps with points where a reader leaves for a crossover and returns.
* **Facts from data, judgment from people:** Story facts come from imported comics data. Opinions about what matters come from reading lists and maps made by people. No language model writes answers or catalog data.

StarChart is built for a small group of readers, with three roles: administrators, moderators, and viewers.

## Planned product areas

| Area | Purpose |
| --- | --- |
| Search | Find stories and eras by description, with filters |
| Record pages | Stories, issues, series, eras, and creators |
| What comes next | Rule-based next steps from series, story arcs, and continuations |
| Reading lists and maps | Ordered lists with optional importance, grouped into longer journeys |
| Progress | Track planned, in-progress, completed, and skipped reading |
| Dashboard | Featured reading lists and maps from moderators |
| Admin | Manage eras, and manage users and roles |

## Data

The catalog is seeded from the [Grand Comics Database](https://www.comics.org/) data dump, limited to the publishers StarChart covers. Two scripts in `scripts/` (gitignored) prepare it: one cuts the full dump down to those publishers, and one cleans it and writes it into SurrealDB. New releases arrive by replacing the dump with a newer one and rerunning both.

## Technology

**App (`web/`):** a Next.js 16 / React 19 app. The plan is for its server code to read SurrealDB directly, with no separate backend service. It does not connect to SurrealDB yet.

* TypeScript
* Tailwind CSS 4
* Clerk authentication
* TanStack Query
* Zod
* Framer Motion

**Database:** SurrealDB, including vector indexes for search. A local embedding model for search is provisional (served through Ollama).

**Data scripts (`scripts/`):** Python 3.14+, managed with `uv`. They are not part of the app and are not tracked in git.

* `strip_gcd_dump.py` cuts the full GCD dump (`scripts/gcd_dump/dump.db`) down to the covered publishers (`scripts/gcd_dump/stripped.db`).
* `gcd_loader` cleans the stripped dump and writes it into SurrealDB.

## Repository structure

```text
web/                   Next.js app
  src/
    app/               Pages and layouts
    components/        Shared UI and layout components
    features/          Feature-specific components, hooks, and services
    hooks/             Shared hooks
    lib/               Shared utilities
    types/             Shared API types
scripts/               GCD dump scripts (not tracked in git)
  strip_gcd_dump.py    Cuts the dump down to the covered publishers
  gcd_loader/          Cleans the dump and loads it into SurrealDB
  gcd_dump/            The GCD dump files
Notes/                 Researched engineering notes
```

## Local development

### Prerequisites

1. Node.js compatible with Next.js 16, and npm
2. A Clerk application
3. SurrealDB, running locally
4. Python 3.14+ and [uv](https://docs.astral.sh/uv/), only to run the data scripts

### App

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

### Data scripts

Create `scripts/.env` with the database settings:

```dotenv
SURREAL_URL=
SURREAL_NAMESPACE=
SURREAL_DATABASE=
SURREAL_USERNAME=
SURREAL_PASSWORD=
```

Put the full dump downloaded from GCD at `scripts/gcd_dump/dump.db`, then run from `scripts/`:

```bash
uv sync
uv run python strip_gcd_dump.py
uv run python -m gcd_loader
```

## Project status

StarChart is a private, early-stage project. The immediate goal is to load a small, real slice of comics data and validate the data model and search before expanding coverage. Features in this README describe the intended product direction and should not be interpreted as a completed release checklist.
