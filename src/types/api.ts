// Generic API response envelope — discriminated union so callers can narrow
// on the presence of `error` vs `data` without checking for undefined on both.
// ASSUMED: all API routes will use this shape. Adjust if you prefer a different convention.
export interface ApiResponse<T> {
  data: T
  error?: never
}

export interface ApiError {
  data?: never
  error: { message: string; code?: string }
}

export type ApiResult<T> = ApiResponse<T> | ApiError

// ASSUMED: pagination uses page-number style (page + pageSize) rather than cursor-based.
// If SurrealDB queries use LIMIT/START offsets, cursor pagination may be more natural.
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number // ASSUMED
}

// ASSUMED: search is driven by a single 'q' param.
// Filter, sort, and facet params are not modeled yet.
export interface SearchRequest {
  q: string
  page?: number
  pageSize?: number
}

// ASSUMED: search results are a normalized shape across franchise, title, and character.
// The 'score' field assumes vector/relevance scoring — only meaningful if the search
// backend returns ranked results.
export interface SearchResult {
  id: string
  type: 'franchise' | 'title' | 'character' // ASSUMED — limited to these three for now
  name: string
  slug: string
  thumbnail?: string
  score: number // ASSUMED — only relevant with ranked/semantic search
}
