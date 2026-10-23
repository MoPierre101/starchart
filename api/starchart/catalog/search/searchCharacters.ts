// Character search finds characters by their name or any other name they go by.

import { api } from "encore.dev/api";
import { Max, MaxLen, Min, MinLen } from "encore.dev/validate";
import { prisma } from "../lib/prisma";
import { DEFAULT_PAGE_SIZE, nextCursor, readCursor } from "./cursor";
import { otherName } from "./searchCreators";

export interface SearchCharactersRequest {
  // What the user typed. Trigram search needs at least three characters.
  text: string & MinLen<3> & MaxLen<100>;
  limit?: number & Min<1> & Max<50>;
  // The nextCursor from the previous page.
  cursor?: string;
}

export interface CharacterResult {
  id: number;
  name: string;
  // The other name that matched, for example a secret identity. Null when the main name matched.
  matchedName: string | null;
  // Tells apart characters with the same name, for example "Earth-2".
  disambiguation: string | null;
}

export interface SearchCharactersResponse {
  results: CharacterResult[];
  // Empty on the last page.
  nextCursor: string;
}

// The columns the character search query returns.
interface CharacterRow {
  id: number;
  name: string;
  matched_name: string;
  disambiguation: string | null;
}

// SearchCharacters finds characters by name. A character who matches under several names comes back once.
export const searchCharacters = api(
  { expose: true, method: "GET", path: "/search/characters" },
  async (request: SearchCharactersRequest): Promise<SearchCharactersResponse> => {
    const pageSize = request.limit ?? DEFAULT_PAGE_SIZE;
    const offset = request.cursor ? readCursor(request.cursor) : 0;

    // Every name that matches, then each character's best-matching name, then best match first.
    const rows = await prisma.$queryRaw<CharacterRow[]>`
      with matching_names as (
        select id as character_id, name
        from gcd.character
        where ${request.text} <% name
        union all
        select character_id, name
        from gcd.character_name_detail
        where ${request.text} <% name
      ),
      best_name as (
        select distinct on (character_id) character_id, name,
               word_similarity(${request.text}, name) as score
        from matching_names
        order by character_id, word_similarity(${request.text}, name) desc
      )
      select ch.id, ch.name, b.name as matched_name, ch.disambiguation
      from best_name b
      join gcd.character ch on ch.id = b.character_id
      order by b.score desc, ch.sort_name, ch.id
      limit ${pageSize + 1} offset ${offset}
    `;

    return {
      results: rows.slice(0, pageSize).map((row) => ({
        id: row.id,
        name: row.name,
        matchedName: otherName(row.name, row.matched_name),
        disambiguation: row.disambiguation,
      })),
      nextCursor: nextCursor(rows.length, pageSize, offset),
    };
  },
);
