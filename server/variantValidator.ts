/**
 * Validador de Variantes Post-Generación
 * Verifica y corrige automáticamente las variantes de secciones
 */

interface Section {
  id: string;
  type: string;
  content: Record<string, unknown>;
  styles?: Record<string, unknown>;
}

interface LandingData {
  type: string;
  businessType?: string;
  sections: Section[];
  globalStyles?: Record<string, unknown>;
}

interface RequestedVariants {
  hero?: string;
  features?: string;
  testimonials?: string;
  pricing?: string;
}

// Mapeo de industria a variantes por defecto
const INDUSTRY_DEFAULTS: Record<string, RequestedVariants> = {
  tech: { hero: 'asymmetric', features: 'animated', testimonials: 'carousel', pricing: 'gradient' },
  saas: { hero: 'asymmetric', features: 'animated', testimonials: 'carousel', pricing: 'gradient' },
  agency: { hero: 'split', features: 'bento', testimonials: 'featured', pricing: 'cards' },
  creative: { hero: 'split', features: 'bento', testimonials: 'featured', pricing: 'cards' },
  ecommerce: { hero: 'split', features: 'grid', testimonials: 'carousel', pricing: 'comparison' },
  restaurant: { hero: 'centered', features: 'grid', testimonials: 'grid', pricing: 'cards' },
  health: { hero: 'minimal', features: 'minimal', testimonials: 'featured', pricing: 'minimal' },
  wellness: { hero: 'minimal', features: 'minimal', testimonials: 'featured', pricing: 'minimal' },
  travel: { hero: 'centered', features: 'alternating', testimonials: 'carousel', pricing: 'cards' },
  professional: { hero: 'minimal', features: 'alternating', testimonials: 'featured', pricing: 'horizontal' },
};

// Variantes válidas por tipo de sección
const VALID_VARIANTS: Record<string, string[]> = {
  hero: ['centered', 'split', 'minimal', 'asymmetric'],
  features: ['grid', 'alternating', 'bento', 'animated', 'cards3d', 'minimal'],
  testimonials: ['grid', 'carousel', 'featured', 'video', 'masonry'],
  pricing: ['cards', 'horizontal', 'comparison', 'minimal', 'gradient'],
};

/**
 * Extrae las variantes solicitadas del mensaje del usuario
 */
export function extractRequestedVariants(userMessage: string): RequestedVariants {
  const variants: RequestedVariants = {};
  const lowerMessage = userMessage.toLowerCase();

  // Detectar variantes de Hero
  if (lowerMessage.includes('hero split') || lowerMessage.includes('split hero')) {
    variants.hero = 'split';
  } else if (lowerMessage.includes('hero minimal') || lowerMessage.includes('minimal hero')) {
    variants.hero = 'minimal';
  } else if (lowerMessage.includes('hero asymmetric') || lowerMessage.includes('asymmetric hero') || lowerMessage.includes('asimétrico')) {
    variants.hero = 'asymmetric';
  } else if (lowerMessage.includes('hero centered') || lowerMessage.includes('centrado')) {
    variants.hero = 'centered';
  }

  // Detectar variantes de Features
  if (lowerMessage.includes('bento') || lowerMessage.includes('layout bento')) {
    variants.features = 'bento';
  } else if (lowerMessage.includes('alternating') || lowerMessage.includes('alternado')) {
    variants.features = 'alternating';
  } else if (lowerMessage.includes('animated') || lowerMessage.includes('animado')) {
    variants.features = 'animated';
  } else if (lowerMessage.includes('cards3d') || lowerMessage.includes('3d')) {
    variants.features = 'cards3d';
  } else if (lowerMessage.includes('features minimal')) {
    variants.features = 'minimal';
  }

  // Detectar variantes de Testimonials
  if (lowerMessage.includes('carrusel') || lowerMessage.includes('carousel')) {
    variants.testimonials = 'carousel';
  } else if (lowerMessage.includes('featured') || lowerMessage.includes('destacado')) {
    variants.testimonials = 'featured';
  } else if (lowerMessage.includes('video testimonial')) {
    variants.testimonials = 'video';
  } else if (lowerMessage.includes('masonry') || lowerMessage.includes('pinterest')) {
    variants.testimonials = 'masonry';
  }

  // Detectar variantes de Pricing
  if (lowerMessage.includes('gradient') || lowerMessage.includes('gradiente')) {
    variants.pricing = 'gradient';
  } else if (lowerMessage.includes('horizontal')) {
    variants.pricing = 'horizontal';
  } else if (lowerMessage.includes('comparison') || lowerMessage.includes('comparación') || lowerMessage.includes('tabla')) {
    variants.pricing = 'comparison';
  } else if (lowerMessage.includes('pricing minimal')) {
    variants.pricing = 'minimal';
  }

  return variants;
}

