"use client";

import { useQuery } from "@tanstack/react-query";

import { importKeys } from "../keys";
import type { SearchResponse } from "../search.schema";
import { getSearchResults } from "../services/getSearchResults";

type UseSearchResultsParams = {
  category: string;
  query: string;
};

export function useSearchResults({ category, query }: UseSearchResultsParams) {
  return useQuery<SearchResponse>({
    queryKey: importKeys.search(category, query),
    queryFn: () => getSearchResults({ category, query }),
    enabled: category.length > 0 && query.trim().length > 0,
  });
}
