import { APIError } from "encore.dev/api";
import { describe, expect, test } from "vitest";
import { makeCursor, nextCursor, readCursor } from "./cursor";

describe("cursor", () => {
  test("reads back the offset it was made from", () => {
    expect(readCursor(makeCursor(40))).toBe(40);
  });

  test("rejects text that is not a cursor", () => {
    expect(() => readCursor("not-a-cursor")).toThrow(APIError);
  });

  test("is empty on the last page", () => {
    expect(nextCursor(20, 20, 0)).toBe("");
    expect(readCursor(nextCursor(21, 20, 40))).toBe(60);
  });
});
