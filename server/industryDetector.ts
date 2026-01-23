/**
 * Industry Detector - Detección automática de industria y aplicación de patrones
 * Conecta los 308 patrones de industria con el flujo de generación de landings
 */

import { 
  allPatterns, 
  findPatternByKeywords, 
  generateIndustryPrompt,
  IndustryPattern,
  TOTAL_PATTERNS
} from './industryPatterns';

export interface DetectionResult {
  detected: boolean;
  pattern: IndustryPattern | null;
  confidence: 'high' | 'medium' | 'low';
  matchedKeywords: string[];
  industryPrompt: string;
  suggestedImageQueries: string[];
}

/**
 * Detecta la industria del usuario basándose en su mensaje
 * Usa múltiples estrategias: keywords exactos, fuzzy matching, y análisis semántico
 */
export function detectIndustry(userMessage: string): DetectionResult {
  const normalizedMessage = userMessage.toLowerCase().trim();
  
  // Estrategia 1: Búsqueda por keywords exactos
  const exactMatch = findPatternByKeywords(normalizedMessage);
  if (exactMatch) {
    const matchedKeywords = exactMatch.keywords.filter((kw: string) => 
      normalizedMessage.includes(kw.toLowerCase())
    );
    
    return {
      detected: true,
      pattern: exactMatch,
      confidence: matchedKeywords.length >= 2 ? 'high' : 'medium',
      matchedKeywords,
      industryPrompt: generateIndustryPrompt(exactMatch),
      suggestedImageQueries: exactMatch.suggestedImages
    };
  }
  
  // Estrategia 2: Búsqueda por nombre de industria
  for (const [id, pattern] of Object.entries(allPatterns)) {
    const nameLower = pattern.name.toLowerCase();
    const nameEsLower = pattern.nameEs.toLowerCase();
    
    if (normalizedMessage.includes(nameLower) || normalizedMessage.includes(nameEsLower)) {
      return {
        detected: true,
        pattern,
        confidence: 'high',
        matchedKeywords: [pattern.name],
        industryPrompt: generateIndustryPrompt(pattern),
        suggestedImageQueries: pattern.suggestedImages
      };
    }
  }
  
  // Estrategia 3: Fuzzy matching con palabras clave parciales
  const fuzzyMatch = findFuzzyMatch(normalizedMessage);
  if (fuzzyMatch) {
    return {
      detected: true,
      pattern: fuzzyMatch.pattern,
      confidence: 'low',
      matchedKeywords: fuzzyMatch.matchedKeywords,
      industryPrompt: generateIndustryPrompt(fuzzyMatch.pattern),
      suggestedImageQueries: fuzzyMatch.pattern.suggestedImages
    };
  }
  
  // Estrategia 4: Detección por categoría genérica
  const categoryMatch = detectByCategory(normalizedMessage);
  if (categoryMatch) {
    return {
      detected: true,
      pattern: categoryMatch,
      confidence: 'low',
      matchedKeywords: [],
      industryPrompt: generateIndustryPrompt(categoryMatch),
      suggestedImageQueries: categoryMatch.suggestedImages
    };
  }
  
  // No se detectó industria específica
  return {
    detected: false,
    pattern: null,
    confidence: 'low',
    matchedKeywords: [],
    industryPrompt: '',
    suggestedImageQueries: []
  };
}

/**
 * Búsqueda fuzzy con coincidencias parciales
 */
