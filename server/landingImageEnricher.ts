/**
 * Landing Image Enricher
 * 
 * Este módulo enriquece las secciones de una landing page con imágenes automáticas.
 * Usa el sistema híbrido de imágenes: bancos de stock primero, IA como fallback.
 * 
 * Secciones que reciben imágenes:
 * - Hero: Imagen de fondo o principal relacionada con el negocio
 * - Testimonials: Avatares generados con IA para cada persona
 * - Team: Fotos profesionales generadas con IA
 * - Gallery: Imágenes relacionadas con el negocio
 * - Features: Iconos o imágenes ilustrativas
 * - About: Imagen del negocio o equipo
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
}

/**
 * Genera un prompt de búsqueda basado en el tipo de negocio y sección
 */
function generateSearchQuery(sectionType: string, context: EnrichmentContext, content: Record<string, unknown>): string {
  const { businessType, businessName } = context;
  
  switch (sectionType) {
    case 'hero':
      return `${businessType} business professional modern`;
    case 'about':
      return `${businessType} team office professional`;
    case 'services':
    case 'features':
      return `${businessType} service professional`;
    case 'gallery':
      return `${businessType} showcase portfolio`;
    case 'contact':
      return `${businessType} office location`;
    case 'cta':
      return `${businessType} success happy customer`;
    default:
      return `${businessType} professional`;
  }
}

/**
 * Genera un prompt para crear avatares con IA
 */
function generateAvatarPrompt(name: string, role?: string): string {
  // Determinar género basado en el nombre (heurística simple)
  const femaleNames = ['maría', 'maria', 'ana', 'laura', 'carmen', 'lucia', 'lucía', 'sofia', 'sofía', 'elena', 'paula', 'marta', 'sara', 'andrea', 'claudia', 'patricia', 'rosa', 'julia', 'isabel', 'cristina', 'jennifer', 'jessica', 'ashley', 'emily', 'emma', 'olivia', 'ava', 'sophia', 'isabella', 'mia', 'charlotte', 'amelia', 'harper', 'evelyn'];
  const nameLower = name.toLowerCase().split(' ')[0];
  const isFemale = femaleNames.some(fn => nameLower.includes(fn));
  
  const gender = isFemale ? 'woman' : 'man';
  const roleDesc = role ? `, ${role}` : '';
  
  return `Professional headshot portrait of a ${gender}${roleDesc}, friendly smile, business attire, neutral background, high quality, photorealistic`;
}

