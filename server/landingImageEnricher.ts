/**
 * Landing Image Enricher
 * 
 * Este módulo enriquece las secciones de una landing page con imágenes automáticas.
 * Usa el sistema híbrido de imágenes: bancos de stock primero, IA como fallback.
 * 
 * IMPORTANTE: Las búsquedas de imágenes deben ser CONTEXTUALES al negocio específico.
 * Por ejemplo, para una agencia de viajes a Tailandia, buscar "Thailand temples beaches"
 * NO "travel agency business professional".
 */

import { searchImages, ImageResult } from './imageSearch';

// Tipos para las secciones de landing
interface LandingSection {
  id: string;
  type: string;
  content: Record<string, unknown>;
}

interface EnrichedSection extends LandingSection {
  content: Record<string, unknown> & {
    imageUrl?: string;
    backgroundImage?: string;
    images?: string[];
  };
}

interface EnrichmentContext {
  businessType: string;
  businessName: string;
  targetAudience?: string;
  uniqueValue?: string;
}

/**
 * Mapeo de tipos de negocio a términos de búsqueda específicos
 * Esto asegura que las imágenes sean relevantes al contexto
 */
const BUSINESS_IMAGE_KEYWORDS: Record<string, string[]> = {
  // Viajes y turismo
  'travel_agency_thailand': ['Thailand temples', 'Bangkok Wat Arun', 'Thai beach paradise', 'Phuket islands', 'Thai food market'],
  'thailand_travel': ['Thailand golden temples', 'Thai beaches turquoise', 'Bangkok skyline', 'Thai street food', 'Phi Phi islands'],
  'thailand': ['Thailand temples sunset', 'Thai beach paradise', 'Bangkok Grand Palace', 'Thai culture', 'Krabi limestone cliffs'],
  'travel_agency': ['travel destination beautiful', 'vacation paradise', 'tourist landmark', 'travel adventure'],
  'tourism': ['tourist destination scenic', 'travel landscape beautiful', 'vacation resort'],
  
  // Restaurantes
  'restaurant_italian': ['Italian restaurant interior', 'pizza pasta authentic', 'Italian cuisine elegant', 'trattoria ambiance'],
  'restaurant_japanese': ['Japanese restaurant zen', 'sushi chef preparation', 'ramen authentic', 'Japanese cuisine elegant'],
  'restaurant_mexican': ['Mexican restaurant colorful', 'tacos authentic', 'Mexican cuisine vibrant', 'cantina atmosphere'],
  'restaurant': ['restaurant interior elegant', 'fine dining ambiance', 'chef cooking', 'gourmet food plating'],
  
  // Fitness y salud
  'gym': ['modern gym equipment', 'fitness training workout', 'gym interior professional', 'personal training'],
  'fitness': ['fitness workout motivation', 'gym training professional', 'healthy lifestyle active'],
  'spa': ['spa relaxation luxury', 'wellness massage', 'spa interior zen', 'aromatherapy treatment'],
  'yoga': ['yoga studio peaceful', 'meditation practice', 'yoga class serene'],
  
  // Tecnología
  'saas': ['technology modern office', 'software dashboard', 'tech startup workspace', 'digital innovation'],
  'tech': ['technology innovation', 'modern tech office', 'digital transformation', 'startup workspace'],
  'software': ['software development', 'coding programming', 'tech team collaboration'],
  'agency': ['creative agency office', 'marketing team', 'digital agency workspace'],
  
  // Inmobiliaria
  'real_estate': ['luxury home interior', 'modern architecture', 'real estate property', 'house beautiful'],
  'property': ['property investment', 'luxury apartment', 'home interior design'],
  
  // Educación
  'education': ['education learning', 'classroom modern', 'students studying', 'online learning'],
  'school': ['school education', 'students classroom', 'learning environment'],
  'course': ['online course learning', 'education training', 'workshop seminar'],
  
  // E-commerce
  'ecommerce': ['online shopping', 'ecommerce store', 'product showcase', 'retail modern'],
  'shop': ['retail store modern', 'shopping experience', 'product display'],
  
  // Servicios profesionales
  'consulting': ['business consulting', 'professional meeting', 'corporate office', 'strategy planning'],
  'legal': ['law office professional', 'legal services', 'attorney consultation'],
  'accounting': ['accounting finance', 'financial services', 'business professional'],
  
  // Default
  'default': ['professional business', 'modern office', 'corporate team', 'business success'],
};

