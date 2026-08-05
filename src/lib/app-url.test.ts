import { describe, expect, it } from "vitest";
import { getCanonicalAppUrl } from "./app-url";

describe("getCanonicalAppUrl", () => {
  it("defaults to www when unset", () => {
    expect(getCanonicalAppUrl(undefined)).toBe("https://www.findmybiz.co.za");
    expect(getCanonicalAppUrl("")).toBe("https://www.findmybiz.co.za");
  });

  it("rewrites apex findmybiz.co.za to www so PayFast ITN is not redirected", () => {
    expect(getCanonicalAppUrl("https://findmybiz.co.za")).toBe(
      "https://www.findmybiz.co.za"
    );
    expect(getCanonicalAppUrl("https://findmybiz.co.za/")).toBe(
      "https://www.findmybiz.co.za"
    );
  });

  it("preserves www and other hosts", () => {
    expect(getCanonicalAppUrl("https://www.findmybiz.co.za")).toBe(
      "https://www.findmybiz.co.za"
    );
    expect(getCanonicalAppUrl("https://www.findmybiz.co.za/")).toBe(
      "https://www.findmybiz.co.za"
    );
    expect(getCanonicalAppUrl("http://localhost:3000")).toBe(
      "http://localhost:3000"
    );
  });
});
