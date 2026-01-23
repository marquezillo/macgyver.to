# Investigación: Fuentes de Templates para Landing Pages

## Fuentes Identificadas

### 1. Repositorios Open Source (GitHub)

| Fuente | Templates | Tecnología | Licencia |
|--------|-----------|------------|----------|
| **awesome-landing-pages** | ~15 templates | HTML + Tailwind | MIT |
| **nordicgiant2/awesome-landing-page** | Colección curada | Varios | - |
| **inwind-landing-page** | SaaS template | Next.js | Open Source |

**Categorías disponibles en awesome-landing-pages:**
- SaaS landing pages
- App landing pages
- Restaurant landing page
- Real estate landing page
- Attorney landing page
- Portfolio
- NGO landing pages

### 2. Galerías de Inspiración (Solo Screenshots)

| Fuente | Cantidad | Tipo |
|--------|----------|------|
| **Lapa.ninja** | 7,300+ diseños | Screenshots + Videos |
| **Landingfolio** | 1,500+ diseños | Screenshots + Componentes |

**Categorías en Landingfolio:**
- SaaS (341)
- Product (209)
- Business (140)
- Marketing (116)
- Design Tools (113)
- Software (85)
- Technology (79)
- Mobile App (71)
- AI (34)
- Fintech (18)
- Real Estate (5)
- Health (7)
- Y más...

### 3. Bibliotecas de Componentes

| Fuente | Componentes | Tecnología | Precio |
|--------|-------------|------------|--------|
| **Tailwind UI** | 500+ | Tailwind CSS | Pago |
| **HyperUI** | 100+ | Tailwind CSS v4 | Gratis |
| **HTMLRev** | 50+ templates | Tailwind | Gratis |
| **FloatUI** | Varios | Tailwind | Gratis |

---

## Estrategias para Escalar a Cientos de Templates

### Estrategia 1: Generación Dinámica con IA (Recomendada)
En lugar de crear cientos de templates estáticos, usar el LLM para generar templates dinámicamente basados en:
- **Industria/Nicho** (300+ industrias posibles)
- **Estilo visual** (6 estilos ya implementados)
- **Variantes de sección** (ya implementadas)

**Ventajas:**
- Infinitas combinaciones
- Personalización automática
- No requiere mantenimiento de cientos de archivos

### Estrategia 2: Sistema de Patrones por Industria
Crear un JSON de configuración por industria que defina:
- Secciones recomendadas
- Paleta de colores sugerida
- Variantes de layout preferidas
- Contenido placeholder específico
- Imágenes de stock por categoría

**Ejemplo:**
```json
{
  "restaurant": {
    "sections": ["hero", "gallery", "menu", "testimonials", "contact"],
    "heroVariant": "split",
    "colorPalette": "warm",
    "images": ["food", "restaurant-interior", "chef"]
  }
}
```

### Estrategia 3: Scraping + Adaptación
Usar las galerías de inspiración (Lapa.ninja, Landingfolio) para:
1. Identificar patrones de diseño por industria
2. Extraer estructuras de sección comunes
3. Adaptar a nuestro sistema de componentes

---

## Recomendación Final

**Enfoque híbrido:**
1. **Base de patrones por industria** (50-100 industrias)
2. **Generación dinámica** con variantes y estilos
3. **Biblioteca de imágenes** por categoría

Esto permite:
- Cientos de combinaciones únicas
- Contenido relevante por industria
- Escalabilidad sin mantenimiento manual
