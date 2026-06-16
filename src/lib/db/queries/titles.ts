import { getDb } from '../client'

// ASSUMED: the SurrealDB table is named 'title' (singular).
// Update if your schema uses a different table name.

export async function getTitles() {
  const db = await getDb()
  return db.select('title')
}

// ASSUMED: titles have a 'slug' field used as the URL-safe identifier.
// The query syntax and field name need to match your actual schema.
export async function getTitleBySlug(slug: string) {
  const db = await getDb()
  const [result] = await db.query('SELECT * FROM title WHERE slug = $slug', { slug })
  return result ?? null
}