/**
 * Extrae palabras clave relevantes del contenido de la sección
 */
function extractKeywordsFromContent(content: Record<string, unknown>): string[] {
  const keywords: string[] = [];
  
  // Extraer del título
  if (content.title && typeof content.title === 'string') {
    // Extraer palabras significativas del título
    const titleWords = content.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !['para', 'with', 'your', 'the', 'and', 'los', 'las', 'del', 'que', 'con'].includes(word));
    keywords.push(...titleWords.slice(0, 3));
  }
  
  // Extraer de la descripción de imagen si existe
  if (content.backgroundImage && typeof content.backgroundImage === 'string' && !content.backgroundImage.startsWith('http')) {
    keywords.push(content.backgroundImage);
  }
  
  if (content.imageUrl && typeof content.imageUrl === 'string' && !content.imageUrl.startsWith('http')) {
    keywords.push(content.imageUrl);
  }
  
  return keywords;
}

/**
 * Genera un query de búsqueda contextual basado en el tipo de negocio y contenido
 */
function generateContextualSearchQuery(
  sectionType: string, 
  context: EnrichmentContext, 
  content: Record<string, unknown>
): string {
  const { businessType, businessName } = context;
  
  // Normalizar el tipo de negocio
  const normalizedType = businessType.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  
  // Buscar keywords específicas para este tipo de negocio
  let baseKeywords: string[] = [];
  
  // Buscar coincidencia exacta primero
  if (BUSINESS_IMAGE_KEYWORDS[normalizedType]) {
    baseKeywords = BUSINESS_IMAGE_KEYWORDS[normalizedType];
  } else {
    // Buscar coincidencia parcial
    for (const [key, keywords] of Object.entries(BUSINESS_IMAGE_KEYWORDS)) {
      if (normalizedType.includes(key) || key.includes(normalizedType)) {
        baseKeywords = keywords;
        break;
      }
    }
  }
  
  // Si no hay coincidencia, usar default
  if (baseKeywords.length === 0) {
    baseKeywords = BUSINESS_IMAGE_KEYWORDS['default'];
  }
  
  // Extraer keywords del contenido
  const contentKeywords = extractKeywordsFromContent(content);
  
  // Construir query según el tipo de sección
  let query: string;
  
  switch (sectionType) {
    case 'hero':
      // Para hero, usar la descripción de imagen si existe, sino keywords del negocio
      if (contentKeywords.length > 0 && contentKeywords[0].length > 10) {
        // Usar la descripción de imagen del LLM
        query = contentKeywords[0];
      } else {
        // Usar keywords del tipo de negocio
        query = baseKeywords[0] || `${businessType} professional`;
      }
      break;
      
    case 'about':
      query = baseKeywords[1] || `${businessType} team professional`;
      break;
      
    case 'features':
    case 'services':
      query = baseKeywords[2] || `${businessType} service`;
      break;
      
    case 'gallery':
      query = baseKeywords[3] || `${businessType} showcase`;
      break;
      
    case 'cta':
      query = baseKeywords[4] || `${businessType} success`;
      break;
      
    default:
      query = baseKeywords[0] || `${businessType} professional`;
  }
  
  console.log(`[LandingEnricher] Generated search query for ${sectionType}: "${query}"`);
  return query;
}

/**
 * Genera un prompt para crear avatares con IA
 */
function generateAvatarPrompt(name: string, role?: string): string {
  const femaleNames = ['maría', 'maria', 'ana', 'laura', 'carmen', 'lucia', 'lucía', 'sofia', 'sofía', 'elena', 'paula', 'marta', 'sara', 'andrea', 'claudia', 'patricia', 'rosa', 'julia', 'isabel', 'cristina', 'jennifer', 'jessica', 'ashley', 'emily', 'emma', 'olivia', 'ava', 'sophia', 'isabella', 'mia', 'charlotte', 'amelia', 'harper', 'evelyn'];
  const nameLower = name.toLowerCase().split(' ')[0];
  const isFemale = femaleNames.some(fn => nameLower.includes(fn));
  
  const gender = isFemale ? 'woman' : 'man';
  const roleDesc = role ? `, ${role}` : '';
  
  return `Professional headshot portrait of a ${gender}${roleDesc}, friendly smile, business attire, neutral background, high quality, photorealistic`;
}

