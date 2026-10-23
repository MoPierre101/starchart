// Paging for the search lists (decision 40). A search cursor holds how many results were already shown,
// wrapped so the app treats it as opaque text.

import { APIError } from "encore.dev/api";

// How many results a page holds when the app does not ask for a number.
export const DEFAULT_PAGE_SIZE = 20;

export function makeCursor(offset: number): string {
  return Buffer.from(String(offset)).toString("base64url");
}

export function readCursor(cursor: string): number {
  const offset = Number(Buffer.from(cursor, "base64url").toString());
  if (!Number.isInteger(offset) || offset < 0) {
    throw APIError.invalidArgument("invalid cursor");
  }
  return offset;
}

// The queries fetch one row more than a page. If it came back, there is a next page.
export function nextCursor(rowCount: number, pageSize: number, offset: number): string {
  return rowCount > pageSize ? makeCursor(offset + pageSize) : "";
}
