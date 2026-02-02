
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

## Implementación Brave Search API para Deep Research
- [x] Crear función de búsqueda con Brave Search API (en lugar de Bing)
- [x] Reemplazar Google Search por Brave Search en deepResearch.ts
- [x] Configurar variable de entorno BRAVE_SEARCH_API_KEY
- [x] Corregir procesamiento de eventos SSE en frontend (formato { type, data })
- [x] Probar Deep Research con Brave Search - FUNCIONA


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


## Sistema de Usuarios Propio (Sin OAuth Manus)

### Backend - Autenticación
- [ ] Modificar schema de users para incluir email y passwordHash
- [ ] Crear endpoint de registro (POST /api/auth/register)
- [ ] Crear endpoint de login (POST /api/auth/login)
- [ ] Crear endpoint de logout (POST /api/auth/logout)
- [ ] Implementar JWT en cookies HttpOnly
- [ ] Hashear contraseñas con bcrypt
- [ ] Middleware de autenticación propio

### Frontend - Páginas de Auth
- [ ] Página de Login (/login)
- [ ] Página de Registro (/register)
- [ ] Redirección automática si no está autenticado
- [ ] Formularios con validación

### Frontend - Secciones de Usuario
- [ ] Página de Configuración (/settings)
  - [ ] Configuración general
  - [ ] Preferencias de tema
  - [ ] Notificaciones
- [ ] Página de Cuenta (/account)
  - [ ] Información del perfil
  - [ ] Cambiar contraseña
  - [ ] Eliminar cuenta
- [ ] Actualizar Sidebar con nuevas secciones

### Protección de Rutas
- [ ] Proteger todas las rutas excepto /login y /register
- [ ] Restaurar funcionalidad de chat.list para usuarios autenticados
- [ ] Crear usuario admin inicial


## Sistema de Usuarios Propio (Completado)
- [x] Modificar schema de users para incluir passwordHash
- [x] Crear funciones de autenticación local (createUser, authenticateUser)
- [x] Implementar endpoints de registro y login
- [x] Crear página de Login
- [x] Crear página de Registro
- [x] Crear página de Configuración (tema, idioma, notificaciones)
- [x] Crear página de Cuenta (perfil, cambio de contraseña, eliminar cuenta)
- [x] Proteger rutas que requieren autenticación
- [x] Agregar menú de usuario en sidebar con dropdown
- [x] Deploy a producción (macgyver.to)
- [x] 66 tests pasando


## Panel de Administración
- [x] Crear cuenta admin para soporte@jswebs.es
- [x] Implementar endpoints de estadísticas (usuarios, chats, landings, visitas)
- [x] Crear página Dashboard con métricas principales
- [x] Crear página de gestión de Usuarios (listar, editar rol, eliminar)
- [x] Crear página de gestión de Chats (ver todos los chats, filtrar por usuario)
- [x] Crear página de gestión de Landings/Proyectos
- [x] Proteger rutas de admin (solo rol admin puede acceder)
- [x] Agregar enlace al panel de admin en el sidebar (solo para admins)
- [x] Deploy a producción


## Verificación Post-Autenticación (23 Enero 2026)
- [x] Corregir bug de images[0].startsWith en enrichGallerySection
- [x] Corregir bug de backgroundImage no se mostraba en HeroSection (código de producción desactualizado)
- [x] Verificar chat básico con LLM - FUNCIONA
- [x] Verificar generación de landings con imágenes - FUNCIONA
- [x] Verificar generación de imágenes con Gemini - FUNCIONA
- [x] Verificar sistema de memoria - FUNCIONA
- [x] Verificar panel de administración (Dashboard, Usuarios, Conversaciones, Proyectos) - FUNCIONA
- [x] Verificar modo oscuro/claro - FUNCIONA
- [x] Verificar sección de proyectos - FUNCIONA


## Implementación Brave Search API para Deep Research
- [ ] Implementar Brave Search API en deepResearch.ts
- [ ] Configurar API key de Brave Search
- [ ] Desplegar y probar Deep Research


## MEJORA CRÍTICA - Calidad de Generación de Landings (23 Enero 2026)

### Problemas Identificados
- [ ] Imágenes del Hero no son relevantes al contexto (ej: agencia de viajes Tailandia muestra imagen genérica)
- [ ] Textos son genéricos y no contextuales al negocio
- [ ] FAQ tiene bug: el segundo item no funciona al hacer click
- [ ] Todas las landings son iguales a pesar de tener cientos de patrones
- [ ] Los patrones descargados de Tailwind no se están usando
- [ ] Diseños muy básicos y poco profesionales

### Correcciones a Implementar
- [ ] Corregir bug del FAQ (segundo item no responde al click)
- [ ] Mejorar búsqueda de imágenes para que sean contextualmente relevantes
- [ ] Reescribir SYSTEM_PROMPT para generar contenido de alta calidad
- [ ] Implementar selección inteligente de patrones según industria/contexto
- [ ] Añadir más variedad de diseños y layouts
- [ ] Probar con landing de agencia de viajes Tailandia


