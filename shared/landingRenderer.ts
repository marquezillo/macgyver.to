/**
 * Unified Landing Page Renderer
 * 
 * This module generates HTML from landing page JSON data.
 * It's used by BOTH the server (for published pages) and client (for preview).
 * This ensures 100% fidelity between preview and published versions.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface LandingSection {
  id: string;
  type: string;
  content: Record<string, any>;
  styles?: Record<string, any>;
}

export interface LandingConfig {
  sections: LandingSection[];
  globalStyles?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    borderRadius?: string;
  };
  metadata?: {
    title?: string;
    description?: string;
    favicon?: string;
    language?: string;
  };
}

export interface RenderOptions {
  isPreview?: boolean;
  baseUrl?: string;
  includeWrapper?: boolean;
  includeScripts?: boolean;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(text: string | undefined | null): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Check if a color is light (for contrast calculations)
 */
export function isLightColor(color: string | undefined): boolean {
  if (!color) return true;
  const hex = color.replace('#', '');
  if (hex.length !== 6) return true;
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

/**
 * Get contrasting text color
 */
export function getContrastColor(bgColor: string | undefined): string {
  return isLightColor(bgColor) ? '#1f2937' : '#ffffff';
}

/**
 * Get subtitle/muted text color
 */
export function getSubtitleColor(bgColor: string | undefined): string {
  return isLightColor(bgColor) ? '#6b7280' : 'rgba(255,255,255,0.8)';
}

/**
 * Validate image URL
 */
export function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  if (typeof url !== 'string') return false;
  if (url.trim() === '') return false;
  if (url.startsWith('data:')) return true;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
    return true;
  }
  return false;
}

/**
 * Generate CSS classes string
 */
export function cx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ============================================================================
// ICON SVG LIBRARY
// ============================================================================

const ICONS: Record<string, string> = {
  check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  award: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mapPin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  arrowRight: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  chevronDown: '<polyline points="6 9 12 15 18 9"/>',
  menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  play: '<polygon points="5 3 19 12 5 21 5 3"/>',
  sparkles: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>',
  palette: '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/>',
};

/**
 * Get SVG icon HTML
 */
export function getIconSvg(iconName: string | undefined, color: string = 'currentColor', size: number = 24): string {
  if (!iconName) return '';
  const name = iconName.toLowerCase().replace(/[-_]/g, '');
  const path = ICONS[name] || ICONS['check'];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

// ============================================================================
// CSS STYLES (Tailwind-like utility classes as inline styles)
// ============================================================================

export const STYLES = {
  // Layout
  container: 'max-width: 1280px; margin-left: auto; margin-right: auto; padding-left: 1rem; padding-right: 1rem;',
  flexCenter: 'display: flex; align-items: center; justify-content: center;',
  flexBetween: 'display: flex; align-items: center; justify-content: space-between;',
  grid2: 'display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem;',
  grid3: 'display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.5rem;',
  grid4: 'display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1.5rem;',
  
  // Typography
  heading1: 'font-size: 3rem; line-height: 1.1; font-weight: 700; letter-spacing: -0.025em;',
  heading2: 'font-size: 2.25rem; line-height: 1.2; font-weight: 700; letter-spacing: -0.025em;',
  heading3: 'font-size: 1.5rem; line-height: 1.3; font-weight: 600;',
  bodyLarge: 'font-size: 1.25rem; line-height: 1.75;',
  bodyNormal: 'font-size: 1rem; line-height: 1.75;',
  bodySmall: 'font-size: 0.875rem; line-height: 1.5;',
  
  // Spacing
  section: 'padding-top: 5rem; padding-bottom: 5rem;',
  sectionLarge: 'padding-top: 6rem; padding-bottom: 6rem;',
  
  // Effects
  shadow: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);',
  shadowLg: 'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);',
  rounded: 'border-radius: 0.5rem;',
  roundedLg: 'border-radius: 0.75rem;',
  roundedFull: 'border-radius: 9999px;',
  
  // Transitions
  transition: 'transition: all 0.2s ease-in-out;',
};

// ============================================================================
// SECTION RENDERERS
// ============================================================================

/**
 * Render Header/Navigation Section
 */
