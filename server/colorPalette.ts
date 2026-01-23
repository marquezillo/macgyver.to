/**
 * Sistema de Validación y Aplicación de Paleta de Colores
 * 
 * Este módulo asegura que las landings generadas respeten los colores solicitados
 * y proporciona paletas predefinidas por industria.
 */

// Paletas predefinidas por industria
export const INDUSTRY_PALETTES: Record<string, {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
}> = {
  // Tecnología / SaaS
  tech: {
    primary: '#6366f1',    // Indigo
    secondary: '#8b5cf6',  // Púrpura
    accent: '#06b6d4',     // Cyan
    background: '#0a0a0a', // Negro
    text: '#ffffff',       // Blanco
    muted: '#a1a1aa',      // Gris
  },
  saas: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#22d3ee',
    background: '#0f0f23',
    text: '#ffffff',
    muted: '#94a3b8',
  },
  corporate: {
    primary: '#2563eb',    // Azul
    secondary: '#1e40af',  // Azul oscuro
    accent: '#3b82f6',
    background: '#f8fafc', // Gris claro
    text: '#1e293b',
    muted: '#64748b',
  },

  // Viajes / Turismo
  travel: {
    primary: '#f59e0b',    // Dorado
    secondary: '#0891b2',  // Turquesa
    accent: '#06b6d4',
    background: '#1a1a2e', // Oscuro
    text: '#ffffff',
    muted: '#9ca3af',
  },
  beach: {
    primary: '#06b6d4',    // Cyan
    secondary: '#0ea5e9',  // Azul
    accent: '#fbbf24',
    background: '#fef3c7', // Arena
    text: '#1e293b',
    muted: '#64748b',
  },
  adventure: {
    primary: '#16a34a',    // Verde
    secondary: '#854d0e',  // Marrón
    accent: '#22c55e',
    background: '#1a1a1a', // Oscuro
    text: '#ffffff',
    muted: '#9ca3af',
  },
  thailand: {
    primary: '#f59e0b',    // Dorado
    secondary: '#0891b2',  // Turquesa
    accent: '#dc2626',     // Rojo
    background: '#1a1a2e',
    text: '#ffffff',
    muted: '#9ca3af',
  },

  // Restaurantes / Food
  restaurant: {
    primary: '#dc2626',    // Rojo
    secondary: '#1a1a1a',  // Negro
    accent: '#f59e0b',
    background: '#fef3c7', // Crema
    text: '#1a1a1a',
    muted: '#78716c',
  },
  italian: {
    primary: '#dc2626',    // Rojo
    secondary: '#16a34a',  // Verde
    accent: '#fef3c7',
    background: '#fffbeb',
    text: '#1c1917',
    muted: '#78716c',
  },
  japanese: {
    primary: '#dc2626',    // Rojo
    secondary: '#1a1a1a',  // Negro
    accent: '#ffffff',
    background: '#1a1a1a',
    text: '#ffffff',
    muted: '#a1a1aa',
  },
  mexican: {
    primary: '#dc2626',    // Rojo
    secondary: '#16a34a',  // Verde
    accent: '#facc15',     // Amarillo
    background: '#fef3c7',
    text: '#1c1917',
    muted: '#78716c',
  },
  cafe: {
    primary: '#78350f',    // Marrón café
    secondary: '#92400e',
    accent: '#fbbf24',
    background: '#fffbeb',
    text: '#1c1917',
    muted: '#78716c',
  },

  // Salud / Bienestar
  health: {
    primary: '#0ea5e9',    // Azul
    secondary: '#0284c7',
    accent: '#22d3ee',
    background: '#f0f9ff', // Azul claro
    text: '#0c4a6e',
    muted: '#64748b',
  },
  spa: {
    primary: '#14b8a6',    // Teal
    secondary: '#a855f7',  // Púrpura
    accent: '#5eead4',
    background: '#faf5ff', // Lavanda
    text: '#1e1b4b',
    muted: '#6b7280',
  },
  fitness: {
    primary: '#ef4444',    // Rojo
    secondary: '#f97316',  // Naranja
    accent: '#fbbf24',
    background: '#1a1a1a', // Negro
    text: '#ffffff',
    muted: '#9ca3af',
  },
  medical: {
    primary: '#0ea5e9',    // Azul
    secondary: '#0284c7',
    accent: '#22d3ee',
    background: '#ffffff',
    text: '#0c4a6e',
    muted: '#64748b',
  },
  dental: {
    primary: '#06b6d4',    // Cyan
    secondary: '#0891b2',
    accent: '#22d3ee',
    background: '#f0fdfa',
    text: '#134e4a',
    muted: '#64748b',
  },

  // Educación
  education: {
    primary: '#7c3aed',    // Violeta
    secondary: '#6366f1',  // Indigo
    accent: '#a78bfa',
    background: '#faf5ff',
    text: '#1e1b4b',
    muted: '#6b7280',
  },

  // E-commerce / Retail
  ecommerce: {
    primary: '#f97316',    // Naranja
    secondary: '#ea580c',
    accent: '#fbbf24',
    background: '#ffffff',
    text: '#1c1917',
    muted: '#78716c',
  },
  fashion: {
    primary: '#1a1a1a',    // Negro
    secondary: '#404040',
    accent: '#f59e0b',
    background: '#ffffff',
    text: '#1a1a1a',
    muted: '#6b7280',
  },

  // Finanzas
  finance: {
    primary: '#059669',    // Verde esmeralda
    secondary: '#047857',
    accent: '#10b981',
    background: '#f0fdf4',
    text: '#064e3b',
    muted: '#6b7280',
  },

  // Inmobiliaria
  realestate: {
    primary: '#0369a1',    // Azul
    secondary: '#0284c7',
    accent: '#f59e0b',
    background: '#f8fafc',
    text: '#0c4a6e',
    muted: '#64748b',
  },

  // Legal
  legal: {
    primary: '#1e3a5f',    // Azul marino
    secondary: '#2563eb',
    accent: '#d4af37',     // Dorado
    background: '#f8fafc',
    text: '#1e293b',
    muted: '#64748b',
  },

  // Default
  default: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
    background: '#0a0a0a',
    text: '#ffffff',
    muted: '#a1a1aa',
  },
};

