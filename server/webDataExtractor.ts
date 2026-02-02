/**
 * Web Data Extractor - Extrae datos de una web para usar en el generador normal
 * NO genera landings, solo extrae información para que el LLM la use
 */

import { scrapeWebsite, type ScrapedWebsite } from './webCloner';
import { analyzeScreenshot, type VisualAnalysis } from './visualAnalyzer';
import { detectIndustry, type DetectionResult } from './industryDetector';
import { detectLanguage } from './languageDetector';

export interface ExtractedWebData {
  // Información básica
  url: string;
  title: string;
  description: string;
  
  // Colores extraídos
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  
  // Tipografía
  fonts: {
    heading: string;
    body: string;
  };
  
  // Contenido extraído
  content: {
    heroTitle?: string;
    heroSubtitle?: string;
    features: Array<{ title: string; description: string }>;
    testimonials: Array<{ quote: string; author: string; role?: string }>;
    services: Array<{ name: string; description?: string; price?: string }>;
    faq: Array<{ question: string; answer: string }>;
    contactInfo?: {
      phone?: string;
      email?: string;
      address?: string;
      hours?: string;
    };
  };
  
  // Imágenes encontradas
  images: Array<{
    src: string;
    alt: string;
    type: 'logo' | 'hero' | 'gallery' | 'other';
  }>;
  
  // Detección de industria
  industry: {
    detected: boolean;
    patternId?: string;
    patternName?: string;
    confidence: 'high' | 'medium' | 'low';
  };
  
  // Estilo visual
  style: {
    darkMode: boolean;
    hasGradients: boolean;
    borderRadius: string;
  };
  
  // Idioma detectado de la web
  language: {
    detected: string; // 'es', 'en', etc.
    confidence: number;
  };
}

/**
 * Extrae todos los datos relevantes de una web
 * Estos datos se pasan al LLM para que genere una landing usando el sistema normal
 */
export async function extractWebData(url: string): Promise<ExtractedWebData> {
  console.log(`[WebDataExtractor] Extrayendo datos de: ${url}`);
  
  // 1. Scraping de la web
  console.log('[WebDataExtractor] Paso 1: Scraping...');
  const scraped = await scrapeWebsite(url);
  
  // 2. Análisis visual del screenshot
  console.log('[WebDataExtractor] Paso 2: Análisis visual...');
  const screenshotBase64 = scraped.screenshot.toString('base64');
  const visualAnalysis = await analyzeScreenshot(screenshotBase64);
  
  // 3. Detectar industria basándose en el contenido
  console.log('[WebDataExtractor] Paso 3: Detectando industria...');
  const industryText = `${scraped.title} ${scraped.description} ${scraped.content.hero?.title || ''} ${scraped.content.features?.map(f => f.title).join(' ') || ''}`;
  const industryDetection = detectIndustry(industryText);
  
  // 3.5 Detectar idioma de la web
  console.log('[WebDataExtractor] Paso 3.5: Detectando idioma...');
  const languageDetection = detectLanguage(industryText);
  console.log(`[WebDataExtractor] Idioma detectado: ${languageDetection.language} (confianza: ${languageDetection.confidence.toFixed(2)})`);
  
  // 4. Combinar y estructurar los datos
  console.log('[WebDataExtractor] Paso 4: Estructurando datos...');
  
  const extractedData: ExtractedWebData = {
    url: scraped.url,
    title: scraped.title || '',
    description: scraped.description || '',
    
    colors: {
      primary: visualAnalysis.colorPalette.primary || '#3b82f6',
      secondary: visualAnalysis.colorPalette.secondary || '#64748b',
      accent: visualAnalysis.colorPalette.accent || '#f59e0b',
      background: visualAnalysis.colorPalette.background || '#ffffff',
      text: visualAnalysis.style.darkMode ? '#ffffff' : '#1f2937',
    },
    
    fonts: {
      heading: scraped.assets.fonts[0] || 'Inter',
      body: scraped.assets.fonts[1] || scraped.assets.fonts[0] || 'Inter',
    },
    
    content: {
      heroTitle: scraped.content.hero?.title,
      heroSubtitle: scraped.content.hero?.subtitle,
      features: scraped.content.features || [],
      testimonials: (scraped.content.testimonials || []).map(t => ({
        quote: t.quote,
        author: t.name || 'Anonymous',
        role: t.role,
      })),
      services: extractServices(scraped, visualAnalysis),
      faq: scraped.content.faq || [],
      contactInfo: (scraped.content as any).contact,
    },
    
    images: scraped.assets.images.map(img => ({
      src: img.src,
      alt: img.alt || '',
      type: categorizeImage(img),
    })),
    
    industry: {
      detected: industryDetection.detected,
      patternId: industryDetection.pattern?.id,
      patternName: industryDetection.pattern?.name,
      confidence: industryDetection.confidence,
    },
    
    style: {
      darkMode: visualAnalysis.style.darkMode,
      hasGradients: visualAnalysis.style.hasGradients,
      borderRadius: visualAnalysis.style.borderRadius || '8px',
    },
    
    language: {
      detected: languageDetection.language,
      confidence: languageDetection.confidence,
    },
  };
  
  console.log(`[WebDataExtractor] Extracción completada:`);
  console.log(`  - Título: ${extractedData.title}`);
  console.log(`  - Industria: ${extractedData.industry.patternName || 'No detectada'}`);
  console.log(`  - Features: ${extractedData.content.features.length}`);
  console.log(`  - Testimonios: ${extractedData.content.testimonials.length}`);
  console.log(`  - Imágenes: ${extractedData.images.length}`);
  
  return extractedData;
}