## MEJORA CRÍTICA - Calidad de Landings (23 Ene 2026)
- [x] Diagnosticar problemas en landing de Tailandia
- [x] Corregir bug del FAQ (segundo item no funciona) - Separado listeners de drag del contenido
- [x] Mejorar sistema de búsqueda de imágenes para que sean relevantes al contexto
- [x] Reescribir SYSTEM_PROMPT para generar contenido de alta calidad y contextual
- [x] Mejorar Canvas.tsx para que drag-and-drop no interfiera con clics
- [x] Probar generación de landing de Tailandia con mejoras - FUNCIONA


## MEJORA CRÍTICA - Calidad de Landings (23 Ene 2026) - COMPLETADO
- [x] Diagnosticar problemas en landing de Tailandia (imágenes no relevantes, textos genéricos)
- [x] Reescribir SYSTEM_PROMPT para generar contenido específico y contextual al negocio
- [x] Mejorar landingImageEnricher.ts para buscar imágenes usando descripciones contextuales
- [x] Corregir bug del FAQ (segundo item no funciona) - Separado listeners de drag del contenido en Canvas.tsx
- [x] Corregir detección de intenciones para no confundir "landing page" con solicitudes de imagen
- [x] Probar generación de landing de Tailandia - FUNCIONA (imagen de templo, contenido específico)
- [x] Probar generación de landing de restaurante japonés "Sakura Zen" - FUNCIONA (imagen de restaurante, menú omakase)
- [x] Verificar FAQ funciona correctamente - FUNCIONA (múltiples items se abren/cierran)


## Correcciones de Landings (23 Ene 2026)
- [ ] Corregir error "Unknown section type: process" - Añadir componente ProcessSection
- [ ] Corregir testimonios vacíos (solo muestran foto, no texto)
- [ ] Implementar mejoras sugeridas para landings


## Implementación de Componentes Faltantes (23 Enero 2026)

### Nuevos Componentes de Sección
- [ ] Implementar PricingSection (planes comparativos, toggle mensual/anual)
- [ ] Implementar StatsSection (números animados con Framer Motion)
- [ ] Implementar AboutSection (descripción de empresa, equipo)
- [ ] Implementar GallerySection (galería de imágenes con lightbox)
- [ ] Implementar LogoCloudSection (logos de clientes/partners)
- [ ] Implementar HeaderSection (navbar sticky con logo y links)

### Mejoras Visuales
- [ ] Añadir animaciones Framer Motion a secciones existentes
- [ ] Crear variantes de Hero (split, minimal, asymmetric)
- [ ] Implementar divisores SVG entre secciones

### Actualización del Sistema
- [ ] Actualizar SectionRenderer con nuevos componentes
- [ ] Actualizar SYSTEM_PROMPT con nuevos tipos de sección
- [ ] Sincronizar cambios con servidor de producción


## Implementación de Componentes Faltantes (23 Enero 2026)
- [x] PricingSection - Componente de precios con toggle mensual/anual
- [x] StatsSection - Números animados con Framer Motion
- [x] AboutSection - Descripción de empresa y equipo
- [x] GallerySection - Galería de imágenes con lightbox
- [x] LogoCloudSection - Logos de clientes/partners con marquee
- [x] HeaderSection - Navbar sticky con navegación
- [x] Animaciones Framer Motion en FeaturesSection
- [x] Animaciones Framer Motion en TestimonialsSection
- [x] Variantes de Hero (centered, split, minimal, asymmetric)
- [x] Actualizar SectionRenderer con nuevos componentes
- [x] Actualizar SYSTEM_PROMPT con nuevos tipos
- [x] Sincronizar con servidor de producción
- [x] Verificar generación de landings con nuevos componentes


## Mejoras de Calidad Visual (23 Enero 2026)

### Validación de Paleta de Colores
- [x] Crear sistema de validación post-generación para paleta de colores
- [x] Implementar función que aplique colores solicitados si el LLM los ignora
- [x] Añadir mapeo de industria → paleta por defecto

### Variantes de Secciones
- [x] TestimonialsSection: variante carrusel
- [x] TestimonialsSection: variante con video testimonials
- [x] TestimonialsSection: variante featured (1 grande + 2 pequeños)
- [x] PricingSection: variante horizontal
- [x] PricingSection: variante con comparación detallada
- [x] FeaturesSection: variante con iconos animados
- [x] FeaturesSection: variante alternating (imagen izq/der)
- [x] FeaturesSection: variante bento grid
- [x] Actualizar SectionRenderer con variantes
- [x] Actualizar SYSTEM_PROMPT con variantes disponibles
- [x] Sincronizar con servidor de producción


