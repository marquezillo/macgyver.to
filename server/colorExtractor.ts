/**
 * Color & Typography Extractor - Extrae colores y fuentes precisas de sitios web
 * Combina análisis de CSS, estilos computados y análisis visual
 */

import type { Page } from 'playwright';

export interface ExtractedColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
  success?: string;
  warning?: string;
  error?: string;
  // Colores adicionales detectados
  additionalColors: string[];
  // Información sobre el tema
  isDark: boolean;
  hasGradients: boolean;
  gradients: string[];
  // CSS variables extraídas del sitio
  cssVariables?: Record<string, string>;
}

export interface ExtractedTypography {
  headingFont: string;
  bodyFont: string;
  headingWeight: string;
  bodyWeight: string;
  headingSizes: {
    h1: string;
    h2: string;
    h3: string;
    h4: string;
  };
  bodySize: string;
  lineHeight: string;
  letterSpacing: string;
  // Google Fonts URLs si se detectan
  googleFontsUrls: string[];
}

/**
 * Extrae la paleta de colores de una página usando Playwright
 */
export async function extractColors(page: Page): Promise<ExtractedColorPalette> {
  console.log('[ColorExtractor] Extracting colors from page...');

  const colorsData = await page.evaluate(`
    (function() {
      // Función para convertir RGB a HEX
      function rgbToHex(rgb) {
        if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return null;
        var match = rgb.match(/\\d+/g);
        if (!match || match.length < 3) return rgb;
        var r = parseInt(match[0]);
        var g = parseInt(match[1]);
        var b = parseInt(match[2]);
        return '#' + [r, g, b].map(function(x) { return x.toString(16).padStart(2, '0'); }).join('');
      }

      // Función para calcular luminosidad
      function getLuminance(hex) {
        if (!hex || !hex.startsWith('#')) return 0.5;
        var r = parseInt(hex.substr(1, 2), 16) / 255;
        var g = parseInt(hex.substr(3, 2), 16) / 255;
        var b = parseInt(hex.substr(5, 2), 16) / 255;
        return 0.299 * r + 0.587 * g + 0.114 * b;
      }

      // Extraer CSS variables del :root y body
      var cssVariables = {};
      var rootStyles = window.getComputedStyle(document.documentElement);
      var commonVarNames = [
        '--primary', '--secondary', '--accent', '--background', '--foreground',
        '--muted', '--border', '--card', '--popover', '--destructive',
        '--color-primary', '--color-secondary', '--color-accent', '--color-background',
        '--color-foreground', '--color-muted', '--color-border',
        '--bg-primary', '--bg-secondary', '--text-primary', '--text-secondary',
        '--brand', '--brand-primary', '--brand-secondary',
        '--theme-primary', '--theme-secondary', '--theme-accent',
        '--surface', '--surface-primary', '--on-surface',
        '--neutral', '--neutral-100', '--neutral-900'
      ];
      
      // Try to get CSS variables from :root
      commonVarNames.forEach(function(varName) {
        var value = rootStyles.getPropertyValue(varName).trim();
        if (value) {
          cssVariables[varName] = value;
        }
      });
      
      // Also scan stylesheets for CSS variable definitions
      try {
        var stylesheets = document.styleSheets;
        for (var s = 0; s < stylesheets.length; s++) {
          try {
            var rules = stylesheets[s].cssRules || stylesheets[s].rules;
            if (rules) {
              for (var r = 0; r < rules.length; r++) {
                var rule = rules[r];
                if (rule.selectorText === ':root' || rule.selectorText === 'html' || rule.selectorText === 'body') {
                  var cssText = rule.cssText;
                  var varMatches = cssText.match(/--[\w-]+:\s*[^;]+/g);
                  if (varMatches) {
                    varMatches.forEach(function(match) {
                      var parts = match.split(':');
                      if (parts.length >= 2) {
                        var name = parts[0].trim();
                        var value = parts.slice(1).join(':').trim();
                        if (value && !cssVariables[name]) {
                          cssVariables[name] = value;
                        }
                      }
                    });
                  }
                }
              }
            }
          } catch (e) {
            // CORS error, skip this stylesheet
          }
        }
      } catch (e) {
        // Ignore stylesheet access errors
      }

      // Recopilar todos los colores usados
      var colorCounts = {};
      var bgColors = {};
      var textColors = {};
      var buttonColors = {};
      var gradients = [];

      // Analizar todos los elementos
      var elements = document.querySelectorAll('*');
      elements.forEach(function(el) {
        var styles = window.getComputedStyle(el);
        
        // Background colors
        var bg = rgbToHex(styles.backgroundColor);
        if (bg && bg !== '#000000' && bg !== '#ffffff') {
          bgColors[bg] = (bgColors[bg] || 0) + 1;
        }
        
        // Text colors
        var color = rgbToHex(styles.color);
        if (color) {
          textColors[color] = (textColors[color] || 0) + 1;
        }
        
        // Gradients
        var bgImage = styles.backgroundImage;
        if (bgImage && bgImage.includes('gradient')) {
          gradients.push(bgImage);
        }
        
        // All colors
        if (bg) colorCounts[bg] = (colorCounts[bg] || 0) + 1;
        if (color) colorCounts[color] = (colorCounts[color] || 0) + 1;
      });

      // Analizar botones específicamente
      var buttons = document.querySelectorAll('button, .btn, [class*="button"], a[class*="btn"], [class*="cta"]');
      buttons.forEach(function(btn) {
        var styles = window.getComputedStyle(btn);
        var bg = rgbToHex(styles.backgroundColor);
        if (bg && bg !== '#000000' && bg !== '#ffffff' && bg !== '#transparent') {
          buttonColors[bg] = (buttonColors[bg] || 0) + 1;
        }
      });

      // Analizar links
      var links = document.querySelectorAll('a');
      var linkColors = {};
      links.forEach(function(link) {
        var styles = window.getComputedStyle(link);
        var color = rgbToHex(styles.color);
        if (color) {
          linkColors[color] = (linkColors[color] || 0) + 1;
        }
      });

      // Determinar colores principales
      var body = document.body;
      var bodyStyles = window.getComputedStyle(body);
      var mainBg = rgbToHex(bodyStyles.backgroundColor) || '#ffffff';
      var mainText = rgbToHex(bodyStyles.color) || '#000000';

      // Encontrar el color de botón más común (primary)
      var primaryColor = '#3b82f6';
      var maxButtonCount = 0;
      Object.keys(buttonColors).forEach(function(color) {
        if (buttonColors[color] > maxButtonCount) {
          maxButtonCount = buttonColors[color];
          primaryColor = color;
        }
      });

      // Si no hay botones, buscar el color más vibrante
      if (maxButtonCount === 0) {
        Object.keys(colorCounts).forEach(function(color) {
          var lum = getLuminance(color);
          if (lum > 0.2 && lum < 0.8 && colorCounts[color] > maxButtonCount) {
            maxButtonCount = colorCounts[color];
            primaryColor = color;
          }
        });
      }

      // Encontrar color secundario (segundo más usado que no sea primary)
      var secondaryColor = '#64748b';
      var sortedColors = Object.keys(colorCounts).sort(function(a, b) {
        return colorCounts[b] - colorCounts[a];
      });
      for (var i = 0; i < sortedColors.length; i++) {
        var c = sortedColors[i];
        if (c !== primaryColor && c !== mainBg && c !== mainText) {
          secondaryColor = c;
          break;
        }
      }

      // Encontrar color de acento (links o hover states)
      var accentColor = primaryColor;
      var maxLinkCount = 0;
      Object.keys(linkColors).forEach(function(color) {
        if (color !== mainText && linkColors[color] > maxLinkCount) {
          maxLinkCount = linkColors[color];
          accentColor = color;
        }
      });

      // Determinar si es modo oscuro
      var isDark = getLuminance(mainBg) < 0.5;

      // Colores adicionales (top 5 más usados)
      var additionalColors = sortedColors
        .filter(function(c) { return c !== primaryColor && c !== secondaryColor && c !== mainBg && c !== mainText; })
        .slice(0, 5);

      // Use CSS variables if available to improve accuracy
      var cssVarKeys = Object.keys(cssVariables);
      if (cssVarKeys.length > 0) {
        // Try to find primary color from CSS variables
        var primaryVars = ['--primary', '--color-primary', '--brand', '--brand-primary', '--theme-primary'];
        for (var pv = 0; pv < primaryVars.length; pv++) {
          if (cssVariables[primaryVars[pv]]) {
            var varValue = cssVariables[primaryVars[pv]];
            // Convert to hex if it's a valid color
            if (varValue.startsWith('#') || varValue.startsWith('rgb')) {
              primaryColor = varValue.startsWith('rgb') ? rgbToHex(varValue) || primaryColor : varValue;
              break;
            }
          }
        }
        
        // Try to find secondary color
        var secondaryVars = ['--secondary', '--color-secondary', '--brand-secondary', '--theme-secondary'];
        for (var sv = 0; sv < secondaryVars.length; sv++) {
          if (cssVariables[secondaryVars[sv]]) {
            var varValue = cssVariables[secondaryVars[sv]];
            if (varValue.startsWith('#') || varValue.startsWith('rgb')) {
              secondaryColor = varValue.startsWith('rgb') ? rgbToHex(varValue) || secondaryColor : varValue;
              break;
            }
          }
        }
        
        // Try to find accent color
        var accentVars = ['--accent', '--color-accent', '--theme-accent'];
        for (var av = 0; av < accentVars.length; av++) {
          if (cssVariables[accentVars[av]]) {
            var varValue = cssVariables[accentVars[av]];
            if (varValue.startsWith('#') || varValue.startsWith('rgb')) {
              accentColor = varValue.startsWith('rgb') ? rgbToHex(varValue) || accentColor : varValue;
              break;
            }
          }
        }
      }

      return {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
        background: mainBg,
        foreground: mainText,
        muted: isDark ? '#9ca3af' : '#6b7280',
        border: isDark ? '#374151' : '#e5e7eb',
        additionalColors: additionalColors,
        isDark: isDark,
        hasGradients: gradients.length > 0,
        gradients: gradients.slice(0, 3),
        cssVariables: cssVariables
      };
    })()
  `);

  const typedColorsData = colorsData as ExtractedColorPalette;
  
  console.log('[ColorExtractor] Extracted colors:', {
    primary: typedColorsData.primary,
    secondary: typedColorsData.secondary,
    isDark: typedColorsData.isDark,
    hasGradients: typedColorsData.hasGradients,
  });

  return typedColorsData;
}

