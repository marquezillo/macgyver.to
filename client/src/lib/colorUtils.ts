/**
 * Centralized color utility functions for landing page components.
 * 
 * @module colorUtils
 * @description Provides functions for color parsing, contrast detection,
 * and generating appropriate text colors based on background colors.
 * Used across all section components to ensure consistent, readable text.
 */

/**
 * RGB color representation
 */
interface RGB {
  /** Red channel (0-255) */
  r: number;
  /** Green channel (0-255) */
  g: number;
  /** Blue channel (0-255) */
  b: number;
}

/**
 * Parse a color string to RGB values.
 * Supports hex (#fff, #ffffff), rgb(), and rgba() formats.
 * 
 * @param color - Color string to parse
 * @returns RGB object or null if parsing fails
 * @example
 * parseColor('#6366f1') // { r: 99, g: 102, b: 241 }
 * parseColor('rgb(255, 0, 0)') // { r: 255, g: 0, b: 0 }
 */
export function parseColor(color: string | undefined): RGB | null {
  if (!color || typeof color !== 'string') return null;

  const trimmed = color.trim().toLowerCase();

  if (trimmed.startsWith('#')) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
    return null;
  }

  if (trimmed.startsWith('rgb')) {
    const match = trimmed.match(/\d+/g);
    if (match && match.length >= 3) {
      return {
        r: parseInt(match[0], 10),
        g: parseInt(match[1], 10),
        b: parseInt(match[2], 10),
      };
    }
    return null;
  }

  const namedColors: Record<string, RGB> = {
    white: { r: 255, g: 255, b: 255 },
    black: { r: 0, g: 0, b: 0 },
  };

  return namedColors[trimmed] || null;
}

/**
 * Determine if a color is light (needs dark text) or dark (needs light text).
 * Uses relative luminance formula: 0.299*R + 0.587*G + 0.114*B
 * 
 * @param color - Background color to analyze
 * @returns true if color is light (luminance > 0.5), false if dark
 * @example
 * isLightColor('#ffffff') // true
 * isLightColor('#000000') // false
 * isLightColor('#6366f1') // false (indigo is dark)
 */
export function isLightColor(color: string | undefined): boolean {
  if (!color) return true;

  const rgb = parseColor(color);
  if (!rgb) return true;

  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
}

export interface ContrastColors {
  textColor: string;
  subtitleColor: string;
  badgeBg: string;
  badgeText: string;
  mutedColor: string;
}

/**
 * Get a complete set of text colors that contrast well with a background.
 * Returns colors for titles, subtitles, badges, and muted text.
 * 
 * @param backgroundColor - The background color to contrast against
 * @param hasOverlay - If true, assumes dark overlay is present (always returns light text)
 * @returns Object with textColor, subtitleColor, badgeBg, badgeText, mutedColor
 * @example
 * getContrastColors('#ffffff') // dark text colors for light bg
 * getContrastColors('#1a1a1a') // light text colors for dark bg
 * getContrastColors('#6366f1', true) // light text (overlay mode)
 */
export function getContrastColors(
  backgroundColor: string | undefined,
  hasOverlay: boolean = false
): ContrastColors {
  if (hasOverlay) {
    return {
      textColor: '#ffffff',
      subtitleColor: 'rgba(255,255,255,0.9)',
      badgeBg: 'rgba(255,255,255,0.15)',
      badgeText: '#ffffff',
      mutedColor: 'rgba(255,255,255,0.7)',
    };
  }

  const isLight = isLightColor(backgroundColor);

  if (isLight) {
    return {
      textColor: '#111827',
      subtitleColor: '#4b5563',
      badgeBg: '#6366f120',
      badgeText: '#6366f1',
      mutedColor: '#6b7280',
    };
  }

  return {
    textColor: '#ffffff',
    subtitleColor: 'rgba(255,255,255,0.8)',
    badgeBg: 'rgba(255,255,255,0.15)',
    badgeText: '#ffffff',
    mutedColor: 'rgba(255,255,255,0.6)',
  };
}

/**
 * Get a simple text color that contrasts with the background.
 * Returns dark text (#111827) for light backgrounds, white for dark.
 * 
 * @param backgroundColor - The background color
 * @returns Contrasting text color (hex string)
 */
export function ensureTextContrast(backgroundColor: string | undefined): string {
  return isLightColor(backgroundColor) ? '#111827' : '#ffffff';
}

/**
 * Generate a consistent color from a text string.
 * Uses a hash function to map any string to one of 9 predefined colors.
 * Useful for generating avatar background colors from names.
 * 
 * @param text - Input text to hash
 * @param baseColor - Fallback color if text is empty
 * @returns Hex color string
 * @example
 * getColorFromText('John Doe') // '#8b5cf6' (consistent for same input)
 * getColorFromText('Jane Smith') // '#f43f5e'
 */
export function getColorFromText(text: string, baseColor: string = '#6366f1'): string {
  if (!text) return baseColor;

  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
    '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
  ];

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

/**
 * Add alpha/opacity to a color, converting it to rgba format.
 * 
 * @param color - Input color (hex or rgb)
 * @param alpha - Opacity value (0-1)
 * @returns RGBA color string
 * @example
 * withAlpha('#6366f1', 0.5) // 'rgba(99, 102, 241, 0.5)'
 */
export function withAlpha(color: string, alpha: number): string {
  const rgb = parseColor(color);
  if (!rgb) return color;

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}