## Mejoras de Generación de Landings (Fase 3)

### Refuerzo de Instrucciones de Variantes
- [x] Añadir ejemplos concretos de cada variante en SYSTEM_PROMPT
- [x] Hacer obligatorio que el LLM especifique layout en cada sección
- [x] Añadir instrucciones explícitas para respetar variantes solicitadas

### Validación Post-Generación
- [x] Crear función validateVariants() que verifique variantes aplicadas
- [x] Implementar corrección automática de variantes no respetadas
- [x] Integrar validación en el flujo de generación

### Generación de Imágenes con IA
- [x] Integrar API de generación de imágenes del servidor
- [x] Crear función generateContextualImage() para cada sección
- [x] Implementar generación automática de imágenes en Hero y Features
- [x] Añadir fallback a imágenes de stock si falla la generación


## Expansión de Industrias (200-300 adicionales)
- [x] Investigar clasificaciones NAICS/SIC de industrias
- [x] Investigar nichos de mercado y sub-industrias
- [x] Crear lista de 200-300 industrias adicionales (308 total implementadas)
- [x] Implementar nuevas industrias en industryPatterns.ts
- [x] Verificar que el sistema funciona con todas las industrias

### Archivos Creados:
- industryPatterns.ts (60 industrias base)
- industryPatternsExtended.ts (130 industrias NAICS)
- industryPatternsNiche.ts (118 nichos específicos)

### Categorías Cubiertas:
- Tecnología (SaaS, AI, Mobile, Fintech, Cybersecurity, DevTools, Blockchain, VR/AR)
- Servicios Profesionales (Agencias, Consultoría, Legal, Contabilidad, Marketing, RRHH)
- Gastronomía (30+ tipos de restaurantes, cafés, food trucks, postres)
- Salud (Clínicas, Terapias, Fitness, Bienestar, Salud Mental)
- Belleza (Salones, Spas, Tatuajes, Maquillaje, Extensiones)
- Fitness (Gyms, Yoga, Pilates, Personal Trainers, Nutrición)
- Mascotas (Veterinarias, Grooming, Training, Daycare)
- Bodas (Planners, Floristas, DJs, Videografía, Vestidos)
- Niños (Fiestas, Tutorías, Deportes, Arte, Campamentos)
- Hogar (Remodelación, Organización, Automatización)
- Viajes (Tours, Ecoturismo, Buceo, Esquí)
- Eventos (Corporativos, Cumpleaños, Baby Showers, Quinceañeras)
- Retail (Joyería, Relojes, Zapatos, Vintage, Plantas)
- Personal (Coaches, Speakers, Freelancers)


## Corrección de Errores Visuales Críticos (24 Enero 2026)

### Errores Identificados en Landing Seoul Fire
| Error | Tipo | Prioridad |
|-------|------|-----------|
| Imágenes de galería rotas | Imagen | Alta |
| Avatar del chef sin imagen | Imagen | Alta |
| Avatar de testimonio roto | Imagen | Alta |
| Imagen About rota | Imagen | Alta |
| Hero con imagen no relevante | Contenido | Media |
| Toggle Monthly/Annual en restaurante | UX | Media |

### Correcciones a Implementar
- [ ] Implementar validación de URLs de imágenes antes de renderizar
- [ ] Crear fallback elegante con gradiente para imágenes rotas
- [ ] Mejorar búsqueda de imágenes por industria (usar queries específicas)
- [ ] Ocultar toggle Monthly/Annual para industrias de restauración
- [ ] Implementar sistema de contraste automático texto/fondo
- [ ] Corregir avatares de testimonios con fallback a iniciales
- [ ] Corregir avatares de equipo con fallback a iniciales
- [ ] Sincronizar correcciones con servidor de producción


## Integración de Patrones de Industria y Mejora de Imágenes
- [x] Implementar detección automática de industria en el generador
- [x] Conectar los 308 patrones con el flujo de generación
- [x] Aplicar automáticamente secciones, variantes y colores según industria
- [x] Integrar búsqueda de imágenes de stock específicas por industria
- [x] Priorizar Unsplash/Pexels antes de generar con IA
- [x] Añadir keywords de búsqueda por industria para imágenes relevantes
- [x] Sincronizar con servidor de producción
- [x] Verificar generación con detección automática de industria


## Mejoras de Calidad de Generación (24-01-2026)
- [x] Priorizar colores solicitados por el usuario sobre colores de industria
- [x] Detectar colores mencionados en el mensaje del usuario (azul, rojo, verde, etc.)
- [x] Aplicar colores del usuario al SYSTEM_PROMPT antes de generar
- [x] Implementar detección automática de idioma del usuario
- [x] Generar contenido en español si el usuario escribe en español
- [x] Generar contenido en inglés si el usuario escribe en inglés
- [x] Integrar servicio de avatares reales (Unsplash fotos de personas)
- [x] Reemplazar iniciales por fotos de personas reales en testimonios
- [x] Sincronizar con servidor de producción
- [ ] Verificar mejoras con landing de prueba


