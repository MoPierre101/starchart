# StarChart

StarChart is a multi-franchise media navigation platform for finding where to start, what context matters, and where to go next across film, television, comics, and games.

Most watch order and reading order tools present a flat sequence. StarChart adds the relational and editorial layer around that sequence. It can recommend an entry point based on a character, era, storyline, or recent viewing experience, then explain why that starting point fits and which prerequisites are important.

> StarChart is in early development. The repository currently contains the application foundation, route structure, API surfaces, database access layer, and provider abstractions. Most product experiences described below remain on the roadmap.

## Product vision

StarChart is designed to answer questions such as:

* Where should I start if I care about Daredevil?
* Which comics should I read after watching a specific film or series?
* What did I miss while I was away from a franchise?
* When should I leave an omnibus for a crossover and return to it?

The platform is built around a few core ideas:

* **Entry point guidance:** Editorial starting points include the reason to begin there, the context that will be skipped, and required or optional prerequisites.
* **Cross-franchise navigation:** Film, television, comics, and games can live in one system while retaining their franchise and continuity boundaries.
* **Continuity-aware orders:** Timelines, reading orders, and watch orders distinguish release order, in-universe chronology, alternate continuities, and narrative dependencies.
* **Comics onboarding:** Resource guides explain runs, series, events, issue numbering, collected editions, continuity, and reading strategies before directing new readers into an order.
* **Media-to-comics mapping:** A film or television title can lead to comics that match its characters, tone, themes, or source material.
* **Transparent recommendations:** Content-based suggestions explain which attributes and completed stories informed each result.

## Planned product areas

| Area | Purpose |
| --- | --- |
| Entry points | Route people to a suitable starting title with prerequisite and context guidance |
| Franchises and subcategories | Organize distinct universes, adaptations, and continuity branches |
| Timelines | Show chronological and release positions without hiding non-canon branches |
| Reading and watch orders | Provide curated sequences with context at each step |
| Plans | Connect several orders into a complete, trackable journey |
| Characters and identities | Distinguish a character from aliases and multiple holders of the same identity |
| Search | Find titles, characters, aliases, orders, and entry points using keywords or natural language |
| Lists and progress | Track planned, active, and completed media |
| Resources | Teach comics terminology, continuity, formats, and navigation strategies |
| Contributions | Let community submissions enter a moderated review workflow |

## Rollout

Development starts with DCU Chapter One as a contained proof of concept. Its main continuity and Elseworlds titles provide enough branching complexity to validate the data model without beginning with a massive catalog.

The planned expansion sequence is:

1. DCU Chapter One
2. Marvel Cinematic Universe
3. Marvel Comics and DC Comics
4. Star Wars, the Remedy Connected Universe, Power Rangers, Super Sentai, and other franchises

## Technology

The current application uses:

* Next.js 16 and React 19
* TypeScript
* Tailwind CSS 4
* Clerk authentication
* TanStack Query
* Zod
* Framer Motion

The AI layer is intended to remain provider agnostic, allowing local or hosted embedding and recommendation providers to be selected without coupling product logic to one vendor.

## Repository structure

```text
src/
  app/                 App Router pages, layouts, and API routes
  components/          Shared UI and layout components
  features/            Feature-specific components, hooks, and types
  lib/
    ai/                Search, embeddings, recommendations, and providers
    db/                Database client and domain queries
    external/          Third-party media metadata integrations
  types/               Shared API and database types
```

## Local development

### Prerequisites

1. Node.js compatible with Next.js 16
2. npm
3. A Clerk application

### Configuration

Create a `.env.local` file in the project root:

```dotenv
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

### Run the app

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other available commands:

```bash
npm run lint
npm run build
npm start
```

## Project status

StarChart is currently a private, early-stage project. The immediate goal is to validate the schema and interaction model with a small, real franchise dataset before expanding coverage. Features in this README describe the intended product direction and should not be interpreted as a completed release checklist.
