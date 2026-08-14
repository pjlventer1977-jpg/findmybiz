import { describe, expect, it } from "vitest";
import { fallbackAssistantReply } from "@/lib/assistant/fallback";

describe("fallbackAssistantReply", () => {
  it("answers listing questions without search", async () => {
    const result = await fallbackAssistantReply("List my business");
    expect(result.listings).toEqual([]);
    expect(result.message).toMatch(/register/i);
  });

  it("answers quote questions", async () => {
    const result = await fallbackAssistantReply("How do quotes work?");
    expect(result.message).toMatch(/get-quotes/i);
  });
});
