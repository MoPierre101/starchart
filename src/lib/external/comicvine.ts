// Comic Vine — comprehensive comic book database (issues, volumes, characters, story arcs).
// Docs: https://comicvine.gamespot.com/api/
// Auth: api_key as a query parameter via COMICVINE_API_KEY env var.
// Note: Comic Vine requires format=json on all requests.
const BASE_URL = 'https://comicvine.gamespot.com/api'

// Internal fetch wrapper — always appends api_key and format=json.
async function comicvineFetch(path: string, params?: Record<string, string>) {
  const url = new URL(`${BASE_URL}${path}`)
  url.searchParams.set('api_key', process.env.COMICVINE_API_KEY ?? '')
  url.searchParams.set('format', 'json')
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Comic Vine error: ${res.status}`)
  return res.json()
}

// ASSUMED: searching across issues, volumes, and characters in one call.
// The 'resources' filter can be adjusted — see Comic Vine docs for all resource types.
export async function searchComicVine(query: string) {
  return comicvineFetch('/search/', { query, resources: 'issue,volume,character' })
}
