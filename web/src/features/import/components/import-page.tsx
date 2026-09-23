"use client";

import { useState } from "react";

import { useSearchResults } from "../hooks/useSearchResults";
import { ResultsEmpty } from "./results-empty";
import { ResultsGrid } from "./results-grid";
import { ResultsSkeleton } from "./results-skeleton";
import { SearchBar } from "./search-bar";

type ImportPageProps = {
  providers: string[];
  providersError?: string;
};

export function ImportPage({ providers, providersError }: ImportPageProps) {
  const [search, setSearch] = useState({ provider: "", query: "" });

  const { data, isLoading, isFetching, isError, error } = useSearchResults({
    provider: search.provider,
    query: search.query,
  });

  return (
    <main className="flex flex-col gap-6 px-6 py-6">
      <SearchBar
        providers={providers}
        isSearching={isFetching}
        onSearch={setSearch}
      />

      {providersError || providers.length === 0 ? (
        <p role="alert" className="text-sm text-destructive">
          {providersError ?? "No search providers are available."}
        </p>
      ) : isLoading ? (
        <ResultsSkeleton />
      ) : isError ? (
        <ResultsEmpty variant="error" message={error.message} />
      ) : !data ? (
        <ResultsEmpty variant="idle" />
      ) : data.results.length === 0 ? (
        <ResultsEmpty variant="no-results" query={search.query} />
      ) : (
        <ResultsGrid results={data.results} />
      )}
    </main>
  );
}