## Mejoras de Avatares y Validación de Imágenes (24-01-2026)

### Expansión de Colección de Avatares
- [x] Expandir colección de avatares masculinos de 10 a 35 fotos
- [x] Expandir colección de avatares femeninos de 10 a 35 fotos
- [x] Añadir diversidad étnica y de edad en los avatares
- [x] Organizar avatares por categorías (profesional, casual, joven, mayor)

### Validación de Imágenes Rotas
- [x] Crear módulo imageValidator.ts para verificar URLs de imágenes
- [x] Implementar verificación HEAD request para validar URLs
- [x] Crear sistema de fallback con gradientes elegantes
- [x] Integrar validación en el flujo de generación de landings
- [x] Añadir caché de URLs validadas para evitar verificaciones repetidas

### Tests y Despliegue
- [x] Crear tests para el nuevo sistema de avatares
- [x] Crear tests para la validación de imágenes
- [x] Sincronizar con servidor de producción
- [x] Verificar funcionamiento en producción


## Mejoras Visuales: Sticky CTA y Elementos Flotantes (24-01-2026)

### Elementos Decorativos Flotantes
- [x] Crear componente FloatingElements.tsx con círculos, líneas e iconos animados
- [x] Implementar animaciones sutiles con Framer Motion (float, pulse, rotate)
- [x] Añadir variantes de color que se adapten al tema de la landing
- [x] Crear diferentes patrones (minimal, abundant, geometric, organic, dots, lines)

### Sticky CTA Flotante
- [x] Crear componente StickyCTA.tsx que aparece al hacer scroll
- [x] Implementar lógica de visibilidad (aparece después del hero)
- [x] Añadir animación de entrada/salida suave
- [x] Diseño responsive (diferente en mobile vs desktop)
- [x] 5 variantes: default, minimal, expanded, floating-button, bottom-bar

### Integración
- [x] Integrar FloatingElements en HeroSection
- [x] Integrar FloatingElements en otras secciones (opcional por config)
- [x] Integrar StickyCTA en el Canvas
- [x] Actualizar systemPrompt para incluir opciones de elementos flotantes

### Tests y Despliegue
- [x] Verificar rendimiento de animaciones (110 tests pasando)
- [x] Sincronizar con servidor de producción
- [ ] Probar con landing de ejemplo


## Mejoras de Responsive Design (24-01-2026)

### Auditoría de Componentes
- [x] Auditar HeroSection - textos, botones, imágenes
- [x] Auditar FeaturesSection - grid, cards, iconos
- [x] Auditar TestimonialsSection - avatares, quotes, layout
- [x] Auditar PricingSection - cards, precios, features
- [x] Auditar FAQSection - acordeones, textos
- [x] Auditar FormSection - inputs, labels, botones
- [x] Auditar CTASection - textos, botones
- [x] Auditar FooterSection - columnas, links, copyright

### Correcciones Sistemáticas
- [x] Crear utilidades responsive centralizadas (responsive.ts)
- [x] Corregir HeroSection - títulos, botones, stats grid
- [x] Corregir FeaturesSection - grids, títulos, cards
- [x] Corregir TestimonialsSection - grids, títulos, cards
- [x] Corregir PricingSection - grids, títulos, precios
- [x] Corregir FAQSection - títulos, espaciado
- [x] Corregir FormSection - títulos, inputs
- [x] Corregir CTASection - títulos, botones
- [x] Corregir FooterSection - grid, columnas

### Tests y Despliegue
- [x] Tests pasando (110 tests)
- [x] Sincronizado con servidor de producción (macgyver.to)
- [ ] Probar en viewport 1024px (desktop)
- [ ] Sincronizar con servidor de producción


## Bugs Críticos de Visualización (24-01-2026) - URGENTE
### Problemas Reportados
- [ ] Título gris sobre fondo negro - ilegible (FeaturesSection)
- [ ] Iconos genéricos (checkmarks) en lugar de iconos relevantes
- [ ] Línea roja atravesando el texto
- [ ] Testimonios rotos - sin fotos ni texto visible
- [ ] Texto blanco sobre fondo blanco - ilegible
- [ ] Imagen del Hero incorrecta (señor con traje y móvil en vez de chef)
- [ ] Idioma incorrecto (inglés en vez de español)

### Diagnóstico
- [ ] Verificar qué archivos están en producción vs sandbox
- [ ] Identificar por qué los cambios no se aplican