/**
 * Extrae la tipografía de una página usando Playwright
 */
export async function extractTypography(page: Page): Promise<ExtractedTypography> {
  console.log('[ColorExtractor] Extracting typography from page...');

  const typographyData = await page.evaluate(`
    (function() {
      // Función para limpiar nombre de fuente
      function cleanFontName(font) {
        if (!font) return 'Inter';
        return font.split(',')[0].replace(/['"]/g, '').trim();
      }

      // Analizar body
      var body = document.body;
      var bodyStyles = window.getComputedStyle(body);
      var bodyFont = cleanFontName(bodyStyles.fontFamily);
      var bodySize = bodyStyles.fontSize;
      var bodyWeight = bodyStyles.fontWeight;
      var lineHeight = bodyStyles.lineHeight;
      var letterSpacing = bodyStyles.letterSpacing;

      // Analizar headings
      var h1 = document.querySelector('h1');
      var h2 = document.querySelector('h2');
      var h3 = document.querySelector('h3');
      var h4 = document.querySelector('h4');

      var h1Styles = h1 ? window.getComputedStyle(h1) : null;
      var h2Styles = h2 ? window.getComputedStyle(h2) : null;
      var h3Styles = h3 ? window.getComputedStyle(h3) : null;
      var h4Styles = h4 ? window.getComputedStyle(h4) : null;

      var headingFont = h1Styles ? cleanFontName(h1Styles.fontFamily) : bodyFont;
      var headingWeight = h1Styles ? h1Styles.fontWeight : '700';

      // Buscar Google Fonts
      var googleFontsUrls = [];
      var links = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
      links.forEach(function(link) {
        googleFontsUrls.push(link.href);
      });

      // También buscar en @import de stylesheets
      var stylesheets = document.styleSheets;
      for (var i = 0; i < stylesheets.length; i++) {
        try {
          var rules = stylesheets[i].cssRules || stylesheets[i].rules;
          if (rules) {
            for (var j = 0; j < rules.length; j++) {
              var rule = rules[j];
              if (rule.cssText && rule.cssText.includes('fonts.googleapis.com')) {
                var match = rule.cssText.match(/url\\(['"]?([^'"\\)]+)['"]?\\)/);
                if (match && match[1]) {
                  googleFontsUrls.push(match[1]);
                }
              }
            }
          }
        } catch (e) {
          // CORS error, skip
        }
      }

      return {
        headingFont: headingFont,
        bodyFont: bodyFont,
        headingWeight: headingWeight,
        bodyWeight: bodyWeight,
        headingSizes: {
          h1: h1Styles ? h1Styles.fontSize : '48px',
          h2: h2Styles ? h2Styles.fontSize : '36px',
          h3: h3Styles ? h3Styles.fontSize : '24px',
          h4: h4Styles ? h4Styles.fontSize : '20px'
        },
        bodySize: bodySize,
        lineHeight: lineHeight,
        letterSpacing: letterSpacing,
        googleFontsUrls: googleFontsUrls
      };
    })()
  `);

  const typedTypographyData = typographyData as ExtractedTypography;
  
  console.log('[ColorExtractor] Extracted typography:', {
    headingFont: typedTypographyData.headingFont,
    bodyFont: typedTypographyData.bodyFont,
    googleFonts: typedTypographyData.googleFontsUrls.length,
  });

  return typedTypographyData;
}

