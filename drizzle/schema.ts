import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** User's preferred theme */
  theme: mysqlEnum("theme", ["light", "dark", "system"]).default("light").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Folders table for organizing chats.
 */
export const folders = mysqlTable("folders", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to users table */
  userId: int("userId").notNull(),
  /** Folder name */
  name: varchar("name", { length: 100 }).notNull(),
  /** Folder color (for UI) */
  color: varchar("color", { length: 20 }).default("gray"),
  /** Folder icon */
  icon: varchar("icon", { length: 50 }).default("folder"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Folder = typeof folders.$inferSelect;
export type InsertFolder = typeof folders.$inferInsert;

/**
 * Chat conversations table.
 * Each chat belongs to a user and can contain multiple messages.
 */
export const chats = mysqlTable("chats", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to users table */
  userId: int("userId").notNull(),
  /** Optional: Foreign key to folders table */
  folderId: int("folderId"),
  /** Title of the chat (auto-generated from first message or user-defined) */
  title: varchar("title", { length: 255 }).notNull().default("Nueva conversación"),
  /** Whether this chat is marked as favorite */
  isFavorite: int("isFavorite").default(0).notNull(),
  /** Optional: Store the generated landing page data as JSON */
  artifactData: json("artifactData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Chat = typeof chats.$inferSelect;
export type InsertChat = typeof chats.$inferInsert;

/**
 * Messages table.
 * Each message belongs to a chat and has a role (user or assistant).
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to chats table */
  chatId: int("chatId").notNull(),
  /** Role of the message sender */
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  /** Message content */
  content: text("content").notNull(),
  /** Whether this message has an associated artifact (generated design) */
  hasArtifact: int("hasArtifact").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;


/**
 * Memories table for long-term user memory.
 * Stores facts, preferences, and context that the AI should remember across conversations.
 */
export const memories = mysqlTable("memories", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to users table */
  userId: int("userId").notNull(),
  /** Category of memory: preference, fact, context, instruction */
  category: mysqlEnum("category", ["preference", "fact", "context", "instruction"]).notNull(),
  /** The memory content */
  content: text("content").notNull(),
  /** Source: manual (user added) or auto (extracted from conversation) */
  source: mysqlEnum("source", ["manual", "auto"]).default("auto").notNull(),
  /** Optional: Reference to the chat where this memory was extracted from */
  sourceChatId: int("sourceChatId"),
  /** Importance score (1-10) for prioritizing memories in context */
  importance: int("importance").default(5).notNull(),
  /** Whether this memory is active (can be disabled without deleting) */
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Memory = typeof memories.$inferSelect;
export type InsertMemory = typeof memories.$inferInsert;

/**
 * Form submissions table for storing landing page form data.
 * Uses JSON column to store heterogeneous form data from different landing pages.
 */
export const formSubmissions = mysqlTable("formSubmissions", {
  id: int("id").autoincrement().primaryKey(),
  /** Optional: Foreign key to chats table (the landing page that generated this form) */
  chatId: int("chatId"),
  /** Form section ID within the landing */
  formSectionId: varchar("formSectionId", { length: 100 }),
  /** Country/region for multi-country tracking */
  country: varchar("country", { length: 50 }),
  /** Domain/landing identifier for multi-web tracking */
  landingIdentifier: varchar("landingIdentifier", { length: 255 }),
  /** The actual form data as JSON (heterogeneous schema support) */
  formData: json("formData").notNull(),
  /** Status: pending, processed, refunded */
  status: mysqlEnum("status", ["pending", "processed", "refunded"]).default("pending").notNull(),
  /** IP address of the submitter */
  ipAddress: varchar("ipAddress", { length: 45 }),
  /** User agent of the submitter */
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FormSubmission = typeof formSubmissions.$inferSelect;
export type InsertFormSubmission = typeof formSubmissions.$inferInsert;