/**
 * Enriquece una sección de testimonios con avatares
 * IMPORTANTE: Usa avatarService para obtener fotos REALES de Unsplash
 * NUNCA usa ui-avatars.com ni servicios similares
 */
async function enrichTestimonialsSection(
  section: LandingSection,
  context: EnrichmentContext
): Promise<EnrichedSection> {
  const content = section.content as Record<string, unknown>;
  const testimonials = content.testimonials as Array<{
    name: string;
    role?: string;
    company?: string;
    quote: string;
    avatar?: string;
  }> | undefined;
  
  // También verificar items (algunos templates usan items en lugar de testimonials)
  const items = content.items as Array<{
    author?: string;
    name?: string;
    role?: string;
    company?: string;
    quote?: string;
    text?: string;
    avatar?: string;
    image?: string;
  }> | undefined;
  
  const testimonialsArray = testimonials || items;
  
  if (!testimonialsArray || !Array.isArray(testimonialsArray)) {
    return section as EnrichedSection;
  }
  
  console.log(`[LandingEnricher] Enriching ${testimonialsArray.length} testimonials with REAL avatars from Unsplash`);
  
  // Importar el servicio de avatares que tiene 70+ fotos reales
  const { generateAvatarsForTestimonials } = await import('./avatarService');
  
  // Preparar los testimonios para el servicio de avatares
  const testimonialsForAvatars = testimonialsArray.map((testimonial, index) => {
    const t = testimonial as Record<string, unknown>;
    return {
      name: (t.name as string) || (t.author as string) || `Person ${index + 1}`,
      image: t.image as string | undefined,
      avatar: t.avatar as string | undefined,
    };
  });
  
  // Generar avatares reales usando el servicio
  const enrichedAvatars = generateAvatarsForTestimonials(testimonialsForAvatars);
  
  // Combinar los avatares con los datos originales de los testimonios
  const enrichedTestimonials = testimonialsArray.map((testimonial, index) => {
    const avatarData = enrichedAvatars[index];
    return {
      ...testimonial,
      avatar: avatarData.avatar,
      image: avatarData.image,
    };
  });
  
  console.log(`[LandingEnricher] ✓ Assigned ${enrichedTestimonials.length} real Unsplash avatars`);
  
  // Devolver con ambas claves para compatibilidad
  return {
    ...section,
    content: {
      ...content,
      testimonials: enrichedTestimonials,
      items: enrichedTestimonials,
    },
  };
}

/**
 * Enriquece una sección de equipo con fotos profesionales
 * IMPORTANTE: Usa avatarService para obtener fotos REALES de Unsplash
 */
async function enrichTeamSection(
  section: LandingSection,
  context: EnrichmentContext
): Promise<EnrichedSection> {
  const content = section.content as Record<string, unknown>;
  const members = content.members as Array<{
    name: string;
    role?: string;
    position?: string;
    bio?: string;
    image?: string;
  }> | undefined;
  
  if (!members || !Array.isArray(members)) {
    return section as EnrichedSection;
  }
  
  console.log(`[LandingEnricher] Enriching ${members.length} team members with REAL photos from Unsplash`);
  
  // Importar el servicio de avatares que tiene 70+ fotos reales
  const { generateAvatarsForTestimonials } = await import('./avatarService');
  
  // Preparar los miembros para el servicio de avatares
  const membersForAvatars = members.map((member) => ({
    name: member.name,
    image: member.image,
    avatar: member.image,
  }));
  
  // Generar avatares reales usando el servicio
  const enrichedAvatars = generateAvatarsForTestimonials(membersForAvatars);
  
  // Combinar los avatares con los datos originales de los miembros
  const enrichedMembers = members.map((member, index) => {
    const avatarData = enrichedAvatars[index];
    return {
      ...member,
      image: avatarData.image,
    };
  });
  
  console.log(`[LandingEnricher] ✓ Assigned ${enrichedMembers.length} real Unsplash photos to team members`);
  
  return {
    ...section,
    content: {
      ...content,
      members: enrichedMembers,
    },
  };
}

/**
 * Enriquece una sección de galería con imágenes
 */
