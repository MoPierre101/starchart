// TMDB API v3 — used for film and TV metadata (posters, overviews, release dates).
// Docs: https://developer.themoviedb.org/reference/intro/getting-started
// Auth: Bearer token via TMDB_API_KEY env var (Read Access Token, not the v3 API key).
const BASE_URL = 'https://api.themoviedb.org/3'

// Internal fetch wrapper — appends query params and attaches the auth header.
async function tmdbFetch(path: string, params?: Record<string, string>) {
  const url = new URL(`${BASE_URL}${path}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
  })
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`)
  return res.json()
}

// ASSUMED: /search/multi covers all media types (movie, tv, person) in one call.
// You may want separate endpoints (e.g. /search/movie) once the use case is clearer.
export async function searchTMDB(query: string) {
  return tmdbFetch('/search/multi', { query })
}