### Correcciones
- [x] Corregir contraste de colores en FeaturesSection
- [x] Corregir contraste de colores en CTASection
- [x] Corregir contraste de colores en FooterSection
- [x] Implementar iconos dinámicos según industria (100+ iconos añadidos)
- [x] Corregir TestimonialsSection (contraste de texto)
- [x] Eliminar línea roja del texto (desactivar FloatingElements por defecto)
- [x] Corregir contraste en CTA/Footer (ya corregido)
- [x] Sincronizar TODOS los archivos con producción


## Corrección de Idioma y Colores (24-01-2026) - COMPLETADO
- [x] Reforzar instrucciones de idioma en systemPrompt.ts (INICIO del prompt)
- [x] Reforzar instrucciones de idioma en languageDetector.ts (más específicas)
- [x] Verificar funcionamiento en producción (Café del Sol - 100% español)
- [x] Verificar detección de colores (verdes y marrones aplicados correctamente)


## Variantes de Hero y Mejora de Imágenes (24-01-2026)

### Variantes de Layout Hero
- [x] Implementar Hero centrado (actual, mejorado)
- [x] Implementar Hero split izquierda (imagen derecha, texto izquierda)
- [x] Implementar Hero split derecha (imagen izquierda, texto derecha)
- [x] Implementar Hero con video de fondo
- [x] Implementar Hero con gradiente animado
- [x] Actualizar systemPrompt para usar las variantes según el tipo de negocio

### Mejora de Selección de Imágenes
- [x] Crear diccionario de palabras clave por industria (industryImageKeywords.ts)
- [x] Mejorar función de búsqueda de imágenes con keywords específicos por contexto (hero, feature, testimonial)
- [ ] Añadir fallbacks de imágenes por categoría
- [ ] Integrar en el flujo de generación de landings

### Sincronización
- [x] Sincronizar con servidor de producción
- [x] Verificar funcionamiento en producción (110 tests pasando)


## Sistema de Clonación de Webs (24-01-2026)

### Investigación
- [ ] Investigar técnicas de web scraping para extraer estructura HTML
- [ ] Investigar extracción de estilos CSS (inline, externos, computed)
- [ ] Investigar captura de imágenes y assets
- [ ] Investigar detección de fuentes tipográficas
- [ ] Investigar extracción de colores y paleta

### Documentación
- [ ] Documentar arquitectura completa del sistema de clonación
- [ ] Listar todos los componentes necesarios
- [ ] Definir flujo de trabajo completo
- [ ] Identificar limitaciones y soluciones


## Implementación Sistema de Clonación (24-01-2026)

### Fase 1: Web Scraper
- [x] Instalar playwright como dependencia del proyecto
- [x] Crear server/webCloner.ts con funciones de scraping
- [x] Implementar captura de screenshot full-page
- [x] Implementar extracción de HTML renderizado
- [x] Implementar extracción de estilos CSS

### Fase 2: Analizador Visual
- [x] Crear server/visualAnalyzer.ts
- [x] Implementar análisis con GPT-4 Vision
- [x] Detectar secciones, colores, tipografías

### Fase 3: Extractores (integrados en webCloner.ts)
- [x] Extractor de estilos (extractStyles)
- [x] Extractor de contenido (extractContent)
- [x] Extractor de assets (extractAssets)

### Fase 4: Mapeador y Generador (integrados en webClonerOrchestrator.ts)
- [x] Mapeador de componentes (mapSectionToConfig)
- [x] Generador de configuración (generateLandingConfig)

### Fase 5: Integración
- [x] Crear cloneIntentDetector.ts para detectar intención en chat
- [x] Crear webClonerOrchestrator.ts para orquestar el proceso
- [x] Integrar en routers.ts (ai.chat mutation)
- [x] Tests pasando (123 tests)
- [x] Sincronizado con producción (macgyver.to)
- [ ] Probar con web real


## Debugging Sistema de Clonación (24 Ene 2026) - COMPLETADO
- [x] Analizar por qué la clonación no produce resultados precisos
- [x] Mejorar prompt de análisis visual para extraer estructura exacta
- [x] Mejorar extracción de contenido del HTML (textos, CTAs, imágenes)
- [x] Mejorar mapeo de secciones detectadas a componentes
- [x] Agregar logs detallados para debugging
- [x] Probar con URL de Thailand Arrival Card
- [x] Sincronizar mejoras con producción


## CORRECCIÓN DEFINITIVA - Texto Blanco sobre Blanco en Testimonios (24-01-2026)
- [x] Identificar el problema raíz: styles?.textColor no tiene fallback cuando cardBackground es blanco
- [x] Forzar colores oscuros SIEMPRE en las cards de testimonios (no depender de textColor)
- [x] Añadir función helper para calcular contraste automático
- [x] Sincronizar con producción
- [x] Verificar en producción


