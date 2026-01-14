import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the dependencies
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

vi.mock("./db", () => ({
  createMemory: vi.fn(),
  getMemoriesByUserId: vi.fn(),
}));

import { invokeLLM } from "./_core/llm";
import { createMemory, getMemoriesByUserId } from "./db";

// Import after mocking
import { extractMemoriesFromConversation } from "./memoryExtraction";

describe("memoryExtraction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("extractMemoriesFromConversation", () => {
    it("skips extraction for short messages", async () => {
      const result = await extractMemoriesFromConversation(
        1,
        "Hola", // Too short
        "¡Hola! ¿En qué puedo ayudarte?"
      );

      expect(result).toEqual([]);
      expect(invokeLLM).not.toHaveBeenCalled();
    });

    it("skips extraction for simple greetings", async () => {
      const result = await extractMemoriesFromConversation(
        1,
        "Buenos días, ¿cómo estás?",
        "¡Buenos días! Estoy bien, gracias."
      );

      expect(result).toEqual([]);
      expect(invokeLLM).not.toHaveBeenCalled();
    });

    it("extracts preferences from meaningful messages", async () => {
      vi.mocked(invokeLLM).mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              shouldExtract: true,
              memories: [
                {
                  category: "preference",
                  content: "Prefiere respuestas en español",
                  importance: 7
                }
              ]
            })
          }
        }]
      } as any);

      vi.mocked(getMemoriesByUserId).mockResolvedValue([]);
      vi.mocked(createMemory).mockResolvedValue({
        id: 1,
        userId: 1,
        category: "preference",
        content: "Prefiere respuestas en español",
        source: "auto",
        sourceChatId: null,
        importance: 7,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await extractMemoriesFromConversation(
        1,
        "Por favor, siempre respóndeme en español porque es mi idioma preferido y me resulta más cómodo.",
        "Entendido, a partir de ahora te responderé siempre en español."
      );

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe("preference");
      expect(createMemory).toHaveBeenCalled();
    });

    it("filters out duplicate memories", async () => {
      vi.mocked(invokeLLM).mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              shouldExtract: true,
              memories: [
                {
                  category: "preference",
                  content: "Prefiere respuestas en español",
                  importance: 7
                }
              ]
            })
          }
        }]
      } as any);

      // Existing memory with similar content
      vi.mocked(getMemoriesByUserId).mockResolvedValue([
        {
          id: 1,
          userId: 1,
          category: "preference",
          content: "Prefiere respuestas en español",
          source: "manual",
          sourceChatId: null,
          importance: 7,
          isActive: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);

      const result = await extractMemoriesFromConversation(
        1,
        "Recuerda que siempre quiero respuestas en español porque es mi idioma preferido.",
        "Entendido, continuaré respondiendo en español."
      );

      // Should filter out the duplicate
      expect(result).toHaveLength(0);
      expect(createMemory).not.toHaveBeenCalled();
    });

    it("handles LLM returning no memories", async () => {
      vi.mocked(invokeLLM).mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              shouldExtract: false,
              memories: []
            })
          }
        }]
      } as any);

      const result = await extractMemoriesFromConversation(
        1,
        "¿Cuál es la capital de Francia? Necesito saberlo para un trabajo.",
        "La capital de Francia es París."
      );

      expect(result).toEqual([]);
      expect(createMemory).not.toHaveBeenCalled();
    });

    it("handles LLM errors gracefully", async () => {
      vi.mocked(invokeLLM).mockRejectedValue(new Error("LLM service unavailable"));

      const result = await extractMemoriesFromConversation(
        1,
        "Soy desarrollador de software y trabajo principalmente con React y TypeScript.",
        "¡Genial! React y TypeScript son excelentes tecnologías."
      );

      expect(result).toEqual([]);
    });

    it("extracts facts about the user", async () => {
      vi.mocked(invokeLLM).mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              shouldExtract: true,
              memories: [
                {
                  category: "fact",
                  content: "Es desarrollador de software especializado en React y TypeScript",
                  importance: 8
                }
              ]
            })
          }
        }]
      } as any);

      vi.mocked(getMemoriesByUserId).mockResolvedValue([]);
      vi.mocked(createMemory).mockResolvedValue({
        id: 2,
        userId: 1,
        category: "fact",
        content: "Es desarrollador de software especializado en React y TypeScript",
        source: "auto",
        sourceChatId: null,
        importance: 8,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const result = await extractMemoriesFromConversation(
        1,
        "Soy desarrollador de software y trabajo principalmente con React y TypeScript en una startup de fintech.",
        "¡Excelente! React y TypeScript son muy populares en el ecosistema de fintech."
      );

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe("fact");
      expect(createMemory).toHaveBeenCalledWith(
        1,
        "fact",
        "Es desarrollador de software especializado en React y TypeScript",
        "auto",
        undefined,
        8
      );
    });
  });
});
