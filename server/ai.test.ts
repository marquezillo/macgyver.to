import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the LLM function
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

import { invokeLLM } from "./_core/llm";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("ai.chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a simple text response from LLM", async () => {
    vi.mocked(invokeLLM).mockResolvedValue({
      id: "test-id",
      created: Date.now(),
      model: "test-model",
      choices: [{
        index: 0,
        message: {
          role: "assistant",
          content: "Hola, ¿en qué puedo ayudarte?",
        },
        finish_reason: "stop",
      }],
    });

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.chat({
      messages: [{ role: "user", content: "Hola" }],
    });

    expect(invokeLLM).toHaveBeenCalled();
    expect(result.content).toBe("Hola, ¿en qué puedo ayudarte?");
    expect(result.hasArtifact).toBe(false);
    expect(result.artifactData).toBeNull();
  });

  it("parses landing page JSON response and returns artifact", async () => {
    const landingJson = JSON.stringify({
      type: "landing",
      sections: [
        { id: "hero-1", type: "hero", content: { title: "Test" } }
      ],
      message: "He creado tu landing page"
    });

    vi.mocked(invokeLLM).mockResolvedValue({
      id: "test-id",
      created: Date.now(),
      model: "test-model",
      choices: [{
        index: 0,
        message: {
          role: "assistant",
          content: landingJson,
        },
        finish_reason: "stop",
      }],
    });

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.chat({
      messages: [{ role: "user", content: "Crea una landing page" }],
    });

    expect(result.content).toBe("He creado tu landing page");
    expect(result.hasArtifact).toBe(true);
    // El sistema añade campos adicionales como backgroundImage y variant automáticamente
    expect(result.artifactData?.sections).toBeDefined();
    expect(result.artifactData?.sections?.length).toBe(1);
    expect((result.artifactData?.sections as unknown[])?.[0]).toMatchObject({
      id: "hero-1",
      type: "hero",
      content: expect.objectContaining({ title: "Test" })
    });
  });

  it("handles LLM errors gracefully", async () => {
    vi.mocked(invokeLLM).mockRejectedValue(new Error("LLM service unavailable"));

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.ai.chat({ messages: [{ role: "user", content: "Test" }] })
    ).rejects.toThrow("Error al procesar tu mensaje");
  });
});