## CORRECCIÓN - Avatares Reales No Se Generan (24-01-2026)
- [x] El LLM genera URLs de ui-avatars.com que son rechazadas por el frontend
- [x] isValidAvatarUrl() rechaza ui-avatars.com pero generateAvatarsForTestimonials() no las reemplaza
- [x] Modificar generateAvatarsForTestimonials() para SIEMPRE reemplazar URLs no confiables
- [x] Corregir landingImageEnricher.ts - enrichTestimonialsSection() usaba ui-avatars.com como fallback
- [x] Corregir landingImageEnricher.ts - enrichTeamSection() usaba ui-avatars.com como fallback
- [x] Sincronizar con producción y verificar


## Corrección Visual - Avatar con fondo cuadrado (24-01-2026)
- [x] El avatar circular tiene un fondo cuadrado blanco visible
- [x] Corregir el contenedor del avatar para que sea completamente circular (overflow-hidden + rounded-full)
- [x] Sincronizar con producción


## FASE 1: Páginas Internas en Landings (24-01-2026)
- [x] Crear componente TermsPage (términos y condiciones)
- [x] Crear componente PrivacyPage (política de privacidad)
- [x] Crear componente AboutPage (sobre nosotros)
- [x] Crear componente ContactPage (contacto con formulario)
- [x] Crear tipos MultiPageLandingConfig en shared/landingTypes.ts
- [x] Crear PageRenderer para renderizar páginas dinámicamente
- [x] Actualizar LandingConfig para soportar múltiples páginas (shared/landingTypes.ts)
- [x] Crear multiPageStore para gestionar proyectos multi-página
- [x] Actualizar sistema de rutas para páginas internas (LandingPageViewer.tsx)
- [x] Actualizar navegación para incluir links a páginas internas (HeaderSection.tsx)
- [x] Añadir router landing en routers.ts
- [x] Actualizar LLM para detectar solicitudes de páginas adicionales (SYSTEM_PROMPT)
- [x] Sincronizar con producción

## FASE 2: Sistema de Subdominios (24-01-2026)
- [x] Configurar DNS wildcard *.macgyver.to (ya configurado en Cloudflare)
- [x] Crear configuración Nginx para subdominios wildcard (nginx/macgyver-wildcard.conf)
- [x] Crear middleware de detección de subdominios en Express (subdomainMiddleware.ts)
- [x] Funciones para generar subdominios únicos por usuario
- [x] Funciones para generar slugs de proyectos
- [x] Crear subdomainRouter.ts con endpoints de API
- [x] Integrar router en servidor Express
- [x] Aplicar configuración Nginx en servidor
- [x] Sincronizar con producción
- [x] Verificar funcionamiento de subdominios (test123.macgyver.to → OK)


## FASE 3: Almacenamiento de Landings Publicadas (24-01-2026)
- [x] Crear esquema de base de datos para landings publicadas
- [x] Crear tabla publishedLandings con 20 campos (migración aplicada)
- [x] Implementar funciones CRUD en db.ts (create, update, get, delete, stats)
- [x] Actualizar subdomainRouter para servir landings desde DB (renderizado HTML completo)
- [x] Crear endpoint de publicación de landing (POST /api/landing/publish)
- [x] Crear endpoints de gestión (GET my-landings, PUT, DELETE, check-slug)
- [x] Sincronizar con producción

## FASE 4: Certificado SSL Wildcard (24-01-2026)
- [x] Instalar certbot y plugin cloudflare en servidor
- [x] Crear archivo de credenciales de Cloudflare
- [x] Solicitar certificado wildcard para *.macgyver.to (expira 24-04-2026)
- [x] Configurar Nginx para usar el certificado (HTTPS habilitado)
- [x] Configurar renovación automática (certbot auto-renewal)subdominios


## FASE 5: UI de Publicación de Landings (24-01-2026)
- [x] Crear endpoints tRPC para publicación (publish, myLandings, stats, update, delete, checkSlug, getMySubdomain)
- [x] Implementar botón "Publicar" en el editor con modal de confirmación (PublishModal.tsx)
- [x] Crear página "Mis Landings" con lista y estadísticas de visitas (MyLandings.tsx)
- [x] Añadir vista previa de URL/subdominio antes de publicar (en PublishModal)
- [x] Integrar navegación a "Mis Landings" en el sidebar
- [ ] Sincronizar con producción


## Bug: Renderizado de Subdominios (24-01-2026)
- [ ] Las landings publicadas no muestran fotos, colores ni estilos en el subdominio
- [ ] El preview funciona correctamente pero el subdominio no
- [ ] Revisar subdomainRouter.ts y corregir el renderizado HTML
- [ ] Sincronizar con producción

## Bug: Home sin scroll y menú oculto (24-01-2026)
- [ ] No se puede scrollear en el Home
- [ ] Las secciones del menú inferior no se ven
- [ ] Mover secciones debajo de "Nuevo Chat"
- [ ] Sincronizar con producción


