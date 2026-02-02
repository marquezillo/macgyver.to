import { invokeLLM, invokeLLMStream, type Message } from "./_core/llm";
import { analyzeUrl } from "./urlAnalysis";
import { performDeepResearch } from "./deepResearch";
import { createDiagram } from "./diagramGeneration";
import { translateText } from "./ocrTranslation";
import { extractWebData, generateEnrichedPrompt } from "./webDataExtractor";
import { detectCloneIntent } from "./cloneIntentDetector";

export type AgentTool = 
  | 'web_search'
  | 'url_analysis'
  | 'clone_website'
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

// Mensajes amigables para cada herramienta (estilo Manus)
const FRIENDLY_MESSAGES: Record<AgentTool, { start: string; progress: string; complete: string }> = {
  web_search: {
    start: "🔍 Buscando información en internet...",
    progress: "Estoy revisando varias fuentes para encontrar la información más relevante.",
    complete: "He encontrado información útil de varias fuentes."
  },
  url_analysis: {
    start: "🌐 Visitando la página web...",
    progress: "Estoy analizando el contenido y estructura de la página.",
    complete: "He analizado la página y extraído la información principal."
  },
  clone_website: {
    start: "🎨 Analizando el diseño de la página...",
    progress: "Estoy extrayendo colores, tipografías, estructura y contenido para recrear el diseño.",
    complete: "He clonado el diseño de la página exitosamente."
  },
  diagram_generation: {
    start: "📊 Creando diagrama...",
    progress: "Estoy diseñando la estructura visual del diagrama.",
    complete: "He generado el diagrama."
  },
  translation: {
    start: "🌍 Traduciendo el texto...",
    progress: "Estoy traduciendo manteniendo el contexto y significado original.",
    complete: "He completado la traducción."
  },
  document_comparison: {
    start: "📄 Comparando documentos...",
    progress: "Estoy analizando las diferencias y similitudes entre los documentos.",
    complete: "He completado la comparación de documentos."
  },
  code_execution: {
    start: "💻 Generando código...",
    progress: "Estoy escribiendo el código necesario para la tarea.",
    complete: "He generado el código."
  },
  file_operations: {
    start: "📁 Procesando archivos...",
    progress: "Estoy trabajando con los archivos solicitados.",
    complete: "He completado la operación con los archivos."
  },
  final_answer: {
    start: "✨ Preparando la respuesta final...",
    progress: "Estoy organizando toda la información recopilada.",
    complete: "He completado la tarea."
  }
};

// Detectar si el mensaje requiere clonación de web
function detectCloneRequest(goal: string): { isClone: boolean; url: string | null } {
  const cloneIntent = detectCloneIntent(goal);
  return {
    isClone: cloneIntent.isCloneRequest,
    url: cloneIntent.url
  };
}

