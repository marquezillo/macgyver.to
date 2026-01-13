import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import {
  createChat,
  getChatsByUserId,
  getChatById,
  updateChatTitle,
  updateChatArtifact,
  deleteChat,
  createMessage,
  getMessagesByChatId,
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
});

export type AppRouter = typeof appRouter;