/**
 * Extrae servicios del contenido scrapeado
 */
function extractServices(scraped: ScrapedWebsite, visual: VisualAnalysis): Array<{ name: string; description?: string; price?: string }> {
  const services: Array<{ name: string; description?: string; price?: string }> = [];
  
  // Buscar en features que parezcan servicios
  for (const feature of scraped.content.features || []) {
    if (feature.title && (
      feature.title.toLowerCase().includes('servicio') ||
      feature.title.toLowerCase().includes('service') ||
      feature.description?.includes('$') ||
      feature.description?.includes('€')
    )) {
      services.push({
        name: feature.title,
        description: feature.description,
      });
    }
  }
  
  // Buscar en secciones visuales
  for (const section of visual.sections) {
    if (section.type === 'pricing' || (section.type as string) === 'services') {
      for (const item of section.content?.items || []) {
        services.push({
          name: item.title || 'Service',
          description: item.description,
        });
      }
    }
  }
  
  return services;
}

/**
 * Categoriza una imagen por su tipo
 */
function categorizeImage(img: { src: string; alt: string; type?: string }): 'logo' | 'hero' | 'gallery' | 'other' {
  const src = img.src.toLowerCase();
  const alt = (img.alt || '').toLowerCase();
  
  if (img.type === 'logo' || src.includes('logo') || alt.includes('logo')) {
    return 'logo';
  }
  
  if (src.includes('hero') || src.includes('banner') || alt.includes('hero')) {
    return 'hero';
  }
  
  if (src.includes('gallery') || src.includes('portfolio') || alt.includes('gallery')) {
    return 'gallery';
  }
  
  return 'other';
}

/**
 * Genera un prompt enriquecido para el LLM basado en los datos extraídos
 */
