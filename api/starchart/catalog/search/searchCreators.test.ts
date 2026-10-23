import { describe, expect, test } from "vitest";
import { otherName } from "./searchCreators";

describe("otherName", () => {
  test("shows a different name that matched", () => {
    expect(otherName("Jack Kirby", "Jacob Kurtzberg")).toBe("Jacob Kurtzberg");
  });

  test("hides it when it is the main name", () => {
    expect(otherName("Jack Kirby", "jack kirby")).toBeNull();
  });
});
