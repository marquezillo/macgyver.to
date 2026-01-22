/**
 * Image Search Module - Sistema Híbrido de Búsqueda de Imágenes
 * 
 * Estrategia de búsqueda (en orden de prioridad):
 * 1. Unsplash - Alta calidad, gratis, sin atribución (50 req/hora demo)
 * 2. Pexels - Curado por Canva, gratis (200 req/hora)
 * 3. Pixabay - 4.3M+ imágenes, gratis (100 req/minuto)
 * 4. Pollinations.ai - Generación IA gratuita, sin API key (modelo FLUX)
 * 5. Gemini AI - Fallback de generación con API key
 * 6. Unsplash Source - Fallback garantizado
 */

import { generateCustomImage } from "./geminiImageGeneration";

export interface ImageResult {
  url: string;
  thumbnailUrl: string;
  alt: string;
  photographer?: string;
  source: "unsplash" | "pexels" | "pixabay" | "pollinations" | "gemini" | "fallback";
  width: number;
  height: number;
}

// ============================================
// API KEYS
// ============================================
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || "";
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || "";
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || "";

// ============================================
// 1. UNSPLASH API (50 req/hora demo, 5000/hora producción)
// ============================================
/**
 * Busca imágenes en Unsplash - Alta calidad, comunidad activa
 * @param query - Término de búsqueda
 * @param options - Opciones de búsqueda
 * @returns Array de resultados de imágenes
 */
export async function searchUnsplash(
  query: string,
  options: { count?: number; orientation?: "landscape" | "portrait" | "squarish" } = {}
): Promise<ImageResult[]> {
  const { count = 5, orientation = "landscape" } = options;
  
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn("[ImageSearch] Unsplash API key not configured");
    return [];
  }
  
  try {
    const params = new URLSearchParams({
      query,
      per_page: count.toString(),
      orientation,
    });
    
    const response = await fetch(
      `https://api.unsplash.com/search/photos?${params.toString()}`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );
    
    if (!response.ok) {
      console.error("[ImageSearch] Unsplash error:", response.status);
      return [];
    }
    
    const data = (await response.json()) as {
      results: Array<{
        urls: { regular: string; small: string };
        alt_description: string;
        user: { name: string };
        width: number;
        height: number;
      }>;
    };
    
    console.log(`[ImageSearch] Unsplash found ${data.results.length} images for "${query}"`);
    
    return data.results.map((img) => ({
      url: img.urls.regular,
      thumbnailUrl: img.urls.small,
      alt: img.alt_description || query,
      photographer: img.user.name,
      source: "unsplash" as const,
      width: img.width,
      height: img.height,
    }));
  } catch (error) {
    console.error("[ImageSearch] Unsplash failed:", error);
    return [];
  }
}

// ============================================
// 2. PEXELS API (200 req/hora, 20,000/mes)
// ============================================
/**
 * Busca imágenes en Pexels - Curado manualmente, parte de Canva
 * @param query - Término de búsqueda
 * @param options - Opciones de búsqueda
 * @returns Array de resultados de imágenes
 */
export async function searchPexels(
  query: string,
  options: { count?: number; orientation?: "landscape" | "portrait" | "square" } = {}
): Promise<ImageResult[]> {
  const { count = 5, orientation = "landscape" } = options;
  
  if (!PEXELS_API_KEY) {
    console.warn("[ImageSearch] Pexels API key not configured");
    return [];
  }
  
  try {
    const params = new URLSearchParams({
      query,
      per_page: count.toString(),
      orientation,
    });
    
    const response = await fetch(
      `https://api.pexels.com/v1/search?${params.toString()}`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );
    
    if (!response.ok) {
      console.error("[ImageSearch] Pexels error:", response.status);
      return [];
    }
    
    const data = (await response.json()) as {
      photos: Array<{
        src: { large: string; medium: string };
        alt: string;
        photographer: string;
        width: number;
        height: number;
      }>;
    };
    
    console.log(`[ImageSearch] Pexels found ${data.photos.length} images for "${query}"`);
    
    return data.photos.map((img) => ({
      url: img.src.large,
      thumbnailUrl: img.src.medium,
      alt: img.alt || query,
      photographer: img.photographer,
      source: "pexels" as const,
      width: img.width,
      height: img.height,
    }));
  } catch (error) {
    console.error("[ImageSearch] Pexels failed:", error);
    return [];
  }
}

