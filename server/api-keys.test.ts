import { describe, expect, it } from "vitest";

/**
 * Test that API keys are properly loaded from environment variables
 * This validates that the security fix is working correctly
 */
describe("API Keys Configuration", () => {
  it("should have ANTHROPIC_API_KEY loaded", () => {
    const key = process.env.ANTHROPIC_API_KEY;
    expect(key).toBeDefined();
    expect(key).toMatch(/^sk-ant-api03-/);
    expect(key?.length).toBeGreaterThan(50);
  });

  it("should have OPENAI_API_KEY_CUSTOM loaded", () => {
    const key = process.env.OPENAI_API_KEY_CUSTOM;
    expect(key).toBeDefined();
    expect(key).toMatch(/^sk-proj-/);
    expect(key?.length).toBeGreaterThan(50);
  });

  it("should have GEMINI_API_KEY loaded", () => {
    const key = process.env.GEMINI_API_KEY;
    expect(key).toBeDefined();
    expect(key).toMatch(/^AIzaSy/);
    expect(key?.length).toBeGreaterThan(30);
  });

  it("should have UNSPLASH_ACCESS_KEY loaded", () => {
    const key = process.env.UNSPLASH_ACCESS_KEY;
    expect(key).toBeDefined();
    expect(key?.length).toBeGreaterThan(20);
  });

  it("should have PEXELS_API_KEY loaded", () => {
    const key = process.env.PEXELS_API_KEY;
    expect(key).toBeDefined();
    expect(key?.length).toBeGreaterThan(20);
  });

  it("should have PIXABAY_API_KEY loaded", () => {
    const key = process.env.PIXABAY_API_KEY;
    expect(key).toBeDefined();
    expect(key?.length).toBeGreaterThan(10);
  });

  it("should have BRAVE_SEARCH_API_KEY loaded", () => {
    const key = process.env.BRAVE_SEARCH_API_KEY;
    expect(key).toBeDefined();
    expect(key?.length).toBeGreaterThan(20);
  });

  it("should have DATABASE_URL loaded", () => {
    const url = process.env.DATABASE_URL;
    expect(url).toBeDefined();
    expect(url).toMatch(/^mysql:\/\//);
  });

  it("should have JWT_SECRET loaded", () => {
    const secret = process.env.JWT_SECRET;
    expect(secret).toBeDefined();
    expect(secret?.length).toBeGreaterThan(10);
  });

  it("should have valid API key formats (not placeholder values)", () => {
    // Verify keys are real, not placeholders like "your_key_here"
    const anthropicKey = process.env.ANTHROPIC_API_KEY || "";
    const openaiKey = process.env.OPENAI_API_KEY_CUSTOM || "";
    
    expect(anthropicKey).not.toContain("your_");
    expect(anthropicKey).not.toContain("placeholder");
    expect(openaiKey).not.toContain("your_");
    expect(openaiKey).not.toContain("placeholder");
  });
});
