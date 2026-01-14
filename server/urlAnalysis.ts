import { invokeLLM, invokeLLMStream, type Message } from "./_core/llm";

export interface UrlAnalysisResult {
  title: string;
  description: string;
  mainContent: string;
  keyPoints: string[];
  language: string;
  type: 'article' | 'product' | 'landing' | 'documentation' | 'other';
}

// Fetch and extract content from a URL using simple fetch
async function fetchUrlContent(url: string): Promise<{ html: string; text: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LandingEditor/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // Basic HTML to text extraction
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 15000); // Limit content size

    return { html, text };
  } catch (error) {
    console.error('[UrlAnalysis] Fetch error:', error);
    throw new Error(`No se pudo acceder a la URL: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Extract metadata from HTML
function extractMetadata(html: string): { title: string; description: string } {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  
  return {
    title: titleMatch?.[1]?.trim() || 'Sin título',
    description: descMatch?.[1]?.trim() || '',
  };
}

// Analyze URL content with LLM
export async function analyzeUrl(url: string): Promise<UrlAnalysisResult> {
  const { html, text } = await fetchUrlContent(url);
  const metadata = extractMetadata(html);

  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a web content analyzer. Analyze the provided webpage content and extract key information.
Return a JSON object with:
- mainContent: A comprehensive summary of the main content (2-3 paragraphs)
- keyPoints: Array of 5-7 key points or takeaways
- language: The detected language of the content (e.g., "es", "en", "fr")
- type: The type of page ("article", "product", "landing", "documentation", "other")

Be thorough and extract the most important information.`,
      },
      {
        role: "user",
        content: `URL: ${url}\n\nTitle: ${metadata.title}\nDescription: ${metadata.description}\n\nContent:\n${text}`,
      },
    ],
    responseFormat: {
      type: "json_schema",
      json_schema: {
        name: "url_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            mainContent: { type: "string" },
            keyPoints: { type: "array", items: { type: "string" } },
            language: { type: "string" },
            type: { type: "string", enum: ["article", "product", "landing", "documentation", "other"] },
          },
          required: ["mainContent", "keyPoints", "language", "type"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = result.choices[0]?.message?.content;
    const parsed = JSON.parse(typeof content === "string" ? content : "{}");
    
    return {
      title: metadata.title,
      description: metadata.description,
      mainContent: parsed.mainContent || '',
      keyPoints: parsed.keyPoints || [],
      language: parsed.language || 'unknown',
      type: parsed.type || 'other',
    };
  } catch {
    return {
      title: metadata.title,
      description: metadata.description,
      mainContent: text.slice(0, 1000),
      keyPoints: [],
      language: 'unknown',
      type: 'other',
    };
  }
}

// Streaming version for real-time analysis
export async function* analyzeUrlStream(url: string): AsyncGenerator<{ type: string; data: unknown }, void, unknown> {
  yield { type: "status", data: "Accediendo a la URL..." };

  let html: string;
  let text: string;
  
  try {
    const result = await fetchUrlContent(url);
    html = result.html;
    text = result.text;
  } catch (error) {
    yield { type: "error", data: error instanceof Error ? error.message : "Error al acceder a la URL" };
    return;
  }

  const metadata = extractMetadata(html);
  yield { type: "metadata", data: metadata };
  yield { type: "status", data: "Analizando contenido..." };

  const messages: Message[] = [
    {
      role: "system",
      content: `You are a web content analyzer. Analyze the provided webpage and provide a comprehensive summary.
Include:
1. What the page is about
2. Key information and takeaways
3. Important details or data mentioned
4. The target audience
5. Any calls to action or main purpose

Format your response in Spanish with clear sections using markdown.`,
    },
    {
      role: "user",
      content: `URL: ${url}\n\nTitle: ${metadata.title}\nDescription: ${metadata.description}\n\nContent:\n${text}`,
    },
  ];

  for await (const chunk of invokeLLMStream({ messages })) {
    yield { type: "content", data: chunk };
  }

  yield { type: "done", data: { url, title: metadata.title } };
}
