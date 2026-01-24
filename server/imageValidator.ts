/**
 * Image Validator
 * Valida URLs de imágenes y proporciona fallbacks elegantes
 */

// Cache de URLs validadas (válidas por 1 hora)
const validationCache: Map<string, { valid: boolean; timestamp: number }> = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hora

// Gradientes elegantes para fallback
const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
];

// Patrones de URLs conocidas como problemáticas
const KNOWN_BAD_PATTERNS = [
  'placeholder.com',
  'via.placeholder',
  'placehold.it',
  'placehold.co',
  'dummyimage.com',
  'fakeimg.pl',
  'lorempixel.com',
  'placekitten.com',
  'loremflickr.com',
  'picsum.photos', // A veces falla
];

// Dominios confiables que no necesitan validación
const TRUSTED_DOMAINS = [
  'images.unsplash.com',
  'unsplash.com',
  'images.pexels.com',
  'pexels.com',
  'pixabay.com',
  'cdn.pixabay.com',
  'storage.googleapis.com',
  'cloudinary.com',
  'res.cloudinary.com',
  'imgur.com',
  'i.imgur.com',
];

interface ValidationResult {
  valid: boolean;
  url: string;
  fallback?: string;
  reason?: string;
}

/**
 * Verifica si una URL es de un dominio confiable
 */
function isTrustedDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return TRUSTED_DOMAINS.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}

/**
 * Verifica si una URL tiene un patrón conocido como problemático
 */
function hasKnownBadPattern(url: string): boolean {
  return KNOWN_BAD_PATTERNS.some(pattern => url.includes(pattern));
}

/**
 * Obtiene un gradiente de fallback basado en un índice o hash
 */
export function getFallbackGradient(seed: string | number = 0): string {
  let index: number;
  
  if (typeof seed === 'string') {
    // Crear hash simple del string
    index = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  } else {
    index = seed;
  }
  
  return FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];
}

/**
 * Valida una URL de imagen de forma síncrona (solo verificaciones básicas)
 */
export function validateImageUrlSync(url: string): ValidationResult {
  // URL vacía o inválida
  if (!url || typeof url !== 'string') {
    return {
      valid: false,
      url: '',
      fallback: getFallbackGradient(0),
      reason: 'URL vacía o inválida',
    };
  }
  
  const trimmedUrl = url.trim();
  
  // Verificar valores nulos/undefined como string
  if (trimmedUrl === '' || trimmedUrl === 'undefined' || trimmedUrl === 'null') {
    return {
      valid: false,
      url: trimmedUrl,
      fallback: getFallbackGradient(trimmedUrl),
      reason: 'URL es undefined o null',
    };
  }
  
  // Verificar que empiece con http/https
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    // Podría ser una ruta relativa válida
    if (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('data:')) {
      return { valid: true, url: trimmedUrl };
    }
    return {
      valid: false,
      url: trimmedUrl,
      fallback: getFallbackGradient(trimmedUrl),
      reason: 'URL no tiene protocolo válido',
    };
  }
  
  // Verificar patrones problemáticos conocidos
  if (hasKnownBadPattern(trimmedUrl)) {
    return {
      valid: false,
      url: trimmedUrl,
      fallback: getFallbackGradient(trimmedUrl),
      reason: 'URL de servicio de placeholder conocido',
    };
  }
  
  // Verificar si es de dominio confiable
  if (isTrustedDomain(trimmedUrl)) {
    return { valid: true, url: trimmedUrl };
  }
  
  // Verificar caché
  const cached = validationCache.get(trimmedUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return {
      valid: cached.valid,
      url: trimmedUrl,
      fallback: cached.valid ? undefined : getFallbackGradient(trimmedUrl),
    };
  }
  
  // Por defecto, asumir válida (la validación async se hará después)
  return { valid: true, url: trimmedUrl };
}

/**
 * Valida una URL de imagen de forma asíncrona (con HEAD request)
 */
export async function validateImageUrlAsync(url: string): Promise<ValidationResult> {
  // Primero hacer validación síncrona
  const syncResult = validateImageUrlSync(url);
  if (!syncResult.valid) {
    return syncResult;
  }
  
  // Si es de dominio confiable, no hacer request
  if (isTrustedDomain(url)) {
    return { valid: true, url };
  }
  
  // Verificar caché
  const cached = validationCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return {
      valid: cached.valid,
      url,
      fallback: cached.valid ? undefined : getFallbackGradient(url),
    };
  }
  
  try {
    // Hacer HEAD request con timeout corto
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageValidator/1.0)',
      },
    });
    
    clearTimeout(timeoutId);
    
    const isValid = response.ok;
    const contentType = response.headers.get('content-type') || '';
    const isImage = contentType.startsWith('image/');
    
    const valid = isValid && isImage;
    
    // Guardar en caché
    validationCache.set(url, { valid, timestamp: Date.now() });
    
    return {
      valid,
      url,
      fallback: valid ? undefined : getFallbackGradient(url),
      reason: valid ? undefined : `HTTP ${response.status} o no es imagen`,
    };
  } catch (error) {
    // Error de red o timeout
    validationCache.set(url, { valid: false, timestamp: Date.now() });
    
    return {
      valid: false,
      url,
      fallback: getFallbackGradient(url),
      reason: error instanceof Error ? error.message : 'Error de red',
    };
  }
}

