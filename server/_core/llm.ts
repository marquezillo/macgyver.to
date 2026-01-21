/**
 * LLM Module - Multi-provider support
 * 
 * Primary: Anthropic Claude (claude-sonnet-4-20250514)
 * Fallback: OpenAI GPT-4o, Gemini 2.0 Flash
 * 
 * Configuration via environment variables:
 * - ANTHROPIC_API_KEY: For Claude models
 * - OPENAI_API_KEY_CUSTOM: For OpenAI models  
 * - GEMINI_API_KEY: For Google Gemini models
 */

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4";
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  provider?: "anthropic" | "openai" | "gemini";
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

// Provider configuration
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY_CUSTOM;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Model configuration
const CLAUDE_MODEL = "claude-sonnet-4-20250514";
const OPENAI_MODEL = "gpt-4o";
const GEMINI_MODEL = "gemini-2.0-flash";

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") return part;
  if (part.type === "image_url") return part;
  if (part.type === "file_url") return part;
  throw new Error("Unsupported message content part");
};

// Convert messages to Anthropic format
function toAnthropicMessages(messages: Message[]): { system: string; messages: Array<{ role: string; content: string }> } {
  let systemPrompt = "";
  const anthropicMessages: Array<{ role: string; content: string }> = [];

  for (const msg of messages) {
    const content = ensureArray(msg.content)
      .map(part => (typeof part === "string" ? part : (part as TextContent).text || ""))
      .join("\n");

    if (msg.role === "system") {
      systemPrompt += (systemPrompt ? "\n\n" : "") + content;
    } else {
      anthropicMessages.push({
        role: msg.role === "assistant" ? "assistant" : "user",
        content,
      });
    }
  }

  return { system: systemPrompt, messages: anthropicMessages };
}

// Convert messages to OpenAI format
function toOpenAIMessages(messages: Message[]): Array<{ role: string; content: string }> {
  return messages.map(msg => {
    const content = ensureArray(msg.content)
      .map(part => (typeof part === "string" ? part : (part as TextContent).text || ""))
      .join("\n");
    return { role: msg.role, content };
  });
}

// Convert messages to Gemini format
function toGeminiContents(messages: Message[]): { systemInstruction?: { parts: Array<{ text: string }> }; contents: Array<{ role: string; parts: Array<{ text: string }> }> } {
  let systemInstruction: { parts: Array<{ text: string }> } | undefined;
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  for (const msg of messages) {
    const text = ensureArray(msg.content)
      .map(part => (typeof part === "string" ? part : (part as TextContent).text || ""))
      .join("\n");

    if (msg.role === "system") {
      systemInstruction = { parts: [{ text }] };
    } else {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text }],
      });
    }
  }

  return { systemInstruction, contents };
}

// Invoke Anthropic Claude
async function invokeAnthropic(messages: Message[], maxTokens: number): Promise<InvokeResult> {
  if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured");

  const { system, messages: anthropicMessages } = toAnthropicMessages(messages);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system: system || undefined,
      messages: anthropicMessages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  // Convert Anthropic response to standard format
  return {
    id: data.id,
    created: Date.now(),
    model: data.model,
    choices: [{
      index: 0,
      message: {
        role: "assistant",
        content: data.content?.[0]?.text || "",
      },
      finish_reason: data.stop_reason || "stop",
    }],
    usage: {
      prompt_tokens: data.usage?.input_tokens || 0,
      completion_tokens: data.usage?.output_tokens || 0,
      total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    },
  };
}

// Invoke OpenAI
async function invokeOpenAI(messages: Message[], maxTokens: number): Promise<InvokeResult> {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY_CUSTOM not configured");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_tokens: maxTokens,
      messages: toOpenAIMessages(messages),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  return await response.json() as InvokeResult;
}

// Invoke Google Gemini
async function invokeGemini(messages: Message[], maxTokens: number): Promise<InvokeResult> {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

  const { systemInstruction, contents } = toGeminiContents(messages);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction,
        contents,
        generationConfig: { maxOutputTokens: maxTokens },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  return {
    id: `gemini-${Date.now()}`,
    created: Date.now(),
    model: GEMINI_MODEL,
    choices: [{
      index: 0,
      message: { role: "assistant", content: text },
      finish_reason: data.candidates?.[0]?.finishReason || "stop",
    }],
    usage: {
      prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
      completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
      total_tokens: data.usageMetadata?.totalTokenCount || 0,
    },
  };
}

