/**
 * Generador de Imágenes Contextuales para Landing Pages
 * Genera imágenes automáticamente basadas en el contenido de cada sección
 * Integrado con el sistema de 308 patrones de industria
 */

import { generateImageWithGemini } from './geminiImageGeneration';
import { searchImages } from './imageSearch';
import { detectIndustry, getImageQueriesForIndustry } from './industryDetector';
import { allPatterns, IndustryPattern } from './industryPatterns';
import { generateAvatarsForTestimonials } from './avatarService';

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
  source: 'ai' | 'stock' | 'unsplash' | 'pexels' | 'pixabay';
}

// Mapeo extendido de tipos de negocio a palabras clave de imagen
// Ahora integrado con los patrones de industria
const BUSINESS_IMAGE_KEYWORDS: Record<string, string[]> = {
  // Tecnología
  tech: ['technology', 'software', 'digital', 'innovation', 'startup', 'modern office'],
  saas: ['dashboard', 'software interface', 'cloud computing', 'analytics platform', 'SaaS product'],
  'ai-ml': ['artificial intelligence', 'machine learning', 'neural network', 'AI technology', 'data science'],
  fintech: ['financial technology', 'digital banking', 'mobile payment', 'cryptocurrency', 'fintech app'],
  cybersecurity: ['cybersecurity', 'digital security', 'network protection', 'encryption', 'secure data'],
  
  // Gastronomía
  restaurant: ['restaurant interior', 'fine dining', 'gourmet food', 'chef cooking', 'elegant table'],
  'korean-bbq': ['korean bbq grill', 'korean food', 'bulgogi', 'samgyeopsal', 'korean restaurant'],
  'ramen-shop': ['ramen noodles', 'japanese ramen', 'noodle soup', 'ramen restaurant', 'steaming bowl'],
  'poke-bowl': ['poke bowl', 'hawaiian food', 'fresh fish bowl', 'healthy bowl', 'sushi bowl'],
  'acai-bowl': ['acai bowl', 'smoothie bowl', 'healthy breakfast', 'superfood', 'fruit bowl'],
  'mediterranean': ['mediterranean food', 'greek cuisine', 'hummus falafel', 'olive oil', 'fresh salad'],
  'french-bistro': ['french bistro', 'paris cafe', 'croissant coffee', 'french cuisine', 'elegant dining'],
  'dim-sum': ['dim sum', 'chinese dumplings', 'steamer baskets', 'cantonese food', 'tea house'],
  'tapas-bar': ['spanish tapas', 'tapas bar', 'small plates', 'spanish wine', 'pintxos'],
  'brunch-spot': ['brunch food', 'eggs benedict', 'avocado toast', 'mimosa', 'weekend brunch'],
  'dessert-bar': ['dessert bar', 'pastries', 'sweet treats', 'chocolate cake', 'gourmet desserts'],
  'food-truck': ['food truck', 'street food', 'mobile kitchen', 'outdoor dining', 'casual food'],
  'craft-brewery': ['craft beer', 'brewery', 'beer taps', 'brewing equipment', 'beer flight'],
  'specialty-coffee': ['specialty coffee', 'latte art', 'coffee shop', 'barista', 'espresso machine'],
  
  // Salud y Bienestar
  health: ['healthcare', 'medical clinic', 'doctor patient', 'wellness', 'health professional'],
  dental: ['dental clinic', 'dentist office', 'dental care', 'smile teeth', 'dental equipment'],
  chiropractic: ['chiropractic care', 'spine adjustment', 'back pain relief', 'chiropractor', 'wellness'],
  acupuncture: ['acupuncture treatment', 'chinese medicine', 'needles therapy', 'holistic healing'],
  'physical-therapy': ['physical therapy', 'rehabilitation', 'exercise therapy', 'recovery', 'physiotherapy'],
  'mental-health': ['mental health', 'therapy session', 'counseling', 'peaceful mind', 'wellness'],
  
  // Fitness
  fitness: ['fitness gym', 'workout', 'exercise equipment', 'training', 'healthy lifestyle'],
  yoga: ['yoga practice', 'yoga studio', 'meditation', 'yoga pose', 'mindfulness'],
  pilates: ['pilates studio', 'pilates equipment', 'core workout', 'reformer', 'fitness class'],
  crossfit: ['crossfit gym', 'crossfit workout', 'functional fitness', 'intense training', 'box gym'],
  'personal-training': ['personal trainer', 'one on one training', 'fitness coaching', 'gym session'],
  'martial-arts': ['martial arts', 'karate dojo', 'mma training', 'self defense', 'combat sports'],
  dance: ['dance studio', 'dance class', 'ballet', 'contemporary dance', 'dance performance'],
  
  // Belleza
  beauty: ['beauty salon', 'spa treatment', 'skincare', 'makeup', 'beauty products'],
  'hair-salon': ['hair salon', 'hairstylist', 'hair cutting', 'hair color', 'salon interior'],
  barbershop: ['barbershop', 'barber chair', 'mens grooming', 'beard trim', 'classic barber'],
  spa: ['spa treatment', 'massage therapy', 'relaxation', 'spa interior', 'wellness spa'],
  'nail-salon': ['nail salon', 'manicure', 'nail art', 'pedicure', 'nail polish'],
  'tattoo-studio': ['tattoo studio', 'tattoo artist', 'tattoo design', 'ink art', 'body art'],
  'lash-extensions': ['eyelash extensions', 'lash studio', 'beauty treatment', 'lash artist'],
  microblading: ['microblading', 'eyebrow tattoo', 'permanent makeup', 'brow artist'],
  
  // Bodas y Eventos
  'wedding-planner': ['wedding planning', 'wedding ceremony', 'bride groom', 'wedding decor', 'romantic'],
  'wedding-florist': ['wedding flowers', 'bridal bouquet', 'floral arrangement', 'wedding centerpiece'],
  'wedding-dj': ['wedding dj', 'wedding party', 'dance floor', 'wedding reception', 'celebration'],
  'wedding-videography': ['wedding video', 'wedding film', 'couple portrait', 'romantic moments'],
  'wedding-dress': ['wedding dress', 'bridal gown', 'bridal boutique', 'wedding fashion'],
  'event-venue': ['event venue', 'wedding venue', 'reception hall', 'elegant venue', 'celebration space'],
  
  // Niños
  'kids-party': ['kids party', 'birthday party', 'children celebration', 'party decorations', 'fun'],
  tutoring: ['tutoring session', 'student learning', 'education', 'homework help', 'teaching'],
  'kids-sports': ['kids sports', 'youth athletics', 'children playing', 'sports training', 'active kids'],
  'kids-art': ['kids art class', 'children painting', 'creative kids', 'art studio', 'crafts'],
  'summer-camp': ['summer camp', 'outdoor activities', 'kids adventure', 'camp fun', 'nature'],
  
  // Mascotas
  pets: ['pet store', 'cute pets', 'dog cat', 'pet supplies', 'pet care'],
  veterinary: ['veterinary clinic', 'vet doctor', 'pet health', 'animal care', 'vet office'],
  'pet-grooming': ['pet grooming', 'dog grooming', 'pet spa', 'grooming salon', 'clean pet'],
  'dog-training': ['dog training', 'obedience class', 'pet training', 'dog behavior', 'trainer'],
  'pet-daycare': ['pet daycare', 'dog daycare', 'pet sitting', 'happy pets', 'pet care center'],
  
  // Hogar
  'home-remodeling': ['home remodeling', 'renovation', 'interior design', 'home improvement', 'construction'],
  'interior-design': ['interior design', 'home decor', 'modern interior', 'living room', 'stylish home'],
  'home-organization': ['home organization', 'organized closet', 'storage solutions', 'tidy home'],
  'smart-home': ['smart home', 'home automation', 'iot devices', 'connected home', 'technology'],
  
  // Viajes
  travel: ['travel destination', 'vacation', 'adventure', 'tourism', 'beautiful landscape'],
  'eco-tourism': ['eco tourism', 'nature travel', 'sustainable travel', 'wildlife', 'green tourism'],
  'scuba-diving': ['scuba diving', 'underwater', 'coral reef', 'diving adventure', 'ocean'],
  'ski-resort': ['ski resort', 'skiing', 'snow mountain', 'winter sports', 'alpine'],
  
  // Retail
  ecommerce: ['ecommerce', 'online shopping', 'products', 'retail store', 'shopping'],
  jewelry: ['jewelry store', 'diamond ring', 'luxury jewelry', 'gold necklace', 'elegant'],
  'watch-store': ['luxury watches', 'watch store', 'timepiece', 'elegant watch', 'watch collection'],
  'shoe-store': ['shoe store', 'footwear', 'sneakers', 'fashion shoes', 'shoe collection'],
  'vintage-shop': ['vintage shop', 'antique store', 'retro items', 'thrift store', 'collectibles'],
  'plant-shop': ['plant shop', 'indoor plants', 'nursery', 'green plants', 'botanical'],
  
  // Servicios Profesionales
  agency: ['creative agency', 'design team', 'modern office', 'collaboration', 'creative work'],
  consulting: ['business consulting', 'meeting room', 'professional advice', 'strategy', 'corporate'],
  legal: ['law office', 'attorney', 'legal services', 'justice', 'professional lawyer'],
  accounting: ['accounting office', 'financial documents', 'calculator', 'tax services', 'numbers'],
  'real-estate': ['real estate', 'luxury home', 'property', 'house exterior', 'modern building'],
  architecture: ['architecture', 'building design', 'modern architecture', 'blueprint', 'structure'],
  
  // Personal
  portfolio: ['creative portfolio', 'designer workspace', 'artistic', 'creative work', 'showcase'],
  'life-coach': ['life coaching', 'personal development', 'motivation', 'success', 'growth'],
  'public-speaker': ['public speaking', 'conference', 'keynote speaker', 'presentation', 'audience'],
  freelancer: ['freelancer workspace', 'remote work', 'laptop coffee', 'creative professional'],
  
  // Educación
  education: ['education', 'classroom', 'students learning', 'school', 'teaching'],
  'online-courses': ['online learning', 'e-learning', 'video course', 'digital education', 'webinar'],
  'language-school': ['language learning', 'language class', 'multilingual', 'conversation', 'teaching'],
  
  // Entretenimiento
  gaming: ['gaming', 'esports', 'video games', 'gaming setup', 'gamer'],
  streaming: ['streaming', 'content creator', 'live stream', 'podcast', 'microphone'],
  podcast: ['podcast studio', 'microphone', 'audio recording', 'podcast host', 'broadcasting'],
  
  // Default
  business: ['professional business', 'modern office', 'corporate', 'success', 'teamwork'],
};

