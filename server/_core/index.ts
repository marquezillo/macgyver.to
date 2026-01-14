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
import { getMemoriesForContext, getUserByOpenId } from "../db";
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
const SYSTEM_PROMPT = `Eres un asistente de IA avanzado y versátil. Puedes ayudar con una amplia variedad de tareas:

- Responder preguntas y proporcionar información
- Ayudar con programación y desarrollo de software
- Escribir y editar textos
- Analizar datos y resolver problemas
- Generar ideas creativas
- Y mucho más

Cuando el usuario te pida crear una landing page, página web, o diseño web, responde con un JSON estructurado que incluya las secciones a generar. El formato debe ser:

{
  "type": "landing",
  "sections": [
    { "id": "hero-1", "type": "hero", "content": { "title": "...", "subtitle": "...", "ctaText": "..." } },
    { "id": "features-1", "type": "features", "content": { "title": "..." } },
    ...
  ],
  "message": "Tu mensaje explicativo aquí"
}

Los tipos de sección disponibles son: hero, features, testimonials, pricing, faq, cta, footer.

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