// ============================================
// 3. PIXABAY API (100 req/minuto)
// ============================================
/**
 * Busca imágenes en Pixabay - 4.3M+ imágenes, videos y vectores
 * Nota: Requiere mención de Pixabay, no permite hotlinking
 * @param query - Término de búsqueda
 * @param options - Opciones de búsqueda
 * @returns Array de resultados de imágenes
 */
export async function searchPixabay(
  query: string,
  options: { count?: number; orientation?: "horizontal" | "vertical" | "all" } = {}
): Promise<ImageResult[]> {
  const { count = 5, orientation = "horizontal" } = options;
  // Pixabay requiere per_page entre 3 y 200
  const perPage = Math.max(3, Math.min(200, count));
  
  if (!PIXABAY_API_KEY) {
    console.warn("[ImageSearch] Pixabay API key not configured");
    return [];
  }
  
  try {
    const params = new URLSearchParams({
      key: PIXABAY_API_KEY,
      q: query,
      per_page: perPage.toString(),
      orientation,
      image_type: "photo",
      safesearch: "true",
    });
    
    const url = `https://pixabay.com/api/?${params.toString()}`;
    console.log("[ImageSearch] Pixabay request URL:", url.substring(0, 100) + "...");
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ImageSearch] Pixabay error:", response.status, errorText);
      return [];
    }
    
    const data = (await response.json()) as {
      hits: Array<{
        largeImageURL: string;
        previewURL: string;
        tags: string;
        user: string;
        imageWidth: number;
        imageHeight: number;
      }>;
    };
    
    console.log(`[ImageSearch] Pixabay found ${data.hits.length} images for "${query}"`);
    
    return data.hits.map((img) => ({
      url: img.largeImageURL,
      thumbnailUrl: img.previewURL,
      alt: img.tags || query,
      photographer: img.user,
      source: "pixabay" as const,
      width: img.imageWidth,
      height: img.imageHeight,
    }));
  } catch (error) {
    console.error("[ImageSearch] Pixabay failed:", error);
    return [];
  }
}

// ============================================
// 4. POLLINATIONS.AI (Generación IA gratuita, sin API key)
// ============================================
/**
 * Genera una imagen con Pollinations.ai - API gratuita sin necesidad de key
 * Usa modelos como FLUX para generar imágenes de alta calidad
 * @param prompt - Descripción de la imagen a generar
 * @param options - Opciones de generación
 * @returns Resultado de la imagen o null si falla
 */