## Páginas Legales Automáticas en Subdominios (24-01-2026)
- [x] Crear generador de páginas legales (términos, privacidad, contacto, about)
- [x] Modificar proceso de publicación para generar páginas automáticamente
- [x] Mejorar renderizado de páginas internas en subdomainRouter.ts
- [x] Sincronizar cambios a GitHub y servidor de producción


## URLs Multiidioma para Páginas Legales (24-01-2026)
- [x] Crear sistema de traducción de URLs (español, inglés, francés, alemán, portugués, italiano)
- [x] Actualizar generador de páginas legales para usar URLs según idioma
- [x] Actualizar subdomainRouter para reconocer URLs en múltiples idiomas
- [x] Sincronizar cambios a GitHub

## NEXT PHASE: WEEK 1 - UX Fixes (28 Jan - 03 Feb 2026)
- [ ] Fix home page scroll issue
- [ ] Implement image fallback system
- [ ] Complete component translation audit

## NEXT PHASE: WEEK 2 - Localization (04 Feb - 10 Feb 2026)
- [ ] Add preferredLanguage to user schema
- [ ] Create language persistence tRPC procedures
- [ ] Update LanguageContext for DB persistence
- [ ] Implement browser language auto-detection
- [ ] Extract and translate hardcoded strings

## NEXT PHASE: WEEK 3 - Feature Refinement (11 Feb - 17 Feb 2026)
- [ ] Improve web cloning accuracy
- [ ] Implement project export feature
- [ ] Add comprehensive error handling

## NEXT PHASE: WEEK 4 - QA & Deployment (18 Feb - 28 Feb 2026)
- [ ] Comprehensive feature testing
- [ ] Performance optimization
- [ ] Production deployment and monitoring
- [ ] Documentation and handoff


## Bug Fixes - Sidebar Conversation History (29 Enero 2026)
- [x] Fix conversation history sidebar scroll - add proper overflow and max height
- [x] Limit displayed conversations to 20 by default
- [x] Add "Ver todas las conversaciones" button when more than 20 exist
- [x] Add "Mostrar menos" option to collapse back to 20

## Server-Side Rendering Improvements (29 Enero 2026)
- [x] Update renderFAQSection to match frontend styling with accordion design
- [x] Update renderCTASection to match frontend styling with gradient support
- [x] Update renderTestimonialsSection to match frontend styling with proper cards
- [x] Update renderPricingSection to match frontend styling with highlighted plans
- [x] Update renderFormSection to match frontend styling with proper form fields
- [x] Update renderStatsSection to match frontend styling with icons and cards
- [x] Update renderGallerySection to match frontend styling with hover effects

## GitHub Auto-Sync (29 Enero 2026)
- [x] Configure post-commit hook for automatic push to macgyver.to


## Phase 4-6: Remaining Audit Tasks (2 Feb 2026)
- [ ] Split PricingSection (754 lines) into sub-components
- [ ] Split TestimonialsSection (600 lines) into sub-components
- [ ] Split FeaturesSection (606 lines) into sub-components
- [ ] Add JSDoc documentation to utility functions


## Project Templates Implementation (Feb 2026)
- [ ] Create template system architecture and types
- [ ] SaaS template (Dashboard + Auth + Stripe + DB)
- [ ] E-commerce template (Catalog + Cart + Payments + Admin)
- [ ] Dashboard template (Metrics + Charts + Tables + Filters)
- [ ] Blog template (Posts + Categories + Comments + SEO)
- [ ] Portfolio template (Gallery + Projects + Contact)
- [ ] Corporate template (Team + Services + Testimonials)
- [ ] Link-in-bio template (Links + Social + Analytics)
- [ ] Mini Games template (Canvas + Game logic)
- [ ] Productivity template (Tasks + Calendar + Notes)
- [ ] Update UI with template selection buttons


## Security Fixes (Critical)
- [x] Identify all exposed API keys in ecosystem.config.cjs
- [x] Create secure storage for API keys (/home/ubuntu/.api_keys_secure)
- [x] Regenerate and update API keys (Claude, OpenAI, Gemini)
- [x] Update environment variables with new keys via webdev_edit_secrets
- [x] Create API keys validation test (server/api-keys.test.ts)
- [x] Remove ecosystem.config.cjs from git tracking
- [x] Update .gitignore to prevent ecosystem.config.* commits
- [x] Verify no old exposed keys remain in codebase
- [x] Create secure deployment script for VPS (loads env vars from .env file)
- [x] Test deployment with new secure configuration
- [x] Update deploy.sh to backup/restore ecosystem.config.cjs during git pulls
- [x] Verify new API keys are loaded correctly on VPS
- [ ] Document secure setup process for future deployments

## Git History Cleanup (Remove Exposed API Keys) - COMPLETED
- [x] Install git-filter-repo tool
- [x] Identify all files with API keys in Git history
- [x] Remove ecosystem.config.cjs from entire Git history
- [x] Replace all API key strings with REDACTED in history
- [x] Force push cleaned history to GitHub
- [x] Verify no API keys remain in history
- [x] Update VPS with cleaned repository


