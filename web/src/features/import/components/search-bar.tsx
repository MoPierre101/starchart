import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ListFilter, Search } from "lucide-react";

export default function StarChartSearch() {
  return (
    <div className="ml-auto hidden w-full max-w-72 items-center gap-1.5 md:flex">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-admin-black-text" />
        <Input
          aria-label="Search"
          placeholder="Search..."
          className="h-8 border-admin-black-line bg-admin-black-soft pl-8 text-xs text-admin-surface placeholder:text-admin-black-text focus-visible:border-admin-muted focus-visible:ring-admin-muted/30"
        />
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            aria-label="Filter search"
            variant="outline"
            size="icon"
            className="border-admin-black-line bg-admin-black-soft text-admin-surface hover:bg-admin-black-line hover:text-admin-surface"
          >
            <ListFilter />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="admin-theme w-64 bg-admin-surface p-3"
        >
          <PopoverHeader>
            <PopoverTitle>Search filters</PopoverTitle>
            <PopoverDescription>
              Limit results to selected external sources.
            </PopoverDescription>
          </PopoverHeader>
          <div
            className="flex flex-wrap gap-2"
            aria-label="External source filters"
          >
            <Button variant="outline" size="sm">
              TMDB
            </Button>
            <Button variant="outline" size="sm">
              Metron
            </Button>
            <Button variant="outline" size="sm">
              ComicVine
            </Button>
            <Button variant="outline" size="sm">
              Marvel API
            </Button>
          </div>
          {/* state: bind selected source filters here */}
        </PopoverContent>
      </Popover>
      {/* state: bind the global query and route submissions to /admin/import */}
    </div>
  );
}
