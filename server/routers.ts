import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import {
  createChat,
  getChatsByUserId,
  getChatById,
  updateChatTitle,
  updateChatArtifact,
  deleteChat,
  createMessage,
  getMessagesByChatId,
  createFolder,
  getFoldersByUserId,
  updateFolder,
  deleteFolder,
  toggleChatFavorite,
  moveChatToFolder,
  getChatsByFolderId,
  createMemory,
  getMemoriesByUserId,
  updateMemory,
  deleteMemory,
  toggleMemoryActive,
  getMemoriesForContext,
} from "./db";

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

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // AI/LLM operations
  ai: router({
    // Send a message to the LLM and get a response
    chat: protectedProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })),
      }))
      .mutation(async ({ input }) => {
        try {
          // Build conversation history for LLM
          const llmMessages = [
            { role: 'system' as const, content: SYSTEM_PROMPT },
            ...input.messages.map(m => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
          ];

          const result = await invokeLLM({ messages: llmMessages });
          
          const responseContent = result.choices[0]?.message?.content;
          const textContent = typeof responseContent === 'string' 
            ? responseContent 
            : Array.isArray(responseContent) 
              ? responseContent.find(c => c.type === 'text')?.text || ''
              : '';

          // Try to parse as landing page JSON
          let parsedResponse: { type?: string; sections?: unknown[]; message?: string } | null = null;
          let isLandingResponse = false;

          try {
            // Check if response contains JSON
            const jsonMatch = textContent.match(/\{[\s\S]*"type"\s*:\s*"landing"[\s\S]*\}/);
            if (jsonMatch) {
              parsedResponse = JSON.parse(jsonMatch[0]);
              isLandingResponse = parsedResponse?.type === 'landing';
            }
          } catch {
            // Not a JSON response, that's fine
          }

          return {
            content: isLandingResponse && parsedResponse?.message 
              ? parsedResponse.message 
              : textContent,
            hasArtifact: isLandingResponse,
            artifactData: isLandingResponse ? { sections: parsedResponse?.sections } : null,
          };
        } catch (error) {
          console.error('LLM Error:', error);
          throw new Error('Error al procesar tu mensaje. Por favor, intenta de nuevo.');
        }
      }),
  }),

  // Image generation
  image: router({
    generate: protectedProcedure
      .input(z.object({
        prompt: z.string(),
        originalImageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const options: { prompt: string; originalImages?: Array<{ url: string; mimeType: string }> } = {
            prompt: input.prompt,
          };
          
          if (input.originalImageUrl) {
            options.originalImages = [{
              url: input.originalImageUrl,
              mimeType: 'image/png',
            }];
          }
          
          const result = await generateImage(options);
          return { url: result.url };
        } catch (error) {
          console.error('Image generation error:', error);
          throw new Error('Error al generar la imagen. Por favor, intenta de nuevo.');
        }
      }),
  }),

  // Chat operations
  chat: router({
    create: protectedProcedure
      .input(z.object({ title: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const chat = await createChat(ctx.user.id, input.title);
        return chat;
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      const chatList = await getChatsByUserId(ctx.user.id);
      return chatList;
    }),

    get: protectedProcedure
      .input(z.object({ chatId: z.number() }))
      .query(async ({ ctx, input }) => {
        const chat = await getChatById(input.chatId, ctx.user.id);
        return chat;
      }),

    updateTitle: protectedProcedure
      .input(z.object({ chatId: z.number(), title: z.string() }))
      .mutation(async ({ input }) => {
        await updateChatTitle(input.chatId, input.title);
        return { success: true };
      }),

    updateArtifact: protectedProcedure
      .input(z.object({ chatId: z.number(), artifactData: z.unknown() }))
      .mutation(async ({ input }) => {
        await updateChatArtifact(input.chatId, input.artifactData);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ chatId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const chat = await getChatById(input.chatId, ctx.user.id);
        if (!chat) {
          throw new Error("Chat not found or access denied");
        }
        await deleteChat(input.chatId);
        return { success: true };
      }),

    toggleFavorite: protectedProcedure
      .input(z.object({ chatId: z.number(), isFavorite: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const chat = await getChatById(input.chatId, ctx.user.id);
        if (!chat) {
          throw new Error("Chat not found or access denied");
        }
        await toggleChatFavorite(input.chatId, input.isFavorite);
        return { success: true };
      }),

    moveToFolder: protectedProcedure
      .input(z.object({ chatId: z.number(), folderId: z.number().nullable() }))
      .mutation(async ({ ctx, input }) => {
        const chat = await getChatById(input.chatId, ctx.user.id);
        if (!chat) {
          throw new Error("Chat not found or access denied");
        }
        await moveChatToFolder(input.chatId, input.folderId);
        return { success: true };
      }),

    listByFolder: protectedProcedure
      .input(z.object({ folderId: z.number() }))
      .query(async ({ input }) => {
        const chatList = await getChatsByFolderId(input.folderId);
        return chatList;
      }),
  }),

  // Message operations
  message: router({
    create: protectedProcedure
      .input(z.object({
        chatId: z.number(),
        role: z.enum(['user', 'assistant']),
        content: z.string(),
        hasArtifact: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const chat = await getChatById(input.chatId, ctx.user.id);
        if (!chat) {
          throw new Error("Chat not found or access denied");
        }
        const message = await createMessage(
          input.chatId,
          input.role,
          input.content,
          input.hasArtifact || false
        );
        return message;
      }),

    list: protectedProcedure
      .input(z.object({ chatId: z.number() }))
      .query(async ({ ctx, input }) => {
        const chat = await getChatById(input.chatId, ctx.user.id);
        if (!chat) {
          throw new Error("Chat not found or access denied");
        }
        const messageList = await getMessagesByChatId(input.chatId);
        return messageList;
      }),
  }),

  // Folder operations
  folder: router({
    create: protectedProcedure
      .input(z.object({ 
        name: z.string(), 
        color: z.string().optional(),
        icon: z.string().optional() 
      }))
      .mutation(async ({ ctx, input }) => {
        const folder = await createFolder(ctx.user.id, input.name, input.color, input.icon);
        return folder;
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      const folderList = await getFoldersByUserId(ctx.user.id);
      return folderList;
    }),

    update: protectedProcedure
      .input(z.object({ 
        folderId: z.number(), 
        name: z.string(),
        color: z.string().optional(),
        icon: z.string().optional()
      }))
      .mutation(async ({ input }) => {
        await updateFolder(input.folderId, input.name, input.color, input.icon);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ folderId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteFolder(input.folderId);
        return { success: true };
      }),
  }),

  // Export conversation
  export: router({
    conversation: protectedProcedure
      .input(z.object({ 
        chatId: z.number(),
        format: z.enum(['markdown', 'json'])
      }))
      .query(async ({ ctx, input }) => {
        const chat = await getChatById(input.chatId, ctx.user.id);
        if (!chat) {
          throw new Error("Chat not found or access denied");
        }
        const messages = await getMessagesByChatId(input.chatId);
        
        if (input.format === 'markdown') {
          let markdown = `# ${chat.title}\n\n`;
          markdown += `*Exportado el ${new Date().toLocaleDateString('es-ES')}*\n\n---\n\n`;
          
          for (const msg of messages) {
            const role = msg.role === 'user' ? '**Tú**' : '**Asistente**';
            markdown += `${role}:\n\n${msg.content}\n\n---\n\n`;
          }
          
          return { content: markdown, filename: `${chat.title.replace(/[^a-zA-Z0-9]/g, '_')}.md` };
        } else {
          const jsonContent = {
            title: chat.title,
            exportedAt: new Date().toISOString(),
            messages: messages.map(m => ({
              role: m.role,
              content: m.content,
              timestamp: m.createdAt
            }))
          };
          return { content: JSON.stringify(jsonContent, null, 2), filename: `${chat.title.replace(/[^a-zA-Z0-9]/g, '_')}.json` };
        }
      }),
  }),

  // Memory operations (long-term memory)
  memory: router({
    create: protectedProcedure
      .input(z.object({
        category: z.enum(['preference', 'fact', 'context', 'instruction']),
        content: z.string(),
        importance: z.number().min(1).max(10).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const memory = await createMemory(
          ctx.user.id,
          input.category,
          input.content,
          'manual',
          undefined,
          input.importance || 5
        );
        return memory;
      }),

    list: protectedProcedure
      .input(z.object({ activeOnly: z.boolean().optional() }).optional())
      .query(async ({ ctx, input }) => {
        const memories = await getMemoriesByUserId(ctx.user.id, input?.activeOnly ?? true);
        return memories;
      }),

    update: protectedProcedure
      .input(z.object({
        memoryId: z.number(),
        content: z.string().optional(),
        importance: z.number().min(1).max(10).optional(),
        category: z.enum(['preference', 'fact', 'context', 'instruction']).optional(),
      }))
      .mutation(async ({ input }) => {
        const updates: { content?: string; importance?: number; category?: 'preference' | 'fact' | 'context' | 'instruction' } = {};
        if (input.content) updates.content = input.content;
        if (input.importance) updates.importance = input.importance;
        if (input.category) updates.category = input.category;
        await updateMemory(input.memoryId, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ memoryId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteMemory(input.memoryId);
        return { success: true };
      }),

    toggle: protectedProcedure
      .input(z.object({ memoryId: z.number(), isActive: z.boolean() }))
      .mutation(async ({ input }) => {
        await toggleMemoryActive(input.memoryId, input.isActive);
        return { success: true };
      }),

    // Get formatted context for LLM
    getContext: protectedProcedure.query(async ({ ctx }) => {
      const context = await getMemoriesForContext(ctx.user.id);
      return { context };
    }),
  }),
});

export type AppRouter = typeof appRouter;
