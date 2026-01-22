import { invokeLLM, invokeLLMStream, type Message } from "./_core/llm";
import { analyzeUrl } from "./urlAnalysis";
import { performDeepResearch } from "./deepResearch";
import { createDiagram } from "./diagramGeneration";
import { translateText, detectLanguage } from "./ocrTranslation";
import { compareDocuments, type DocumentInfo } from "./documentComparison";

export type AgentTool = 
  | 'web_search'
  | 'url_analysis'
  | 'diagram_generation'
  | 'translation'
  | 'document_comparison'
  | 'code_execution'
  | 'file_operations'
  | 'final_answer';

export interface AgentStep {
  id: number;
  tool: AgentTool;
  input: string;
  output?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
}

export interface AgentTask {
  id: string;
  goal: string;
  steps: AgentStep[];
  status: 'planning' | 'executing' | 'completed' | 'failed';
  result?: string;
  createdAt: Date;
  completedAt?: Date;
}

// Plan the steps needed to complete a task
async function planTask(goal: string): Promise<AgentStep[]> {
  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a task planning AI. Break down the user's goal into a sequence of steps.

Available tools:
- web_search: Search the web for information
- url_analysis: Analyze a specific URL and extract content
- diagram_generation: Create diagrams (flowcharts, ERDs, etc.)
- translation: Translate text between languages
- document_comparison: Compare multiple documents
- code_execution: Execute Python code
- file_operations: Read/write files
- final_answer: Provide the final response to the user

Return a JSON array of steps. Each step has:
- tool: The tool to use
- input: Description of what to do with the tool

Keep the plan focused and efficient. Maximum 10 steps.`,
      },
      {
        role: "user",
        content: goal,
      },
    ],
    responseFormat: {
      type: "json_schema",
      json_schema: {
        name: "task_plan",
        strict: true,
        schema: {
          type: "object",
          properties: {
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tool: { 
                    type: "string",
                    enum: ["web_search", "url_analysis", "diagram_generation", "translation", "document_comparison", "code_execution", "file_operations", "final_answer"]
                  },
                  input: { type: "string" },
                },
                required: ["tool", "input"],
                additionalProperties: false,
              },
            },
          },
          required: ["steps"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = result.choices[0]?.message?.content;
    const parsed = JSON.parse(typeof content === "string" ? content : "{}");
    
    return (parsed.steps || []).map((step: { tool: AgentTool; input: string }, index: number) => ({
      id: index + 1,
      tool: step.tool,
      input: step.input,
      status: 'pending' as const,
    }));
  } catch {
    return [{
      id: 1,
      tool: 'final_answer' as const,
      input: goal,
      status: 'pending' as const,
    }];
  }
}

// Execute a single step
async function executeStep(
  step: AgentStep,
  context: string
): Promise<string> {
  switch (step.tool) {
    case 'web_search': {
      const research = await performDeepResearch(step.input);
      return `Búsqueda completada:\n${research.summary}\n\nFuentes: ${research.sources.map(s => s.url).join(', ')}`;
    }

    case 'url_analysis': {
      // Extract URL from input
      const urlMatch = step.input.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        const analysis = await analyzeUrl(urlMatch[0]);
        return `Análisis de ${analysis.title}:\n${analysis.mainContent}\n\nPuntos clave: ${analysis.keyPoints.join(', ')}`;
      }
      return 'No se encontró URL válida en la entrada';
    }

    case 'diagram_generation': {
      const diagram = await createDiagram(step.input);
      return `Diagrama generado (${diagram.type}):\n\`\`\`mermaid\n${diagram.code}\n\`\`\``;
    }

    case 'translation': {
      // Detect target language from input
      const targetLang = step.input.toLowerCase().includes('inglés') || step.input.toLowerCase().includes('english') 
        ? 'en' 
        : step.input.toLowerCase().includes('español') || step.input.toLowerCase().includes('spanish')
        ? 'es'
        : 'en';
      
      const translation = await translateText(context, targetLang);
      return `Traducción (${translation.sourceLanguage} → ${translation.targetLanguage}):\n${translation.translatedText}`;
    }

    case 'document_comparison': {
      // This would need documents to be passed in context
      return 'Comparación de documentos requiere documentos cargados previamente';
    }

    case 'code_execution': {
      // For security, we'll generate code but not execute it automatically
      const codeResult = await invokeLLM({
        messages: [
          { role: "system", content: "Generate Python code to accomplish the task. Return only the code." },
          { role: "user", content: `${step.input}\n\nContext: ${context}` },
        ],
      });
      const code = codeResult.choices[0]?.message?.content;
      return `Código generado:\n\`\`\`python\n${typeof code === 'string' ? code : ''}\n\`\`\``;
    }

    case 'file_operations': {
      return `Operación de archivo: ${step.input}`;
    }

    case 'final_answer': {
      const answerResult = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "Based on the context provided, generate a comprehensive final answer in Spanish.",
          },
          {
            role: "user",
            content: `Task: ${step.input}\n\nContext from previous steps:\n${context}`,
          },
        ],
      });
      const answer = answerResult.choices[0]?.message?.content;
      return typeof answer === 'string' ? answer : 'No se pudo generar respuesta';
    }

    default:
      return `Herramienta desconocida: ${step.tool}`;
  }
}

