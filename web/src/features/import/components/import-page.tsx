"use client";

import { useState } from "react";

import { useSearchResults } from "../hooks/useSearchResults";
import { ResultsEmpty } from "./results-empty";
import { ResultsGrid } from "./results-grid";
import { ResultsSkeleton } from "./results-skeleton";
import { SearchBar } from "./search-bar";

type ImportPageProps = {
  categories: string[];
  categoriesError?: string;
};

export function ImportPage({ categories, categoriesError }: ImportPageProps) {
  const [search, setSearch] = useState({ category: "", query: "" });

  const { data, isLoading, isFetching, isError, error } = useSearchResults({
    category: search.category,
    query: search.query,
  });

  return (
    <main className="flex flex-col gap-6 px-6 py-6">
      <SearchBar
        categories={categories}
        isSearching={isFetching}
        onSearch={setSearch}
      />

      {categoriesError || categories.length === 0 ? (
        <p role="alert" className="text-sm text-destructive">
          {categoriesError ?? "No search categories are available."}
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
