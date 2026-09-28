import { z } from "zod";

// Mirrors the backend search response models. Keep these in sync by hand.

export const MediaSearchResultSchema = z.object({
  provider: z.string(),
  external_id: z.string(),
  title: z.string(),
  media_type: z.string(),
  poster_url: z.string().nullable(),
  release_year: z.number().int().nullable(),
  overview: z.string().nullable(),
  raw: z.record(z.string(), z.unknown()),
});

export const SearchResponseSchema = z.object({
  category: z.string(),
  query: z.string(),
  results: z.array(MediaSearchResultSchema),
});

export const SearchByIdResponseSchema = z.object({
  category: z.string(),
  id: z.number().int().positive(),
  result: MediaSearchResultSchema

})

export const CategoriesResponseSchema = z.object({
  categories: z.array(z.string()),
});

export type MediaSearchResult = z.infer<typeof MediaSearchResultSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
export type SearchByIdResponse = z.infer<typeof SearchByIdResponseSchema>;
