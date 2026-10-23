// Creator search finds writers and artists by their official name or any other name they worked under.

import { api } from "encore.dev/api";
import { Max, MaxLen, Min, MinLen } from "encore.dev/validate";
import { prisma } from "../lib/prisma";
import { DEFAULT_PAGE_SIZE, nextCursor, readCursor } from "./cursor";

export interface SearchCreatorsRequest {
  // What the user typed. Trigram search needs at least three characters.
  text: string & MinLen<3> & MaxLen<100>;
  limit?: number & Min<1> & Max<50>;
  // The nextCursor from the previous page.
  cursor?: string;
}

export interface CreatorResult {
  id: number;
  name: string;
  // The other name that matched, for example a pen name. Null when the official name matched.
  matchedName: string | null;
  birthYear: number | null;
  deathYear: number | null;
}

export interface SearchCreatorsResponse {
  results: CreatorResult[];
  // Empty on the last page.
  nextCursor: string;
}

// The columns the creator search query returns.
interface CreatorRow {
  id: number;
  name: string;
  matched_name: string;
  birth_year: number | null;
  death_year: number | null;
}

// SearchCreators finds creators by name. A creator who matches under several names comes back once.
export const searchCreators = api(
  { expose: true, method: "GET", path: "/search/creators" },
  async (request: SearchCreatorsRequest): Promise<SearchCreatorsResponse> => {
    const pageSize = request.limit ?? DEFAULT_PAGE_SIZE;
    const offset = request.cursor ? readCursor(request.cursor) : 0;

    // Every name that matches, then each creator's best-matching name, then best match first.
    const rows = await prisma.$queryRaw<CreatorRow[]>`
      with matching_names as (
        select id as creator_id, gcd_official_name as name
        from gcd.creator
        where ${request.text} <% gcd_official_name
        union all
        select creator_id, name
        from gcd.creator_name_detail
        where ${request.text} <% name
      ),
      best_name as (
        select distinct on (creator_id) creator_id, name,
               word_similarity(${request.text}, name) as score
        from matching_names
        order by creator_id, word_similarity(${request.text}, name) desc
      )
      select c.id, c.gcd_official_name as name, b.name as matched_name, c.birth_year, c.death_year
      from best_name b
      join gcd.creator c on c.id = b.creator_id
      order by b.score desc, c.sort_name, c.id
      limit ${pageSize + 1} offset ${offset}
    `;

    return {
      results: rows.slice(0, pageSize).map((row) => ({
        id: row.id,
        name: row.name,
        matchedName: otherName(row.name, row.matched_name),
        birthYear: row.birth_year,
        deathYear: row.death_year,
      })),
      nextCursor: nextCursor(rows.length, pageSize, offset),
    };
  },
);

// The matched name is only worth showing when it differs from the main name.
export function otherName(name: string, matchedName: string): string | null {
  return matchedName.toLowerCase() === name.toLowerCase() ? null : matchedName;
}
