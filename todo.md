
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