export function renderHeader(section: LandingSection, globalStyles?: LandingConfig['globalStyles']): string {
  const { content, styles = {} } = section;
  const bgColor = styles.backgroundColor || globalStyles?.backgroundColor || '#ffffff';
  const textColor = getContrastColor(bgColor);
  const accentColor = styles.accentColor || globalStyles?.primaryColor || '#6366f1';
  
  const logo = content.logo || content.logoUrl;
  const businessName = content.businessName || content.title || 'Business';
  const navItems = content.navItems || content.menuItems || [];
  const ctaText = content.ctaText || content.buttonText;
  const ctaUrl = content.ctaUrl || content.buttonUrl || '#contact';
  
  return `
    <header style="position: sticky; top: 0; z-index: 50; background-color: ${bgColor}; border-bottom: 1px solid rgba(0,0,0,0.1);">
      <div style="${STYLES.container} ${STYLES.flexBetween} height: 4rem;">
        <!-- Logo -->
        <a href="/" style="display: flex; align-items: center; gap: 0.75rem; text-decoration: none; color: ${textColor};">
          ${logo && isValidImageUrl(logo) 
            ? `<img src="${escapeHtml(logo)}" alt="${escapeHtml(businessName)}" style="height: 2.5rem; width: auto; object-fit: contain;" />`
            : `<div style="width: 2.5rem; height: 2.5rem; ${STYLES.roundedLg} background-color: ${accentColor}; ${STYLES.flexCenter} color: white; font-weight: 700; font-size: 1.25rem;">${escapeHtml(businessName.charAt(0).toUpperCase())}</div>`
          }
          <span style="font-weight: 600; font-size: 1.125rem;">${escapeHtml(businessName)}</span>
        </a>
        
        <!-- Navigation -->
        <nav style="display: none; gap: 2rem;" class="desktop-nav">
          ${navItems.map((item: any) => `
            <a href="${escapeHtml(item.url || item.href || '#')}" style="color: ${textColor}; text-decoration: none; font-size: 0.875rem; font-weight: 500; opacity: 0.8; ${STYLES.transition}" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'">
              ${escapeHtml(item.label || item.text || item.name)}
            </a>
          `).join('')}
        </nav>
        
        <!-- CTA Button -->
        ${ctaText ? `
          <a href="${escapeHtml(ctaUrl)}" style="display: none; padding: 0.5rem 1.25rem; background-color: ${accentColor}; color: white; ${STYLES.rounded} font-weight: 500; font-size: 0.875rem; text-decoration: none; ${STYLES.transition}" class="desktop-cta" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
            ${escapeHtml(ctaText)}
          </a>
        ` : ''}
        
        <!-- Mobile Menu Button -->
        <button onclick="toggleMobileMenu()" style="display: flex; padding: 0.5rem; background: none; border: none; cursor: pointer; color: ${textColor};" class="mobile-menu-btn">
          ${getIconSvg('menu', textColor, 24)}
        </button>
      </div>
      
      <!-- Mobile Menu -->
      <div id="mobile-menu" style="display: none; padding: 1rem; background-color: ${bgColor}; border-top: 1px solid rgba(0,0,0,0.1);">
        ${navItems.map((item: any) => `
          <a href="${escapeHtml(item.url || item.href || '#')}" style="display: block; padding: 0.75rem 0; color: ${textColor}; text-decoration: none; font-weight: 500; border-bottom: 1px solid rgba(0,0,0,0.05);">
            ${escapeHtml(item.label || item.text || item.name)}
          </a>
        `).join('')}
        ${ctaText ? `
          <a href="${escapeHtml(ctaUrl)}" style="display: block; margin-top: 1rem; padding: 0.75rem 1.25rem; background-color: ${accentColor}; color: white; ${STYLES.rounded} font-weight: 500; text-align: center; text-decoration: none;">
            ${escapeHtml(ctaText)}
          </a>
        ` : ''}
      </div>
    </header>
    
    <style>
      @media (min-width: 768px) {
        .desktop-nav { display: flex !important; }
        .desktop-cta { display: inline-flex !important; }
        .mobile-menu-btn { display: none !important; }
      }
    </style>
    
    <script>
      function toggleMobileMenu() {
        const menu = document.getElementById('mobile-menu');
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
      }
    </script>
  `;
}

/**
 * Render Hero Section
 */
