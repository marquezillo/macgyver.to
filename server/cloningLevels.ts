/**
 * Cloning Levels System - Sistema de 3 niveles de clonación de sitios web
 * 
 * Nivel A: INSPIRACIÓN - Usa colores y estructura similar, contenido nuevo
 * Nivel B: RÉPLICA VISUAL - Casi idéntico visualmente, contenido adaptado
 * Nivel C: COPIA EXACTA - Mismo diseño exacto, contenido del usuario
 */

import type { ExtractedSection } from './structureExtractor';
import type { ExtractedColorPalette, ExtractedTypography } from './colorExtractor';
import type { DownloadedAsset } from './assetDownloader';
import type { ExtractedWebData } from './webDataExtractor';

export type CloningLevel = 'inspiration' | 'replica' | 'exact';

export interface CloningConfig {
  level: CloningLevel;
  // Qué elementos copiar
  copyColors: boolean;
  copyTypography: boolean;
  copyStructure: boolean;
  copyContent: boolean;
  copyImages: boolean;
  copyAnimations: boolean;
  // Personalización
  businessName?: string;
  businessDescription?: string;
  customColors?: Partial<ExtractedColorPalette>;
  customContent?: {
    heroTitle?: string;
    heroSubtitle?: string;
    features?: Array<{ title: string; description: string }>;
  };
}

export interface CloningResult {
  level: CloningLevel;
  levelName: string;
  levelDescription: string;
  // Datos para el generador
  colors: ExtractedColorPalette;
  typography: ExtractedTypography;
  sections: ExtractedSection[];
  content: ExtractedWebData['content'];
  assets: {
    logo?: DownloadedAsset;
    images: DownloadedAsset[];
  };
  // Instrucciones para el LLM
  llmInstructions: string;
  // Metadatos
  originalUrl: string;
  originalTitle: string;
}

/**
 * Detecta el nivel de clonación solicitado por el usuario
 */
export function detectCloningLevel(message: string): CloningLevel {
  const lowerMessage = message.toLowerCase();
  
  // Nivel C: Copia exacta
  const exactKeywords = [
    'copia exacta', 'exact copy', 'idéntic', 'identical', 
    '100%', 'igual', 'mismo diseño', 'same design',
    'réplica exacta', 'exact replica', 'clonar exactamente',
    'clone exactly', 'copiar todo', 'copy everything'
  ];
  
  if (exactKeywords.some(kw => lowerMessage.includes(kw))) {
    return 'exact';
  }
  
  // Nivel B: Réplica visual
  const replicaKeywords = [
    'réplica', 'replica', 'similar', 'parecid',
    'como esta', 'like this', 'estilo de', 'style of',
    'basado en', 'based on', 'inspirado en', 'inspired by',
    'clonar', 'clone', 'copiar', 'copy', 'clona'
  ];
  
  if (replicaKeywords.some(kw => lowerMessage.includes(kw))) {
    return 'replica';
  }
  
  // Nivel A: Inspiración (default)
  return 'inspiration';
}

/**
 * Obtiene la configuración según el nivel de clonación
 */
export function getCloningConfig(level: CloningLevel, customOptions?: Partial<CloningConfig>): CloningConfig {
  const baseConfigs: Record<CloningLevel, CloningConfig> = {
    // Nivel A: Solo colores y estructura general
    inspiration: {
      level: 'inspiration',
      copyColors: true,
      copyTypography: true,
      copyStructure: true,
      copyContent: false,
      copyImages: false,
      copyAnimations: false,
    },
    // Nivel B: Colores, tipografía, estructura y contenido adaptado
    replica: {
      level: 'replica',
      copyColors: true,
      copyTypography: true,
      copyStructure: true,
      copyContent: true,
      copyImages: true,
      copyAnimations: true,
    },
    // Nivel C: Todo exacto
    exact: {
      level: 'exact',
      copyColors: true,
      copyTypography: true,
      copyStructure: true,
      copyContent: true,
      copyImages: true,
      copyAnimations: true,
    },
  };

  return {
    ...baseConfigs[level],
    ...customOptions,
  };
}

