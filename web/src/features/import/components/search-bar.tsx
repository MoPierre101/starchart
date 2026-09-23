"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SearchBarProps = {
  providers: string[];
  isSearching?: boolean;
  onSearch: (search: { provider: string; query: string }) => void;
};

export function SearchBar({
  providers,
  isSearching = false,
  onSearch,
}: SearchBarProps) {
  const [value, setValue] = useState("");
  const [provider, setProvider] = useState(providers[0] ?? "");

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const query = value.trim();
        if (provider && query) {
          onSearch({ provider, query });
        }
      }}
      className="flex w-full items-center gap-2"
    >
      <select
        name="provider"
        aria-label="Search provider"
        value={provider}
        onChange={(event) => setProvider(event.target.value)}
        disabled={providers.length === 0}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
      >
        {providers.length === 0 && <option value="">No providers</option>}
        {providers.map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          name="query"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search pages or external sources…"
          aria-label="Search external sources"
          className="h-10 rounded-full pl-8"
        />
      </div>
      <Button type="submit" size="lg" disabled={isSearching || !provider}>
        {isSearching ? "Searching…" : "Search"}
      </Button>
    </form>
  );
}
