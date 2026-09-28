"use server";

import {
  SearchByIdResponseSchema,
  type SearchByIdResponse,
} from "../search.schema";

type GetSearchByIdParams = {
  category: string;
  id: string;
  mediaType: string;
};

type SearchResultById =
  | { success: true; data: SearchByIdResponse }
  | { success: false; error: string };

export async function getSearchByIdResults({
  category,
  id,
  mediaType,
}: GetSearchByIdParams): Promise<SearchResultById> {
  const url = new URL(`/search/by-id/${category}`, process.env.BACKEND_API_URL);

  url.searchParams.set("id", id);
  url.searchParams.set("mediaType", mediaType);

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    return {
      success: false,
      error: `Result lookup failed (${response.status})`,
    };
  }

  const json = await response.json();
  const parsed = SearchByIdResponseSchema.safeParse(json);

  if (!parsed.success) {
    return {
      success: false,
      error: `Unexpected response shape from result lookup API`,
    };
  }

  return { success: true, data: parsed.data };
}