/**
 * Obtiene las palabras clave de imagen para una industria específica
 * Primero busca en los patrones de industria, luego en el mapeo local
 */
function getImageKeywordsForIndustry(businessType: string, userMessage?: string): string[] {
  // Si hay mensaje del usuario, intentar detectar la industria
  if (userMessage) {
    const detection = detectIndustry(userMessage);
    if (detection.detected && detection.pattern) {
      return detection.pattern.suggestedImages;
    }
  }
  
  // Buscar en el mapeo local
  const normalizedType = businessType.toLowerCase().replace(/\s+/g, '-');
  
  // Buscar coincidencia exacta
  if (BUSINESS_IMAGE_KEYWORDS[normalizedType]) {
    return BUSINESS_IMAGE_KEYWORDS[normalizedType];
  }
  
  // Buscar coincidencia parcial
  for (const [key, keywords] of Object.entries(BUSINESS_IMAGE_KEYWORDS)) {
    if (normalizedType.includes(key) || key.includes(normalizedType)) {
      return keywords;
    }
  }
  
  // Buscar en los patrones de industria por nombre
  for (const pattern of Object.values(allPatterns)) {
    if (pattern.name.toLowerCase().includes(normalizedType) || 
        pattern.nameEs.toLowerCase().includes(normalizedType)) {
      return pattern.suggestedImages;
    }
  }
  
  // Default
  return BUSINESS_IMAGE_KEYWORDS['business'];
}

