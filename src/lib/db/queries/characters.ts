import { getDb } from '../client'

// ASSUMED: the SurrealDB table is named 'character' (singular).
// Update if your schema uses a different table name.

export async function getCharacters() {
  const db = await getDb()
  return db.select('character')
}

// ASSUMED: characters have a 'slug' field used as the URL-safe identifier.
// The query syntax and field name need to match your actual schema.
export async function getCharacterBySlug(slug: string) {
  const db = await getDb()
  const [result] = await db.query('SELECT * FROM character WHERE slug = $slug', { slug })
  return result ?? null
}