export function renderHero(section: LandingSection, globalStyles?: LandingConfig['globalStyles']): string {
  const { content, styles = {} } = section;
  const bgColor = styles.backgroundColor || globalStyles?.backgroundColor || '#0f172a';
  const accentColor = styles.accentColor || globalStyles?.primaryColor || '#6366f1';
  const backgroundImage = content.backgroundImage || content.imageUrl || styles.backgroundImage;
  const hasImage = isValidImageUrl(backgroundImage);
  
  const textColor = hasImage ? '#ffffff' : getContrastColor(bgColor);
  const subtitleColor = hasImage ? 'rgba(255,255,255,0.8)' : getSubtitleColor(bgColor);
  
  const title = content.title || 'Welcome to Our Site';
  const subtitle = content.subtitle || content.description || '';
  const ctaText = content.ctaText || content.buttonText || 'Get Started';
  const ctaUrl = content.ctaUrl || content.buttonUrl || '#contact';
  const secondaryCtaText = content.secondaryCtaText;
  const secondaryCtaUrl = content.secondaryCtaUrl || '#';
  const badge = content.badge;
  const stats = content.stats || [];
  
  const bgStyle = hasImage 
    ? `background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${escapeHtml(backgroundImage)}'); background-size: cover; background-position: center;`
    : `background-color: ${bgColor};`;
  
  return `
    <section style="${bgStyle} ${STYLES.sectionLarge} min-height: 600px; display: flex; align-items: center;">
      <div style="${STYLES.container} text-align: center; max-width: 900px;">
        ${badge ? `
          <span style="display: inline-block; padding: 0.5rem 1rem; ${STYLES.roundedFull} background-color: ${hasImage ? 'rgba(255,255,255,0.15)' : accentColor + '20'}; color: ${hasImage ? '#ffffff' : accentColor}; font-size: 0.875rem; font-weight: 500; margin-bottom: 1.5rem;">
            ${escapeHtml(badge)}
          </span>
        ` : ''}
        
        <h1 style="${STYLES.heading1} color: ${textColor}; margin-bottom: 1.5rem; ${hasImage ? 'text-shadow: 0 4px 12px rgba(0,0,0,0.3);' : ''}">
          ${escapeHtml(title)}
        </h1>
        
        ${subtitle ? `
          <p style="${STYLES.bodyLarge} color: ${subtitleColor}; margin-bottom: 2.5rem; max-width: 700px; margin-left: auto; margin-right: auto;">
            ${escapeHtml(subtitle)}
          </p>
        ` : ''}
        
        <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center;">
          <a href="${escapeHtml(ctaUrl)}" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 1rem 2rem; background-color: ${accentColor}; color: white; ${STYLES.roundedLg} font-weight: 600; text-decoration: none; ${STYLES.shadow} ${STYLES.transition}" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
            ${escapeHtml(ctaText)}
            ${getIconSvg('arrowRight', 'white', 20)}
          </a>
          
          ${secondaryCtaText ? `
            <a href="${escapeHtml(secondaryCtaUrl)}" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 1rem 2rem; background-color: transparent; color: ${textColor}; border: 2px solid ${hasImage ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}; ${STYLES.roundedLg} font-weight: 600; text-decoration: none; ${STYLES.transition}" onmouseover="this.style.backgroundColor='${hasImage ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}'" onmouseout="this.style.backgroundColor='transparent'">
              ${escapeHtml(secondaryCtaText)}
            </a>
          ` : ''}
        </div>
        
        ${stats.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(${Math.min(stats.length, 3)}, 1fr); gap: 2rem; margin-top: 4rem; max-width: 600px; margin-left: auto; margin-right: auto;">
            ${stats.map((stat: any) => `
              <div style="text-align: center;">
                <div style="font-size: 2.5rem; font-weight: 700; color: ${textColor};">${escapeHtml(stat.value)}</div>
                <div style="font-size: 0.875rem; color: ${subtitleColor}; margin-top: 0.25rem;">${escapeHtml(stat.label)}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </section>
  `;
}

/**
 * Render Features Section
 */
export function renderFeatures(section: LandingSection, globalStyles?: LandingConfig['globalStyles']): string {
  const { content, styles = {} } = section;
  const bgColor = styles.backgroundColor || globalStyles?.backgroundColor || '#ffffff';
  const accentColor = styles.accentColor || globalStyles?.primaryColor || '#6366f1';
  const textColor = getContrastColor(bgColor);
  const subtitleColor = getSubtitleColor(bgColor);
  
  const title = content.title || content.heading || 'Our Features';
  const subtitle = content.subtitle || content.description || '';
  const features = content.features || content.items || [];
  
  return `
    <section style="background-color: ${bgColor}; ${STYLES.section}">
      <div style="${STYLES.container}">
        <div style="text-align: center; max-width: 700px; margin: 0 auto 4rem;">
          <h2 style="${STYLES.heading2} color: ${textColor}; margin-bottom: 1rem;">
            ${escapeHtml(title)}
          </h2>
          ${subtitle ? `
            <p style="${STYLES.bodyLarge} color: ${subtitleColor};">
              ${escapeHtml(subtitle)}
            </p>
          ` : ''}
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
          ${features.map((feature: any) => `
            <div style="padding: 2rem; ${STYLES.roundedLg} background-color: ${isLightColor(bgColor) ? '#f8fafc' : 'rgba(255,255,255,0.05)'}; ${STYLES.transition}" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 25px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
              <div style="width: 3rem; height: 3rem; ${STYLES.roundedLg} background-color: ${accentColor}20; ${STYLES.flexCenter} margin-bottom: 1.25rem;">
                ${getIconSvg(feature.icon, accentColor, 24)}
              </div>
              <h3 style="${STYLES.heading3} color: ${textColor}; margin-bottom: 0.75rem;">
                ${escapeHtml(feature.title || feature.name)}
              </h3>
              <p style="${STYLES.bodyNormal} color: ${subtitleColor};">
                ${escapeHtml(feature.description || feature.text)}
              </p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

/**
 * Render Testimonials Section
 */
export function renderTestimonials(section: LandingSection, globalStyles?: LandingConfig['globalStyles']): string {
  const { content, styles = {} } = section;
  const bgColor = styles.backgroundColor || '#f8fafc';
  const accentColor = styles.accentColor || globalStyles?.primaryColor || '#6366f1';
  const textColor = getContrastColor(bgColor);
  const subtitleColor = getSubtitleColor(bgColor);
  
  const title = content.title || 'What Our Clients Say';
  const subtitle = content.subtitle || '';
  const testimonials = content.testimonials || content.items || [];
  
  return `
    <section style="background-color: ${bgColor}; ${STYLES.section}">
      <div style="${STYLES.container}">
        <div style="text-align: center; max-width: 700px; margin: 0 auto 4rem;">
          <h2 style="${STYLES.heading2} color: ${textColor}; margin-bottom: 1rem;">
            ${escapeHtml(title)}
          </h2>
          ${subtitle ? `
            <p style="${STYLES.bodyLarge} color: ${subtitleColor};">
              ${escapeHtml(subtitle)}
            </p>
          ` : ''}
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem;">
          ${testimonials.map((testimonial: any) => `
            <div style="padding: 2rem; ${STYLES.roundedLg} background-color: ${isLightColor(bgColor) ? '#ffffff' : 'rgba(255,255,255,0.05)'}; ${STYLES.shadowLg}">
              <!-- Stars -->
              <div style="display: flex; gap: 0.25rem; margin-bottom: 1rem;">
                ${Array(5).fill(0).map(() => `
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="${accentColor}" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                `).join('')}
              </div>
              
              <p style="${STYLES.bodyNormal} color: ${textColor}; font-style: italic; margin-bottom: 1.5rem;">
                "${escapeHtml(testimonial.quote || testimonial.text || testimonial.content)}"
              </p>
              
              <div style="display: flex; align-items: center; gap: 1rem;">
                ${testimonial.avatar || testimonial.image ? `
                  <img src="${escapeHtml(testimonial.avatar || testimonial.image)}" alt="${escapeHtml(testimonial.name || testimonial.author)}" style="width: 3rem; height: 3rem; ${STYLES.roundedFull} object-fit: cover;" />
                ` : `
                  <div style="width: 3rem; height: 3rem; ${STYLES.roundedFull} background-color: ${accentColor}; ${STYLES.flexCenter} color: white; font-weight: 600;">
                    ${escapeHtml((testimonial.name || testimonial.author || 'A').charAt(0).toUpperCase())}
                  </div>
                `}
                <div>
                  <div style="font-weight: 600; color: ${textColor};">${escapeHtml(testimonial.name || testimonial.author)}</div>
                  ${testimonial.role || testimonial.title || testimonial.company ? `
                    <div style="font-size: 0.875rem; color: ${subtitleColor};">${escapeHtml(testimonial.role || testimonial.title)}${testimonial.company ? `, ${escapeHtml(testimonial.company)}` : ''}</div>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

/**
 * Render CTA Section
 */
export function renderCTA(section: LandingSection, globalStyles?: LandingConfig['globalStyles']): string {
  const { content, styles = {} } = section;
  const bgColor = styles.backgroundColor || globalStyles?.primaryColor || '#6366f1';
  const accentColor = styles.accentColor || '#ffffff';
  const textColor = getContrastColor(bgColor);
  
  const title = content.title || 'Ready to Get Started?';
  const subtitle = content.subtitle || content.description || '';
  const ctaText = content.ctaText || content.buttonText || 'Contact Us';
  const ctaUrl = content.ctaUrl || content.buttonUrl || '#contact';
  const secondaryCtaText = content.secondaryCtaText;
  const secondaryCtaUrl = content.secondaryCtaUrl || '#';
  
  return `
    <section style="background-color: ${bgColor}; ${STYLES.section}">
      <div style="${STYLES.container} text-align: center; max-width: 800px;">
        <h2 style="${STYLES.heading2} color: ${textColor}; margin-bottom: 1rem;">
          ${escapeHtml(title)}
        </h2>
        
        ${subtitle ? `
          <p style="${STYLES.bodyLarge} color: ${textColor}; opacity: 0.9; margin-bottom: 2rem;">
            ${escapeHtml(subtitle)}
          </p>
        ` : ''}
        
        <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center;">
          <a href="${escapeHtml(ctaUrl)}" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 1rem 2rem; background-color: ${accentColor}; color: ${bgColor}; ${STYLES.roundedLg} font-weight: 600; text-decoration: none; ${STYLES.shadow} ${STYLES.transition}" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
            ${escapeHtml(ctaText)}
            ${getIconSvg('arrowRight', bgColor, 20)}
          </a>
          
          ${secondaryCtaText ? `
            <a href="${escapeHtml(secondaryCtaUrl)}" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 1rem 2rem; background-color: transparent; color: ${textColor}; border: 2px solid ${textColor}40; ${STYLES.roundedLg} font-weight: 600; text-decoration: none; ${STYLES.transition}" onmouseover="this.style.backgroundColor='${textColor}10'" onmouseout="this.style.backgroundColor='transparent'">
              ${escapeHtml(secondaryCtaText)}
            </a>
          ` : ''}
        </div>
      </div>
    </section>
  `;
}

/**
 * Render Form/Contact Section
 */
export function renderForm(section: LandingSection, globalStyles?: LandingConfig['globalStyles']): string {
  const { content, styles = {} } = section;
  const bgColor = styles.backgroundColor || '#ffffff';
  const accentColor = styles.accentColor || globalStyles?.primaryColor || '#6366f1';
  const textColor = getContrastColor(bgColor);
  const subtitleColor = getSubtitleColor(bgColor);
  
  const title = content.title || 'Contact Us';
  const subtitle = content.subtitle || content.description || '';
  const fields = content.fields || [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'message', label: 'Message', type: 'textarea', required: true }
  ];
  const submitText = content.submitText || content.buttonText || 'Send Message';
  const formId = content.formId || `form-${section.id}`;
  
  const inputStyle = `width: 100%; padding: 0.875rem 1rem; ${STYLES.roundedLg} border: 1px solid ${isLightColor(bgColor) ? '#e5e7eb' : 'rgba(255,255,255,0.2)'}; background-color: ${isLightColor(bgColor) ? '#ffffff' : 'rgba(255,255,255,0.05)'}; color: ${textColor}; font-size: 1rem; ${STYLES.transition} outline: none;`;
  
  return `
    <section id="contact" style="background-color: ${bgColor}; ${STYLES.section}">
      <div style="${STYLES.container} max-width: 600px;">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 style="${STYLES.heading2} color: ${textColor}; margin-bottom: 1rem;">
            ${escapeHtml(title)}
          </h2>
          ${subtitle ? `
            <p style="${STYLES.bodyLarge} color: ${subtitleColor};">
              ${escapeHtml(subtitle)}
            </p>
          ` : ''}
        </div>
        
        <form id="${escapeHtml(formId)}" style="display: flex; flex-direction: column; gap: 1.5rem;" onsubmit="handleFormSubmit(event, '${escapeHtml(formId)}')">
          ${fields.map((field: any) => `
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: ${textColor}; font-size: 0.875rem;">
                ${escapeHtml(field.label)}${field.required ? ' *' : ''}
              </label>
              ${field.type === 'textarea' ? `
                <textarea 
                  name="${escapeHtml(field.name)}" 
                  placeholder="${escapeHtml(field.placeholder || '')}"
                  ${field.required ? 'required' : ''}
                  rows="4"
                  style="${inputStyle} resize: vertical; min-height: 120px;"
                  onfocus="this.style.borderColor='${accentColor}'; this.style.boxShadow='0 0 0 3px ${accentColor}20'"
                  onblur="this.style.borderColor='${isLightColor(bgColor) ? '#e5e7eb' : 'rgba(255,255,255,0.2)'}'; this.style.boxShadow='none'"
                ></textarea>
              ` : field.type === 'select' ? `
                <select 
                  name="${escapeHtml(field.name)}"
                  ${field.required ? 'required' : ''}
                  style="${inputStyle} cursor: pointer;"
                  onfocus="this.style.borderColor='${accentColor}'; this.style.boxShadow='0 0 0 3px ${accentColor}20'"
                  onblur="this.style.borderColor='${isLightColor(bgColor) ? '#e5e7eb' : 'rgba(255,255,255,0.2)'}'; this.style.boxShadow='none'"
                >
                  <option value="">${escapeHtml(field.placeholder || 'Select...')}</option>
                  ${(field.options || []).map((opt: any) => `
                    <option value="${escapeHtml(typeof opt === 'string' ? opt : opt.value)}">${escapeHtml(typeof opt === 'string' ? opt : opt.label)}</option>
                  `).join('')}
                </select>
              ` : `
                <input 
                  type="${escapeHtml(field.type || 'text')}" 
                  name="${escapeHtml(field.name)}" 
                  placeholder="${escapeHtml(field.placeholder || '')}"
                  ${field.required ? 'required' : ''}
                  style="${inputStyle}"
                  onfocus="this.style.borderColor='${accentColor}'; this.style.boxShadow='0 0 0 3px ${accentColor}20'"
                  onblur="this.style.borderColor='${isLightColor(bgColor) ? '#e5e7eb' : 'rgba(255,255,255,0.2)'}'; this.style.boxShadow='none'"
                />
              `}
            </div>
          `).join('')}
          
          <button 
            type="submit" 
            style="width: 100%; padding: 1rem 2rem; background-color: ${accentColor}; color: white; ${STYLES.roundedLg} font-weight: 600; font-size: 1rem; border: none; cursor: pointer; ${STYLES.shadow} ${STYLES.transition}"
            onmouseover="this.style.opacity='0.9'; this.style.transform='translateY(-2px)'"
            onmouseout="this.style.opacity='1'; this.style.transform='translateY(0)'"
          >
            ${escapeHtml(submitText)}
          </button>
        </form>
        
        <div id="${escapeHtml(formId)}-success" style="display: none; text-align: center; padding: 2rem; ${STYLES.roundedLg} background-color: #10b98120; color: #10b981;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">✓</div>
          <div style="font-weight: 600; font-size: 1.25rem;">Thank you!</div>
          <div style="margin-top: 0.5rem;">Your message has been sent successfully.</div>
        </div>
      </div>
    </section>
  `;
}

/**
 * Render FAQ Section
 */
export function renderFAQ(section: LandingSection, globalStyles?: LandingConfig['globalStyles']): string {
  const { content, styles = {} } = section;
  const bgColor = styles.backgroundColor || '#ffffff';
  const accentColor = styles.accentColor || globalStyles?.primaryColor || '#6366f1';
  const textColor = getContrastColor(bgColor);
  const subtitleColor = getSubtitleColor(bgColor);
  
  const title = content.title || 'Frequently Asked Questions';
  const subtitle = content.subtitle || '';
  const faqs = content.faqs || content.items || content.questions || [];
  
  return `
    <section style="background-color: ${bgColor}; ${STYLES.section}">
      <div style="${STYLES.container} max-width: 800px;">
        <div style="text-align: center; margin-bottom: 4rem;">
          <h2 style="${STYLES.heading2} color: ${textColor}; margin-bottom: 1rem;">
            ${escapeHtml(title)}
          </h2>
          ${subtitle ? `
            <p style="${STYLES.bodyLarge} color: ${subtitleColor};">
              ${escapeHtml(subtitle)}
            </p>
          ` : ''}
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${faqs.map((faq: any, index: number) => `
            <div style="${STYLES.roundedLg} border: 1px solid ${isLightColor(bgColor) ? '#e5e7eb' : 'rgba(255,255,255,0.1)'}; overflow: hidden;">
              <button 
                onclick="toggleFaq(${index})"
                style="width: 100%; padding: 1.25rem 1.5rem; background-color: transparent; border: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; text-align: left; color: ${textColor}; font-weight: 600; font-size: 1rem;"
              >
                <span>${escapeHtml(faq.question || faq.q)}</span>
                <span id="faq-icon-${index}" style="${STYLES.transition}">${getIconSvg('chevronDown', textColor, 20)}</span>
              </button>
              <div id="faq-answer-${index}" style="display: none; padding: 0 1.5rem 1.25rem; color: ${subtitleColor}; line-height: 1.75;">
                ${escapeHtml(faq.answer || faq.a)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    
    <script>
      function toggleFaq(index) {
        const answer = document.getElementById('faq-answer-' + index);
        const icon = document.getElementById('faq-icon-' + index);
        if (answer.style.display === 'none') {
          answer.style.display = 'block';
          icon.style.transform = 'rotate(180deg)';
        } else {
          answer.style.display = 'none';
          icon.style.transform = 'rotate(0deg)';
        }
      }
    </script>
  `;
}

/**
 * Render Footer Section
 */
export function renderFooter(section: LandingSection, globalStyles?: LandingConfig['globalStyles']): string {
  const { content, styles = {} } = section;
  const bgColor = styles.backgroundColor || '#0f172a';
  const accentColor = styles.accentColor || globalStyles?.primaryColor || '#6366f1';
  const textColor = getContrastColor(bgColor);
  const subtitleColor = getSubtitleColor(bgColor);
  
  const businessName = content.businessName || content.companyName || 'Company';
  const logo = content.logo || content.logoUrl;
  const description = content.description || content.tagline || '';
  const links = content.links || content.navItems || [];
  const socialLinks = content.socialLinks || content.social || [];
  const copyright = content.copyright || `© ${new Date().getFullYear()} ${businessName}. All rights reserved.`;
  const contactInfo = content.contactInfo || content.contact || {};
  
  return `
    <footer style="background-color: ${bgColor}; padding: 4rem 0 2rem;">
      <div style="${STYLES.container}">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 3rem; margin-bottom: 3rem;">
          <!-- Brand Column -->
          <div>
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;">
              ${logo && isValidImageUrl(logo) 
                ? `<img src="${escapeHtml(logo)}" alt="${escapeHtml(businessName)}" style="height: 2.5rem; width: auto;" />`
                : `<div style="width: 2.5rem; height: 2.5rem; ${STYLES.roundedLg} background-color: ${accentColor}; ${STYLES.flexCenter} color: white; font-weight: 700; font-size: 1.25rem;">${escapeHtml(businessName.charAt(0).toUpperCase())}</div>`
              }
              <span style="font-weight: 600; font-size: 1.25rem; color: ${textColor};">${escapeHtml(businessName)}</span>
            </div>
            ${description ? `
              <p style="color: ${subtitleColor}; line-height: 1.75; margin-bottom: 1.5rem;">
                ${escapeHtml(description)}
              </p>
            ` : ''}
            
            <!-- Social Links -->
            ${socialLinks.length > 0 ? `
              <div style="display: flex; gap: 1rem;">
                ${socialLinks.map((social: any) => `
                  <a href="${escapeHtml(social.url || social.href)}" target="_blank" rel="noopener noreferrer" style="width: 2.5rem; height: 2.5rem; ${STYLES.roundedFull} background-color: ${isLightColor(bgColor) ? '#f1f5f9' : 'rgba(255,255,255,0.1)'}; ${STYLES.flexCenter} color: ${subtitleColor}; ${STYLES.transition}" onmouseover="this.style.backgroundColor='${accentColor}'; this.style.color='white'" onmouseout="this.style.backgroundColor='${isLightColor(bgColor) ? '#f1f5f9' : 'rgba(255,255,255,0.1)'}'; this.style.color='${subtitleColor}'">
                    ${getIconSvg(social.icon || social.platform, 'currentColor', 18)}
                  </a>
                `).join('')}
              </div>
            ` : ''}
          </div>
          
          <!-- Links Column -->
          ${links.length > 0 ? `
            <div>
              <h4 style="font-weight: 600; color: ${textColor}; margin-bottom: 1.25rem;">Links</h4>
              <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem;">
                ${links.map((link: any) => `
                  <li>
                    <a href="${escapeHtml(link.url || link.href || '#')}" style="color: ${subtitleColor}; text-decoration: none; ${STYLES.transition}" onmouseover="this.style.color='${accentColor}'" onmouseout="this.style.color='${subtitleColor}'">
                      ${escapeHtml(link.label || link.text || link.name)}
                    </a>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
          
          <!-- Contact Column -->
          ${(contactInfo.email || contactInfo.phone || contactInfo.address) ? `
            <div>
              <h4 style="font-weight: 600; color: ${textColor}; margin-bottom: 1.25rem;">Contact</h4>
              <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem;">
                ${contactInfo.email ? `
                  <li style="display: flex; align-items: center; gap: 0.75rem; color: ${subtitleColor};">
                    ${getIconSvg('mail', subtitleColor, 18)}
                    <a href="mailto:${escapeHtml(contactInfo.email)}" style="color: ${subtitleColor}; text-decoration: none;">${escapeHtml(contactInfo.email)}</a>
                  </li>
                ` : ''}
                ${contactInfo.phone ? `
                  <li style="display: flex; align-items: center; gap: 0.75rem; color: ${subtitleColor};">
                    ${getIconSvg('phone', subtitleColor, 18)}
                    <a href="tel:${escapeHtml(contactInfo.phone)}" style="color: ${subtitleColor}; text-decoration: none;">${escapeHtml(contactInfo.phone)}</a>
                  </li>
                ` : ''}
                ${contactInfo.address ? `
                  <li style="display: flex; align-items: flex-start; gap: 0.75rem; color: ${subtitleColor};">
                    ${getIconSvg('mapPin', subtitleColor, 18)}
                    <span>${escapeHtml(contactInfo.address)}</span>
                  </li>
                ` : ''}
              </ul>
            </div>
          ` : ''}
        </div>
        
        <!-- Copyright -->
        <div style="padding-top: 2rem; border-top: 1px solid ${isLightColor(bgColor) ? '#e5e7eb' : 'rgba(255,255,255,0.1)'}; text-align: center; color: ${subtitleColor}; font-size: 0.875rem;">
          ${escapeHtml(copyright)}
        </div>
      </div>
    </footer>
  `;
}

// ============================================================================
// MAIN RENDER FUNCTION
// ============================================================================

/**
 * Render a single section based on its type
 */
export function renderSection(section: LandingSection, globalStyles?: LandingConfig['globalStyles']): string {
  const type = section.type?.toLowerCase();
  
  switch (type) {
    case 'header':
    case 'navbar':
    case 'nav':
    case 'navigation':
      return renderHeader(section, globalStyles);
    
    case 'hero':
      return renderHero(section, globalStyles);
    
    case 'features':
    case 'services':
      return renderFeatures(section, globalStyles);
    
    case 'testimonials':
    case 'reviews':
      return renderTestimonials(section, globalStyles);
    
    case 'cta':
    case 'calltoaction':
      return renderCTA(section, globalStyles);
    
    case 'form':
    case 'contact':
      return renderForm(section, globalStyles);
    
    case 'faq':
    case 'faqs':
      return renderFAQ(section, globalStyles);
    
    case 'footer':
      return renderFooter(section, globalStyles);
    
    default:
      return `<!-- Unknown section type: ${escapeHtml(type)} -->`;
  }
}

/**
 * Generate automatic navigation items based on sections
 */
function generateAutoNavItems(sections: LandingSection[]): Array<{ label: string; url: string }> {
  const navItems: Array<{ label: string; url: string }> = [];
  
  const sectionLabels: Record<string, string> = {
    'hero': 'Inicio',
    'features': 'Servicios',
    'services': 'Servicios',
    'testimonials': 'Testimonios',
    'reviews': 'Reseñas',
    'pricing': 'Precios',
    'about': 'Nosotros',
    'gallery': 'Galería',
    'faq': 'FAQ',
    'contact': 'Contacto',
    'form': 'Contacto',
    'cta': 'Contacto'
  };
  
  sections.forEach(section => {
    const type = section.type?.toLowerCase();
    if (sectionLabels[type] && !navItems.find(item => item.label === sectionLabels[type])) {
      navItems.push({
        label: sectionLabels[type],
        url: `#${section.id || type}`
      });
    }
  });
  
  return navItems;
}

/**
 * Generate automatic header section
 */
function generateAutoHeader(config: LandingConfig): LandingSection {
  const { sections, globalStyles, metadata } = config;
  const businessName = metadata?.title || 'Mi Negocio';
  const navItems = generateAutoNavItems(sections);
  
  // Find if there's a form or CTA section for the header CTA
  const hasContactSection = sections.some(s => 
    ['form', 'contact', 'cta'].includes(s.type?.toLowerCase())
  );
  
  return {
    id: 'auto-header',
    type: 'header',
    content: {
      businessName,
      logo: null, // Will trigger icon + name fallback
      navItems,
      ctaText: hasContactSection ? 'Contactar' : undefined,
      ctaUrl: hasContactSection ? '#contact' : undefined
    },
    styles: {
      backgroundColor: globalStyles?.backgroundColor || '#ffffff',
      accentColor: globalStyles?.primaryColor || '#6366f1'
    }
  };
}

/**
 * Generate automatic footer section
 */
function generateAutoFooter(config: LandingConfig): LandingSection {
  const { globalStyles, metadata } = config;
  const businessName = metadata?.title || 'Mi Negocio';
  const currentYear = new Date().getFullYear();
  
  return {
    id: 'auto-footer',
    type: 'footer',
    content: {
      businessName,
      logo: null,
      description: '',
      copyright: `© ${currentYear} ${businessName}. Todos los derechos reservados.`,
      links: [
        { label: 'Política de Privacidad', url: '/privacidad' },
        { label: 'Términos y Condiciones', url: '/terminos' }
      ],
      socialLinks: [],
      contactInfo: {}
    },
    styles: {
      backgroundColor: globalStyles?.backgroundColor || '#1f2937',
      accentColor: globalStyles?.primaryColor || '#6366f1'
    }
  };
}

/**
 * Check if sections contain a specific type
 */
function hasSection(sections: LandingSection[], types: string[]): boolean {
  return sections.some(s => types.includes(s.type?.toLowerCase()));
}

/**
 * Render complete landing page HTML
 */
export function renderLanding(config: LandingConfig, options: RenderOptions = {}): string {
  const { sections: originalSections, globalStyles, metadata } = config;
  const { isPreview = false, baseUrl = '', includeWrapper = true, includeScripts = true } = options;
  
  const bgColor = globalStyles?.backgroundColor || '#ffffff';
  const textColor = globalStyles?.textColor || getContrastColor(bgColor);
  const fontFamily = globalStyles?.fontFamily || "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  
  // Auto-add header if missing
  const hasHeader = hasSection(originalSections, ['header', 'navbar', 'nav', 'navigation']);
  const hasFooter = hasSection(originalSections, ['footer']);
  
  let sections = [...originalSections];
  
  // Add auto-generated header at the beginning if missing
  if (!hasHeader) {
    sections.unshift(generateAutoHeader(config));
  }
  
  // Add auto-generated footer at the end if missing
  if (!hasFooter) {
    sections.push(generateAutoFooter(config));
  }
  
  // Render all sections
  const sectionsHtml = sections.map(section => renderSection(section, globalStyles)).join('\n');
  
  // Form submission script
  const formScript = includeScripts ? `
    <script>
      async function handleFormSubmit(event, formId) {
        event.preventDefault();
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        try {
          const response = await fetch('/api/submit-form', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ formId, data })
          });
          
          if (response.ok) {
            form.style.display = 'none';
            document.getElementById(formId + '-success').style.display = 'block';
          } else {
            alert('Error submitting form. Please try again.');
          }
        } catch (error) {
          console.error('Form submission error:', error);
          alert('Error submitting form. Please try again.');
        }
      }
    </script>
  ` : '';
  
  if (!includeWrapper) {
    return sectionsHtml + formScript;
  }
  
  return `<!DOCTYPE html>
<html lang="${escapeHtml(metadata?.language || 'en')}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(metadata?.title || 'Landing Page')}</title>
  <meta name="description" content="${escapeHtml(metadata?.description || '')}">
  ${metadata?.favicon ? `<link rel="icon" href="${escapeHtml(metadata.favicon)}">` : ''}
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    html {
      scroll-behavior: smooth;
    }
    
    body {
      font-family: ${fontFamily};
      background-color: ${bgColor};
      color: ${textColor};
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    img {
      max-width: 100%;
      height: auto;
    }
    
    a {
      color: inherit;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      h1 { font-size: 2rem !important; }
      h2 { font-size: 1.75rem !important; }
      section { padding-top: 3rem !important; padding-bottom: 3rem !important; }
    }
  </style>
</head>
<body>
  ${sectionsHtml}
  ${formScript}
</body>
</html>`;
}

/**
 * Render landing page for preview (without full HTML wrapper)
 */
export function renderLandingPreview(config: LandingConfig): string {
  return renderLanding(config, { 
    isPreview: true, 
    includeWrapper: false,
    includeScripts: true 
  });
}

/**
 * Render landing page for publishing (with full HTML wrapper)
 */
export function renderLandingPublished(config: LandingConfig, metadata?: LandingConfig['metadata']): string {
  return renderLanding({ ...config, metadata: { ...config.metadata, ...metadata } }, { 
    isPreview: false, 
    includeWrapper: true,
    includeScripts: true 
  });
}
