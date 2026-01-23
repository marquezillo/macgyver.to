/**
 * User Color Detector
 * Detecta colores mencionados por el usuario y los prioriza sobre los colores de industria
 */

// Mapeo de nombres de colores a valores hex
const COLOR_MAP: Record<string, { primary: string; secondary: string; accent: string }> = {
  // Azules
  'azul': { primary: '#2563eb', secondary: '#3b82f6', accent: '#60a5fa' },
  'blue': { primary: '#2563eb', secondary: '#3b82f6', accent: '#60a5fa' },
  'azul oscuro': { primary: '#1e3a8a', secondary: '#1e40af', accent: '#3b82f6' },
  'dark blue': { primary: '#1e3a8a', secondary: '#1e40af', accent: '#3b82f6' },
  'azul claro': { primary: '#60a5fa', secondary: '#93c5fd', accent: '#bfdbfe' },
  'light blue': { primary: '#60a5fa', secondary: '#93c5fd', accent: '#bfdbfe' },
  'navy': { primary: '#1e3a8a', secondary: '#1e40af', accent: '#3b82f6' },
  'celeste': { primary: '#38bdf8', secondary: '#7dd3fc', accent: '#bae6fd' },
  'cyan': { primary: '#06b6d4', secondary: '#22d3ee', accent: '#67e8f9' },
  
  // Rojos
  'rojo': { primary: '#dc2626', secondary: '#ef4444', accent: '#f87171' },
  'red': { primary: '#dc2626', secondary: '#ef4444', accent: '#f87171' },
  'rojo oscuro': { primary: '#991b1b', secondary: '#b91c1c', accent: '#dc2626' },
  'dark red': { primary: '#991b1b', secondary: '#b91c1c', accent: '#dc2626' },
  'carmesí': { primary: '#be123c', secondary: '#e11d48', accent: '#f43f5e' },
  'crimson': { primary: '#be123c', secondary: '#e11d48', accent: '#f43f5e' },
  
  // Verdes
  'verde': { primary: '#16a34a', secondary: '#22c55e', accent: '#4ade80' },
  'green': { primary: '#16a34a', secondary: '#22c55e', accent: '#4ade80' },
  'verde oscuro': { primary: '#166534', secondary: '#15803d', accent: '#22c55e' },
  'dark green': { primary: '#166534', secondary: '#15803d', accent: '#22c55e' },
  'verde claro': { primary: '#4ade80', secondary: '#86efac', accent: '#bbf7d0' },
  'light green': { primary: '#4ade80', secondary: '#86efac', accent: '#bbf7d0' },
  'esmeralda': { primary: '#059669', secondary: '#10b981', accent: '#34d399' },
  'emerald': { primary: '#059669', secondary: '#10b981', accent: '#34d399' },
  'teal': { primary: '#0d9488', secondary: '#14b8a6', accent: '#2dd4bf' },
  
  // Morados/Púrpuras
  'morado': { primary: '#7c3aed', secondary: '#8b5cf6', accent: '#a78bfa' },
  'purple': { primary: '#7c3aed', secondary: '#8b5cf6', accent: '#a78bfa' },
  'púrpura': { primary: '#7c3aed', secondary: '#8b5cf6', accent: '#a78bfa' },
  'violeta': { primary: '#8b5cf6', secondary: '#a78bfa', accent: '#c4b5fd' },
  'violet': { primary: '#8b5cf6', secondary: '#a78bfa', accent: '#c4b5fd' },
  'lila': { primary: '#a855f7', secondary: '#c084fc', accent: '#d8b4fe' },
  'lavanda': { primary: '#c084fc', secondary: '#d8b4fe', accent: '#e9d5ff' },
  'indigo': { primary: '#4f46e5', secondary: '#6366f1', accent: '#818cf8' },
  
  // Naranjas
  'naranja': { primary: '#ea580c', secondary: '#f97316', accent: '#fb923c' },
  'orange': { primary: '#ea580c', secondary: '#f97316', accent: '#fb923c' },
  'naranja oscuro': { primary: '#c2410c', secondary: '#ea580c', accent: '#f97316' },
  'dark orange': { primary: '#c2410c', secondary: '#ea580c', accent: '#f97316' },
  'coral': { primary: '#f97316', secondary: '#fb923c', accent: '#fdba74' },
  
  // Amarillos
  'amarillo': { primary: '#ca8a04', secondary: '#eab308', accent: '#facc15' },
  'yellow': { primary: '#ca8a04', secondary: '#eab308', accent: '#facc15' },
  'dorado': { primary: '#b45309', secondary: '#d97706', accent: '#f59e0b' },
  'gold': { primary: '#b45309', secondary: '#d97706', accent: '#f59e0b' },
  'ámbar': { primary: '#d97706', secondary: '#f59e0b', accent: '#fbbf24' },
  'amber': { primary: '#d97706', secondary: '#f59e0b', accent: '#fbbf24' },
  
  // Rosas
  'rosa': { primary: '#db2777', secondary: '#ec4899', accent: '#f472b6' },
  'pink': { primary: '#db2777', secondary: '#ec4899', accent: '#f472b6' },
  'rosa claro': { primary: '#f472b6', secondary: '#f9a8d4', accent: '#fbcfe8' },
  'light pink': { primary: '#f472b6', secondary: '#f9a8d4', accent: '#fbcfe8' },
  'fucsia': { primary: '#c026d3', secondary: '#d946ef', accent: '#e879f9' },
  'fuchsia': { primary: '#c026d3', secondary: '#d946ef', accent: '#e879f9' },
  'magenta': { primary: '#c026d3', secondary: '#d946ef', accent: '#e879f9' },
  
  // Neutros
  'negro': { primary: '#171717', secondary: '#262626', accent: '#404040' },
  'black': { primary: '#171717', secondary: '#262626', accent: '#404040' },
  'blanco': { primary: '#f5f5f5', secondary: '#e5e5e5', accent: '#d4d4d4' },
  'white': { primary: '#f5f5f5', secondary: '#e5e5e5', accent: '#d4d4d4' },
  'gris': { primary: '#525252', secondary: '#737373', accent: '#a3a3a3' },
  'gray': { primary: '#525252', secondary: '#737373', accent: '#a3a3a3' },
  'grey': { primary: '#525252', secondary: '#737373', accent: '#a3a3a3' },
  'plata': { primary: '#a3a3a3', secondary: '#d4d4d4', accent: '#e5e5e5' },
  'silver': { primary: '#a3a3a3', secondary: '#d4d4d4', accent: '#e5e5e5' },
  
  // Marrones
  'marrón': { primary: '#78350f', secondary: '#92400e', accent: '#b45309' },
  'brown': { primary: '#78350f', secondary: '#92400e', accent: '#b45309' },
  'café': { primary: '#78350f', secondary: '#92400e', accent: '#b45309' },
  'chocolate': { primary: '#451a03', secondary: '#78350f', accent: '#92400e' },
  'beige': { primary: '#d6d3d1', secondary: '#e7e5e4', accent: '#f5f5f4' },
  'crema': { primary: '#fef3c7', secondary: '#fde68a', accent: '#fcd34d' },
  
  // Otros
  'turquesa': { primary: '#0891b2', secondary: '#06b6d4', accent: '#22d3ee' },
  'turquoise': { primary: '#0891b2', secondary: '#06b6d4', accent: '#22d3ee' },
  'aguamarina': { primary: '#14b8a6', secondary: '#2dd4bf', accent: '#5eead4' },
  'aquamarine': { primary: '#14b8a6', secondary: '#2dd4bf', accent: '#5eead4' },
  'oliva': { primary: '#65a30d', secondary: '#84cc16', accent: '#a3e635' },
  'olive': { primary: '#65a30d', secondary: '#84cc16', accent: '#a3e635' },
  'lima': { primary: '#84cc16', secondary: '#a3e635', accent: '#bef264' },
  'lime': { primary: '#84cc16', secondary: '#a3e635', accent: '#bef264' },
};

