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

      // Build conversation history for LLM
      const llmMessages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
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
