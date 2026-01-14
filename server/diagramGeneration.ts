import { invokeLLM } from "./_core/llm";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const execAsync = promisify(exec);

export type DiagramType = 'flowchart' | 'sequence' | 'erd' | 'class' | 'architecture' | 'mindmap';

export interface DiagramResult {
  type: DiagramType;
  code: string;
  format: 'mermaid' | 'd2' | 'plantuml';
  imagePath?: string;
  imageBase64?: string;
}

// Generate diagram code from natural language description
export async function generateDiagramCode(
  description: string,
  diagramType: DiagramType = 'flowchart'
): Promise<{ code: string; format: 'mermaid' | 'd2' | 'plantuml' }> {
  const typeInstructions: Record<DiagramType, string> = {
    flowchart: 'Create a flowchart showing the process flow with decision points',
    sequence: 'Create a sequence diagram showing interactions between components/actors',
    erd: 'Create an entity-relationship diagram showing database tables and relationships',
    class: 'Create a class diagram showing classes, properties, methods, and relationships',
    architecture: 'Create a system architecture diagram showing components and their connections',
    mindmap: 'Create a mind map showing hierarchical concepts branching from a central idea',
  };

  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a diagram specialist. Generate Mermaid diagram code based on the user's description.
        
Type requested: ${typeInstructions[diagramType]}

Rules:
- Use Mermaid syntax (it's the most widely supported)
- Keep the diagram clean and readable
- Use appropriate shapes and connections
- Include labels on connections where helpful
- For flowcharts, use proper decision diamonds and process rectangles
- For ERDs, show primary keys and relationships clearly

Return ONLY the Mermaid code, starting with the diagram type declaration (e.g., "flowchart TD", "sequenceDiagram", "erDiagram", etc.)
Do not include any markdown code blocks or explanations.`,
      },
      {
        role: "user",
        content: description,
      },
    ],
  });

  const code = result.choices[0]?.message?.content;
  
  return {
    code: typeof code === "string" ? code.trim() : '',
    format: 'mermaid',
  };
}

// Render diagram to image using manus-render-diagram utility
export async function renderDiagram(
  code: string,
  format: 'mermaid' | 'd2' | 'plantuml' = 'mermaid'
): Promise<{ imagePath: string; imageBase64: string }> {
  const tempDir = '/tmp/diagrams';
  const id = randomUUID();
  
  // Ensure temp directory exists
  await mkdir(tempDir, { recursive: true });
  
  // Determine file extension based on format
  const extensions: Record<string, string> = {
    mermaid: '.mmd',
    d2: '.d2',
    plantuml: '.puml',
  };
  
  const inputPath = join(tempDir, `${id}${extensions[format]}`);
  const outputPath = join(tempDir, `${id}.png`);
  
  try {
    // Write the diagram code to a file
    await writeFile(inputPath, code, 'utf-8');
    
    // Render using manus-render-diagram
    await execAsync(`manus-render-diagram "${inputPath}" "${outputPath}"`);
    
    // Read the generated image
    const imageBuffer = await readFile(outputPath);
    const imageBase64 = imageBuffer.toString('base64');
    
    // Clean up input file (keep output for potential reuse)
    await unlink(inputPath).catch(() => {});
    
    return {
      imagePath: outputPath,
      imageBase64,
    };
  } catch (error) {
    // Clean up on error
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
    
    throw new Error(`Error al renderizar el diagrama: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Full pipeline: generate and render diagram
export async function createDiagram(
  description: string,
  diagramType: DiagramType = 'flowchart'
): Promise<DiagramResult> {
  // Generate the diagram code
  const { code, format } = await generateDiagramCode(description, diagramType);
  
  if (!code) {
    throw new Error('No se pudo generar el código del diagrama');
  }
  
  try {
    // Render to image
    const { imagePath, imageBase64 } = await renderDiagram(code, format);
    
    return {
      type: diagramType,
      code,
      format,
      imagePath,
      imageBase64,
    };
  } catch (renderError) {
    // Return code even if rendering fails
    console.warn('[DiagramGeneration] Render failed, returning code only:', renderError);
    
    return {
      type: diagramType,
      code,
      format,
    };
  }
}

// Suggest diagram type based on description
export async function suggestDiagramType(description: string): Promise<DiagramType> {
  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Based on the user's description, determine the most appropriate diagram type.
Return ONLY one of these values: flowchart, sequence, erd, class, architecture, mindmap

- flowchart: For processes, workflows, algorithms, decision trees
- sequence: For interactions between systems, API calls, message flows
- erd: For database schemas, data models, entity relationships
- class: For object-oriented designs, class hierarchies, interfaces
- architecture: For system components, infrastructure, microservices
- mindmap: For brainstorming, concept organization, hierarchical ideas`,
      },
      {
        role: "user",
        content: description,
      },
    ],
  });

  const content = result.choices[0]?.message?.content;
  const suggested = (typeof content === 'string' ? content : '').trim().toLowerCase();
  const validTypes: DiagramType[] = ['flowchart', 'sequence', 'erd', 'class', 'architecture', 'mindmap'];
  
  return validTypes.includes(suggested as DiagramType) ? (suggested as DiagramType) : 'flowchart';
}
