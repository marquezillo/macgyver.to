import { eq, and, desc, isNull, sql, gte, or, like, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, chats, messages, folders, memories, formSubmissions, projects, projectFiles, projectDbTables, InsertChat, InsertMessage, InsertFolder, InsertMemory, InsertFormSubmission, Chat, Message, Folder, Memory, FormSubmission, Project, InsertProject, ProjectFile, InsertProjectFile, ProjectDbTable, InsertProjectDbTable } from "../drizzle/schema";
import { ENV } from './_core/env';
import bcrypt from 'bcryptjs';

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

// ============================================
// USER AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Create a new user with email and password (local auth)
 */
export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if email already exists
  const existing = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  if (existing.length > 0) {
    throw new Error("Email already registered");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(data.password, 12);

  // Insert user
  const result = await db.insert(users).values({
    name: data.name,
    email: data.email,
    passwordHash,
    loginMethod: 'local',
    role: data.role || 'user',
    lastSignedIn: new Date(),
  });

  const userId = result[0].insertId;
  
  // Return the created user (without password)
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user;
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(email: string, password: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (!user) {
    return null;
  }

  if (!user.passwordHash) {
    // User registered via OAuth, no password set
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  // Update last signed in
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

  return user;
}

/**
 * Get user by ID
 */
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user || null;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user || null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: number, data: {
  name?: string;
  theme?: 'light' | 'dark' | 'system';
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set(data).where(eq(users.id, userId));
  
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user;
}

/**
 * Change user password
 */
export async function changeUserPassword(userId: number, currentPassword: string, newPassword: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user || !user.passwordHash) {
    throw new Error("User not found or no password set");
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new Error("Current password is incorrect");
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 12);
  await db.update(users).set({ passwordHash: newPasswordHash }).where(eq(users.id, userId));

  return true;
}

/**
 * Delete user account
 */
export async function deleteUserAccount(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete all user's data
  await db.delete(memories).where(eq(memories.userId, userId));
  await db.delete(messages).where(
    sql`chatId IN (SELECT id FROM chats WHERE userId = ${userId})`
  );
  await db.delete(chats).where(eq(chats.userId, userId));
  await db.delete(folders).where(eq(folders.userId, userId));
  await db.delete(users).where(eq(users.id, userId));

  return true;
}

/**
 * Legacy: Upsert user from OAuth (for backwards compatibility)
 */
export async function upsertUser(user: Partial<InsertUser> & { openId: string }): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    // Check if user exists by openId
    const [existing] = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
    
    if (existing) {
      // Update existing user
      await db.update(users).set({
        name: user.name || existing.name,
        lastSignedIn: new Date(),
      }).where(eq(users.id, existing.id));
    } else {
      // Create new user from OAuth
      await db.insert(users).values({
        openId: user.openId,
        name: user.name || 'Usuario',
        email: user.email || `${user.openId}@oauth.local`,
        loginMethod: 'oauth',
        role: user.openId === ENV.ownerOpenId ? 'admin' : 'user',
        lastSignedIn: new Date(),
      });
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0] || null;
}

// ============================================
// CHAT FUNCTIONS
// ============================================

export async function createChat(userId: number, title: string = "Nueva conversación"): Promise<Chat> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(chats).values({
    userId,
    title,
  });

  const chatId = result[0].insertId;
  const [chat] = await db.select().from(chats).where(eq(chats.id, chatId));
  return chat;
}

export async function getChatsByUserId(userId: number): Promise<Chat[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(chats).where(eq(chats.userId, userId)).orderBy(desc(chats.updatedAt));
}

export async function getChatById(chatId: number, userId: number): Promise<Chat | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(chats).where(
    and(eq(chats.id, chatId), eq(chats.userId, userId))
  ).limit(1);
  return result[0] || null;
}

export async function updateChatTitle(chatId: number, userId: number, title: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(chats).set({ title }).where(
    and(eq(chats.id, chatId), eq(chats.userId, userId))
  );
}

export async function updateChatArtifact(chatId: number, userId: number, artifactData: unknown): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(chats).set({ artifactData }).where(
    and(eq(chats.id, chatId), eq(chats.userId, userId))
  );
}

export async function deleteChat(chatId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // First delete all messages in the chat
  await db.delete(messages).where(eq(messages.chatId, chatId));
  // Then delete the chat
  await db.delete(chats).where(
    and(eq(chats.id, chatId), eq(chats.userId, userId))
  );
}

export async function toggleChatFavorite(chatId: number, userId: number, isFavorite: boolean): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(chats).set({ isFavorite: isFavorite ? 1 : 0 }).where(
    and(eq(chats.id, chatId), eq(chats.userId, userId))
  );
}

