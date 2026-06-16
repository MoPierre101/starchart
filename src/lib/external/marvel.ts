import crypto from 'crypto'

// Marvel Developer API — characters, comics, series, events, and more.
// Docs: https://developer.marvel.com/docs
// Auth: Every request requires ts (timestamp) + apikey (public key) + hash.
// The hash is MD5(ts + privateKey + publicKey). Both keys come from the Marvel developer portal.
const BASE_URL = 'https://gateway.marvel.com/v1/public'

// Builds the three required auth query params for each request.
// A new timestamp is generated per call — Marvel validates that ts is recent.
function buildAuthParams() {
  const ts = Date.now().toString()
  const publicKey = process.env.MARVEL_PUBLIC_KEY ?? ''
  const privateKey = process.env.MARVEL_PRIVATE_KEY ?? ''
  const hash = crypto.createHash('md5').update(ts + privateKey + publicKey).digest('hex')
  return { ts, apikey: publicKey, hash }
}

// Internal fetch wrapper — merges auth params with any additional params.
async function marvelFetch(path: string, params?: Record<string, string>) {
  const url = new URL(`${BASE_URL}${path}`)
  const auth = buildAuthParams()
  for (const [key, value] of Object.entries({ ...auth, ...params })) {
    url.searchParams.set(key, value)
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Marvel API error: ${res.status}`)
  return res.json()
}

// ASSUMED: searching characters by name prefix. Marvel's API doesn't have a general
// search — each resource type (comics, series, events) has its own endpoint.
// Add more functions here as you identify which resources you need.
export async function searchMarvel(query: string) {
  return marvelFetch('/characters', { nameStartsWith: query })
}