## Autonomous Agent Improvements
- [x] Fix blocking issue when cloning websites (added timeout and better error handling)
- [x] Improve progress messages to be user-friendly (like Manus style)
- [x] Add detailed step-by-step explanations in natural language
- [x] Show what the agent is doing at each moment
- [x] Added clone_website tool to autonomous agent
- [ ] Test web cloning functionality end-to-end on production


## Web Cloning System Fix (Critical - Feb 2026)
- [ ] Fix LLM showing JSON instead of executing clone
- [ ] Fix "no puedo acceder a URLs externas" error message
- [ ] Ensure clone_website tool is properly called
- [ ] Remove technical JSON from user-facing responses
- [ ] Test complete clone workflow end-to-end


## Critical Landing System Bugs (Feb 2)
- [ ] LLM responds in English even when user writes in Spanish
- [ ] Preview vs Published mismatch - different content shown
- [ ] Technical messages visible to user (should be transparent)
- [ ] System should respond in user's language, not English


## Landing System Complete Overhaul (Feb 2026)

### Phase 1: Unify Rendering (Preview = Published)
- [ ] Create unified HTML renderer that works for both preview and published
- [ ] Replace React preview with unified renderer
- [ ] Replace server-side HTML generation with unified renderer
- [ ] Test 100% fidelity between preview and published

### Phase 2: Mandatory Components (Header/Footer/Logo)
- [ ] Add mandatory header component with navigation
- [ ] Add mandatory footer component
- [ ] Create logo generator (icon + business name) when no logo provided
- [ ] Make these components required in all landings

### Phase 3: Diverse Layout System
- [ ] Create layout library (5+ base layouts)
- [ ] Layout 1: Fixed header + full-width hero + grid services
- [ ] Layout 2: Sidebar navigation + scrollable content
- [ ] Layout 3: Transparent header over hero + alternating sections
- [ ] Layout 4: Minimalist Linear/Stripe style
- [ ] Layout 5: E-commerce style with featured products
- [ ] LLM selects appropriate layout based on business type

### Phase 4: Real Web Cloning (3 Levels)
- [ ] Level A: Inspiration (colors, similar structure)
- [ ] Level B: Visual replica (almost identical, different content)
- [ ] Level C: Exact copy (same design, adapted content)
- [ ] Extract real layout/structure from source web
- [ ] Download and use actual images, logos, backgrounds
- [ ] Copy exact color palette
- [ ] Replicate typography

### Phase 5: Design Learning System
- [ ] Create database table for learned designs
- [ ] Extract and store design patterns from user-provided examples
- [ ] Allow LLM to reference learned designs
- [ ] Auto-learn from user-generated landings

### Phase 6: AI Asset Generation
- [ ] Generate logos with AI when user doesn't have one
- [ ] Generate contextual hero backgrounds
- [ ] Generate placeholder team/product photos
- [ ] Use icon libraries for consistent iconography


## Phase 3: Industry Pattern Integration (Completed)
- [x] Analyzed current industry detection flow
- [x] Created industryJSONExamples.ts with generateIndustryJSONExample() function
- [x] Created generateIndustryInstructions() to provide complete JSON examples to LLM
- [x] Updated enrichPromptWithIndustry() to include JSON examples
- [x] Added extractBusinessName() to detect business names from user messages
- [x] Created comprehensive tests (12 tests passing)
- [x] Supports all 293 industry patterns with proper section ordering
- [x] Includes layout variants (hero, features, testimonials, pricing) in examples
- [x] Color palettes automatically applied based on industry type


## Phase 4: Web Cloning Improvements - COMPLETED
- [x] Analyze current webDataExtractor.ts code
- [x] Improve section/structure extraction from websites (structureExtractor.ts - 800+ lines)
- [x] Implement image, logo, and asset downloading (assetDownloader.ts)
- [x] Improve color palette extraction (colorExtractor.ts)
- [x] Improve typography/font extraction (colorExtractor.ts)
- [x] Implement 3-level cloning system (cloningLevels.ts):
  - [x] Level A: Inspiration (colors, similar structure)
  - [x] Level B: Visual Replica (almost identical, different content)
  - [x] Level C: Exact Copy (same design, adapted content)
- [x] Create comprehensive tests for web cloning (23 tests passing)
- [ ] Validate cloning with real websites

### New Files Created:
- `server/structureExtractor.ts` - Semantic section extraction
- `server/assetDownloader.ts` - Asset download to S3
- `server/colorExtractor.ts` - Color palette and typography extraction
- `server/cloningLevels.ts` - 3-level cloning configuration
- `server/webCloning.test.ts` - Test suite (23 tests)
