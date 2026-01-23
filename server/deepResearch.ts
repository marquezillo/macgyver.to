import { invokeLLM, invokeLLMStream, type Message } from "./_core/llm";

// Brave Search API configuration
const BRAVE_SEARCH_API_KEY = process.env.BRAVE_SEARCH_API_KEY || "";

export interface ResearchSource {
  title: string;
  url: string;
  snippet: string;
}

export interface ResearchResult {
  summary: string;
  sources: ResearchSource[];
  followUpQuestions: string[];
}

// Search the web using Brave Search API
async function searchWeb(query: string): Promise<ResearchSource[]> {
  // Check if Brave Search is configured
  if (!BRAVE_SEARCH_API_KEY) {
    console.warn("[Deep Research] Brave Search API not configured. Set BRAVE_SEARCH_API_KEY environment variable.");
    return [];
  }

  try {
    const url = new URL("https://api.search.brave.com/res/v1/web/search");
    url.searchParams.set("q", query);
    url.searchParams.set("count", "10");
    url.searchParams.set("text_decorations", "false");

    console.log("[Deep Research] Searching Brave for:", query);

    const response = await fetch(url.toString(), {
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": BRAVE_SEARCH_API_KEY,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Deep Research] Brave Search API error:", response.status, errorText);
      return [];
    }

    const result = await response.json() as any;

    if (result?.web?.results && Array.isArray(result.web.results)) {
      console.log("[Deep Research] Found", result.web.results.length, "results from Brave");
      return result.web.results.map((item: any) => ({
        title: item.title || "",
        url: item.url || "",
        snippet: item.description || "",
      }));
    }

    console.log("[Deep Research] No results in Brave response");
    return [];
  } catch (error) {
    console.error("[Deep Research] Brave Search API failed:", error);
    return [];
  }
}

