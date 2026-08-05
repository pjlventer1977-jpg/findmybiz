import { describe, expect, it } from "vitest";
import {
  expandMatchingCategoryIds,
  routeLeadsToBusinesses,
  type LeadRoutingCandidate,
} from "./lead-router";

const categories = [
  { id: "parent-electrical", parent_id: null },
  { id: "child-solar", parent_id: "parent-electrical" },
  { id: "child-plumber", parent_id: "parent-electrical" },
  { id: "parent-security", parent_id: null },
  { id: "child-armed", parent_id: "parent-security" },
];

function candidate(
  overrides: Partial<LeadRoutingCandidate> & { id: string }
): LeadRoutingCandidate {
  return {
    membership_tier: "starter",
    city_id: "city-1",
    province_id: "prov-1",
    category_ids: [],
    lead_credits_balance: 5,
    is_local_champion: false,
    lead_response_rate: 0.5,
    biz_trust_score: 50,
    ...overrides,
  };
}

describe("expandMatchingCategoryIds", () => {
  it("expands a parent to itself and all children", () => {
    expect(expandMatchingCategoryIds("parent-electrical", categories).sort()).toEqual(
      ["child-plumber", "child-solar", "parent-electrical"].sort()
    );
  });

  it("expands a child to itself and its parent", () => {
    expect(expandMatchingCategoryIds("child-solar", categories).sort()).toEqual(
      ["child-solar", "parent-electrical"].sort()
    );
  });
});

describe("routeLeadsToBusinesses category matching", () => {
  it("matches a child-listed business when the quote is for the parent industry", () => {
    const matching = expandMatchingCategoryIds("parent-electrical", categories);
    const routed = routeLeadsToBusinesses(
      [
        candidate({ id: "biz-solar", category_ids: ["child-solar"] }),
        candidate({ id: "biz-armed", category_ids: ["child-armed"] }),
      ],
      {
        province_id: "prov-1",
        city_id: "city-1",
        category_id: "parent-electrical",
        matching_category_ids: matching,
      }
    );
    expect(routed.map((b) => b.id)).toEqual(["biz-solar"]);
  });

  it("matches a parent-listed business when the quote is for a subcategory", () => {
    const matching = expandMatchingCategoryIds("child-solar", categories);
    const routed = routeLeadsToBusinesses(
      [candidate({ id: "biz-parent", category_ids: ["parent-electrical"] })],
      {
        province_id: "prov-1",
        city_id: "city-1",
        category_id: "child-solar",
        matching_category_ids: matching,
      }
    );
    expect(routed.map((b) => b.id)).toEqual(["biz-parent"]);
  });
});
