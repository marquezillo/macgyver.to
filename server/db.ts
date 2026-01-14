import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, chats, messages, folders, memories, formSubmissions, InsertChat, InsertMessage, InsertFolder, InsertMemory, InsertFormSubmission, Chat, Message, Folder, Memory, FormSubmission } from "../drizzle/schema";
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


// ============================================
// Folder CRUD Operations
// ============================================

export async function createFolder(userId: number, name: string, color?: string, icon?: string): Promise<Folder | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create folder: database not available");
    return null;
  }

  const folderData: InsertFolder = {
    userId,
    name,
    color: color || 'gray',
    icon: icon || 'folder',
  };

  const result = await db.insert(folders).values(folderData);
  const insertId = result[0].insertId;

  const created = await db.select().from(folders).where(eq(folders.id, insertId)).limit(1);
  return created[0] || null;
}

export async function getFoldersByUserId(userId: number): Promise<Folder[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get folders: database not available");
    return [];
  }

  return db.select().from(folders).where(eq(folders.userId, userId)).orderBy(folders.name);
}

export async function updateFolder(folderId: number, name: string, color?: string, icon?: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update folder: database not available");
    return;
  }

  const updateData: Partial<InsertFolder> = { name };
  if (color) updateData.color = color;
  if (icon) updateData.icon = icon;

  await db.update(folders).set(updateData).where(eq(folders.id, folderId));
}

export async function deleteFolder(folderId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete folder: database not available");
    return;
  }

  // Remove folder reference from chats
  await db.update(chats).set({ folderId: null }).where(eq(chats.folderId, folderId));
  // Delete the folder
  await db.delete(folders).where(eq(folders.id, folderId));
}

// ============================================
// Chat Favorite & Folder Operations
// ============================================

export async function toggleChatFavorite(chatId: number, isFavorite: boolean): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot toggle favorite: database not available");
    return;
  }

  await db.update(chats).set({ isFavorite: isFavorite ? 1 : 0 }).where(eq(chats.id, chatId));
}

export async function moveChatToFolder(chatId: number, folderId: number | null): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot move chat: database not available");
    return;
  }

  await db.update(chats).set({ folderId }).where(eq(chats.id, chatId));
}

export async function getChatsByFolderId(folderId: number): Promise<Chat[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get chats by folder: database not available");
    return [];
  }

  return db.select().from(chats).where(eq(chats.folderId, folderId)).orderBy(desc(chats.updatedAt));
}

export async function getFavoriteChats(userId: number): Promise<Chat[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get favorite chats: database not available");
    return [];
  }

  return db.select().from(chats).where(eq(chats.userId, userId)).orderBy(desc(chats.updatedAt));
}


// ============================================
// Memory CRUD Operations (Long-term Memory)
// ============================================

export async function createMemory(
  userId: number,
  category: 'preference' | 'fact' | 'context' | 'instruction',
  content: string,
  source: 'manual' | 'auto' = 'auto',
  sourceChatId?: number,
  importance: number = 5
): Promise<Memory | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create memory: database not available");
    return null;
  }

  const memoryData: InsertMemory = {
    userId,
    category,
    content,
    source,
    sourceChatId: sourceChatId || null,
    importance,
    isActive: 1,
  };

  const result = await db.insert(memories).values(memoryData);
  const insertId = result[0].insertId;

  const created = await db.select().from(memories).where(eq(memories.id, insertId)).limit(1);
  return created[0] || null;
}

export async function getMemoriesByUserId(userId: number, activeOnly: boolean = true): Promise<Memory[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get memories: database not available");
    return [];
  }

  let query = db.select().from(memories).where(eq(memories.userId, userId));
  
  const results = await query.orderBy(desc(memories.importance), desc(memories.createdAt));
  
  if (activeOnly) {
    return results.filter(m => m.isActive === 1);
  }
  return results;
}

export async function getMemoriesByCategory(
  userId: number,
  category: 'preference' | 'fact' | 'context' | 'instruction'
): Promise<Memory[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get memories: database not available");
    return [];
  }

  const results = await db.select().from(memories)
    .where(eq(memories.userId, userId))
    .orderBy(desc(memories.importance));
  
  return results.filter(m => m.category === category && m.isActive === 1);
}

export async function updateMemory(
  memoryId: number,
  updates: { content?: string; importance?: number; isActive?: number; category?: 'preference' | 'fact' | 'context' | 'instruction' }
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update memory: database not available");
    return;
  }

  await db.update(memories).set(updates).where(eq(memories.id, memoryId));
}

