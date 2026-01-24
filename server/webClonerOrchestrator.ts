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
    
    // 3. Combinar análisis (prioriza HTML para contenido, visual para estructura)
    console.log('[WebClonerOrchestrator] Paso 3: Combinando análisis...');
    const merged = mergeAnalysis(visualAnalysis, scraped);
    
    // 4. Generar configuración de landing
    console.log('[WebClonerOrchestrator] Paso 4: Generando configuración...');
    const landingConfig = generateLandingConfig(merged, visualAnalysis, scraped, userMessage);
    
    console.log('[WebClonerOrchestrator] Clonación completada exitosamente');
    console.log(`[WebClonerOrchestrator] Secciones generadas: ${landingConfig.sections.length}`);
    
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
 * PRIORIZA el contenido extraído del HTML sobre el análisis visual
 */
function generateLandingConfig(
  merged: ReturnType<typeof mergeAnalysis>,
  visual: VisualAnalysis,
  scraped: ScrapedWebsite,
  userMessage?: string
): LandingConfig {
  const sections: SectionConfig[] = [];
  
  // Mapear TODAS las secciones detectadas a configuración
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
  
  // Asegurar que siempre hay header si hay contenido de header
  const hasHeader = sections.some(s => s.type === 'header');
  if (!hasHeader && (merged.content.header?.logo || merged.content.header?.navItems?.length)) {
    sections.unshift({
      id: 'section-header',
      type: 'header',
      order: -1,
      data: {
        logo: merged.content.header?.logo || scraped.assets.images.find(i => i.type === 'logo')?.src || '',
        navItems: merged.content.header?.navItems || [],
        variant: 'default',
      },
    });
  }
  
  // Asegurar que siempre hay features si hay contenido de features
  const hasFeatures = sections.some(s => s.type === 'features');
  if (!hasFeatures && merged.content.features && merged.content.features.length > 0) {
    const featuresOrder = sections.length > 0 ? Math.max(...sections.map(s => s.order)) + 1 : 2;
    sections.push({
      id: 'section-features',
      type: 'features',
      order: featuresOrder,
      data: {
        title: 'Features',
        subtitle: 'What we offer',
        items: merged.content.features.map((f, i) => ({
          title: f.title || `Feature ${i + 1}`,
          description: f.description || '',
          icon: getIconForFeature(f.title, i),
        })),
        variant: 'grid',
        columns: merged.content.features.length === 4 ? 4 : 3,
      },
    });
  }
  
  // Asegurar que siempre hay footer
  const hasFooter = sections.some(s => s.type === 'footer');
  if (!hasFooter) {
    const footerOrder = sections.length > 0 ? Math.max(...sections.map(s => s.order)) + 1 : 10;
    sections.push({
      id: 'section-footer',
      type: 'footer',
      order: footerOrder,
      data: {
        logo: merged.content.header?.logo || '',
        columns: merged.content.footer?.columns || [],
        copyright: merged.content.footer?.copyright || `© ${new Date().getFullYear()} All rights reserved.`,
        variant: 'simple',
      },
    });
  }
  
  // Reordenar secciones por order
  sections.sort((a, b) => a.order - b.order);
  
  // Renumerar orders para que sean consecutivos
  sections.forEach((section, index) => {
    section.order = index;
  });
  
  // Asegurar que hay FAQ si se detectó en el scraping
  const hasFaq = sections.some(s => s.type === 'faq');
  if (!hasFaq && scraped.content.faq && scraped.content.faq.length > 0) {
    const faqOrder = sections.length > 0 ? Math.max(...sections.map(s => s.order)) + 1 : 5;
    sections.push({
      id: `section-faq`,
      type: 'faq',
      order: faqOrder,
      data: {
        title: 'Frequently Asked Questions',
        subtitle: '',
        items: scraped.content.faq,
        variant: 'accordion',
      },
    });
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
 * PRIORIZA el contenido del HTML sobre el análisis visual
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
          logo: content.header?.logo || scraped.assets.images.find(i => i.type === 'logo')?.src || '',
          navItems: content.header?.navItems || [],
          variant: section.variant || 'default',
        },
      };
      
    case 'hero':
      // PRIORIZAR contenido del HTML sobre el análisis visual
      const heroTitle = content.hero?.title || section.content?.title || scraped.title || 'Welcome';
      const heroSubtitle = content.hero?.subtitle || section.content?.subtitle || scraped.description || '';
      const heroImage = content.hero?.image || 
                        scraped.assets.images.find(i => i.type === 'img')?.src || 
                        '';
      
      // Determinar CTA - priorizar HTML
      let primaryCTA = content.hero?.primaryCTA;
      if (!primaryCTA && section.content?.ctas?.[0]) {
        primaryCTA = { text: section.content.ctas[0].text, href: '#' };
      }
      if (!primaryCTA) {
        // Buscar el primer CTA en el nav como fallback
        const navCTA = content.header?.navItems?.find(item => 
          item.text.toLowerCase().includes('apply') || 
          item.text.toLowerCase().includes('start') ||
          item.text.toLowerCase().includes('get')
        );
        primaryCTA = navCTA ? { text: navCTA.text, href: navCTA.href } : { text: 'Get Started', href: '#' };
      }
      
      let secondaryCTA = content.hero?.secondaryCTA;
      if (!secondaryCTA && section.content?.ctas?.[1]) {
        secondaryCTA = { text: section.content.ctas[1].text, href: '#' };
      }
      
      return {
        ...baseConfig,
        type: 'hero',
        data: {
          title: heroTitle,
          subtitle: heroSubtitle,
          primaryCTA,
          secondaryCTA,
          image: heroImage,
          variant: mapHeroVariant(section.variant),
          backgroundColor: visual.style.darkMode ? '#0f172a' : '#ffffff',
          accentColor: visual.colorPalette.primary,
        },
      };
      
    case 'features':
    case 'process':
    case 'benefits':
      // PRIORIZAR features del HTML sobre el análisis visual
      const htmlFeatures = content.features || [];
      const visualFeatures = section.content?.items || [];
      
      let featureItems: Array<{ title: string; description: string; icon?: string }>;
      
      if (htmlFeatures.length > 0) {
        // Usar features del HTML
        featureItems = htmlFeatures.map((f, i) => ({
          title: f.title || `Feature ${i + 1}`,
          description: f.description || `Description ${i + 1}`,
          icon: getIconForFeature(f.title, i),
        }));
      } else if (visualFeatures.length > 0) {
        // Usar features del análisis visual
        featureItems = visualFeatures.map((f, i) => ({
          title: f.title || `Feature ${i + 1}`,
          description: f.description || `Description ${i + 1}`,
          icon: getIconForFeature(f.title, i),
        }));
      } else {
        // Fallback genérico
        featureItems = [
          { title: 'Feature 1', description: 'Description 1', icon: 'star' },
          { title: 'Feature 2', description: 'Description 2', icon: 'zap' },
          { title: 'Feature 3', description: 'Description 3', icon: 'shield' },
        ];
      }
      
      return {
        ...baseConfig,
        type: 'features',
        data: {
          title: section.content?.title || 'Features',
          subtitle: section.content?.subtitle || 'What we offer',
          items: featureItems,
          variant: mapFeaturesVariant(section.variant),
          columns: featureItems.length === 4 ? 4 : 3,
        },
      };
      
    case 'testimonials':
      // PRIORIZAR testimonios del HTML
      const htmlTestimonials = content.testimonials || [];
      
      return {
        ...baseConfig,
        type: 'testimonials',
        data: {
          title: section.content?.title || 'What Our Customers Say',
          subtitle: section.content?.subtitle || 'Trusted by thousands',
          testimonials: htmlTestimonials.length > 0 ? htmlTestimonials : [
            { quote: 'Great product!', name: 'John Doe', role: 'CEO', avatar: '' },
          ],
          variant: section.variant || 'grid',
        },
      };
      
    case 'pricing':
      // PRIORIZAR pricing del HTML
      const htmlPricing = content.pricing || [];
      
      return {
        ...baseConfig,
        type: 'pricing',
        data: {
          title: section.content?.title || 'Pricing',
          subtitle: section.content?.subtitle || 'Choose your plan',
          plans: htmlPricing.length > 0 ? htmlPricing : [
            { name: 'Basic', price: '$9', period: '/month', features: ['Feature 1'], highlighted: false },
            { name: 'Pro', price: '$29', period: '/month', features: ['Feature 1', 'Feature 2'], highlighted: true },
          ],
          variant: section.variant || 'cards',
        },
      };
      
    case 'faq':
      // PRIORIZAR FAQ del HTML
      const htmlFaq = content.faq || [];
      
      return {
        ...baseConfig,
        type: 'faq',
        data: {
          title: section.content?.title || 'Frequently Asked Questions',
          subtitle: section.content?.subtitle || '',
          items: htmlFaq.length > 0 ? htmlFaq : [
            { question: 'Question 1?', answer: 'Answer 1' },
          ],
          variant: section.variant || 'accordion',
        },
      };
      
    case 'cta':
      // Usar contenido del HTML o visual
      const ctaTitle = content.cta?.title || section.content?.title || 'Ready to get started?';
      const ctaSubtitle = content.cta?.subtitle || section.content?.subtitle || 'Join thousands of satisfied customers';
      const ctaButton = section.content?.ctas?.[0]?.text || content.cta?.buttonText || 'Get Started';
      
      return {
        ...baseConfig,
        type: 'cta',
        data: {
          title: ctaTitle,
          subtitle: ctaSubtitle,
          buttonText: ctaButton,
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
      // Extraer stats del contenido del análisis visual si está disponible
      const statsItems = section.content?.items?.map(item => ({
        value: item.title,
        label: item.description,
      })) || [
        { value: '100+', label: 'Customers' },
        { value: '50+', label: 'Countries' },
        { value: '99%', label: 'Satisfaction' },
      ];
      
      return {
        ...baseConfig,
        type: 'stats',
        data: {
          stats: statsItems,
          variant: section.variant || 'inline',
        },
      };
      
    case 'gallery':
      return {
        ...baseConfig,
        type: 'gallery',
        data: {
          title: section.content?.title || 'Gallery',
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
          title: section.content?.title || 'Contact Us',
          subtitle: section.content?.subtitle || 'Get in touch',
          fields: [
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'message', label: 'Message', type: 'textarea', required: false },
          ],
          submitText: section.content?.ctas?.[0]?.text || 'Send Message',
          variant: section.variant || 'default',
        },
      };
      
    case 'about':
      return {
        ...baseConfig,
        type: 'about',
        data: {
          title: section.content?.title || 'About Us',
          description: section.content?.subtitle || section.description || '',
          image: scraped.assets.images.find(i => i.type === 'img')?.src || '',
          variant: section.variant || 'default',
        },
      };
      
    case 'logos':
      return {
        ...baseConfig,
        type: 'logos',
        data: {
          title: section.content?.title || 'Trusted By',
          logos: scraped.assets.images.filter(i => i.type === 'logo').slice(0, 6).map(img => ({
            src: img.src,
            alt: img.alt,
          })),
          variant: section.variant || 'default',
        },
      };
      
    default:
      // Para tipos desconocidos, intentar mapear a un tipo conocido
      console.log(`[WebClonerOrchestrator] Tipo de sección desconocido: ${section.type}`);
      return null;
  }
}

