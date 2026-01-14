import { invokeLLM, invokeLLMStream, type Message } from "./_core/llm";

export interface ComparisonResult {
  summary: string;
  similarities: string[];
  differences: string[];
  recommendations: string[];
  detailedAnalysis: string;
}

export interface DocumentInfo {
  name: string;
  content: string;
  type: string;
}

// Compare two or more documents and identify differences
export async function compareDocuments(documents: DocumentInfo[]): Promise<ComparisonResult> {
  if (documents.length < 2) {
    throw new Error('Se necesitan al menos 2 documentos para comparar');
  }

  const documentsContext = documents
    .map((doc, i) => `=== DOCUMENTO ${i + 1}: ${doc.name} (${doc.type}) ===\n${doc.content.slice(0, 10000)}`)
    .join('\n\n');

  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a document comparison specialist. Analyze the provided documents and identify similarities and differences.

Return a JSON object with:
- summary: A brief overview of what the documents are about and their main purpose
- similarities: Array of key similarities between the documents
- differences: Array of key differences between the documents
- recommendations: Array of actionable recommendations based on the comparison
- detailedAnalysis: A comprehensive markdown-formatted analysis

Be thorough and specific. Reference document numbers when describing differences.`,
      },
      {
        role: "user",
        content: `Compare the following ${documents.length} documents:\n\n${documentsContext}`,
      },
    ],
    responseFormat: {
      type: "json_schema",
      json_schema: {
        name: "document_comparison",
        strict: true,
        schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            similarities: { type: "array", items: { type: "string" } },
            differences: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            detailedAnalysis: { type: "string" },
          },
          required: ["summary", "similarities", "differences", "recommendations", "detailedAnalysis"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = result.choices[0]?.message?.content;
    return JSON.parse(typeof content === "string" ? content : "{}");
  } catch {
    return {
      summary: 'Error al analizar los documentos',
      similarities: [],
      differences: [],
      recommendations: [],
      detailedAnalysis: '',
    };
  }
}

// Streaming comparison for real-time feedback
export async function* compareDocumentsStream(
  documents: DocumentInfo[]
): AsyncGenerator<{ type: string; data: unknown }, void, unknown> {
  if (documents.length < 2) {
    yield { type: "error", data: "Se necesitan al menos 2 documentos para comparar" };
    return;
  }

  yield { type: "status", data: `Analizando ${documents.length} documentos...` };
  yield { type: "documents", data: documents.map(d => ({ name: d.name, type: d.type })) };

  const documentsContext = documents
    .map((doc, i) => `=== DOCUMENTO ${i + 1}: ${doc.name} (${doc.type}) ===\n${doc.content.slice(0, 8000)}`)
    .join('\n\n');

  yield { type: "status", data: "Comparando contenido..." };

  const messages: Message[] = [
    {
      role: "system",
      content: `You are a document comparison specialist. Compare the provided documents and create a detailed analysis.

Structure your response in Spanish with these sections:
## Resumen
Brief overview of the documents

## Similitudes
- List key similarities

## Diferencias
- List key differences, referencing document numbers

## Análisis Detallado
Comprehensive comparison with specific examples

## Recomendaciones
- Actionable recommendations based on the comparison

Use markdown formatting for clarity.`,
    },
    {
      role: "user",
      content: `Compare the following ${documents.length} documents:\n\n${documentsContext}`,
    },
  ];

  for await (const chunk of invokeLLMStream({ messages })) {
    yield { type: "content", data: chunk };
  }

  yield { type: "done", data: { documentCount: documents.length } };
}

// Compare specific sections or extract differences in a structured way
export async function extractDifferences(
  doc1: DocumentInfo,
  doc2: DocumentInfo
): Promise<{ field: string; doc1Value: string; doc2Value: string }[]> {
  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Compare two documents and extract specific field-by-field differences.
Return a JSON array where each item has:
- field: The name/topic of the difference
- doc1Value: The value/content in document 1
- doc2Value: The value/content in document 2

Only include fields where there are actual differences.`,
      },
      {
        role: "user",
        content: `Document 1 (${doc1.name}):\n${doc1.content.slice(0, 5000)}\n\nDocument 2 (${doc2.name}):\n${doc2.content.slice(0, 5000)}`,
      },
    ],
    responseFormat: {
      type: "json_schema",
      json_schema: {
        name: "differences",
        strict: true,
        schema: {
          type: "object",
          properties: {
            differences: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string" },
                  doc1Value: { type: "string" },
                  doc2Value: { type: "string" },
                },
                required: ["field", "doc1Value", "doc2Value"],
                additionalProperties: false,
              },
            },
          },
          required: ["differences"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = result.choices[0]?.message?.content;
    const parsed = JSON.parse(typeof content === "string" ? content : "{}");
    return parsed.differences || [];
  } catch {
    return [];
  }
}
