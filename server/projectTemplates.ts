/**
 * Project Templates System
 * Pre-configured templates for different types of web applications
 * Similar to Manus: SaaS, E-commerce, Dashboard, Blog, Portfolio, Corporate, Link-in-bio, Mini Games, Productivity
 */

export type ProjectTemplateType = 
  | 'saas'
  | 'ecommerce'
  | 'dashboard'
  | 'blog'
  | 'portfolio'
  | 'corporate'
  | 'linkinbio'
  | 'minigames'
  | 'productivity';

export interface ProjectTemplate {
  id: ProjectTemplateType;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  dbTables: string[];
  pages: string[];
  integrations: string[];
  examplePrompt: string;
}

/**
 * All available project templates
 */
export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'saas',
    name: 'SaaS',
    description: 'Software as a Service with user authentication, subscriptions, and admin dashboard',
    icon: 'Layers',
    color: '#6366f1',
    features: [
      'User authentication (login/register)',
      'Subscription plans with Stripe',
      'Admin dashboard',
      'User settings & profile',
      'API rate limiting',
      'Usage analytics'
    ],
    dbTables: ['users', 'subscriptions', 'plans', 'usage_logs', 'api_keys'],
    pages: ['Landing', 'Login', 'Register', 'Dashboard', 'Settings', 'Pricing', 'Admin'],
    integrations: ['Stripe', 'Email (Resend)', 'Analytics'],
    examplePrompt: 'Build me a SaaS dashboard with user authentication and Stripe payments'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Online store with product catalog, shopping cart, and payment processing',
    icon: 'ShoppingCart',
    color: '#10b981',
    features: [
      'Product catalog with categories',
      'Shopping cart',
      'Checkout with Stripe',
      'Order management',
      'Inventory tracking',
      'Customer accounts'
    ],
    dbTables: ['products', 'categories', 'orders', 'order_items', 'customers', 'reviews'],
    pages: ['Home', 'Products', 'Product Detail', 'Cart', 'Checkout', 'Orders', 'Admin'],
    integrations: ['Stripe', 'Email notifications', 'Image storage'],
    examplePrompt: 'Build me an e-commerce store with product catalog and Stripe checkout'
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Analytics dashboard with charts, metrics, and data visualization',
    icon: 'BarChart3',
    color: '#3b82f6',
    features: [
      'Interactive charts (line, bar, pie)',
      'Real-time metrics',
      'Data tables with filters',
      'Export to CSV/PDF',
      'Date range picker',
      'Custom widgets'
    ],
    dbTables: ['metrics', 'reports', 'widgets', 'data_sources'],
    pages: ['Dashboard', 'Reports', 'Settings', 'Data Sources'],
    integrations: ['Chart.js', 'Data APIs', 'Export tools'],
    examplePrompt: 'Build me an analytics dashboard with charts and real-time metrics'
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'Content management system with posts, categories, and SEO optimization',
    icon: 'FileText',
    color: '#f59e0b',
    features: [
      'Rich text editor',
      'Categories and tags',
      'Comments system',
      'SEO optimization',
      'RSS feed',
      'Author profiles'
    ],
    dbTables: ['posts', 'categories', 'tags', 'comments', 'authors'],
    pages: ['Home', 'Post', 'Category', 'Author', 'Admin', 'Editor'],
    integrations: ['Markdown editor', 'Image upload', 'SEO meta tags'],
    examplePrompt: 'Build me a blog with rich text editor and comment system'
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Personal portfolio showcasing projects, skills, and contact information',
    icon: 'Briefcase',
    color: '#8b5cf6',
    features: [
      'Project gallery',
      'Skills showcase',
      'About section',
      'Contact form',
      'Resume/CV download',
      'Testimonials'
    ],
    dbTables: ['projects', 'skills', 'testimonials', 'contacts'],
    pages: ['Home', 'Projects', 'About', 'Contact'],
    integrations: ['Image gallery', 'Contact form', 'PDF resume'],
    examplePrompt: 'Build me a portfolio website to showcase my projects and skills'
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Professional business website with team, services, and company information',
    icon: 'Building2',
    color: '#0ea5e9',
    features: [
      'Team members section',
      'Services/Products',
      'Company history',
      'Client testimonials',
      'Contact form',
      'Careers page'
    ],
    dbTables: ['team_members', 'services', 'testimonials', 'job_postings', 'contacts'],
    pages: ['Home', 'About', 'Services', 'Team', 'Careers', 'Contact'],
    integrations: ['Contact form', 'Google Maps', 'Job applications'],
    examplePrompt: 'Build me a corporate website for my company with team and services'
  },
  {
    id: 'linkinbio',
    name: 'Link-in-bio',
    description: 'Simple link aggregator page like Linktree for social media profiles',
    icon: 'Link',
    color: '#ec4899',
    features: [
      'Customizable links',
      'Social media icons',
      'Profile picture',
      'Click analytics',
      'Custom themes',
      'QR code generation'
    ],
    dbTables: ['links', 'profiles', 'analytics'],
    pages: ['Profile', 'Admin', 'Analytics'],
    integrations: ['Social icons', 'Analytics', 'QR codes'],
    examplePrompt: 'Build me a link-in-bio page like Linktree for my social media'
  },
  {
    id: 'minigames',
    name: 'Mini Games',
    description: 'Simple web-based games with leaderboards and achievements',
    icon: 'Gamepad2',
    color: '#ef4444',
    features: [
      'Canvas-based games',
      'Score tracking',
      'Leaderboards',
      'Achievements',
      'Sound effects',
      'Mobile controls'
    ],
    dbTables: ['scores', 'achievements', 'players'],
    pages: ['Game', 'Leaderboard', 'Achievements'],
    integrations: ['Canvas API', 'Local storage', 'Sound effects'],
    examplePrompt: 'Build me a simple web game with leaderboards'
  },
  {
    id: 'productivity',
    name: 'Productivity',
    description: 'Task management and productivity tools with calendar and notes',
    icon: 'CheckSquare',
    color: '#14b8a6',
    features: [
      'Task lists with due dates',
      'Calendar view',
      'Notes/Documents',
      'Reminders',
      'Tags and categories',
      'Progress tracking'
    ],
    dbTables: ['tasks', 'notes', 'categories', 'reminders'],
    pages: ['Dashboard', 'Tasks', 'Calendar', 'Notes', 'Settings'],
    integrations: ['Calendar', 'Notifications', 'Export'],
    examplePrompt: 'Build me a productivity app with tasks and calendar'
  }
];