export async function generatePollinationsImage(
  prompt: string,
  options: { width?: number; height?: number; model?: string } = {}
): Promise<ImageResult | null> {
  const { width = 1024, height = 1024, model = "flux" } = options;
  
  try {
    console.log("[ImageSearch] Generating image with Pollinations.ai:", prompt.substring(0, 50) + "...");
    
    // Pollinations.ai genera imágenes directamente desde la URL
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&nologo=true`;
    
    // Verificar que la imagen se genera correctamente (hacer HEAD request)
    const response = await fetch(imageUrl, { method: "HEAD" });
    
    if (!response.ok) {
      console.error("[ImageSearch] Pollinations.ai error:", response.status);
      return null;
    }
    
    console.log("[ImageSearch] Pollinations.ai generated image successfully");
    
    return {
      url: imageUrl,
      thumbnailUrl: imageUrl,
      alt: prompt,
      source: "pollinations" as const,
      width,
      height,
    };
  } catch (error) {
    console.error("[ImageSearch] Pollinations.ai generation failed:", error);
    return null;
  }
}

// ============================================
// 5. GEMINI AI (Fallback de generación)
/**
 * Genera una imagen con Gemini AI - Solo cuando no hay resultados en bancos
 * @param prompt - Descripción de la imagen a generar
 * @param category - Categoría para organizar la imagen
 * @returns Resultado de la imagen o null si falla
 */
export async function generateAIImage(prompt: string, category: string = 'custom'): Promise<ImageResult | null> {
  try {
    console.log("[ImageSearch] Generating AI image with Gemini for:", prompt.substring(0, 50) + "...");
    const imageUrl = await generateCustomImage(prompt, category);
    
    if (!imageUrl) {
      console.error("[ImageSearch] Gemini returned no image");
      return null;
    }
    
    console.log("[ImageSearch] Gemini generated image successfully");
    
    return {
      url: imageUrl,
      thumbnailUrl: imageUrl,
      alt: prompt,
      source: "gemini" as const,
      width: 1024,
      height: 1024,
    };
  } catch (error) {
    console.error("[ImageSearch] Gemini AI generation failed:", error);
    return null;
  }
}

// ============================================
// 5. FALLBACK - Unsplash Source (siempre funciona)
// ============================================
/**
 * Genera URL de fallback usando Unsplash Source
 * @param query - Términos de búsqueda
 * @param width - Ancho de la imagen
 * @param height - Alto de la imagen
 * @returns URL de imagen de fallback
 */
export function getFallbackImageUrl(query: string, width: number = 1600, height: number = 900): string {
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(query)}`;
}

// ============================================
// FUNCIÓN PRINCIPAL DE BÚSQUEDA HÍBRIDA
// ============================================
/**
 * Búsqueda unificada - Intenta múltiples fuentes en orden de prioridad
 * Orden: Unsplash → Pexels → Pixabay → Gemini AI → Fallback
 * 
 * @param query - Término de búsqueda
 * @param options - Opciones de búsqueda
 * @returns Array de resultados de imágenes
 */
export async function searchImages(
  query: string,
  options: {
    count?: number;
    forceAI?: boolean;
    orientation?: "landscape" | "portrait" | "square";
  } = {}
): Promise<ImageResult[]> {
  const { count = 5, forceAI = false, orientation = "landscape" } = options;
  
  // Si se fuerza AI, generar directamente con Pollinations (gratis) o Gemini
  if (forceAI && count === 1) {
    console.log("[ImageSearch] Force AI mode - generating with Pollinations.ai");
    const pollinationsImage = await generatePollinationsImage(query);
    if (pollinationsImage) return [pollinationsImage];
    
    // Fallback a Gemini si Pollinations falla
    console.log("[ImageSearch] Pollinations failed, trying Gemini");
    const aiImage = await generateAIImage(query, 'forced');
    if (aiImage) return [aiImage];
  }
  
  let results: ImageResult[] = [];
  
  // 1. Intentar Unsplash primero (mejor calidad)
  const unsplashOrientation = orientation === "square" ? "squarish" : orientation;
  results = await searchUnsplash(query, { count, orientation: unsplashOrientation });
  
  // 2. Si no hay suficientes, intentar Pexels
  if (results.length < count) {
    const pexelsResults = await searchPexels(query, { 
      count: count - results.length,
      orientation: orientation
    });
    results = [...results, ...pexelsResults];
  }
  
  // 3. Si aún faltan, intentar Pixabay
  if (results.length < count) {
    const pixabayOrientation = orientation === "landscape" ? "horizontal" : 
                               orientation === "portrait" ? "vertical" : "all";
    const pixabayResults = await searchPixabay(query, { 
      count: count - results.length,
      orientation: pixabayOrientation
    });
    results = [...results, ...pixabayResults];
  }
  
  // 4. Si no hay resultados, intentar Pollinations.ai (gratis)
  if (results.length === 0) {
    console.log("[ImageSearch] No stock images found, trying Pollinations.ai");
    const pollinationsImage = await generatePollinationsImage(query);
    if (pollinationsImage) results.push(pollinationsImage);
  }
  
  // 5. Si Pollinations falla, intentar Gemini AI
  if (results.length === 0) {
    console.log("[ImageSearch] Pollinations failed, falling back to Gemini AI");
    const aiImage = await generateAIImage(query, 'fallback');
    if (aiImage) results.push(aiImage);
  }
  
  // 6. Si todo falla, usar fallback de Unsplash Source
  if (results.length === 0) {
    console.log("[ImageSearch] All sources failed, using Unsplash Source fallback");
    results.push({
      url: getFallbackImageUrl(query),
      thumbnailUrl: getFallbackImageUrl(query, 400, 300),
      alt: query,
      source: "fallback" as const,
      width: 1600,
      height: 900,
    });
  }
  
  return results.slice(0, count);
}

// ============================================
// FUNCIONES ESPECIALIZADAS
// ============================================

/**
 * Obtiene una imagen relevante para una sección específica de landing
 * Usa búsqueda híbrida: bancos primero, Gemini como fallback
 * 
 * @param sectionType - Tipo de sección (hero, features, testimonials, etc.)
 * @param context - Contexto adicional para la búsqueda
 * @param businessType - Tipo de negocio
 * @returns URL de la imagen
 */
export async function getImageForSection(
  sectionType: string,
  context: string,
  businessType?: string
): Promise<string> {
  // Construir query de búsqueda según el tipo de sección
  const searchQueries: Record<string, string> = {
    hero: `${businessType || "business"} ${context} professional modern`,
    features: `${businessType || "technology"} ${context} innovation`,
    testimonials: "professional person portrait business headshot",
    cta: `${businessType || "success"} achievement motivation`,
    about: `${businessType || "team"} office professional collaboration`,
    gallery: `${businessType || "photography"} ${context} professional`,
    team: "professional headshot portrait friendly",
    destinations: `${context} travel destination beautiful landscape`,
  };
  
  const query = searchQueries[sectionType] || `${businessType || "business"} ${context}`;
  
  try {
    // Buscar en bancos de imágenes primero
    const images = await searchImages(query, { count: 1, orientation: "landscape" });
    
    if (images.length > 0) {
      return images[0].url;
    }
  } catch (error) {
    console.error("[ImageSearch] Failed to get image for section:", error);
  }
  
  // Fallback garantizado
  const fallbackQueries: Record<string, string> = {
    hero: "business,technology,modern",
    features: "technology,innovation",
    testimonials: "people,professional",
    cta: "success,achievement",
    about: "team,office",
    gallery: "photography,professional",
    team: "portrait,professional",
    destinations: "travel,landscape",
  };
  const fallbackQuery = fallbackQueries[sectionType] || "business,professional";
  return getFallbackImageUrl(fallbackQuery);
}

/**
 * Obtiene múltiples imágenes para una galería
 * Prioriza bancos de stock, usa Gemini solo si es necesario
 * 
 * @param context - Contexto de la galería
 * @param count - Número de imágenes a obtener
 * @param businessType - Tipo de negocio
 * @returns Array de URLs de imágenes
 */
export async function getImagesForGallery(
  context: string,
  count: number = 6,
  businessType?: string
): Promise<string[]> {
  const query = `${businessType || "business"} ${context} professional`;
  
  try {
    // Buscar en bancos de imágenes
    const images = await searchImages(query, { count, orientation: "landscape" });
    
    if (images.length >= count) {
      return images.slice(0, count).map(img => img.url);
    }
    
    // Si faltan imágenes, completar con variaciones
    const urls = images.map(img => img.url);
    const remaining = count - urls.length;
    
    for (let i = 0; i < remaining; i++) {
      urls.push(getFallbackImageUrl(`${context} ${i + 1}`, 800, 600));
    }
    
    return urls;
  } catch (error) {
    console.error("[ImageSearch] Failed to get gallery images:", error);
    // Retornar imágenes de fallback
    return Array(count)
      .fill(null)
      .map((_, i) => getFallbackImageUrl(`${context} ${i}`, 800, 600));
  }
}

/**
 * Genera una imagen personalizada para el chat
 * Esta función se usa cuando el usuario explícitamente pide "generar imagen"
 * Prioriza Pollinations.ai (gratis) y usa Gemini como fallback
 * 
 * @param prompt - Descripción detallada de la imagen
 * @returns URL de la imagen generada o null
 */
export async function generateChatImage(prompt: string): Promise<string | null> {
  try {
    // 1. Intentar con Pollinations.ai primero (gratis, sin API key)
    console.log("[ImageSearch] Generating chat image with Pollinations.ai:", prompt.substring(0, 50) + "...");
    const pollinationsResult = await generatePollinationsImage(prompt, { width: 1024, height: 1024 });
    if (pollinationsResult) {
      return pollinationsResult.url;
    }
    
    // 2. Fallback a Gemini si Pollinations falla
    console.log("[ImageSearch] Pollinations failed, trying Gemini:", prompt.substring(0, 50) + "...");
    const imageUrl = await generateCustomImage(prompt, 'chat');
    return imageUrl;
  } catch (error) {
    console.error("[ImageSearch] Chat image generation failed:", error);
    return null;
  }
}

/**
 * Obtiene un avatar para testimonios o miembros del equipo
 * Usa Pravatar como fuente principal (siempre disponible)
 * 
 * @param seed - Semilla para generar avatar consistente
 * @param size - Tamaño del avatar en píxeles
 * @returns URL del avatar
 */
export function getAvatarUrl(seed: string | number, size: number = 150): string {
  return `https://i.pravatar.cc/${size}?u=${encodeURIComponent(String(seed))}`;
}

/**
 * Resumen del estado de las APIs configuradas
 */
export function getApiStatus(): Record<string, boolean> {
  return {
    unsplash: !!UNSPLASH_ACCESS_KEY,
    pexels: !!PEXELS_API_KEY,
    pixabay: !!PIXABAY_API_KEY,
    pollinations: true, // Siempre disponible, no requiere API key
    gemini: !!process.env.GEMINI_API_KEY,
  };
}
