/**
 * Multi-Page Detector
 * 
 * Detects when users want multiple pages in their landing and generates
 * appropriate instructions for the LLM.
 */

import type { LandingPage, NavItem } from '@shared/multiPageTypes';

/**
 * Page request detected from user message
 */
export interface PageRequest {
  slug: string;
  title: string;
  description?: string;
  suggestedSections: string[];
}

/**
 * Result of multi-page detection
 */
export interface MultiPageDetectionResult {
  isMultiPage: boolean;
  requestedPages: PageRequest[];
  navigationStructure: NavItem[];
  llmInstructions: string;
}

/**
 * Common page patterns and their typical sections
 */
const PAGE_PATTERNS: Record<string, { 
  keywords: string[]; 
  title: string; 
  sections: string[];
  description: string;
}> = {
  contacto: {
    keywords: ['contacto', 'contact', 'contactar', 'contactenos', 'escribenos'],
    title: 'Contacto',
    sections: ['header', 'hero', 'form', 'stats', 'footer'],
    description: 'Página de contacto con formulario'
  },
  precios: {
    keywords: ['precios', 'pricing', 'planes', 'tarifas', 'costos', 'paquetes'],
    title: 'Precios',
    sections: ['header', 'hero', 'pricing', 'faq', 'cta', 'footer'],
    description: 'Página de precios y planes'
  },
  nosotros: {
    keywords: ['nosotros', 'about', 'sobre', 'equipo', 'historia', 'quienes somos'],
    title: 'Nosotros',
    sections: ['header', 'hero', 'about', 'stats', 'testimonials', 'footer'],
    description: 'Página sobre la empresa'
  },
  servicios: {
    keywords: ['servicios', 'services', 'soluciones', 'productos'],
    title: 'Servicios',
    sections: ['header', 'hero', 'features', 'process', 'cta', 'footer'],
    description: 'Página de servicios'
  },
  faq: {
    keywords: ['faq', 'preguntas', 'ayuda', 'soporte', 'help'],
    title: 'Preguntas Frecuentes',
    sections: ['header', 'hero', 'faq', 'cta', 'footer'],
    description: 'Página de preguntas frecuentes'
  },
  blog: {
    keywords: ['blog', 'articulos', 'noticias', 'posts'],
    title: 'Blog',
    sections: ['header', 'hero', 'gallery', 'footer'],
    description: 'Página de blog'
  },
  galeria: {
    keywords: ['galeria', 'gallery', 'portfolio', 'trabajos', 'proyectos'],
    title: 'Galería',
    sections: ['header', 'hero', 'gallery', 'footer'],
    description: 'Página de galería/portfolio'
  },
  testimonios: {
    keywords: ['testimonios', 'testimonials', 'casos', 'clientes', 'reviews'],
    title: 'Testimonios',
    sections: ['header', 'hero', 'testimonials', 'logocloud', 'cta', 'footer'],
    description: 'Página de testimonios'
  },
  terminos: {
    keywords: ['terminos', 'terms', 'condiciones', 'legal'],
    title: 'Términos y Condiciones',
    sections: ['header', 'about', 'footer'],
    description: 'Página de términos legales'
  },
  privacidad: {
    keywords: ['privacidad', 'privacy', 'datos', 'cookies'],
    title: 'Política de Privacidad',
    sections: ['header', 'about', 'footer'],
    description: 'Página de política de privacidad'
  }
};

/**
 * Patterns that indicate multi-page requests
 */
const MULTI_PAGE_INDICATORS = [
  // Spanish
  /(?:con|incluyendo|incluye|además|también)\s+(?:página|pagina|sección|seccion)\s+(?:de\s+)?(\w+)/gi,
  /(?:página|pagina)\s+(?:de\s+)?(\w+)/gi,
  /(?:crear|generar|hacer|añadir|agregar)\s+(?:una\s+)?(?:página|pagina)\s+(?:de\s+)?(\w+)/gi,
  /(?:quiero|necesito|me gustaría)\s+(?:una\s+)?(?:página|pagina)\s+(?:de\s+)?(\w+)/gi,
  /\/(\w+)/g, // Direct URL patterns like /contacto
  
  // English
  /(?:with|including|includes|also|plus)\s+(?:a\s+)?(\w+)\s+page/gi,
  /(\w+)\s+page/gi,
  /(?:create|generate|make|add)\s+(?:a\s+)?(\w+)\s+page/gi,
];

/**
 * Detect if the user wants multiple pages
 */
