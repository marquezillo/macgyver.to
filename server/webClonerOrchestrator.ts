/**
 * Web Cloner Orchestrator - Orquesta todo el proceso de clonación
 * Integra: scraping, análisis visual, extracción y generación de config
 */

import { scrapeWebsite, type ScrapedWebsite } from './webCloner';
import { analyzeScreenshot, mergeAnalysis, type VisualAnalysis, type DetectedSection } from './visualAnalyzer';
import { detectCloneIntent } from './cloneIntentDetector';

// Tipos locales para la configuración de landing clonada
export interface LandingConfig {
  id: string;
  name: string;
  sections: SectionConfig[];
  theme: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      foreground: string;
      muted: string;
      border: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
    borderRadius: string;
    darkMode: boolean;
  };
  metadata?: {
    sourceUrl?: string;
    clonedAt?: string;
    originalTitle?: string;
  };
}

export interface SectionConfig {
  id: string;
  type: string;
  order: number;
  data: Record<string, unknown>;
}

export interface CloneResult {
  success: boolean;
  landingConfig?: LandingConfig;
  error?: string;
  sourceUrl: string;
  analysisDetails?: {
    sectionsDetected: number;
    colorsExtracted: string[];
    fontsDetected: string[];
  };
}

/**
 * Proceso completo de clonación de una web
 */
export async function cloneWebsite(url: string, userMessage?: string): Promise<CloneResult> {
  console.log(`[WebClonerOrchestrator] Iniciando clonación de: ${url}`);
  
  try {
    // 1. Scraping de la web
    console.log('[WebClonerOrchestrator] Paso 1: Scraping...');
    const scraped = await scrapeWebsite(url);
    
    // 2. Análisis visual del screenshot
    console.log('[WebClonerOrchestrator] Paso 2: Análisis visual...');
    const screenshotBase64 = scraped.screenshot.toString('base64');
    const visualAnalysis = await analyzeScreenshot(screenshotBase64);
    
    // 3. Combinar análisis
    console.log('[WebClonerOrchestrator] Paso 3: Combinando análisis...');
    const merged = mergeAnalysis(visualAnalysis, scraped);
    
    // 4. Generar configuración de landing
    console.log('[WebClonerOrchestrator] Paso 4: Generando configuración...');
    const landingConfig = generateLandingConfig(merged, visualAnalysis, scraped, userMessage);
    
    console.log('[WebClonerOrchestrator] Clonación completada exitosamente');
    
    return {
      success: true,
      landingConfig,
      sourceUrl: url,
      analysisDetails: {
        sectionsDetected: visualAnalysis.sections.length,
        colorsExtracted: [
          merged.styles.colors.primary,
          merged.styles.colors.secondary,
          merged.styles.colors.accent,
        ],
        fontsDetected: scraped.assets.fonts,
      },
    };
  } catch (error) {
    console.error('[WebClonerOrchestrator] Error en clonación:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      sourceUrl: url,
    };
  }
}

/**
 * Genera la configuración de landing basada en el análisis
 */
function generateLandingConfig(
  merged: ReturnType<typeof mergeAnalysis>,
  visual: VisualAnalysis,
  scraped: ScrapedWebsite,
  userMessage?: string
): LandingConfig {
  const sections: SectionConfig[] = [];
  
  // Mapear secciones detectadas a configuración
  for (const section of visual.sections) {
    const sectionConfig = mapSectionToConfig(section, merged.content, scraped, visual);
    if (sectionConfig) {
      sections.push(sectionConfig);
    }
  }
  
  // Si no se detectaron secciones, usar estructura por defecto
  if (sections.length === 0) {
    sections.push(...getDefaultSections(merged.content, scraped));
  }
  
  return {
    id: `cloned-${Date.now()}`,
    name: scraped.title || 'Cloned Landing',
    sections,
    theme: {
      colors: {
        primary: merged.styles.colors.primary,
        secondary: merged.styles.colors.secondary,
        accent: merged.styles.colors.accent,
        background: merged.styles.colors.background,
        foreground: merged.styles.colors.foreground,
        muted: merged.styles.colors.muted,
        border: merged.styles.colors.border,
      },
      fonts: {
        heading: merged.styles.typography.headingFamily,
        body: merged.styles.typography.fontFamily,
      },
      borderRadius: merged.styles.borders.radius,
      darkMode: visual.style.darkMode,
    },
    metadata: {
      sourceUrl: scraped.url,
      clonedAt: new Date().toISOString(),
      originalTitle: scraped.title,
    },
  };
}