/**
 * Genera un prompt de imagen basado en el contenido de la sección
 */
function generateImagePrompt(
  section: Section,
  businessType: string,
  businessName: string,
  industryKeywords: string[]
): string {
  const content = section.content;
  const sectionType = section.type;
  
  const keywordStr = industryKeywords.slice(0, 3).join(', ');
  
  switch (sectionType) {
    case 'hero':
      const heroTitle = content.title as string || '';
      const heroSubtitle = content.subtitle as string || '';
      return `Professional hero banner for ${businessName}. ${heroTitle}. ${heroSubtitle}. 
              Style: Modern, high-quality, ${keywordStr}. 
              Aspect ratio: 16:9, suitable for website header.
              No text overlays, clean background.`;
    
    case 'features':
      return `Modern illustration or photo representing ${keywordStr} features. 
              Clean, professional, suitable for a ${businessType} website.
              Style: Minimalist, modern design, no text.`;
    
    case 'about':
      const aboutTitle = content.title as string || '';
      return `Professional image for about section of ${businessName}. ${aboutTitle}.
              Style: Authentic, trustworthy, ${keywordStr}.
              Show team, workspace, or brand essence.`;
    
    case 'testimonials':
      return `Professional headshot of a satisfied customer or business professional.
              Style: Friendly, approachable, trustworthy appearance.
              Natural lighting, clean background.`;
    
    case 'gallery':
      return `High-quality gallery image showcasing ${businessType} products or services.
              Style: Professional photography, ${keywordStr}.
              Vibrant colors, sharp focus.`;
    
    case 'stats':
      return `Abstract visualization or infographic style image representing growth and success.
              Style: Modern, data-driven, ${keywordStr}.
              Clean geometric shapes, professional colors.`;
    
    case 'pricing':
      return `Professional image representing value and pricing options.
              Style: Clean, modern, business-oriented.
              Abstract or conceptual, no specific prices shown.`;
    
    case 'process':
      return `Visual representation of a professional workflow or process.
              Style: Modern, step-by-step, ${keywordStr}.
              Clean, organized, professional.`;
    
    case 'cta':
      return `Compelling call-to-action background image for ${businessType}.
              Style: Dynamic, engaging, ${keywordStr}.
              Suitable for text overlay.`;
    
    default:
      return `Professional image for ${sectionType} section of a ${businessType} website.
              Style: Modern, clean, ${keywordStr}.
              High quality, suitable for web.`;
  }
}