export function detectMultiPageRequest(message: string): MultiPageDetectionResult {
  const normalizedMessage = message.toLowerCase();
  const detectedPages: PageRequest[] = [];
  const seenSlugs = new Set<string>();

  // Check for explicit multi-page indicators
  for (const pattern of MULTI_PAGE_INDICATORS) {
    const matches = Array.from(normalizedMessage.matchAll(pattern));
    for (const match of matches) {
      const pageName = match[1]?.toLowerCase();
      if (pageName && !seenSlugs.has(pageName)) {
        const pageInfo = findPagePattern(pageName);
        if (pageInfo) {
          seenSlugs.add(pageInfo.slug);
          detectedPages.push({
            slug: pageInfo.slug,
            title: pageInfo.title,
            description: pageInfo.description,
            suggestedSections: pageInfo.sections
          });
        }
      }
    }
  }

  // Check for page pattern keywords in the message
  for (const [slug, pattern] of Object.entries(PAGE_PATTERNS)) {
    if (seenSlugs.has(slug)) continue;
    
    for (const keyword of pattern.keywords) {
      if (normalizedMessage.includes(keyword)) {
        seenSlugs.add(slug);
        detectedPages.push({
          slug,
          title: pattern.title,
          description: pattern.description,
          suggestedSections: pattern.sections
        });
        break;
      }
    }
  }

  // Generate navigation structure
  const navigation: NavItem[] = [
    { label: 'Inicio', href: '/', type: 'page', order: 0 }
  ];
  
  detectedPages.forEach((page, index) => {
    navigation.push({
      label: page.title,
      href: `/${page.slug}`,
      type: 'page',
      order: index + 1
    });
  });

  // Generate LLM instructions
  const llmInstructions = generateMultiPageInstructions(detectedPages);

  return {
    isMultiPage: detectedPages.length > 0,
    requestedPages: detectedPages,
    navigationStructure: navigation,
    llmInstructions
  };
}

/**
 * Find page pattern by keyword
 */
function findPagePattern(keyword: string): { slug: string; title: string; sections: string[]; description: string } | null {
  for (const [slug, pattern] of Object.entries(PAGE_PATTERNS)) {
    if (pattern.keywords.some(k => k.includes(keyword) || keyword.includes(k))) {
      return { slug, ...pattern };
    }
  }
  return null;
}

/**
 * Generate LLM instructions for multi-page landing
 */
function generateMultiPageInstructions(pages: PageRequest[]): string {
  if (pages.length === 0) return '';

  let instructions = `
## MULTI-PAGE LANDING INSTRUCTIONS

The user wants a landing with MULTIPLE PAGES. You must generate a complete multi-page website.

### IMPORTANT: Response Format for Multi-Page Landings

Your response MUST include a "pages" array with each page as a separate object:

\`\`\`json
{
  "pages": [
    {
      "slug": "",
      "title": "Inicio",
      "isHomePage": true,
      "sections": [/* home page sections */]
    },
`;

  for (const page of pages) {
    instructions += `    {
      "slug": "${page.slug}",
      "title": "${page.title}",
      "isHomePage": false,
      "sections": [/* ${page.description} sections */]
    },
`;
  }

  instructions += `  ],
  "navigation": [
    { "label": "Inicio", "href": "/", "type": "page" },
`;

  for (const page of pages) {
    instructions += `    { "label": "${page.title}", "href": "/${page.slug}", "type": "page" },
`;
  }

  instructions += `  ]
}
\`\`\`

### Requested Pages:

`;

  for (const page of pages) {
    instructions += `
#### Page: /${page.slug} - ${page.title}
- Description: ${page.description || 'Custom page'}
- Suggested sections: ${page.suggestedSections.join(', ')}
- MUST include header with navigation to all pages
- MUST include footer with links
`;
  }

  instructions += `
### Navigation Rules:
1. ALL pages must have a consistent header with navigation links to ALL other pages
2. Navigation links must use href="/slug" format (NOT anchor links like #section)
3. The header navigation must be identical across all pages
4. Footer must include links to important pages

### Section ID Rules for Multi-Page:
- Home page sections: hero-1, features-1, etc.
- Contact page sections: contacto-hero-1, contacto-form-1, etc.
- Pricing page sections: precios-hero-1, precios-pricing-1, etc.
- Use page slug as prefix for non-home pages (e.g., contacto-hero-1)

`;

  return instructions;
}

/**
 * Enrich user prompt with multi-page instructions
 */
export function enrichPromptForMultiPage(
  originalPrompt: string,
  detection: MultiPageDetectionResult
): string {
  if (!detection.isMultiPage) {
    return originalPrompt;
  }

  return `${originalPrompt}

${detection.llmInstructions}`;
}

/**
 * Parse multi-page response from LLM
 */
export function parseMultiPageResponse(response: any): {
  pages: LandingPage[];
  navigation: NavItem[];
} | null {
  try {
    // Check if response has pages array
    if (response.pages && Array.isArray(response.pages)) {
      const pages: LandingPage[] = response.pages.map((page: any, index: number) => ({
        id: `page-${index}-${Date.now()}`,
        slug: page.slug || '',
        title: page.title || 'Untitled',
        isHomePage: page.isHomePage || page.slug === '',
        sections: page.sections || [],
        showInNav: page.showInNav !== false,
        navOrder: page.navOrder || index,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      const navigation: NavItem[] = response.navigation || pages
        .filter((p: LandingPage) => p.showInNav)
        .map((p: LandingPage, i: number) => ({
          label: p.title,
          href: p.isHomePage ? '/' : `/${p.slug}`,
          type: 'page' as const,
          order: i
        }));

      return { pages, navigation };
    }

    // If no pages array, treat as single page
    if (response.sections && Array.isArray(response.sections)) {
      return {
        pages: [{
          id: `page-home-${Date.now()}`,
          slug: '',
          title: 'Inicio',
          isHomePage: true,
          sections: response.sections,
          showInNav: true,
          navOrder: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }],
        navigation: [{ label: 'Inicio', href: '/', type: 'page', order: 0 }]
      };
    }

    return null;
  } catch (error) {
    console.error('Error parsing multi-page response:', error);
    return null;
  }
}