export async function moveChatToFolder(chatId: number, userId: number, folderId: number | null): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(chats).set({ folderId }).where(
    and(eq(chats.id, chatId), eq(chats.userId, userId))
  );
}

export async function getChatsByFolderId(folderId: number, userId: number): Promise<Chat[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(chats).where(
    and(eq(chats.folderId, folderId), eq(chats.userId, userId))
  ).orderBy(desc(chats.updatedAt));
}

// ============================================
// MESSAGE FUNCTIONS
// ============================================

export async function createMessage(chatId: number, role: "user" | "assistant", content: string, hasArtifact: boolean = false): Promise<Message> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(messages).values({
    chatId,
    role,
    content,
    hasArtifact: hasArtifact ? 1 : 0,
  });

  // Update chat's updatedAt
  await db.update(chats).set({ updatedAt: new Date() }).where(eq(chats.id, chatId));

  const messageId = result[0].insertId;
  const [message] = await db.select().from(messages).where(eq(messages.id, messageId));
  return message;
}

export async function getMessagesByChatId(chatId: number): Promise<Message[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(messages).where(eq(messages.chatId, chatId)).orderBy(messages.createdAt);
}

// ============================================
// FOLDER FUNCTIONS
// ============================================

export async function createFolder(userId: number, name: string, color?: string, icon?: string): Promise<Folder> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(folders).values({
    userId,
    name,
    color: color || 'gray',
    icon: icon || 'folder',
  });

  const folderId = result[0].insertId;
  const [folder] = await db.select().from(folders).where(eq(folders.id, folderId));
  return folder;
}

export async function getFoldersByUserId(userId: number): Promise<Folder[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(folders).where(eq(folders.userId, userId)).orderBy(folders.name);
}

export async function updateFolder(folderId: number, userId: number, data: { name?: string; color?: string; icon?: string }): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(folders).set(data).where(
    and(eq(folders.id, folderId), eq(folders.userId, userId))
  );
}

export async function deleteFolder(folderId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Move all chats in this folder to no folder
  await db.update(chats).set({ folderId: null }).where(eq(chats.folderId, folderId));
  // Delete the folder
  await db.delete(folders).where(
    and(eq(folders.id, folderId), eq(folders.userId, userId))
  );
}

// ============================================
// MEMORY FUNCTIONS
// ============================================

export async function createMemory(userId: number, data: Omit<InsertMemory, 'userId'>): Promise<Memory> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(memories).values({
    ...data,
    userId,
  });

  const memoryId = result[0].insertId;
  const [memory] = await db.select().from(memories).where(eq(memories.id, memoryId));
  return memory;
}

export async function getMemoriesByUserId(userId: number, activeOnly: boolean = true): Promise<Memory[]> {
  const db = await getDb();
  if (!db) return [];

  if (activeOnly) {
    return db.select().from(memories).where(
      and(eq(memories.userId, userId), eq(memories.isActive, 1))
    ).orderBy(desc(memories.importance), desc(memories.createdAt));
  }

  return db.select().from(memories).where(eq(memories.userId, userId)).orderBy(desc(memories.importance), desc(memories.createdAt));
}

export async function getMemoriesForContext(userId: number, limit: number = 10): Promise<Memory[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(memories).where(
    and(eq(memories.userId, userId), eq(memories.isActive, 1))
  ).orderBy(desc(memories.importance), desc(memories.createdAt)).limit(limit);
}

export async function updateMemory(memoryId: number, userId: number, data: Partial<InsertMemory>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(memories).set(data).where(
    and(eq(memories.id, memoryId), eq(memories.userId, userId))
  );
}

export async function deleteMemory(memoryId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(memories).where(
    and(eq(memories.id, memoryId), eq(memories.userId, userId))
  );
}

export async function toggleMemoryActive(memoryId: number, userId: number, isActive: boolean): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(memories).set({ isActive: isActive ? 1 : 0 }).where(
    and(eq(memories.id, memoryId), eq(memories.userId, userId))
  );
}

// ============================================
// FORM SUBMISSION FUNCTIONS
// ============================================

export async function createFormSubmission(data: InsertFormSubmission): Promise<FormSubmission> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(formSubmissions).values(data);
  const submissionId = result[0].insertId;
  const [submission] = await db.select().from(formSubmissions).where(eq(formSubmissions.id, submissionId));
  return submission;
}

export async function getFormSubmissions(filters?: {
  chatId?: number;
  landingIdentifier?: string;
  country?: string;
  status?: 'pending' | 'processed' | 'refunded';
}): Promise<FormSubmission[]> {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(formSubmissions);
  
  const conditions = [];
  if (filters?.chatId) conditions.push(eq(formSubmissions.chatId, filters.chatId));
  if (filters?.landingIdentifier) conditions.push(eq(formSubmissions.landingIdentifier, filters.landingIdentifier));
  if (filters?.country) conditions.push(eq(formSubmissions.country, filters.country));
  if (filters?.status) conditions.push(eq(formSubmissions.status, filters.status));

  if (conditions.length > 0) {
    return db.select().from(formSubmissions).where(and(...conditions)).orderBy(desc(formSubmissions.createdAt));
  }

  return db.select().from(formSubmissions).orderBy(desc(formSubmissions.createdAt));
}