// Generate search queries from the user's question
async function generateSearchQueries(question: string): Promise<string[]> {
  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a research assistant. Given a user's question, generate 3 different search queries that would help find comprehensive information to answer the question. Return ONLY a JSON array of strings, nothing else.`,
      },
      {
        role: "user",
        content: question,
      },
    ],
    responseFormat: {
      type: "json_schema",
      json_schema: {
        name: "search_queries",
        strict: true,
        schema: {
          type: "object",
          properties: {
            queries: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["queries"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = result.choices[0]?.message?.content;
    const parsed = JSON.parse(typeof content === "string" ? content : "");
    return parsed.queries || [question];
  } catch {
    return [question];
  }
}

// Synthesize information from sources
async function synthesizeResearch(
  question: string,
  sources: ResearchSource[]
): Promise<{ summary: string; followUpQuestions: string[] }> {
  const sourcesContext = sources
    .map((s, i) => `[${i + 1}] ${s.title}\n${s.snippet}\nURL: ${s.url}`)
    .join("\n\n");

  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a research assistant that synthesizes information from multiple sources. 
Your task is to:
1. Provide a comprehensive, well-structured answer to the user's question based on the sources
2. Cite sources using [1], [2], etc. notation
3. Generate 3 follow-up questions the user might want to explore

Format your response as JSON with "summary" (string with markdown formatting) and "followUpQuestions" (array of 3 strings).`,
      },
      {
        role: "user",
        content: `Question: ${question}\n\nSources:\n${sourcesContext}`,
      },
    ],
    responseFormat: {
      type: "json_schema",
      json_schema: {
        name: "research_synthesis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            followUpQuestions: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: ["summary", "followUpQuestions"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = result.choices[0]?.message?.content;
    return JSON.parse(typeof content === "string" ? content : "");
  } catch {
    return {
      summary: "No se pudo sintetizar la información.",
      followUpQuestions: [],
    };
  }
}

// Main deep research function
export async function performDeepResearch(question: string): Promise<ResearchResult> {
  // Step 1: Generate search queries
  const queries = await generateSearchQueries(question);
  
  // Step 2: Search the web with all queries
  const allSources: ResearchSource[] = [];
  const seenUrls = new Set<string>();
  
  for (const query of queries) {
    const results = await searchWeb(query);
    for (const source of results) {
      if (!seenUrls.has(source.url)) {
        seenUrls.add(source.url);
        allSources.push(source);
      }
    }
  }

  // Step 3: If no sources found, use LLM knowledge
  if (allSources.length === 0) {
    const fallbackResult = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a helpful research assistant. Answer the user's question comprehensively based on your knowledge. Format with markdown.",
        },
        { role: "user", content: question },
      ],
    });

    const content = fallbackResult.choices[0]?.message?.content;
    return {
      summary: typeof content === "string" ? content : "No se encontró información.",
      sources: [],
      followUpQuestions: [],
    };
  }

  // Step 4: Synthesize the research
  const { summary, followUpQuestions } = await synthesizeResearch(
    question,
    allSources.slice(0, 10) // Limit to top 10 sources
  );

  return {
    summary,
    sources: allSources.slice(0, 10),
    followUpQuestions,
  };
}

// Streaming version for real-time updates
export async function* performDeepResearchStream(
  question: string
): AsyncGenerator<{ type: string; data: unknown }, void, unknown> {
  // Step 1: Signal start
  yield { type: "status", data: "Generando consultas de búsqueda..." };

  // Generate search queries
  const queries = await generateSearchQueries(question);
  yield { type: "queries", data: queries };

  // Step 2: Search
  yield { type: "status", data: "Buscando información en la web con Brave Search..." };
  
  const allSources: ResearchSource[] = [];
  const seenUrls = new Set<string>();

  for (const query of queries) {
    const results = await searchWeb(query);
    for (const source of results) {
      if (!seenUrls.has(source.url)) {
        seenUrls.add(source.url);
        allSources.push(source);
        yield { type: "source", data: source };
      }
    }
  }

  // Step 3: Synthesize
  yield { type: "status", data: "Analizando y sintetizando información..." };

  if (allSources.length === 0) {
    // Fallback to LLM streaming
    yield { type: "status", data: "Generando respuesta basada en conocimiento..." };
    
    const messages: Message[] = [
      {
        role: "system",
        content: "You are a helpful research assistant. Answer the user's question comprehensively based on your knowledge. Format with markdown. Respond in Spanish.",
      },
      { role: "user", content: question },
    ];

    for await (const chunk of invokeLLMStream({ messages })) {
      yield { type: "content", data: chunk };
    }

    yield { type: "done", data: { sources: [], followUpQuestions: [] } };
    return;
  }

  // Synthesize with streaming
  const sourcesContext = allSources
    .slice(0, 10)
    .map((s, i) => `[${i + 1}] ${s.title}\n${s.snippet}\nURL: ${s.url}`)
    .join("\n\n");

  const messages: Message[] = [
    {
      role: "system",
      content: `You are a research assistant that synthesizes information from multiple sources.
Provide a comprehensive, well-structured answer based on the sources.
Cite sources using [1], [2], etc. notation.
Format your response with markdown.
Respond in Spanish.`,
    },
    {
      role: "user",
      content: `Question: ${question}\n\nSources:\n${sourcesContext}`,
    },
  ];

  for await (const chunk of invokeLLMStream({ messages })) {
    yield { type: "content", data: chunk };
  }

  // Generate follow-up questions
  const followUpResult = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Generate 3 follow-up questions in Spanish that the user might want to explore based on the topic. Return ONLY a JSON array of strings.",
      },
      { role: "user", content: question },
    ],
    responseFormat: {
      type: "json_schema",
      json_schema: {
        name: "follow_up",
        strict: true,
        schema: {
          type: "object",
          properties: {
            questions: { type: "array", items: { type: "string" } },
          },
          required: ["questions"],
          additionalProperties: false,
        },
      },
    },
  });

  let followUpQuestions: string[] = [];
  try {
    const content = followUpResult.choices[0]?.message?.content;
    const parsed = JSON.parse(typeof content === "string" ? content : "");
    followUpQuestions = parsed.questions || [];
  } catch {
    // Ignore
  }

  yield {
    type: "done",
    data: {
      sources: allSources.slice(0, 10),
      followUpQuestions,
    },
  };
}
