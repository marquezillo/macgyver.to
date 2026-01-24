/**
 * Tipos para el sistema de Landing con múltiples páginas
 */

// Tipos de páginas soportadas
export type PageType = 'home' | 'terms' | 'privacy' | 'about' | 'contact' | 'custom';

// Configuración de una página individual
export interface PageConfig {
  id: string;
  type: PageType;
  slug: string; // URL path (e.g., '/terminos', '/privacidad')
  title: string;
  enabled: boolean;
  data: Record<string, unknown>;
}

// Configuración extendida de landing con soporte multi-página
export interface MultiPageLandingConfig {
  id: string;
  name: string;
  slug: string; // Slug del proyecto para subdominios
  
  // Página principal (home)
  sections: SectionConfig[];
  
  // Páginas adicionales
  pages: PageConfig[];
  
  // Tema global
  theme: ThemeConfig;
  
  // Metadatos
  metadata: LandingMetadata;
  
  // Navegación
  navigation: NavigationConfig;
}

export interface SectionConfig {
  id: string;
  type: string;
  order: number;
  data: Record<string, unknown>;
}

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  borderRadius: string;
  darkMode: boolean;
}

export interface LandingMetadata {
  businessName: string;
  businessType?: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
  websiteUrl?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  sourceUrl?: string;
  clonedAt?: string;
  originalTitle?: string;
}

export interface NavigationConfig {
  logo?: {
    text?: string;
    imageUrl?: string;
  };
  links: NavigationLink[];
  cta?: {
    text: string;
    href: string;
  };
}

export interface NavigationLink {
  label: string;
  href: string;
  isExternal?: boolean;
  isPage?: boolean; // true si es una página interna
}

// Páginas por defecto que se pueden generar
export const DEFAULT_PAGES: Omit<PageConfig, 'id' | 'data'>[] = [
  {
    type: 'terms',
    slug: '/terminos',
    title: 'Términos y Condiciones',
    enabled: false
  },
  {
    type: 'privacy',
    slug: '/privacidad',
    title: 'Política de Privacidad',
    enabled: false
  },
  {
    type: 'about',
    slug: '/nosotros',
    title: 'Sobre Nosotros',
    enabled: false
  },
  {
    type: 'contact',
    slug: '/contacto',
    title: 'Contacto',
    enabled: false
  }
];

// Helper para crear una configuración de página
export function createPageConfig(
  type: PageType,
  metadata: LandingMetadata,
  customData?: Record<string, unknown>
): PageConfig {
  const defaultPage = DEFAULT_PAGES.find(p => p.type === type);
  
  return {
    id: `page-${type}-${Date.now()}`,
    type,
    slug: defaultPage?.slug || `/${type}`,
    title: defaultPage?.title || type,
    enabled: true,
    data: {
      businessName: metadata.businessName,
      businessType: metadata.businessType,
      contactEmail: metadata.contactEmail,
      websiteUrl: metadata.websiteUrl,
      ...customData
    }
  };
}

// Helper para detectar qué páginas se solicitan en un mensaje
export function detectRequestedPages(message: string): PageType[] {
  const pages: PageType[] = [];
  const lowerMessage = message.toLowerCase();
  
  // Patrones para detectar páginas
  const patterns: { type: PageType; keywords: string[] }[] = [
    { 
      type: 'terms', 
      keywords: ['términos', 'terminos', 'condiciones', 'terms', 'legal', 'aviso legal'] 
    },
    { 
      type: 'privacy', 
      keywords: ['privacidad', 'privacy', 'datos personales', 'gdpr', 'cookies'] 
    },
    { 
      type: 'about', 
      keywords: ['sobre nosotros', 'about', 'quiénes somos', 'quienes somos', 'historia', 'equipo'] 
    },
    { 
      type: 'contact', 
      keywords: ['contacto', 'contact', 'formulario', 'escribenos', 'escríbenos'] 
    }
  ];
  
  // Detectar si pide "todas las páginas" o "completa"
  if (
    lowerMessage.includes('todas las páginas') ||
    lowerMessage.includes('todas las paginas') ||
    lowerMessage.includes('web completa') ||
    lowerMessage.includes('sitio completo') ||
    lowerMessage.includes('con todo')
  ) {
    return ['terms', 'privacy', 'about', 'contact'];
  }
  
  // Detectar páginas individuales
  for (const pattern of patterns) {
    if (pattern.keywords.some(kw => lowerMessage.includes(kw))) {
      pages.push(pattern.type);
    }
  }
  
  return pages;
}
