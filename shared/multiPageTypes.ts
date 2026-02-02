/**
 * Multi-Page Landing System Types
 * 
 * Allows landings to have multiple pages like /contacto, /precios, /about, etc.
 * Similar to how Manus.im handles multi-page websites.
 */

import type { SectionType, BaseStyles } from './sectionTypes';

/**
 * Generic section interface for multi-page system
 */
export interface Section {
  id: string;
  type: SectionType;
  content: Record<string, unknown>;
  styles?: BaseStyles & Record<string, unknown>;
}

/**
 * Represents a single page in a multi-page landing
 */
export interface LandingPage {
  /** Unique identifier for the page */
  id: string;
  /** URL slug (e.g., "contacto", "precios", "about") */
  slug: string;
  /** Page title for SEO and navigation */
  title: string;
  /** Page description for SEO */
  description?: string;
  /** Whether this is the home page (slug = "") */
  isHomePage: boolean;
  /** Sections that make up this page */
  sections: Section[];
  /** Page-specific SEO metadata */
  seo?: PageSEO;
  /** Order in navigation (lower = first) */
  navOrder?: number;
  /** Whether to show in navigation */
  showInNav: boolean;
  /** Custom icon for navigation */
  navIcon?: string;
  /** Created timestamp */
  createdAt: string;
  /** Updated timestamp */
  updatedAt: string;
}

/**
 * SEO metadata for a page
 */
export interface PageSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
}

/**
 * Navigation item for the landing
 */
export interface NavItem {
  /** Display label */
  label: string;
  /** URL path (e.g., "/contacto" or "#features") */
  href: string;
  /** Whether this is an anchor link (#) or page link (/) */
  type: 'anchor' | 'page' | 'external';
  /** Order in navigation */
  order: number;
  /** Icon name */
  icon?: string;
  /** Whether this item is active */
  isActive?: boolean;
}

/**
 * Complete multi-page landing configuration
 */
export interface MultiPageLanding {
  /** Landing ID */
  id: string;
  /** Landing name */
  name: string;
  /** All pages in the landing */
  pages: LandingPage[];
  /** Global navigation items */
  navigation: NavItem[];
  /** Global theme/styles */
  theme: LandingTheme;
  /** Global SEO defaults */
  seo: GlobalSEO;
  /** Business information */
  business: BusinessInfo;
}

/**
 * Global theme configuration
 */
export interface LandingTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  headingFont?: string;
  borderRadius?: string;
  mode: 'light' | 'dark';
}

/**
 * Global SEO configuration
 */
export interface GlobalSEO {
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
  favicon?: string;
  ogImage?: string;
  twitterHandle?: string;
}

/**
 * Business information shared across pages
 */
export interface BusinessInfo {
  name: string;
  tagline?: string;
  logo?: string;
  email?: string;
  phone?: string;
  address?: string;
  socialLinks?: {
    platform: string;
    url: string;
  }[];
}

/**
 * Default pages that can be generated
 */
export const DEFAULT_PAGE_TEMPLATES: Record<string, Partial<LandingPage>> = {
  home: {
    slug: '',
    title: 'Inicio',
    isHomePage: true,
    showInNav: true,
    navOrder: 0,
  },
  about: {
    slug: 'about',
    title: 'Nosotros',
    isHomePage: false,
    showInNav: true,
    navOrder: 1,
  },
  services: {
    slug: 'servicios',
    title: 'Servicios',
    isHomePage: false,
    showInNav: true,
    navOrder: 2,
  },
  pricing: {
    slug: 'precios',
    title: 'Precios',
    isHomePage: false,
    showInNav: true,
    navOrder: 3,
  },
  contact: {
    slug: 'contacto',
    title: 'Contacto',
    isHomePage: false,
    showInNav: true,
    navOrder: 4,
  },
  faq: {
    slug: 'faq',
    title: 'Preguntas Frecuentes',
    isHomePage: false,
    showInNav: true,
    navOrder: 5,
  },
  blog: {
    slug: 'blog',
    title: 'Blog',
    isHomePage: false,
    showInNav: true,
    navOrder: 6,
  },
  terms: {
    slug: 'terminos',
    title: 'Términos y Condiciones',
    isHomePage: false,
    showInNav: false,
    navOrder: 100,
  },
  privacy: {
    slug: 'privacidad',
    title: 'Política de Privacidad',
    isHomePage: false,
    showInNav: false,
    navOrder: 101,
  },
};

/**
 * Helper to create a new page
 */
export function createPage(
  template: keyof typeof DEFAULT_PAGE_TEMPLATES | string,
  overrides?: Partial<LandingPage>
): LandingPage {
  const base = DEFAULT_PAGE_TEMPLATES[template] || {
    slug: template,
    title: template.charAt(0).toUpperCase() + template.slice(1),
    isHomePage: false,
    showInNav: true,
    navOrder: 10,
  };

  return {
    id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    slug: base.slug || template,
    title: base.title || template,
    isHomePage: base.isHomePage || false,
    sections: [],
    showInNav: base.showInNav ?? true,
    navOrder: base.navOrder ?? 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Helper to generate navigation from pages
 */
export function generateNavigation(pages: LandingPage[]): NavItem[] {
  return pages
    .filter(page => page.showInNav)
    .sort((a, b) => (a.navOrder || 0) - (b.navOrder || 0))
    .map(page => ({
      label: page.title,
      href: page.isHomePage ? '/' : `/${page.slug}`,
      type: 'page' as const,
      order: page.navOrder || 0,
      icon: page.navIcon,
    }));
}

/**
 * Helper to find a page by slug
 */
export function findPageBySlug(pages: LandingPage[], slug: string): LandingPage | undefined {
  // Normalize slug (remove leading/trailing slashes)
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, '');
  
  // Find home page if slug is empty
  if (!normalizedSlug) {
    return pages.find(p => p.isHomePage);
  }
  
  return pages.find(p => p.slug === normalizedSlug);
}