function findFuzzyMatch(message: string): { pattern: IndustryPattern; matchedKeywords: string[] } | null {
  let bestMatch: { pattern: IndustryPattern; score: number; matchedKeywords: string[] } | null = null;
  
  for (const pattern of Object.values(allPatterns)) {
    let score = 0;
    const matchedKeywords: string[] = [];
    
    for (const keyword of pattern.keywords) {
      const keywordLower = keyword.toLowerCase();
      
      // Coincidencia exacta
      if (message.includes(keywordLower)) {
        score += 10;
        matchedKeywords.push(keyword);
      }
      // Coincidencia parcial (palabra contiene el keyword o viceversa)
      else {
        const words = message.split(/\s+/);
        for (const word of words) {
          if (word.length >= 3 && (word.includes(keywordLower) || keywordLower.includes(word))) {
            score += 3;
            matchedKeywords.push(keyword);
            break;
          }
        }
      }
    }
    
    // También verificar el nombre de la industria
    const nameParts = pattern.name.toLowerCase().split(/[\s\/]+/);
    const nameEsParts = pattern.nameEs.toLowerCase().split(/[\s\/]+/);
    
    for (const part of [...nameParts, ...nameEsParts]) {
      if (part.length >= 3 && message.includes(part)) {
        score += 5;
        matchedKeywords.push(part);
      }
    }
    
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { pattern, score, matchedKeywords };
    }
  }
  
  // Solo retornar si el score es suficientemente alto
  if (bestMatch && bestMatch.score >= 5) {
    return { pattern: bestMatch.pattern, matchedKeywords: bestMatch.matchedKeywords };
  }
  
  return null;
}

/**
 * Detecta por categoría genérica cuando no hay match específico
 */
function detectByCategory(message: string): IndustryPattern | null {
  const categoryKeywords: Record<string, string[]> = {
    'technology': ['tech', 'software', 'app', 'digital', 'online', 'web', 'tecnología', 'aplicación'],
    'food': ['food', 'comida', 'restaurant', 'restaurante', 'cocina', 'chef', 'menu', 'menú'],
    'health': ['health', 'salud', 'medical', 'médico', 'clinic', 'clínica', 'doctor', 'wellness'],
    'services': ['service', 'servicio', 'agency', 'agencia', 'consulting', 'consultoría'],
    'beauty': ['beauty', 'belleza', 'salon', 'salón', 'spa', 'hair', 'cabello', 'nails', 'uñas'],
    'fitness': ['fitness', 'gym', 'gimnasio', 'yoga', 'pilates', 'workout', 'exercise', 'ejercicio'],
    'education': ['education', 'educación', 'course', 'curso', 'learn', 'aprender', 'school', 'escuela'],
    'real-estate': ['real estate', 'inmobiliaria', 'property', 'propiedad', 'house', 'casa', 'apartment'],
    'travel': ['travel', 'viaje', 'tour', 'hotel', 'vacation', 'vacaciones', 'trip'],
    'events': ['event', 'evento', 'wedding', 'boda', 'party', 'fiesta', 'celebration'],
    'retail': ['shop', 'tienda', 'store', 'ecommerce', 'products', 'productos', 'sell', 'vender'],
    'automotive': ['car', 'auto', 'coche', 'vehicle', 'vehículo', 'mechanic', 'mecánico'],
    'pets': ['pet', 'mascota', 'dog', 'perro', 'cat', 'gato', 'veterinary', 'veterinario'],
    'construction': ['construction', 'construcción', 'building', 'contractor', 'contratista'],
    'entertainment': ['entertainment', 'entretenimiento', 'music', 'música', 'video', 'game', 'juego']
  };
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (message.includes(keyword)) {
        // Buscar el primer patrón de esta categoría
        const categoryPatterns = Object.values(allPatterns).filter(p => p.category === category);
        if (categoryPatterns.length > 0) {
          // Retornar el patrón más genérico de la categoría (el primero)
          return categoryPatterns[0];
        }
      }
    }
  }
  
  return null;
}

/**
 * Genera el prompt enriquecido con el patrón de industria detectado
 */
export function enrichPromptWithIndustry(basePrompt: string, userMessage: string): string {
  const detection = detectIndustry(userMessage);
  
  if (!detection.detected || !detection.pattern) {
    return basePrompt;
  }
  
  const industryContext = `
## PATRÓN DE INDUSTRIA DETECTADO: ${detection.pattern.name}
Confianza: ${detection.confidence}
Keywords detectados: ${detection.matchedKeywords.join(', ')}

${detection.industryPrompt}

IMPORTANTE: DEBES usar las variantes de layout especificadas arriba para cada sección.
- Hero DEBE usar layout: "${detection.pattern.heroVariant}"
- Features DEBE usar layout: "${detection.pattern.featuresVariant}"
- Testimonials DEBE usar layout: "${detection.pattern.testimonialsVariant}"
${detection.pattern.pricingVariant ? `- Pricing DEBE usar layout: "${detection.pattern.pricingVariant}"` : ''}

Las secciones DEBEN seguir el orden recomendado: ${detection.pattern.sections.join(' → ')}
`;

  return basePrompt + '\n\n' + industryContext;
}

