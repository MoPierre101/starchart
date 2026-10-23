// The search bar's dropdown: the top few issues, creators and characters in one call.

import { api } from "encore.dev/api";
import { MaxLen, MinLen } from "encore.dev/validate";
import { CharacterResult, searchCharacters } from "./searchCharacters";
import { CreatorResult, searchCreators } from "./searchCreators";
import { IssueResult, searchIssues } from "./searchIssues";

// How many of each kind the dropdown shows. "See all" uses the paged routes.
const DROPDOWN_SIZE = 5;

export interface SearchRequest {
  // What the user typed. Trigram search needs at least three characters.
  text: string & MinLen<3> & MaxLen<100>;
}

export interface SearchResponse {
  issues: IssueResult[];
  creators: CreatorResult[];
  characters: CharacterResult[];
}

// Search runs the three searches at the same time and returns the top results of each.
export const search = api(
  { expose: true, method: "GET", path: "/search" },
  async ({ text }: SearchRequest): Promise<SearchResponse> => {
    const [issues, creators, characters] = await Promise.all([
      searchIssues({ text, limit: DROPDOWN_SIZE }),
      searchCreators({ text, limit: DROPDOWN_SIZE }),
      searchCharacters({ text, limit: DROPDOWN_SIZE }),
    ]);
    return {
      issues: issues.results,
      creators: creators.results,
      characters: characters.results,
    };
  },
);
