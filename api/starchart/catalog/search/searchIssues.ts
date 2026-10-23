// Issue search finds single issues, collections and graphic novels by the text a user types.

import { api } from "encore.dev/api";
import { Max, MaxLen, Min, MinLen } from "encore.dev/validate";
import { Rating, ratingLabel } from "../lib/rating";
import { prisma } from "../lib/prisma";
import { DEFAULT_PAGE_SIZE, nextCursor, readCursor } from "./cursor";

export type IssueFormat = "single issue" | "collection" | "graphic novel";

export interface SearchIssuesRequest {
  // What the user typed. Trigram search needs at least three characters.
  text: string & MinLen<3> & MaxLen<100>;
  format?: IssueFormat;
  publisherId?: number;
  // Filter on the issue's own year.
  yearFrom?: number;
  yearTo?: number;
  limit?: number & Min<1> & Max<50>;
  // The nextCursor from the previous page.
  cursor?: string;
}

export interface IssueResult {
  id: number;
  displayName: string;
  seriesName: string;
  number: string | null;
  format: IssueFormat;
  publisherName: string;
  dateText: string;
  rating: Rating;
}

export interface SearchIssuesResponse {
  results: IssueResult[];
  // Empty on the last page.
  nextCursor: string;
}

// The columns the issue search query returns.
interface IssueRow {
  id: number;
  title: string | null;
  number: string | null;
  kind: IssueFormat;
  publication_date: string | null;
  key_year: number | null;
  series_name: string;
  publisher_name: string;
  rating_class: string | null;
}

// SearchIssues finds regular issues by series name, series year, number, issue year and title.
export const searchIssues = api(
  { expose: true, method: "GET", path: "/search/issues" },
  async (request: SearchIssuesRequest): Promise<SearchIssuesResponse> => {
    const pageSize = request.limit ?? DEFAULT_PAGE_SIZE;
    const offset = request.cursor ? readCursor(request.cursor) : 0;

    // Best match first, then newest first. One extra row tells us whether another page exists.
    const rows = await prisma.$queryRaw<IssueRow[]>`
      select i.id, i.title, i.number, i.kind, i.publication_date, i.key_year,
             s.name as series_name, p.name as publisher_name,
             i.rating_class
      from gcd.issue i
      join gcd.series s on s.id = i.series_id
      join gcd.publisher p on p.id = s.publisher_id
      where i.variant_of_id is null
        and ${request.text} <% i.search_text
        and (${request.format ?? null}::text is null or i.kind = ${request.format ?? null})
        and (${request.publisherId ?? null}::integer is null or s.publisher_id = ${request.publisherId ?? null})
        and (${request.yearFrom ?? null}::integer is null or i.key_year >= ${request.yearFrom ?? null})
        and (${request.yearTo ?? null}::integer is null or i.key_year <= ${request.yearTo ?? null})
      order by word_similarity(${request.text}, i.search_text) desc,
               i.key_sort_date desc nulls last,
               i.id desc
      limit ${pageSize + 1} offset ${offset}
    `;

    return {
      results: rows.slice(0, pageSize).map(toIssueResult),
      nextCursor: nextCursor(rows.length, pageSize, offset),
    };
  },
);

// Turns a database row into what the app shows.
function toIssueResult(row: IssueRow): IssueResult {
  const number = issueNumber(row.number);
  return {
    id: row.id,
    displayName: issueDisplayName(row.title, row.series_name, number),
    seriesName: row.series_name,
    number,
    format: row.kind,
    publisherName: row.publisher_name,
    dateText: issueDateText(row.publication_date, row.key_year),
    rating: ratingLabel(row.rating_class),
  };
}

// GCD writes "[nn]" for an issue with no number.
export function issueNumber(number: string | null): string | null {
  return number === "[nn]" ? null : number;
}

// An issue's name is its title, or its series name and number when it has no title.
export function issueDisplayName(title: string | null, seriesName: string, number: string | null): string {
  if (title) return title;
  return number ? `${seriesName} #${number}` : seriesName;
}

// The date shown is the printed publication date, then the year, then "Date unknown".
export function issueDateText(publicationDate: string | null, keyYear: number | null): string {
  return publicationDate ?? (keyYear ? String(keyYear) : "Date unknown");
}
