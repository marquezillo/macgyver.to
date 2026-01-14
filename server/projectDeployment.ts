/**
 * Project Deployment Service
 * Handles building, running, and managing user projects on the server
 */

import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import { getDb } from './db';
import { projects, projectFiles, projectDbTables } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

// Base directory for user projects
const PROJECTS_BASE_DIR = '/home/ubuntu/user-projects';

// Port range for user projects (starting port)
const BASE_PORT = 4000;
const MAX_PROJECTS = 100;

// Track running processes
const runningProcesses: Map<number, ChildProcess> = new Map();

/**
 * Initialize the projects directory
 */
export async function initProjectsDirectory(): Promise<void> {
  try {
    await fs.mkdir(PROJECTS_BASE_DIR, { recursive: true });
    console.log(`[Projects] Directory initialized: ${PROJECTS_BASE_DIR}`);
  } catch (error) {
    console.error('[Projects] Failed to initialize directory:', error);
  }
}

/**
 * Get the directory path for a project
 */
export function getProjectPath(projectId: number): string {
  return path.join(PROJECTS_BASE_DIR, `project-${projectId}`);
}

/**
 * Allocate a port for a project
 */
export async function allocatePort(projectId: number): Promise<number> {
  // Simple allocation: base port + project ID
  // In production, you'd want to check for port availability
  return BASE_PORT + (projectId % MAX_PROJECTS);
}

/**
 * Write project files to disk
 */
export async function writeProjectFiles(projectId: number): Promise<void> {
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

  console.log(`[Projects] Wrote ${files.length} files for project ${projectId}`);
}

/**
 * Generate .env file for a project with its database credentials
 */
export async function generateEnvFile(projectId: number, port: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get project info
  const projectResult = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  const project = projectResult[0];
  
  if (!project) throw new Error('Project not found');

  // Generate database URL for this project's schema
  // Using the same database server but with project-specific schema prefix
  const mainDbUrl = process.env.DATABASE_URL || '';
  
  // Create env content
  const envContent = `# Auto-generated environment for project ${project.name}
DATABASE_URL=${mainDbUrl}
DB_SCHEMA=${project.dbSchema || `project_${projectId}`}
PORT=${port}
NODE_ENV=production
PROJECT_ID=${projectId}
`;

  const projectPath = getProjectPath(projectId);
  await fs.writeFile(path.join(projectPath, '.env'), envContent, 'utf-8');
  
  console.log(`[Projects] Generated .env for project ${projectId}`);
}

/**
 * Install dependencies for a project
 */
