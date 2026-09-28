"use server";

import { SearchResponseSchema, type SearchResponse } from "../search.schema";

type GetSearchResultsParams = {
  category: string;
  query: string;
};

export async function getSearchResults({
  category,
  query,
}: GetSearchResultsParams): Promise<SearchResponse> {
  const url = new URL(`/search/${category}`, process.env.BACKEND_API_URL);

  url.searchParams.set("query", query);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Search request failed (${response.status}) `);
  }

  const json = await response.json();
  const parsed = SearchResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error(`Unexpected response shape from search API`);
  }

  return parsed.data;
}
