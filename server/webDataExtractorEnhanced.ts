/**
 * Enhanced Web Data Extractor - Integra todos los módulos de clonación mejorados
 * 
 * Combina:
 * - structureExtractor: Extracción semántica de secciones
 * - colorExtractor: Extracción de colores y tipografía via Playwright
 * - assetDownloader: Descarga de imágenes y logos a servidor local
 * - cloningLevels: Sistema de 3 niveles de clonación
 */

import { scrapeWebsite, type ScrapedWebsite } from './webCloner';
import { analyzeScreenshot, type VisualAnalysis } from './visualAnalyzer';
import { detectIndustry, type DetectionResult } from './industryDetector';
import { detectLanguage } from './languageDetector';
import { extractStructure, type ExtractedSection } from './structureExtractor';
import { chromium } from 'playwright';
import { extractColors, extractTypography, type ExtractedColorPalette, type ExtractedTypography } from './colorExtractor';
import { 
  downloadAssets, 
  downloadLogo, 
  extractAndDownloadAllAssets,
  type DownloadedAsset 
} from './assetDownloader';
import { 
  detectCloningLevel, 
  getCloningConfig, 
  generateCloningInstructions,
  analyzeAndConfigureCloning,
  getCloningLevelSummary,
  type CloningLevel,
  type CloningResult 
} from './cloningLevels';
import type { ExtractedWebData } from './webDataExtractor';

export interface EnhancedExtractedData extends ExtractedWebData {
  // Secciones extraídas semánticamente
  extractedSections: ExtractedSection[];
  // Colores extraídos via Playwright (más precisos)
  enhancedColors: ExtractedColorPalette;
  // Tipografía extraída via Playwright
  enhancedTypography: ExtractedTypography;
  // Assets descargados localmente
  downloadedAssets: {
    logo?: DownloadedAsset;
    heroImages: DownloadedAsset[];
    galleryImages: DownloadedAsset[];
    backgroundImages: DownloadedAsset[];
    clientLogos: DownloadedAsset[];
  };
  // Nivel de clonación detectado
  cloningLevel: CloningLevel;
  cloningConfig: CloningResult;
}

/**
 * Extrae todos los datos de una web usando los módulos mejorados
 */
