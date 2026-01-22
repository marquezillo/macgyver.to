import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  createChat: vi.fn(),
  getChatsByUserId: vi.fn(),
  getChatById: vi.fn(),
  updateChatTitle: vi.fn(),
  updateChatArtifact: vi.fn(),
  deleteChat: vi.fn(),
  createMessage: vi.fn(),
  getMessagesByChatId: vi.fn(),
}));

import {
  createChat,
  getChatsByUserId,
  getChatById,
  updateChatTitle,
  deleteChat,
  createMessage,
  getMessagesByChatId,
} from "./db";

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

describe("chat.create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new chat for authenticated user", async () => {
    const mockChat = {
      id: 1,
      userId: 1,
      title: "Test Chat",
      artifactData: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(createChat).mockResolvedValue(mockChat);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.create({ title: "Test Chat" });

    expect(createChat).toHaveBeenCalledWith(1, "Test Chat");
    expect(result).toEqual(mockChat);
  });

  it("creates chat with default title when none provided", async () => {
    const mockChat = {
      id: 2,
      userId: 1,
      title: "Nueva conversación",
      artifactData: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(createChat).mockResolvedValue(mockChat);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.create({});

    expect(createChat).toHaveBeenCalledWith(1, undefined);
    expect(result).toEqual(mockChat);
  });
});

describe("chat.list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all chats for authenticated user", async () => {
    const mockChats = [
      { id: 1, userId: 1, title: "Chat 1", artifactData: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, userId: 1, title: "Chat 2", artifactData: null, createdAt: new Date(), updatedAt: new Date() },
    ];

    vi.mocked(getChatsByUserId).mockResolvedValue(mockChats);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.list();

    expect(getChatsByUserId).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockChats);
  });
});

describe("chat.delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes chat when user owns it", async () => {
    const mockChat = {
      id: 1,
      userId: 1,
      title: "Chat to delete",
      artifactData: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(getChatById).mockResolvedValue(mockChat);
    vi.mocked(deleteChat).mockResolvedValue(undefined);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.delete({ chatId: 1 });

    expect(getChatById).toHaveBeenCalledWith(1, 1);
    expect(deleteChat).toHaveBeenCalledWith(1, 1);
    expect(result).toEqual({ success: true });
  });

  it("throws error when chat not found", async () => {
    vi.mocked(getChatById).mockResolvedValue(null);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.chat.delete({ chatId: 999 })).rejects.toThrow("Chat not found or access denied");
  });
});

describe("message.create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a message in owned chat", async () => {
    const mockChat = {
      id: 1,
      userId: 1,
      title: "Test Chat",
      artifactData: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockMessage = {
      id: 1,
      chatId: 1,
      role: "user" as const,
      content: "Hello AI",
      hasArtifact: 0,
      createdAt: new Date(),
    };

    vi.mocked(getChatById).mockResolvedValue(mockChat);
    vi.mocked(createMessage).mockResolvedValue(mockMessage);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.message.create({
      chatId: 1,
      role: "user",
      content: "Hello AI",
      hasArtifact: false,
    });

    expect(getChatById).toHaveBeenCalledWith(1, 1);
    expect(createMessage).toHaveBeenCalledWith(1, "user", "Hello AI", false);
    expect(result).toEqual(mockMessage);
  });
});

describe("message.list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns messages for owned chat", async () => {
    const mockChat = {
      id: 1,
      userId: 1,
      title: "Test Chat",
      artifactData: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockMessages = [
      { id: 1, chatId: 1, role: "user" as const, content: "Hello", hasArtifact: 0, createdAt: new Date() },
      { id: 2, chatId: 1, role: "assistant" as const, content: "Hi there!", hasArtifact: 0, createdAt: new Date() },
    ];

    vi.mocked(getChatById).mockResolvedValue(mockChat);
    vi.mocked(getMessagesByChatId).mockResolvedValue(mockMessages);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.message.list({ chatId: 1 });

    expect(getChatById).toHaveBeenCalledWith(1, 1);
    expect(getMessagesByChatId).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockMessages);
  });
});
