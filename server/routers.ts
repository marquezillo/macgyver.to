import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { generateCustomImage, generateLandingImages } from "./geminiImageGeneration";
import { listTemplates, getTemplate, applyTemplateToLanding } from "./landingTemplates";
import { generateChatImage, searchImages, getApiStatus } from "./imageSearch";
import { extractMemoriesFromConversation } from "./memoryExtraction";
import { validateAndFixVariants, getVariantsSummary } from "./variantValidator";
import { generateContextualImages } from "./contextualImageGenerator";
import { detectIndustry, enrichPromptWithIndustry, applyIndustryPattern, getImageQueriesForIndustry } from "./industryDetector";
import { detectUserColors, generateColorInstructions } from "./userColorDetector";
import { detectLanguage, generateLanguageInstructions } from "./languageDetector";
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
  createProject,
  getProjectsByUserId,
  getProjectById,
  updateProject,
  deleteProject,
  createProjectFile,
  getProjectFiles,
  updateProjectFile,
  deleteProjectFile,
  createProjectDbTable,
  getProjectDbTables,
  // Auth functions
  createUser,
  authenticateUser,
  getUserById,
  getUserByEmail,
  updateUserProfile,
  changeUserPassword,
  deleteUserAccount,
  // Admin functions
  getAdminStats,
  getAllUsers,
  updateUserRole,
  adminDeleteUser,
  getAllChats,
  getAllProjects,
} from "./db";
import { SignJWT, jwtVerify } from 'jose';
import { generateProject, generateProjectWithAI } from "./projectGenerator";
import { deployProject, stopProject, getProjectStatus } from "./projectDeployment";
import { startDevServer, stopDevServer, getDevServerStatus, getDevServerLogs, refreshProjectFiles, listRunningDevServers } from "./projectDevServer";

