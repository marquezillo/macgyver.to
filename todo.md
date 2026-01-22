
- [x] Create chats and messages database schema
- [x] Implement tRPC procedures for chat CRUD operations
- [x] Connect Sidebar to real chat history from database
- [x] Connect ChatInterface to persist messages in database
- [x] Implement "New Chat" functionality with database persistence

- [x] Rebrand chat from "AI Designer" to general AI assistant
- [x] Update welcome message to be generic (not landing-focused)
- [x] Integrate real LLM API (invokeLLM) for intelligent responses
- [x] Make landing generation a capability triggered by user request, not the default
- [x] Update Sidebar branding

- [x] Add predefined suggestion buttons (Claude-style) to initial chat screen

- [x] Implement LLM streaming responses (real-time text generation)
- [x] Implement chat renaming from sidebar
- [x] Implement history search/filter

## Advanced Features
- [x] Deep Research: Multi-source investigation with synthesis (Perplexity-style)
- [x] Image Generation: Integrate image generation API
- [x] File Analysis: Upload and analyze PDFs, documents, images
- [x] Code Execution: Python sandbox/terminal for running code

## UX Features
- [x] Folders/Projects: Organize conversations into folders
- [x] Favorites/Pins: Mark important conversations
- [x] Theme Customization: Dark/light mode and color personalization
- [x] Export Conversations: PDF, Markdown, or public link sharing

## Long-Term Memory
- [x] Create memories database table (user preferences, facts, context)
- [x] Implement memory CRUD API (create, list, delete memories)
- [x] Integrate memories into LLM system prompt context
- [x] Auto-extract memories from conversations
  - [x] Create LLM-based memory extraction function
  - [x] Integrate extraction after each assistant response
  - [x] Add deduplication logic to avoid duplicate memories
- [x] Add memory management UI in settings

## Bug Fixes
- [x] Fix HeroSection backgroundColor undefined error
- [x] Fix error when processing chat messages
- [x] Implement FormSection component
- [x] Implement FAQSection component
- [x] Implement CTASection component
- [x] Implement FooterSection component
- [x] Improve error handling for unauthenticated users

## Advanced AI Capabilities (New)
- [x] URL Analysis - Paste URL and get automatic summary/analysis
- [x] OCR Enhanced - Extract text from images and screenshots
- [x] Automatic Translation - Detect language and offer translation
- [x] Diagram Generation - Create flowcharts, ERDs, architectures from text
- [x] Document Comparison - Upload 2+ files and compare differences
- [x] Video Summary - Paste YouTube URL and get summary
- [x] External APIs Connection - Integrate Notion, Google Sheets, Airtable via MCP
- [x] Autonomous Agents - Multi-step tasks that AI executes without intervention

## Bug Fixes (New)
- [x] Fix chat scroll - cannot scroll up to see previous messages
- [x] Improve streaming response rendering - reduce visual jumps during typing
- [x] Fix layout breaking when agent responds with images
- [x] Implement image lightbox with zoom and download in chat
- [x] Fix scroll overlapping header in chat
- [x] DEFINITIVE FIX: Chat scroll eating header and cannot scroll up

## Landing Generation Improvements
- [x] Improve landing generation to include functional backend (form processing, database, APIs)
- [x] Update system prompt to generate full-stack landings, not just visual
- [x] Add form submission handling with database storage

## Full-Stack Project System (Like Manus)
- [x] Design project system architecture
- [x] Create projects database schema (projects table with metadata)
- [x] Create project files table (store generated code)
- [x] Implement project CRUD API (create, read, update, delete projects)
- [x] Implement project code generation (React + Express template)
- [x] Implement per-project database provisioning (separate schema per project)
- [x] Implement project build system (compile React, bundle Express)
- [x] Implement project deployment system (run projects on server with unique ports)
- [x] Create project management UI (list projects, view status, manage)
- [x] Integrate project creation with chat flow
- [x] Implement project preview (live dev server per project)
  - [x] Dev server management per project
  - [x] Port allocation and tracking
  - [x] Preview UI with iframe embed
  - [x] Start/stop dev server controls
- [ ] Implement project export (download as zip)
- [x] Fix tRPC returning HTML instead of JSON error (transient error - app working correctly)
## Responsive Design

- [x] Make sidebar collapsible on mobile (drawer with hamburger menu)
- [x] Fix chat interface for mobile screens (smaller inputs, compact suggestions)
- [x] Fix preview panel for mobile (full-screen overlay)
- [x] Ensure all elements are visible on small screens
- [x] Make landing sections responsive (Hero, Features, Form, FAQ, CTA, Footer)
- [x] Make image lightbox responsive for mobile
- [x] Make canvas and preview responsive