// Plan the steps needed to complete a task
async function planTask(goal: string): Promise<AgentStep[]> {
  // Primero verificar si es una solicitud de clonación
  const cloneCheck = detectCloneRequest(goal);
  if (cloneCheck.isClone && cloneCheck.url) {
    // Para clonación, usar un plan específico
    return [
      {
        id: 1,
        tool: 'clone_website' as const,
        input: `Clonar la página web: ${cloneCheck.url}`,
        status: 'pending' as const,
      },
      {
        id: 2,
        tool: 'final_answer' as const,
        input: 'Presentar el resultado de la clonación al usuario',
        status: 'pending' as const,
      }
    ];
  }

  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Eres un asistente de planificación de tareas. Divide el objetivo del usuario en pasos secuenciales.

Herramientas disponibles:
- web_search: Buscar información en internet
- url_analysis: Analizar una URL específica y extraer contenido
- clone_website: Clonar el diseño de una página web (usar cuando el usuario quiera copiar/replicar una web)
- diagram_generation: Crear diagramas (flowcharts, ERDs, etc.)
- translation: Traducir texto entre idiomas
- document_comparison: Comparar múltiples documentos
- code_execution: Generar código Python
- file_operations: Operaciones con archivos
- final_answer: Proporcionar la respuesta final al usuario

IMPORTANTE:
- Si el usuario menciona una URL y quiere "clonar", "copiar", "replicar" o crear algo "igual" o "similar", usa clone_website
- Siempre termina con final_answer para presentar los resultados
- Máximo 5 pasos para mantener la eficiencia

Devuelve un JSON con la estructura: { "steps": [{ "tool": "nombre", "input": "descripción" }] }`,
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
                    enum: ["web_search", "url_analysis", "clone_website", "diagram_generation", "translation", "document_comparison", "code_execution", "file_operations", "final_answer"]
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

// Execute a single step with timeout
async function executeStepWithTimeout(
  step: AgentStep,
  context: string,
  timeoutMs: number = 60000
): Promise<string> {
  const timeoutPromise = new Promise<string>((_, reject) => {
    setTimeout(() => reject(new Error('La operación tardó demasiado tiempo. Intentando continuar...')), timeoutMs);
  });

  const executionPromise = executeStep(step, context);
  
  return Promise.race([executionPromise, timeoutPromise]);
}

// Execute a single step
async function executeStep(
  step: AgentStep,
  context: string
): Promise<string> {
  switch (step.tool) {
    case 'web_search': {
      const research = await performDeepResearch(step.input);
      return `He encontrado información relevante:\n\n${research.summary}\n\n**Fuentes consultadas:** ${research.sources.slice(0, 3).map(s => s.title || s.url).join(', ')}`;
    }

    case 'url_analysis': {
      const urlMatch = step.input.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        const analysis = await analyzeUrl(urlMatch[0]);
        return `**${analysis.title}**\n\n${analysis.mainContent}\n\n**Puntos clave:** ${analysis.keyPoints.slice(0, 5).join(' • ')}`;
      }
      return 'No encontré una URL válida para analizar.';
    }

    case 'clone_website': {
      const urlMatch = step.input.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        try {
          // NUEVO: Solo extraer datos, NO generar landing
          // Los datos se pasan al sistema normal de generación
          const extractedData = await extractWebData(urlMatch[0]);
          
          // Formatear los datos extraídos para el contexto
          const colorsStr = `${extractedData.colors.primary}, ${extractedData.colors.secondary}, ${extractedData.colors.accent}`;
          const featuresCount = extractedData.content.features.length;
          const industryStr = extractedData.industry.patternName || 'general';
          
          // Generar el prompt enriquecido para el LLM
          const enrichedPrompt = generateEnrichedPrompt(extractedData, step.input);
          
          return `He analizado la página web exitosamente.\n\n**Datos extraídos:**\n- Industria detectada: ${industryStr}\n- Colores principales: ${colorsStr}\n- Características encontradas: ${featuresCount}\n- Testimonios: ${extractedData.content.testimonials.length}\n- Estilo: ${extractedData.style.darkMode ? 'Modo oscuro' : 'Modo claro'}\n\n__EXTRACTED_WEB_DATA__${JSON.stringify(extractedData)}__END_EXTRACTED_DATA__\n\n__ENRICHED_PROMPT__${enrichedPrompt}__END_ENRICHED_PROMPT__`;
        } catch (error) {
          console.error('[clone_website] Error extrayendo datos:', error);
          return `No pude analizar la página completamente. ${error instanceof Error ? error.message : 'Intenta con otra URL.'}`;
        }
      }
      return 'No encontré una URL válida para analizar.';
    }

    case 'diagram_generation': {
      const diagram = await createDiagram(step.input);
      return `He creado un diagrama de tipo ${diagram.type}:\n\n\`\`\`mermaid\n${diagram.code}\n\`\`\``;
    }

    case 'translation': {
      const targetLang = step.input.toLowerCase().includes('inglés') || step.input.toLowerCase().includes('english') 
        ? 'en' 
        : step.input.toLowerCase().includes('español') || step.input.toLowerCase().includes('spanish')
        ? 'es'
        : 'en';
      
      const translation = await translateText(context, targetLang);
      return `**Traducción (${translation.sourceLanguage} → ${translation.targetLanguage}):**\n\n${translation.translatedText}`;
    }

    case 'document_comparison': {
      return 'Para comparar documentos, necesito que los subas primero.';
    }

    case 'code_execution': {
      const codeResult = await invokeLLM({
        messages: [
          { role: "system", content: "Genera código Python limpio y comentado para la tarea. Solo devuelve el código." },
          { role: "user", content: `${step.input}\n\nContexto: ${context}` },
        ],
      });
      const code = codeResult.choices[0]?.message?.content;
      return `He generado el siguiente código:\n\n\`\`\`python\n${typeof code === 'string' ? code : '# No se pudo generar código'}\n\`\`\``;
    }

    case 'file_operations': {
      return `Operación de archivo procesada: ${step.input}`;
    }

    case 'final_answer': {
      const answerResult = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "Basándote en el contexto proporcionado, genera una respuesta final clara y útil en español. Usa formato markdown para mejor legibilidad. Sé conciso pero completo.",
          },
          {
            role: "user",
            content: `Tarea: ${step.input}\n\nContexto de pasos anteriores:\n${context}`,
          },
        ],
      });
      const answer = answerResult.choices[0]?.message?.content;
      return typeof answer === 'string' ? answer : 'Tarea completada.';
    }

    default:
      return `Herramienta no reconocida: ${step.tool}`;
  }
}

