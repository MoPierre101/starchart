import { describe, expect, test } from "vitest";
import { ratingLabel } from "./rating";

describe("ratingLabel", () => {
  test("shows the rating class, or unknown when there is none", () => {
    expect(ratingLabel("teen")).toBe("teen");
    expect(ratingLabel("none")).toBe("unknown");
    expect(ratingLabel(null)).toBe("unknown");
  });
});
