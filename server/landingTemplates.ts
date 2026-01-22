/**
 * Landing Templates - Estilos predefinidos para landings
 * Dark Mode, Light Mode, Gradient, y más
 */

export interface LandingTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: {
    background: string;
    backgroundSecondary: string;
    text: string;
    textSecondary: string;
    primary: string;
    primaryHover: string;
    accent: string;
    border: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    headingSizes: {
      h1: string;
      h2: string;
      h3: string;
    };
  };
  effects: {
    borderRadius: string;
    shadow: string;
    gradient?: string;
  };
  tailwindClasses: {
    container: string;
    heading: string;
    subheading: string;
    paragraph: string;
    button: string;
    buttonSecondary: string;
    card: string;
    section: string;
  };
}

export const templates: Record<string, LandingTemplate> = {
  dark: {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Elegante tema oscuro estilo Linear/Vercel',
    preview: '🌙',
    colors: {
      background: '#0a0a0a',
      backgroundSecondary: '#141414',
      text: '#fafafa',
      textSecondary: '#a1a1aa',
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      accent: '#8b5cf6',
      border: '#27272a',
    },
    typography: {
      headingFont: 'Inter, system-ui, sans-serif',
      bodyFont: 'Inter, system-ui, sans-serif',
      headingSizes: {
        h1: 'text-5xl md:text-6xl lg:text-7xl',
        h2: 'text-3xl md:text-4xl lg:text-5xl',
        h3: 'text-xl md:text-2xl',
      },
    },
    effects: {
      borderRadius: 'rounded-xl',
      shadow: 'shadow-2xl shadow-black/20',
    },
    tailwindClasses: {
      container: 'bg-[#0a0a0a] text-white',
      heading: 'font-bold tracking-tight text-white',
      subheading: 'text-zinc-400 font-medium',
      paragraph: 'text-zinc-300 leading-relaxed',
      button: 'bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/25',
      buttonSecondary: 'bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-6 py-3 rounded-lg border border-zinc-700 transition-all duration-200',
      card: 'bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm',
      section: 'py-20 md:py-32',
    },
  },

  light: {
    id: 'light',
    name: 'Light Mode',
    description: 'Limpio y profesional con fondo claro',
    preview: '☀️',
    colors: {
      background: '#ffffff',
      backgroundSecondary: '#f8fafc',
      text: '#0f172a',
      textSecondary: '#64748b',
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      accent: '#7c3aed',
      border: '#e2e8f0',
    },
    typography: {
      headingFont: 'Inter, system-ui, sans-serif',
      bodyFont: 'Inter, system-ui, sans-serif',
      headingSizes: {
        h1: 'text-5xl md:text-6xl lg:text-7xl',
        h2: 'text-3xl md:text-4xl lg:text-5xl',
        h3: 'text-xl md:text-2xl',
      },
    },
    effects: {
      borderRadius: 'rounded-xl',
      shadow: 'shadow-xl shadow-slate-200/50',
    },
    tailwindClasses: {
      container: 'bg-white text-slate-900',
      heading: 'font-bold tracking-tight text-slate-900',
      subheading: 'text-slate-500 font-medium',
      paragraph: 'text-slate-600 leading-relaxed',
      button: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/25',
      buttonSecondary: 'bg-white hover:bg-slate-50 text-slate-900 font-semibold px-6 py-3 rounded-lg border border-slate-200 transition-all duration-200',
      card: 'bg-white border border-slate-200 rounded-2xl p-6 shadow-sm',
      section: 'py-20 md:py-32',
    },
  },

  gradient: {
    id: 'gradient',
    name: 'Gradient',
    description: 'Gradientes vibrantes y modernos',
    preview: '🌈',
    colors: {
      background: '#0f0f23',
      backgroundSecondary: '#1a1a2e',
      text: '#ffffff',
      textSecondary: '#a5b4fc',
      primary: '#8b5cf6',
      primaryHover: '#7c3aed',
      accent: '#ec4899',
      border: '#312e81',
    },
    typography: {
      headingFont: 'Inter, system-ui, sans-serif',
      bodyFont: 'Inter, system-ui, sans-serif',
      headingSizes: {
        h1: 'text-5xl md:text-6xl lg:text-7xl',
        h2: 'text-3xl md:text-4xl lg:text-5xl',
        h3: 'text-xl md:text-2xl',
      },
    },
    effects: {
      borderRadius: 'rounded-2xl',
      shadow: 'shadow-2xl shadow-purple-900/30',
      gradient: 'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600',
    },
    tailwindClasses: {
      container: 'bg-[#0f0f23] text-white',
      heading: 'font-bold tracking-tight bg-gradient-to-r from-white via-purple-200 to-violet-200 bg-clip-text text-transparent',
      subheading: 'text-indigo-300 font-medium',
      paragraph: 'text-slate-300 leading-relaxed',
      button: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-purple-600/30',
      buttonSecondary: 'bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl border border-white/20 backdrop-blur-sm transition-all duration-200',
      card: 'bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md',
      section: 'py-20 md:py-32',
    },
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra minimalista, solo lo esencial',
    preview: '⬜',
    colors: {
      background: '#fafafa',
      backgroundSecondary: '#ffffff',
      text: '#171717',
      textSecondary: '#737373',
      primary: '#171717',
      primaryHover: '#404040',
      accent: '#171717',
      border: '#e5e5e5',
    },
    typography: {
      headingFont: 'Inter, system-ui, sans-serif',
      bodyFont: 'Inter, system-ui, sans-serif',
      headingSizes: {
        h1: 'text-4xl md:text-5xl',
        h2: 'text-2xl md:text-3xl',
        h3: 'text-lg md:text-xl',
      },
    },
    effects: {
      borderRadius: 'rounded-lg',
      shadow: 'shadow-sm',
    },
    tailwindClasses: {
      container: 'bg-neutral-50 text-neutral-900',
      heading: 'font-semibold tracking-tight text-neutral-900',
      subheading: 'text-neutral-500 font-normal',
      paragraph: 'text-neutral-600 leading-relaxed',
      button: 'bg-neutral-900 hover:bg-neutral-800 text-white font-medium px-5 py-2.5 rounded-lg transition-colors duration-150',
      buttonSecondary: 'bg-transparent hover:bg-neutral-100 text-neutral-900 font-medium px-5 py-2.5 rounded-lg border border-neutral-300 transition-colors duration-150',
      card: 'bg-white border border-neutral-200 rounded-lg p-5',
      section: 'py-16 md:py-24',
    },
  },

  neon: {
    id: 'neon',
    name: 'Neon',
    description: 'Cyberpunk con efectos de neón brillante',
    preview: '💜',
    colors: {
      background: '#0d0d0d',
      backgroundSecondary: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#00ff88',
      primary: '#00ff88',
      primaryHover: '#00cc6a',
      accent: '#ff00ff',
      border: '#00ff8833',
    },
    typography: {
      headingFont: 'Inter, system-ui, sans-serif',
      bodyFont: 'Inter, system-ui, sans-serif',
      headingSizes: {
        h1: 'text-5xl md:text-6xl lg:text-7xl',
        h2: 'text-3xl md:text-4xl lg:text-5xl',
        h3: 'text-xl md:text-2xl',
      },
    },
    effects: {
      borderRadius: 'rounded-xl',
      shadow: 'shadow-[0_0_30px_rgba(0,255,136,0.3)]',
    },
    tailwindClasses: {
      container: 'bg-[#0d0d0d] text-white',
      heading: 'font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(0,255,136,0.5)]',
      subheading: 'text-[#00ff88] font-medium',
      paragraph: 'text-gray-300 leading-relaxed',
      button: 'bg-[#00ff88] hover:bg-[#00cc6a] text-black font-bold px-6 py-3 rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(0,255,136,0.4)]',
      buttonSecondary: 'bg-transparent hover:bg-[#00ff88]/10 text-[#00ff88] font-bold px-6 py-3 rounded-lg border-2 border-[#00ff88] transition-all duration-200',
      card: 'bg-black/50 border border-[#00ff88]/30 rounded-xl p-6 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,136,0.1)]',
      section: 'py-20 md:py-32',
    },
  },

  warm: {
    id: 'warm',
    name: 'Warm',
    description: 'Tonos cálidos y acogedores',
    preview: '🧡',
    colors: {
      background: '#fffbf5',
      backgroundSecondary: '#fff7ed',
      text: '#1c1917',
      textSecondary: '#78716c',
      primary: '#ea580c',
      primaryHover: '#c2410c',
      accent: '#dc2626',
      border: '#fed7aa',
    },
    typography: {
      headingFont: 'Inter, system-ui, sans-serif',
      bodyFont: 'Inter, system-ui, sans-serif',
      headingSizes: {
        h1: 'text-5xl md:text-6xl lg:text-7xl',
        h2: 'text-3xl md:text-4xl lg:text-5xl',
        h3: 'text-xl md:text-2xl',
      },
    },
    effects: {
      borderRadius: 'rounded-2xl',
      shadow: 'shadow-xl shadow-orange-200/50',
    },
    tailwindClasses: {
      container: 'bg-[#fffbf5] text-stone-900',
      heading: 'font-bold tracking-tight text-stone-900',
      subheading: 'text-stone-500 font-medium',
      paragraph: 'text-stone-600 leading-relaxed',
      button: 'bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-orange-600/25',
      buttonSecondary: 'bg-white hover:bg-orange-50 text-orange-600 font-semibold px-6 py-3 rounded-xl border border-orange-200 transition-all duration-200',
      card: 'bg-white border border-orange-100 rounded-2xl p-6 shadow-sm',
      section: 'py-20 md:py-32',
    },
  },
};

