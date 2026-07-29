import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function StarChartSearch() {
  return (
    <div className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-admin-black-text" />
      <Input
        aria-label="Search"
        placeholder="Search..."
        className="h-8 border-admin-black-line bg-admin-black-soft pl-8 text-xs text-admin-surface placeholder:text-admin-black-text focus-visible:border-admin-muted focus-visible:ring-admin-muted/30"
      />
    </div>
  );
}
