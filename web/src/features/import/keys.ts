export const importKeys = {
  all: ["import"] as const,
  searches: () => [...importKeys.all, "search"] as const,
  search: (provider: string, query: string) =>
    [...importKeys.searches(), provider, query] as const,
};
