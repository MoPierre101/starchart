# AGENTS.md

Instructions for AI coding agents working in this repository.

## What this is

StarChart is a comics discovery app. It answers "which kind of story is
where?": a user describes the story they want in plain language and finds it
across issues, series, eras, and collected editions, then sees where it sits
in a publisher's history and what comes next.

It is built for its creator and a small group of friends, with three roles:
`admin`, `moderator`, and `viewer`. Users build ordered reading lists and group
them into reading maps; moderator and admin lists can be featured on the
dashboard.

The catalog is seeded from the Grand Comics Database (GCD) SQLite dump, sliced
to the publishers StarChart covers. Metron is used afterward to search for and
import material not yet in the catalog. Search is semantic search over
embeddings of stories, series, and eras; no generative model writes answers or
catalog records.

The project is in early development. Clerk sign-in, an admin dashboard shell,
and a backend provider search feature exist; most of the product is not yet
built. The proof of concept is a contained slice of comics data that has not
been chosen yet.

## Planning documents

The product and technical plan lives in `starchart_base_ideas/`:

| File | Owns |
| --- | --- |
| `project_starchart.md` | Mission, concepts, features, roles |
| `project_starchart_tech.md` | Architecture, data sources, search approach, open technical decisions |
| `schema.md` | Catalog, user, and reading data model |
| `search_schema.md` | Search entries, entry text, rebuild rules |

These describe intended direction, not current behavior. `starchart_base_ideas/`
is listed in `.gitignore`, so it is **not tracked in git**: changes to these
files cannot be recovered from git. Get explicit approval before deleting or
overwriting any of them.

## Technology

**Frontend:**
* React single-page application
* TypeScript
* Clerk authentication
* TanStack Query

Build tooling and router are not chosen.

**Backend (`backend/`):**
* Python >= 3.14, managed with `uv`
* FastAPI
* SurrealDB (via the `surrealdb` Python client), including vector indexes for
  search

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
* For claims about GCD data, check the dump itself or the
  [gcd-django source](https://github.com/GrandComicsDatabase/gcd-django).
* Link the sources actually used in the conversational answer. If sources
  disagree, explain the disagreement and do not silently choose one.
* If a claim cannot be verified, say so plainly. Do not fill the gap with an
  uncited recollection or present it as established fact.

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
* Explain each design choice in plain terms, with a concrete example and the
  simpler alternative, and let the user decide before writing it into code or
  the planning documents.
* Don't treat the planning documents or this file's product description as a
  completed release checklist — they describe intended direction, not current
  behavior. Check the actual code (`backend/app`) before
  assuming a feature exists.
* Keep data modeling grounded in the proof-of-concept comics slice rather than
  building for every publisher up front.
* A language model may help write the GCD slicing script, but never writes
  catalog records directly.
