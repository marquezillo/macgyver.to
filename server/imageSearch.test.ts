import { describe, it, expect } from "vitest";
import { searchImages, searchUnsplash, searchPexels, searchPixabay, getApiStatus } from "./imageSearch";

describe("Image Search Hybrid System", () => {
  it("should have all API keys configured", () => {
    const status = getApiStatus();
    expect(status.unsplash).toBe(true);
    expect(status.pexels).toBe(true);
    expect(status.pixabay).toBe(true);
  });

  it("should search Unsplash successfully", async () => {
    const results = await searchUnsplash("nature landscape", { count: 2 });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].source).toBe("unsplash");
    expect(results[0].url).toContain("unsplash");
  });

  it("should search Pexels successfully", async () => {
    const results = await searchPexels("business office", { count: 2 });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].source).toBe("pexels");
  });

  it("should search Pixabay successfully", async () => {
    const results = await searchPixabay("technology computer", { count: 2 });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].source).toBe("pixabay");
  });

  it("should use hybrid search and prioritize stock images", async () => {
    const results = await searchImages("modern office workspace", { count: 3 });
    
    // Should return results
    expect(results.length).toBeGreaterThan(0);
    
    // First results should be from stock sources (not AI generated)
    const stockSources = ["unsplash", "pexels", "pixabay"];
    expect(stockSources).toContain(results[0].source);
    
    // Should have proper structure
    expect(results[0]).toHaveProperty("url");
    expect(results[0]).toHaveProperty("thumbnailUrl");
    expect(results[0]).toHaveProperty("alt");
    expect(results[0]).toHaveProperty("source");
  });
});
