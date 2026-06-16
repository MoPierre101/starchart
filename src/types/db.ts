// These types are placeholders derived from the route structure alone.
// Every interface and every field here is ASSUMED — none of this has been
// validated against an actual SurrealDB schema. Treat this as a first draft
// to replace once the schema is defined.

// ASSUMED: SurrealDB record IDs are represented as "table:id" strings.
// The SDK may return a RecordId object instead — confirm the actual shape
// before using this as a type across the app.
export type RecordId = `${string}:${string}`

// ASSUMED: fields (name, slug, description, thumbnail, createdAt, updatedAt).
// No decisions have been made about what a franchise actually contains.
export interface Franchise {
  id: RecordId
  name: string
  slug: string
  description: string
  thumbnail?: string
  createdAt: string
  updatedAt: string
}

// ASSUMED: a Title belongs to one franchise (single RecordId).
// ASSUMED: type union ('comic' | 'film' | 'series' | 'game' | 'novel') — this
// will need to reflect whatever media types the project actually tracks.
// ASSUMED: embedding field exists for vector search — only relevant if AI search
// is storing embeddings on title records in SurrealDB.
export interface Title {
  id: RecordId
  franchise: RecordId
  name: string
  slug: string
  type: 'comic' | 'film' | 'series' | 'game' | 'novel' // ASSUMED
  releaseDate?: string
  coverImage?: string
  description?: string
  embedding?: number[] // ASSUMED — only needed if doing vector search in SurrealDB
}

// ASSUMED: a Character can belong to multiple franchises (array of RecordId).
// ASSUMED: aliases is an array of strings — no decisions made about alternate names.
export interface Character {
  id: RecordId
  name: string
  slug: string
  aliases: string[] // ASSUMED
  franchises: RecordId[] // ASSUMED — many-to-many
  thumbnail?: string
  description?: string
}

// ASSUMED: entries are stored inline as an array on the ReadingOrder record.
// This could instead be a separate related table if the order needs richer data.
export interface ReadingOrder {
  id: RecordId
  franchise: RecordId
  name: string
  entries: Array<{ title: RecordId; order: number; note?: string }> // ASSUMED shape
}

// ASSUMED: identical structure to ReadingOrder — may diverge once defined.
export interface WatchOrder {
  id: RecordId
  franchise: RecordId
  name: string
  entries: Array<{ title: RecordId; order: number; note?: string }> // ASSUMED shape
}

// ASSUMED: timeline events reference a title and an optional in-universe date string.
// The format of inUniverseDate (ISO string, year only, narrative label, etc.) is undecided.
export interface Timeline {
  id: RecordId
  franchise: RecordId
  name: string
  events: Array<{ title: RecordId; inUniverseDate?: string; note?: string }> // ASSUMED shape
}

// ASSUMED: difficulty levels ('newcomer' | 'casual' | 'completionist') — made up.
// ASSUMED: an entry point points to a single title. It may need to point to a
// reading/watch order instead, or both.
export interface EntryPoint {
  id: RecordId
  franchise: RecordId
  title: RecordId // ASSUMED — may need to be a reading/watch order reference instead
  description: string
  difficulty: 'newcomer' | 'casual' | 'completionist' // ASSUMED
}

// ASSUMED: user is stored as a string (e.g. Clerk user ID).
// ASSUMED: plan items track order and a simple status enum.
export interface Plan {
  id: RecordId
  user: string // ASSUMED — Clerk user ID
  name: string
  items: Array<{ title: RecordId; order: number; status: 'pending' | 'in_progress' | 'done' }> // ASSUMED
}

// ASSUMED: visibility is either public or private — no sharing/unlisted concept yet.
// ASSUMED: items are a flat array of RecordIds (could be titles, franchises, or mixed).
export interface UserList {
  id: RecordId
  user: string // ASSUMED — Clerk user ID
  name: string
  visibility: 'public' | 'private' // ASSUMED
  items: RecordId[] // ASSUMED — unclear what entity type items point to
}

// ASSUMED: status values ('want' | 'reading' | 'watching' | 'done' | 'dropped') —
// reading and watching are separate because comics vs film/TV have different verbs.
// This will need to align with how the UI surfaces progress tracking.
export interface Progress {
  id: RecordId
  user: string // ASSUMED — Clerk user ID
  title: RecordId
  status: 'want' | 'reading' | 'watching' | 'done' | 'dropped' // ASSUMED
  updatedAt: string
}

// ASSUMED: contributions capture a diff of changes to any entity, pending review.
// The diff shape (Record<string, unknown>) is a placeholder — the actual structure
// depends on how you want to represent before/after values for moderation.
export interface Contribution {
  id: RecordId
  user: string // ASSUMED — Clerk user ID
  entity: RecordId // ASSUMED — the record being edited/created
  type: 'edit' | 'create' // ASSUMED
  diff: Record<string, unknown> // ASSUMED — shape TBD
  status: 'pending' | 'approved' | 'rejected' // ASSUMED
  createdAt: string
}
