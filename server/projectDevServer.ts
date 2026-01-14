/**
 * Project Development Server Manager
 * Handles live development servers for real-time preview of user projects
 */

import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import { getDb } from './db';
import { projects, projectFiles } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

// Base directory for user projects
const PROJECTS_BASE_DIR = '/home/ubuntu/user-projects';

// Port range for dev servers (separate from production ports)
const DEV_BASE_PORT = 5000;
const MAX_DEV_SERVERS = 50;

// Track running dev server processes
interface DevServerInfo {
  process: ChildProcess;
  port: number;
  startedAt: Date;
  logs: string[];
}

const runningDevServers: Map<number, DevServerInfo> = new Map();

// Port allocation tracking
const allocatedDevPorts: Set<number> = new Set();

/**
 * Get the directory path for a project
 */
function getProjectPath(projectId: number): string {
  return path.join(PROJECTS_BASE_DIR, `project-${projectId}`);
}

/**
 * Allocate an available dev port
 */
function allocateDevPort(): number {
  for (let i = 0; i < MAX_DEV_SERVERS; i++) {
    const port = DEV_BASE_PORT + i;
    if (!allocatedDevPorts.has(port)) {
      allocatedDevPorts.add(port);
      return port;
    }
  }
  throw new Error('No available dev ports');
}

/**
 * Release a dev port
 */
function releaseDevPort(port: number): void {
  allocatedDevPorts.delete(port);
}

/**
 * Write project files to disk for dev server
 */
async function syncProjectFiles(projectId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const projectPath = getProjectPath(projectId);
  
  // Create project directory
  await fs.mkdir(projectPath, { recursive: true });

  // Get all project files from database
  const files = await db.select().from(projectFiles).where(eq(projectFiles.projectId, projectId));

  // Write each file
  for (const file of files) {
    const filePath = path.join(projectPath, file.path);
    const fileDir = path.dirname(filePath);
    
    // Create directory if needed
    await fs.mkdir(fileDir, { recursive: true });
    
    // Write file content
    await fs.writeFile(filePath, file.content, 'utf-8');
  }

  console.log(`[DevServer] Synced ${files.length} files for project ${projectId}`);
}

/**
 * Create a simple Vite dev server configuration
 */