/**
 * Get a template by ID
 */
export function getTemplateById(id: ProjectTemplateType): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find(t => t.id === id);
}

/**
 * Get all templates
 */
export function getAllTemplates(): ProjectTemplate[] {
  return PROJECT_TEMPLATES;
}

/**
 * Generate the system prompt for a specific template
 */
export function getTemplateSystemPrompt(template: ProjectTemplate): string {
  return `You are building a ${template.name} application.

## Application Type
${template.description}

## Required Features
${template.features.map(f => `- ${f}`).join('\n')}

## Database Tables
${template.dbTables.map(t => `- ${t}`).join('\n')}

## Pages to Create
${template.pages.map(p => `- ${p}`).join('\n')}

## Integrations
${template.integrations.map(i => `- ${i}`).join('\n')}

Generate a complete, production-ready application with:
1. Modern React frontend with Tailwind CSS
2. Express backend with tRPC
3. MySQL database with Drizzle ORM
4. User authentication if needed
5. Responsive design
6. Clean, maintainable code`;
}

/**
 * Generate database schema for a template
 */
export function generateTemplateSchema(template: ProjectTemplate): string {
  const schemaMap: Record<string, string> = {
    users: `export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  role: varchar("role", { length: 50 }).default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});`,
    subscriptions: `export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  planId: int("plan_id").notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  status: varchar("status", { length: 50 }).default("active"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});`,
    plans: `export const plans = mysqlTable("plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  price: int("price").notNull(),
  interval: varchar("interval", { length: 50 }).default("month"),
  features: json("features"),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
});`,
    products: `export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: int("price").notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  categoryId: int("category_id"),
  stock: int("stock").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});`,
    categories: `export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  parentId: int("parent_id"),
});`,
    orders: `export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id"),
  status: varchar("status", { length: 50 }).default("pending"),
  total: int("total").notNull(),
  shippingAddress: json("shipping_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});`,
    posts: `export const posts = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content"),
  excerpt: text("excerpt"),
  authorId: int("author_id"),
  categoryId: int("category_id"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});`,
    comments: `export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("post_id").notNull(),
  authorName: varchar("author_name", { length: 255 }),
  authorEmail: varchar("author_email", { length: 255 }),
  content: text("content").notNull(),
  approved: boolean("approved").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});`,
    projects: `export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 500 }),
  projectUrl: varchar("project_url", { length: 500 }),
  technologies: json("technologies"),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});`,
    tasks: `export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  priority: varchar("priority", { length: 50 }).default("medium"),
  status: varchar("status", { length: 50 }).default("pending"),
  categoryId: int("category_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});`,
    links: `export const links = mysqlTable("links", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profile_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  icon: varchar("icon", { length: 100 }),
  order: int("order").default(0),
  clicks: int("clicks").default(0),
  active: boolean("active").default(true),
});`,
    scores: `export const scores = mysqlTable("scores", {
  id: int("id").autoincrement().primaryKey(),
  playerName: varchar("player_name", { length: 255 }).notNull(),
  score: int("score").notNull(),
  gameId: varchar("game_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});`,
    metrics: `export const metrics = mysqlTable("metrics", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  value: int("value").notNull(),
  category: varchar("category", { length: 100 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});`,
  };

  const imports = `import { mysqlTable, int, varchar, text, boolean, timestamp, json } from 'drizzle-orm/mysql-core';`;
  
  const tables = template.dbTables
    .filter(t => schemaMap[t])
    .map(t => schemaMap[t])
    .join('\n\n');

  return `${imports}\n\n${tables}\n`;
}
