/**
 * Visual Analyzer - Análisis de screenshots con GPT-4 Vision
 * Detecta secciones, colores, tipografías y estructura visual
 */

import { invokeLLM } from './_core/llm';
import type { ScrapedWebsite, ExtractedStyles, ExtractedContent } from './webCloner';

export interface VisualAnalysis {
  sections: DetectedSection[];
  colorPalette: ColorPalette;
  typography: TypographyAnalysis;
  layout: LayoutAnalysis;
  style: StyleAnalysis;
}

export interface DetectedSection {
  type: 'header' | 'hero' | 'features' | 'testimonials' | 'pricing' | 'faq' | 'cta' | 'footer' | 'gallery' | 'stats' | 'about' | 'form' | 'process' | 'benefits' | 'logos' | 'unknown';
  position: number; // Orden en la página (0 = primero)
  variant?: string; // Variante del componente (centered, split-left, etc.)
  description: string;
  content?: {
    title?: string;
    subtitle?: string;
    items?: Array<{ title: string; description: string }>;
    ctas?: Array<{ text: string; style: 'primary' | 'secondary' }>;
  };
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  success?: string;
  warning?: string;
  error?: string;
}

export interface TypographyAnalysis {
  headingFont: string;
  bodyFont: string;
  headingWeight: string;
  style: 'modern' | 'classic' | 'playful' | 'elegant' | 'bold' | 'minimal';
}

export interface LayoutAnalysis {
  containerWidth: 'narrow' | 'medium' | 'wide' | 'full';
  spacing: 'compact' | 'normal' | 'spacious';
  alignment: 'left' | 'center' | 'mixed';
}

export interface StyleAnalysis {
  overall: 'minimal' | 'modern' | 'corporate' | 'creative' | 'elegant' | 'bold' | 'playful';
  hasGradients: boolean;
  hasShadows: boolean;
  hasAnimations: boolean;
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
  darkMode: boolean;
}

/**
 * Analiza un screenshot con GPT-4 Vision para extraer información visual
 */