/**
 * Genera las instrucciones para el LLM según el nivel de clonación
 */
export function generateCloningInstructions(
  level: CloningLevel,
  extractedData: ExtractedWebData,
  config: CloningConfig
): string {
  const levelDescriptions = {
    inspiration: {
      name: 'INSPIRACIÓN',
      description: 'Crear una landing INSPIRADA en el sitio original, usando sus colores y estructura general pero con contenido completamente nuevo.',
    },
    replica: {
      name: 'RÉPLICA VISUAL',
      description: 'Crear una landing VISUALMENTE SIMILAR al sitio original, manteniendo el diseño y adaptando el contenido al negocio del usuario.',
    },
    exact: {
      name: 'COPIA EXACTA',
      description: 'Crear una landing IDÉNTICA al sitio original, replicando exactamente el diseño, estructura y estilo visual.',
    },
  };

  const levelInfo = levelDescriptions[level];
  const parts: string[] = [];

  parts.push(`## 🎯 NIVEL DE CLONACIÓN: ${levelInfo.name}`);
  parts.push('');
  parts.push(`**Objetivo:** ${levelInfo.description}`);
  parts.push('');
  parts.push(`**URL Original:** ${extractedData.url}`);
  parts.push(`**Título Original:** ${extractedData.title}`);
  parts.push('');

  // Instrucciones de colores
  if (config.copyColors) {
    parts.push('### 🎨 COLORES (OBLIGATORIO USAR ESTOS)');
    parts.push('```');
    parts.push(`Primary: ${extractedData.colors.primary}`);
    parts.push(`Secondary: ${extractedData.colors.secondary}`);
    parts.push(`Accent: ${extractedData.colors.accent}`);
    parts.push(`Background: ${extractedData.colors.background}`);
    parts.push(`Text: ${extractedData.colors.text}`);
    parts.push('```');
    parts.push('');
  }

  // Instrucciones de tipografía
  if (config.copyTypography) {
    parts.push('### 📝 TIPOGRAFÍA');
    parts.push(`- Heading Font: ${extractedData.fonts.heading}`);
    parts.push(`- Body Font: ${extractedData.fonts.body}`);
    parts.push('');
  }

  // Instrucciones de estructura
  if (config.copyStructure) {
    parts.push('### 📐 ESTRUCTURA DE SECCIONES');
    parts.push('Mantener este orden de secciones:');
    
    // Construir lista de secciones desde el contenido
    const sectionOrder = ['header', 'hero'];
    if (extractedData.content.features.length > 0) sectionOrder.push('features');
    if (extractedData.content.testimonials.length > 0) sectionOrder.push('testimonials');
    if (extractedData.content.services.length > 0) sectionOrder.push('services/pricing');
    if (extractedData.content.faq.length > 0) sectionOrder.push('faq');
    sectionOrder.push('cta', 'footer');
    
    parts.push(sectionOrder.map((s, i) => `${i + 1}. ${s}`).join('\n'));
    parts.push('');
  }

  // Instrucciones de contenido según nivel
  if (level === 'inspiration') {
    parts.push('### 📄 CONTENIDO');
    parts.push('**IMPORTANTE:** Genera contenido NUEVO y ORIGINAL para el negocio del usuario.');
    parts.push('NO copies el contenido del sitio original.');
    parts.push('Solo usa la estructura y colores como referencia.');
    parts.push('');
  } else if (level === 'replica') {
    parts.push('### 📄 CONTENIDO');
    parts.push('Adapta el contenido original al negocio del usuario:');
    if (extractedData.content.heroTitle) {
      parts.push(`- Hero original: "${extractedData.content.heroTitle}"`);
    }
    parts.push('- Mantén el tono y estilo del contenido original');
    parts.push('- Adapta los textos al negocio específico del usuario');
    parts.push('');
  } else if (level === 'exact') {
    parts.push('### 📄 CONTENIDO (COPIAR EXACTAMENTE)');
    if (extractedData.content.heroTitle) {
      parts.push(`- Hero Title: "${extractedData.content.heroTitle}"`);
    }
    if (extractedData.content.heroSubtitle) {
      parts.push(`- Hero Subtitle: "${extractedData.content.heroSubtitle}"`);
    }
    if (extractedData.content.features.length > 0) {
      parts.push('- Features:');
      extractedData.content.features.forEach(f => {
        parts.push(`  - ${f.title}: ${f.description}`);
      });
    }
    parts.push('');
  }

  // Instrucciones de imágenes
  if (config.copyImages && extractedData.images.length > 0) {
    parts.push('### 🖼️ IMÁGENES');
    if (level === 'exact') {
      parts.push('Usar las imágenes originales descargadas:');
      extractedData.images.slice(0, 5).forEach(img => {
        parts.push(`- ${img.type}: ${img.src}`);
      });
    } else {
      parts.push('Generar imágenes similares en estilo a las originales.');
      parts.push('Tipos de imágenes detectadas:');
      const imageTypesSet = new Set(extractedData.images.map(i => i.type));
      const imageTypes = Array.from(imageTypesSet);
      imageTypes.forEach(type => {
        parts.push(`- ${type}`);
      });
    }
    parts.push('');
  }

  // Estilo visual
  parts.push('### 🎭 ESTILO VISUAL');
  parts.push(`- Modo: ${extractedData.style.darkMode ? 'Oscuro' : 'Claro'}`);
  parts.push(`- Gradientes: ${extractedData.style.hasGradients ? 'Sí' : 'No'}`);
  parts.push(`- Border Radius: ${extractedData.style.borderRadius}`);
  parts.push('');

  // Idioma
  parts.push('### 🌐 IDIOMA');
  const languageName = extractedData.language.detected === 'es' ? 'Español' : 
                       extractedData.language.detected === 'en' ? 'Inglés' : 
                       extractedData.language.detected;
  parts.push(`**TODO el contenido DEBE estar en ${languageName}**`);
  parts.push('');

  // Reglas finales según nivel
  parts.push('### ⚠️ REGLAS CRÍTICAS');
  if (level === 'inspiration') {
    parts.push('1. USA los colores exactos proporcionados');
    parts.push('2. MANTÉN la estructura de secciones');
    parts.push('3. GENERA contenido nuevo y relevante');
    parts.push('4. NO copies textos del original');
  } else if (level === 'replica') {
    parts.push('1. USA los colores exactos proporcionados');
    parts.push('2. REPLICA la estructura de secciones exactamente');
    parts.push('3. ADAPTA el contenido manteniendo el estilo');
    parts.push('4. USA imágenes similares en estilo');
  } else if (level === 'exact') {
    parts.push('1. USA los colores EXACTOS proporcionados');
    parts.push('2. REPLICA la estructura EXACTAMENTE');
    parts.push('3. COPIA el contenido textual exacto');
    parts.push('4. USA las imágenes originales descargadas');
    parts.push('5. MANTÉN el mismo estilo visual pixel-perfect');
  }

  return parts.join('\n');
}

