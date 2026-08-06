import { describe, expect, it } from "vitest";
import {
  businessMatchesAllSearchTerms,
  categoryMatchesSearchTerm,
  matchesWholeWord,
} from "./text-match";

describe("matchesWholeWord", () => {
  it("matches standalone IT but not substrings inside other words", () => {
    expect(matchesWholeWord("IT Support & Managed Services", "IT")).toBe(true);
    expect(matchesWholeWord("Farm Equipment & Mechanisation", "IT")).toBe(false);
    expect(matchesWholeWord("Sustainable farming in the city", "IT")).toBe(false);
    expect(matchesWholeWord("Tyre Fitment Centres", "IT")).toBe(false);
  });
});

describe("categoryMatchesSearchTerm", () => {
  it("matches IT category slug segment without matching equipment", () => {
    expect(
      categoryMatchesSearchTerm({ name: "IT Support & Managed Services", slug: "it-support" }, "IT")
    ).toBe(true);
    expect(
      categoryMatchesSearchTerm(
        { name: "Farm Equipment & Mechanisation", slug: "farm-equipment" },
        "IT"
      )
    ).toBe(false);
  });
});

describe("businessMatchesAllSearchTerms", () => {
  it("requires every word to match as a whole word", () => {
    expect(
      businessMatchesAllSearchTerms(
        {
          name: "TECH-SMART",
          trading_name: null,
          description: "IT Support & Managed Services",
        },
        ["IT"]
      )
    ).toBe(true);
    expect(
      businessMatchesAllSearchTerms(
        {
          name: "Urban Farming SA",
          trading_name: null,
          description: "Sustainable farming in the city",
        },
        ["IT"]
      )
    ).toBe(false);
  });
});