export async function deleteMemory(memoryId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete memory: database not available");
    return;
  }

  await db.delete(memories).where(eq(memories.id, memoryId));
}

export async function toggleMemoryActive(memoryId: number, isActive: boolean): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot toggle memory: database not available");
    return;
  }

  await db.update(memories).set({ isActive: isActive ? 1 : 0 }).where(eq(memories.id, memoryId));
}

/**
 * Get formatted memories for LLM context injection.
 * Returns memories formatted as a string to be included in the system prompt.
 */
export async function getMemoriesForContext(userId: number): Promise<string> {
  const memories = await getMemoriesByUserId(userId, true);
  
  if (memories.length === 0) {
    return '';
  }

  const grouped = {
    preference: memories.filter(m => m.category === 'preference'),
    fact: memories.filter(m => m.category === 'fact'),
    context: memories.filter(m => m.category === 'context'),
    instruction: memories.filter(m => m.category === 'instruction'),
  };

  let contextString = '\n\n## Información del usuario (memoria a largo plazo):\n';
  
  if (grouped.preference.length > 0) {
    contextString += '\n### Preferencias:\n';
    grouped.preference.forEach(m => {
      contextString += `- ${m.content}\n`;
    });
  }
  
  if (grouped.fact.length > 0) {
    contextString += '\n### Datos personales:\n';
    grouped.fact.forEach(m => {
      contextString += `- ${m.content}\n`;
    });
  }
  
  if (grouped.context.length > 0) {
    contextString += '\n### Contexto:\n';
    grouped.context.forEach(m => {
      contextString += `- ${m.content}\n`;
    });
  }
  
  if (grouped.instruction.length > 0) {
    contextString += '\n### Instrucciones especiales:\n';
    grouped.instruction.forEach(m => {
      contextString += `- ${m.content}\n`;
    });
  }

  return contextString;
}


// ============================================================================
// Form Submissions
// ============================================================================

/**
 * Create a new form submission
 */
export async function createFormSubmission(submission: InsertFormSubmission): Promise<number | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create form submission: database not available");
    return null;
  }

  const result = await db.insert(formSubmissions).values(submission);
  return result[0].insertId;
}

/**
 * Get all form submissions, optionally filtered by chatId or landingIdentifier
 */
export async function getFormSubmissions(filters?: {
  chatId?: number;
  landingIdentifier?: string;
  country?: string;
  status?: 'pending' | 'processed' | 'refunded';
}): Promise<FormSubmission[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get form submissions: database not available");
    return [];
  }

  let query = db.select().from(formSubmissions).orderBy(desc(formSubmissions.createdAt));
  
  // Note: For complex filtering, you'd use .where() with conditions
  // This is a simplified version - in production you'd build dynamic conditions
  const results = await query;
  
  // Apply filters in memory for now (in production, use SQL WHERE clauses)
  let filtered = results;
  if (filters?.chatId) {
    filtered = filtered.filter(s => s.chatId === filters.chatId);
  }
  if (filters?.landingIdentifier) {
    filtered = filtered.filter(s => s.landingIdentifier === filters.landingIdentifier);
  }
  if (filters?.country) {
    filtered = filtered.filter(s => s.country === filters.country);
  }
  if (filters?.status) {
    filtered = filtered.filter(s => s.status === filters.status);
  }
  
  return filtered;
}

/**
 * Update form submission status
 */
export async function updateFormSubmissionStatus(
  submissionId: number, 
  status: 'pending' | 'processed' | 'refunded'
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update form submission: database not available");
    return;
  }

  await db.update(formSubmissions).set({ status }).where(eq(formSubmissions.id, submissionId));
}

/**
 * Get form submission statistics
 */
export async function getFormSubmissionStats(filters?: {
  landingIdentifier?: string;
  country?: string;
}): Promise<{
  total: number;
  pending: number;
  processed: number;
  refunded: number;
  byCountry: Record<string, number>;
}> {
  const submissions = await getFormSubmissions(filters);
  
  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    processed: submissions.filter(s => s.status === 'processed').length,
    refunded: submissions.filter(s => s.status === 'refunded').length,
    byCountry: {} as Record<string, number>,
  };
  
  submissions.forEach(s => {
    const country = s.country || 'unknown';
    stats.byCountry[country] = (stats.byCountry[country] || 0) + 1;
  });
  
  return stats;
}
