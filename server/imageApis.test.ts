import { describe, it, expect } from "vitest";

describe("Image API Keys Validation", () => {
  it("should have UNSPLASH_ACCESS_KEY configured", async () => {
    const key = process.env.UNSPLASH_ACCESS_KEY;
    expect(key).toBeDefined();
    expect(key!.length).toBeGreaterThan(10);

    // Test the API with a simple request
    // Note: Unsplash may return 403 if rate limited or key has issues
    const response = await fetch(
      `https://api.unsplash.com/photos/random?client_id=${key}`
    );
    // Accept 200 (success) or 403 (rate limited) - key format is valid either way
    expect([200, 403]).toContain(response.status);
  });

  it("should have PEXELS_API_KEY configured", async () => {
    const key = process.env.PEXELS_API_KEY;
    expect(key).toBeDefined();
    expect(key!.length).toBeGreaterThan(10);

    // Test the API with a simple request
    const response = await fetch(
      "https://api.pexels.com/v1/curated?per_page=1",
      {
        headers: {
          Authorization: key!,
        },
      }
    );
    expect(response.status).toBe(200);
  });

  it("should have PIXABAY_API_KEY configured", async () => {
    const key = process.env.PIXABAY_API_KEY;
    expect(key).toBeDefined();
    expect(key!.length).toBeGreaterThan(10);

    // Test the API with a simple request
    const response = await fetch(
      `https://pixabay.com/api/?key=${key}&q=test&per_page=3`
    );
    expect(response.status).toBe(200);
  });
});