/**
 * Procesa los datos extraídos según el nivel de clonación
 */
export function processCloningData(
  level: CloningLevel,
  extractedData: ExtractedWebData,
  downloadedAssets: {
    logo?: DownloadedAsset;
    images: DownloadedAsset[];
  },
  config: CloningConfig
): CloningResult {
  const levelNames = {
    inspiration: 'Inspiración',
    replica: 'Réplica Visual',
    exact: 'Copia Exacta',
  };

  const levelDescriptions = {
    inspiration: 'Landing inspirada en el diseño original con contenido nuevo',
    replica: 'Landing visualmente similar con contenido adaptado',
    exact: 'Landing idéntica al original',
  };

  // Procesar colores
  let colors = extractedData.colors as unknown as ExtractedColorPalette;
  if (config.customColors) {
    colors = { ...colors, ...config.customColors };
  }

  // Procesar contenido según nivel
  let content = extractedData.content;
  if (level === 'inspiration' && config.businessName) {
    // Para inspiración, limpiar contenido y usar nombre del negocio
    content = {
      ...content,
      heroTitle: undefined,
      heroSubtitle: undefined,
    };
  }

  // Generar instrucciones
  const llmInstructions = generateCloningInstructions(level, extractedData, config);

  return {
    level,
    levelName: levelNames[level],
    levelDescription: levelDescriptions[level],
    colors,
    typography: {
      headingFont: extractedData.fonts.heading,
      bodyFont: extractedData.fonts.body,
      headingWeight: '700',
      bodyWeight: '400',
      headingSizes: { h1: '48px', h2: '36px', h3: '24px', h4: '20px' },
      bodySize: '16px',
      lineHeight: '1.5',
      letterSpacing: 'normal',
      googleFontsUrls: [],
    },
    sections: [], // Se llenará con structureExtractor
    content,
    assets: downloadedAssets,
    llmInstructions,
    originalUrl: extractedData.url,
    originalTitle: extractedData.title,
  };
}

