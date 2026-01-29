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
  const features = content.features || [];
  
  return `
  <section class="py-20">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold mb-4">${title}</h2>
        <p class="text-gray-600 max-w-2xl mx-auto">${subtitle}</p>
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        ${features.map((f: any) => `
          <div class="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            ${f.icon ? `<div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">${f.icon}</div>` : ''}
            <h3 class="text-xl font-semibold mb-2">${f.title || ''}</h3>
            <p class="text-gray-600">${f.description || ''}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;
}

function renderTestimonialsSection(content: any, styles: any): string {
  const title = content.title || 'What our customers say';
  const subtitle = content.subtitle || '';
  // Soportar tanto 'testimonials' como 'items' como array de testimonios
  const testimonials = content.testimonials || content.items || [];
  
  return `
  <section class="py-20 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold mb-4" style="color: #1f2937;">${title}</h2>
        ${subtitle ? `<p class="text-lg max-w-2xl mx-auto" style="color: #6b7280;">${subtitle}</p>` : ''}
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        ${testimonials.map((t: any) => {
          // Soportar tanto 'text' como 'quote' para el contenido del testimonio
          const testimonialText = t.text || t.quote || t.content || '';
          // Soportar tanto 'avatar' como 'image' para la foto
          const avatarUrl = t.avatar || t.image || '';
          
          return `
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <div class="flex items-center gap-1 mb-4">
              ${Array(t.rating || 5).fill('⭐').join('')}
            </div>
            <p class="mb-4" style="color: #374151;">"${testimonialText}"</p>
            <div class="flex items-center gap-3">
              ${avatarUrl ? `<img src="${avatarUrl}" alt="${t.name}" class="w-10 h-10 rounded-full object-cover">` : `<div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">${(t.name || 'A')[0]}</div>`}
              <div>
                <p class="font-semibold" style="color: #1f2937;">${t.name || 'Anonymous'}</p>
                <p class="text-sm" style="color: #6b7280;">${t.role || t.company || ''}</p>
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
  const plans = content.plans || [];
  
  return `
  <section class="py-20">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold text-center mb-12">${title}</h2>
      <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        ${plans.map((p: any) => `
          <div class="bg-white p-8 rounded-xl shadow-sm border ${p.featured ? 'border-primary ring-2 ring-primary' : 'border-gray-200'}">
            <h3 class="text-xl font-bold mb-2">${p.name || ''}</h3>
            <div class="text-3xl font-bold mb-4">${p.price || ''}</div>
            <p class="text-gray-600 mb-6">${p.description || ''}</p>
            <ul class="space-y-3 mb-8">
              ${(p.features || []).map((f: string) => `<li class="flex items-center gap-2"><span class="text-green-500">✓</span>${f}</li>`).join('')}
            </ul>
            <a href="${p.cta?.href || '#'}" class="${p.featured ? 'btn-primary text-white' : 'bg-gray-100 text-gray-900'} w-full py-3 rounded-lg text-center block">${p.cta?.text || 'Get Started'}</a>
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;
}

function renderFAQSection(content: any, styles: any): string {
  const title = content.title || 'Frequently Asked Questions';
  const faqs = content.faqs || [];
  
  return `
  <section class="py-20 bg-gray-50">
    <div class="container mx-auto px-4 max-w-3xl">
      <h2 class="text-3xl font-bold text-center mb-12">${title}</h2>
      <div class="space-y-4">
        ${faqs.map((faq: any, i: number) => `
          <details class="bg-white rounded-lg shadow-sm">
            <summary class="p-4 cursor-pointer font-semibold">${faq.question || ''}</summary>
            <div class="px-4 pb-4 text-gray-600">${faq.answer || ''}</div>
          </details>
        `).join('')}
      </div>
    </div>
  </section>`;
}

function renderProcessSection(content: any, styles: any): string {
  const title = content.title || 'How It Works';
  const subtitle = content.subtitle || '';
  const steps = content.steps || [];
  
  return `
  <section class="py-20 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold mb-4">${title}</h2>
        ${subtitle ? `<p class="text-gray-600 max-w-2xl mx-auto">${subtitle}</p>` : ''}
      </div>
      <div class="grid md:grid-cols-${Math.min(steps.length, 4)} gap-8 max-w-5xl mx-auto">
        ${steps.map((step: any, i: number) => `
          <div class="text-center">
            <div class="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">${step.number || i + 1}</div>
            <h3 class="text-xl font-semibold mb-2">${step.title || ''}</h3>
            <p class="text-gray-600">${step.description || ''}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;
}

function renderFormSection(content: any, styles: any): string {
  const title = content.title || 'Contact Us';
  const subtitle = content.subtitle || '';
  const fields = content.fields || [];
  const submitText = content.submitText || 'Send Message';
  
  return `
  <section class="py-20 bg-white">
    <div class="container mx-auto px-4 max-w-2xl">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold mb-4">${title}</h2>
        ${subtitle ? `<p class="text-gray-600">${subtitle}</p>` : ''}
      </div>
      <form class="space-y-6">
        ${fields.map((field: any) => `
          <div>
            ${field.label ? `<label class="block text-sm font-medium text-gray-900 mb-2">${field.label}</label>` : ''}
            ${field.type === 'textarea' ? `<textarea name="${field.id}" placeholder="${field.placeholder || ''}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" rows="4"></textarea>` : `<input type="${field.type || 'text'}" name="${field.id}" placeholder="${field.placeholder || ''}" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" ${field.required ? 'required' : ''}>`}
          </div>
        `).join('')}
        <button type="submit" class="w-full btn-primary text-white px-8 py-3 rounded-lg text-lg font-semibold hover:opacity-90">${submitText}</button>
      </form>
    </div>
  </section>`;
}

function renderStatsSection(content: any, styles: any): string {
  const stats = content.items || [];
  
  return `
  <section class="py-20 bg-gradient-to-r from-primary to-primary/80 text-white">
    <div class="container mx-auto px-4">
      <div class="grid md:grid-cols-${Math.min(stats.length, 4)} gap-8 text-center">
        ${stats.map((stat: any) => `
          <div>
            <div class="text-4xl md:text-5xl font-bold mb-2">${stat.value || ''}</div>
            <div class="text-lg opacity-90">${stat.label || ''}</div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;
}

function renderGallerySection(content: any, styles: any): string {
  const title = content.title || 'Gallery';
  const subtitle = content.subtitle || '';
  const images = content.images || [];
  
  return `
  <section class="py-20 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold mb-4">${title}</h2>
        ${subtitle ? `<p class="text-gray-600 max-w-2xl mx-auto">${subtitle}</p>` : ''}
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        ${images.map((img: any) => `
          <div class="overflow-hidden rounded-lg shadow-lg">
            <img src="${img.url || img.src || ''}" alt="${img.alt || 'Gallery image'}" class="w-full h-64 object-cover hover:scale-105 transition-transform">
          </div>
        `).join('')}
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
  const cta = content.cta || {};
  
  return `
  <section class="py-20 bg-primary text-white">
    <div class="container mx-auto px-4 text-center">
      <h2 class="text-3xl font-bold mb-4">${title}</h2>
      <p class="text-xl opacity-90 mb-8 max-w-2xl mx-auto">${subtitle}</p>
      ${cta.text ? `<a href="${cta.href || '#'}" class="bg-white text-gray-900 px-8 py-3 rounded-lg text-lg inline-block font-semibold hover:bg-gray-100">${cta.text}</a>` : ''}
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
