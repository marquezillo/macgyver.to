import { invokeLLM } from "./_core/llm";
import { createMemory, getMemoriesByUserId } from "./db";

// Types for extracted memories
interface ExtractedMemory {
  category: 'preference' | 'fact' | 'context' | 'instruction';
  content: string;
  importance: number;
}

interface ExtractionResult {
  memories: ExtractedMemory[];
  shouldExtract: boolean;
}

// System prompt for memory extraction
const EXTRACTION_PROMPT = `Eres un sistema de extracción de memoria. Tu tarea es analizar conversaciones entre un usuario y un asistente de IA para identificar información importante que debería recordarse a largo plazo.

CATEGORÍAS DE MEMORIA:
- preference: Preferencias del usuario (idioma, estilo de comunicación, formato de respuestas, temas de interés)
- fact: Hechos sobre el usuario (nombre, profesión, ubicación, habilidades, proyectos)
- context: Contexto relevante (objetivos actuales, proyectos en curso, situación laboral)
- instruction: Instrucciones específicas (cómo quiere que le respondan, qué evitar, reglas personalizadas)

REGLAS:
1. Solo extrae información EXPLÍCITAMENTE mencionada por el usuario
2. No inventes ni asumas información
3. Prioriza información que sea útil para futuras conversaciones
4. Evita información temporal o de una sola vez
5. La importancia va de 1 (baja) a 10 (alta)
6. Si no hay nada importante que recordar, devuelve un array vacío

RESPONDE SIEMPRE EN JSON con este formato exacto:
{
  "shouldExtract": true/false,
  "memories": [
    {
      "category": "preference|fact|context|instruction",
      "content": "Descripción concisa de la información",
      "importance": 1-10
    }
  ]
}

Si shouldExtract es false, el array memories debe estar vacío.`;

/**
 * Extract potential memories from a conversation exchange.
 * This function analyzes user messages to identify preferences, facts, and context.
 */
export async function extractMemoriesFromConversation(
  userId: number,
  userMessage: string,
  assistantResponse: string,
  chatId?: number
): Promise<ExtractedMemory[]> {
  try {
    // Skip extraction for very short messages or simple queries
    if (userMessage.length < 20 || isSimpleQuery(userMessage)) {
      return [];
    }

    // Build the extraction prompt
    const extractionMessages = [
      { role: 'system' as const, content: EXTRACTION_PROMPT },
      { 
        role: 'user' as const, 
        content: `Analiza esta conversación y extrae información importante para recordar:

MENSAJE DEL USUARIO:
${userMessage}

RESPUESTA DEL ASISTENTE:
${assistantResponse.substring(0, 500)}...

¿Hay información importante que debería recordarse para futuras conversaciones?` 
      },
    ];

    const result = await invokeLLM({ 
      messages: extractionMessages,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "memory_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              shouldExtract: { type: "boolean", description: "Whether there are memories to extract" },
              memories: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: { 
                      type: "string", 
                      enum: ["preference", "fact", "context", "instruction"],
                      description: "Category of the memory" 
                    },
                    content: { type: "string", description: "Content of the memory" },
                    importance: { type: "integer", description: "Importance from 1-10" }
                  },
                  required: ["category", "content", "importance"],
                  additionalProperties: false
                },
                description: "List of extracted memories"
              }
            },
            required: ["shouldExtract", "memories"],
            additionalProperties: false
          }
        }
      }
    });

    const responseContent = result.choices[0]?.message?.content;
    const textContent = typeof responseContent === 'string' 
      ? responseContent 
      : Array.isArray(responseContent) 
        ? responseContent.find(c => c.type === 'text')?.text || ''
        : '';

    // Parse the JSON response - clean markdown code blocks if present
    let cleanedContent = textContent.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    const parsed: ExtractionResult = JSON.parse(cleanedContent);

    if (!parsed.shouldExtract || !parsed.memories || parsed.memories.length === 0) {
      return [];
    }

    // Validate and filter extracted memories
    const validMemories = parsed.memories.filter(m => 
      m.content && 
      m.content.length > 5 && 
      m.content.length < 500 &&
      ['preference', 'fact', 'context', 'instruction'].includes(m.category) &&
      m.importance >= 1 && 
      m.importance <= 10
    );

    // Check for duplicates with existing memories
    const existingMemories = await getMemoriesByUserId(userId, true);
    const newMemories = await filterDuplicates(validMemories, existingMemories);

    // Save new memories to database
    for (const memory of newMemories) {
      await createMemory(userId, {
        category: memory.category,
        content: memory.content,
        source: 'auto',
        sourceChatId: chatId,
        importance: memory.importance
      });
    }

    return newMemories;
  } catch (error) {
    console.error('[MemoryExtraction] Error extracting memories:', error);
    return [];
  }
}

/**
 * Check if a message is a simple query that doesn't contain personal information
 */
function isSimpleQuery(message: string): boolean {
  const simplePatterns = [
    /^(hola|hi|hey|buenos días|buenas tardes|buenas noches)/i,
    /^(gracias|thanks|ok|vale|entendido|perfecto)/i,
    /^(sí|no|si|yes|no)/i,
    /^(qué|cómo|cuándo|dónde|por qué|cuál)\s/i,
    /^(explica|define|describe)\s/i,
  ];

  return simplePatterns.some(pattern => pattern.test(message.trim()));
}

/**
 * Filter out memories that are too similar to existing ones
 */
async function filterDuplicates(
  newMemories: ExtractedMemory[],
  existingMemories: Array<{ content: string; category: string }>
): Promise<ExtractedMemory[]> {
  const filtered: ExtractedMemory[] = [];

  for (const memory of newMemories) {
    const isDuplicate = existingMemories.some(existing => 
      isSimilar(memory.content, existing.content) ||
      (memory.category === existing.category && 
       memory.content.toLowerCase().includes(existing.content.toLowerCase().substring(0, 20)))
    );

    if (!isDuplicate) {
      filtered.push(memory);
    }
  }

  return filtered;
}

/**
 * Simple similarity check between two strings
 */
function isSimilar(str1: string, str2: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-záéíóúñ0-9]/g, '');
  const n1 = normalize(str1);
  const n2 = normalize(str2);
  
  // Check if one contains the other
  if (n1.includes(n2) || n2.includes(n1)) {
    return true;
  }

  // Simple Jaccard similarity on words
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);
  const words2Set = new Set(words2);
  
  const intersection = words1.filter(x => words2Set.has(x));
  const unionSet = new Set([...words1, ...words2]);
  
  const similarity = intersection.length / unionSet.size;
  return similarity > 0.7; // 70% similarity threshold
}

/**
 * Batch extract memories from a full conversation history
 * Useful for analyzing past conversations
 */
export async function extractMemoriesFromHistory(
  userId: number,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  chatId?: number
): Promise<ExtractedMemory[]> {
  const allExtracted: ExtractedMemory[] = [];

  // Process in pairs (user message + assistant response)
  for (let i = 0; i < messages.length - 1; i += 2) {
    const userMsg = messages[i];
    const assistantMsg = messages[i + 1];

    if (userMsg?.role === 'user' && assistantMsg?.role === 'assistant') {
      const extracted = await extractMemoriesFromConversation(
        userId,
        userMsg.content,
        assistantMsg.content,
        chatId
      );
      allExtracted.push(...extracted);
    }
  }

  return allExtracted;
}
