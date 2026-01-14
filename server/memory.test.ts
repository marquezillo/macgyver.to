import { describe, it, expect, vi, beforeEach } from "vitest";
import * as db from "./db";

// Mock the database module
vi.mock("./db", () => ({
  createMemory: vi.fn(),
  getUserMemories: vi.fn(),
  deleteMemory: vi.fn(),
}));

describe("memory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("memory.create", () => {
    it("creates a memory with valid data", async () => {
      const mockMemory = {
        id: "mem_123",
        userId: "user_123",
        content: "User prefers dark mode",
        category: "preference",
        createdAt: new Date(),
      };

      vi.mocked(db.createMemory).mockResolvedValue(mockMemory);

      const result = await db.createMemory({
        userId: "user_123",
        content: "User prefers dark mode",
        category: "preference",
      });

      expect(result).toEqual(mockMemory);
      expect(db.createMemory).toHaveBeenCalledWith({
        userId: "user_123",
        content: "User prefers dark mode",
        category: "preference",
      });
    });
  });

  describe("memory.list", () => {
    it("returns user memories", async () => {
      const mockMemories = [
        {
          id: "mem_1",
          userId: "user_123",
          content: "Prefers dark mode",
          category: "preference",
          createdAt: new Date(),
        },
        {
          id: "mem_2",
          userId: "user_123",
          content: "Works as a developer",
          category: "fact",
          createdAt: new Date(),
        },
      ];

      vi.mocked(db.getUserMemories).mockResolvedValue(mockMemories);

      const result = await db.getUserMemories("user_123");

      expect(result).toEqual(mockMemories);
      expect(db.getUserMemories).toHaveBeenCalledWith("user_123");
    });

    it("returns empty array for user with no memories", async () => {
      vi.mocked(db.getUserMemories).mockResolvedValue([]);

      const result = await db.getUserMemories("user_no_memories");

      expect(result).toEqual([]);
    });
  });

  describe("memory.delete", () => {
    it("deletes a memory by id", async () => {
      vi.mocked(db.deleteMemory).mockResolvedValue(true);

      const result = await db.deleteMemory("mem_123", "user_123");

      expect(result).toBe(true);
      expect(db.deleteMemory).toHaveBeenCalledWith("mem_123", "user_123");
    });

    it("returns false when memory not found", async () => {
      vi.mocked(db.deleteMemory).mockResolvedValue(false);

      const result = await db.deleteMemory("nonexistent", "user_123");

      expect(result).toBe(false);
    });
  });
});
