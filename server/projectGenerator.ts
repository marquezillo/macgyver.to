/**
 * Project Code Generator
 * Generates full-stack React + Express projects with database support
 */

import { invokeLLM } from "./_core/llm";

export interface ProjectConfig {
  name: string;
  description: string;
  type: 'landing' | 'webapp' | 'api';
  features: string[];
  dbTables?: DbTableConfig[];
}

export interface DbTableConfig {
  name: string;
  columns: {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'json';
    required?: boolean;
    unique?: boolean;
    default?: string;
  }[];
}

export interface GeneratedFile {
  path: string;
  content: string;
  fileType: string;
}

/**
 * Generate a complete full-stack project based on configuration
 */
export async function generateProject(config: ProjectConfig): Promise<GeneratedFile[]> {
  const files: GeneratedFile[] = [];

  // Generate package.json
  files.push(generatePackageJson(config));

  // Generate server files
  files.push(...generateServerFiles(config));

  // Generate client files
  files.push(...generateClientFiles(config));

  // Generate database schema if tables are defined
  if (config.dbTables && config.dbTables.length > 0) {
    files.push(generateDbSchema(config.dbTables));
  }

  // Generate configuration files
  files.push(...generateConfigFiles(config));

  return files;
}

function generatePackageJson(config: ProjectConfig): GeneratedFile {
  const pkg = {
    name: config.name.toLowerCase().replace(/\s+/g, '-'),
    version: "1.0.0",
    type: "module",
    scripts: {
      dev: "concurrently \"npm run server\" \"npm run client\"",
      server: "tsx watch server/index.ts",
      client: "vite",
      build: "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
      start: "node dist/index.js"
    },
    dependencies: {
      "express": "^4.21.0",
      "cors": "^2.8.5",
      "dotenv": "^16.4.5",
      "drizzle-orm": "^0.33.0",
      "mysql2": "^3.11.0",
      "react": "^18.3.1",
      "react-dom": "^18.3.1",
      "react-router-dom": "^6.26.0",
      "zod": "^3.23.8"
    },
    devDependencies: {
      "@types/express": "^4.17.21",
      "@types/cors": "^2.8.17",
      "@types/react": "^18.3.3",
      "@types/react-dom": "^18.3.0",
      "@vitejs/plugin-react": "^4.3.1",
      "autoprefixer": "^10.4.20",
      "concurrently": "^8.2.2",
      "esbuild": "^0.23.0",
      "postcss": "^8.4.41",
      "tailwindcss": "^3.4.10",
      "tsx": "^4.17.0",
      "typescript": "^5.5.4",
      "vite": "^5.4.0"
    }
  };

  return {
    path: "package.json",
    content: JSON.stringify(pkg, null, 2),
    fileType: "json"
  };
}

function generateServerFiles(config: ProjectConfig): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  // Main server file
  files.push({
    path: "server/index.ts",
    content: `import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { apiRouter } from './routes/api';

config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', apiRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', project: '${config.name}' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`,
    fileType: "ts"
  });

  // API router
  files.push({
    path: "server/routes/api.ts",
    content: `import { Router } from 'express';
import { db } from '../db';

export const apiRouter = Router();

// Example CRUD endpoints
apiRouter.get('/items', async (req, res) => {
  try {
    // Add your database queries here
    res.json({ items: [] });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

apiRouter.post('/items', async (req, res) => {
  try {
    const data = req.body;
    // Add your database insert here
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
`,
    fileType: "ts"
  });

  // Database connection
  files.push({
    path: "server/db.ts",
    content: `import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  uri: process.env.DATABASE_URL
});

export const db = drizzle(connection);
`,
    fileType: "ts"
  });

  return files;
}

