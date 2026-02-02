# 3 Mejoras a Implementar

## 1. Drag & Drop de Conversaciones a Proyectos
- Usar @dnd-kit que ya está instalado
- Hacer que los items de conversación sean draggable
- Hacer que los proyectos sean drop zones
- Al soltar, llamar a moveToProject mutation

## 2. Colores Personalizados para Proyectos
- El campo `color` ya existe en la tabla `folders`
- Crear modal de selección de color al crear/editar proyecto
- Mostrar color picker con 6 opciones predefinidas
- Actualizar router para aceptar color en create/update

## 3. Búsqueda Global Mejorada
- Agregar filtros en la barra de búsqueda
- Filtrar por: Favoritos, Proyecto, Fecha
- Mostrar chips de filtros activos
- Actualizar lógica de filtrado en filteredChats

## Prioridad: Implementar en orden
1. Primero: Colores personalizados (más simple)
2. Segundo: Búsqueda mejorada (mediano)
3. Tercero: Drag & drop (más complejo)