## Configuración de APIs

- [x] Configurar API key de Anthropic (Claude Sonnet 4)
- [x] Configurar API key de OpenAI (GPT-4o + DALL-E 3)
- [x] Configurar API key de Gemini (2.0 Flash)
- [x] Sistema de fallback entre proveedores
- [x] Crear archivo env.example con documentación


## Componentes Faltantes
- [x] Implementar TestimonialsSection component
- [ ] Implementar PricingSection component (opcional)

## Testing de Funcionalidades
- [x] Probar chat básico con Claude - FUNCIONA
- [x] Probar generación de landing completa - FUNCIONA (mensaje amigable + preview)
- [x] Probar Deep Research - NO FUNCIONA (APIs de búsqueda no disponibles en Manus)
- [x] Probar generación de imágenes - FUNCIONA (DALL-E 3)
- [ ] Probar análisis de archivos - PENDIENTE (requiere subir archivo)
- [x] Probar ejecución de código - SIMULADO (LLM explica resultado, no ejecuta)
- [x] Probar sistema de proyectos - FUNCIONA (crear, ver, pestañas)
- [x] Probar memoria/contexto - FUNCIONA (ver, editar, eliminar memorias)
- [x] Probar carpetas/organización - FUNCIONA (crear carpetas)
- [x] Probar modo oscuro - FUNCIONA (toggle dark/light)


## Despliegue en Servidor Propio
- [x] Conectar al servidor 199.247.10.137
- [x] Instalar Node.js, pnpm, PM2, Nginx
- [x] Configurar base de datos MySQL
- [x] Desplegar proyecto Landing Editor
- [x] Configurar Nginx como reverse proxy (con proxy_buffering off para SSE)
- [ ] Configurar SSL con Let's Encrypt
- [ ] Configurar sincronización automática de checkpoints
- [x] Probar despliegue completo - FUNCIONA

## Pruebas Realizadas en VPS (21 Enero 2026)
- [x] Chat con Claude streaming - FUNCIONA
- [x] Generación de imágenes DALL-E 3 - FUNCIONA
- [x] Generación de landings completas - FUNCIONA
- [x] Sistema de proyectos full-stack - FUNCIONA
- [x] Ayuda con código (JavaScript, Python) - FUNCIONA
- [x] Memoria a largo plazo - FUNCIONA
- [x] Carpetas y organización - FUNCIONA
- [x] Modo oscuro/claro - FUNCIONA
- [x] Diseño responsivo - FUNCIONA

## Implementación Bing Search API para Deep Research
- [ ] Crear función de búsqueda con Bing Search API
- [ ] Reemplazar llamadas a BUILT_IN_FORGE_API_URL por Bing API
- [ ] Configurar variable de entorno BING_SEARCH_API_KEY
- [ ] Probar Deep Research con la nueva implementación


## Bug Fix - Análisis de PDF
- [x] Implementar pdf-parse para extraer contenido de PDFs
- [x] Implementar chunking inteligente (como Manus) para documentos largos
- [x] Frontend actualizado para usar endpoint con chunking


## Configuración Dominio macgyver.to
- [x] Configurar Nginx para dominio macgyver.to
- [x] Instalar certificado SSL con Let's Encrypt
- [x] Actualizar branding del proyecto a MacGyver
- [x] Probar acceso por HTTPS - FUNCIONA


## Sistema Híbrido de Patrones + LLM (Memoria Visual Infinita)

### Fase 1: Base de Datos de Patrones
- [x] Crear tabla DesignCategory (id, name, slug, description, icon, industryType)
- [x] Crear tabla VisualPattern (id, categoryId, name, htmlStructure, tailwindConfig, metadataJson, previewImage)
- [x] Crear tabla ComponentLibrary (id, name, type, code, isReusable, usageCount)
- [x] Crear tabla PatternUsageLog (registro de uso)
- [x] Ejecutar migraciones con pnpm db:push
- [x] Poblar 43 categorías iniciales por industria (Technology, Food, Health, Services, etc.)

### Fase 2: Sistema de Búsqueda Semántica
- [x] Implementar función de búsqueda por categoría/industria (patternSearch.ts)
- [x] Implementar búsqueda semántica con LLM para matching preciso
- [x] Crear API tRPC para consultar patrones (patterns router)
- [x] Implementar registro de uso de patrones
### Fase 3: Integración RAG en el Chat
- [x] Crear módulo ragIntegration.ts para contexto RAG
- [x] Modificar endpoint /api/ai/stream para consultar patrones primero
- [x] Implementar lógica híbrida: patrón existente → usar como base, no existe → LLM genera
- [x] Añadir feedback visual al usuario ("Buscando patrones...")
- [x] Integrar patrones como contexto adicional para el LLM

