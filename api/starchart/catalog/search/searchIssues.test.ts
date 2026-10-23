import { describe, expect, test } from "vitest";
import { issueDateText, issueDisplayName, issueNumber } from "./searchIssues";

// The search query itself needs the GCD data, which the test database does not have,
// so these tests cover the rules around it.

describe("issueDisplayName", () => {
  test("uses the title when there is one", () => {
    expect(issueDisplayName("The Wedding", "Batman", "50")).toBe("The Wedding");
  });

  test("falls back to series name and number", () => {
    expect(issueDisplayName(null, "Batman", "404")).toBe("Batman #404");
  });

  test("shows only the series name when the issue has no number", () => {
    expect(issueDisplayName(null, "Predator: The Theta Saga", issueNumber("[nn]"))).toBe("Predator: The Theta Saga");
  });
});

describe("issueDateText", () => {
  test("prefers the printed date, then the year", () => {
    expect(issueDateText("September 2018", 2018)).toBe("September 2018");
    expect(issueDateText(null, 2018)).toBe("2018");
    expect(issueDateText(null, null)).toBe("Date unknown");
  });
});
