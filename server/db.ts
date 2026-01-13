import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, chats, messages, InsertChat, InsertMessage, Chat, Message } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// Chat CRUD Operations
// ============================================

export async function createChat(userId: number, title?: string): Promise<Chat | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create chat: database not available");
    return null;
  }

  const chatData: InsertChat = {
    userId,
    title: title || "Nueva conversación",
  };

  const result = await db.insert(chats).values(chatData);
  const insertId = result[0].insertId;

  // Fetch and return the created chat
  const created = await db.select().from(chats).where(eq(chats.id, insertId)).limit(1);
  return created[0] || null;
}

export async function getChatsByUserId(userId: number): Promise<Chat[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get chats: database not available");
    return [];
  }

  return db.select().from(chats).where(eq(chats.userId, userId)).orderBy(desc(chats.updatedAt));
}

export async function getChatById(chatId: number, userId: number): Promise<Chat | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get chat: database not available");
    return null;
  }

  const result = await db.select().from(chats)
    .where(eq(chats.id, chatId))
    .limit(1);

  const chat = result[0];
  // Verify ownership
  if (chat && chat.userId !== userId) {
    return null;
  }
  return chat || null;
}

export async function updateChatTitle(chatId: number, title: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update chat: database not available");
    return;
  }

  await db.update(chats).set({ title }).where(eq(chats.id, chatId));
}

export async function updateChatArtifact(chatId: number, artifactData: unknown): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update chat artifact: database not available");
    return;
  }

  await db.update(chats).set({ artifactData }).where(eq(chats.id, chatId));
}

export async function deleteChat(chatId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete chat: database not available");
    return;
  }

  // Delete messages first (cascade)
  await db.delete(messages).where(eq(messages.chatId, chatId));
  // Then delete the chat
  await db.delete(chats).where(eq(chats.id, chatId));
}

// ============================================
// Message CRUD Operations
// ============================================

export async function createMessage(chatId: number, role: 'user' | 'assistant', content: string, hasArtifact: boolean = false): Promise<Message | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create message: database not available");
    return null;
  }

  const messageData: InsertMessage = {
    chatId,
    role,
    content,
    hasArtifact: hasArtifact ? 1 : 0,
  };

  const result = await db.insert(messages).values(messageData);
  const insertId = result[0].insertId;

  // Fetch and return the created message
  const created = await db.select().from(messages).where(eq(messages.id, insertId)).limit(1);
  return created[0] || null;
}

export async function getMessagesByChatId(chatId: number): Promise<Message[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get messages: database not available");
    return [];
  }

  return db.select().from(messages).where(eq(messages.chatId, chatId)).orderBy(messages.createdAt);
}