// Run an autonomous agent task
export async function runAutonomousTask(goal: string): Promise<AgentTask> {
  const task: AgentTask = {
    id: Date.now().toString(),
    goal,
    steps: [],
    status: 'planning',
    createdAt: new Date(),
  };

  // Plan the task
  task.steps = await planTask(goal);
  task.status = 'executing';

  // Execute each step
  let context = '';
  
  for (const step of task.steps) {
    step.status = 'running';
    step.startTime = new Date();

    try {
      const output = await executeStep(step, context);
      step.output = output;
      step.status = 'completed';
      context += `\n\n--- Step ${step.id} (${step.tool}) ---\n${output}`;
    } catch (error) {
      step.output = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      step.status = 'failed';
    }

    step.endTime = new Date();
  }

  // Get final result from last step
  const lastStep = task.steps[task.steps.length - 1];
  task.result = lastStep?.output || 'Tarea completada sin resultado';
  task.status = task.steps.some(s => s.status === 'failed') ? 'failed' : 'completed';
  task.completedAt = new Date();

  return task;
}

// Streaming version for real-time updates
export async function* runAutonomousTaskStream(
  goal: string
): AsyncGenerator<{ type: string; data: unknown }, void, unknown> {
  yield { type: "status", data: "Planificando tarea..." };

  // Plan the task
  const steps = await planTask(goal);
  yield { type: "plan", data: steps.map(s => ({ id: s.id, tool: s.tool, input: s.input })) };

  let context = '';

  for (const step of steps) {
    yield { type: "step_start", data: { id: step.id, tool: step.tool, input: step.input } };

    try {
      // For final_answer, stream the response
      if (step.tool === 'final_answer') {
        yield { type: "status", data: "Generando respuesta final..." };
        
        const messages: Message[] = [
          {
            role: "system",
            content: "Based on the context provided, generate a comprehensive final answer in Spanish. Use markdown formatting.",
          },
          {
            role: "user",
            content: `Task: ${step.input}\n\nContext from previous steps:\n${context}`,
          },
        ];

        for await (const chunk of invokeLLMStream({ messages })) {
          yield { type: "content", data: chunk };
        }

        yield { type: "step_complete", data: { id: step.id, status: "completed" } };
      } else {
        const output = await executeStep(step, context);
        context += `\n\n--- Step ${step.id} (${step.tool}) ---\n${output}`;
        
        yield { type: "step_complete", data: { id: step.id, status: "completed", output: output.slice(0, 500) } };
      }
    } catch (error) {
      yield { type: "step_complete", data: { id: step.id, status: "failed", error: error instanceof Error ? error.message : 'Error' } };
    }
  }

  yield { type: "done", data: { stepsCompleted: steps.length } };
}

// Check if a request should trigger autonomous mode
export function shouldUseAutonomousMode(message: string): boolean {
  const autonomousTriggers = [
    // Investigación y creación
    /investiga.*y.*(?:crea|genera|escribe)/i,
    /busca.*(?:información|datos).*(?:y|para).*(?:crear|generar|analizar)/i,
    /analiza.*(?:y|para).*(?:crear|generar|resumir)/i,
    /(?:crea|genera).*(?:basado en|usando).*(?:investigación|búsqueda)/i,
    
    // Modo autónomo explícito
    /paso a paso/i,
    /automáticamente/i,
    /sin intervención/i,
    /agente/i,
    
    // Acceso a URLs y clonación de páginas
    /(?:entra|accede|ve|visita|abre)\s+(?:a|en)?\s*(?:la)?\s*(?:página|web|url)?\s*https?:\/\//i,
    /(?:clona|copia|replica|imita|duplica).*(?:página|web|landing|sitio)/i,
    /(?:clona|copia|replica).*https?:\/\//i,
    /https?:\/\/.*(?:clona|copia|replica|igual|parecida|similar)/i,
    /(?:hazme|créame|genera).*(?:igual|parecida|similar|como).*https?:\/\//i,
    /(?:analiza|extrae|scrape|scrapea).*https?:\/\//i,
    /(?:captura|screenshot|pantallazo).*(?:de|la)?.*https?:\/\//i,
  ];
  
  // También detectar si hay una URL y palabras clave de acción
  const hasUrl = /https?:\/\/[^\s]+/i.test(message);
  const hasActionKeyword = /(?:clona|copia|replica|analiza|extrae|entra|accede|visita|abre|scrape|captura|igual|parecida|similar)/i.test(message);
  
  if (hasUrl && hasActionKeyword) {
    return true;
  }

  return autonomousTriggers.some(pattern => pattern.test(message));
}