// System prompt for the AI assistant
const SYSTEM_PROMPT = `Eres un asistente de IA avanzado y versátil especializado en crear landing pages de alta conversión.

## CAPACIDADES PRINCIPALES:
- Crear landing pages profesionales y visualmente atractivas
- Responder preguntas y proporcionar información
- Ayudar con programación y desarrollo de software
- Escribir y editar textos
- Analizar datos y resolver problemas
- Generar ideas creativas

## GENERACIÓN DE LANDING PAGES:
Cuando el usuario pida crear una landing page, DEBES responder con un JSON estructurado.

IMPORTANTE SOBRE IMÁGENES:
- NO incluyas URLs de imágenes en el JSON
- Las imágenes serán generadas automáticamente con IA (Gemini)
- Solo incluye descripciones de imágenes en el campo "imagePrompt" cuando sea necesario
- El sistema generará imágenes únicas y relevantes para cada sección

### FORMATO DE RESPUESTA PARA LANDINGS:
\`\`\`json
{
  "type": "landing",
  "businessType": "tipo de negocio (ej: restaurante, tecnología, yoga, etc.)",
  "businessName": "nombre del negocio",
  "sections": [
    {
      "id": "hero-1",
      "type": "hero",
      "content": {
        "title": "Título principal impactante",
        "subtitle": "Subtítulo que explica el valor",
        "ctaText": "Llamada a la acción",
        "ctaLink": "#contact",
        "imagePrompt": "descripción de la imagen ideal para el hero"
      },
      "styles": {
        "backgroundColor": "#1a1a2e",
        "textColor": "#ffffff",
        "accentColor": "#4f46e5"
      }
    },
    {
      "id": "features-1",
      "type": "features",
      "content": {
        "title": "Por qué elegirnos",
        "subtitle": "Nuestras ventajas competitivas",
        "items": [
          {
            "title": "Feature 1",
            "description": "Descripción del beneficio",
            "icon": "Zap"
          }
        ]
      }
    },
    {
      "id": "testimonials-1",
      "type": "testimonials",
      "content": {
        "title": "Lo que dicen nuestros clientes",
        "items": [
          {
            "name": "Nombre Cliente",
            "role": "CEO, Empresa",
            "quote": "Testimonio positivo y específico",
            "rating": 5
          }
        ]
      }
    },
    {
      "id": "gallery-1",
      "type": "gallery",
      "content": {
        "title": "Nuestra Galería",
        "subtitle": "Descubre nuestro trabajo",
        "imagePrompts": ["descripción imagen 1", "descripción imagen 2"]
      }
    },
    {
      "id": "team-1",
      "type": "team",
      "content": {
        "title": "Nuestro Equipo",
        "members": [
          {
            "name": "Nombre",
            "role": "Cargo",
            "bio": "Breve descripción"
          }
        ]
      }
    },
    {
      "id": "faq-1",
      "type": "faq",
      "content": {
        "title": "Preguntas Frecuentes",
        "items": [
          { "question": "¿Pregunta común?", "answer": "Respuesta clara y útil" }
        ]
      }
    },
    {
      "id": "cta-1",
      "type": "cta",
      "content": {
        "title": "¿Listo para empezar?",
        "subtitle": "Únete a miles de clientes satisfechos",
        "buttonText": "Comenzar ahora"
      }
    },
    {
      "id": "footer-1",
      "type": "footer",
      "content": {
        "companyName": "Nombre Empresa",
        "description": "Breve descripción",
        "links": [
          { "label": "Inicio", "url": "#" },
          { "label": "Servicios", "url": "#features" }
        ],
        "socialLinks": [
          { "platform": "facebook", "url": "#" },
          { "platform": "instagram", "url": "#" }
        ]
      }
    }
  ],
  "message": "He creado tu landing page con [descripción]. Las imágenes se están generando con IA. Puedes ver el preview a la derecha."
}
\`\`\`

### TIPOS DE SECCIÓN DISPONIBLES:
- hero: Sección principal con título, subtítulo, CTA
- features: Lista de características con iconos
- testimonials: Testimonios de clientes
- gallery: Galería de imágenes (las imágenes se generan con IA)
- team: Equipo de trabajo (los avatares se generan con IA)
- destinations: Destinos/lugares (para viajes, yoga, etc.)
- pricing: Tabla de precios
- faq: Preguntas frecuentes
- cta: Llamada a la acción final
- stats: Estadísticas/números
- form: Formulario de contacto
- footer: Pie de página

### PALETAS DE COLORES SUGERIDAS:
- Tecnología: #4f46e5 (índigo), #1a1a2e (oscuro), #ffffff
- Salud/Yoga: #10b981 (verde), #f0fdf4 (verde claro), #1f2937
- Restaurantes: #ef4444 (rojo), #fef2f2 (rojo claro), #1f2937
- Viajes: #0ea5e9 (azul), #f0f9ff (azul claro), #1e293b
- Lujo: #d4af37 (dorado), #1a1a1a (negro), #ffffff

Para cualquier otra consulta, responde de forma natural y útil en español.`;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    // Get current user
    me: publicProcedure.query(opts => opts.ctx.user),
    
    // Register new user
    register: publicProcedure
      .input(z.object({
        name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
        email: z.string().email('Email inválido'),
        password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const user = await createUser({
            name: input.name,
            email: input.email,
            password: input.password,
          });
          
          // Create JWT token
          const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
          const token = await new SignJWT({ userId: user.id, email: user.email })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('365d')
            .sign(secret);
          
          // Set cookie
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });
          
          return {
            success: true,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          };
        } catch (error: any) {
          throw new Error(error.message || 'Error al registrar usuario');
        }
      }),
    
    // Login user
    login: publicProcedure
      .input(z.object({
        email: z.string().email('Email inválido'),
        password: z.string().min(1, 'La contraseña es requerida'),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await authenticateUser(input.email, input.password);
        
        if (!user) {
          throw new Error('Email o contraseña incorrectos');
        }
        
        // Create JWT token with the format expected by sdk.ts (openId, appId, name)
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
        // Use a unique identifier for local users (email-based openId)
        const localOpenId = `local-${user.id}`;
        const token = await new SignJWT({ 
          openId: localOpenId,
          appId: process.env.VITE_APP_ID || 'landing-editor',
          name: user.name || user.email || 'Usuario',
          userId: user.id,
          email: user.email,
          role: user.role,
        })
          .setProtectedHeader({ alg: 'HS256' })
          .setExpirationTime('365d')
          .sign(secret);
        
        // Set cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });
        
        return {
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        };
      }),
    
    // Logout user
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    
    // Update profile
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().min(2).optional(),
        theme: z.enum(['light', 'dark', 'system']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await updateUserProfile(ctx.user.id, input);
        return {
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            theme: user.theme,
          },
        };
      }),
    
    // Change password
    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
        newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          await changeUserPassword(ctx.user.id, input.currentPassword, input.newPassword);
          return { success: true };
        } catch (error: any) {
          throw new Error(error.message || 'Error al cambiar contraseña');
        }
      }),
    
    // Delete account
    deleteAccount: protectedProcedure
      .input(z.object({
        password: z.string().min(1, 'La contraseña es requerida para confirmar'),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify password first
        const user = await authenticateUser(ctx.user.email || '', input.password);
        if (!user) {
          throw new Error('Contraseña incorrecta');
        }
        
        await deleteUserAccount(ctx.user.id);
        
        // Clear cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
        
        return { success: true };
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
        chatId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Detectar industria del usuario para enriquecer el prompt
          const lastUserMessage = input.messages.filter(m => m.role === 'user').pop();
          const userMessageContent = lastUserMessage?.content || '';
          
          // Detectar industria y enriquecer el system prompt
          const industryDetection = detectIndustry(userMessageContent);
          let enrichedSystemPrompt = SYSTEM_PROMPT;
          
          if (industryDetection.detected && industryDetection.pattern) {
            console.log(`[IndustryDetector] Detected: ${industryDetection.pattern.name} (confidence: ${industryDetection.confidence})`);
            console.log(`[IndustryDetector] Keywords matched: ${industryDetection.matchedKeywords.join(', ')}`);
            enrichedSystemPrompt = enrichPromptWithIndustry(SYSTEM_PROMPT, userMessageContent);
          }
          
          // Detectar colores solicitados por el usuario (PRIORIDAD sobre industria)
          const userColors = detectUserColors(userMessageContent);
          if (userColors.detected) {
            console.log(`[ColorDetector] User requested colors: ${userColors.colorNames.join(', ')}`);
            console.log(`[ColorDetector] Primary: ${userColors.primary}, Secondary: ${userColors.secondary}, Accent: ${userColors.accent}`);
            // Añadir instrucciones de color al prompt (tienen prioridad sobre industria)
            const colorInstructions = generateColorInstructions(userColors);
            enrichedSystemPrompt = enrichedSystemPrompt + '\n\n' + colorInstructions;
          }
          
          // Detectar idioma del usuario para generar contenido en el idioma correcto
          const languageDetection = detectLanguage(userMessageContent);
          console.log(`[LanguageDetector] Detected: ${languageDetection.language} (confidence: ${languageDetection.confidence.toFixed(2)})`);
          console.log(`[LanguageDetector] Spanish score: ${languageDetection.spanishScore}, English score: ${languageDetection.englishScore}`);
          // Añadir instrucciones de idioma al prompt
          const languageInstructions = generateLanguageInstructions(languageDetection);
          enrichedSystemPrompt = enrichedSystemPrompt + '\n\n' + languageInstructions;
          
          // Build conversation history for LLM
          const llmMessages = [
            { role: 'system' as const, content: enrichedSystemPrompt },
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
              
              // Validar y corregir variantes si es una landing
              if (isLandingResponse && parsedResponse) {
                // Reutilizar lastUserMessage ya declarado arriba
                const userMsgContent = lastUserMessage?.content || '';
                
                const { data: fixedData, corrections } = validateAndFixVariants(
                  parsedResponse as { type: string; businessType?: string; sections: { id: string; type: string; content: Record<string, unknown>; styles?: Record<string, unknown> }[] },
                  userMessageContent
                );
                
                if (corrections.length > 0) {
                  console.log('[VariantValidator] Correcciones aplicadas:', corrections);
                }
                
                parsedResponse = fixedData;
                
                // Log de variantes aplicadas
                const variantsSummary = getVariantsSummary(fixedData);
                console.log('[VariantValidator] Variantes finales:', variantsSummary);
                
                // Generar imágenes contextuales automáticamente
                try {
                  const { data: dataWithImages, generatedImages } = await generateContextualImages(
                    fixedData as { type: string; businessType?: string; businessName?: string; sections: { id: string; type: string; content: Record<string, unknown>; styles?: Record<string, unknown> }[] },
                    { useAI: true, maxImages: 3 }
                  );
                  
                  if (generatedImages.length > 0) {
                    console.log(`[ContextualImageGenerator] Generated ${generatedImages.length} images:`, 
                      generatedImages.map(img => `${img.sectionId} (${img.source})`));
                    parsedResponse = dataWithImages;
                  }
                } catch (imgError) {
                  console.error('[ContextualImageGenerator] Error generating images:', imgError);
                  // Continuar sin imágenes generadas
                }
              }
            }
          } catch {
            // Not a JSON response, that's fine
          }

          // Extract memories in the background (non-blocking)
          if (lastUserMessage && ctx.user?.id) {
            extractMemoriesFromConversation(
              ctx.user.id,
              lastUserMessage.content,
              textContent,
              input.chatId
            ).catch(err => console.error('[MemoryExtraction] Background extraction failed:', err));
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

  // Image generation - Usa Gemini directamente para el botón "generar imagen"
  image: router({
    generate: protectedProcedure
      .input(z.object({
        prompt: z.string(),
        originalImageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          // Usar Gemini directamente para generación explícita del usuario
          console.log('[Image] Generating image with Gemini for prompt:', input.prompt.substring(0, 50) + '...');
          const imageUrl = await generateChatImage(input.prompt);
          
          if (!imageUrl) {
            throw new Error('No se pudo generar la imagen');
          }
          
          return { url: imageUrl };
        } catch (error) {
          console.error('Image generation error:', error);
          throw new Error('Error al generar la imagen. Por favor, intenta de nuevo.');
        }
      }),
    
    // Buscar imágenes en bancos de stock (Unsplash, Pexels, Pixabay)
    search: protectedProcedure
      .input(z.object({
        query: z.string(),
        count: z.number().optional().default(5),
      }))
      .mutation(async ({ input }) => {
        try {
          console.log('[Image] Searching stock images for:', input.query);
          const images = await searchImages(input.query, { count: input.count });
          return { images };
        } catch (error) {
          console.error('Image search error:', error);
          throw new Error('Error al buscar imágenes.');
        }
      }),
    
    // Obtener estado de las APIs de imágenes configuradas
    status: publicProcedure.query(() => {
      return getApiStatus();
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

    list: publicProcedure.query(async ({ ctx }) => {
      // Return empty array if not authenticated
      if (!ctx.user) {
        return [];
      }
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
      .mutation(async ({ ctx, input }) => {
        await updateChatTitle(input.chatId, ctx.user.id, input.title);
        return { success: true };
      }),

    updateArtifact: publicProcedure
      .input(z.object({ chatId: z.number(), artifactData: z.unknown() }))
      .mutation(async ({ ctx, input }) => {
        console.log('[updateArtifact] Saving artifact for chat:', input.chatId);
        // Note: This is public procedure, so ctx.user might be null
        const userId = ctx.user?.id || 1; // Fallback for anonymous users
        await updateChatArtifact(input.chatId, userId, input.artifactData);
        console.log('[updateArtifact] Artifact saved successfully');
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ chatId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const chat = await getChatById(input.chatId, ctx.user.id);
        if (!chat) {
          throw new Error("Chat not found or access denied");
        }
        await deleteChat(input.chatId, ctx.user.id);
        return { success: true };
      }),

    toggleFavorite: protectedProcedure
      .input(z.object({ chatId: z.number(), isFavorite: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const chat = await getChatById(input.chatId, ctx.user.id);
        if (!chat) {
          throw new Error("Chat not found or access denied");
        }
        await toggleChatFavorite(input.chatId, ctx.user.id, input.isFavorite);
        return { success: true };
      }),

    moveToFolder: protectedProcedure
      .input(z.object({ chatId: z.number(), folderId: z.number().nullable() }))
      .mutation(async ({ ctx, input }) => {
        const chat = await getChatById(input.chatId, ctx.user.id);
        if (!chat) {
          throw new Error("Chat not found or access denied");
        }
        await moveChatToFolder(input.chatId, ctx.user.id, input.folderId);
        return { success: true };
      }),

    listByFolder: protectedProcedure
      .input(z.object({ folderId: z.number() }))
      .query(async ({ ctx, input }) => {
        const chatList = await getChatsByFolderId(input.folderId, ctx.user.id);
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

    list: publicProcedure.query(async ({ ctx }) => {
      // Return empty array if not authenticated
      if (!ctx.user) {
        return [];
      }
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
      .mutation(async ({ ctx, input }) => {
        await updateFolder(input.folderId, ctx.user.id, { name: input.name, color: input.color, icon: input.icon });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ folderId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteFolder(input.folderId, ctx.user.id);
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
        const memory = await createMemory(ctx.user.id, {
          category: input.category,
          content: input.content,
          source: 'manual',
          importance: input.importance || 5
        });
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
      .mutation(async ({ ctx, input }) => {
        const updates: { content?: string; importance?: number; category?: 'preference' | 'fact' | 'context' | 'instruction' } = {};
        if (input.content) updates.content = input.content;
        if (input.importance) updates.importance = input.importance;
        if (input.category) updates.category = input.category;
        await updateMemory(input.memoryId, ctx.user.id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ memoryId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteMemory(input.memoryId, ctx.user.id);
        return { success: true };
      }),

    toggle: protectedProcedure
      .input(z.object({ memoryId: z.number(), isActive: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        await toggleMemoryActive(input.memoryId, ctx.user.id, input.isActive);
        return { success: true };
      }),

    // Get formatted context for LLM
    getContext: protectedProcedure.query(async ({ ctx }) => {
      const context = await getMemoriesForContext(ctx.user.id);
      return { context };
    }),
  }),

  // Project management
  project: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        type: z.enum(['landing', 'webapp', 'api']).default('webapp')
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await createProject(ctx.user.id, {
          name: input.name,
          description: input.description,
          type: input.type
        });
        return project;
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      const projectList = await getProjectsByUserId(ctx.user.id);
      return projectList;
    }),

    get: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId, ctx.user.id);
        if (!project) {
          throw new Error('Project not found or access denied');
        }
        return project;
      }),

    update: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        name: z.string().optional(),
        description: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId, ctx.user.id);
        if (!project) {
          throw new Error('Project not found or access denied');
        }
        await updateProject(input.projectId, ctx.user.id, {
          name: input.name,
          description: input.description
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId, ctx.user.id);
        if (!project) {
          throw new Error('Project not found or access denied');
        }
        await stopProject(input.projectId);
        await deleteProject(input.projectId, ctx.user.id);
        return { success: true };
      }),

    // Generate project code with AI
    generate: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        description: z.string()
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId, ctx.user.id);
        if (!project) {
          throw new Error('Project not found or access denied');
        }

        // Generate files with AI
        const files = await generateProjectWithAI(input.description, project.name);

        // Save files to database
        for (const file of files) {
          await createProjectFile(input.projectId, { path: file.path, content: file.content, fileType: file.fileType });
        }

        return { success: true, fileCount: files.length };
      }),

    // Deploy project
    deploy: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId, ctx.user.id);
        if (!project) {
          throw new Error('Project not found or access denied');
        }

        const result = await deployProject(input.projectId);
        return result;
      }),

    // Stop project
    stop: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId, ctx.user.id);
        if (!project) {
          throw new Error('Project not found or access denied');
        }

        await stopProject(input.projectId);
        return { success: true };
      }),

    // Get project status
    status: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId, ctx.user.id);
        if (!project) {
          throw new Error('Project not found or access denied');
        }

        const status = await getProjectStatus(input.projectId);
        return status;
      }),

    // Get project files
    files: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId, ctx.user.id);
        if (!project) {
          throw new Error('Project not found or access denied');
        }

        const files = await getProjectFiles(input.projectId);
        return files;
      }),

    // Update a project file
    updateFile: protectedProcedure
      .input(z.object({
        fileId: z.number(),
        content: z.string()
      }))
      .mutation(async ({ input }) => {
        await updateProjectFile(input.fileId, { content: input.content });
        return { success: true };
      }),

    // Add database table to project
    addTable: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        tableName: z.string(),
        schema: z.record(z.string(), z.unknown())
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId, ctx.user.id);
        if (!project) {
          throw new Error('Project not found or access denied');
        }

        const table = await createProjectDbTable(input.projectId, { tableName: input.tableName, schema: input.schema as Record<string, unknown> });
        return table;
      }),

    // Get project database tables
    tables: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId, ctx.user.id);
        if (!project) {
          throw new Error('Project not found or access denied');
        }

        const tables = await getProjectDbTables(input.projectId);
        return tables;
      }),

    // Start dev server for live preview
    startDevServer: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId, ctx.user.id);
        if (!project) {
          throw new Error('Project not found or access denied');
        }

        const result = await startDevServer(input.projectId);
        return result;
      }),

    // Stop dev server
    stopDevServer: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId, ctx.user.id);
        if (!project) {
          throw new Error('Project not found or access denied');
        }

        await stopDevServer(input.projectId);
        return { success: true };
      }),

    // Get dev server status
    devServerStatus: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId, ctx.user.id);
        if (!project) {
          throw new Error('Project not found or access denied');
        }

        const status = getDevServerStatus(input.projectId);
        return status;
      }),

    // Get dev server logs
    devServerLogs: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId, ctx.user.id);
        if (!project) {
          throw new Error('Project not found or access denied');
        }

        const logs = getDevServerLogs(input.projectId);
        return { logs };
      }),

    // Refresh project files (trigger hot reload)
    refreshFiles: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId, ctx.user.id);
        if (!project) {
          throw new Error('Project not found or access denied');
        }

        await refreshProjectFiles(input.projectId);
        return { success: true };
      }),

    // List all running dev servers (admin)
    listDevServers: protectedProcedure
      .query(async () => {
        const servers = listRunningDevServers();
        return { servers };
      }),
  }),

  // Templates for landing pages
  templates: router({
    // List all available templates
    list: publicProcedure.query(() => {
      const allTemplates = listTemplates();
      return allTemplates.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        preview: t.preview,
        colors: t.colors,
      }));
    }),

    // Get a specific template by ID
    get: publicProcedure
      .input(z.object({ templateId: z.string() }))
      .query(({ input }) => {
        const template = getTemplate(input.templateId);
        return template;
      }),

    // Apply a template to landing JSON
    applyToLanding: protectedProcedure
      .input(z.object({
        landingJSON: z.record(z.string(), z.unknown()),
        templateId: z.string(),
      }))
      .mutation(({ input }) => {
        const result = applyTemplateToLanding(input.landingJSON, input.templateId);
        return result;
      }),
  }),

  // Admin panel router (admin only)
  admin: router({
    // Get dashboard statistics
    stats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Acceso denegado: se requiere rol de administrador');
      }
      const stats = await getAdminStats();
      return stats;
    }),

    // Get all users with pagination
    users: protectedProcedure
      .input(z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        search: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acceso denegado: se requiere rol de administrador');
        }
        const result = await getAllUsers(input.page, input.limit, input.search);
        return result;
      }),

    // Update user role
    updateUserRole: protectedProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(['user', 'admin']),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acceso denegado: se requiere rol de administrador');
        }
        await updateUserRole(input.userId, input.role);
        return { success: true };
      }),

    // Delete user
    deleteUser: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acceso denegado: se requiere rol de administrador');
        }
        // Prevent self-deletion
        if (input.userId === ctx.user.id) {
          throw new Error('No puedes eliminar tu propia cuenta desde el panel de admin');
        }
        await adminDeleteUser(input.userId);
        return { success: true };
      }),

    // Get all chats with pagination
    chats: protectedProcedure
      .input(z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
        userId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acceso denegado: se requiere rol de administrador');
        }
        const result = await getAllChats(input.page, input.limit, input.userId);
        return result;
      }),

    // Get all projects with pagination
    projects: protectedProcedure
      .input(z.object({
        page: z.number().default(1),
        limit: z.number().default(20),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Acceso denegado: se requiere rol de administrador');
        }
        const result = await getAllProjects(input.page, input.limit);
        return result;
      }),
  }),
});

export type AppRouter = typeof appRouter;