/**
 * Extrae colores y tipografía combinados
 */
export async function extractColorsAndTypography(page: Page): Promise<{
  colors: ExtractedColorPalette;
  typography: ExtractedTypography;
}> {
  const [colors, typography] = await Promise.all([
    extractColors(page),
    extractTypography(page),
  ]);

  return { colors, typography };
}

/**
 * Genera CSS variables desde los colores extraídos
 */
export function generateCSSVariables(colors: ExtractedColorPalette): string {
  return `
:root {
  --color-primary: ${colors.primary};
  --color-secondary: ${colors.secondary};
  --color-accent: ${colors.accent};
  --color-background: ${colors.background};
  --color-foreground: ${colors.foreground};
  --color-muted: ${colors.muted};
  --color-border: ${colors.border};
  ${colors.success ? `--color-success: ${colors.success};` : ''}
  ${colors.warning ? `--color-warning: ${colors.warning};` : ''}
  ${colors.error ? `--color-error: ${colors.error};` : ''}
}
`.trim();
}

/**
 * Genera el link de Google Fonts desde la tipografía extraída
 */
export function generateGoogleFontsLink(typography: ExtractedTypography): string {
  const fonts = new Set<string>();
  
  // Añadir fuentes detectadas
  if (typography.headingFont && typography.headingFont !== 'Inter') {
    fonts.add(typography.headingFont);
  }
  if (typography.bodyFont && typography.bodyFont !== 'Inter' && typography.bodyFont !== typography.headingFont) {
    fonts.add(typography.bodyFont);
  }

  if (fonts.size === 0) {
    return '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">';
  }

  const fontParams = Array.from(fonts)
    .map(font => `family=${font.replace(/\s+/g, '+')}:wght@400;500;600;700`)
    .join('&');

  return `<link href="https://fonts.googleapis.com/css2?${fontParams}&display=swap" rel="stylesheet">`;
}

/**
 * Convierte un color HEX a HSL
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  // Remove #
  hex = hex.replace('#', '');
  
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Genera variantes de un color (más claro, más oscuro)
 */
export function generateColorVariants(hex: string): {
  lighter: string;
  light: string;
  base: string;
  dark: string;
  darker: string;
} {
  const hsl = hexToHsl(hex);
  
  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  return {
    lighter: hslToHex(hsl.h, hsl.s, Math.min(95, hsl.l + 30)),
    light: hslToHex(hsl.h, hsl.s, Math.min(85, hsl.l + 15)),
    base: hex,
    dark: hslToHex(hsl.h, hsl.s, Math.max(15, hsl.l - 15)),
    darker: hslToHex(hsl.h, hsl.s, Math.max(5, hsl.l - 30)),
  };
}

/**
 * Determina si dos colores tienen suficiente contraste
 */
export function hasGoodContrast(color1: string, color2: string): boolean {
  const getLuminance = (hex: string): number => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const adjust = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    
    return 0.2126 * adjust(r) + 0.7152 * adjust(g) + 0.0722 * adjust(b);
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  // WCAG AA requires 4.5:1 for normal text
  return ratio >= 4.5;
}