export async function analyzeScreenshot(screenshotBase64: string): Promise<VisualAnalysis> {
  console.log('[VisualAnalyzer] Analizando screenshot con GPT-4 Vision...');
  
  const prompt = `You are an expert web designer analyzing a landing page screenshot. Your task is to extract EXACT information from the image.

## CRITICAL INSTRUCTIONS - READ CAREFULLY:

### 1. TEXT EXTRACTION (MOST IMPORTANT)
- You MUST read and transcribe the EXACT text visible in the image
- DO NOT invent, paraphrase, or create generic text
- If you see "Thailand Digital Arrival Card" - write EXACTLY that
- If you see "Apply Now" on a button - write EXACTLY "Apply Now"
- Copy text CHARACTER BY CHARACTER from the image

### 2. COLOR EXTRACTION
- Look at the MAIN CALL-TO-ACTION BUTTON - what color is it? That's the PRIMARY color
- Look at the page background - that's the BACKGROUND color
- Look at the main heading text - that's the FOREGROUND color
- Be PRECISE with hex codes - if a button is red, it's NOT #3B82F6 (blue)
- Common colors: Red=#DC2626, Blue=#3B82F6, Green=#10B981, Purple=#8B5CF6

### 3. LAYOUT DETECTION
- "split-left" = TEXT on LEFT side, IMAGE on RIGHT side
- "split-right" = IMAGE on LEFT side, TEXT on RIGHT side
- "centered" = Text centered, image as background or below text
- Look at WHERE the main image is positioned relative to the headline

### 4. SECTION DETECTION
- List EVERY distinct section from TOP to BOTTOM
- Include: header, hero, features, testimonials, pricing, faq, cta, footer, stats, etc.

## OUTPUT FORMAT (JSON):

{
  "sections": [
    {
      "type": "hero",
      "position": 1,
      "variant": "split-left or split-right or centered",
      "description": "Brief description of what you see",
      "content": {
        "title": "EXACT headline text from the image - copy it exactly",
        "subtitle": "EXACT subheadline text from the image - copy it exactly",
        "ctas": [
          {"text": "EXACT button text", "style": "primary"},
          {"text": "EXACT second button text if exists", "style": "secondary"}
        ]
      }
    }
  ],
  "colorPalette": {
    "primary": "#XXXXXX - color of main CTA button",
    "secondary": "#XXXXXX - secondary color",
    "accent": "#XXXXXX - accent/highlight color",
    "background": "#XXXXXX - main page background",
    "foreground": "#XXXXXX - main text color",
    "muted": "#XXXXXX - secondary text color"
  },
  "typography": {
    "headingFont": "font name or serif/sans-serif",
    "bodyFont": "font name",
    "headingWeight": "bold|semibold|normal",
    "style": "modern|classic|playful|elegant|bold|minimal"
  },
  "layout": {
    "containerWidth": "narrow|medium|wide|full",
    "spacing": "compact|normal|spacious",
    "alignment": "left|center|mixed"
  },
  "style": {
    "overall": "minimal|modern|corporate|creative|elegant|bold|playful",
    "hasGradients": boolean,
    "hasShadows": boolean,
    "hasAnimations": boolean,
    "borderRadius": "none|small|medium|large|full",
    "darkMode": boolean
  }
}

## FINAL REMINDER:
- TRANSCRIBE text exactly as shown - do NOT make up generic content
- If the hero says "Thailand Digital Arrival Card" - that's what you write
- If a button says "Apply For Thailand Digital Arrival Card" - copy it exactly
- LOOK at the actual button color - if it's red/maroon, the primary color is red, NOT blue

Return ONLY valid JSON, no explanations.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${screenshotBase64}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
    });

    const rawContent = response.choices[0]?.message?.content || '{}';
    const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);
    
    // Limpiar el JSON (remover markdown si existe)
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                      content.match(/```\s*([\s\S]*?)\s*```/) ||
                      [null, content];
    const jsonStr = jsonMatch[1] || content;
    
    const analysis = JSON.parse(jsonStr.trim()) as VisualAnalysis;
    
    console.log('[VisualAnalyzer] Análisis completado:', {
      sections: analysis.sections?.length || 0,
      style: analysis.style?.overall,
      primaryColor: analysis.colorPalette?.primary,
      heroTitle: analysis.sections?.find(s => s.type === 'hero')?.content?.title?.substring(0, 30),
    });
    
    return analysis;
  } catch (error) {
    console.error('[VisualAnalyzer] Error en análisis:', error);
    // Retornar análisis por defecto
    return getDefaultAnalysis();
  }
}

/**
 * Combina el análisis visual con los datos extraídos del HTML
 * PRIORIZA el contenido del HTML sobre el análisis visual para texto
 * PRIORIZA el análisis visual para colores y estructura
 */
export function mergeAnalysis(
  visual: VisualAnalysis,
  scraped: ScrapedWebsite
): {
  styles: ExtractedStyles;
  sections: DetectedSection[];
  content: ExtractedContent;
} {
  // Para colores: priorizar análisis visual si parece válido, sino usar scraping
  const visualPrimaryValid = visual.colorPalette.primary && 
                             visual.colorPalette.primary !== '#3B82F6' && // No es el default
                             visual.colorPalette.primary.startsWith('#');
  
  const styles: ExtractedStyles = {
    colors: {
      primary: visualPrimaryValid ? visual.colorPalette.primary : scraped.styles.colors.primary,
      secondary: visual.colorPalette.secondary || scraped.styles.colors.secondary,
      accent: visual.colorPalette.accent || scraped.styles.colors.accent,
      background: visual.colorPalette.background || scraped.styles.colors.background,
      foreground: visual.colorPalette.foreground || scraped.styles.colors.foreground,
      muted: visual.colorPalette.muted || scraped.styles.colors.muted,
      border: scraped.styles.colors.border,
    },
    typography: {
      // Priorizar fuentes del scraping (más precisas)
      fontFamily: scraped.styles.typography.fontFamily || visual.typography.bodyFont,
      headingFamily: scraped.styles.typography.headingFamily || visual.typography.headingFont,
      sizes: scraped.styles.typography.sizes,
    },
    spacing: {
      sectionPadding: visual.layout.spacing === 'spacious' ? '120px' : 
                      visual.layout.spacing === 'compact' ? '60px' : '80px',
      containerMaxWidth: visual.layout.containerWidth === 'wide' ? '1400px' :
                         visual.layout.containerWidth === 'narrow' ? '1000px' : '1280px',
    },
    borders: {
      radius: visual.style.borderRadius === 'large' ? '16px' :
              visual.style.borderRadius === 'full' ? '9999px' :
              visual.style.borderRadius === 'small' ? '4px' :
              visual.style.borderRadius === 'none' ? '0px' : '8px',
    },
  };

  // Para contenido: PRIORIZAR el contenido extraído del HTML
  const enrichedContent = { ...scraped.content };
  
  // Solo usar contenido del análisis visual si el HTML no tiene nada
  const heroSection = visual.sections.find(s => s.type === 'hero');
  if (heroSection?.content) {
    // Inicializar hero si no existe
    if (!enrichedContent.hero) {
      enrichedContent.hero = {
        title: '',
        subtitle: '',
      };
    }
    
    // Solo usar título del visual si el HTML no tiene uno válido
    if (!enrichedContent.hero.title || enrichedContent.hero.title.length < 5) {
      enrichedContent.hero.title = heroSection.content.title || '';
    }
    
    // Solo usar subtitle del visual si el HTML no tiene uno válido
    if (!enrichedContent.hero.subtitle || enrichedContent.hero.subtitle.length < 10) {
      enrichedContent.hero.subtitle = heroSection.content.subtitle || '';
    }
    
    // Solo usar CTAs del visual si el HTML no tiene
    if (!enrichedContent.hero.primaryCTA && heroSection.content.ctas?.[0]) {
      enrichedContent.hero.primaryCTA = { text: heroSection.content.ctas[0].text, href: '#' };
    }
    if (!enrichedContent.hero.secondaryCTA && heroSection.content.ctas?.[1]) {
      enrichedContent.hero.secondaryCTA = { text: heroSection.content.ctas[1].text, href: '#' };
    }
  }

  // Para features: priorizar HTML si tiene contenido
  const featuresSection = visual.sections.find(s => s.type === 'features' || s.type === 'process' || s.type === 'benefits');
  if ((!enrichedContent.features || enrichedContent.features.length === 0) && 
      featuresSection?.content?.items && featuresSection.content.items.length > 0) {
    enrichedContent.features = featuresSection.content.items.map(item => ({
      title: item.title,
      description: item.description,
    }));
  }

  return {
    styles,
    sections: visual.sections,
    content: enrichedContent,
  };
}

/**
 * Análisis por defecto cuando falla GPT-4 Vision
 */
function getDefaultAnalysis(): VisualAnalysis {
  return {
    sections: [
      { type: 'header', position: 0, variant: 'default', description: 'Navigation header' },
      { type: 'hero', position: 1, variant: 'centered', description: 'Hero section' },
      { type: 'features', position: 2, variant: 'grid-3', description: 'Features grid' },
      { type: 'testimonials', position: 3, variant: 'carousel', description: 'Testimonials' },
      { type: 'cta', position: 4, variant: 'centered', description: 'Call to action' },
      { type: 'footer', position: 5, variant: 'default', description: 'Footer' },
    ],
    colorPalette: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#8b5cf6',
      background: '#ffffff',
      foreground: '#1f2937',
      muted: '#6b7280',
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      headingWeight: 'bold',
      style: 'modern',
    },
    layout: {
      containerWidth: 'medium',
      spacing: 'normal',
      alignment: 'center',
    },
    style: {
      overall: 'modern',
      hasGradients: false,
      hasShadows: true,
      hasAnimations: false,
      borderRadius: 'medium',
      darkMode: false,
    },
  };
}
