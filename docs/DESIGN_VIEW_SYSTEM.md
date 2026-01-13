# 🎨 Design View System (Visual Editor)

El **Design View** es un editor visual WYSIWYG (What You See Is What You Get) que permite a los usuarios modificar sus landing pages sin escribir código.

## 🏗️ Arquitectura

El sistema está construido sobre **React** y utiliza las siguientes tecnologías clave:

- **Zustand**: Gestión del estado global (secciones, selección, historial).
- **Dnd-kit**: Sistema de Drag & Drop accesible y robusto.
- **TailwindCSS**: Estilizado dinámico de componentes.

### Componentes Principales

1. **EditorLayout**: Estructura principal que contiene el Header, Sidebar, Canvas y Panel de Propiedades.
2. **Canvas**: Área central donde se renderizan las secciones. Implementa `SortableContext` para permitir el reordenamiento.
3. **SectionRenderer**: Componente dinámico que renderiza el componente de sección correcto (Hero, Features, etc.) basado en el `type`.
4. **PropertiesPanel**: Panel lateral derecho que permite editar el contenido y los estilos de la sección seleccionada.
5. **SectionLibrary**: Panel lateral izquierdo con la lista de secciones disponibles para añadir.

## 🔄 Flujo de Datos

1. **Estado Inicial**: Se carga desde `editorStore` (o API en el futuro).
2. **Modificación**: 
   - Al editar un campo en `PropertiesPanel`, se despacha `updateSection`.
   - Al arrastrar una sección, se despacha `reorderSections`.
3. **Persistencia**:
   - El botón "Save" llama a `api.saveProject`.
   - El botón "Publish" llama a `api.publishProject`.

## 🧩 Tipos de Secciones Soportadas

| Tipo | Descripción | Campos Editables |
|------|-------------|------------------|
| `hero` | Sección principal | Título, Subtítulo, CTA, Imagen, Colores |
| `features` | Lista de características | Título, Items (título, desc), Colores |
| `testimonials` | Testimonios de clientes | Título, Items (nombre, rol, cita, avatar) |
| `pricing` | Planes de precios | Título, Planes (nombre, precio, features) |
| `cta` | Llamada a la acción final | Título, Subtítulo, Botón |
| `stats` | Estadísticas clave | Items (valor, etiqueta) |
| `faq` | Preguntas frecuentes | Items (pregunta, respuesta) |

## 🚀 Extensibilidad

Para añadir una nueva sección:

1. Crear el componente en `client/src/components/sections/NewSection.tsx`.
2. Añadir el tipo en `SectionType` en `editorStore.ts`.
3. Definir el contenido por defecto en `defaultContent`.
4. Registrar el componente en `SectionRenderer.tsx`.
5. Añadir el icono y etiqueta en `SectionLibrary.tsx`.

## 📱 Responsive Preview

El editor incluye modos de vista previa para:
- **Desktop**: 100% ancho.
- **Tablet**: max-width 768px.
- **Mobile**: max-width 375px.

Esto se logra restringiendo el ancho del contenedor del `Canvas` mediante clases de Tailwind condicionales.