// Mapeo de palabras clave a industrias
const KEYWORD_TO_INDUSTRY: Record<string, string> = {
  // Tech
  'software': 'tech',
  'saas': 'saas',
  'app': 'tech',
  'startup': 'tech',
  'tecnología': 'tech',
  'technology': 'tech',
  'ai': 'tech',
  'inteligencia artificial': 'tech',
  'automation': 'saas',
  'automatización': 'saas',
  'cloud': 'saas',
  'corporativo': 'corporate',
  'corporate': 'corporate',
  'enterprise': 'corporate',

  // Travel
  'viajes': 'travel',
  'travel': 'travel',
  'agencia de viajes': 'travel',
  'turismo': 'travel',
  'tourism': 'travel',
  'playa': 'beach',
  'beach': 'beach',
  'aventura': 'adventure',
  'adventure': 'adventure',
  'thailand': 'thailand',
  'tailandia': 'thailand',

  // Food
  'restaurante': 'restaurant',
  'restaurant': 'restaurant',
  'italiano': 'italian',
  'italian': 'italian',
  'pizza': 'italian',
  'japonés': 'japanese',
  'japanese': 'japanese',
  'sushi': 'japanese',
  'mexicano': 'mexican',
  'mexican': 'mexican',
  'tacos': 'mexican',
  'café': 'cafe',
  'cafetería': 'cafe',
  'coffee': 'cafe',
  'cafe': 'cafe',

  // Health
  'salud': 'health',
  'health': 'health',
  'spa': 'spa',
  'wellness': 'spa',
  'bienestar': 'spa',
  'gym': 'fitness',
  'gimnasio': 'fitness',
  'fitness': 'fitness',
  'médico': 'medical',
  'medical': 'medical',
  'clínica': 'medical',
  'clinic': 'medical',
  'hospital': 'medical',
  'dental': 'dental',
  'dentista': 'dental',
  'dentist': 'dental',

  // Education
  'educación': 'education',
  'education': 'education',
  'escuela': 'education',
  'school': 'education',
  'academia': 'education',
  'academy': 'education',
  'cursos': 'education',
  'courses': 'education',

  // E-commerce
  'tienda': 'ecommerce',
  'store': 'ecommerce',
  'ecommerce': 'ecommerce',
  'shop': 'ecommerce',
  'moda': 'fashion',
  'fashion': 'fashion',
  'ropa': 'fashion',
  'clothing': 'fashion',

  // Finance
  'finanzas': 'finance',
  'finance': 'finance',
  'banco': 'finance',
  'bank': 'finance',
  'inversiones': 'finance',
  'investment': 'finance',

  // Real Estate
  'inmobiliaria': 'realestate',
  'real estate': 'realestate',
  'propiedades': 'realestate',
  'properties': 'realestate',

  // Legal
  'abogado': 'legal',
  'lawyer': 'legal',
  'legal': 'legal',
  'law': 'legal',
  'bufete': 'legal',
};