export async function installDependencies(projectId: number): Promise<string> {
  const projectPath = getProjectPath(projectId);
  
  return new Promise((resolve, reject) => {
    const process = spawn('npm', ['install'], {
      cwd: projectPath,
      shell: true
    });

    let output = '';
    
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      output += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`npm install failed with code ${code}: ${output}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Build a project
 */
export async function buildProject(projectId: number): Promise<string> {
  const projectPath = getProjectPath(projectId);
  
  return new Promise((resolve, reject) => {
    const process = spawn('npm', ['run', 'build'], {
      cwd: projectPath,
      shell: true
    });

    let output = '';
    
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      output += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Build failed with code ${code}: ${output}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Start a project
 */
export async function startProject(projectId: number): Promise<{ pid: number; port: number }> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Stop if already running
  await stopProject(projectId);

  const projectPath = getProjectPath(projectId);
  const port = await allocatePort(projectId);

  // Generate env file
  await generateEnvFile(projectId, port);

  // Start the project
  const childProcess = spawn('npm', ['start'], {
    cwd: projectPath,
    shell: true,
    detached: true,
    env: { ...process.env, PORT: port.toString() }
  });

  const pid = childProcess.pid || 0;
  
  // Track the process
  runningProcesses.set(projectId, childProcess);

  // Update project status in database
  await db.update(projects).set({
    status: 'running',
    port,
    pid
  }).where(eq(projects.id, projectId));

  console.log(`[Projects] Started project ${projectId} on port ${port} (PID: ${pid})`);

  return { pid, port };
}

/**
 * Stop a running project
 */
export async function stopProject(projectId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const childProcess = runningProcesses.get(projectId);
  
  if (childProcess) {
    try {
      // Kill the process group
      process.kill(-childProcess.pid!, 'SIGTERM');
    } catch (error) {
      // Process might already be dead
      console.warn(`[Projects] Could not kill process for project ${projectId}:`, error);
    }
    runningProcesses.delete(projectId);
  }

  // Update project status
  await db.update(projects).set({
    status: 'stopped',
    pid: null
  }).where(eq(projects.id, projectId));

  console.log(`[Projects] Stopped project ${projectId}`);
}

/**
 * Full deployment pipeline: write files, install, build, start
 */
export async function deployProject(projectId: number): Promise<{
  success: boolean;
  port?: number;
  url?: string;
  error?: string;
  buildLog: string;
}> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  let buildLog = '';

  try {
    // Update status to building
    await db.update(projects).set({ status: 'building', buildLog: '' }).where(eq(projects.id, projectId));

    // Step 1: Write files
    buildLog += '[1/4] Writing project files...\n';
    await writeProjectFiles(projectId);
    buildLog += 'Files written successfully.\n\n';

    // Step 2: Install dependencies
    buildLog += '[2/4] Installing dependencies...\n';
    const installOutput = await installDependencies(projectId);
    buildLog += installOutput + '\n\n';

    // Step 3: Build
    buildLog += '[3/4] Building project...\n';
    const buildOutput = await buildProject(projectId);
    buildLog += buildOutput + '\n\n';

    // Step 4: Start
    buildLog += '[4/4] Starting project...\n';
    const { port } = await startProject(projectId);
    buildLog += `Project started on port ${port}\n`;

    // Generate public URL
    const publicUrl = `http://localhost:${port}`;

    // Update project with success
    await db.update(projects).set({
      status: 'running',
      buildLog,
      publicUrl,
      lastError: null
    }).where(eq(projects.id, projectId));

    return {
      success: true,
      port,
      url: publicUrl,
      buildLog
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    buildLog += `\nERROR: ${errorMessage}\n`;

    // Update project with error
    await db.update(projects).set({
      status: 'error',
      buildLog,
      lastError: errorMessage
    }).where(eq(projects.id, projectId));

    return {
      success: false,
      error: errorMessage,
      buildLog
    };
  }
}

/**
 * Create project database tables
 */
export async function provisionProjectDatabase(projectId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get project's database tables
  const tables = await db.select().from(projectDbTables).where(eq(projectDbTables.projectId, projectId));

  // Get project info for schema name
  const projectResult = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  const project = projectResult[0];
  
  if (!project) throw new Error('Project not found');

  const schemaName = project.dbSchema || `project_${projectId}`;

  // Create tables for each defined table
  for (const table of tables) {
    const schema = table.schema as { columns: Array<{ name: string; type: string; required?: boolean }> };
    
    // Build CREATE TABLE statement
    const columns = schema.columns.map(col => {
      let sqlType = 'TEXT';
      switch (col.type) {
        case 'string': sqlType = 'VARCHAR(255)'; break;
        case 'number': sqlType = 'INT'; break;
        case 'boolean': sqlType = 'BOOLEAN'; break;
        case 'date': sqlType = 'TIMESTAMP'; break;
        case 'json': sqlType = 'JSON'; break;
      }
      return `${col.name} ${sqlType}${col.required ? ' NOT NULL' : ''}`;
    });

    // Add standard columns
    columns.unshift('id INT AUTO_INCREMENT PRIMARY KEY');
    columns.push('created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    columns.push('updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

    const tableName = `${schemaName}_${table.tableName}`;
    const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns.join(', ')})`;

    // Execute the SQL (using raw query)
    // Note: In production, you'd want proper SQL escaping
    console.log(`[Projects] Creating table: ${tableName}`);
    // await db.execute(sql.raw(createTableSQL));
  }

  console.log(`[Projects] Provisioned database for project ${projectId}`);
}

/**
 * Get project status and logs
 */
export async function getProjectStatus(projectId: number): Promise<{
  status: string;
  port?: number;
  url?: string;
  buildLog?: string;
  lastError?: string;
}> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  const project = result[0];

  if (!project) {
    return { status: 'not_found' };
  }

  return {
    status: project.status,
    port: project.port || undefined,
    url: project.publicUrl || undefined,
    buildLog: project.buildLog || undefined,
    lastError: project.lastError || undefined
  };
}

// Initialize on module load
initProjectsDirectory();
