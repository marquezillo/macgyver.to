/**
 * Router para manejar requests de subdominios
 * Sirve proyectos publicados por su subdominio y slug
 */

import { Router, Request, Response } from 'express';
import { 
  getPublishedLandingBySubdomainAndSlug, 
  getPublishedLandingsBySubdomain,
  getPublishedLandingsByUserId,
  createPublishedLanding,
  updatePublishedLanding,
  deletePublishedLanding,
  isSlugAvailable,
  getPublishedLandingStats,
  getChatById,
  getUserByOpenId
} from './db';
import { generateUserSubdomain, generateProjectSlug } from './subdomainMiddleware';
import { sdk } from './_core/sdk';
import { getPageTypeFromSlug, getTranslations, detectLandingLanguage } from './legalPageTranslations';

const router = Router();

/**
 * SVG Icon helper function - Maps icon names to inline SVG
 * Matches the Lucide icons used in the frontend
 */
function getIconSvg(iconName: string | undefined, color: string = '#6366f1'): string {
  if (!iconName) return '';
  const name = iconName.toLowerCase();
  
  const icons: Record<string, string> = {
    // Basic icons
    check: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    zap: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    shield: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    rocket: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
    star: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    globe: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    clock: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    lock: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    users: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    // Travel icons
    plane: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`,
    flight: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`,
    map: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    // Business icons
    briefcase: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
    card: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
    creditcard: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
    payment: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
    // Document icons
    document: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    file: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    mail: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    email: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    // Technology icons
    laptop: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/></svg>`,
    smartphone: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
    phone: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    // More icons
    home: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    heart: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`,
    award: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
    gift: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`,
    camera: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
    calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    // Fallback default
    default: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  };
  
  return icons[name] || icons['default'];
}

/**
 * Middleware que detecta si es un request de subdominio y sirve la landing
 */
export async function handleSubdomainRequest(req: Request, res: Response, next: Function) {
  // Si no es un request de subdominio, continuar normalmente
  if (!req.isSubdomainRequest || !req.subdomain) {
    return next();
  }
  
  // Ignorar rutas de API
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  const subdomain = req.subdomain;
  const path = req.path;
  
  // Extraer el slug del proyecto y la página del path
  // Formato: /{projectSlug}/{page}
  const pathParts = path.split('/').filter(Boolean);
  const projectSlug = pathParts[0];
  const pagePath = pathParts.slice(1).join('/') || 'home';
  
  // Si no hay slug de proyecto, mostrar lista de proyectos del usuario
  if (!projectSlug) {
    try {
      const landings = await getPublishedLandingsBySubdomain(subdomain);
      
      // Generar HTML de lista de proyectos
      const html = generateProjectListHTML(subdomain, landings);
      return res.send(html);
    } catch (error) {
      console.error('[Subdomain] Error fetching landings:', error);
      return res.status(500).send('Error loading projects');
    }
  }
  
  // Buscar la landing por subdomain + slug
  try {
    const landing = await getPublishedLandingBySubdomainAndSlug(subdomain, projectSlug);
    
    if (!landing) {
      return res.status(404).send(generate404HTML(subdomain, projectSlug));
    }
    
    // Verificar si es pública o si el usuario tiene acceso
    if (!landing.isPublic) {
      // TODO: Verificar autenticación del usuario
      return res.status(403).send('This landing is private');
    }
    
    // Generar y servir el HTML de la landing
    const html = generateLandingHTML(landing, pagePath);
    return res.send(html);
    
  } catch (error) {
    console.error('[Subdomain] Error serving landing:', error);
    return res.status(500).send('Error loading landing page');
  }
}

/**
 * Genera el HTML para una landing publicada
 */
function generateLandingHTML(landing: any, pagePath: string): string {
  const config = landing.config as any;
  const pages = (landing.pages || []) as any[];
  const theme = (landing.theme || {}) as any;
  const seo = (landing.seoMetadata || {}) as any;
  const projectSlug = landing.slug; // Slug del proyecto para construir URLs
  const landingLanguage = detectLandingLanguage(landing);
  
  // Determinar qué página mostrar
  let pageContent = '';
  let pageTitle = landing.name;
  
  if (pagePath === 'home' || pagePath === '') {
    // Página principal - renderizar todas las secciones
    pageContent = renderLandingSections(config, projectSlug, landingLanguage);
  } else {
    // Primero intentar encontrar la página por slug directo
    let page = pages.find((p: any) => p.slug === pagePath || p.path === `/${pagePath}`);
    
    // Si no se encuentra, intentar mapear el slug a un tipo de página legal (multiidioma)
    if (!page) {
      const pageType = getPageTypeFromSlug(pagePath);
      if (pageType) {
        // Buscar la página por tipo
        page = pages.find((p: any) => p.type === pageType);
      }
    }
    
    if (page) {
      // Pasar los estilos para que use los colores del tema
      const styles = config?.styles || theme || {};
      pageContent = renderInternalPage(page, styles);
      pageTitle = `${page.title} - ${landing.name}`;
    } else {
      pageContent = `<div class="min-h-screen flex items-center justify-center"><h1 class="text-2xl">Page not found</h1></div>`;
    }
  }
  
  // Extraer colores del tema
  const primaryColor = config?.styles?.primaryColor || theme?.primaryColor || '#3B82F6';
  const backgroundColor = config?.styles?.backgroundColor || theme?.backgroundColor || '#ffffff';
  const textColor = config?.styles?.textColor || theme?.textColor || '#1f2937';
  const fontFamily = config?.styles?.fontFamily || theme?.fontFamily || 'Inter';
  
  return `<!DOCTYPE html>
<html lang="${seo.language || 'es'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <meta name="description" content="${seo.description || landing.description || ''}">
  ${seo.keywords ? `<meta name="keywords" content="${seo.keywords}">` : ''}
  ${landing.favicon ? `<link rel="icon" href="${landing.favicon}">` : ''}
  
  <!-- Open Graph -->
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${seo.description || landing.description || ''}">
  ${seo.ogImage ? `<meta property="og:image" content="${seo.ogImage}">` : ''}
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  <style>
    :root {
      --primary-color: ${primaryColor};
      --background-color: ${backgroundColor};
      --text-color: ${textColor};
    }
    body {
      font-family: '${fontFamily}', sans-serif;
      background-color: var(--background-color);
      color: var(--text-color);
    }
    .btn-primary {
      background-color: var(--primary-color);
    }
    .btn-primary:hover {
      filter: brightness(1.1);
    }
    .text-primary {
      color: var(--primary-color);
    }
    .bg-primary {
      background-color: var(--primary-color);
    }
    .border-primary {
      border-color: var(--primary-color);
    }
  </style>
</head>
<body>
  ${pageContent}
  
  <!-- Analytics -->
  <script>
    // Track page view
    console.log('[Landing] Page viewed:', '${landing.subdomain}/${landing.slug}/${pagePath}');
  </script>
</body>
</html>`;
}

/**
 * Renderiza las secciones de una landing
 */
function renderLandingSections(config: any, projectSlug: string = '', language: string = 'es'): string {
  if (!config || !config.sections) {
    return '<div class="min-h-screen flex items-center justify-center"><p>No content available</p></div>';
  }
  
  let html = '';
  
  for (const section of config.sections) {
    html += renderSection(section, config.styles, projectSlug, language);
  }
  
  return html;
}

/**
 * Renderiza una sección individual
 */
function renderSection(section: any, styles: any, projectSlug: string = '', language: string = 'es'): string {
  const type = section.type;
  const content = section.content || {};
  const sectionStyles = section.styles || {};
  
  switch (type) {
    case 'header':
      return renderHeaderSection(content, styles, projectSlug);
    case 'hero':
      return renderHeroSection(content, styles, section.variant);
    case 'features':
      return renderFeaturesSection(content, styles, section.variant);
    case 'testimonials':
      return renderTestimonialsSection(content, styles);
    case 'pricing':
      return renderPricingSection(content, styles);
    case 'faq':
      return renderFAQSection(content, styles);
    case 'process':
      return renderProcessSection(content, styles);
    case 'form':
      return renderFormSection(content, styles);
    case 'stats':
      return renderStatsSection(content, styles);
    case 'gallery':
      return renderGallerySection(content, styles);
    case 'about':
      return renderAboutSection(content, styles);
    case 'cta':
      return renderCTASection(content, styles);
    case 'footer':
      return renderFooterSection(content, styles, projectSlug, language);
    default:
      return `<!-- Unknown section type: ${type} -->`;
  }
}

function renderHeaderSection(content: any, styles: any, projectSlug: string = ''): string {
  const logo = content.logo || { text: 'Logo' };
  const navItems = content.navItems || [];
  const cta = content.cta || {};
  const backgroundColor = content.backgroundColor || styles?.headerBackgroundColor || 'white';
  const textColor = content.textColor || styles?.headerTextColor || '';
  const isTransparent = content.transparent || content.variant === 'transparent';
  
  // Determinar clases de estilo
  const bgClass = isTransparent ? 'bg-transparent absolute w-full' : 'bg-white shadow-sm';
  const textClass = isTransparent || backgroundColor !== 'white' ? 'text-white' : 'text-gray-600';
  const hoverClass = isTransparent || backgroundColor !== 'white' ? 'hover:text-gray-200' : 'hover:text-gray-900';
  const logoTextClass = isTransparent || backgroundColor !== 'white' ? 'text-white' : '';
  
  return `
  <header class="${bgClass} sticky top-0 z-50" ${!isTransparent && backgroundColor !== 'white' ? `style="background-color: ${backgroundColor};"` : ''}>
    <div class="container mx-auto px-4 py-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        ${logo.image ? `<img src="${logo.image}" alt="${logo.text}" class="h-8">` : ''}
        <span class="font-bold text-xl ${logoTextClass}">${logo.text || ''}</span>
      </div>
      <nav class="hidden md:flex items-center gap-6">
        ${navItems.map((item: any) => `<a href="${item.href || '#'}" class="${textClass} ${hoverClass}">${item.label}</a>`).join('')}
      </nav>
      ${cta.text ? `<a href="${cta.href || '#'}" class="btn-primary text-white px-4 py-2 rounded-lg">${cta.text}</a>` : ''}
    </div>
  </header>`;
}

function renderHeroSection(content: any, styles: any, variant: string): string {
  const title = content.title || 'Welcome';
  const subtitle = content.subtitle || '';
  const badge = content.badge || '';
  const ctaText = content.ctaText || content.cta?.text || '';
  const ctaLink = content.ctaLink || content.cta?.href || '#';
  const secondaryCtaText = content.secondaryCtaText || '';
  const secondaryCtaLink = content.secondaryCtaLink || '#';
  const backgroundImage = content.backgroundImage || '';
  const imageUrl = content.imageUrl || content.image?.src || '';
  const stats = content.stats || [];
  const heroVariant = variant || content.variant || 'centered';
  
  // Determinar el estilo basado en la variante
  if (heroVariant === 'centered' || heroVariant === 'gradient') {
    return `
    <section class="relative min-h-[80vh] flex items-center justify-center overflow-hidden" ${backgroundImage ? `style="background-image: url('${backgroundImage}'); background-size: cover; background-position: center;"` : ''}>
      ${backgroundImage ? '<div class="absolute inset-0 bg-black/50"></div>' : ''}
      <div class="container mx-auto px-4 relative z-10 text-center">
        ${badge ? `<span class="inline-block px-4 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium mb-4">${badge}</span>` : ''}
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${backgroundImage ? 'text-white' : ''}">${title}</h1>
        <p class="text-xl max-w-2xl mx-auto mb-8 ${backgroundImage ? 'text-gray-200' : 'text-gray-600'}">${subtitle}</p>
        <div class="flex flex-wrap gap-4 justify-center">
          ${ctaText ? `<a href="${ctaLink}" class="btn-primary text-white px-8 py-3 rounded-lg text-lg inline-block">${ctaText}</a>` : ''}
          ${secondaryCtaText ? `<a href="${secondaryCtaLink}" class="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-lg text-lg inline-block border border-white/30 hover:bg-white/30">${secondaryCtaText}</a>` : ''}
        </div>
        ${stats.length > 0 ? `
        <div class="flex flex-wrap gap-8 justify-center mt-12">
          ${stats.map((s: any) => `
            <div class="text-center">
              <div class="text-3xl font-bold ${backgroundImage ? 'text-white' : ''}">${s.value}</div>
              <div class="text-sm ${backgroundImage ? 'text-gray-300' : 'text-gray-500'}">${s.label}</div>
            </div>
          `).join('')}
        </div>` : ''}
      </div>
    </section>`;
  }
  
  // Variantes split-left y split-right
  const isLeft = heroVariant === 'split-left';
  return `
  <section class="py-20 bg-gradient-to-br from-gray-50 to-white">
    <div class="container mx-auto px-4">
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div class="${isLeft ? 'order-1' : 'order-2 md:order-1'}">
          ${badge ? `<span class="inline-block px-4 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium mb-4">${badge}</span>` : ''}
          <h1 class="text-4xl md:text-5xl font-bold mb-6">${title}</h1>
          <p class="text-xl text-gray-600 mb-8">${subtitle}</p>
          <div class="flex flex-wrap gap-4">
            ${ctaText ? `<a href="${ctaLink}" class="btn-primary text-white px-8 py-3 rounded-lg text-lg inline-block">${ctaText}</a>` : ''}
            ${secondaryCtaText ? `<a href="${secondaryCtaLink}" class="bg-gray-100 text-gray-900 px-8 py-3 rounded-lg text-lg inline-block hover:bg-gray-200">${secondaryCtaText}</a>` : ''}
          </div>
          ${stats.length > 0 ? `
          <div class="flex flex-wrap gap-8 mt-8">
            ${stats.map((s: any) => `
              <div>
                <div class="text-2xl font-bold">${s.value}</div>
                <div class="text-sm text-gray-500">${s.label}</div>
              </div>
            `).join('')}
          </div>` : ''}
        </div>
        ${imageUrl ? `<div class="${isLeft ? 'order-2' : 'order-1 md:order-2'}"><img src="${imageUrl}" alt="${title}" class="rounded-lg shadow-xl w-full"></div>` : ''}
      </div>
    </div>
  </section>`;
}

function renderFeaturesSection(content: any, styles: any, variant: string): string {
  const title = content.title || 'Features';
  const subtitle = content.subtitle || '';
  // Support both 'items' (frontend) and 'features' (legacy) for features array
  const features = content.items || content.features || [];
  
  // Get styling from section styles
  const backgroundColor = styles?.backgroundColor || content.backgroundColor || '#1e293b';
  const textColor = styles?.textColor || content.textColor || '#ffffff';
  const accentColor = styles?.accentColor || content.accentColor || '#6366f1';
  const cardBackgroundColor = styles?.cardBackgroundColor || content.cardBackgroundColor || '#ffffff';
  
  // Determine if background is dark for text contrast
  const isDarkBg = backgroundColor.toLowerCase().includes('#1') ||
                   backgroundColor.toLowerCase().includes('#2') ||
                   backgroundColor.toLowerCase().includes('#0') ||
                   backgroundColor.toLowerCase() === 'dark';
  
  const titleColor = isDarkBg ? '#ffffff' : '#1f2937';
  const subtitleColor = isDarkBg ? 'rgba(255,255,255,0.7)' : '#6b7280';
  
  // Determine grid columns based on number of features
  const gridCols = features.length === 2 ? 'md:grid-cols-2' :
                   features.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
                   'md:grid-cols-2 lg:grid-cols-3';
  
  return `
  <section class="py-20" style="background-color: ${backgroundColor};">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold mb-4" style="color: ${titleColor};">${title}</h2>
        ${subtitle ? `<p class="text-lg max-w-2xl mx-auto" style="color: ${subtitleColor};">${subtitle}</p>` : ''}
      </div>
      <div class="grid ${gridCols} gap-6">
        ${features.map((f: any) => {
          const iconSvg = getIconSvg(f.icon, accentColor);
          return `
          <div class="p-6 md:p-8 rounded-2xl shadow-sm" style="background-color: ${cardBackgroundColor};">
            ${iconSvg ? `<div class="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4" style="background-color: ${accentColor}20;">${iconSvg}</div>` : ''}
            <h3 class="text-lg md:text-xl font-semibold mb-2" style="color: #1f2937;">${f.title || ''}</h3>
            <p class="text-sm md:text-base" style="color: #6b7280;">${f.description || ''}</p>
          </div>
        `}).join('')}
      </div>
    </div>
  </section>`;
}

function renderTestimonialsSection(content: any, styles: any): string {
  const title = content.title || 'What our customers say';
  const subtitle = content.subtitle || '';
  const badge = content.badge || '';
  // Support both 'testimonials' and 'items' as testimonials array
  const testimonials = content.testimonials || content.items || [];
  
  // Get styling from section styles
  const backgroundColor = styles?.backgroundColor || content.backgroundColor || '#f9fafb';
  const cardBackground = styles?.cardBackground || content.cardBackground || '#ffffff';
  const accentColor = styles?.accentColor || content.accentColor || '#6366f1';
  
  // Determine if background is light for title contrast
  const isLightBg = !backgroundColor.toLowerCase().includes('#0') &&
                    !backgroundColor.toLowerCase().includes('#1') &&
                    !backgroundColor.toLowerCase().includes('#2');
  
  const titleColor = isLightBg ? '#111827' : '#ffffff';
  const subtitleColor = isLightBg ? '#4b5563' : 'rgba(255,255,255,0.8)';
  
  // Card text colors - always dark for white cards
  const CARD_TEXT_COLORS = {
    name: '#1f2937',
    quote: '#374151',
    role: '#6b7280'
  };
  
  // Render stars
  const renderStars = (rating: number = 5) => {
    return Array(5).fill(0).map((_, i) => 
      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${i < rating ? '#facc15' : 'none'}" stroke="${i < rating ? '#facc15' : '#d1d5db'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
    ).join('');
  };
  
  return `
  <section class="py-16 md:py-24 px-4 sm:px-6 lg:px-8" style="background-color: ${backgroundColor};">
    <div class="container mx-auto">
      <div class="text-center mb-12">
        ${badge ? `<span class="inline-block px-4 py-1 rounded-full text-sm font-medium mb-4" style="background-color: ${accentColor}20; color: ${accentColor};">${badge}</span>` : ''}
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight" style="color: ${titleColor};">${title}</h2>
        ${subtitle ? `<p class="mt-4 text-lg max-w-2xl mx-auto" style="color: ${subtitleColor};">${subtitle}</p>` : ''}
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        ${testimonials.map((t: any) => {
          // Support both 'text' and 'quote' for testimonial content
          const testimonialText = t.text || t.quote || t.content || '';
          // Support both 'avatar' and 'image' for photo
          const avatarUrl = t.avatar || t.image || '';
          const initials = (t.name || 'A').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
          
          return `
          <div class="relative rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6" style="background-color: ${cardBackground};">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" class="absolute top-4 right-4 opacity-10"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
            ${t.rating ? `<div class="flex items-center gap-1 mb-4">${renderStars(t.rating)}</div>` : ''}
            <p class="mb-6 leading-relaxed text-base" style="color: ${CARD_TEXT_COLORS.quote};">"${testimonialText}"</p>
            <div class="flex items-center gap-4">
              ${avatarUrl 
                ? `<img src="${avatarUrl}" alt="${t.name}" class="w-12 h-12 rounded-full object-cover">` 
                : `<div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold" style="background-color: ${accentColor};">${initials}</div>`
              }
              <div>
                <p class="font-semibold" style="color: ${CARD_TEXT_COLORS.name};">${t.name || 'Anonymous'}</p>
                ${(t.role || t.company) ? `<p class="text-sm" style="color: ${CARD_TEXT_COLORS.role};">${t.role || ''}${t.role && t.company ? ', ' : ''}${t.company || ''}</p>` : ''}
              </div>
            </div>
          </div>
        `}).join('')}
      </div>
    </div>
  </section>`;
}

function renderPricingSection(content: any, styles: any): string {
  const title = content.title || 'Pricing';
  const subtitle = content.subtitle || '';
  const badge = content.badge || '';
  const plans = content.plans || [];
  const note = content.note || '';
  
  // Get styling from section styles
  const backgroundColor = styles?.backgroundColor || content.backgroundColor || '#ffffff';
  const accentColor = styles?.accentColor || content.accentColor || '#6366f1';
  const cardBg = styles?.cardBg || content.cardBg || '#ffffff';
  const highlightedBg = styles?.highlightedBg || content.highlightedBg || '#f8fafc';
  
  // Determine if background is dark for text contrast
  const isDarkBg = backgroundColor.toLowerCase().includes('#0') ||
                   backgroundColor.toLowerCase().includes('#1') ||
                   backgroundColor.toLowerCase().includes('#2');
  
  const titleColor = isDarkBg ? '#ffffff' : '#111827';
  const subtitleColor = isDarkBg ? 'rgba(255,255,255,0.8)' : '#6b7280';
  
  return `
  <section class="py-16 md:py-24 px-4 sm:px-6 lg:px-8" style="background-color: ${backgroundColor};">
    <div class="container mx-auto">
      <div class="text-center mb-12">
        ${badge ? `<span class="inline-block px-4 py-1 rounded-full text-sm font-medium mb-4" style="background-color: ${accentColor}20; color: ${accentColor};">${badge}</span>` : ''}
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight" style="color: ${titleColor};">${title}</h2>
        ${subtitle ? `<p class="mt-4 text-lg max-w-2xl mx-auto" style="color: ${subtitleColor};">${subtitle}</p>` : ''}
      </div>
      <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        ${plans.map((p: any) => {
          const isHighlighted = p.highlighted || p.featured;
          const planBg = isHighlighted ? highlightedBg : cardBg;
          const borderStyle = isHighlighted ? `border: 2px solid ${accentColor};` : 'border: 1px solid #e5e7eb;';
          
          return `
          <div class="relative rounded-2xl p-8 transition-all duration-300 hover:shadow-lg ${isHighlighted ? 'shadow-lg scale-105' : 'shadow-sm'}" style="background-color: ${planBg}; ${borderStyle}">
            ${p.badge ? `<span class="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white" style="background-color: ${accentColor};">${p.badge}</span>` : ''}
            <h3 class="text-xl font-bold mb-2" style="color: #1f2937;">${p.name || ''}</h3>
            <div class="flex items-baseline gap-1 mb-4">
              <span class="text-4xl font-bold" style="color: #1f2937;">${p.price || ''}</span>
              ${p.period ? `<span class="text-gray-500">${p.period}</span>` : ''}
            </div>
            ${p.description ? `<p class="text-gray-600 mb-6">${p.description}</p>` : ''}
            <ul class="space-y-3 mb-8">
              ${(p.features || []).map((f: string) => `
                <li class="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span class="text-gray-700">${f}</span>
                </li>
              `).join('')}
              ${(p.notIncluded || []).map((f: string) => `
                <li class="flex items-center gap-3 opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  <span class="text-gray-500">${f}</span>
                </li>
              `).join('')}
            </ul>
            <a href="${p.cta?.href || '#'}" class="w-full py-3 rounded-lg text-center block font-semibold transition-all hover:opacity-90" style="${isHighlighted ? `background-color: ${accentColor}; color: #ffffff;` : 'background-color: #f3f4f6; color: #1f2937;'}">${p.ctaText || p.cta?.text || 'Get Started'}</a>
          </div>
        `}).join('')}
      </div>
      ${note ? `<p class="text-center mt-8 text-sm" style="color: ${subtitleColor};">${note}</p>` : ''}
    </div>
  </section>`;
}

function renderFAQSection(content: any, styles: any): string {
  const title = content.title || 'Frequently Asked Questions';
  const subtitle = content.subtitle || '';
  // Support both 'items' (frontend) and 'faqs' (legacy) for FAQ items
  const faqs = content.items || content.faqs || [];
  
  // Get styling from section styles
  const backgroundColor = styles?.backgroundColor || content.backgroundColor || '#ffffff';
  const textColor = styles?.textColor || content.textColor || '#1f2937';
  const accentColor = styles?.accentColor || content.accentColor || '#6366f1';
  
  // Determine if background is dark for text contrast
  const isDarkBg = backgroundColor.toLowerCase().includes('#0') ||
                   backgroundColor.toLowerCase().includes('#1') ||
                   backgroundColor.toLowerCase().includes('#2');
  
  const titleColor = isDarkBg ? '#ffffff' : '#1f2937';
  const subtitleColor = isDarkBg ? '#d1d5db' : '#6b7280';
  const itemBg = isDarkBg ? 'rgba(255,255,255,0.05)' : '#ffffff';
  const borderColor = isDarkBg ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
  const answerBg = isDarkBg ? 'rgba(255,255,255,0.05)' : '#f9fafb';
  const answerTextColor = isDarkBg ? '#d1d5db' : '#6b7280';
  
  return `
  <section class="py-16 md:py-24 px-4 sm:px-6 lg:px-8" style="background-color: ${backgroundColor};">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight" style="color: ${titleColor};">${title}</h2>
        ${subtitle ? `<p class="mt-4 text-lg md:text-xl" style="color: ${subtitleColor};">${subtitle}</p>` : ''}
      </div>
      <div class="space-y-3">
        ${faqs.map((faq: any, i: number) => `
          <details class="rounded-xl overflow-hidden border" style="border-color: ${borderColor}; background-color: ${itemBg};" ${i === 0 ? 'open' : ''}>
            <summary class="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer font-semibold text-base md:text-lg" style="color: ${titleColor};">
              ${faq.question || ''}
              <span class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ml-4" style="background-color: ${isDarkBg ? 'rgba(255,255,255,0.1)' : '#f3f4f6'}; color: ${isDarkBg ? '#ffffff' : '#6b7280'};">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              </span>
            </summary>
            <div class="px-6 py-5 text-base leading-relaxed" style="background-color: ${answerBg}; color: ${answerTextColor};">${faq.answer || ''}</div>
          </details>
        `).join('')}
      </div>
    </div>
  </section>`;
}

function renderProcessSection(content: any, styles: any): string {
  const title = content.title || 'How It Works';
  const subtitle = content.subtitle || '';
  const steps = content.steps || content.items || [];
  
  // Get styling from section styles
  const backgroundColor = styles?.backgroundColor || content.backgroundColor || '#ffffff';
  const textColor = styles?.textColor || content.textColor || '#1f2937';
  const accentColor = styles?.accentColor || content.accentColor || '#f59e0b';
  
  // Determine if background is dark for text contrast
  const isDarkBg = backgroundColor.toLowerCase().includes('#1') ||
                   backgroundColor.toLowerCase().includes('#2') ||
                   backgroundColor.toLowerCase().includes('#0') ||
                   backgroundColor.toLowerCase() === 'dark';
  
  const titleColor = isDarkBg ? '#ffffff' : '#1f2937';
  const subtitleColor = isDarkBg ? 'rgba(255,255,255,0.7)' : '#6b7280';
  
  // Determine grid columns based on number of steps
  const gridCols = steps.length <= 3 ? 'md:grid-cols-3' : 'md:grid-cols-4';
  
  return `
  <section class="py-16 md:py-24" style="background-color: ${backgroundColor};">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12 md:mb-16">
        <h2 class="text-3xl md:text-4xl font-bold mb-4" style="color: ${titleColor};">${title}</h2>
        ${subtitle ? `<p class="text-lg md:text-xl max-w-2xl mx-auto" style="color: ${subtitleColor};">${subtitle}</p>` : ''}
      </div>
      <div class="grid ${gridCols} gap-8 max-w-5xl mx-auto">
        ${steps.map((step: any, i: number) => {
          const iconContent = step.icon ? getIconSvg(step.icon, '#ffffff') : (step.number || i + 1);
          return `
          <div class="text-center flex flex-col items-center">
            <div class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-lg" style="background-color: ${accentColor}; color: #ffffff;">
              ${step.icon ? iconContent : `<span>${step.number || i + 1}</span>`}
            </div>
            <h3 class="text-xl font-semibold mb-2" style="color: ${titleColor};">${step.title || ''}</h3>
            <p class="text-sm md:text-base leading-relaxed" style="color: ${subtitleColor};">${step.description || ''}</p>
          </div>
        `}).join('')}
      </div>
    </div>
  </section>`;
}

function renderFormSection(content: any, styles: any): string {
  const title = content.title || '';
  const subtitle = content.subtitle || '';
  const fields = content.fields || [
    { id: 'name', label: 'Nombre completo', type: 'text', placeholder: 'Tu nombre', required: true },
    { id: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'tu@email.com', required: true },
    { id: 'phone', label: 'Teléfono', type: 'tel', placeholder: '+34 600 000 000' },
    { id: 'message', label: 'Mensaje', type: 'textarea', placeholder: 'Tu mensaje...' },
  ];
  const submitText = content.submitText || 'Enviar';
  
  // Get styling from section styles
  const backgroundColor = styles?.backgroundColor || content.backgroundColor || '#f9fafb';
  const textColor = styles?.textColor || content.textColor || '#1f2937';
  const buttonColor = styles?.buttonColor || content.buttonColor || '#6366f1';
  const cardBackground = styles?.cardBackground || content.cardBackground || '#ffffff';
  
  // Determine if background is dark for text contrast
  const isDarkBg = backgroundColor.toLowerCase().includes('#0') ||
                   backgroundColor.toLowerCase().includes('#1') ||
                   backgroundColor.toLowerCase().includes('#2');
  
  const titleColor = isDarkBg ? '#ffffff' : '#1f2937';
  const subtitleColor = isDarkBg ? 'rgba(255,255,255,0.8)' : '#6b7280';
  
  // Render field based on type
  const renderField = (field: any) => {
    const baseInputClasses = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';
    
    if (field.type === 'textarea') {
      return `<textarea id="${field.id}" name="${field.id}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} rows="4" class="${baseInputClasses} resize-none"></textarea>`;
    } else if (field.type === 'select') {
      const options = (field.options || []).map((opt: any) => {
        const value = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        return `<option value="${value}">${label}</option>`;
      }).join('');
      return `<select id="${field.id}" name="${field.id}" ${field.required ? 'required' : ''} class="${baseInputClasses}"><option value="">${field.placeholder || 'Selecciona una opción'}</option>${options}</select>`;
    } else {
      return `<input type="${field.type || 'text'}" id="${field.id}" name="${field.id}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} class="${baseInputClasses}">`;
    }
  };
  
  return `
  <section id="form" class="py-10 md:py-16 px-4 sm:px-6 lg:px-8" style="background-color: ${backgroundColor};">
    <div class="max-w-2xl mx-auto">
      ${(title || subtitle) ? `
      <div class="text-center mb-6 md:mb-10">
        ${title ? `<h2 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight" style="color: ${titleColor};">${title}</h2>` : ''}
        ${subtitle ? `<p class="mt-4 text-lg" style="color: ${subtitleColor};">${subtitle}</p>` : ''}
      </div>` : ''}
      <div class="rounded-xl shadow-lg p-4 md:p-8" style="background-color: ${cardBackground};">
        <form class="space-y-6" action="/api/form-submit" method="POST">
          ${fields.map((field: any) => `
            <div class="space-y-2">
              ${field.label ? `<label for="${field.id}" class="block text-sm font-medium" style="color: #374151;">${field.label}${field.required ? '<span class="text-red-500 ml-1">*</span>' : ''}</label>` : ''}
              ${renderField(field)}
            </div>
          `).join('')}
          <button type="submit" class="w-full py-3 rounded-lg text-lg font-semibold transition-all hover:opacity-90" style="background-color: ${buttonColor}; color: #ffffff;">${submitText}</button>
        </form>
      </div>
    </div>
  </section>`;
}

function renderStatsSection(content: any, styles: any): string {
  const title = content.title || '';
  const subtitle = content.subtitle || '';
  const stats = content.items || [
    { value: '10,000+', label: 'Happy Customers', icon: 'users' },
    { value: '98%', label: 'Satisfaction Rate', icon: 'star' },
    { value: '24/7', label: 'Support Available', icon: 'clock' },
    { value: '50+', label: 'Awards Won', icon: 'award' }
  ];
  
  // Get styling from section styles
  const backgroundColor = styles?.backgroundColor || content.backgroundColor || '';
  const textColor = styles?.textColor || content.textColor || '#ffffff';
  const accentColor = styles?.accentColor || content.accentColor || '#ffffff';
  const cardBg = styles?.cardBg || content.cardBg || '';
  
  // Determine if background is dark (default to dark gradient if no bg specified)
  const isDark = !backgroundColor || 
                 backgroundColor.toLowerCase().includes('#0') ||
                 backgroundColor.toLowerCase().includes('#1') ||
                 backgroundColor.toLowerCase().includes('#2');
  
  const effectiveTextColor = isDark ? '#ffffff' : '#1f2937';
  const subtitleTextColor = isDark ? '#d1d5db' : '#6b7280';
  const cardBackground = cardBg || (isDark ? 'rgba(255,255,255,0.05)' : '#f9fafb');
  const iconBg = isDark ? 'rgba(255,255,255,0.1)' : `${accentColor}20`;
  const iconColor = isDark ? '#ffffff' : accentColor;
  
  // Determine grid columns based on number of stats
  const gridCols = stats.length === 3 ? 'md:grid-cols-3' : 
                   stats.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-4';
  
  // Background style
  const backgroundStyle = backgroundColor 
    ? `background-color: ${backgroundColor};` 
    : 'background: linear-gradient(to bottom right, #111827, #1f2937);';
  
  return `
  <section class="py-16 md:py-24 px-4 sm:px-6 lg:px-8" style="${backgroundStyle}">
    <div class="max-w-7xl mx-auto">
      ${(title || subtitle) ? `
      <div class="text-center mb-12">
        ${title ? `<h2 class="text-3xl md:text-4xl font-bold tracking-tight" style="color: ${effectiveTextColor};">${title}</h2>` : ''}
        ${subtitle ? `<p class="mt-4 text-lg max-w-2xl mx-auto" style="color: ${subtitleTextColor};">${subtitle}</p>` : ''}
      </div>` : ''}
      <div class="grid ${gridCols} gap-8">
        ${stats.map((stat: any) => {
          const iconSvg = stat.icon ? getIconSvg(stat.icon, iconColor) : '';
          return `
          <div class="text-center p-6 rounded-2xl" style="background-color: ${cardBackground};">
            ${iconSvg ? `<div class="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4" style="background-color: ${iconBg};">${iconSvg}</div>` : ''}
            <div class="text-4xl md:text-5xl font-bold tracking-tight" style="color: ${effectiveTextColor};">${stat.value || ''}</div>
            <div class="mt-2 text-sm md:text-base font-medium" style="color: ${subtitleTextColor};">${stat.label || ''}</div>
          </div>
        `}).join('')}
      </div>
    </div>
  </section>`;
}

function renderGallerySection(content: any, styles: any): string {
  const title = content.title || 'Gallery';
  const subtitle = content.subtitle || '';
  const images = content.images || content.items || [];
  const layout = content.layout || 'grid';
  
  // Get styling from section styles
  const backgroundColor = styles?.backgroundColor || content.backgroundColor || '#f9fafb';
  const textColor = styles?.textColor || content.textColor || '#1f2937';
  const accentColor = styles?.accentColor || content.accentColor || '#6366f1';
  
  // Determine if background is dark for text contrast
  const isDarkBg = backgroundColor.toLowerCase().includes('#0') ||
                   backgroundColor.toLowerCase().includes('#1') ||
                   backgroundColor.toLowerCase().includes('#2');
  
  const titleColor = isDarkBg ? '#ffffff' : '#1f2937';
  const subtitleColor = isDarkBg ? '#d1d5db' : '#6b7280';
  
  // Determine grid layout
  const gridClass = layout === 'masonry' ? 'columns-1 md:columns-2 lg:columns-3 gap-6' : 'grid md:grid-cols-3 gap-6';
  
  return `
  <section class="py-16 md:py-24 px-4 sm:px-6 lg:px-8" style="background-color: ${backgroundColor};">
    <div class="container mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight" style="color: ${titleColor};">${title}</h2>
        ${subtitle ? `<p class="mt-4 text-lg max-w-2xl mx-auto" style="color: ${subtitleColor};">${subtitle}</p>` : ''}
      </div>
      <div class="${gridClass}">
        ${images.map((img: any, index: number) => {
          const imgSrc = img.url || img.src || '';
          const imgAlt = img.alt || img.caption || `Gallery image ${index + 1}`;
          const hasCaption = img.caption || img.alt;
          
          return `
          <div class="group relative overflow-hidden rounded-xl shadow-lg ${layout === 'masonry' ? 'mb-6 break-inside-avoid' : ''}">
            <img src="${imgSrc}" alt="${imgAlt}" class="w-full ${layout === 'masonry' ? 'h-auto' : 'h-64'} object-cover transition-transform duration-300 group-hover:scale-105">
            ${hasCaption ? `
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
              <p class="p-4 text-white text-sm font-medium">${img.caption || img.alt}</p>
            </div>` : ''}
          </div>
        `}).join('')}
      </div>
    </div>
  </section>`;
}

function renderAboutSection(content: any, styles: any): string {
  const title = content.title || 'About Us';
  const description = content.description || '';
  const team = content.team || [];
  
  return `
  <section class="py-20 bg-white">
    <div class="container mx-auto px-4">
      <div class="max-w-3xl mx-auto text-center mb-12">
        <h2 class="text-3xl font-bold mb-4">${title}</h2>
        <p class="text-gray-600 text-lg">${description}</p>
      </div>
      ${team.length > 0 ? `
      <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        ${team.map((member: any) => `
          <div class="text-center">
            ${member.image ? `<img src="${member.image}" alt="${member.name}" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover">` : `<div class="w-32 h-32 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center text-gray-400">No image</div>`}
            <h3 class="text-xl font-semibold">${member.name || ''}</h3>
            <p class="text-gray-600">${member.role || ''}</p>
            ${member.bio ? `<p class="text-sm text-gray-500 mt-2">${member.bio}</p>` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}
    </div>
  </section>`;
}

function renderCTASection(content: any, styles: any): string {
  const title = content.title || 'Ready to get started?';
  const subtitle = content.subtitle || '';
  const ctaText = content.ctaText || content.cta?.text || 'Get Started';
  const ctaHref = content.ctaHref || content.cta?.href || '#';
  const secondaryCtaText = content.secondaryCtaText || '';
  
  // Get styling from section styles
  const backgroundColor = styles?.backgroundColor || content.backgroundColor || '#6366f1';
  const textColor = styles?.textColor || content.textColor || '#ffffff';
  const buttonColor = styles?.buttonColor || content.buttonColor || '#ffffff';
  const gradientFrom = styles?.gradientFrom || content.gradientFrom;
  const gradientTo = styles?.gradientTo || content.gradientTo;
  
  const hasGradient = gradientFrom && gradientTo;
  
  // Determine if background is light for text contrast
  const isLightBg = backgroundColor.toLowerCase().includes('#f') ||
                    backgroundColor.toLowerCase().includes('#e') ||
                    backgroundColor.toLowerCase().includes('#d') ||
                    backgroundColor.toLowerCase().includes('#c') ||
                    backgroundColor.toLowerCase().includes('white');
  
  const effectiveTextColor = textColor || (isLightBg ? '#111827' : '#ffffff');
  const subtitleColor = isLightBg ? '#4b5563' : 'rgba(255,255,255,0.9)';
  const buttonTextColor = isLightBg ? '#ffffff' : '#111827';
  const effectiveButtonColor = buttonColor || (isLightBg ? '#111827' : '#ffffff');
  
  const backgroundStyle = hasGradient 
    ? `background: linear-gradient(135deg, ${gradientFrom}, ${gradientTo});`
    : `background-color: ${backgroundColor};`;
  
  return `
  <section class="py-10 md:py-16 px-4 sm:px-6 lg:px-8" style="${backgroundStyle}">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight" style="color: ${effectiveTextColor};">${title}</h2>
      ${subtitle ? `<p class="mt-3 md:mt-4 text-base md:text-lg max-w-2xl mx-auto" style="color: ${subtitleColor};">${subtitle}</p>` : ''}
      <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <a href="${ctaHref}" class="inline-flex items-center justify-center px-8 py-3 rounded-lg text-lg font-semibold transition-all hover:opacity-90" style="background-color: ${effectiveButtonColor}; color: ${buttonTextColor};">
          ${ctaText}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        ${secondaryCtaText ? `<a href="#" class="inline-flex items-center justify-center px-8 py-3 rounded-lg text-lg font-semibold border-2 transition-all hover:opacity-80" style="border-color: ${effectiveTextColor}; color: ${effectiveTextColor}; background-color: transparent;">${secondaryCtaText}</a>` : ''}
      </div>
    </div>
  </section>`;
}

function renderFooterSection(content: any, styles: any, projectSlug: string = '', language: string = 'es'): string {
  const logo = content.logo || {};
  const links = content.links || [];
  const social = content.social || [];
  const copyright = content.copyright || '';
  const businessName = logo.text || 'Nuestra Empresa';
  const currentYear = new Date().getFullYear();
  
  // Obtener traducciones según el idioma
  const translations = getTranslations(language);
  
  // Construir base URL para las páginas internas
  const baseUrl = projectSlug ? `/${projectSlug}` : '';
  
  // Links legales por defecto con el slug del proyecto y traducciones
  const legalLinks = [
    { label: translations.terms.navLabel, href: `${baseUrl}/${translations.terms.slug}` },
    { label: translations.privacy.navLabel, href: `${baseUrl}/${translations.privacy.slug}` },
    { label: translations.contact.navLabel, href: `${baseUrl}/${translations.contact.slug}` },
    { label: translations.about.navLabel, href: `${baseUrl}/${translations.about.slug}` },
  ];
  
  return `
  <footer class="bg-gray-900 text-white py-12">
    <div class="container mx-auto px-4">
      <div class="grid md:grid-cols-4 gap-8 mb-8">
        <div>
          ${logo.image ? `<img src="${logo.image}" alt="${logo.text}" class="h-8 mb-4">` : ''}
          <span class="font-bold text-xl">${businessName}</span>
          <p class="text-gray-400 mt-2 text-sm">${translations.labels.allRightsReserved}</p>
        </div>
        ${links.length > 0 ? links.map((group: any) => `
          <div>
            <h4 class="font-semibold mb-4">${group.title || ''}</h4>
            <ul class="space-y-2">
              ${(group.items || []).map((item: any) => `<li><a href="${item.href || '#'}" class="text-gray-400 hover:text-white">${item.label}</a></li>`).join('')}
            </ul>
          </div>
        `).join('') : `
          <div>
            <h4 class="font-semibold mb-4">${translations.labels.navigation}</h4>
            <ul class="space-y-2">
              <li><a href="${baseUrl}/" class="text-gray-400 hover:text-white">${translations.labels.home}</a></li>
              <li><a href="${baseUrl}/${translations.about.slug}" class="text-gray-400 hover:text-white">${translations.about.navLabel}</a></li>
              <li><a href="${baseUrl}/${translations.contact.slug}" class="text-gray-400 hover:text-white">${translations.contact.navLabel}</a></li>
            </ul>
          </div>
        `}
        <div>
          <h4 class="font-semibold mb-4">${translations.labels.legal}</h4>
          <ul class="space-y-2">
            ${legalLinks.map(link => `<li><a href="${link.href}" class="text-gray-400 hover:text-white">${link.label}</a></li>`).join('')}
          </ul>
        </div>
      </div>
      <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-400">${copyright || `© ${currentYear} ${businessName}. ${translations.labels.allRightsReserved}`}</p>
        <div class="flex gap-4 mt-4 md:mt-0">
          ${social.length > 0 ? social.map((s: any) => `<a href="${s.href || '#'}" class="text-gray-400 hover:text-white">${s.icon || s.platform}</a>`).join('') : `
            <a href="${baseUrl}/${translations.terms.slug}" class="text-gray-400 hover:text-white text-sm">${translations.terms.navLabel.split(' ')[0]}</a>
            <a href="${baseUrl}/${translations.privacy.slug}" class="text-gray-400 hover:text-white text-sm">${translations.privacy.navLabel.split(' ')[0]}</a>
          `}
        </div>
      </div>
    </div>
  </footer>`;
}

/**
 * Renderiza una página interna (términos, privacidad, contacto, about)
 */
function renderInternalPage(page: any, styles: any = {}): string {
  const pageData = page.data || {};
  const content = pageData.content || page.content || '';
  const primaryColor = styles?.primaryColor || '#3B82F6';
  
  // Si la página tiene contenido HTML pre-generado, usarlo directamente
  if (content && content.includes('<')) {
    return `
    <div class="min-h-screen py-20 bg-white">
      <div class="container mx-auto px-4 max-w-4xl">
        <h1 class="text-4xl font-bold mb-8 text-gray-900">${page.title || ''}</h1>
        <div class="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-primary">
          ${content}
        </div>
      </div>
    </div>`;
  }
  
  // Renderizar páginas por tipo
  switch (page.type) {
    case 'terms':
      return renderTermsPage(page, styles);
    case 'privacy':
      return renderPrivacyPage(page, styles);
    case 'contact':
      return renderContactPage(page, styles);
    case 'about':
      return renderAboutPage(page, styles);
    default:
      return `
      <div class="min-h-screen py-20 bg-white">
        <div class="container mx-auto px-4 max-w-4xl">
          <h1 class="text-4xl font-bold mb-8 text-gray-900">${page.title || ''}</h1>
          <div class="prose prose-lg max-w-none">
            ${content || '<p class="text-gray-600">Contenido no disponible.</p>'}
          </div>
        </div>
      </div>`;
  }
}

/**
 * Renderiza página de Términos y Condiciones
 */
function renderTermsPage(page: any, styles: any): string {
  const data = page.data || {};
  const businessName = data.businessName || 'Nuestra Empresa';
  const lastUpdated = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return `
  <div class="min-h-screen py-20 bg-white">
    <div class="container mx-auto px-4 max-w-4xl">
      <h1 class="text-4xl font-bold mb-4 text-gray-900">Términos y Condiciones</h1>
      <p class="text-gray-500 mb-8">Última actualización: ${lastUpdated}</p>
      
      <div class="prose prose-lg max-w-none">
        <p class="text-gray-600 mb-6">
          Bienvenido a <strong class="text-gray-900">${businessName}</strong>. Estos términos y condiciones describen las reglas 
          y regulaciones para el uso de nuestro sitio web.
        </p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-900">1. Aceptación de los Términos</h2>
        <p class="text-gray-600 mb-6">
          Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos Términos y Condiciones de uso, 
          todas las leyes y regulaciones aplicables.
        </p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-900">2. Uso de la Licencia</h2>
        <p class="text-gray-600 mb-6">
          Se concede permiso para descargar temporalmente una copia de los materiales en el sitio web de ${businessName} 
          solo para visualización transitoria personal y no comercial.
        </p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-900">3. Descargo de Responsabilidad</h2>
        <p class="text-gray-600 mb-6">
          Los materiales en el sitio web de ${businessName} se proporcionan "tal cual". ${businessName} no ofrece garantías, 
          expresas o implícitas.
        </p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-900">4. Limitaciones</h2>
        <p class="text-gray-600 mb-6">
          En ningún caso ${businessName} o sus proveedores serán responsables de ningún daño que surja del uso 
          o la imposibilidad de usar los materiales en el sitio web.
        </p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-900">5. Modificaciones</h2>
        <p class="text-gray-600 mb-6">
          ${businessName} puede revisar estos términos de servicio en cualquier momento sin previo aviso.
        </p>
        
        ${data.contactEmail ? `
        <h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-900">Contacto</h2>
        <p class="text-gray-600 mb-6">
          Si tiene alguna pregunta, contáctenos en: 
          <a href="mailto:${data.contactEmail}" class="text-primary hover:underline">${data.contactEmail}</a>
        </p>
        ` : ''}
      </div>
      
      <div class="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500">
        <p>© ${new Date().getFullYear()} ${businessName}. Todos los derechos reservados.</p>
      </div>
    </div>
  </div>`;
}

/**
 * Renderiza página de Política de Privacidad
 */
function renderPrivacyPage(page: any, styles: any): string {
  const data = page.data || {};
  const businessName = data.businessName || 'Nuestra Empresa';
  const lastUpdated = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return `
  <div class="min-h-screen py-20 bg-white">
    <div class="container mx-auto px-4 max-w-4xl">
      <h1 class="text-4xl font-bold mb-4 text-gray-900">Política de Privacidad</h1>
      <p class="text-gray-500 mb-8">Última actualización: ${lastUpdated}</p>
      
      <div class="prose prose-lg max-w-none">
        <p class="text-gray-600 mb-6">
          En <strong class="text-gray-900">${businessName}</strong> nos tomamos muy en serio la privacidad de nuestros usuarios. 
          Esta Política de Privacidad describe cómo recopilamos, usamos y protegemos su información personal.
        </p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-900">1. Información que Recopilamos</h2>
        <ul class="list-disc pl-6 mb-6 space-y-2 text-gray-600">
          <li><strong>Información de contacto:</strong> nombre, email, teléfono</li>
          <li><strong>Información de uso:</strong> cómo interactúa con nuestro sitio</li>
          <li><strong>Información técnica:</strong> IP, navegador, dispositivo</li>
          <li><strong>Cookies:</strong> archivos de datos en su dispositivo</li>
        </ul>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-900">2. Cómo Usamos su Información</h2>
        <ul class="list-disc pl-6 mb-6 space-y-2 text-gray-600">
          <li>Proporcionar y mejorar nuestros servicios</li>
          <li>Comunicarnos con usted</li>
          <li>Personalizar su experiencia</li>
          <li>Cumplir con obligaciones legales</li>
        </ul>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-900">3. Protección de Datos</h2>
        <p class="text-gray-600 mb-6">
          Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal.
        </p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-900">4. Sus Derechos</h2>
        <ul class="list-disc pl-6 mb-6 space-y-2 text-gray-600">
          <li>Acceder a sus datos personales</li>
          <li>Rectificar datos inexactos</li>
          <li>Solicitar la eliminación de sus datos</li>
          <li>Oponerse al procesamiento</li>
        </ul>
        
        ${data.contactEmail ? `
        <h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-900">Contacto</h2>
        <p class="text-gray-600 mb-6">
          Para ejercer sus derechos, contáctenos en: 
          <a href="mailto:${data.contactEmail}" class="text-primary hover:underline">${data.contactEmail}</a>
        </p>
        ` : ''}
      </div>
      
      <div class="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500">
        <p>© ${new Date().getFullYear()} ${businessName}. Todos los derechos reservados.</p>
      </div>
    </div>
  </div>`;
}

/**
 * Renderiza página de Contacto
 */
function renderContactPage(page: any, styles: any): string {
  const data = page.data || {};
  const businessName = data.businessName || 'Nuestra Empresa';
  const primaryColor = styles?.primaryColor || '#3B82F6';
  
  return `
  <div class="min-h-screen py-20 bg-white">
    <div class="container mx-auto px-4 max-w-4xl">
      <h1 class="text-4xl font-bold mb-4 text-center text-gray-900">Contacto</h1>
      <p class="text-lg text-gray-600 mb-12 text-center">
        ¿Tienes alguna pregunta? Nos encantaría escucharte.
      </p>
      
      <div class="grid md:grid-cols-2 gap-12">
        <!-- Información de contacto -->
        <div class="space-y-6">
          <h2 class="text-2xl font-semibold mb-6 text-gray-900">Información de Contacto</h2>
          
          ${data.contactEmail ? `
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5" style="color: ${primaryColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Email</h3>
              <a href="mailto:${data.contactEmail}" class="hover:underline" style="color: ${primaryColor}">${data.contactEmail}</a>
            </div>
          </div>
          ` : ''}
          
          ${data.phone ? `
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5" style="color: ${primaryColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Teléfono</h3>
              <a href="tel:${data.phone}" class="hover:underline" style="color: ${primaryColor}">${data.phone}</a>
            </div>
          </div>
          ` : ''}
          
          ${data.address ? `
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5" style="color: ${primaryColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Dirección</h3>
              <p class="text-gray-600">${data.address}</p>
            </div>
          </div>
          ` : ''}
          
          <div class="pt-6">
            <h3 class="font-semibold text-gray-900 mb-4">Horario de Atención</h3>
            <div class="space-y-2 text-gray-600">
              <p>Lunes - Viernes: 9:00 - 18:00</p>
              <p>Sábado: 10:00 - 14:00</p>
              <p>Domingo: Cerrado</p>
            </div>
          </div>
        </div>
        
        <!-- Formulario de contacto -->
        <div class="bg-gray-50 p-8 rounded-2xl">
          <h2 class="text-2xl font-semibold mb-6 text-gray-900">Envíanos un Mensaje</h2>
          <form class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent" style="--tw-ring-color: ${primaryColor}" placeholder="Tu nombre">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent" placeholder="tu@email.com">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
              <textarea rows="4" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent" placeholder="Escribe tu mensaje..."></textarea>
            </div>
            <button type="submit" class="w-full text-white py-3 px-6 rounded-lg font-semibold transition-colors" style="background-color: ${primaryColor}">
              Enviar Mensaje
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>`;
}

/**
 * Renderiza página Sobre Nosotros
 */
function renderAboutPage(page: any, styles: any): string {
  const data = page.data || {};
  const businessName = data.businessName || 'Nuestra Empresa';
  const description = data.description || `En ${businessName} nos dedicamos a ofrecer los mejores servicios a nuestros clientes.`;
  const primaryColor = styles?.primaryColor || '#3B82F6';
  
  return `
  <div class="min-h-screen py-20 bg-white">
    <div class="container mx-auto px-4 max-w-4xl">
      <h1 class="text-4xl font-bold mb-4 text-center text-gray-900">Sobre Nosotros</h1>
      <p class="text-xl text-gray-600 mb-12 text-center leading-relaxed">
        ${description}
      </p>
      
      <div class="grid md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 class="text-2xl font-semibold mb-4 text-gray-900">Nuestra Misión</h2>
          <p class="text-gray-600 leading-relaxed">
            Nuestra misión es proporcionar soluciones excepcionales que superen las expectativas de nuestros 
            clientes, manteniendo los más altos estándares de calidad e innovación.
          </p>
        </div>
        <div>
          <h2 class="text-2xl font-semibold mb-4 text-gray-900">Nuestra Visión</h2>
          <p class="text-gray-600 leading-relaxed">
            Aspiramos a ser líderes reconocidos en nuestro sector, destacando por nuestra excelencia, 
            integridad y compromiso con el desarrollo sostenible.
          </p>
        </div>
      </div>
      
      <div class="bg-gray-50 rounded-2xl p-8 mb-16">
        <h2 class="text-2xl font-semibold mb-6 text-center text-gray-900">Nuestros Valores</h2>
        <div class="grid md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style="background-color: ${primaryColor}20">
              <svg class="w-8 h-8" style="color: ${primaryColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="font-semibold mb-2 text-gray-900">Calidad</h3>
            <p class="text-gray-600 text-sm">Excelencia en cada detalle</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style="background-color: ${primaryColor}20">
              <svg class="w-8 h-8" style="color: ${primaryColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <h3 class="font-semibold mb-2 text-gray-900">Compromiso</h3>
            <p class="text-gray-600 text-sm">Dedicación total al cliente</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style="background-color: ${primaryColor}20">
              <svg class="w-8 h-8" style="color: ${primaryColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h3 class="font-semibold mb-2 text-gray-900">Innovación</h3>
            <p class="text-gray-600 text-sm">Siempre mejorando</p>
          </div>
        </div>
      </div>
      
      <div class="text-center">
        <h2 class="text-2xl font-semibold mb-4 text-gray-900">¿Quieres saber más?</h2>
        <p class="text-gray-600 mb-6">
          Estamos aquí para responder todas tus preguntas.
        </p>
        <a href="/contacto" class="inline-block text-white py-3 px-8 rounded-lg font-semibold transition-colors" style="background-color: ${primaryColor}">
          Contáctanos
        </a>
      </div>
    </div>
  </div>`;
}

/**
 * Genera HTML para la lista de proyectos de un usuario
 */
function generateProjectListHTML(subdomain: string, landings: any[]): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Projects - ${subdomain}.macgyver.to</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="container mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold mb-8">Published Projects</h1>
    ${landings.length === 0 ? `
      <p class="text-gray-500">No published projects yet.</p>
    ` : `
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${landings.map(l => `
          <a href="/${l.slug}" class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <h2 class="text-xl font-semibold mb-2">${l.name}</h2>
            <p class="text-gray-600 text-sm mb-4">${l.description || 'No description'}</p>
            <div class="flex items-center justify-between text-sm text-gray-400">
              <span>${l.viewCount || 0} views</span>
              <span>${new Date(l.publishedAt).toLocaleDateString()}</span>
            </div>
          </a>
        `).join('')}
      </div>
    `}
  </div>
</body>
</html>`;
}

/**
 * Genera HTML para página 404
 */
function generate404HTML(subdomain: string, slug: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Page Not Found</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center">
  <div class="text-center">
    <h1 class="text-6xl font-bold text-gray-300 mb-4">404</h1>
    <p class="text-xl text-gray-600 mb-8">The project "${slug}" was not found.</p>
    <a href="/" class="text-blue-600 hover:underline">← Back to projects</a>
  </div>
</body>
</html>`;
}

// ============================================
// API ENDPOINTS
// ============================================

/**
 * API para obtener información del subdominio actual
 */
router.get('/api/subdomain/info', (req: Request, res: Response) => {
  res.json({
    isSubdomain: req.isSubdomainRequest || false,
    subdomain: req.subdomain || null,
    host: req.hostname,
    path: req.path
  });
});

/**
 * API para generar el subdominio de un usuario
 */
router.get('/api/subdomain/generate/:userId', (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'userId inválido' });
  }
  
  const subdomain = generateUserSubdomain(userId);
  res.json({
    userId,
    subdomain,
    baseUrl: `https://${subdomain}.macgyver.to`
  });
});

/**
 * API para publicar una landing
 */
router.post('/api/landing/publish', async (req: Request, res: Response) => {
  try {
    // Verificar autenticación
    let user;
    try {
      user = await sdk.authenticateRequest(req);
    } catch {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { chatId, name, slug, config, pages, theme, seoMetadata, favicon, description } = req.body;
    
    if (!name || !config) {
      return res.status(400).json({ error: 'name and config are required' });
    }
    
    // Generar subdomain del usuario
    const subdomain = generateUserSubdomain(user.id);
    
    // Generar slug si no se proporciona
    const finalSlug = slug || generateProjectSlug(name, Date.now());
    
    // Verificar disponibilidad del slug
    const available = await isSlugAvailable(subdomain, finalSlug);
    if (!available) {
      return res.status(409).json({ error: 'Slug already in use' });
    }
    
    // Crear la landing publicada
    const landing = await createPublishedLanding({
      userId: user.id,
      chatId,
      subdomain,
      slug: finalSlug,
      name,
      description,
      config,
      pages,
      theme,
      seoMetadata,
      favicon,
    });
    
    res.json({
      success: true,
      landing,
      url: `https://${subdomain}.macgyver.to/${finalSlug}`
    });
    
  } catch (error: any) {
    console.error('[API] Error publishing landing:', error);
    res.status(500).json({ error: error.message || 'Failed to publish landing' });
  }
});

/**
 * API para obtener las landings publicadas del usuario
 */
router.get('/api/landing/my-landings', async (req: Request, res: Response) => {
  try {
    let user;
    try {
      user = await sdk.authenticateRequest(req);
    } catch {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const landings = await getPublishedLandingsByUserId(user.id);
    const stats = await getPublishedLandingStats(user.id);
    const subdomain = generateUserSubdomain(user.id);
    
    res.json({
      landings,
      stats,
      subdomain,
      baseUrl: `https://${subdomain}.macgyver.to`
    });
    
  } catch (error: any) {
    console.error('[API] Error fetching landings:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch landings' });
  }
});

/**
 * API para actualizar una landing publicada
 */
router.put('/api/landing/:id', async (req: Request, res: Response) => {
  try {
    let user;
    try {
      user = await sdk.authenticateRequest(req);
    } catch {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const landingId = parseInt(req.params.id, 10);
    if (isNaN(landingId)) {
      return res.status(400).json({ error: 'Invalid landing ID' });
    }
    
    const updated = await updatePublishedLanding(landingId, user.id, req.body);
    
    if (!updated) {
      return res.status(404).json({ error: 'Landing not found or access denied' });
    }
    
    res.json({ success: true, landing: updated });
    
  } catch (error: any) {
    console.error('[API] Error updating landing:', error);
    res.status(500).json({ error: error.message || 'Failed to update landing' });
  }
});

/**
 * API para eliminar una landing publicada
 */
router.delete('/api/landing/:id', async (req: Request, res: Response) => {
  try {
    let user;
    try {
      user = await sdk.authenticateRequest(req);
    } catch {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const landingId = parseInt(req.params.id, 10);
    if (isNaN(landingId)) {
      return res.status(400).json({ error: 'Invalid landing ID' });
    }
    
    const deleted = await deletePublishedLanding(landingId, user.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Landing not found or access denied' });
    }
    
    res.json({ success: true });
    
  } catch (error: any) {
    console.error('[API] Error deleting landing:', error);
    res.status(500).json({ error: error.message || 'Failed to delete landing' });
  }
});

/**
 * API para verificar disponibilidad de slug
 */
router.get('/api/landing/check-slug', async (req: Request, res: Response) => {
  try {
    let user;
    try {
      user = await sdk.authenticateRequest(req);
    } catch {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { slug } = req.query;
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'slug is required' });
    }
    
    const subdomain = generateUserSubdomain(user.id);
    const available = await isSlugAvailable(subdomain, slug);
    
    res.json({ available, slug, subdomain });
    
  } catch (error: any) {
    console.error('[API] Error checking slug:', error);
    res.status(500).json({ error: error.message || 'Failed to check slug' });
  }
});

export default router;
