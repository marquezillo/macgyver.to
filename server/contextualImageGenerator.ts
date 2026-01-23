/**
 * Generador de Imágenes Contextuales para Landing Pages
 * Genera imágenes automáticamente basadas en el contenido de cada sección
 */

import { generateImageWithGemini } from './geminiImageGeneration';
import { searchImages } from './imageSearch';

interface Section {
  id: string;
  type: string;
  content: Record<string, unknown>;
  styles?: Record<string, unknown>;
}

interface LandingData {
  type: string;
  businessType?: string;
  businessName?: string;
  sections: Section[];
  globalStyles?: Record<string, unknown>;
}

interface ImageGenerationResult {
  sectionId: string;
  field: string;
  imageUrl: string;
  source: 'ai' | 'stock';
}

// Mapeo de tipos de negocio a palabras clave de imagen
const BUSINESS_IMAGE_KEYWORDS: Record<string, string[]> = {
  tech: ['technology', 'software', 'digital', 'innovation', 'startup'],
  saas: ['dashboard', 'software', 'cloud', 'platform', 'analytics'],
  agency: ['creative', 'design', 'team', 'office', 'collaboration'],
  restaurant: ['food', 'restaurant', 'cuisine', 'dining', 'chef'],
  travel: ['travel', 'destination', 'adventure', 'vacation', 'tourism'],
  health: ['healthcare', 'medical', 'wellness', 'doctor', 'clinic'],
  fitness: ['fitness', 'gym', 'workout', 'exercise', 'training'],
  ecommerce: ['shopping', 'products', 'store', 'retail', 'fashion'],
  education: ['education', 'learning', 'school', 'students', 'classroom'],
  finance: ['finance', 'banking', 'investment', 'money', 'business'],
};

/**
 * Genera un prompt de imagen basado en el contenido de la sección
 */
function generateImagePrompt(
  section: Section,
  businessType: string,
  businessName: string
): string {
  const content = section.content;
  const sectionType = section.type;
  
  // Obtener palabras clave del negocio
  const keywords = BUSINESS_IMAGE_KEYWORDS[businessType.toLowerCase()] || ['professional', 'business'];
  const keywordStr = keywords.slice(0, 3).join(', ');
  
  switch (sectionType) {
    case 'hero':
      const heroTitle = content.title as string || '';
      const heroSubtitle = content.subtitle as string || '';
      return `Professional hero banner for ${businessName}. ${heroTitle}. ${heroSubtitle}. 
              Style: Modern, high-quality, ${keywordStr}. 
              Aspect ratio: 16:9, suitable for website header.`;
    
    case 'features':
      return `Modern illustration or photo representing ${keywordStr} features. 
              Clean, professional, suitable for a ${businessType} website.
              Style: Minimalist, modern design.`;
    
    case 'about':
      const aboutTitle = content.title as string || '';
      return `Professional image for about section of ${businessName}. ${aboutTitle}.
              Style: Authentic, trustworthy, ${keywordStr}.`;
    
    case 'testimonials':
      return `Professional headshot of a satisfied customer or business professional.
              Style: Friendly, approachable, trustworthy appearance.`;
    
    case 'gallery':
      return `High-quality gallery image showcasing ${businessType} products or services.
              Style: Professional photography, ${keywordStr}.`;
    
    case 'stats':
      return `Abstract visualization or infographic style image representing growth and success.
              Style: Modern, data-driven, ${keywordStr}.`;
    
    case 'pricing':
      return `Professional image representing value and pricing options.
              Style: Clean, modern, business-oriented.`;
    
    default:
      return `Professional image for ${sectionType} section of a ${businessType} website.
              Style: Modern, clean, ${keywordStr}.`;
  }
}

/**
 * Intenta obtener una imagen de stock primero, luego genera con IA si no encuentra
 */