export async function extractWebDataEnhanced(
  url: string,
  userMessage: string,
  projectId: string = `clone-${Date.now()}`
): Promise<EnhancedExtractedData> {
  console.log(`[EnhancedExtractor] Starting enhanced extraction for: ${url}`);
  console.log(`[EnhancedExtractor] Project ID: ${projectId}`);
  
  // 1. Scraping básico de la web
  console.log('[EnhancedExtractor] Step 1: Basic scraping...');
  const scraped = await scrapeWebsite(url);
  
  // 2. Análisis visual del screenshot
  console.log('[EnhancedExtractor] Step 2: Visual analysis...');
  const screenshotBase64 = scraped.screenshot.toString('base64');
  const visualAnalysis = await analyzeScreenshot(screenshotBase64);
  
  // 3. Extracción de estructura semántica
  console.log('[EnhancedExtractor] Step 3: Structure extraction...');
  const extractedSections = extractStructure(scraped.html);
  console.log(`[EnhancedExtractor] Extracted ${extractedSections.length} sections`);
  
  // 4. Extracción de colores y tipografía via Playwright (más preciso)
  console.log('[EnhancedExtractor] Step 4: Color and typography extraction...');
  let enhancedColors: ExtractedColorPalette;
  let enhancedTypography: ExtractedTypography;
  
  try {
    // Usar Playwright para extraer colores y tipografía
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    const [colors, typography] = await Promise.all([
      extractColors(page),
      extractTypography(page),
    ]);
    
    await browser.close();
    
    enhancedColors = colors;
    enhancedTypography = typography;
    console.log(`[EnhancedExtractor] Colors extracted: primary=${enhancedColors.primary}`);
  } catch (error) {
    console.warn('[EnhancedExtractor] Color extraction failed, using visual analysis fallback');
    // Fallback a análisis visual
    enhancedColors = {
      primary: visualAnalysis.colorPalette.primary || '#3b82f6',
      secondary: visualAnalysis.colorPalette.secondary || '#64748b',
      accent: visualAnalysis.colorPalette.accent || '#f59e0b',
      background: visualAnalysis.colorPalette.background || '#ffffff',
      foreground: visualAnalysis.style.darkMode ? '#ffffff' : '#1f2937',
      muted: '#6b7280',
      border: '#e5e7eb',
      additionalColors: [],
      isDark: visualAnalysis.style.darkMode,
      hasGradients: visualAnalysis.style.hasGradients,
      gradients: [],
    };
    enhancedTypography = {
      headingFont: scraped.assets.fonts[0] || 'Inter',
      bodyFont: scraped.assets.fonts[1] || scraped.assets.fonts[0] || 'Inter',
      headingWeight: '700',
      bodyWeight: '400',
      headingSizes: { h1: '48px', h2: '36px', h3: '24px', h4: '20px' },
      bodySize: '16px',
      lineHeight: '1.5',
      letterSpacing: 'normal',
      googleFontsUrls: [],
    };
  }
  
  // 5. Descarga de assets a servidor local
  console.log('[EnhancedExtractor] Step 5: Downloading assets...');
  let downloadedAssets: EnhancedExtractedData['downloadedAssets'];
  
  try {
    const assets = await extractAndDownloadAllAssets(scraped.html, url, projectId);
    downloadedAssets = {
      ...assets,
      logo: assets.logo || undefined,
    };
    console.log(`[EnhancedExtractor] Downloaded: logo=${assets.logo ? 1 : 0}, hero=${assets.heroImages.length}, gallery=${assets.galleryImages.length}`);
  } catch (error) {
    console.warn('[EnhancedExtractor] Asset download failed:', error);
    downloadedAssets = {
      logo: undefined,
      heroImages: [],
      galleryImages: [],
      backgroundImages: [],
      clientLogos: [],
    };
  }
  
  // 6. Detectar industria
  console.log('[EnhancedExtractor] Step 6: Industry detection...');
  const industryText = `${scraped.title} ${scraped.description} ${scraped.content.hero?.title || ''} ${scraped.content.features?.map(f => f.title).join(' ') || ''}`;
  const industryDetection = detectIndustry(industryText);
  
  // 7. Detectar idioma
  console.log('[EnhancedExtractor] Step 7: Language detection...');
  const languageDetection = detectLanguage(industryText);
  
  // 8. Detectar nivel de clonación
  console.log('[EnhancedExtractor] Step 8: Cloning level detection...');
  const cloningLevel = detectCloningLevel(userMessage);
  const levelSummary = getCloningLevelSummary(cloningLevel);
  console.log(`[EnhancedExtractor] Cloning level: ${levelSummary.name} (${cloningLevel})`);
  
  // 9. Construir datos extraídos básicos
  const basicExtractedData: ExtractedWebData = {
    url: scraped.url,
    title: scraped.title || '',
    description: scraped.description || '',
    colors: {
      primary: enhancedColors.primary,
      secondary: enhancedColors.secondary,
      accent: enhancedColors.accent,
      background: enhancedColors.background,
      text: enhancedColors.foreground,
    },
    fonts: {
      heading: enhancedTypography.headingFont,
      body: enhancedTypography.bodyFont,
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
  
  // 10. Configurar clonación
  console.log('[EnhancedExtractor] Step 9: Configuring cloning...');
  const cloningConfig = analyzeAndConfigureCloning(
    userMessage,
    basicExtractedData,
    {
      logo: downloadedAssets.logo,
      images: [
        ...downloadedAssets.heroImages,
        ...downloadedAssets.galleryImages,
      ],
    }
  );
  
  // 11. Construir resultado final
  const result: EnhancedExtractedData = {
    ...basicExtractedData,
    extractedSections,
    enhancedColors,
    enhancedTypography,
    downloadedAssets,
    cloningLevel,
    cloningConfig,
  };
  
  console.log('[EnhancedExtractor] Extraction complete!');
  console.log(`  - Sections: ${extractedSections.length}`);
  console.log(`  - Colors: ${enhancedColors.primary} / ${enhancedColors.secondary}`);
  console.log(`  - Assets downloaded: ${downloadedAssets.heroImages.length + downloadedAssets.galleryImages.length}`);
  console.log(`  - Cloning level: ${cloningLevel}`);
  
  return result;
}

/**
 * Genera el prompt enriquecido para el LLM usando los datos mejorados
 */
export function generateEnhancedPrompt(
  data: EnhancedExtractedData,
  userMessage: string
): string {
  const parts: string[] = [];
  
  // Encabezado con nivel de clonación
  const levelSummary = getCloningLevelSummary(data.cloningLevel);
  parts.push(`# ${levelSummary.emoji} Clonación de Web: ${levelSummary.name}`);
  parts.push('');
  parts.push(`**URL Original:** ${data.url}`);
  parts.push(`**Título:** ${data.title}`);
  parts.push('');
  parts.push(`> ${levelSummary.description}`);
  parts.push('');
  
  // Instrucciones de clonación generadas por el sistema
  parts.push(data.cloningConfig.llmInstructions);
  parts.push('');
  
  // Secciones extraídas
  if (data.extractedSections.length > 0) {
    parts.push('## 📐 ESTRUCTURA DETECTADA');
    parts.push('');
    parts.push('Secciones encontradas en orden:');
    data.extractedSections.forEach((section, i) => {
      parts.push(`${i + 1}. **${section.type}** - ${section.content?.title || 'Sin título'}`);
      if (section.content?.description) {
        parts.push(`   > ${section.content.description.substring(0, 100)}...`);
      }
    });
    parts.push('');
  }
  
  // Assets descargados
  if (data.downloadedAssets.logo || data.downloadedAssets.heroImages.length > 0) {
    parts.push('## 🖼️ ASSETS DESCARGADOS');
    parts.push('');
    if (data.downloadedAssets.logo) {
      parts.push(`- **Logo:** ${data.downloadedAssets.logo.storedUrl}`);
    }
    if (data.downloadedAssets.heroImages.length > 0) {
      parts.push(`- **Imágenes Hero:** ${data.downloadedAssets.heroImages.map(i => i.storedUrl).join(', ')}`);
    }
    if (data.downloadedAssets.galleryImages.length > 0) {
      parts.push(`- **Galería:** ${data.downloadedAssets.galleryImages.length} imágenes`);
    }
    parts.push('');
    parts.push('**IMPORTANTE:** Usa estas URLs locales en lugar de las originales.');
    parts.push('');
  }
  
  // Industria detectada
  if (data.industry.detected && data.industry.patternName) {
    parts.push('## 🏢 INDUSTRIA DETECTADA');
    parts.push('');
    parts.push(`- **Patrón:** ${data.industry.patternName}`);
    parts.push(`- **Confianza:** ${data.industry.confidence}`);
    parts.push('');
    parts.push('Usa las secciones y variantes típicas de esta industria.');
    parts.push('');
  }
  
  // Qué se copia y qué es nuevo
  parts.push('## ✅ QUÉ SE COPIA');
  levelSummary.whatsCopied.forEach(item => {
    parts.push(`- ${item}`);
  });
  parts.push('');
  
  parts.push('## 🆕 QUÉ ES NUEVO');
  levelSummary.whatsNew.forEach(item => {
    parts.push(`- ${item}`);
  });
  parts.push('');
  
  // Mensaje original del usuario
  parts.push('## 💬 SOLICITUD DEL USUARIO');
  parts.push('');
  parts.push(`> ${userMessage}`);
  parts.push('');
  
  // Instrucciones finales críticas
  parts.push('## ⚠️ INSTRUCCIONES CRÍTICAS');
  parts.push('');
  parts.push('1. **OBLIGATORIO:** Usa los colores EXACTOS proporcionados arriba');
  parts.push('2. **OBLIGATORIO:** Mantén el orden de secciones detectado');
  parts.push('3. **OBLIGATORIO:** Usa las imágenes descargadas si están disponibles');
  parts.push(`4. **OBLIGATORIO:** Todo el contenido en ${data.language.detected === 'es' ? 'ESPAÑOL' : data.language.detected === 'en' ? 'INGLÉS' : data.language.detected.toUpperCase()}`);
  parts.push('5. Genera un JSON válido con type: "landing"');
  parts.push('');
  
  return parts.join('\n');
}

/**
 * Extrae servicios del contenido scrapeado
 */
function extractServices(
  scraped: ScrapedWebsite, 
  visual: VisualAnalysis
): Array<{ name: string; description?: string; price?: string }> {
  const services: Array<{ name: string; description?: string; price?: string }> = [];
  
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
 * Genera un resumen amigable para mostrar al usuario
 */
export function generateUserFriendlySummary(data: EnhancedExtractedData): string {
  const levelSummary = getCloningLevelSummary(data.cloningLevel);
  
  const parts: string[] = [];
  parts.push(`${levelSummary.emoji} **Nivel de clonación:** ${levelSummary.name}`);
  parts.push('');
  parts.push(`He analizado la página **${data.title || data.url}** y extraído:`);
  parts.push('');
  parts.push(`- 🎨 **Colores:** ${data.enhancedColors.primary}, ${data.enhancedColors.secondary}, ${data.enhancedColors.accent}`);
  parts.push(`- 📝 **Tipografía:** ${data.enhancedTypography.headingFont} / ${data.enhancedTypography.bodyFont}`);
  parts.push(`- 📐 **Secciones:** ${data.extractedSections.length} detectadas`);
  parts.push(`- 🖼️ **Imágenes:** ${data.downloadedAssets.heroImages.length + data.downloadedAssets.galleryImages.length} descargadas`);
  
  if (data.industry.detected) {
    parts.push(`- 🏢 **Industria:** ${data.industry.patternName}`);
  }
  
  parts.push('');
  parts.push(levelSummary.description);
  
  return parts.join('\n');
}
