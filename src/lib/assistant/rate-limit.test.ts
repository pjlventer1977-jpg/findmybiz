import { describe, expect, it } from "vitest";
import { checkAssistantRateLimit } from "@/lib/assistant/rate-limit";

describe("checkAssistantRateLimit", () => {
  it("allows a burst then blocks", () => {
    const key = `test-${Date.now()}-${Math.random()}`;
    for (let i = 0; i < 20; i += 1) {
      expect(checkAssistantRateLimit(key).ok).toBe(true);
    }
    const blocked = checkAssistantRateLimit(key);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });
});
