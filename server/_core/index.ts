import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { invokeLLMStream } from "./llm";
import { sdk } from "./sdk";
import { ENV } from "./env";
import { performDeepResearchStream } from "../deepResearch";
import { storagePut } from "../storage";
import { generateImage } from "./imageGeneration";
import { generateChatImage } from "../imageSearch";
import { getMemoriesForContext, getUserByOpenId, createFormSubmission } from "../db";
import { extractMemoriesFromConversation } from "../memoryExtraction";
import { analyzeUrlStream } from "../urlAnalysis";
import { extractTextFromImage, translateTextStream, detectLanguage } from "../ocrTranslation";
import { enrichLandingWithImages } from "../landingImageEnricher";
import { createDiagram, suggestDiagramType } from "../diagramGeneration";
import { compareDocumentsStream } from "../documentComparison";
import { summarizeVideoStream } from "../videoSummary";
import { runAutonomousTaskStream, shouldUseAutonomousMode } from "../autonomousAgents";
import { SYSTEM_PROMPT } from "../systemPrompt";
import { subdomainMiddleware } from "../subdomainMiddleware";
import subdomainRouter, { handleSubdomainRequest } from "../subdomainRouter";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 16 * 1024 * 1024 }, // 16MB limit
});

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// SYSTEM_PROMPT is now imported from ../systemPrompt.ts

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // Middleware para detectar subdominios
  app.use(subdomainMiddleware);
  
  // Router para APIs de subdominios
  app.use(subdomainRouter);
  
  // Handler para requests de subdominios (antes de otras rutas)
  app.use(handleSubdomainRequest);
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Streaming AI endpoint (SSE)
  app.post("/api/ai/stream", async (req, res) => {
    try {
      // Verify authentication (skip in standalone mode)
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        user = null;
      }
      
      // In standalone mode, create a default user if not authenticated
      if (!user && ENV.standaloneMode) {
        user = { id: "standalone-user", openId: "standalone-user", name: "Usuario", role: "admin" as const };
      }
      
      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { messages } = req.body as { messages: Array<{ role: 'user' | 'assistant'; content: string }> };
      
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "Messages array required" });
        return;
      }

      // Set SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      // Check if the last user message should trigger autonomous mode
      const lastUserMessageContent = messages.filter(m => m.role === 'user').pop()?.content || '';
      console.log('[AI Stream] Checking autonomous mode for message:', lastUserMessageContent.substring(0, 150));
      const shouldUseAutonomous = shouldUseAutonomousMode(lastUserMessageContent);
      console.log('[AI Stream] shouldUseAutonomousMode result:', shouldUseAutonomous);
      if (shouldUseAutonomous) {
        console.log('[AI Stream] Autonomous mode triggered for:', lastUserMessageContent.substring(0, 100));
        res.write(`data: ${JSON.stringify({ type: "status", content: "🚀 Iniciando tarea autónoma..." })}\n\n`);
        
        try {
          let cloneData: unknown = null;
          
          for await (const event of runAutonomousTaskStream(lastUserMessageContent)) {
            const eventData = event.data as { 
              tool?: string; 
              output?: string; 
              message?: string;
              cloneData?: unknown;
            } | string | undefined;
            
            // Handle different event types with friendly messages
            switch (event.type) {
              case 'status':
              case 'progress':
                // Mensajes de estado amigables
                res.write(`data: ${JSON.stringify({ type: "status", content: typeof eventData === 'string' ? eventData : (eventData as { message?: string })?.message || 'Procesando...' })}\n\n`);
                break;
                
              case 'plan_friendly':
                // Mostrar el plan de forma amigable
                res.write(`data: ${JSON.stringify({ type: "chunk", content: `${typeof eventData === 'string' ? eventData : ''}\n\n` })}\n\n`);
                break;
                
              case 'step_start':
                // No mostrar nada técnico, los status ya lo cubren
                break;
                
              case 'step_complete':
                // Guardar datos de clonación si existen
                if (typeof eventData === 'object' && eventData?.cloneData) {
                  cloneData = eventData.cloneData;
                }
                break;
                
              case 'chunk':
                // Contenido de texto directo
                const chunkContent = typeof eventData === 'string' ? eventData : (eventData as { data?: string })?.data || '';
                if (chunkContent) {
                  res.write(`data: ${JSON.stringify({ type: "chunk", content: chunkContent })}\n\n`);
                }
                break;
                
              case 'content':
                // Streaming de respuesta final
                res.write(`data: ${JSON.stringify({ type: "chunk", content: typeof eventData === 'string' ? eventData : '' })}\n\n`);
                break;
                
              case 'done':
                const doneData = eventData as { message?: string; cloneData?: unknown } | undefined;
                if (doneData?.cloneData) {
                  cloneData = doneData.cloneData;
                }
                
                // Si hay datos de clonación, enviar como landing
                if (cloneData) {
                  res.write(`data: ${JSON.stringify({ 
                    type: "done", 
                    content: doneData?.message || "✅ Tarea completada",
                    hasArtifact: true,
                    isLanding: true,
                    landingData: cloneData
                  })}\n\n`);
                } else {
                  res.write(`data: ${JSON.stringify({ 
                    type: "done", 
                    content: doneData?.message || "✅ Tarea completada",
                    hasArtifact: false 
                  })}\n\n`);
                }
                break;
                
              case 'error':
                res.write(`data: ${JSON.stringify({ type: "chunk", content: `\n\n⚠️ ${typeof eventData === 'string' ? eventData : 'Error en la tarea'}\n\n` })}\n\n`);
                break;
            }
          }
          res.end();
          return;
        } catch (autonomousError) {
          console.error('[AI Stream] Autonomous mode error:', autonomousError);
          res.write(`data: ${JSON.stringify({ type: "chunk", content: "\n\n⚠️ Hubo un problema con la tarea autónoma. Intentando de otra forma...\n\n" })}\n\n`);
          // Fall through to normal LLM response
        }
      }

      // Get user's long-term memory context
      let memoryContext = '';
      if (user.openId) {
        const dbUser = await getUserByOpenId(user.openId);
        if (dbUser) {
          const memories = await getMemoriesForContext(dbUser.id);
          memoryContext = memories.map(m => `- ${m.content}`).join('\n');
        }
      }

      // Check for multi-page request
      let multiPageEnrichment = '';
      const { detectMultiPageRequest, enrichPromptForMultiPage } = await import('../multiPageDetector');
      const multiPageDetection = detectMultiPageRequest(lastUserMessageContent);
      
      if (multiPageDetection.isMultiPage) {
        console.log('[AI Stream] Multi-page request detected:', multiPageDetection.requestedPages.map(p => p.slug));
        res.write(`data: ${JSON.stringify({ type: "status", content: "📄 Detectadas múltiples páginas: " + multiPageDetection.requestedPages.map(p => p.title).join(', ') })}
\n`);
        multiPageEnrichment = multiPageDetection.llmInstructions;
      }

      // Check if this is a clone/replica request and enrich prompt with web data
      let cloneEnrichment = '';
      const { detectCloneIntent } = await import('../cloneIntentDetector');
      const cloneIntent = detectCloneIntent(lastUserMessageContent);
      
      if (cloneIntent.isCloneRequest && cloneIntent.url) {
        console.log('[AI Stream] Clone request detected for URL:', cloneIntent.url);
        res.write(`data: ${JSON.stringify({ type: "status", content: "🌐 Analizando la página web de referencia..." })}\n\n`);
        
        try {
          const { extractWebDataEnhanced, generateEnhancedPrompt } = await import('../webDataExtractorEnhanced');
          const { detectCloningLevel, generateCloningInstructions } = await import('../cloningLevels');
          
          // Detect cloning level from user message
          const cloningLevel = detectCloningLevel(lastUserMessageContent);
          console.log('[AI Stream] Cloning level detected:', cloningLevel);
          
          res.write(`data: ${JSON.stringify({ type: "status", content: "🎨 Extrayendo colores, tipografía y estructura..." })}\n\n`);
          
          // Extract web data
          const webData = await extractWebDataEnhanced(cloneIntent.url, cloningLevel);
          
          if (webData) {
            res.write(`data: ${JSON.stringify({ type: "status", content: "✨ Preparando instrucciones de clonación..." })}\n\n`);
            
            // Generate enriched prompt with cloning instructions
            cloneEnrichment = generateEnhancedPrompt(webData, lastUserMessageContent);
            
            // Add cloning level specific instructions
            const { getCloningConfig } = await import('../cloningLevels');
            const cloningConfig = getCloningConfig(cloningLevel);
            const levelInstructions = generateCloningInstructions(cloningLevel, webData, cloningConfig);
            cloneEnrichment += '\n\n' + levelInstructions;
            
            console.log('[AI Stream] Clone enrichment generated, length:', cloneEnrichment.length);
          }
        } catch (cloneError) {
          console.error('[AI Stream] Clone extraction error:', cloneError);
          res.write(`data: ${JSON.stringify({ type: "status", content: "⚠️ No pude analizar la web, crearé una landing basada en tu descripción" })}\n\n`);
        }
      }

      // Build conversation history for LLM with memory context, clone enrichment, and multi-page instructions
      const systemPromptWithMemory = SYSTEM_PROMPT + memoryContext + cloneEnrichment + multiPageEnrichment;
      const llmMessages = [
        { role: 'system' as const, content: systemPromptWithMemory },
        ...messages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ];

      let fullContent = "";

      // Stream the response
      for await (const chunk of invokeLLMStream({ messages: llmMessages })) {
        fullContent += chunk;
        res.write(`data: ${JSON.stringify({ type: "chunk", content: chunk })}\n\n`);
      }

      // Check if response contains landing page JSON
      let hasArtifact = false;
      let artifactData = null;
      let displayMessage = fullContent;

      try {
        // First try to extract JSON from markdown code blocks
        const codeBlockMatch = fullContent.match(/```(?:json)?\s*([\s\S]*?)```/);
        let jsonString = '';
        
        if (codeBlockMatch) {
          jsonString = codeBlockMatch[1].trim();
        } else {
          // Fallback: try to find raw JSON
          const jsonMatch = fullContent.match(/\{[\s\S]*"type"\s*:\s*"landing"[\s\S]*\}/);
          if (jsonMatch) {
            jsonString = jsonMatch[0];
          }
        }
        
        if (jsonString) {
          const parsed = JSON.parse(jsonString);
          if (parsed?.type === 'landing') {
            hasArtifact = true;
            
            // Enriquecer las secciones con imágenes automáticas
            console.log('[AI Stream] Enriching landing with images...');
            res.write(`data: ${JSON.stringify({ type: "status", content: "Buscando imágenes para tu landing..." })}\n\n`);
            
            try {
              const businessType = parsed.businessType || 'business';
              const businessName = parsed.businessName || 'Company';
              const enrichedSections = await enrichLandingWithImages(
                parsed.sections,
                businessType,
                businessName
              );
              artifactData = { sections: enrichedSections };
              console.log('[AI Stream] Landing enriched with images successfully');
            } catch (enrichError) {
              console.error('[AI Stream] Error enriching landing with images:', enrichError);
              // Usar las secciones originales si falla el enriquecimiento
              artifactData = { sections: parsed.sections };
            }
            
            // Use the message from JSON or generate a friendly message
            displayMessage = parsed.message || 'He creado tu landing page con imágenes. Puedes ver el preview a la derecha y editar las secciones haciendo clic en ellas.';
          }
        }
      } catch (parseError) {
        console.error('[AI Stream] JSON parse error:', parseError);
        // Not a JSON response, keep original content
      }

      // Extract memories in the background (non-blocking)
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      if (lastUserMessage && user.openId) {
        const memoryUser = await getUserByOpenId(user.openId);
        if (memoryUser?.id) {
          extractMemoriesFromConversation(
            memoryUser.id,
            lastUserMessage.content,
            displayMessage
          ).catch(err => console.error('[MemoryExtraction] Background extraction failed:', err));
        }
      }

      // Log artifact data for debugging
      console.log('[AI Stream] hasArtifact:', hasArtifact);
      if (artifactData) {
        console.log('[AI Stream] artifactData sections count:', artifactData.sections?.length || 0);
        // Log hero section to verify images
        const heroSection = artifactData.sections?.find((s: any) => s.type === 'hero');
        if (heroSection) {
          console.log('[AI Stream] Hero section imageUrl:', heroSection.content?.imageUrl);
          console.log('[AI Stream] Hero section backgroundImage:', heroSection.content?.backgroundImage);
        }
      }

      // Send final message with metadata
      const doneEvent = { type: "done", content: displayMessage, hasArtifact, artifactData };
      const doneEventStr = JSON.stringify(doneEvent);
      console.log("[AI Stream] Sending done event with", artifactData?.sections?.length || 0, "sections");
      console.log("[AI Stream] Done event string length:", doneEventStr.length);
      console.log("[AI Stream] Done event preview:", doneEventStr.substring(0, 500));
      res.write(`data: ${doneEventStr}\n\n`);
      
      res.end();
    } catch (error) {
      console.error("Streaming error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      } else {
        res.write(`data: ${JSON.stringify({ type: "error", error: "Stream error" })}\n\n`);
        res.end();
      }
    }
  });

  // File upload endpoint
  app.post("/api/files/upload", upload.single("file"), async (req, res) => {
    try {
      // Verify authentication
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        user = null;
      }
      if (!user && ENV.standaloneMode) {
        user = { id: "standalone-user", openId: "standalone-user", name: "Usuario", role: "admin" as const };
      }
      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      // Generate unique filename
      const ext = file.originalname.split(".").pop() || "bin";
      const filename = `uploads/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      // Upload to S3
      const { url } = await storagePut(filename, file.buffer, file.mimetype);

      res.json({
        url,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Debug endpoint to verify frontend code execution
  app.post("/api/debug-log", (req, res) => {
    console.log('[DEBUG-LOG] Frontend message:', JSON.stringify(req.body));
    res.json({ success: true });
  });

  // Image generation endpoint
  app.post("/api/generate-image", async (req, res) => {
    try {
      // Verify authentication
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        user = null;
      }
      if (!user && ENV.standaloneMode) {
        user = { id: "standalone-user", openId: "standalone-user", name: "Usuario", role: "admin" as const };
      }
      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { prompt } = req.body as { prompt: string };
      
      if (!prompt || typeof prompt !== "string") {
        res.status(400).json({ error: "Prompt string required" });
        return;
      }

      console.log("[Image Generation] Generating image for prompt:", prompt);

      // Usar el sistema híbrido: Pollinations.ai primero, luego Gemini, luego DALL-E
      let imageUrl = await generateChatImage(prompt);
      
      // Fallback a DALL-E si el sistema híbrido falla
      if (!imageUrl) {
        console.log("[Image Generation] Hybrid system failed, falling back to DALL-E");
        const result = await generateImage({ prompt });
        imageUrl = result.url || null;
      }
      
      if (!imageUrl) {
        throw new Error("No se pudo generar la imagen");
      }
      
      console.log("[Image Generation] Image generated successfully:", imageUrl);

      res.json({
        success: true,
        url: imageUrl,
      });
    } catch (error) {
      console.error("Image generation error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to generate image" 
      });
    }
  });

  // File analysis endpoint (SSE)
  app.post("/api/files/analyze", async (req, res) => {
    try {
      // Verify authentication
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        user = null;
      }
      if (!user && ENV.standaloneMode) {
        user = { id: "standalone-user", openId: "standalone-user", name: "Usuario", role: "admin" as const };
      }
      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { fileUrl, mimeType, prompt } = req.body as { fileUrl: string; mimeType: string; prompt?: string };
      
      if (!fileUrl || !mimeType) {
        res.status(400).json({ error: "fileUrl and mimeType required" });
        return;
      }

      // Set SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      // Build message with file content based on type
      const userPrompt = prompt || "Analiza este archivo y describe su contenido de forma detallada.";
      
      let messageContent: any[];
      
      if (mimeType.startsWith("image/")) {
        // Image analysis
        messageContent = [
          { type: "text", text: userPrompt },
          { type: "image_url", image_url: { url: fileUrl, detail: "high" } }
        ];
      } else if (mimeType === "application/pdf") {
        // PDF analysis
        messageContent = [
          { type: "text", text: userPrompt },
          { type: "file_url", file_url: { url: fileUrl, mime_type: "application/pdf" } }
        ];
      } else {
        // Other file types - just describe
        messageContent = [
          { type: "text", text: `${userPrompt}\n\nArchivo: ${fileUrl}\nTipo: ${mimeType}` }
        ];
      }

      const llmMessages = [
        { role: 'system' as const, content: 'Eres un asistente experto en análisis de documentos e imágenes. Proporciona análisis detallados y útiles.' },
        { role: 'user' as const, content: messageContent }
      ];

      let fullContent = "";

      // Stream the response
      for await (const chunk of invokeLLMStream({ messages: llmMessages })) {
        fullContent += chunk;
        res.write(`data: ${JSON.stringify({ type: "chunk", content: chunk })}\n\n`);
      }

      // Send final message
      res.write(`data: ${JSON.stringify({ type: "done", content: fullContent })}\n\n`);
      res.end();
    } catch (error) {
      console.error("File analysis error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      } else {
        res.write(`data: ${JSON.stringify({ type: "error", error: "Analysis error" })}\n\n`);
        res.end();
      }
    }
  });

  // Deep Research streaming endpoint (SSE)
  app.post("/api/research/stream", async (req, res) => {
    try {
      // Verify authentication
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        user = null;
      }
      if (!user && ENV.standaloneMode) {
        user = { id: "standalone-user", openId: "standalone-user", name: "Usuario", role: "admin" as const };
      }
      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { question } = req.body as { question: string };
      
      if (!question || typeof question !== "string") {
        res.status(400).json({ error: "Question string required" });
        return;
      }

      // Set SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      // Stream the research
      for await (const event of performDeepResearchStream(question)) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
      
      res.end();
    } catch (error) {
      console.error("Research streaming error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      } else {
        res.write(`data: ${JSON.stringify({ type: "error", data: "Research error" })}\n\n`);
        res.end();
      }
    }
  });

  // Code execution endpoint (simulated Python execution with LLM)
  app.post("/api/code/execute", async (req, res) => {
    try {
      // Verify authentication
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        user = null;
      }
      if (!user && ENV.standaloneMode) {
        user = { id: "standalone-user", openId: "standalone-user", name: "Usuario", role: "admin" as const };
      }
      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { code, language } = req.body as { code: string; language?: string };
      
      if (!code || typeof code !== "string") {
        res.status(400).json({ error: "Code string required" });
        return;
      }

      const lang = language || "python";

      // Set SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      // Send status
      res.write(`data: ${JSON.stringify({ type: "status", message: "Analizando código..." })}\n\n`);

      // Use LLM to simulate code execution
      const llmMessages = [
        { 
          role: 'system' as const, 
          content: `Eres un intérprete de ${lang}. Cuando el usuario te dé código, debes:
1. Analizar el código
2. Simular su ejecución paso a paso
3. Mostrar el output exacto que produciría
4. Si hay errores, mostrar el traceback

Responde SOLO con el output del código, como si fueras una terminal. No expliques nada, solo muestra el resultado de la ejecución.`
        },
        { role: 'user' as const, content: `Ejecuta este código ${lang}:\n\n\`\`\`${lang}\n${code}\n\`\`\`` }
      ];

      res.write(`data: ${JSON.stringify({ type: "status", message: "Ejecutando..." })}\n\n`);

      let fullOutput = "";

      // Stream the response
      for await (const chunk of invokeLLMStream({ messages: llmMessages })) {
        fullOutput += chunk;
        res.write(`data: ${JSON.stringify({ type: "output", content: chunk })}\n\n`);
      }

      // Send completion
      res.write(`data: ${JSON.stringify({ type: "done", output: fullOutput })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Code execution error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      } else {
        res.write(`data: ${JSON.stringify({ type: "error", error: "Execution error" })}\n\n`);
        res.end();
      }
    }
  });

  // URL Analysis endpoint (SSE)
  app.post("/api/url/analyze", async (req, res) => {
    try {
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        user = null;
      }
      if (!user && ENV.standaloneMode) {
        user = { id: "standalone-user", openId: "standalone-user", name: "Usuario", role: "admin" as const };
      }
      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { url } = req.body as { url: string };
      if (!url || typeof url !== "string") {
        res.status(400).json({ error: "URL string required" });
        return;
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      for await (const event of analyzeUrlStream(url)) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
      res.end();
    } catch (error) {
      console.error("URL analysis error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      } else {
        res.write(`data: ${JSON.stringify({ type: "error", data: "Analysis error" })}\n\n`);
        res.end();
      }
    }
  });

  // OCR endpoint
  app.post("/api/ocr/extract", upload.single("image"), async (req, res) => {
    try {
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        user = null;
      }
      if (!user && ENV.standaloneMode) {
        user = { id: "standalone-user", openId: "standalone-user", name: "Usuario", role: "admin" as const };
      }
      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "Image file required" });
        return;
      }

      const imageBase64 = file.buffer.toString("base64");
      const result = await extractTextFromImage(imageBase64, file.mimetype);
      res.json(result);
    } catch (error) {
      console.error("OCR error:", error);
      res.status(500).json({ error: "OCR extraction failed" });
    }
  });

  // Translation endpoint (SSE)
  app.post("/api/translate/stream", async (req, res) => {
    try {
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        user = null;
      }
      if (!user && ENV.standaloneMode) {
        user = { id: "standalone-user", openId: "standalone-user", name: "Usuario", role: "admin" as const };
      }
      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { text, targetLanguage } = req.body as { text: string; targetLanguage: string };
      if (!text || !targetLanguage) {
        res.status(400).json({ error: "text and targetLanguage required" });
        return;
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      for await (const event of translateTextStream(text, targetLanguage)) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
      res.end();
    } catch (error) {
      console.error("Translation error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      } else {
        res.write(`data: ${JSON.stringify({ type: "error", data: "Translation error" })}\n\n`);
        res.end();
      }
    }
  });

  // Diagram generation endpoint
  app.post("/api/diagram/generate", async (req, res) => {
    try {
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        user = null;
      }
      if (!user && ENV.standaloneMode) {
        user = { id: "standalone-user", openId: "standalone-user", name: "Usuario", role: "admin" as const };
      }
      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { description, type } = req.body as { description: string; type?: string };
      if (!description) {
        res.status(400).json({ error: "Description required" });
        return;
      }

      const diagramType = type || await suggestDiagramType(description);
      const result = await createDiagram(description, diagramType as any);
      res.json(result);
    } catch (error) {
      console.error("Diagram generation error:", error);
      res.status(500).json({ error: "Diagram generation failed" });
    }
  });

  // Document comparison endpoint (SSE)
  app.post("/api/documents/compare", async (req, res) => {
    try {
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        user = null;
      }
      if (!user && ENV.standaloneMode) {
        user = { id: "standalone-user", openId: "standalone-user", name: "Usuario", role: "admin" as const };
      }
      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { documents } = req.body as { documents: Array<{ name: string; content: string; type: string }> };
      if (!documents || !Array.isArray(documents) || documents.length < 2) {
        res.status(400).json({ error: "At least 2 documents required" });
        return;
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      for await (const event of compareDocumentsStream(documents)) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
      res.end();
    } catch (error) {
      console.error("Document comparison error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      } else {
        res.write(`data: ${JSON.stringify({ type: "error", data: "Comparison error" })}\n\n`);
        res.end();
      }
    }
  });

  // Video summary endpoint (SSE)
  app.post("/api/video/summarize", async (req, res) => {
    try {
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        user = null;
      }
      if (!user && ENV.standaloneMode) {
        user = { id: "standalone-user", openId: "standalone-user", name: "Usuario", role: "admin" as const };
      }
      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { url } = req.body as { url: string };
      if (!url) {
        res.status(400).json({ error: "Video URL required" });
        return;
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      for await (const event of summarizeVideoStream(url)) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
      res.end();
    } catch (error) {
      console.error("Video summary error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      } else {
        res.write(`data: ${JSON.stringify({ type: "error", data: "Summary error" })}\n\n`);
        res.end();
      }
    }
  });

  // Autonomous agent endpoint (SSE)
  app.post("/api/agent/run", async (req, res) => {
    try {
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        user = null;
      }
      if (!user && ENV.standaloneMode) {
        user = { id: "standalone-user", openId: "standalone-user", name: "Usuario", role: "admin" as const };
      }
      if (!user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const { goal } = req.body as { goal: string };
      if (!goal) {
        res.status(400).json({ error: "Goal required" });
        return;
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");

      for await (const event of runAutonomousTaskStream(goal)) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
      res.end();
    } catch (error) {
      console.error("Agent error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      } else {
        res.write(`data: ${JSON.stringify({ type: "error", data: "Agent error" })}\n\n`);
        res.end();
      }
    }
  });

  // Form submission endpoint (public - no auth required for landing pages)
  app.post("/api/form-submit", async (req, res) => {
    try {
      const { 
        formSectionId, 
        chatId, 
        country, 
        landingIdentifier, 
        formData 
      } = req.body as {
        formSectionId?: string;
        chatId?: number;
        country?: string;
        landingIdentifier?: string;
        formData: Record<string, unknown>;
      };

      if (!formData || typeof formData !== 'object') {
        res.status(400).json({ error: "formData is required and must be an object" });
        return;
      }

      // Get IP and user agent for tracking
      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                        req.socket.remoteAddress || 
                        'unknown';
      const userAgent = req.headers['user-agent'] || '';

      // Save to database
      const submissionId = await createFormSubmission({
        formSectionId,
        chatId,
        country,
        landingIdentifier,
        formData,
        ipAddress,
        userAgent,
        status: 'pending',
      });

      res.json({ 
        success: true, 
        submissionId,
        message: "Form submitted successfully" 
      });
    } catch (error) {
      console.error("Form submission error:", error);
      res.status(500).json({ error: "Failed to submit form" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