async function enrichGallerySection(
  section: LandingSection,
  context: EnrichmentContext
): Promise<EnrichedSection> {
  const content = section.content as Record<string, unknown>;
  let images = content.images as (string | { url: string })[] | undefined;
  
  if (images && Array.isArray(images) && images.length > 0) {
    const firstImage = images[0];
    const firstUrl = typeof firstImage === 'string' ? firstImage : firstImage?.url;
    if (firstUrl && typeof firstUrl === 'string' && firstUrl.startsWith('http')) {
      const normalizedImages = images.map(img => 
        typeof img === 'string' ? img : img?.url
      ).filter((url): url is string => typeof url === 'string');
      return {
        ...section,
        content: {
          ...content,
          images: normalizedImages,
        },
      };
    }
  }
  
  console.log(`[LandingEnricher] Searching gallery images for ${context.businessType}`);
  
  try {
    const query = generateContextualSearchQuery('gallery', context, content);
    const results = await searchImages(query, { count: 6 });
    
    let finalImages: string[];
    if (results.length > 0) {
      finalImages = results.map(r => r.url);
    } else {
      // Fallback con query contextual
      const fallbackQuery = encodeURIComponent(query.split(' ').slice(0, 2).join(','));
      finalImages = [
        `https://source.unsplash.com/800x600/?${fallbackQuery},1`,
        `https://source.unsplash.com/800x600/?${fallbackQuery},2`,
        `https://source.unsplash.com/800x600/?${fallbackQuery},3`,
        `https://source.unsplash.com/800x600/?${fallbackQuery},4`,
      ];
    }
    
    return {
      ...section,
      content: {
        ...content,
        images: finalImages,
      },
    };
  } catch (error) {
    console.error('[LandingEnricher] Error searching gallery images:', error);
    return section as EnrichedSection;
  }
}

/**
 * Enriquece una sección Hero con imagen de fondo
 */
async function enrichHeroSection(
  section: LandingSection,
  context: EnrichmentContext
): Promise<EnrichedSection> {
  const content = section.content as Record<string, unknown>;
  
  // Si ya tiene imagen válida, no buscar
  if (content.backgroundImage && typeof content.backgroundImage === 'string' && content.backgroundImage.startsWith('http')) {
    return section as EnrichedSection;
  }
  if (content.imageUrl && typeof content.imageUrl === 'string' && content.imageUrl.startsWith('http')) {
    return section as EnrichedSection;
  }
  
  console.log(`[LandingEnricher] Searching hero image for ${context.businessType}`);
  
  try {
    // Generar query contextual
    const query = generateContextualSearchQuery('hero', context, content);
    console.log(`[LandingEnricher] Hero search query: "${query}"`);
    
    const results = await searchImages(query, { count: 1, orientation: 'landscape' });
    
    console.log(`[LandingEnricher] Hero search results:`, JSON.stringify(results, null, 2));
    
    let imageUrl: string;
    if (results.length > 0) {
      imageUrl = results[0].url;
      console.log(`[LandingEnricher] Hero image URL found: ${imageUrl}`);
    } else {
      // Fallback con query contextual
      const fallbackQuery = encodeURIComponent(query.split(' ').slice(0, 2).join(','));
      imageUrl = `https://source.unsplash.com/1920x1080/?${fallbackQuery}`;
      console.log(`[LandingEnricher] Using fallback URL: ${imageUrl}`);
    }
    
    const enrichedSection = {
      ...section,
      content: {
        ...content,
        backgroundImage: imageUrl,
        imageUrl: imageUrl,
      },
    };
    console.log(`[LandingEnricher] Hero section enriched with image: ${imageUrl}`);
    return enrichedSection;
  } catch (error) {
    console.error('[LandingEnricher] Error searching hero image:', error);
    return section as EnrichedSection;
  }
}

/**
 * Enriquece una sección About con imagen
 */
async function enrichAboutSection(
  section: LandingSection,
  context: EnrichmentContext
): Promise<EnrichedSection> {
  const content = section.content as Record<string, unknown>;
  
  if (content.imageUrl && typeof content.imageUrl === 'string' && content.imageUrl.startsWith('http')) {
    return section as EnrichedSection;
  }
  
  console.log(`[LandingEnricher] Searching about image for ${context.businessType}`);
  
  try {
    const query = generateContextualSearchQuery('about', context, content);
    const results = await searchImages(query, { count: 1 });
    
    let imageUrl: string;
    if (results.length > 0) {
      imageUrl = results[0].url;
    } else {
      const fallbackQuery = encodeURIComponent(query.split(' ').slice(0, 2).join(','));
      imageUrl = `https://source.unsplash.com/800x600/?${fallbackQuery}`;
    }
    
    return {
      ...section,
      content: {
        ...content,
        imageUrl,
      },
    };
  } catch (error) {
    console.error('[LandingEnricher] Error searching about image:', error);
    return section as EnrichedSection;
  }
}