/**
 * Enriquece una sección de testimonios con avatares
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
  
  if (!testimonials || !Array.isArray(testimonials)) {
    return section as EnrichedSection;
  }
  
  console.log(`[LandingEnricher] Enriching ${testimonials.length} testimonials with avatars`);
  
  // Generar avatares para cada testimonio
  const enrichedTestimonials = await Promise.all(
    testimonials.map(async (testimonial, index) => {
      if (testimonial.avatar && testimonial.avatar.startsWith('http')) {
        // Ya tiene avatar, no generar
        return testimonial;
      }
      
      try {
        const prompt = generateAvatarPrompt(testimonial.name, testimonial.role);
        console.log(`[LandingEnricher] Generating avatar for ${testimonial.name}`);
        
        // Para testimonios, generar avatar con IA directamente
        const { generateCustomImage } = await import('./geminiImageGeneration');
        const imageUrl = await generateCustomImage(prompt);
        
        return {
          ...testimonial,
          avatar: imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=random&size=200`,
        };
      } catch (error) {
        console.error(`[LandingEnricher] Error generating avatar for ${testimonial.name}:`, error);
        // Fallback a UI Avatars
        return {
          ...testimonial,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=random&size=200`,
        };
      }
    })
  );
  
  return {
    ...section,
    content: {
      ...content,
      testimonials: enrichedTestimonials,
    },
  };
}

/**
 * Enriquece una sección de equipo con fotos profesionales
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
  
  console.log(`[LandingEnricher] Enriching ${members.length} team members with photos`);
  
  // Generar fotos para cada miembro
  const enrichedMembers = await Promise.all(
    members.map(async (member) => {
      if (member.image && member.image.startsWith('http')) {
        return member;
      }
      
      try {
        const role = member.role || member.position || '';
        const prompt = generateAvatarPrompt(member.name, role);
        console.log(`[LandingEnricher] Generating photo for team member ${member.name}`);
        
        // Para equipo, generar foto con IA directamente
        const { generateCustomImage } = await import('./geminiImageGeneration');
        const imageUrl = await generateCustomImage(prompt);
        
        return {
          ...member,
          image: imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=6366f1&color=fff&size=300`,
        };
      } catch (error) {
        console.error(`[LandingEnricher] Error generating photo for ${member.name}:`, error);
        return {
          ...member,
          image: `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=6366f1&color=fff&size=300`,
        };
      }
    })
  );
  
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
  
  // Si ya tiene imágenes válidas, no buscar más
  // Las imágenes pueden ser strings o objetos con url
  if (images && Array.isArray(images) && images.length > 0) {
    const firstImage = images[0];
    const firstUrl = typeof firstImage === 'string' ? firstImage : firstImage?.url;
    if (firstUrl && typeof firstUrl === 'string' && firstUrl.startsWith('http')) {
      // Normalizar a strings si son objetos
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
    const query = `${context.businessType} showcase portfolio professional`;
    const results = await searchImages(query, { count: 6 });
    
    let finalImages: string[];
    if (results.length > 0) {
      finalImages = results.map(r => r.url);
    } else {
      // Fallback: usar Unsplash Source
      finalImages = [
        `https://source.unsplash.com/800x600/?${encodeURIComponent(context.businessType)},1`,
        `https://source.unsplash.com/800x600/?${encodeURIComponent(context.businessType)},2`,
        `https://source.unsplash.com/800x600/?${encodeURIComponent(context.businessType)},3`,
        `https://source.unsplash.com/800x600/?${encodeURIComponent(context.businessType)},4`,
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
  
  // Si ya tiene imagen, no buscar
  if (content.backgroundImage && typeof content.backgroundImage === 'string' && content.backgroundImage.startsWith('http')) {
    return section as EnrichedSection;
  }
  if (content.imageUrl && typeof content.imageUrl === 'string' && content.imageUrl.startsWith('http')) {
    return section as EnrichedSection;
  }
  
  console.log(`[LandingEnricher] Searching hero image for ${context.businessType}`);
  
  try {
    const query = `${context.businessType} business professional modern hero`;
    const results = await searchImages(query, { count: 1, orientation: 'landscape' });
    
    console.log(`[LandingEnricher] Hero search results:`, JSON.stringify(results, null, 2));
    
    let imageUrl: string;
    if (results.length > 0) {
      imageUrl = results[0].url;
      console.log(`[LandingEnricher] Hero image URL found: ${imageUrl}`);
    } else {
      // Fallback
      imageUrl = `https://source.unsplash.com/1920x1080/?${encodeURIComponent(context.businessType)},business`;
    }
    
    const enrichedSection = {
      ...section,
      content: {
        ...content,
        backgroundImage: imageUrl,
        imageUrl: imageUrl,
      },
    };
    console.log(`[LandingEnricher] Hero section enriched:`, JSON.stringify(enrichedSection.content, null, 2));
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
    const query = `${context.businessType} team office professional`;
    const results = await searchImages(query, { count: 1 });
    
    let imageUrl: string;
    if (results.length > 0) {
      imageUrl = results[0].url;
    } else {
      imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(context.businessType)},team`;
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
  
  const items = features || services;
  const itemKey = features ? 'features' : 'services';
  
  if (!items || !Array.isArray(items)) {
    return section as EnrichedSection;
  }
  
  // Solo buscar imágenes si algún item no tiene imagen
  const needsImages = items.some(item => !item.image || !item.image.startsWith('http'));
  if (!needsImages) {
    return section as EnrichedSection;
  }
  
  console.log(`[LandingEnricher] Searching images for ${items.length} features/services`);
  
  try {
    // Buscar imágenes para cada feature/service
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        if (item.image && item.image.startsWith('http')) {
          return item;
        }
        
        const query = `${item.title} ${context.businessType} icon illustration`;
        const results = await searchImages(query, { count: 1 });
        
        return {
          ...item,
          image: results.length > 0 
            ? results[0].url 
            : `https://source.unsplash.com/400x300/?${encodeURIComponent(item.title)}`,
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
  
  // Procesar secciones en paralelo con límite de concurrencia
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
            // Para otras secciones, devolver sin cambios
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
 * Útil para preview rápido mientras se cargan las demás imágenes
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
