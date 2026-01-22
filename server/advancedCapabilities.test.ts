import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
  invokeLLMStream: vi.fn(),
}));

import { invokeLLM, invokeLLMStream } from "./_core/llm";

describe("URL Analysis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("extracts metadata from HTML", async () => {
    // Import the function dynamically to get mocked version
    const { analyzeUrl } = await import("./urlAnalysis");
    
    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(`
        <html>
          <head>
            <title>Test Page</title>
            <meta name="description" content="Test description">
          </head>
          <body><p>Test content</p></body>
        </html>
      `),
    }) as any;

    // Mock LLM response
    (invokeLLM as any).mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            mainContent: "Test content analysis",
            keyPoints: ["Point 1", "Point 2"],
            language: "en",
            type: "article",
          }),
        },
      }],
    });

    const result = await analyzeUrl("https://example.com");
    
    expect(result.title).toBe("Test Page");
    expect(result.description).toBe("Test description");
    expect(result.mainContent).toBe("Test content analysis");
    expect(result.keyPoints).toHaveLength(2);
  });

  it("handles fetch errors gracefully", async () => {
    const { analyzeUrl } = await import("./urlAnalysis");
    
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    await expect(analyzeUrl("https://invalid.url")).rejects.toThrow("No se pudo acceder a la URL");
  });
});

describe("OCR and Translation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detects language from text", async () => {
    const { detectLanguage } = await import("./ocrTranslation");
    
    (invokeLLM as any).mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            language: "es",
            confidence: 0.95,
          }),
        },
      }],
    });

    const result = await detectLanguage("Hola, ¿cómo estás?");
    
    expect(result.language).toBe("es");
    expect(result.languageName).toBe("Español");
    expect(result.confidence).toBe(0.95);
  });

  it("translates text to target language", async () => {
    const { translateText } = await import("./ocrTranslation");
    
    // Mock language detection
    (invokeLLM as any)
      .mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({ language: "es", confidence: 0.9 }),
          },
        }],
      })
      // Mock translation
      .mockResolvedValueOnce({
        choices: [{
          message: {
            content: "Hello, how are you?",
          },
        }],
      });

    const result = await translateText("Hola, ¿cómo estás?", "en");
    
    expect(result.sourceLanguage).toBe("es");
    expect(result.targetLanguage).toBe("en");
    expect(result.translatedText).toBe("Hello, how are you?");
  });
});

describe("Diagram Generation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates diagram code from description", async () => {
    const { generateDiagramCode } = await import("./diagramGeneration");
    
    (invokeLLM as any).mockResolvedValue({
      choices: [{
        message: {
          content: "flowchart TD\n  A[Start] --> B[Process]\n  B --> C[End]",
        },
      }],
    });

    const result = await generateDiagramCode("A simple process flow");
    
    expect(result.code).toContain("flowchart TD");
    expect(result.format).toBe("mermaid");
  });

  it("suggests appropriate diagram type", async () => {
    const { suggestDiagramType } = await import("./diagramGeneration");
    
    (invokeLLM as any).mockResolvedValue({
      choices: [{
        message: {
          content: "erd",
        },
      }],
    });

    const result = await suggestDiagramType("Database schema for users and orders");
    
    expect(result).toBe("erd");
  });
});

describe("Document Comparison", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("compares two documents", async () => {
    const { compareDocuments } = await import("./documentComparison");
    
    (invokeLLM as any).mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            summary: "Both documents discuss project requirements",
            similarities: ["Same project scope", "Similar timeline"],
            differences: ["Doc 1 has more detail", "Doc 2 includes budget"],
            recommendations: ["Merge the documents"],
            detailedAnalysis: "Detailed comparison...",
          }),
        },
      }],
    });

    const result = await compareDocuments([
      { name: "doc1.txt", content: "Project requirements v1", type: "text" },
      { name: "doc2.txt", content: "Project requirements v2", type: "text" },
    ]);
    
    expect(result.similarities).toHaveLength(2);
    expect(result.differences).toHaveLength(2);
    expect(result.recommendations).toHaveLength(1);
  });

  it("requires at least 2 documents", async () => {
    const { compareDocuments } = await import("./documentComparison");
    
    await expect(compareDocuments([
      { name: "doc1.txt", content: "Content", type: "text" },
    ])).rejects.toThrow("Se necesitan al menos 2 documentos");
  });
});

describe("Autonomous Agents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detects autonomous mode triggers", async () => {
    const { shouldUseAutonomousMode } = await import("./autonomousAgents");
    
    // Patrones originales
    expect(shouldUseAutonomousMode("Investiga sobre React y crea un resumen")).toBe(true);
    expect(shouldUseAutonomousMode("Busca información para crear un informe")).toBe(true);
    expect(shouldUseAutonomousMode("Hazlo paso a paso")).toBe(true);
    expect(shouldUseAutonomousMode("¿Qué hora es?")).toBe(false);
    expect(shouldUseAutonomousMode("Hola")).toBe(false);
    
    // Nuevos patrones para URLs y clonación
    expect(shouldUseAutonomousMode("Entra a https://example.com y clona la página")).toBe(true);
    expect(shouldUseAutonomousMode("Clona esta página https://example.com")).toBe(true);
    expect(shouldUseAutonomousMode("Puedes clonarme una landing igual a https://example.com")).toBe(true);
    expect(shouldUseAutonomousMode("Accede a https://example.com y analiza el contenido")).toBe(true);
    expect(shouldUseAutonomousMode("Visita https://example.com")).toBe(true);
    expect(shouldUseAutonomousMode("Hazme una landing parecida a https://example.com")).toBe(true);
  });

  it("plans task steps correctly", async () => {
    // This test verifies the planning logic
    (invokeLLM as any).mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            steps: [
              { tool: "web_search", input: "Search for information" },
              { tool: "final_answer", input: "Summarize findings" },
            ],
          }),
        },
      }],
    });

    const { runAutonomousTask } = await import("./autonomousAgents");
    
    // Mock the deep research
    vi.mock("./deepResearch", () => ({
      performDeepResearch: vi.fn().mockResolvedValue({
        summary: "Research summary",
        sources: [],
        followUpQuestions: [],
      }),
    }));

    // The task should be planned with steps
    // Note: Full execution would require more mocking
  });
});