/**
 * Obtiene un icono apropiado para una feature basado en su título
 */
function getIconForFeature(title: string, index: number): string {
  const titleLower = (title || '').toLowerCase();
  
  // Mapeo de palabras clave a iconos
  const iconMap: Record<string, string> = {
    'fast': 'zap',
    'quick': 'zap',
    'speed': 'zap',
    'secure': 'shield',
    'security': 'shield',
    'safe': 'shield',
    'support': 'headphones',
    'help': 'help-circle',
    '24/7': 'clock',
    'time': 'clock',
    'easy': 'check-circle',
    'simple': 'check-circle',
    'document': 'file-text',
    'form': 'file-text',
    'email': 'mail',
    'refund': 'refresh-cw',
    'money': 'dollar-sign',
    'price': 'dollar-sign',
    'global': 'globe',
    'world': 'globe',
    'travel': 'plane',
    'flight': 'plane',
    'step': 'list',
    'process': 'list',
    'apply': 'file-plus',
    'fill': 'edit',
    'complete': 'check',
    'submit': 'send',
    'receive': 'inbox',
    'download': 'download',
    'print': 'printer',
    'mobile': 'smartphone',
    'phone': 'smartphone',
  };
  
  for (const [keyword, icon] of Object.entries(iconMap)) {
    if (titleLower.includes(keyword)) {
      return icon;
    }
  }
  
  // Iconos por defecto según posición
  const defaultIcons = ['star', 'zap', 'shield', 'check-circle', 'heart', 'award'];
  return defaultIcons[index % defaultIcons.length];
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
    'horizontal': 'split-left',
    'horizontal-nav': 'centered',
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
    'horizontal': 'grid',
    'three-column': 'grid',
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
        primaryCTA: content.hero?.primaryCTA || { text: 'Get Started', href: '#' },
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
