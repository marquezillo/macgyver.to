# Manus Design Reference for Projects Section

Based on the user's screenshot, the Manus sidebar has the following structure:

## Menu Structure
1. **Nueva tarea** (New task) - Main action button
2. **Buscar** (Search)
3. **Biblioteca** (Library)
4. **Manus** - Brand/section

## Conversation List
- "Todas las tareas" (All tasks) header with filter icon
- List of conversations with icons indicating type:
  - Circle icon for regular tasks
  - Grid icon for landing pages
  - Other icons for different types

## Context Menu (on hover/click "...")
When clicking the 3 dots on a conversation, shows:
1. **Compartir** (Share)
2. **Renombrar** (Rename)
3. **Agregar a favoritos** (Add to favorites)
4. **Abrir en una nueva pestaña** (Open in new tab)
5. **Mover a proyecto** (Move to project) - with submenu arrow
6. **Eliminar** (Delete) - in red

## Key Design Elements
- Clean, minimal design
- Icons before each menu item
- "Eliminar" (Delete) is highlighted in red
- "Mover a proyecto" has a submenu indicator (arrow)
- Hover state shows 3-dot menu button

## Implementation Notes
- Replace "Carpetas" with "Proyectos" 
- Projects work like folders but with a different name/concept
- Context menu should appear on hover with 3-dot button
- Menu items should match Manus exactly