/**
 * Mapea una sección detectada a configuración de componente
 */
function mapSectionToConfig(
  section: DetectedSection,
  content: ReturnType<typeof mergeAnalysis>['content'],
  scraped: ScrapedWebsite,
  visual: VisualAnalysis
): SectionConfig | null {
  const baseConfig = {
    id: `section-${section.position}`,
    order: section.position,
  };
  
  switch (section.type) {
    case 'header':
      return {
        ...baseConfig,
        type: 'header',
        data: {
          logo: content.header?.logo || '',
          navItems: content.header?.navItems || [],
          variant: section.variant || 'default',
        },
      };
      
    case 'hero':
      return {
        ...baseConfig,
        type: 'hero',
        data: {
          title: content.hero?.title || scraped.title || 'Welcome',
          subtitle: content.hero?.subtitle || scraped.description || '',
          primaryCTA: content.hero?.primaryCTA || { text: 'Get Started', href: '#' },
          secondaryCTA: content.hero?.secondaryCTA,
          image: content.hero?.image || scraped.assets.images[0]?.src || '',
          variant: mapHeroVariant(section.variant),
          backgroundColor: visual.style.darkMode ? '#0f172a' : '#ffffff',
          accentColor: visual.colorPalette.primary,
        },
      };
      
    case 'features':
      return {
        ...baseConfig,
        type: 'features',
        data: {
          title: 'Features',
          subtitle: 'What we offer',
          items: content.features || [
            { title: 'Feature 1', description: 'Description 1', icon: 'star' },
            { title: 'Feature 2', description: 'Description 2', icon: 'zap' },
            { title: 'Feature 3', description: 'Description 3', icon: 'shield' },
          ],
          variant: mapFeaturesVariant(section.variant),
          columns: content.features?.length === 4 ? 4 : 3,
        },
      };
      
    case 'testimonials':
      return {
        ...baseConfig,
        type: 'testimonials',
        data: {
          title: 'What Our Customers Say',
          subtitle: 'Trusted by thousands',
          testimonials: content.testimonials || [
            { quote: 'Great product!', name: 'John Doe', role: 'CEO', avatar: '' },
          ],
          variant: section.variant || 'grid',
        },
      };
      
    case 'pricing':
      return {
        ...baseConfig,
        type: 'pricing',
        data: {
          title: 'Pricing',
          subtitle: 'Choose your plan',
          plans: content.pricing || [
            { name: 'Basic', price: '$9', period: '/month', features: ['Feature 1'], highlighted: false },
            { name: 'Pro', price: '$29', period: '/month', features: ['Feature 1', 'Feature 2'], highlighted: true },
          ],
          variant: section.variant || 'cards',
        },
      };
      
    case 'faq':
      return {
        ...baseConfig,
        type: 'faq',
        data: {
          title: 'Frequently Asked Questions',
          subtitle: '',
          items: content.faq || [
            { question: 'Question 1?', answer: 'Answer 1' },
          ],
          variant: section.variant || 'accordion',
        },
      };
      
    case 'cta':
      return {
        ...baseConfig,
        type: 'cta',
        data: {
          title: content.cta?.title || 'Ready to get started?',
          subtitle: content.cta?.subtitle || 'Join thousands of satisfied customers',
          buttonText: content.cta?.buttonText || 'Get Started',
          variant: section.variant || 'centered',
          backgroundColor: visual.colorPalette.primary,
        },
      };
      
    case 'footer':
      return {
        ...baseConfig,
        type: 'footer',
        data: {
          logo: content.header?.logo || '',
          columns: content.footer?.columns || [],
          copyright: content.footer?.copyright || `© ${new Date().getFullYear()} All rights reserved.`,
          variant: section.variant || 'columns',
        },
      };
      
    case 'stats':
      return {
        ...baseConfig,
        type: 'stats',
        data: {
          stats: [
            { value: '100+', label: 'Customers' },
            { value: '50+', label: 'Countries' },
            { value: '99%', label: 'Satisfaction' },
          ],
          variant: section.variant || 'inline',
        },
      };
      
    case 'gallery':
      return {
        ...baseConfig,
        type: 'gallery',
        data: {
          title: 'Gallery',
          images: scraped.assets.images.slice(0, 6).map(img => ({
            src: img.src,
            alt: img.alt,
          })),
          variant: section.variant || 'grid',
        },
      };
      
    case 'form':
      return {
        ...baseConfig,
        type: 'form',
        data: {
          title: 'Contact Us',
          subtitle: 'Get in touch',
          fields: [
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'message', label: 'Message', type: 'textarea', required: false },
          ],
          submitText: 'Send Message',
          variant: section.variant || 'default',
        },
      };
      
    default:
      return null;
  }
}