// Main invoke function with fallback
export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const { messages, maxTokens, max_tokens, provider } = params;
  const tokens = maxTokens || max_tokens || 8192;

  // If specific provider requested, use it
  if (provider === "openai") return invokeOpenAI(messages, tokens);
  if (provider === "gemini") return invokeGemini(messages, tokens);
  if (provider === "anthropic") return invokeAnthropic(messages, tokens);

  // Default: Try Anthropic first, then OpenAI, then Gemini
  const providers = [
    { name: "Anthropic", fn: () => invokeAnthropic(messages, tokens), available: !!ANTHROPIC_API_KEY },
    { name: "OpenAI", fn: () => invokeOpenAI(messages, tokens), available: !!OPENAI_API_KEY },
    { name: "Gemini", fn: () => invokeGemini(messages, tokens), available: !!GEMINI_API_KEY },
  ];

  const errors: string[] = [];

  for (const provider of providers) {
    if (!provider.available) continue;
    try {
      return await provider.fn();
    } catch (error) {
      errors.push(`${provider.name}: ${(error as Error).message}`);
      console.error(`[LLM] ${provider.name} failed:`, error);
    }
  }

  throw new Error(`All LLM providers failed: ${errors.join("; ")}`);
}

// Streaming with Anthropic Claude
async function* streamAnthropic(messages: Message[], maxTokens: number): AsyncGenerator<string, void, unknown> {
  if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured");

  const { system, messages: anthropicMessages } = toAnthropicMessages(messages);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      stream: true,
      system: system || undefined,
      messages: anthropicMessages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic streaming error: ${response.status} - ${error}`);
  }

  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (!data || data === "[DONE]") continue;

        try {
          const json = JSON.parse(data);
          if (json.type === "content_block_delta" && json.delta?.text) {
            yield json.delta.text;
          }
        } catch {
          // Skip malformed JSON
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// Streaming with OpenAI
async function* streamOpenAI(messages: Message[], maxTokens: number): AsyncGenerator<string, void, unknown> {
  if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY_CUSTOM not configured");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_tokens: maxTokens,
      stream: true,
      messages: toOpenAIMessages(messages),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI streaming error: ${response.status} - ${error}`);
  }

  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (!data || data === "[DONE]") continue;

        try {
          const json = JSON.parse(data);
          const content = json.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // Skip malformed JSON
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// Streaming with Gemini (non-streaming fallback, Gemini streaming is complex)
async function* streamGemini(messages: Message[], maxTokens: number): AsyncGenerator<string, void, unknown> {
  const result = await invokeGemini(messages, maxTokens);
  const content = result.choices[0]?.message?.content;
  if (typeof content === "string") {
    // Simulate streaming by yielding chunks
    const chunkSize = 20;
    for (let i = 0; i < content.length; i += chunkSize) {
      yield content.slice(i, i + chunkSize);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
}

// Streaming params type
export type StreamingParams = Omit<InvokeParams, 'outputSchema' | 'output_schema' | 'responseFormat' | 'response_format'>;

// Main streaming function with fallback
export async function* invokeLLMStream(params: StreamingParams): AsyncGenerator<string, void, unknown> {
  const { messages, maxTokens, max_tokens, provider } = params;
  const tokens = maxTokens || max_tokens || 8192;

  // If specific provider requested
  if (provider === "openai") {
    yield* streamOpenAI(messages, tokens);
    return;
  }
  if (provider === "gemini") {
    yield* streamGemini(messages, tokens);
    return;
  }
  if (provider === "anthropic") {
    yield* streamAnthropic(messages, tokens);
    return;
  }

  // Default: Try Anthropic first, then OpenAI, then Gemini
  const providers = [
    { name: "Anthropic", fn: () => streamAnthropic(messages, tokens), available: !!ANTHROPIC_API_KEY },
    { name: "OpenAI", fn: () => streamOpenAI(messages, tokens), available: !!OPENAI_API_KEY },
    { name: "Gemini", fn: () => streamGemini(messages, tokens), available: !!GEMINI_API_KEY },
  ];

  for (const provider of providers) {
    if (!provider.available) continue;
    try {
      yield* provider.fn();
      return;
    } catch (error) {
      console.error(`[LLM Stream] ${provider.name} failed:`, error);
    }
  }

  throw new Error("All LLM streaming providers failed");
}

// Export provider info for debugging
export function getAvailableProviders(): string[] {
  const providers: string[] = [];
  if (ANTHROPIC_API_KEY) providers.push("anthropic (claude-sonnet-4-20250514)");
  if (OPENAI_API_KEY) providers.push("openai (gpt-4o)");
  if (GEMINI_API_KEY) providers.push("gemini (gemini-2.0-flash)");
  return providers;
}
