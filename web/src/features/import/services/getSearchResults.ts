"use server";

import { SearchResponseSchema, type SearchResponse } from "../search.schema";

type GetSearchResultsParams = {
  provider: string;
  query: string;
};

type SearchResults =
  | { success: true; data: SearchResponse }
  | { success: false; error: string };

export async function getSearchResults({
  provider,
  query,
}: GetSearchResultsParams): Promise<SearchResults> {
  const url = new URL(`/search/${provider}`, process.env.BACKEND_API_URL);
  url.searchParams.set("query", query);

  const response = await fetch(url);

  if (!response.ok) {
    return { success: false, error: `Search request failed (${response.status})` };
  }

  const json = await response.json();
  const parsed = SearchResponseSchema.safeParse(json);

  if (!parsed.success) {
    return { success: false, error: "Unexpected response shape from search API" };
  }

  return { success: true, data: parsed.data };
}