// Run an autonomous agent task (non-streaming version)
export async function runAutonomousTask(goal: string): Promise<AgentTask> {
  const task: AgentTask = {
    id: Date.now().toString(),
    goal,
    steps: [],
    status: 'planning',
    createdAt: new Date(),
  };

  task.steps = await planTask(goal);
  task.status = 'executing';

  let context = '';
  
  for (const step of task.steps) {
    step.status = 'running';
    step.startTime = new Date();

    try {
      const output = await executeStepWithTimeout(step, context);
      step.output = output;
      step.status = 'completed';
      context += `\n\n--- ${step.tool} ---\n${output}`;
    } catch (error) {
      step.output = `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`;
      step.status = 'failed';
    }

    step.endTime = new Date();
  }

  const lastStep = task.steps[task.steps.length - 1];
  task.result = lastStep?.output || 'Tarea completada';
  task.status = task.steps.some(s => s.status === 'failed') ? 'failed' : 'completed';
  task.completedAt = new Date();

  return task;
}

// Streaming version for real-time updates with friendly messages
export async function* runAutonomousTaskStream(
  goal: string
): AsyncGenerator<{ type: string; data: unknown }, void, unknown> {
  // Mensaje inicial amigable
  yield { 
    type: "status", 
    data: "🤔 Analizando tu solicitud y planificando los pasos necesarios..." 
  };

  // Verificar si es clonación primero
  const cloneCheck = detectCloneRequest(goal);
  
  // Plan the task
  const steps = await planTask(goal);
  
  // Mostrar el plan de forma amigable
  const planDescription = steps.map((s, i) => `${i + 1}. ${FRIENDLY_MESSAGES[s.tool]?.start || s.tool}`).join('\n');
  yield { 
    type: "plan_friendly", 
    data: `📋 **Mi plan de trabajo:**\n${planDescription}` 
  };
  
  yield { type: "plan", data: steps.map(s => ({ id: s.id, tool: s.tool, input: s.input })) };

  let context = '';
  let cloneData: unknown = null;

  for (const step of steps) {
    const friendlyMsg = FRIENDLY_MESSAGES[step.tool] || { start: 'Procesando...', progress: 'Trabajando...', complete: 'Completado' };
    
    // Mensaje de inicio amigable
    yield { 
      type: "status", 
      data: friendlyMsg.start 
    };
    
    yield { type: "step_start", data: { id: step.id, tool: step.tool, input: step.input } };

    try {
      // Mensaje de progreso
      yield { 
        type: "progress", 
        data: friendlyMsg.progress 
      };

      if (step.tool === 'final_answer') {
        yield { type: "status", data: "✨ Preparando tu respuesta final..." };
        
        // Si tenemos datos de clonación, incluirlos en el contexto
        const finalContext = cloneData 
          ? `${context}\n\n[DATOS DE CLONACIÓN DISPONIBLES - El usuario puede ver la landing clonada]`
          : context;
        
        const messages: Message[] = [
          {
            role: "system",
            content: `Eres un asistente amigable. Basándote en el contexto, genera una respuesta final clara y útil en español. 
            
Si se clonó una página web exitosamente, menciona:
- Que la landing está lista para ver
- Cuántas secciones se detectaron
- Que el usuario puede personalizarla

Usa formato markdown. Sé conciso pero informativo.`,
          },
          {
            role: "user",
            content: `Tarea: ${step.input}\n\nContexto:\n${finalContext}`,
          },
        ];

        for await (const chunk of invokeLLMStream({ messages })) {
          yield { type: "content", data: chunk };
        }

        yield { type: "step_complete", data: { id: step.id, status: "completed" } };
      } else {
        // Ejecutar paso con timeout
        const output = await executeStepWithTimeout(step, context, 90000);
        context += `\n\n--- ${step.tool} ---\n${output}`;
        
        // Extraer datos de clonación si existen
        const cloneMatch = output.match(/__CLONE_DATA__([\s\S]*?)__END_CLONE_DATA__/);
        if (cloneMatch) {
          try {
            cloneData = JSON.parse(cloneMatch[1]);
          } catch {
            // Ignorar error de parsing
          }
        }
        
        // Mensaje de completado amigable
        yield { 
          type: "status", 
          data: `✅ ${friendlyMsg.complete}` 
        };
        
        // Mostrar resumen del output (sin datos técnicos)
        const cleanOutput = output.replace(/__CLONE_DATA__[\s\S]*?__END_CLONE_DATA__/, '').trim();
        if (cleanOutput && step.tool !== 'clone_website') {
          yield { 
            type: "chunk", 
            data: `\n\n${cleanOutput.slice(0, 800)}${cleanOutput.length > 800 ? '...' : ''}\n\n` 
          };
        }
        
        yield { 
          type: "step_complete", 
          data: { 
            id: step.id, 
            status: "completed", 
            output: cleanOutput.slice(0, 300),
            cloneData: step.tool === 'clone_website' ? cloneData : undefined
          } 
        };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      yield { 
        type: "status", 
        data: `⚠️ Hubo un problema: ${errorMsg}. Continuando con el siguiente paso...` 
      };
      yield { 
        type: "step_complete", 
        data: { id: step.id, status: "failed", error: errorMsg } 
      };
    }
  }

  // Mensaje final
  yield { 
    type: "done", 
    data: { 
      stepsCompleted: steps.length,
      cloneData,
      message: cloneData ? "🎉 ¡Landing clonada exitosamente! Puedes verla y personalizarla." : "✅ Tarea completada"
    } 
  };
}

// Check if a request should trigger autonomous mode
// NOTA: La clonación de webs NO usa modo autónomo - usa el flujo normal del chat
// que tiene mejor integración con el sistema de plantillas y generación de landings
export function shouldUseAutonomousMode(message: string): boolean {
  // Primero verificar si es una solicitud de clonación/landing - NO usar modo autónomo
  const isCloneOrLandingRequest = /(?:clona|copia|replica|imita|duplica|igual|parecida|similar|landing|página web|web|sitio)/i.test(message) && 
                                   /https?:\/\/[^\s]+/i.test(message);
  
  // Si es clonación, usar el flujo normal del chat (que tiene el sistema de plantillas)
  if (isCloneOrLandingRequest) {
    console.log('[AutonomousMode] Detected clone/landing request - using normal chat flow instead');
    return false;
  }
  
  const autonomousTriggers = [
    // Investigación y creación (sin URLs)
    /investiga.*y.*(?:crea|genera|escribe)/i,
    /busca.*(?:información|datos).*(?:y|para).*(?:crear|generar|analizar)/i,
    /analiza.*(?:y|para).*(?:crear|generar|resumir)/i,
    /(?:crea|genera).*(?:basado en|usando).*(?:investigación|búsqueda)/i,
    
    // Modo autónomo explícito
    /paso a paso/i,
    /automáticamente/i,
    /sin intervención/i,
    /agente/i,
    
    // Solo análisis de URLs (sin clonación/landing)
    /(?:analiza|extrae|scrape|scrapea).*https?:\/\//i,
    /(?:captura|screenshot|pantallazo).*(?:de|la)?.*https?:\/\//i,
  ];

  return autonomousTriggers.some(pattern => pattern.test(message));
}
