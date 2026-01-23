import { describe, it, expect } from "vitest";

describe("Brave Search API", () => {
  it("should have BRAVE_SEARCH_API_KEY configured", () => {
    const apiKey = process.env.BRAVE_SEARCH_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe("");
  });

  it("should successfully search with Brave API", async () => {
    const apiKey = process.env.BRAVE_SEARCH_API_KEY;
    if (!apiKey) {
      console.warn("Skipping test: BRAVE_SEARCH_API_KEY not configured");
      return;
    }

    const url = new URL("https://api.search.brave.com/res/v1/web/search");
    url.searchParams.set("q", "test query");
    url.searchParams.set("count", "3");

    const response = await fetch(url.toString(), {
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": apiKey,
      },
    });

    expect(response.ok).toBe(true);
    
    const result = await response.json() as any;
    expect(result).toBeDefined();
    expect(result.web).toBeDefined();
    expect(result.web.results).toBeDefined();
    expect(Array.isArray(result.web.results)).toBe(true);
    
    console.log(`✅ Brave Search API working - Found ${result.web.results.length} results`);
  });
});
