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
  /** Optional: Manus OAuth identifier (openId) - only used if OAuth is enabled */
  openId: varchar("openId", { length: 64 }).unique(),
  /** User's display name */
  name: varchar("name", { length: 100 }).notNull(),
  /** User's email - required and unique for local auth */
  email: varchar("email", { length: 320 }).notNull().unique(),
  /** Hashed password for local authentication */
  passwordHash: varchar("passwordHash", { length: 255 }),
  /** Login method: local, oauth, google */
  loginMethod: mysqlEnum("loginMethod", ["local", "oauth", "google"]).default("local").notNull(),
  /** User role: user, admin */
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** User's preferred theme */
  theme: mysqlEnum("theme", ["light", "dark", "system"]).default("light").notNull(),
  /** Whether the user's email is verified */
  emailVerified: int("emailVerified").default(0).notNull(),
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
  /** Optional: Foreign key to publishedLandings table - links chat to its published landing */
  publishedLandingId: int("publishedLandingId"),
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


/**
 * Projects table for full-stack user projects.
 * Each project is a complete application with its own code, database, and deployment.
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to users table */
  userId: int("userId").notNull(),
  /** Project name */
  name: varchar("name", { length: 100 }).notNull(),
  /** Project description */
  description: text("description"),
  /** Project type: landing, webapp, api */
  type: mysqlEnum("type", ["landing", "webapp", "api"]).default("webapp").notNull(),
  /** Project status: draft, building, running, stopped, error */
  status: mysqlEnum("status", ["draft", "building", "running", "stopped", "error"]).default("draft").notNull(),
  /** Port number when running (unique per project) */
  port: int("port"),
  /** Process ID when running */
  pid: int("pid"),
  /** Database schema name for this project (isolated per project) */
  dbSchema: varchar("dbSchema", { length: 100 }),
  /** Project configuration as JSON */
  config: json("config"),
  /** Build logs */
  buildLog: text("buildLog"),
  /** Last error message if status is error */
  lastError: text("lastError"),
  /** Public URL when deployed */
  publicUrl: varchar("publicUrl", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Project files table for storing generated code.
 * Each file belongs to a project and contains the file content.
 */
export const projectFiles = mysqlTable("projectFiles", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to projects table */
  projectId: int("projectId").notNull(),
  /** File path relative to project root */
  path: varchar("path", { length: 500 }).notNull(),
  /** File content */
  content: text("content").notNull(),
  /** File type for syntax highlighting */
  fileType: varchar("fileType", { length: 50 }),
  /** Whether this file was generated or manually edited */
  isGenerated: int("isGenerated").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectFile = typeof projectFiles.$inferSelect;
export type InsertProjectFile = typeof projectFiles.$inferInsert;

/**
 * Project database tables - stores the schema for each project's database.
 * This allows each project to have its own isolated database structure.
 */
export const projectDbTables = mysqlTable("projectDbTables", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to projects table */
  projectId: int("projectId").notNull(),
  /** Table name */
  tableName: varchar("tableName", { length: 100 }).notNull(),
  /** Table schema as JSON (columns, types, constraints) */
  schema: json("schema").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectDbTable = typeof projectDbTables.$inferSelect;
export type InsertProjectDbTable = typeof projectDbTables.$inferInsert;


/**
 * Published Landings table for storing landings served from subdominios.
 * Each landing has a unique subdomain + slug combination.
 */
export const publishedLandings = mysqlTable("publishedLandings", {
  id: int("id").autoincrement().primaryKey(),
  /** Foreign key to users table */
  userId: int("userId").notNull(),
  /** Foreign key to chats table (source chat) */
  chatId: int("chatId"),
  /** User's subdomain (generated from userId hash) */
  subdomain: varchar("subdomain", { length: 50 }).notNull(),
  /** Project slug (URL-friendly name) */
  slug: varchar("slug", { length: 100 }).notNull(),
  /** Landing name/title */
  name: varchar("name", { length: 255 }).notNull(),
  /** Landing description */
  description: text("description"),
  /** Full landing configuration as JSON (LandingConfig) */
  config: json("config").notNull(),
  /** Additional pages as JSON array (terms, privacy, about, etc.) */
  pages: json("pages"),
  /** Theme configuration (colors, fonts, etc.) */
  theme: json("theme"),
  /** SEO metadata */
  seoMetadata: json("seoMetadata"),
  /** Favicon URL */
  favicon: varchar("favicon", { length: 500 }),
  /** Custom domain (optional, for future use) */
  customDomain: varchar("customDomain", { length: 255 }),
  /** Whether the landing is publicly accessible */
  isPublic: int("isPublic").default(1).notNull(),
  /** Whether the landing is active (can be disabled without deleting) */
  isActive: int("isActive").default(1).notNull(),
  /** View count for analytics */
  viewCount: int("viewCount").default(0).notNull(),
  /** Last viewed timestamp */
  lastViewedAt: timestamp("lastViewedAt"),
  /** Published timestamp */
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PublishedLanding = typeof publishedLandings.$inferSelect;
export type InsertPublishedLanding = typeof publishedLandings.$inferInsert;