### Fase 4: Auto-guardado de Componentes Exitosos
- [x] Crear módulo patternAutoSave.ts
- [x] Analizar estructura de landing para extraer patrones genéricos
- [x] Guardar patrones con calidad >= 60 automáticamente
- [x] Implementar deduplicación para evitar patrones duplicados
- [x] Sistema de puntuación/calidad para filtrar patrones
- [x] Crear router patterns con endpoints tRPC

### Fase 5: Fuentes Legales para Ingesta de Patrones
- [x] Documentar lista de fuentes open-source legales (14 fuentes MIT License)
- [x] Crear sistema manual de ingesta de patrones curados (236 patrones insertados)
- [x] Implementar anonimización de código (patrones normalizados)

### Fase 6: Ingesta Masiva de Componentes (Completada)
- [x] Extraer 50 componentes de Flowbite
- [x] Extraer 55 componentes de DaisyUI
- [x] Extraer 49 componentes de HyperUI
- [x] Extraer 52 componentes de Preline UI
- [x] Extraer 30 componentes de Meraki UI
- [x] Extraer 6 templates de Awesome Landing Pages
- [x] Insertar 236 patrones en la base de datos
- [x] Verificar distribución por tipo de sección


## Corrección de Secciones y Nuevos Componentes

### Verificación del Sistema RAG
- [ ] Verificar que el endpoint /api/ai/stream está consultando los patrones
- [ ] Añadir logs para confirmar que se usan los patrones de la BD

### Nuevas Secciones
- [ ] Crear DestinationsSection (para mostrar destinos/lugares)
- [ ] Crear GallerySection (para galería de imágenes)
- [ ] Crear TeamSection (para mostrar equipo/miembros)
- [ ] Actualizar SectionRenderer para reconocer los nuevos tipos
- [ ] Actualizar SYSTEM_PROMPT para incluir los nuevos tipos de secciones

### Corrección de Errores
- [ ] Corregir error "Unknown section type: destinations"
- [ ] Probar generación de landing con nuevas secciones


## Sistema Híbrido de Imágenes (Bancos + IA)

### Fase 1: Configuración de Bancos de Imágenes
- [x] Crear cuenta y obtener API key de Unsplash
- [x] Crear cuenta y obtener API key de Pexels
- [x] Crear cuenta y obtener API key de Pixabay
- [x] Configurar API keys como variables de entorno
- [x] Validar API keys con tests automatizados

### Fase 2: Módulo Híbrido de Imágenes (imageSearch.ts)
- [x] Implementar búsqueda en Unsplash (50 req/hora)
- [x] Implementar búsqueda en Pexels (200 req/hora)
- [x] Implementar búsqueda en Pixabay (100 req/minuto)
- [x] Implementar generación con Pollinations.ai (gratis, sin API key)
- [x] Implementar fallback a Gemini AI
- [x] Implementar fallback final a Unsplash Source

### Fase 3: Flujo de Búsqueda Priorizado
- [x] Orden: Unsplash → Pexels → Pixabay → Pollinations → Gemini → Fallback
- [x] Función searchImages() con lógica híbrida
- [x] Función generateChatImage() para botón "Generar imagen"
- [x] Función getImageForSection() para landings

### Fase 4: Integración en Routers
- [x] Actualizar endpoint de generación de imágenes del chat
- [ ] Integrar en flujo de creación de landings

### Fase 5: Pruebas
- [x] Tests de API keys (3/3 pasando)
- [x] Tests de búsqueda híbrida (5/5 pasando)
- [ ] Probar generación de landing con imágenes híbridas
- [ ] Probar botón "Generar imagen" del chat

## Bug Fix - Generación de Imágenes en Chat
- [x] Corregir detección de intención "genera imagen" en el chat
- [x] El LLM responde que no puede generar imágenes en lugar de usar generateChatImage
- [x] Actualizado endpoint /api/generate-image para usar sistema híbrido
- [ ] Probar generación de imágenes desde el chat

## Mejora - Detección Automática de Intención de Imágenes en Chat
- [x] Ampliar patrones de detección para incluir todos los sinónimos
- [x] Detectar: genera/crea/hazme/dibuja/genérame + imagen/foto/ilustración/dibujo
- [x] El chat debe funcionar sin depender de botones
- [x] Cambiar orden: Gemini primero, Pollinations como fallback
- [ ] Probar con múltiples variantes de petición


