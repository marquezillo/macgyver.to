/**
 * Layout Templates System
 * 
 * Provides diverse landing page structures for different business types.
 * Each layout defines a specific arrangement of sections that work well together.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  category: LayoutCategory;
  sections: SectionDefinition[];
  recommendedFor: string[];
  style: LayoutStyle;
}

export interface SectionDefinition {
  type: string;
  variant?: string;
  required: boolean;
  order: number;
  defaultContent?: Record<string, any>;
}

export type LayoutCategory = 
  | 'minimal'      // Clean, few sections
  | 'standard'     // Balanced, common structure
  | 'comprehensive' // Full-featured, many sections
  | 'storytelling' // Narrative flow
  | 'conversion'   // Focused on conversions
  | 'portfolio'    // Showcase work
  | 'ecommerce'    // Product-focused
  | 'service';     // Service-based business

export interface LayoutStyle {
  colorScheme: 'light' | 'dark' | 'vibrant' | 'elegant' | 'modern';
  spacing: 'compact' | 'normal' | 'spacious';
  typography: 'classic' | 'modern' | 'bold' | 'elegant';
}

// ============================================================================
// LAYOUT TEMPLATES
// ============================================================================

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  // -------------------------------------------------------------------------
  // MINIMAL LAYOUTS (2-4 sections)
  // -------------------------------------------------------------------------
  {
    id: 'minimal-hero-cta',
    name: 'Minimal Hero + CTA',
    description: 'Ultra-clean layout with just hero and call-to-action',
    category: 'minimal',
    sections: [
      { type: 'hero', variant: 'centered', required: true, order: 1 },
      { type: 'cta', variant: 'simple', required: true, order: 2 }
    ],
    recommendedFor: ['coming-soon', 'waitlist', 'app-launch', 'event'],
    style: { colorScheme: 'modern', spacing: 'spacious', typography: 'bold' }
  },
  {
    id: 'minimal-features',
    name: 'Minimal con Características',
    description: 'Hero limpio con sección de características destacadas',
    category: 'minimal',
    sections: [
      { type: 'hero', variant: 'split', required: true, order: 1 },
      { type: 'features', variant: 'grid-3', required: true, order: 2 },
      { type: 'cta', variant: 'banner', required: true, order: 3 }
    ],
    recommendedFor: ['saas', 'startup', 'tech', 'app'],
    style: { colorScheme: 'light', spacing: 'normal', typography: 'modern' }
  },
  {
    id: 'minimal-portfolio',
    name: 'Portfolio Minimalista',
    description: 'Diseño limpio para mostrar trabajos',
    category: 'minimal',
    sections: [
      { type: 'hero', variant: 'minimal', required: true, order: 1 },
      { type: 'gallery', variant: 'masonry', required: true, order: 2 },
      { type: 'form', variant: 'simple', required: true, order: 3 }
    ],
    recommendedFor: ['photographer', 'designer', 'artist', 'freelancer'],
    style: { colorScheme: 'elegant', spacing: 'spacious', typography: 'elegant' }
  },

  // -------------------------------------------------------------------------
  // STANDARD LAYOUTS (4-6 sections)
  // -------------------------------------------------------------------------
  {
    id: 'standard-business',
    name: 'Negocio Estándar',
    description: 'Layout equilibrado para negocios tradicionales',
    category: 'standard',
    sections: [
      { type: 'hero', variant: 'image-right', required: true, order: 1 },
      { type: 'features', variant: 'icon-grid', required: true, order: 2 },
      { type: 'about', variant: 'split', required: false, order: 3 },
      { type: 'testimonials', variant: 'carousel', required: true, order: 4 },
      { type: 'cta', variant: 'gradient', required: true, order: 5 }
    ],
    recommendedFor: ['consulting', 'agency', 'professional-services', 'b2b'],
    style: { colorScheme: 'light', spacing: 'normal', typography: 'classic' }
  },
  {
    id: 'standard-service',
    name: 'Servicios Profesionales',
    description: 'Ideal para empresas de servicios',
    category: 'service',
    sections: [
      { type: 'hero', variant: 'video-background', required: true, order: 1 },
      { type: 'services', variant: 'cards', required: true, order: 2 },
      { type: 'process', variant: 'timeline', required: false, order: 3 },
      { type: 'testimonials', variant: 'grid', required: true, order: 4 },
      { type: 'pricing', variant: 'comparison', required: false, order: 5 },
      { type: 'form', variant: 'contact', required: true, order: 6 }
    ],
    recommendedFor: ['lawyer', 'accountant', 'consultant', 'coach'],
    style: { colorScheme: 'elegant', spacing: 'normal', typography: 'classic' }
  },
  {
    id: 'standard-beauty',
    name: 'Belleza y Bienestar',
    description: 'Diseño elegante para salones y spas',
    category: 'service',
    sections: [
      { type: 'hero', variant: 'fullscreen-image', required: true, order: 1 },
      { type: 'services', variant: 'elegant-grid', required: true, order: 2 },
      { type: 'gallery', variant: 'instagram', required: true, order: 3 },
      { type: 'testimonials', variant: 'quotes', required: true, order: 4 },
      { type: 'team', variant: 'cards', required: false, order: 5 },
      { type: 'booking', variant: 'calendar', required: true, order: 6 }
    ],
    recommendedFor: ['salon', 'spa', 'beauty', 'wellness', 'nail-salon', 'hair'],
    style: { colorScheme: 'elegant', spacing: 'spacious', typography: 'elegant' }
  },
  {
    id: 'standard-restaurant',
    name: 'Restaurante / Gastronomía',
    description: 'Layout apetitoso para restaurantes',
    category: 'service',
    sections: [
      { type: 'hero', variant: 'parallax', required: true, order: 1 },
      { type: 'about', variant: 'story', required: true, order: 2 },
      { type: 'menu', variant: 'categories', required: true, order: 3 },
      { type: 'gallery', variant: 'food-grid', required: true, order: 4 },
      { type: 'testimonials', variant: 'reviews', required: true, order: 5 },
      { type: 'location', variant: 'map', required: true, order: 6 },
      { type: 'reservation', variant: 'form', required: true, order: 7 }
    ],
    recommendedFor: ['restaurant', 'cafe', 'bar', 'bakery', 'catering'],
    style: { colorScheme: 'dark', spacing: 'normal', typography: 'elegant' }
  },

  // -------------------------------------------------------------------------
  // COMPREHENSIVE LAYOUTS (6+ sections)
  // -------------------------------------------------------------------------
  {
    id: 'comprehensive-saas',
    name: 'SaaS Completo',
    description: 'Layout completo para productos SaaS',
    category: 'comprehensive',
    sections: [
      { type: 'hero', variant: 'product-demo', required: true, order: 1 },
      { type: 'logos', variant: 'trusted-by', required: false, order: 2 },
      { type: 'features', variant: 'alternating', required: true, order: 3 },
      { type: 'benefits', variant: 'icon-list', required: true, order: 4 },
      { type: 'how-it-works', variant: 'steps', required: true, order: 5 },
      { type: 'pricing', variant: 'tiers', required: true, order: 6 },
      { type: 'testimonials', variant: 'featured', required: true, order: 7 },
      { type: 'faq', variant: 'accordion', required: true, order: 8 },
      { type: 'cta', variant: 'final', required: true, order: 9 }
    ],
    recommendedFor: ['saas', 'software', 'platform', 'tool', 'app'],
    style: { colorScheme: 'modern', spacing: 'normal', typography: 'modern' }
  },
  {
    id: 'comprehensive-agency',
    name: 'Agencia Creativa',
    description: 'Showcase completo para agencias',
    category: 'comprehensive',
    sections: [
      { type: 'hero', variant: 'creative', required: true, order: 1 },
      { type: 'services', variant: 'hover-cards', required: true, order: 2 },
      { type: 'portfolio', variant: 'case-studies', required: true, order: 3 },
      { type: 'process', variant: 'visual', required: true, order: 4 },
      { type: 'team', variant: 'creative', required: true, order: 5 },
      { type: 'clients', variant: 'logos', required: false, order: 6 },
      { type: 'testimonials', variant: 'video', required: true, order: 7 },
      { type: 'blog', variant: 'featured', required: false, order: 8 },
      { type: 'contact', variant: 'creative', required: true, order: 9 }
    ],
    recommendedFor: ['agency', 'studio', 'creative', 'marketing', 'design'],
    style: { colorScheme: 'vibrant', spacing: 'spacious', typography: 'bold' }
  },

  // -------------------------------------------------------------------------
  // STORYTELLING LAYOUTS
  // -------------------------------------------------------------------------
  {
    id: 'storytelling-brand',
    name: 'Historia de Marca',
    description: 'Narrativa visual para contar la historia de tu marca',
    category: 'storytelling',
    sections: [
      { type: 'hero', variant: 'statement', required: true, order: 1 },
      { type: 'story', variant: 'timeline', required: true, order: 2 },
      { type: 'values', variant: 'visual', required: true, order: 3 },
      { type: 'impact', variant: 'stats', required: true, order: 4 },
      { type: 'team', variant: 'story', required: true, order: 5 },
      { type: 'testimonials', variant: 'stories', required: true, order: 6 },
      { type: 'cta', variant: 'emotional', required: true, order: 7 }
    ],
    recommendedFor: ['nonprofit', 'social-enterprise', 'brand', 'startup'],
    style: { colorScheme: 'light', spacing: 'spacious', typography: 'elegant' }
  },
  {
    id: 'storytelling-personal',
    name: 'Marca Personal',
    description: 'Para coaches, speakers y profesionales independientes',
    category: 'storytelling',
    sections: [
      { type: 'hero', variant: 'personal', required: true, order: 1 },
      { type: 'about', variant: 'personal-story', required: true, order: 2 },
      { type: 'services', variant: 'offerings', required: true, order: 3 },
      { type: 'credentials', variant: 'badges', required: false, order: 4 },
      { type: 'testimonials', variant: 'success-stories', required: true, order: 5 },
      { type: 'media', variant: 'appearances', required: false, order: 6 },
      { type: 'booking', variant: 'calendar', required: true, order: 7 }
    ],
    recommendedFor: ['coach', 'speaker', 'consultant', 'author', 'influencer'],
    style: { colorScheme: 'elegant', spacing: 'spacious', typography: 'elegant' }
  },

  // -------------------------------------------------------------------------
  // CONVERSION-FOCUSED LAYOUTS
  // -------------------------------------------------------------------------
  {
    id: 'conversion-lead-gen',
    name: 'Generación de Leads',
    description: 'Optimizado para capturar leads',
    category: 'conversion',
    sections: [
      { type: 'hero', variant: 'lead-magnet', required: true, order: 1 },
      { type: 'benefits', variant: 'checkmarks', required: true, order: 2 },
      { type: 'social-proof', variant: 'numbers', required: true, order: 3 },
      { type: 'form', variant: 'prominent', required: true, order: 4 },
      { type: 'faq', variant: 'objections', required: true, order: 5 },
      { type: 'guarantee', variant: 'trust', required: true, order: 6 }
    ],
    recommendedFor: ['lead-gen', 'webinar', 'ebook', 'course', 'consultation'],
    style: { colorScheme: 'light', spacing: 'compact', typography: 'bold' }
  },
  {
    id: 'conversion-product',
    name: 'Lanzamiento de Producto',
    description: 'Para lanzamientos y ventas de productos',
    category: 'conversion',
    sections: [
      { type: 'hero', variant: 'product-launch', required: true, order: 1 },
      { type: 'problem', variant: 'pain-points', required: true, order: 2 },
      { type: 'solution', variant: 'product-intro', required: true, order: 3 },
      { type: 'features', variant: 'benefits-focused', required: true, order: 4 },
      { type: 'demo', variant: 'video', required: true, order: 5 },
      { type: 'testimonials', variant: 'results', required: true, order: 6 },
      { type: 'pricing', variant: 'single-offer', required: true, order: 7 },
      { type: 'guarantee', variant: 'money-back', required: true, order: 8 },
      { type: 'cta', variant: 'urgency', required: true, order: 9 }
    ],
    recommendedFor: ['product-launch', 'course', 'membership', 'software'],
    style: { colorScheme: 'vibrant', spacing: 'normal', typography: 'bold' }
  },

  // -------------------------------------------------------------------------
  // PORTFOLIO LAYOUTS
  // -------------------------------------------------------------------------
  {
    id: 'portfolio-creative',
    name: 'Portfolio Creativo',
    description: 'Showcase visual para creativos',
    category: 'portfolio',
    sections: [
      { type: 'hero', variant: 'showcase', required: true, order: 1 },
      { type: 'portfolio', variant: 'filterable', required: true, order: 2 },
      { type: 'about', variant: 'creative-bio', required: true, order: 3 },
      { type: 'skills', variant: 'visual', required: false, order: 4 },
      { type: 'testimonials', variant: 'client-quotes', required: true, order: 5 },
      { type: 'contact', variant: 'creative', required: true, order: 6 }
    ],
    recommendedFor: ['designer', 'photographer', 'artist', 'videographer'],
    style: { colorScheme: 'dark', spacing: 'spacious', typography: 'modern' }
  },

  // -------------------------------------------------------------------------
  // E-COMMERCE LAYOUTS
  // -------------------------------------------------------------------------
  {
    id: 'ecommerce-product',
    name: 'Producto Destacado',
    description: 'Para destacar un producto principal',
    category: 'ecommerce',
    sections: [
      { type: 'hero', variant: 'product-hero', required: true, order: 1 },
      { type: 'features', variant: 'product-features', required: true, order: 2 },
      { type: 'gallery', variant: 'product-gallery', required: true, order: 3 },
      { type: 'specs', variant: 'details', required: false, order: 4 },
      { type: 'testimonials', variant: 'reviews', required: true, order: 5 },
      { type: 'comparison', variant: 'vs-competitors', required: false, order: 6 },
      { type: 'faq', variant: 'product-faq', required: true, order: 7 },
      { type: 'cta', variant: 'buy-now', required: true, order: 8 }
    ],
    recommendedFor: ['product', 'gadget', 'physical-product', 'invention'],
    style: { colorScheme: 'light', spacing: 'normal', typography: 'modern' }
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get layout by ID
 */
