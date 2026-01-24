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
  type: 'header' | 'hero' | 'features' | 'testimonials' | 'pricing' | 'faq' | 'cta' | 'footer' | 'gallery' | 'stats' | 'about' | 'form' | 'unknown';
  position: number; // Orden en la página (0 = primero)
  variant?: string; // Variante del componente (centered, split-left, etc.)
  description: string;
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
  
  const prompt = `Analiza esta captura de pantalla de una landing page y extrae la siguiente información en formato JSON:

1. **sections**: Lista de secciones detectadas en orden de aparición. Para cada sección indica:
   - type: uno de [header, hero, features, testimonials, pricing, faq, cta, footer, gallery, stats, about, form, unknown]
   - position: número de orden (0 = primera sección)
   - variant: variante del diseño (ej: "centered", "split-left", "split-right", "grid-3", "carousel", etc.)
   - description: breve descripción de lo que contiene

2. **colorPalette**: Colores principales detectados en formato HEX:
   - primary: color principal de botones/CTAs
   - secondary: color secundario
   - accent: color de acento
   - background: color de fondo principal
   - foreground: color de texto principal
   - muted: color de texto secundario

3. **typography**:
   - headingFont: nombre de la fuente de títulos (ej: "Inter", "Poppins", "Playfair Display")
   - bodyFont: nombre de la fuente del cuerpo
   - headingWeight: peso de los títulos (ej: "bold", "semibold", "normal")
   - style: estilo general (modern, classic, playful, elegant, bold, minimal)

4. **layout**:
   - containerWidth: ancho del contenedor (narrow, medium, wide, full)
   - spacing: espaciado entre secciones (compact, normal, spacious)
   - alignment: alineación general (left, center, mixed)

5. **style**:
   - overall: estilo general (minimal, modern, corporate, creative, elegant, bold, playful)
   - hasGradients: boolean
   - hasShadows: boolean
   - hasAnimations: boolean (si parece tener animaciones basado en el diseño)
   - borderRadius: radio de bordes (none, small, medium, large, full)
   - darkMode: boolean

Responde SOLO con el JSON válido, sin explicaciones adicionales.`;

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
 */
export function mergeAnalysis(
  visual: VisualAnalysis,
  scraped: ScrapedWebsite
): {
  styles: ExtractedStyles;
  sections: DetectedSection[];
  content: ExtractedContent;
} {
  // Priorizar colores del análisis visual sobre los extraídos del HTML
  const styles: ExtractedStyles = {
    colors: {
      primary: visual.colorPalette.primary || scraped.styles.colors.primary,
      secondary: visual.colorPalette.secondary || scraped.styles.colors.secondary,
      accent: visual.colorPalette.accent || scraped.styles.colors.accent,
      background: visual.colorPalette.background || scraped.styles.colors.background,
      foreground: visual.colorPalette.foreground || scraped.styles.colors.foreground,
      muted: visual.colorPalette.muted || scraped.styles.colors.muted,
      border: scraped.styles.colors.border,
    },
    typography: {
      fontFamily: visual.typography.bodyFont || scraped.styles.typography.fontFamily,
      headingFamily: visual.typography.headingFont || scraped.styles.typography.headingFamily,
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

  return {
    styles,
    sections: visual.sections,
    content: scraped.content,
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