async function createDevServerConfig(projectId: number, port: number): Promise<void> {
  const projectPath = getProjectPath(projectId);
  
  // Create a simple vite.config.js if it doesn't exist
  const viteConfigPath = path.join(projectPath, 'vite.config.js');
  
  try {
    await fs.access(viteConfigPath);
  } catch {
    // Create default vite config
    const viteConfig = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: ${port},
    host: '0.0.0.0',
    strictPort: true,
  },
});
`;
    await fs.writeFile(viteConfigPath, viteConfig, 'utf-8');
  }
}

/**
 * Start a development server for a project
 */
export async function startDevServer(projectId: number): Promise<{
  success: boolean;
  port?: number;
  url?: string;
  error?: string;
}> {
  try {
    // Stop existing dev server if running
    await stopDevServer(projectId);

    // Sync files to disk
    await syncProjectFiles(projectId);

    const projectPath = getProjectPath(projectId);
    const port = allocateDevPort();

    // Create dev server config
    await createDevServerConfig(projectId, port);

    // Check if package.json exists
    const packageJsonPath = path.join(projectPath, 'package.json');
    try {
      await fs.access(packageJsonPath);
    } catch {
      // Create a minimal package.json
      const packageJson = {
        name: `project-${projectId}`,
        version: '1.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview'
        },
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0'
        },
        devDependencies: {
          '@vitejs/plugin-react': '^4.2.0',
          vite: '^5.0.0'
        }
      };
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
    }

    // Install dependencies if node_modules doesn't exist
    const nodeModulesPath = path.join(projectPath, 'node_modules');
    try {
      await fs.access(nodeModulesPath);
    } catch {
      console.log(`[DevServer] Installing dependencies for project ${projectId}...`);
      await new Promise<void>((resolve, reject) => {
        const installProcess = spawn('npm', ['install'], {
          cwd: projectPath,
          shell: true
        });
        installProcess.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error(`npm install failed with code ${code}`));
        });
        installProcess.on('error', reject);
      });
    }

    // Start the dev server
    const devProcess = spawn('npm', ['run', 'dev'], {
      cwd: projectPath,
      shell: true,
      env: { ...process.env, PORT: port.toString() }
    });

    const logs: string[] = [];

    devProcess.stdout.on('data', (data) => {
      const log = data.toString();
      logs.push(log);
      if (logs.length > 100) logs.shift(); // Keep last 100 logs
    });

    devProcess.stderr.on('data', (data) => {
      const log = data.toString();
      logs.push(log);
      if (logs.length > 100) logs.shift();
    });

    devProcess.on('error', (error) => {
      console.error(`[DevServer] Error for project ${projectId}:`, error);
    });

    devProcess.on('close', (code) => {
      console.log(`[DevServer] Project ${projectId} dev server exited with code ${code}`);
      runningDevServers.delete(projectId);
      releaseDevPort(port);
    });

    // Store the server info
    runningDevServers.set(projectId, {
      process: devProcess,
      port,
      startedAt: new Date(),
      logs
    });

    // Wait a bit for the server to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate the preview URL
    const previewUrl = `http://localhost:${port}`;

    console.log(`[DevServer] Started dev server for project ${projectId} on port ${port}`);

    return {
      success: true,
      port,
      url: previewUrl
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[DevServer] Failed to start for project ${projectId}:`, errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Stop a development server
 */
export async function stopDevServer(projectId: number): Promise<void> {
  const serverInfo = runningDevServers.get(projectId);
  
  if (serverInfo) {
    try {
      // Kill the process
      serverInfo.process.kill('SIGTERM');
      
      // Give it a moment to clean up
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force kill if still running
      if (!serverInfo.process.killed) {
        serverInfo.process.kill('SIGKILL');
      }
    } catch (error) {
      console.warn(`[DevServer] Could not kill dev server for project ${projectId}:`, error);
    }
    
    releaseDevPort(serverInfo.port);
    runningDevServers.delete(projectId);
    
    console.log(`[DevServer] Stopped dev server for project ${projectId}`);
  }
}

/**
 * Get dev server status
 */
export function getDevServerStatus(projectId: number): {
  running: boolean;
  port?: number;
  url?: string;
  startedAt?: Date;
  logs?: string[];
} {
  const serverInfo = runningDevServers.get(projectId);
  
  if (!serverInfo) {
    return { running: false };
  }

  return {
    running: true,
    port: serverInfo.port,
    url: `http://localhost:${serverInfo.port}`,
    startedAt: serverInfo.startedAt,
    logs: serverInfo.logs.slice(-20) // Last 20 logs
  };
}

/**
 * Get dev server logs
 */
export function getDevServerLogs(projectId: number): string[] {
  const serverInfo = runningDevServers.get(projectId);
  return serverInfo?.logs || [];
}

/**
 * Refresh project files (hot reload)
 */
export async function refreshProjectFiles(projectId: number): Promise<void> {
  const serverInfo = runningDevServers.get(projectId);
  
  if (!serverInfo) {
    throw new Error('Dev server not running');
  }

  // Sync files - Vite will detect changes and hot reload
  await syncProjectFiles(projectId);
  
  console.log(`[DevServer] Refreshed files for project ${projectId}`);
}

/**
 * List all running dev servers
 */
export function listRunningDevServers(): Array<{
  projectId: number;
  port: number;
  startedAt: Date;
}> {
  const servers: Array<{ projectId: number; port: number; startedAt: Date }> = [];
  
  runningDevServers.forEach((info, projectId) => {
    servers.push({
      projectId,
      port: info.port,
      startedAt: info.startedAt
    });
  });

  return servers;
}

/**
 * Stop all dev servers (cleanup)
 */
export async function stopAllDevServers(): Promise<void> {
  const projectIds = Array.from(runningDevServers.keys());
  
  for (const projectId of projectIds) {
    await stopDevServer(projectId);
  }
  
  console.log(`[DevServer] Stopped all ${projectIds.length} dev servers`);
}
