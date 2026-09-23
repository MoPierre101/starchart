import { ProvidersResponseSchema } from "../search.schema";

export async function getSearchProviders(): Promise<string[]> {
  const url = new URL("/search/providers", process.env.BACKEND_API_URL);
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Provider request failed (${response.status})`);
  }

  const parsed = ProvidersResponseSchema.safeParse(await response.json());

  if (!parsed.success) {
    throw new Error("Unexpected response shape from search API");
  }

  return parsed.data.providers;
}