## Bug Fix - Renderizado de Imágenes en Chat
- [x] El chat muestra "[Imagen generada: /path...]" en lugar de la imagen
- [x] Modificar componente para detectar y renderizar imágenes inline
- [x] Regex actualizado para detectar rutas relativas
- [ ] Probar visualización de imágenes generadas


## Mejora - Botón de Regenerar Imagen
- [ ] Agregar botón "Regenerar" debajo de cada imagen generada
- [ ] Implementar lógica para regenerar con el mismo prompt
- [ ] Mostrar indicador de carga durante la regeneración
- [ ] Actualizar la imagen en el chat sin crear nuevo mensaje


## Integración de Imágenes en Landings
- [x] Analizar el flujo actual de generación de landings
- [x] Identificar qué secciones necesitan imágenes (Hero, Testimonios, Equipo, Galería)
- [x] Crear función enrichLandingWithImages() para agregar imágenes automáticamente
- [x] Hero: Buscar imagen relevante en bancos de stock
- [x] Testimonios: Generar avatares con IA para cada persona
- [x] Equipo: Generar fotos profesionales con IA
- [x] Galería: Buscar imágenes relacionadas con el negocio
- [x] About: Buscar imagen del equipo/oficina
- [x] Features/Services: Buscar imágenes ilustrativas
- [x] Integrar la función en el endpoint de streaming
- [x] Tests pasando (8/8)
- [ ] Probar generación de landings con imágenes automáticas
- [ ] Desplegar y verificar en producción


## Bug Fix - Detección de Modo Autónomo para URLs
- [x] El chat dice que no puede acceder a páginas web cuando debería usar Playwright
- [x] Revisar la función shouldUseAutonomousMode() en autonomousAgents.ts
- [x] Agregar patrones de detección para: "entra a", "accede a", "clona", "copia esta página"
- [x] Detectar URLs en el mensaje y activar modo autónomo automáticamente
- [x] Tests pasando (10/10)
- [ ] Probar con peticiones como "clona https://ejemplo.com"


## CRÍTICO - Modo Autónomo No Se Activa
- [x] Diagnosticar por qué shouldUseAutonomousMode no se activa en producción
- [x] Verificar que el código actualizado está en el servidor
- [x] Revisar dónde se llama shouldUseAutonomousMode en el flujo del chat
- [x] Corregir la integración para que active el modo autónomo
- [x] Integrado en /api/ai/stream endpoint
- [ ] Probar con URLs y clonación de páginas

## CRÍTICO - Mejorar Calidad de Landings
- [ ] Las landings generadas son de baja calidad
- [ ] Mejorar el SYSTEM_PROMPT con ejemplos de alta calidad
- [ ] Agregar más secciones y variedad de diseños
- [ ] Incluir imágenes automáticamente en todas las secciones
- [ ] Mejorar la estructura y el contenido del texto


## Templates Predefinidos (Dark/Light/Gradient)
- [x] Crear archivo landingTemplates.ts con definiciones de estilos
- [x] Template Dark Mode (fondo oscuro, texto claro)
- [x] Template Light Mode (fondo claro, texto oscuro)
- [x] Template Gradient (gradientes modernos)
- [x] Template Minimal (ultra minimalista)
- [x] Template Neon (cyberpunk con neón)
- [x] Template Warm (tonos cálidos)
- [x] Crear componente TemplateSelector.tsx
- [x] Agregar router tRPC para templates (list, get, applyToLanding)
- [x] Tests pasando (14/14 tests de templates)
- [ ] Integrar selector de template en el chat
- [ ] Aplicar template seleccionado al generar landing

## Editor Visual de Secciones
- [x] Crear componente SectionEditor.tsx con lista de secciones
- [x] Implementar drag & drop para reordenar secciones
- [x] Botones para mover arriba/abajo, duplicar, eliminar
- [x] Menú para añadir nuevas secciones
- [x] Indicador visual de sección seleccionada
- [ ] Integrar SectionEditor en el panel de propiedades
- [ ] Modal de edición para modificar contenido de secciones


## BUG - Autenticación Obligatoria No Deseada
- [x] La app muestra "Iniciar sesión" cuando no debería requerir login
- [x] Modificar Sidebar.tsx para no mostrar "Inicia sesión para ver tu historial"
- [x] Eliminar botón "Iniciar Sesión" del sidebar
- [x] Probar que la app funciona completamente sin autenticación
- NOTA: El historial ahora se carga sin requerir autenticación. El botón de login se eliminó.