export function generateEnrichedPrompt(extractedData: ExtractedWebData, userMessage: string): string {
  const parts: string[] = [];
  
  parts.push(`El usuario quiere crear una landing inspirada en: ${extractedData.url}`);
  parts.push('');
  parts.push('## Datos extraídos de la web original:');
  parts.push('');
  
  // Información del negocio
  parts.push(`**Título:** ${extractedData.title}`);
  if (extractedData.description) {
    parts.push(`**Descripción:** ${extractedData.description}`);
  }
  
  // Industria detectada
  if (extractedData.industry.detected && extractedData.industry.patternName) {
    parts.push(`**Industria detectada:** ${extractedData.industry.patternName} (confianza: ${extractedData.industry.confidence})`);
    parts.push(`IMPORTANTE: Usa el patrón de industria "${extractedData.industry.patternId}" para las secciones y variantes.`);
  }
  
  // Colores
  parts.push('');
  parts.push('**Colores de la web original (USAR ESTOS COLORES):**');
  parts.push(`- Primary: ${extractedData.colors.primary}`);
  parts.push(`- Secondary: ${extractedData.colors.secondary}`);
  parts.push(`- Accent: ${extractedData.colors.accent}`);
  parts.push(`- Background: ${extractedData.colors.background}`);
  
  // Contenido
  if (extractedData.content.heroTitle) {
    parts.push('');
    parts.push('**Contenido del Hero:**');
    parts.push(`- Título: ${extractedData.content.heroTitle}`);
    if (extractedData.content.heroSubtitle) {
      parts.push(`- Subtítulo: ${extractedData.content.heroSubtitle}`);
    }
  }
  
  // Features/Servicios
  if (extractedData.content.features.length > 0) {
    parts.push('');
    parts.push('**Características/Servicios encontrados:**');
    for (const feature of extractedData.content.features.slice(0, 6)) {
      parts.push(`- ${feature.title}: ${feature.description || ''}`);
    }
  }
  
  // Testimonios
  if (extractedData.content.testimonials.length > 0) {
    parts.push('');
    parts.push('**Testimonios encontrados:**');
    for (const testimonial of extractedData.content.testimonials.slice(0, 3)) {
      parts.push(`- "${testimonial.quote}" - ${testimonial.author}`);
    }
  }
  
  // FAQ
  if (extractedData.content.faq.length > 0) {
    parts.push('');
    parts.push('**Preguntas frecuentes encontradas:**');
    for (const faq of extractedData.content.faq.slice(0, 5)) {
      parts.push(`- ${faq.question}`);
    }
  }
  
  // Contacto
  if (extractedData.content.contactInfo) {
    parts.push('');
    parts.push('**Información de contacto:**');
    if (extractedData.content.contactInfo.phone) parts.push(`- Teléfono: ${extractedData.content.contactInfo.phone}`);
    if (extractedData.content.contactInfo.email) parts.push(`- Email: ${extractedData.content.contactInfo.email}`);
    if (extractedData.content.contactInfo.address) parts.push(`- Dirección: ${extractedData.content.contactInfo.address}`);
  }
  
  // Estilo
  parts.push('');
  parts.push('**Estilo visual:**');
  parts.push(`- Modo oscuro: ${extractedData.style.darkMode ? 'Sí' : 'No'}`);
  parts.push(`- Gradientes: ${extractedData.style.hasGradients ? 'Sí' : 'No'}`);
  parts.push(`- Border radius: ${extractedData.style.borderRadius}`);
  
  // Idioma de la web original
  parts.push('');
  parts.push('**Idioma de la web original:**');
  const languageName = extractedData.language.detected === 'es' ? 'Español' : 
                       extractedData.language.detected === 'en' ? 'Inglés' : 
                       extractedData.language.detected;
  parts.push(`- Idioma detectado: ${languageName} (confianza: ${extractedData.language.confidence.toFixed(2)})`);
  parts.push(`- **IMPORTANTE: TODO el contenido de la landing DEBE estar en ${languageName}**`);
  
  // Instrucciones finales
  parts.push('');
  parts.push('## INSTRUCCIONES IMPORTANTES:');
  parts.push('1. Genera una landing page usando EXACTAMENTE los colores extraídos arriba');
  parts.push('2. Usa el contenido real extraído (títulos, features, testimonios, FAQ)');
  parts.push('3. Mantén el estilo visual (modo oscuro/claro, gradientes)');
  parts.push('4. Si se detectó una industria, usa las secciones y variantes de ese patrón');
  parts.push(`5. **OBLIGATORIO: TODO el contenido DEBE estar en ${languageName}** - NO traduzcas a otro idioma`);
  parts.push('6. Si la web original está en español, la landing DEBE estar en español');
  parts.push('7. Si la web original está en inglés, la landing DEBE estar en inglés');
  parts.push('');
  parts.push(`## Mensaje original del usuario: ${userMessage}`);
  
  return parts.join('\n');
}
