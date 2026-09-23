"use client";

import type { MediaSearchResult } from "../search.schema";
import { ResultCard } from "./result-card";

type ResultsGridProps = {
  results: MediaSearchResult[];
};

export function ResultsGrid({ results }: ResultsGridProps) {
  return (
    <section aria-label="Search results" className="flex flex-col gap-4">
      <header className="flex items-baseline gap-2">
        <h2 className="font-heading text-lg font-semibold">Results</h2>
        <p className="text-sm text-muted-foreground">
          {results.length} results
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {results.map((result) => (
          <ResultCard
            key={`${result.provider}:${result.external_id}`}
            result={result}
          />
        ))}
      </div>
    </section>
  );
}
