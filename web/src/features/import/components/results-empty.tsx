import { Search, SearchX, TriangleAlert } from "lucide-react";

type ResultsEmptyProps = {
  variant: "idle" | "no-results" | "error";
  query?: string;
  message?: string;
};

const CONTENT = {
  idle: {
    icon: Search,
    title: "Search to start importing",
    description: "Look up a film, series, or run from an external source.",
  },
  "no-results": {
    icon: SearchX,
    title: "No matches found",
    description: "Try a different title or spelling.",
  },
  error: {
    icon: TriangleAlert,
    title: "Search failed",
    description: "Something went wrong while searching this category.",
  },
} as const;

export function ResultsEmpty({ variant, query, message }: ResultsEmptyProps) {
  const { icon: Icon, title, description } = CONTENT[variant];

  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-16 text-center">
      <Icon
        className={
          variant === "error"
            ? "size-6 text-destructive"
            : "size-6 text-muted-foreground"
        }
      />
      <p className="font-heading text-base font-medium">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        {message ??
          (variant === "no-results" && query
            ? `Nothing matched “${query}”. ${description}`
            : description)}
      </p>
    </div>
  );
}