export function getLayoutById(id: string): LayoutTemplate | undefined {
  return LAYOUT_TEMPLATES.find(layout => layout.id === id);
}

/**
 * Get layouts by category
 */
export function getLayoutsByCategory(category: LayoutCategory): LayoutTemplate[] {
  return LAYOUT_TEMPLATES.filter(layout => layout.category === category);
}

/**
 * Get recommended layouts for a business type
 */
export function getRecommendedLayouts(businessType: string): LayoutTemplate[] {
  const normalizedType = businessType.toLowerCase().replace(/[^a-z]/g, '');
  
  return LAYOUT_TEMPLATES.filter(layout => 
    layout.recommendedFor.some(rec => 
      rec.toLowerCase().replace(/[^a-z]/g, '').includes(normalizedType) ||
      normalizedType.includes(rec.toLowerCase().replace(/[^a-z]/g, ''))
    )
  );
}

/**
 * Get a random layout from a category
 */
export function getRandomLayout(category?: LayoutCategory): LayoutTemplate {
  const layouts = category 
    ? getLayoutsByCategory(category)
    : LAYOUT_TEMPLATES;
  
  return layouts[Math.floor(Math.random() * layouts.length)];
}

/**
 * Get layout suggestions based on detected industry
 */
export function suggestLayoutsForIndustry(industry: string): LayoutTemplate[] {
  const industryMappings: Record<string, string[]> = {
    'beauty': ['standard-beauty', 'storytelling-personal', 'portfolio-creative'],
    'salon': ['standard-beauty', 'standard-service'],
    'spa': ['standard-beauty', 'storytelling-brand'],
    'restaurant': ['standard-restaurant', 'storytelling-brand'],
    'cafe': ['standard-restaurant', 'minimal-portfolio'],
    'tech': ['comprehensive-saas', 'minimal-features', 'conversion-product'],
    'saas': ['comprehensive-saas', 'conversion-product', 'minimal-features'],
    'agency': ['comprehensive-agency', 'portfolio-creative', 'standard-business'],
    'consulting': ['standard-business', 'standard-service', 'storytelling-personal'],
    'coach': ['storytelling-personal', 'conversion-lead-gen', 'standard-service'],
    'photographer': ['portfolio-creative', 'minimal-portfolio'],
    'designer': ['portfolio-creative', 'comprehensive-agency'],
    'ecommerce': ['ecommerce-product', 'conversion-product'],
    'nonprofit': ['storytelling-brand', 'standard-business'],
    'startup': ['minimal-features', 'comprehensive-saas', 'conversion-product'],
    'lawyer': ['standard-service', 'standard-business'],
    'medical': ['standard-service', 'standard-business'],
    'fitness': ['standard-beauty', 'storytelling-personal', 'conversion-lead-gen'],
    'real-estate': ['standard-business', 'portfolio-creative', 'conversion-lead-gen']
  };

  const normalizedIndustry = industry.toLowerCase();
  const layoutIds = industryMappings[normalizedIndustry] || ['standard-business', 'minimal-features'];
  
  return layoutIds
    .map(id => getLayoutById(id))
    .filter((layout): layout is LayoutTemplate => layout !== undefined);
}

/**
 * Generate section order string for LLM prompt
 */
export function getLayoutSectionOrder(layout: LayoutTemplate): string {
  return layout.sections
    .sort((a, b) => a.order - b.order)
    .map(s => s.type)
    .join(' → ');
}

/**
 * Get all available layout IDs
 */
export function getAllLayoutIds(): string[] {
  return LAYOUT_TEMPLATES.map(l => l.id);
}

/**
 * Get layout categories with counts
 */
export function getLayoutCategoryCounts(): Record<LayoutCategory, number> {
  const counts: Record<string, number> = {};
  LAYOUT_TEMPLATES.forEach(layout => {
    counts[layout.category] = (counts[layout.category] || 0) + 1;
  });
  return counts as Record<LayoutCategory, number>;
}
