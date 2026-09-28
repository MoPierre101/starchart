export const importKeys = {
  all: ["import"] as const,
  searches: () => [...importKeys.all, "search"] as const,
  search: (category: string, query: string) =>
    [...importKeys.searches(), category, query] as const,
};
