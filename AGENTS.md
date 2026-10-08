# AGENTS.md

Rules and conventions for AI coding agents working in this repository.

## Conventions

* Get explicit sign-off from the user before writing code or introducing/using
  a library — including libraries already present as transitive dependencies.
  Discuss the approach first; don't implement unilaterally.
* Explain each design choice in plain terms, with a concrete example and the
  simpler alternative, and let the user decide before writing it into code or
  the planning documents.
* The planning documents describe intended direction, not current behavior.
  Check the actual code (`web/src`, `scripts/`) before assuming a feature exists.
* Keep data modeling grounded in the proof-of-concept comics slice rather than
  building for every publisher up front.
* No generative model writes answers or catalog records. A language model may
  help write the GCD loading script, but never writes catalog records directly.
* The app is a Next.js project in `web/`. There is no separate backend
  service. The GCD scripts in `scripts/` are a `uv`-managed Python project; run
  their commands from `scripts/`.

## Planning documents

The plan lives in `starchart_base_ideas/` (`project_starchart.md`,
`project_starchart_tech.md`, `schema.md`, `search_schema.md`). The folder is in
`.gitignore`, so it is **not tracked in git**: changes cannot be recovered. Get
explicit approval before deleting or overwriting any file in it.

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