export async function updateFormSubmissionStatus(submissionId: number, status: 'pending' | 'processed' | 'refunded'): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(formSubmissions).set({ status }).where(eq(formSubmissions.id, submissionId));
}

// ============================================
// PROJECT FUNCTIONS
// ============================================

export async function createProject(userId: number, data: Omit<InsertProject, 'userId'>): Promise<Project> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(projects).values({
    ...data,
    userId,
  });

  const projectId = result[0].insertId;
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  return project;
}

export async function getProjectsByUserId(userId: number): Promise<Project[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt));
}

export async function getProjectById(projectId: number, userId: number): Promise<Project | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(projects).where(
    and(eq(projects.id, projectId), eq(projects.userId, userId))
  ).limit(1);
  return result[0] || null;
}

export async function updateProject(projectId: number, userId: number, data: Partial<InsertProject>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(projects).set(data).where(
    and(eq(projects.id, projectId), eq(projects.userId, userId))
  );
}

export async function deleteProject(projectId: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Delete project files first
  await db.delete(projectFiles).where(eq(projectFiles.projectId, projectId));
  // Delete project db tables
  await db.delete(projectDbTables).where(eq(projectDbTables.projectId, projectId));
  // Delete the project
  await db.delete(projects).where(
    and(eq(projects.id, projectId), eq(projects.userId, userId))
  );
}

// ============================================
// PROJECT FILE FUNCTIONS
// ============================================

export async function createProjectFile(projectId: number, data: Omit<InsertProjectFile, 'projectId'>): Promise<ProjectFile> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(projectFiles).values({
    ...data,
    projectId,
  });

  const fileId = result[0].insertId;
  const [file] = await db.select().from(projectFiles).where(eq(projectFiles.id, fileId));
  return file;
}

export async function getProjectFiles(projectId: number): Promise<ProjectFile[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(projectFiles).where(eq(projectFiles.projectId, projectId)).orderBy(projectFiles.path);
}

export async function updateProjectFile(fileId: number, data: Partial<InsertProjectFile>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(projectFiles).set(data).where(eq(projectFiles.id, fileId));
}

export async function deleteProjectFile(fileId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(projectFiles).where(eq(projectFiles.id, fileId));
}

// ============================================
// PROJECT DB TABLE FUNCTIONS
// ============================================

export async function createProjectDbTable(projectId: number, data: Omit<InsertProjectDbTable, 'projectId'>): Promise<ProjectDbTable> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(projectDbTables).values({
    ...data,
    projectId,
  });

  const tableId = result[0].insertId;
  const [table] = await db.select().from(projectDbTables).where(eq(projectDbTables.id, tableId));
  return table;
}

export async function getProjectDbTables(projectId: number): Promise<ProjectDbTable[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(projectDbTables).where(eq(projectDbTables.projectId, projectId)).orderBy(projectDbTables.tableName);
}


// ============================================
// ADMIN FUNCTIONS
// ============================================

/**
 * Get admin dashboard statistics
 */
export async function getAdminStats() {
  const db = await getDb();
  if (!db) return null;

  // Get total users
  const [usersResult] = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
  const totalUsers = usersResult?.count || 0;

  // Get users by role
  const usersByRole = await db
    .select({ role: users.role, count: sql<number>`COUNT(*)` })
    .from(users)
    .groupBy(users.role);

  // Get total chats
  const [chatsResult] = await db.select({ count: sql<number>`COUNT(*)` }).from(chats);
  const totalChats = chatsResult?.count || 0;

  // Get total messages
  const [messagesResult] = await db.select({ count: sql<number>`COUNT(*)` }).from(messages);
  const totalMessages = messagesResult?.count || 0;

  // Get total projects
  const [projectsResult] = await db.select({ count: sql<number>`COUNT(*)` }).from(projects);
  const totalProjects = projectsResult?.count || 0;

  // Get users created today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [newUsersToday] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .where(gte(users.createdAt, today));

  // Get chats created today
  const [newChatsToday] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(chats)
    .where(gte(chats.createdAt, today));

  // Get recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentChats = await db
    .select({
      date: sql<string>`DATE(createdAt)`,
      count: sql<number>`COUNT(*)`
    })
    .from(chats)
    .where(gte(chats.createdAt, sevenDaysAgo))
    .groupBy(sql`DATE(createdAt)`)
    .orderBy(sql`DATE(createdAt)`);

  return {
    totalUsers,
    totalChats,
    totalMessages,
    totalProjects,
    newUsersToday: newUsersToday?.count || 0,
    newChatsToday: newChatsToday?.count || 0,
    usersByRole: usersByRole.reduce((acc, { role, count }) => {
      acc[role] = count;
      return acc;
    }, {} as Record<string, number>),
    recentActivity: recentChats,
  };
}

