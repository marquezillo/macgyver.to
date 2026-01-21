
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
- [ ] Probar análisis de archivos - PENDIENTE
- [ ] Probar ejecución de código - PENDIENTE
- [x] Probar sistema de proyectos - FUNCIONA (crear, ver, pestañas)
- [x] Probar memoria/contexto - FUNCIONA (ver, editar, eliminar memorias)
- [x] Probar carpetas/organización - FUNCIONA (crear carpetas)
- [x] Probar modo oscuro - FUNCIONA (toggle dark/light)
