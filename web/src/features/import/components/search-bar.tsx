"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SearchBarProps = {
  categories: string[];
  isSearching?: boolean;
  onSearch: (search: { category: string; query: string }) => void;
};

export function SearchBar({
  categories,
  isSearching = false,
  onSearch,
}: SearchBarProps) {
  const [value, setValue] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "");

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const query = value.trim();
        if (category && query) {
          onSearch({ category, query });
        }
      }}
      className="flex w-full items-center gap-2"
    >
      <select
        name="category"
        aria-label="Media category"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        disabled={categories.length === 0}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
      >
        {categories.length === 0 && <option value="">No categories</option>}
        {categories.map((id) => (
          <option key={id} value={id}>
            {id === "visual_media" ? "Visual media" : id}
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
          placeholder="Search titles…"
          aria-label="Search media"
          className="h-10 rounded-full pl-8"
        />
      </div>
      <Button type="submit" size="lg" disabled={isSearching || !category}>
        {isSearching ? "Searching…" : "Search"}
      </Button>
    </form>
  );
}