/**
 * Obtiene las queries de búsqueda de imágenes para una industria
 */
export function getImageQueriesForIndustry(userMessage: string): string[] {
  const detection = detectIndustry(userMessage);
  
  if (!detection.detected || !detection.pattern) {
    return [];
  }
  
  // Combinar las imágenes sugeridas con el nombre del negocio si está disponible
  const baseQueries = detection.pattern.suggestedImages;
  
  // Añadir queries específicas de la industria
  const industryQueries = [
    `${detection.pattern.name} business`,
    `${detection.pattern.nameEs} profesional`,
    `${detection.pattern.category} industry`
  ];
  
  return [...baseQueries, ...industryQueries];
}

/**
 * Aplica el patrón de industria a una landing generada
 * Corrige secciones, variantes y colores si no coinciden con el patrón
 */
export function applyIndustryPattern(
  landingData: {
    type: string;
    businessType?: string;
    businessName?: string;
    sections: Array<{
      id: string;
      type: string;
      content: Record<string, unknown>;
      styles?: Record<string, unknown>;
    }>;
  },
  userMessage: string
): {
  data: typeof landingData;
  appliedPattern: IndustryPattern | null;
  corrections: string[];
} {
  const detection = detectIndustry(userMessage);
  const corrections: string[] = [];
  
  if (!detection.detected || !detection.pattern) {
    return { data: landingData, appliedPattern: null, corrections };
  }
  
  const pattern = detection.pattern;
  const updatedSections = [...landingData.sections];
  
  // Aplicar variantes correctas a cada sección
  for (const section of updatedSections) {
    const sectionType = section.type.toLowerCase();
    
    // Corregir Hero
    if (sectionType === 'hero') {
      const currentLayout = section.content.layout as string | undefined;
      if (currentLayout !== pattern.heroVariant) {
        section.content.layout = pattern.heroVariant;
        corrections.push(`Hero: ${currentLayout || 'default'} → ${pattern.heroVariant}`);
      }
    }
    
    // Corregir Features
    if (sectionType === 'features') {
      const currentLayout = section.content.layout as string | undefined;
      if (currentLayout !== pattern.featuresVariant) {
        section.content.layout = pattern.featuresVariant;
        corrections.push(`Features: ${currentLayout || 'default'} → ${pattern.featuresVariant}`);
      }
    }
    
    // Corregir Testimonials
    if (sectionType === 'testimonials') {
      const currentLayout = section.content.layout as string | undefined;
      if (currentLayout !== pattern.testimonialsVariant) {
        section.content.layout = pattern.testimonialsVariant;
        corrections.push(`Testimonials: ${currentLayout || 'default'} → ${pattern.testimonialsVariant}`);
      }
    }
    
    // Corregir Pricing
    if (sectionType === 'pricing' && pattern.pricingVariant) {
      const currentLayout = section.content.layout as string | undefined;
      if (currentLayout !== pattern.pricingVariant) {
        section.content.layout = pattern.pricingVariant;
        corrections.push(`Pricing: ${currentLayout || 'default'} → ${pattern.pricingVariant}`);
      }
    }
  }
  
  // Actualizar businessType si no está definido
  if (!landingData.businessType) {
    landingData.businessType = pattern.name;
    corrections.push(`BusinessType: undefined → ${pattern.name}`);
  }
  
  return {
    data: { ...landingData, sections: updatedSections },
    appliedPattern: pattern,
    corrections
  };
}

// Exportar estadísticas
export const INDUSTRY_DETECTOR_STATS = {
  totalPatterns: TOTAL_PATTERNS,
  categories: Object.values(allPatterns).reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)
};

console.log(`[IndustryDetector] Loaded ${TOTAL_PATTERNS} industry patterns across ${Object.keys(INDUSTRY_DETECTOR_STATS.categories).length} categories`);