/**
 * Mapea variantes de hero detectadas a las disponibles
 */
function mapHeroVariant(variant?: string): string {
  const variantMap: Record<string, string> = {
    'centered': 'centered',
    'center': 'centered',
    'split-left': 'split-left',
    'split-right': 'split-right',
    'split': 'split-left',
    'image-left': 'split-right',
    'image-right': 'split-left',
    'video': 'video',
    'gradient': 'gradient',
    'full-image': 'centered',
  };
  return variantMap[variant?.toLowerCase() || ''] || 'centered';
}

/**
 * Mapea variantes de features detectadas
 */
function mapFeaturesVariant(variant?: string): string {
  const variantMap: Record<string, string> = {
    'grid-3': 'grid',
    'grid-4': 'grid',
    'grid': 'grid',
    'cards': 'cards',
    'list': 'list',
    'icons': 'icons',
    'alternating': 'alternating',
  };
  return variantMap[variant?.toLowerCase() || ''] || 'grid';
}

/**
 * Secciones por defecto si no se detectan
 */
function getDefaultSections(
  content: ReturnType<typeof mergeAnalysis>['content'],
  scraped: ScrapedWebsite
): SectionConfig[] {
  return [
    {
      id: 'section-0',
      type: 'header',
      order: 0,
      data: {
        logo: content.header?.logo || '',
        navItems: content.header?.navItems || [],
        variant: 'default',
      },
    },
    {
      id: 'section-1',
      type: 'hero',
      order: 1,
      data: {
        title: content.hero?.title || scraped.title || 'Welcome',
        subtitle: content.hero?.subtitle || scraped.description || '',
        primaryCTA: { text: 'Get Started', href: '#' },
        variant: 'centered',
      },
    },
    {
      id: 'section-2',
      type: 'features',
      order: 2,
      data: {
        title: 'Features',
        items: content.features || [],
        variant: 'grid',
        columns: 3,
      },
    },
    {
      id: 'section-3',
      type: 'cta',
      order: 3,
      data: {
        title: 'Ready to get started?',
        buttonText: 'Get Started',
        variant: 'centered',
      },
    },
    {
      id: 'section-4',
      type: 'footer',
      order: 4,
      data: {
        copyright: `© ${new Date().getFullYear()} All rights reserved.`,
        columns: [],
        variant: 'simple',
      },
    },
  ];
}

/**
 * Función principal que se integra con el chat
 * Detecta intención y ejecuta clonación si corresponde
 */
export async function processMessageForCloning(message: string): Promise<{
  shouldClone: boolean;
  cloneResult?: CloneResult;
  url?: string;
}> {
  const intent = detectCloneIntent(message);
  
  if (!intent.isCloneRequest || !intent.url) {
    return { shouldClone: false };
  }
  
  console.log(`[WebClonerOrchestrator] Detectada intención de clonar: ${intent.url} (confianza: ${intent.confidence})`);
  
  const cloneResult = await cloneWebsite(intent.url, message);
  
  return {
    shouldClone: true,
    cloneResult,
    url: intent.url,
  };
}
