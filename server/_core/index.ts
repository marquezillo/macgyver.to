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
import { performDeepResearchStream } from "../deepResearch";
import { storagePut } from "../storage";
import { getMemoriesForContext, getUserByOpenId, createFormSubmission } from "../db";
import { extractMemoriesFromConversation } from "../memoryExtraction";
import { analyzeUrlStream } from "../urlAnalysis";
import { extractTextFromImage, translateTextStream, detectLanguage } from "../ocrTranslation";
import { createDiagram, suggestDiagramType } from "../diagramGeneration";
import { compareDocumentsStream } from "../documentComparison";
import { summarizeVideoStream } from "../videoSummary";
import { runAutonomousTaskStream, shouldUseAutonomousMode } from "../autonomousAgents";
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

// System prompt for the AI assistant
const SYSTEM_PROMPT = `Eres un asistente de IA avanzado y versátil, especializado en desarrollo full-stack. Puedes ayudar con:

- Responder preguntas y proporcionar información
- Desarrollo de software completo (frontend + backend)
- Escribir y editar textos
- Analizar datos y resolver problemas
- Generar ideas creativas
- Y mucho más

## GENERACIÓN DE LANDING PAGES

Cuando el usuario te pida crear una landing page, página web, o diseño web, genera una landing COMPLETA y PROFESIONAL con:

1. **Diseño visual atractivo** - Colores, tipografía, espaciado profesional
2. **Contenido relevante** - Textos persuasivos adaptados al negocio
3. **Formularios funcionales** - Con todos los campos necesarios para el negocio
4. **Secciones completas** - Hero, características, testimonios, FAQ, formulario, footer

### Formato de respuesta para landings:

\`\`\`json
{
  "type": "landing",
  "sections": [
    {
      "id": "hero-1",
      "type": "hero",
      "content": {
        "title": "Título principal impactante",
        "subtitle": "Subtítulo que explica el valor",
        "ctaText": "Texto del botón",
        "ctaLink": "#form"
      },
      "styles": {
        "backgroundColor": "#1a1a2e",
        "textColor": "#ffffff",
        "buttonColor": "#6366f1"
      }
    },
    {
      "id": "features-1",
      "type": "features",
      "content": {
        "title": "¿Por qué elegirnos?",
        "features": [
          { "title": "Característica 1", "description": "Descripción detallada" },
          { "title": "Característica 2", "description": "Descripción detallada" },
          { "title": "Característica 3", "description": "Descripción detallada" }
        ]
      }
    },
    {
      "id": "form-1",
      "type": "form",
      "content": {
        "title": "Solicita información",
        "subtitle": "Completa el formulario y te contactaremos",
        "fields": [
          { "id": "name", "label": "Nombre completo", "type": "text", "required": true },
          { "id": "email", "label": "Email", "type": "email", "required": true },
          { "id": "phone", "label": "Teléfono", "type": "tel", "required": true },
          { "id": "message", "label": "Mensaje", "type": "textarea" }
        ],
        "submitText": "Enviar solicitud",
        "successMessage": "¡Gracias! Te contactaremos pronto.",
        "webhookUrl": "/api/form-submit",
        "saveToDatabase": true
      }
    },
    {
      "id": "faq-1",
      "type": "faq",
      "content": {
        "title": "Preguntas frecuentes",
        "items": [
          { "question": "¿Pregunta 1?", "answer": "Respuesta detallada..." },
          { "question": "¿Pregunta 2?", "answer": "Respuesta detallada..." }
        ]
      }
    },
    {
      "id": "footer-1",
      "type": "footer",
      "content": {
        "companyName": "Nombre de la empresa",
        "links": [
          { "title": "Inicio", "url": "#" },
          { "title": "Servicios", "url": "#features" },
          { "title": "Contacto", "url": "#form" }
        ],
        "socialLinks": [
          { "platform": "facebook", "url": "#" },
          { "platform": "instagram", "url": "#" }
        ]
      }
    }
  ],
  "message": "He creado tu landing page con formulario funcional que guarda los datos en la base de datos."
}
\`\`\`

### Tipos de sección disponibles:
- **hero**: Sección principal con título, subtítulo y CTA
- **features**: Características o beneficios del producto/servicio
- **form**: Formulario con campos personalizados (SIEMPRE incluir cuando pidan formulario)
- **faq**: Preguntas frecuentes con acordeón
- **cta**: Llamada a la acción secundaria
- **footer**: Pie de página con enlaces y redes sociales
- **testimonials**: Testimonios de clientes
- **pricing**: Tabla de precios

### IMPORTANTE para formularios:
- Siempre incluye campos relevantes para el tipo de negocio
- Añade validación (required: true) en campos importantes
- Incluye "saveToDatabase": true para guardar en BD
- Personaliza el mensaje de éxito

Para cualquier otra consulta, responde de forma natural y útil en español.`;

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Streaming AI endpoint (SSE)
  app.post("/api/ai/stream", async (req, res) => {
    try {
      // Verify authentication
      let user;
      try {
        user = await sdk.authenticateRequest(req);
      } catch {
        user = null;
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

      // Get user's long-term memory context
      const dbUser = await getUserByOpenId(user.openId);
      let memoryContext = '';
      if (dbUser) {
        memoryContext = await getMemoriesForContext(dbUser.id);
      }

      // Build conversation history for LLM with memory context
      const systemPromptWithMemory = SYSTEM_PROMPT + memoryContext;
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
        const jsonMatch = fullContent.match(/\{[\s\S]*"type"\s*:\s*"landing"[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed?.type === 'landing') {
            hasArtifact = true;
            artifactData = { sections: parsed.sections };
            displayMessage = parsed.message || fullContent;
          }
        }
      } catch {
        // Not a JSON response
      }

      // Extract memories in the background (non-blocking)
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      if (lastUserMessage && dbUser?.id) {
        extractMemoriesFromConversation(
          dbUser.id,
          lastUserMessage.content,
          displayMessage
        ).catch(err => console.error('[MemoryExtraction] Background extraction failed:', err));
      }

      // Send final message with metadata
      res.write(`data: ${JSON.stringify({ 
        type: "done", 
        content: displayMessage,
        hasArtifact,
        artifactData
      })}\n\n`);
      
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