// Mapeo de colores mencionados a valores hex
const COLOR_NAME_TO_HEX: Record<string, string> = {
  // Azules
  'azul': '#2563eb',
  'blue': '#2563eb',
  'indigo': '#6366f1',
  'índigo': '#6366f1',
  'cyan': '#06b6d4',
  'turquesa': '#0891b2',
  'turquoise': '#0891b2',
  'navy': '#1e3a5f',
  'marino': '#1e3a5f',

  // Púrpuras
  'púrpura': '#8b5cf6',
  'purple': '#8b5cf6',
  'violeta': '#7c3aed',
  'violet': '#7c3aed',
  'morado': '#a855f7',
  'lavanda': '#c4b5fd',
  'lavender': '#c4b5fd',

  // Rojos
  'rojo': '#dc2626',
  'red': '#dc2626',
  'coral': '#f87171',
  'carmesí': '#be123c',
  'crimson': '#be123c',

  // Naranjas
  'naranja': '#f97316',
  'orange': '#f97316',
  'ámbar': '#f59e0b',
  'amber': '#f59e0b',

  // Amarillos
  'amarillo': '#facc15',
  'yellow': '#facc15',
  'dorado': '#f59e0b',
  'gold': '#f59e0b',
  'golden': '#f59e0b',

  // Verdes
  'verde': '#16a34a',
  'green': '#16a34a',
  'esmeralda': '#059669',
  'emerald': '#059669',
  'teal': '#14b8a6',
  'menta': '#5eead4',
  'mint': '#5eead4',
  'lima': '#84cc16',
  'lime': '#84cc16',

  // Neutros
  'negro': '#0a0a0a',
  'black': '#0a0a0a',
  'blanco': '#ffffff',
  'white': '#ffffff',
  'gris': '#6b7280',
  'gray': '#6b7280',
  'grey': '#6b7280',

  // Marrones
  'marrón': '#78350f',
  'brown': '#78350f',
  'café': '#78350f',
  'chocolate': '#7c2d12',

  // Rosas
  'rosa': '#ec4899',
  'pink': '#ec4899',
  'fucsia': '#d946ef',
  'fuchsia': '#d946ef',
  'magenta': '#d946ef',
};

/**
 * Detecta la industria basándose en el prompt del usuario
 */
export function detectIndustry(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  for (const [keyword, industry] of Object.entries(KEYWORD_TO_INDUSTRY)) {
    if (lowerPrompt.includes(keyword)) {
      return industry;
    }
  }
  
  return 'default';
}

/**
 * Extrae colores mencionados en el prompt
 */
export function extractColorsFromPrompt(prompt: string): { primary?: string; secondary?: string } {
  const lowerPrompt = prompt.toLowerCase();
  const colors: string[] = [];
  
  for (const [colorName, hexValue] of Object.entries(COLOR_NAME_TO_HEX)) {
    if (lowerPrompt.includes(colorName)) {
      colors.push(hexValue);
    }
  }
  
  // También buscar colores hex directamente en el prompt
  const hexPattern = /#[0-9a-fA-F]{6}/g;
  const hexMatches = prompt.match(hexPattern);
  if (hexMatches) {
    colors.push(...hexMatches);
  }
  
  return {
    primary: colors[0],
    secondary: colors[1],
  };
}

