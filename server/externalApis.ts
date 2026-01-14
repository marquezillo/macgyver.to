import { exec } from "child_process";
import { promisify } from "util";
import { invokeLLM } from "./_core/llm";

const execAsync = promisify(exec);

export interface McpServer {
  name: string;
  description: string;
  tools: McpTool[];
  status: 'connected' | 'disconnected' | 'error';
}

export interface McpTool {
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string; required?: boolean }>;
}

export interface ApiCallResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// List available MCP servers
export async function listMcpServers(): Promise<McpServer[]> {
  try {
    const { stdout } = await execAsync('manus-mcp-cli list-servers', { timeout: 10000 });
    const servers = JSON.parse(stdout);
    return servers;
  } catch (error) {
    console.warn('[ExternalApis] Could not list MCP servers:', error);
    // Return common integrations as placeholders
    return [
      {
        name: 'notion',
        description: 'Notion workspace integration - read/write pages and databases',
        tools: [
          { name: 'search', description: 'Search Notion pages', parameters: { query: { type: 'string', description: 'Search query', required: true } } },
          { name: 'get_page', description: 'Get page content', parameters: { page_id: { type: 'string', description: 'Page ID', required: true } } },
          { name: 'create_page', description: 'Create new page', parameters: { title: { type: 'string', description: 'Page title', required: true }, content: { type: 'string', description: 'Page content' } } },
        ],
        status: 'disconnected',
      },
      {
        name: 'google-sheets',
        description: 'Google Sheets integration - read/write spreadsheets',
        tools: [
          { name: 'read_sheet', description: 'Read spreadsheet data', parameters: { spreadsheet_id: { type: 'string', description: 'Spreadsheet ID', required: true }, range: { type: 'string', description: 'Cell range (e.g., A1:D10)' } } },
          { name: 'write_sheet', description: 'Write data to spreadsheet', parameters: { spreadsheet_id: { type: 'string', description: 'Spreadsheet ID', required: true }, range: { type: 'string', description: 'Cell range', required: true }, values: { type: 'array', description: '2D array of values', required: true } } },
        ],
        status: 'disconnected',
      },
      {
        name: 'airtable',
        description: 'Airtable integration - manage bases and records',
        tools: [
          { name: 'list_records', description: 'List records from a table', parameters: { base_id: { type: 'string', description: 'Base ID', required: true }, table_name: { type: 'string', description: 'Table name', required: true } } },
          { name: 'create_record', description: 'Create a new record', parameters: { base_id: { type: 'string', description: 'Base ID', required: true }, table_name: { type: 'string', description: 'Table name', required: true }, fields: { type: 'object', description: 'Record fields', required: true } } },
        ],
        status: 'disconnected',
      },
      {
        name: 'slack',
        description: 'Slack integration - send messages and manage channels',
        tools: [
          { name: 'send_message', description: 'Send message to channel', parameters: { channel: { type: 'string', description: 'Channel name or ID', required: true }, text: { type: 'string', description: 'Message text', required: true } } },
          { name: 'list_channels', description: 'List available channels', parameters: {} },
        ],
        status: 'disconnected',
      },
      {
        name: 'github',
        description: 'GitHub integration - manage repositories and issues',
        tools: [
          { name: 'list_repos', description: 'List repositories', parameters: { owner: { type: 'string', description: 'Owner username' } } },
          { name: 'create_issue', description: 'Create an issue', parameters: { repo: { type: 'string', description: 'Repository name', required: true }, title: { type: 'string', description: 'Issue title', required: true }, body: { type: 'string', description: 'Issue body' } } },
        ],
        status: 'disconnected',
      },
    ];
  }
}

// Call an MCP tool
export async function callMcpTool(
  serverName: string,
  toolName: string,
  parameters: Record<string, unknown>
): Promise<ApiCallResult> {
  try {
    const paramsJson = JSON.stringify(parameters);
    const { stdout, stderr } = await execAsync(
      `manus-mcp-cli call ${serverName} ${toolName} '${paramsJson}'`,
      { timeout: 30000 }
    );

    if (stderr) {
      console.warn('[ExternalApis] MCP stderr:', stderr);
    }

    return {
      success: true,
      data: JSON.parse(stdout),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error calling MCP tool',
    };
  }
}

// Connect to an MCP server
export async function connectMcpServer(
  serverName: string,
  config: Record<string, string>
): Promise<{ success: boolean; message: string }> {
  try {
    const configJson = JSON.stringify(config);
    await execAsync(
      `manus-mcp-cli connect ${serverName} '${configJson}'`,
      { timeout: 15000 }
    );

    return {
      success: true,
      message: `Conectado a ${serverName} correctamente`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error connecting to server',
    };
  }
}

// Generate API call from natural language
export async function generateApiCall(
  userRequest: string,
  availableServers: McpServer[]
): Promise<{ server: string; tool: string; parameters: Record<string, unknown> } | null> {
  const serversContext = availableServers
    .filter(s => s.status === 'connected')
    .map(s => {
      const tools = s.tools.map(t => `  - ${t.name}: ${t.description}`).join('\n');
      return `${s.name}:\n${tools}`;
    })
    .join('\n\n');

  if (!serversContext) {
    return null;
  }

  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an API integration assistant. Based on the user's request, determine which API to call.

Available APIs and tools:
${serversContext}

Return a JSON object with:
- server: The server name to use
- tool: The tool name to call
- parameters: Object with the required parameters

If the request cannot be fulfilled with available APIs, return null.`,
      },
      {
        role: "user",
        content: userRequest,
      },
    ],
    responseFormat: {
      type: "json_schema",
      json_schema: {
        name: "api_call",
        strict: true,
        schema: {
          type: "object",
          properties: {
            server: { type: "string" },
            tool: { type: "string" },
            parameters: { type: "object", additionalProperties: true },
          },
          required: ["server", "tool", "parameters"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = result.choices[0]?.message?.content;
    return JSON.parse(typeof content === "string" ? content : "null");
  } catch {
    return null;
  }
}

// Execute a natural language API request
export async function executeNaturalLanguageApiRequest(
  request: string
): Promise<ApiCallResult> {
  const servers = await listMcpServers();
  const connectedServers = servers.filter(s => s.status === 'connected');

  if (connectedServers.length === 0) {
    return {
      success: false,
      error: 'No hay APIs conectadas. Conecta una API primero desde la configuración.',
    };
  }

  const apiCall = await generateApiCall(request, connectedServers);

  if (!apiCall) {
    return {
      success: false,
      error: 'No se pudo determinar qué API usar para esta solicitud.',
    };
  }

  return await callMcpTool(apiCall.server, apiCall.tool, apiCall.parameters);
}
