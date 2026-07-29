"use client";

import { UserButton } from "@clerk/nextjs";
import { ListFilter, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import StarChartSearch from "../../import/components/search-bar";

const adminNavItems = [
  { href: "/admin", label: "Overview", exactRoute: true },
  { href: "/admin/structure", label: "Structure" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/sequences", label: "Sequences" },
  { href: "/admin/review", label: "Review" },
  { href: "/admin/ai-curation", label: "AI Curation" },
  { href: "/admin/settings", label: "Admin" },
] as const;

export function AdminTopbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-admin-black-line bg-admin-black text-admin-surface">
      <div className="flex min-h-14 items-center gap-3 px-3 lg:px-4">
        <Link
          href="/admin"
          className="flex shrink-0 items-center gap-2 border-r border-admin-black-line pr-3"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-admin-cream font-mono text-[10px] font-bold text-admin-black">
            SC
          </span>
        </Link>

        <nav
          aria-label="Admin navigation"
          className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:flex"
        >
          {adminNavItems.map((item) => {
            const active =
              "exactRoute" in item
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
                  active
                    ? "bg-admin-cream text-admin-black"
                    : "text-admin-black-text hover:bg-admin-black-line hover:text-admin-surface",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <StarChartSearch />

        {/*Mobile */}
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="text-admin-surface hover:bg-admin-black-line hover:text-admin-surface md:hidden"
        >
          <Link href="/admin/import" aria-label="Search StarChart">
            <Search />
          </Link>
        </Button>

        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-admin-ai">
          <UserButton />
          {/* Clerk supplies the authenticated identity and user menu */}
        </div>
      </div>

      {/*Mobile */}
      <nav
        aria-label="Mobile admin navigation"
        className="flex items-center gap-1 overflow-x-auto border-t border-admin-black-line px-3 py-2 lg:hidden"
      >
        {adminNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold text-admin-black-text hover:bg-admin-black-line hover:text-admin-surface"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