/**
 * Intenta obtener una imagen de stock primero, luego genera con IA si no encuentra
 * Prioriza: Unsplash → Pexels → Pixabay → AI Generation
 */
async function getImageForSection(
  section: Section,
  businessType: string,
  businessName: string,
  industryKeywords: string[],
  useAI: boolean = true
): Promise<{ url: string; source: 'ai' | 'stock' | 'unsplash' | 'pexels' | 'pixabay' } | null> {
  const sectionType = section.type;
  
  // Construir múltiples queries de búsqueda para mejores resultados
  const searchQueries = [
    `${industryKeywords[0]} ${sectionType}`,
    `${businessType} ${industryKeywords[1] || 'professional'}`,
    industryKeywords[0],
    `${businessType} business`
  ];
  
  try {
    // Intentar con cada query hasta encontrar resultados
    for (const query of searchQueries) {
      console.log(`[ContextualImageGenerator] Searching: "${query}"`);
      
      const stockResults = await searchImages(query, { 
        count: 10, 
        orientation: sectionType === 'hero' ? 'landscape' : 'square' 
      });
      
      if (stockResults && stockResults.length > 0) {
        // Filtrar imágenes de baja calidad (muy pequeñas)
        const qualityResults = stockResults.filter((img: { width?: number; height?: number }) => 
          (img.width || 800) >= 800 && (img.height || 600) >= 600
        );
        
        if (qualityResults.length > 0) {
          // Seleccionar una imagen aleatoria de los primeros resultados
          const randomIndex = Math.floor(Math.random() * Math.min(5, qualityResults.length));
          const selectedImage = qualityResults[randomIndex];
          
          // Determinar la fuente basándose en la URL
          let source: 'stock' | 'unsplash' | 'pexels' | 'pixabay' = 'stock';
          if (selectedImage.url.includes('unsplash')) source = 'unsplash';
          else if (selectedImage.url.includes('pexels')) source = 'pexels';
          else if (selectedImage.url.includes('pixabay')) source = 'pixabay';
          
          console.log(`[ContextualImageGenerator] Found ${source} image for ${sectionType}`);
          return {
            url: selectedImage.url,
            source
          };
        }
      }
    }
    
    // Si no hay resultados de stock y useAI está habilitado, generar con IA
    if (useAI) {
      console.log(`[ContextualImageGenerator] No stock images found for "${industryKeywords[0]}", generating with AI...`);
      const prompt = generateImagePrompt(section, businessType, businessName, industryKeywords);
      
      try {
        const aiResult = await generateImageWithGemini({
          prompt,
          aspectRatio: sectionType === 'hero' ? '16:9' : '1:1',
          category: sectionType,
          style: sectionType === 'features' || sectionType === 'process' ? 'illustration' : 'photorealistic'
        });
        
        if (aiResult && aiResult.url) {
          console.log(`[ContextualImageGenerator] ✓ Generated AI image for ${sectionType}: ${aiResult.url}`);
          return {
            url: aiResult.url,
            source: 'ai'
          };
        } else {
          console.warn(`[ContextualImageGenerator] AI generation returned no image for ${sectionType}`);
        }
      } catch (aiError) {
        console.error(`[ContextualImageGenerator] AI generation failed for ${sectionType}:`, aiError);
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
 * Integrado con el sistema de detección de industria
 */
export async function generateContextualImages(
  landingData: LandingData,
  options: { useAI?: boolean; maxImages?: number; userMessage?: string } = {}
): Promise<{ data: LandingData; generatedImages: ImageGenerationResult[] }> {
  const { useAI = true, maxImages = 5, userMessage } = options;
  const generatedImages: ImageGenerationResult[] = [];
  
  const businessType = landingData.businessType || 'business';
  const businessName = landingData.businessName || 'Company';
  
  // Obtener keywords específicos de la industria
  const industryKeywords = getImageKeywordsForIndustry(businessType, userMessage);
  console.log(`[ContextualImageGenerator] Industry keywords for "${businessType}":`, industryKeywords);
  
  // Crear copia para no mutar el original
  const fixedData = JSON.parse(JSON.stringify(landingData)) as LandingData;
  
  // Secciones que necesitan imágenes (en orden de prioridad)
  const sectionsNeedingImages = ['hero', 'about', 'gallery', 'features', 'process'];
  let imagesGenerated = 0;
  
  for (const section of fixedData.sections) {
    if (imagesGenerated >= maxImages) break;
    
    // Solo procesar secciones que típicamente necesitan imágenes
    if (!sectionsNeedingImages.includes(section.type)) continue;
    
    // Verificar si ya tiene imagen válida (no placeholder)
    const content = section.content;
    const currentImage = (content.backgroundImage || content.image || content.imageUrl) as string | undefined;
    const hasValidImage = currentImage && 
      !currentImage.includes('placeholder') && 
      !currentImage.includes('via.placeholder') &&
      !currentImage.includes('placehold.co') &&
      currentImage.startsWith('http');
    
    // Si tiene imagePrompt pero no imagen válida, o es hero sin imagen, generar
    const imagePrompt = content.imagePrompt as string | undefined;
    
    if (!hasValidImage && (imagePrompt || section.type === 'hero' || section.type === 'about')) {
      const result = await getImageForSection(
        section, 
        businessType, 
        businessName, 
        industryKeywords,
        useAI
      );
      
      if (result) {
        // Asignar la imagen al campo apropiado
        if (section.type === 'hero') {
          section.content.backgroundImage = result.url;
        } else if (section.type === 'gallery') {
          // Para gallery, añadir a la lista de imágenes
          const images = (section.content.images as Array<{ url: string; alt?: string }>) || [];
          if (images.length === 0 || images.every(img => !img.url || img.url.includes('placeholder'))) {
            section.content.images = [
              { url: result.url, alt: `${businessName} gallery image` }
            ];
          }
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
      }
    }
  }
  
  // Procesar avatares de testimonios
  for (const section of fixedData.sections) {
    if (section.type === 'testimonials') {
      const content = section.content;
      const items = content.items as Array<{ name: string; image?: string; avatar?: string }> | undefined;
      
      if (items && items.length > 0) {
        console.log(`[ContextualImageGenerator] Processing ${items.length} testimonial avatars...`);
        const enrichedItems = generateAvatarsForTestimonials(items);
        section.content.items = enrichedItems;
        console.log(`[ContextualImageGenerator] ✓ Enriched testimonial avatars with real photos`);
      }
    }
  }
  
  console.log(`[ContextualImageGenerator] Generated ${generatedImages.length} images total`);
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
  const industryKeywords = getImageKeywordsForIndustry(businessType);
  
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
  
  const result = await getImageForSection(section, businessType, businessName, industryKeywords, true);
  return result?.url || null;
}

/**
 * Obtiene imágenes de stock para una industria específica
 */
export async function getStockImagesForIndustry(
  businessType: string,
  count: number = 10,
  userMessage?: string
): Promise<Array<{ url: string; source: string; alt: string }>> {
  const industryKeywords = getImageKeywordsForIndustry(businessType, userMessage);
  const results: Array<{ url: string; source: string; alt: string }> = [];
  
  for (const keyword of industryKeywords.slice(0, 3)) {
    try {
      const images = await searchImages(keyword, { count: Math.ceil(count / 3), orientation: 'landscape' });
      if (images) {
        for (const img of images) {
          results.push({
            url: img.url,
            source: img.url.includes('unsplash') ? 'unsplash' : 
                   img.url.includes('pexels') ? 'pexels' : 
                   img.url.includes('pixabay') ? 'pixabay' : 'stock',
            alt: keyword
          });
        }
      }
    } catch (error) {
      console.error(`[ContextualImageGenerator] Error searching for "${keyword}":`, error);
    }
  }
  
  return results.slice(0, count);
}