/**
 * Obtiene la paleta de colores para una landing
 */
export function getPaletteForLanding(prompt: string): typeof INDUSTRY_PALETTES['default'] {
  // 1. Primero intentar extraer colores explícitos del prompt
  const extractedColors = extractColorsFromPrompt(prompt);
  
  // 2. Detectar industria
  const industry = detectIndustry(prompt);
  const basePalette = INDUSTRY_PALETTES[industry] || INDUSTRY_PALETTES.default;
  
  // 3. Sobrescribir con colores explícitos si existen
  return {
    ...basePalette,
    ...(extractedColors.primary && { primary: extractedColors.primary }),
    ...(extractedColors.secondary && { secondary: extractedColors.secondary }),
  };
}

/**
 * Aplica la paleta de colores a una landing generada
 */
export function applyPaletteToLanding(
  landing: { globalStyles?: Record<string, string>; sections: any[] },
  palette: typeof INDUSTRY_PALETTES['default']
): typeof landing {
  // Actualizar estilos globales
  const updatedGlobalStyles = {
    ...landing.globalStyles,
    primaryColor: palette.primary,
    secondaryColor: palette.secondary,
    accentColor: palette.accent,
    backgroundColor: palette.background,
    textColor: palette.text,
    mutedColor: palette.muted,
  };
  
  // Actualizar colores en cada sección
  const updatedSections = landing.sections.map(section => {
    const updatedSection = { ...section };
    
    // Aplicar colores según el tipo de sección
    if (section.backgroundColor === undefined || section.backgroundColor === '') {
      updatedSection.backgroundColor = palette.background;
    }
    
    if (section.textColor === undefined || section.textColor === '') {
      updatedSection.textColor = palette.text;
    }
    
    // Para botones/CTAs
    if (section.ctaColor === undefined || section.ctaColor === '') {
      updatedSection.ctaColor = palette.primary;
    }
    
    // Para badges
    if (section.badgeColor === undefined || section.badgeColor === '') {
      updatedSection.badgeColor = palette.accent;
    }
    
    return updatedSection;
  });
  
  return {
    ...landing,
    globalStyles: updatedGlobalStyles,
    sections: updatedSections,
  };
}

/**
 * Valida el contraste de colores para asegurar legibilidad
 */
export function validateColorContrast(bgColor: string, textColor: string): boolean {
  // Convertir hex a RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  };
  
  // Calcular luminancia relativa
  const getLuminance = (rgb: { r: number; g: number; b: number }) => {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const bg = hexToRgb(bgColor);
  const text = hexToRgb(textColor);
  
  if (!bg || !text) return true; // Si no se puede parsear, asumir válido
  
  const bgLuminance = getLuminance(bg);
  const textLuminance = getLuminance(text);
  
  // Calcular ratio de contraste
  const lighter = Math.max(bgLuminance, textLuminance);
  const darker = Math.min(bgLuminance, textLuminance);
  const contrastRatio = (lighter + 0.05) / (darker + 0.05);
  
  // WCAG AA requiere al menos 4.5:1 para texto normal
  return contrastRatio >= 4.5;
}

/**
 * Sugiere un color de texto apropiado para un fondo dado
 */
export function suggestTextColor(bgColor: string): string {
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  };
  
  const rgb = hexToRgb(bgColor);
  if (!rgb) return '#ffffff';
  
  // Calcular brillo percibido
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  
  // Si el fondo es oscuro, usar texto claro y viceversa
  return brightness > 128 ? '#1a1a1a' : '#ffffff';
}

export default {
  INDUSTRY_PALETTES,
  detectIndustry,
  extractColorsFromPrompt,
  getPaletteForLanding,
  applyPaletteToLanding,
  validateColorContrast,
  suggestTextColor,
};