/**
 * Get all users for admin panel
 */
export async function getAllUsers(page: number = 1, limit: number = 20, search?: string) {
  const db = await getDb();
  if (!db) return { users: [], total: 0 };

  const offset = (page - 1) * limit;

  let query = db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    loginMethod: users.loginMethod,
    emailVerified: users.emailVerified,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
  }).from(users);

  if (search) {
    query = query.where(
      or(
        like(users.name, `%${search}%`),
        like(users.email, `%${search}%`)
      )
    ) as typeof query;
  }

  const usersList = await query.orderBy(desc(users.createdAt)).limit(limit).offset(offset);

  // Get total count
  let countQuery = db.select({ count: sql<number>`COUNT(*)` }).from(users);
  if (search) {
    countQuery = countQuery.where(
      or(
        like(users.name, `%${search}%`),
        like(users.email, `%${search}%`)
      )
    ) as typeof countQuery;
  }
  const [countResult] = await countQuery;

  return {
    users: usersList,
    total: countResult?.count || 0,
  };
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: number, role: 'user' | 'admin') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ role }).where(eq(users.id, userId));
}

/**
 * Delete user (admin only)
 */
export async function adminDeleteUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete user's data first
  await db.delete(messages).where(
    inArray(messages.chatId, db.select({ id: chats.id }).from(chats).where(eq(chats.userId, userId)))
  );
  await db.delete(chats).where(eq(chats.userId, userId));
  await db.delete(folders).where(eq(folders.userId, userId));
  await db.delete(memories).where(eq(memories.userId, userId));
  await db.delete(projects).where(eq(projects.userId, userId));
  
  // Finally delete the user
  await db.delete(users).where(eq(users.id, userId));
}

/**
 * Get all chats for admin panel
 */
export async function getAllChats(page: number = 1, limit: number = 20, userId?: number) {
  const db = await getDb();
  if (!db) return { chats: [], total: 0 };

  const offset = (page - 1) * limit;

  let query = db.select({
    id: chats.id,
    title: chats.title,
    userId: chats.userId,
    isFavorite: chats.isFavorite,
    createdAt: chats.createdAt,
    updatedAt: chats.updatedAt,
  }).from(chats);

  if (userId) {
    query = query.where(eq(chats.userId, userId)) as typeof query;
  }

  const chatsList = await query.orderBy(desc(chats.createdAt)).limit(limit).offset(offset);

  // Get total count
  let countQuery = db.select({ count: sql<number>`COUNT(*)` }).from(chats);
  if (userId) {
    countQuery = countQuery.where(eq(chats.userId, userId)) as typeof countQuery;
  }
  const [countResult] = await countQuery;

  // Get user names for each chat
  const userIds = Array.from(new Set(chatsList.map(c => c.userId)));
  const usersMap: Record<number, string> = {};
  
  if (userIds.length > 0) {
    const usersList = await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, userIds));
    usersList.forEach(u => { usersMap[u.id] = u.name; });
  }

  return {
    chats: chatsList.map(c => ({
      ...c,
      userName: usersMap[c.userId] || 'Unknown',
    })),
    total: countResult?.count || 0,
  };
}

/**
 * Get all projects for admin panel
 */
export async function getAllProjects(page: number = 1, limit: number = 20) {
  const db = await getDb();
  if (!db) return { projects: [], total: 0 };

  const offset = (page - 1) * limit;

  const projectsList = await db.select({
    id: projects.id,
    name: projects.name,
    description: projects.description,
    status: projects.status,
    userId: projects.userId,
    createdAt: projects.createdAt,
    updatedAt: projects.updatedAt,
  }).from(projects).orderBy(desc(projects.createdAt)).limit(limit).offset(offset);

  // Get total count
  const [countResult] = await db.select({ count: sql<number>`COUNT(*)` }).from(projects);

  // Get user names for each project
  const userIds = Array.from(new Set(projectsList.map(p => p.userId)));
  const usersMap: Record<number, string> = {};
  
  if (userIds.length > 0) {
    const usersList = await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, userIds));
    usersList.forEach(u => { usersMap[u.id] = u.name; });
  }

  return {
    projects: projectsList.map(p => ({
      ...p,
      userName: usersMap[p.userId] || 'Unknown',
    })),
    total: countResult?.count || 0,
  };
}