/**
 * Detecta el nivel de clonación y genera la configuración completa
 */
export function analyzeAndConfigureCloning(
  userMessage: string,
  extractedData: ExtractedWebData,
  downloadedAssets: {
    logo?: DownloadedAsset;
    images: DownloadedAsset[];
  }
): CloningResult {
  // Detectar nivel
  const level = detectCloningLevel(userMessage);
  console.log(`[CloningLevels] Detected level: ${level}`);

  // Extraer nombre del negocio si se proporciona
  const businessNameMatch = userMessage.match(/(?:para|for|de|llamad[oa])\s+["']?([A-Z][\w\s&áéíóúñ]+)["']?/i);
  const businessName = businessNameMatch ? businessNameMatch[1].trim() : undefined;

  // Obtener configuración
  const config = getCloningConfig(level, { businessName });

  // Procesar y retornar resultado
  return processCloningData(level, extractedData, downloadedAssets, config);
}

/**
 * Genera un resumen del nivel de clonación para mostrar al usuario
 */
export function getCloningLevelSummary(level: CloningLevel): {
  emoji: string;
  name: string;
  description: string;
  whatsCopied: string[];
  whatsNew: string[];
} {
  const summaries = {
    inspiration: {
      emoji: '💡',
      name: 'Inspiración',
      description: 'Usamos los colores y estructura como referencia, pero creamos contenido completamente nuevo.',
      whatsCopied: ['Paleta de colores', 'Tipografía', 'Estructura de secciones', 'Estilo visual general'],
      whatsNew: ['Todo el contenido textual', 'Imágenes generadas', 'Textos de CTAs'],
    },
    replica: {
      emoji: '🎨',
      name: 'Réplica Visual',
      description: 'Replicamos el diseño visual y adaptamos el contenido a tu negocio.',
      whatsCopied: ['Paleta de colores', 'Tipografía', 'Estructura exacta', 'Estilo de imágenes', 'Tono del contenido'],
      whatsNew: ['Contenido adaptado a tu negocio', 'Imágenes similares', 'Información de contacto'],
    },
    exact: {
      emoji: '📋',
      name: 'Copia Exacta',
      description: 'Replicamos el sitio exactamente como está, incluyendo contenido e imágenes.',
      whatsCopied: ['Todo: colores, tipografía, estructura', 'Contenido textual exacto', 'Imágenes originales', 'Animaciones y efectos'],
      whatsNew: ['Solo información de contacto si la proporcionas'],
    },
  };

  return summaries[level];
}
