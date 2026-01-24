import { describe, it, expect } from "vitest";

describe("API Keys Validation", () => {
  it("should have ANTHROPIC_API_KEY configured", () => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey?.startsWith("sk-ant-")).toBe(true);
    expect(apiKey!.length).toBeGreaterThan(20);
  });

  it("should have OPENAI_API_KEY_CUSTOM configured", async () => {
    const apiKey = process.env.OPENAI_API_KEY_CUSTOM;
    expect(apiKey).toBeDefined();
    expect(apiKey?.startsWith("sk-")).toBe(true);
    
    // Test the API key with a minimal request
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 10,
        messages: [{ role: "user", content: "Say OK" }],
      }),
    });
    
    expect(response.status).toBe(200);
  });

  it("should have GEMINI_API_KEY configured", async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey?.startsWith("AIza")).toBe(true);
    
    // Test the API key with a minimal request
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Say OK" }] }],
        }),
      }
    );
    
    expect(response.status).toBe(200);
  });
});
