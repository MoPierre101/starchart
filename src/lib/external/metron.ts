// Metron — comic book metadata API, focused on issues, series, and publishers.
// Docs: https://metron.cloud/docs/
// Auth: Token-based via METRON_API_KEY env var.
const BASE_URL = 'https://metron.cloud/api/v1'

// Internal fetch wrapper — attaches the auth and content-type headers.
async function metronFetch(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Token ${process.env.METRON_API_KEY}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) throw new Error(`Metron error: ${res.status}`)
  return res.json()
}

// ASSUMED: searching by issue. Metron also has endpoints for series, publishers,
// characters, etc. Expand this file as you identify which resources you need.
export async function searchMetron(query: string) {
  return metronFetch(`/issue/?search=${encodeURIComponent(query)}`)
}
