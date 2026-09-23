"use client";

import { useQuery } from "@tanstack/react-query";

import { importKeys } from "../keys";
import type { SearchResponse } from "../search.schema";
import { getSearchResults } from "../services/getSearchResults";

type UseSearchResultsParams = {
  provider: string;
  query: string;
};

export function useSearchResults({
  provider,
  query,
}: UseSearchResultsParams) {
  return useQuery<SearchResponse>({
    queryKey: importKeys.search(provider, query),
    queryFn: async () => {
      const result = await getSearchResults({ provider, query });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    enabled: query.trim().length > 0,
  });
}