/**
 * Obtiene un template por ID
 */
export function getTemplate(id: string): LandingTemplate {
  return templates[id] || templates.dark;
}

/**
 * Lista todos los templates disponibles
 */
export function listTemplates(): LandingTemplate[] {
  return Object.values(templates);
}

/**
 * Aplica un template a un JSON de landing
 */
export function applyTemplateToLanding(
  landingJSON: Record<string, unknown>,
  templateId: string
): Record<string, unknown> {
  const template = getTemplate(templateId);
  
  return {
    ...landingJSON,
    template: templateId,
    globalStyles: {
      colors: template.colors,
      typography: template.typography,
      effects: template.effects,
      tailwindClasses: template.tailwindClasses,
    },
  };
}

/**
 * Genera CSS variables para un template
 */
export function generateCSSVariables(templateId: string): string {
  const template = getTemplate(templateId);
  
  return `
:root {
  --color-background: ${template.colors.background};
  --color-background-secondary: ${template.colors.backgroundSecondary};
  --color-text: ${template.colors.text};
  --color-text-secondary: ${template.colors.textSecondary};
  --color-primary: ${template.colors.primary};
  --color-primary-hover: ${template.colors.primaryHover};
  --color-accent: ${template.colors.accent};
  --color-border: ${template.colors.border};
  --font-heading: ${template.typography.headingFont};
  --font-body: ${template.typography.bodyFont};
}
  `.trim();
}