function generateClientFiles(config: ProjectConfig): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  // Main App component
  files.push({
    path: "client/src/App.tsx",
    content: `import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
`,
    fileType: "tsx"
  });

  // Main entry point
  files.push({
    path: "client/src/main.tsx",
    content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
    fileType: "tsx"
  });

  // Home page
  files.push({
    path: "client/src/pages/Home.tsx",
    content: `export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">${config.name}</h1>
        <p className="text-xl text-slate-300">${config.description || 'Welcome to your new project!'}</p>
      </div>
    </div>
  );
}
`,
    fileType: "tsx"
  });

  // CSS
  files.push({
    path: "client/src/index.css",
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;
`,
    fileType: "css"
  });

  // Index HTML
  files.push({
    path: "client/index.html",
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${config.name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    fileType: "html"
  });

  return files;
}

function generateDbSchema(tables: DbTableConfig[]): GeneratedFile {
  const imports = `import { mysqlTable, int, varchar, text, boolean, timestamp, json } from 'drizzle-orm/mysql-core';`;
  
  const tableDefinitions = tables.map(table => {
    const columns = table.columns.map(col => {
      let colDef = '';
      switch (col.type) {
        case 'string':
          colDef = `varchar("${col.name}", { length: 255 })`;
          break;
        case 'number':
          colDef = `int("${col.name}")`;
          break;
        case 'boolean':
          colDef = `boolean("${col.name}")`;
          break;
        case 'date':
          colDef = `timestamp("${col.name}")`;
          break;
        case 'json':
          colDef = `json("${col.name}")`;
          break;
        default:
          colDef = `text("${col.name}")`;
      }
      if (col.required) colDef += '.notNull()';
      if (col.unique) colDef += '.unique()';
      if (col.default) colDef += `.default(${col.default})`;
      return `  ${col.name}: ${colDef},`;
    }).join('\n');

    return `export const ${table.name} = mysqlTable("${table.name}", {
  id: int("id").autoincrement().primaryKey(),
${columns}
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});`;
  }).join('\n\n');

  return {
    path: "server/schema.ts",
    content: `${imports}\n\n${tableDefinitions}\n`,
    fileType: "ts"
  };
}

function generateConfigFiles(config: ProjectConfig): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  // Vite config
  files.push({
    path: "vite.config.ts",
    content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'client',
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },
  build: {
    outDir: '../dist/client'
  }
});
`,
    fileType: "ts"
  });

  // Tailwind config
  files.push({
    path: "tailwind.config.js",
    content: `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./client/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
`,
    fileType: "js"
  });

  // PostCSS config
  files.push({
    path: "postcss.config.js",
    content: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`,
    fileType: "js"
  });

  // TypeScript config
  files.push({
    path: "tsconfig.json",
    content: JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "bundler",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        jsx: "react-jsx"
      },
      include: ["client/src/**/*", "server/**/*"]
    }, null, 2),
    fileType: "json"
  });

  // Environment example
  files.push({
    path: "env.example",
    content: `DATABASE_URL=mysql://user:password@localhost:3306/database
PORT=3001
`,
    fileType: "env"
  });

  // Gitignore
  files.push({
    path: ".gitignore",
    content: `node_modules/
dist/
.env
*.log
`,
    fileType: "gitignore"
  });

  return files;
}

/**
 * Use LLM to generate custom project code based on user description
 */
export async function generateProjectWithAI(
  userDescription: string,
  projectName: string
): Promise<GeneratedFile[]> {
  const systemPrompt = `You are a senior full-stack developer. Generate a complete React + Express project based on the user's description.

Return a JSON array of files with this structure:
[
  { "path": "relative/path/to/file.ts", "content": "file content", "fileType": "ts" }
]

Include:
1. package.json with all dependencies
2. Server files (Express with API routes)
3. Client files (React with Tailwind CSS)
4. Database schema if needed (Drizzle ORM for MySQL)
5. Configuration files (vite.config.ts, tailwind.config.js, tsconfig.json)

Make the code production-ready with proper error handling and TypeScript types.`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Project name: ${projectName}\n\nDescription: ${userDescription}` }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "project_files",
        strict: true,
        schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              path: { type: "string" },
              content: { type: "string" },
              fileType: { type: "string" }
            },
            required: ["path", "content", "fileType"],
            additionalProperties: false
          }
        }
      }
    }
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Failed to generate project code");
  }

  if (typeof content !== 'string') {
    throw new Error("Invalid response format from LLM");
  }
  return JSON.parse(content) as GeneratedFile[];
}