/**
 * Valida múltiples URLs en paralelo
 */
export async function validateMultipleUrls(urls: string[]): Promise<Map<string, ValidationResult>> {
  const results = new Map<string, ValidationResult>();
  
  // Validar en paralelo con límite de concurrencia
  const CONCURRENCY_LIMIT = 5;
  const chunks: string[][] = [];
  
  for (let i = 0; i < urls.length; i += CONCURRENCY_LIMIT) {
    chunks.push(urls.slice(i, i + CONCURRENCY_LIMIT));
  }
  
  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map(url => validateImageUrlAsync(url))
    );
    
    chunk.forEach((url, index) => {
      results.set(url, chunkResults[index]);
    });
  }
  
  return results;
}

/**
 * Limpia el caché de validaciones
 */
export function clearValidationCache(): void {
  validationCache.clear();
}

/**
 * Obtiene estadísticas del caché
 */
export function getCacheStats(): { size: number; validCount: number; invalidCount: number } {
  let validCount = 0;
  let invalidCount = 0;
  
  validationCache.forEach(entry => {
    if (entry.valid) validCount++;
    else invalidCount++;
  });
  
  return {
    size: validationCache.size,
    validCount,
    invalidCount,
  };
}

/**
 * Valida y corrige URLs de imágenes en un objeto de landing
 */
export function validateLandingImages(
  landingData: { sections: Array<{ type: string; content: Record<string, unknown> }> }
): { sections: Array<{ type: string; content: Record<string, unknown> }> } {
  const fixedSections = landingData.sections.map((section, sectionIndex) => {
    const content = { ...section.content };
    
    // Validar backgroundImage
    if (content.backgroundImage && typeof content.backgroundImage === 'string') {
      const result = validateImageUrlSync(content.backgroundImage);
      if (!result.valid) {
        console.log(`[ImageValidator] Invalid backgroundImage in ${section.type}: ${result.reason}`);
        content.backgroundImage = result.fallback;
      }
    }
    
    // Validar image
    if (content.image && typeof content.image === 'string') {
      const result = validateImageUrlSync(content.image);
      if (!result.valid) {
        console.log(`[ImageValidator] Invalid image in ${section.type}: ${result.reason}`);
        content.image = result.fallback;
      }
    }
    
    // Validar imageUrl
    if (content.imageUrl && typeof content.imageUrl === 'string') {
      const result = validateImageUrlSync(content.imageUrl);
      if (!result.valid) {
        console.log(`[ImageValidator] Invalid imageUrl in ${section.type}: ${result.reason}`);
        content.imageUrl = result.fallback;
      }
    }
    
    // Validar items con imágenes (testimonios, equipo, etc.)
    if (Array.isArray(content.items)) {
      content.items = content.items.map((item: Record<string, unknown>, itemIndex: number) => {
        const fixedItem = { ...item };
        
        if (fixedItem.image && typeof fixedItem.image === 'string') {
          const result = validateImageUrlSync(fixedItem.image);
          if (!result.valid) {
            console.log(`[ImageValidator] Invalid item image in ${section.type}[${itemIndex}]: ${result.reason}`);
            fixedItem.image = result.fallback;
          }
        }
        
        if (fixedItem.avatar && typeof fixedItem.avatar === 'string') {
          const result = validateImageUrlSync(fixedItem.avatar);
          if (!result.valid) {
            console.log(`[ImageValidator] Invalid avatar in ${section.type}[${itemIndex}]: ${result.reason}`);
            fixedItem.avatar = result.fallback;
          }
        }
        
        return fixedItem;
      });
    }
    
    // Validar images array (galería)
    if (Array.isArray(content.images)) {
      content.images = content.images.map((img: { url?: string } | string, imgIndex: number) => {
        if (typeof img === 'string') {
          const result = validateImageUrlSync(img);
          if (!result.valid) {
            console.log(`[ImageValidator] Invalid gallery image[${imgIndex}]: ${result.reason}`);
            return result.fallback;
          }
          return img;
        }
        
        if (img && typeof img === 'object' && img.url) {
          const result = validateImageUrlSync(img.url);
          if (!result.valid) {
            console.log(`[ImageValidator] Invalid gallery image[${imgIndex}]: ${result.reason}`);
            return { ...img, url: result.fallback };
          }
        }
        
        return img;
      });
    }
    
    return { ...section, content };
  });
  
  return { sections: fixedSections };
}