async function getImageForSection(
  section: Section,
  businessType: string,
  businessName: string,
  useAI: boolean = true
): Promise<{ url: string; source: 'ai' | 'stock' } | null> {
  const keywords = BUSINESS_IMAGE_KEYWORDS[businessType.toLowerCase()] || ['professional'];
  const sectionType = section.type;
  
  // Construir query de búsqueda
  const searchQuery = `${businessType} ${sectionType} ${keywords[0]}`;
  
  try {
    // Primero intentar con imágenes de stock
    const stockResults = await searchImages(searchQuery, { count: 5, orientation: 'landscape' });
    
    if (stockResults && stockResults.length > 0) {
      // Seleccionar una imagen aleatoria de los primeros 5 resultados
      const randomIndex = Math.floor(Math.random() * Math.min(5, stockResults.length));
      return {
        url: stockResults[randomIndex].url,
        source: 'stock'
      };
    }
    
    // Si no hay resultados de stock y useAI está habilitado, generar con IA
    if (useAI) {
      const prompt = generateImagePrompt(section, businessType, businessName);
      const aiResult = await generateImageWithGemini({
        prompt,
        aspectRatio: sectionType === 'hero' ? '16:9' : '1:1',
        category: sectionType
      });
      
      if (aiResult) {
        return {
          url: aiResult.url,
          source: 'ai'
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error(`[ContextualImageGenerator] Error getting image for ${sectionType}:`, error);
    return null;
  }
}

/**
 * Genera imágenes contextuales para todas las secciones de una landing
 */
export async function generateContextualImages(
  landingData: LandingData,
  options: { useAI?: boolean; maxImages?: number } = {}
): Promise<{ data: LandingData; generatedImages: ImageGenerationResult[] }> {
  const { useAI = true, maxImages = 5 } = options;
  const generatedImages: ImageGenerationResult[] = [];
  
  const businessType = landingData.businessType || 'business';
  const businessName = landingData.businessName || 'Company';
  
  // Crear copia para no mutar el original
  const fixedData = JSON.parse(JSON.stringify(landingData)) as LandingData;
  
  // Secciones que necesitan imágenes
  const sectionsNeedingImages = ['hero', 'about', 'gallery', 'features'];
  let imagesGenerated = 0;
  
  for (const section of fixedData.sections) {
    if (imagesGenerated >= maxImages) break;
    
    // Solo procesar secciones que típicamente necesitan imágenes
    if (!sectionsNeedingImages.includes(section.type)) continue;
    
    // Verificar si ya tiene imagen
    const content = section.content;
    const hasImage = content.backgroundImage || content.image || content.imageUrl;
    
    // Si tiene imagePrompt pero no imagen, generar
    const imagePrompt = content.imagePrompt as string | undefined;
    
    if (!hasImage && (imagePrompt || section.type === 'hero')) {
      const result = await getImageForSection(section, businessType, businessName, useAI);
      
      if (result) {
        // Asignar la imagen al campo apropiado
        if (section.type === 'hero') {
          section.content.backgroundImage = result.url;
        } else {
          section.content.image = result.url;
        }
        
        generatedImages.push({
          sectionId: section.id,
          field: section.type === 'hero' ? 'backgroundImage' : 'image',
          imageUrl: result.url,
          source: result.source
        });
        
        imagesGenerated++;
        console.log(`[ContextualImageGenerator] Generated ${result.source} image for ${section.type}`);
      }
    }
  }
  
  return { data: fixedData, generatedImages };
}

/**
 * Genera una imagen específica para una sección individual
 */
export async function generateSectionImage(
  sectionType: string,
  businessType: string,
  businessName: string,
  customPrompt?: string
): Promise<string | null> {
  const section: Section = {
    id: `${sectionType}-temp`,
    type: sectionType,
    content: {}
  };
  
  if (customPrompt) {
    const result = await generateImageWithGemini({
      prompt: customPrompt,
      aspectRatio: sectionType === 'hero' ? '16:9' : '1:1',
      category: sectionType
    });
    return result?.url || null;
  }
  
  const result = await getImageForSection(section, businessType, businessName, true);
  return result?.url || null;
}