// Patrones para detectar colores en el mensaje
const COLOR_PATTERNS = [
  // Español
  /(?:usa|usar|utiliza|utilizar|con|en)\s+(?:colores?\s+)?(\w+(?:\s+\w+)?)\s+(?:y|e)\s+(\w+)/gi,
  /colou?res?\s+(\w+(?:\s+\w+)?)\s+(?:y|e)\s+(\w+)/gi,
  /(?:color|colores|tema|paleta)\s+(\w+(?:\s+\w+)?)/gi,
  /en\s+(\w+(?:\s+\w+)?)\s+(?:y|e)\s+(\w+)/gi,
  // Inglés
  /(?:use|with|in)\s+(\w+(?:\s+\w+)?)\s+(?:and)\s+(\w+)/gi,
  /colou?rs?\s+(\w+(?:\s+\w+)?)\s+(?:and)\s+(\w+)/gi,
  /(?:color|colors|theme|palette)\s+(\w+(?:\s+\w+)?)/gi,
];

export interface DetectedColors {
  primary: string;
  secondary: string;
  accent: string;
  detected: boolean;
  colorNames: string[];
}

/**
 * Detecta colores mencionados en el mensaje del usuario
 */
export function detectUserColors(message: string): DetectedColors {
  const messageLower = message.toLowerCase();
  const detectedColorNames: string[] = [];
  
  // Buscar colores directamente en el mensaje
  for (const colorName of Object.keys(COLOR_MAP)) {
    // Buscar el color como palabra completa o con sufijo plural (azules, rojos, verdes, etc.)
    const regex = new RegExp(`\\b${colorName}(es|s)?\\b`, 'i');
    if (regex.test(messageLower)) {
      detectedColorNames.push(colorName);
    }
  }
  
  // Si no encontramos colores, retornar sin detección
  if (detectedColorNames.length === 0) {
    return {
      primary: '',
      secondary: '',
      accent: '',
      detected: false,
      colorNames: [],
    };
  }
  
  // Usar el primer color como primario
  const primaryColor = COLOR_MAP[detectedColorNames[0]];
  
  // Si hay un segundo color, usarlo como secundario
  let secondaryColor = primaryColor;
  if (detectedColorNames.length > 1) {
    secondaryColor = COLOR_MAP[detectedColorNames[1]];
  }
  
  return {
    primary: primaryColor.primary,
    secondary: secondaryColor.secondary,
    accent: primaryColor.accent,
    detected: true,
    colorNames: detectedColorNames,
  };
}

/**
 * Genera instrucciones de color para el LLM basadas en los colores detectados
 */
export function generateColorInstructions(colors: DetectedColors): string {
  if (!colors.detected) {
    return '';
  }
  
  return `
IMPORTANT COLOR INSTRUCTIONS (USER REQUEST - MUST FOLLOW):
The user has explicitly requested these colors. You MUST use them:
- Primary color: ${colors.primary} (use for main elements, buttons, headers)
- Secondary color: ${colors.secondary} (use for secondary elements, hover states)
- Accent color: ${colors.accent} (use for highlights, links, icons)

User requested colors: ${colors.colorNames.join(', ')}

DO NOT use any other color palette. The user's color preference takes priority over industry defaults.
Apply these colors to:
- Hero section background or gradient
- Button backgrounds and hover states
- Section headings and accents
- Icons and decorative elements
- Links and interactive elements
`;
}

/**
 * Aplica los colores del usuario a la configuración de la landing
 */
export function applyUserColorsToConfig(
  config: Record<string, unknown>,
  colors: DetectedColors
): Record<string, unknown> {
  if (!colors.detected) {
    return config;
  }
  
  return {
    ...config,
    colors: {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
    },
    userRequestedColors: true,
  };
}
