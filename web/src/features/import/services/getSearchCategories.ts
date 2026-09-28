"use server";

import { CategoriesResponseSchema } from "../search.schema";

export async function getSearchCategories(): Promise<string[]> {
  const url = new URL("/search/categories", process.env.BACKEND_API_URL);

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Category request failed (${response.status})`);
  }

  const json = await response.json();
  const parsed = CategoriesResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error("Unexpected response shape from search API");
  }

  return parsed.data.categories;
}