/**
 * Detecta la industria del negocio basándose en el mensaje o businessType
 */
export function detectIndustry(userMessage: string, businessType?: string): string {
  const text = `${userMessage} ${businessType || ''}`.toLowerCase();

  if (text.includes('tech') || text.includes('software') || text.includes('app') || text.includes('startup')) {
    return 'tech';
  }
  if (text.includes('saas') || text.includes('plataforma') || text.includes('platform')) {
    return 'saas';
  }
  if (text.includes('agencia') || text.includes('agency') || text.includes('diseño') || text.includes('design')) {
    return 'agency';
  }
  if (text.includes('tienda') || text.includes('store') || text.includes('ecommerce') || text.includes('shop')) {
    return 'ecommerce';
  }
  if (text.includes('restaurante') || text.includes('restaurant') || text.includes('café') || text.includes('bar')) {
    return 'restaurant';
  }
  if (text.includes('salud') || text.includes('health') || text.includes('médico') || text.includes('clínica')) {
    return 'health';
  }
  if (text.includes('spa') || text.includes('yoga') || text.includes('wellness') || text.includes('bienestar')) {
    return 'wellness';
  }
  if (text.includes('viaje') || text.includes('travel') || text.includes('turismo') || text.includes('tour')) {
    return 'travel';
  }
  if (text.includes('abogado') || text.includes('lawyer') || text.includes('consultor') || text.includes('profesional')) {
    return 'professional';
  }

  return 'tech'; // Default
}

/**
 * Valida y corrige las variantes de una landing generada
 */
export function validateAndFixVariants(
  landingData: LandingData,
  userMessage: string
): { data: LandingData; corrections: string[] } {
  const corrections: string[] = [];
  const requestedVariants = extractRequestedVariants(userMessage);
  const industry = detectIndustry(userMessage, landingData.businessType);
  const defaults = INDUSTRY_DEFAULTS[industry] || INDUSTRY_DEFAULTS.tech;

  // Crear copia para no mutar el original
  const fixedData = JSON.parse(JSON.stringify(landingData)) as LandingData;

  for (const section of fixedData.sections) {
    const sectionType = section.type;
    const validVariants = VALID_VARIANTS[sectionType];

    if (!validVariants) continue; // No es una sección con variantes

    const variantField = sectionType === 'hero' ? 'variant' : 'layout';
    const currentVariant = section.content[variantField] as string | undefined;
    const requestedVariant = requestedVariants[sectionType as keyof RequestedVariants];
    const defaultVariant = defaults[sectionType as keyof RequestedVariants];

    // Determinar la variante correcta
    let correctVariant: string | undefined;

    if (requestedVariant && validVariants.includes(requestedVariant)) {
      // El usuario solicitó una variante específica
      correctVariant = requestedVariant;
    } else if (!currentVariant || !validVariants.includes(currentVariant)) {
      // No hay variante o es inválida, usar default de industria
      correctVariant = defaultVariant;
    }

    // Aplicar corrección si es necesario
    if (correctVariant && currentVariant !== correctVariant) {
      section.content[variantField] = correctVariant;
      corrections.push(
        `${sectionType}: cambiado de "${currentVariant || 'ninguno'}" a "${correctVariant}"`
      );
    }
  }

  return { data: fixedData, corrections };
}

/**
 * Genera un resumen de las variantes aplicadas
 */
export function getVariantsSummary(landingData: LandingData): Record<string, string> {
  const summary: Record<string, string> = {};

  for (const section of landingData.sections) {
    const sectionType = section.type;
    const variantField = sectionType === 'hero' ? 'variant' : 'layout';
    const variant = section.content[variantField] as string | undefined;

    if (variant && VALID_VARIANTS[sectionType]) {
      summary[sectionType] = variant;
    }
  }

  return summary;
}