/**
 * Enriquece una sección de Features/Services con imágenes
 */
async function enrichFeaturesSection(
  section: LandingSection,
  context: EnrichmentContext
): Promise<EnrichedSection> {
  const content = section.content as Record<string, unknown>;
  const features = content.features as Array<{
    title: string;
    description?: string;
    icon?: string;
    image?: string;
  }> | undefined;
  
  const services = content.services as Array<{
    title: string;
    description?: string;
    icon?: string;
    image?: string;
  }> | undefined;
  
  const items = content.items as Array<{
    title: string;
    description?: string;
    icon?: string;
    image?: string;
  }> | undefined;
  
  const featureItems = features || services || items;
  const itemKey = features ? 'features' : services ? 'services' : 'items';
  
  if (!featureItems || !Array.isArray(featureItems)) {
    return section as EnrichedSection;
  }
  
  // Solo buscar imágenes si algún item no tiene imagen
  const needsImages = featureItems.some(item => !item.image || !item.image.startsWith('http'));
  if (!needsImages) {
    return section as EnrichedSection;
  }
  
  console.log(`[LandingEnricher] Searching images for ${featureItems.length} features/services`);
  
  try {
    const enrichedItems = await Promise.all(
      featureItems.map(async (item) => {
        if (item.image && item.image.startsWith('http')) {
          return item;
        }
        
        // Usar el título del item + contexto del negocio para búsqueda más relevante
        const query = `${item.title} ${context.businessType}`;
        const results = await searchImages(query, { count: 1 });
        
        return {
          ...item,
          image: results.length > 0 
            ? results[0].url 
            : `https://source.unsplash.com/400x300/?${encodeURIComponent(item.title.split(' ')[0])}`,
        };
      })
    );
    
    return {
      ...section,
      content: {
        ...content,
        [itemKey]: enrichedItems,
      },
    };
  } catch (error) {
    console.error('[LandingEnricher] Error searching feature images:', error);
    return section as EnrichedSection;
  }
}

/**
 * Función principal: Enriquece todas las secciones de una landing con imágenes
 */
export async function enrichLandingWithImages(
  sections: LandingSection[],
  businessType: string = 'business',
  businessName: string = 'Company'
): Promise<EnrichedSection[]> {
  console.log(`[LandingEnricher] Starting enrichment for ${sections.length} sections`);
  console.log(`[LandingEnricher] Business type: ${businessType}, name: ${businessName}`);
  
  const context: EnrichmentContext = { businessType, businessName };
  
  const enrichedSections = await Promise.all(
    sections.map(async (section) => {
      try {
        switch (section.type) {
          case 'hero':
            return await enrichHeroSection(section, context);
          case 'testimonials':
            return await enrichTestimonialsSection(section, context);
          case 'team':
            return await enrichTeamSection(section, context);
          case 'gallery':
            return await enrichGallerySection(section, context);
          case 'about':
            return await enrichAboutSection(section, context);
          case 'features':
          case 'services':
            return await enrichFeaturesSection(section, context);
          default:
            return section as EnrichedSection;
        }
      } catch (error) {
        console.error(`[LandingEnricher] Error enriching section ${section.type}:`, error);
        return section as EnrichedSection;
      }
    })
  );
  
  console.log(`[LandingEnricher] Enrichment complete for ${enrichedSections.length} sections`);
  return enrichedSections;
}

/**
 * Versión rápida: Solo enriquece Hero y usa placeholders para el resto
 */
export async function enrichLandingQuick(
  sections: LandingSection[],
  businessType: string = 'business'
): Promise<EnrichedSection[]> {
  console.log(`[LandingEnricher] Quick enrichment for ${sections.length} sections`);
  
  return Promise.all(
    sections.map(async (section) => {
      if (section.type === 'hero') {
        return await enrichHeroSection(section, { businessType, businessName: '' });
      }
      return section as EnrichedSection;
    })
  );
}
