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
  
  // Determinar qué página mostrar
  let pageContent = '';
  let pageTitle = landing.name;
  
  if (pagePath === 'home' || pagePath === '') {
    // Página principal - renderizar todas las secciones
    pageContent = renderLandingSections(config);
  } else {
    // Buscar página interna
    const page = pages.find((p: any) => p.slug === pagePath || p.path === `/${pagePath}`);
    if (page) {
      pageContent = renderInternalPage(page);
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
function renderLandingSections(config: any): string {
  if (!config || !config.sections) {
    return '<div class="min-h-screen flex items-center justify-center"><p>No content available</p></div>';
  }
  
  let html = '';
  
  for (const section of config.sections) {
    html += renderSection(section, config.styles);
  }
  
  return html;
}

/**
 * Renderiza una sección individual
 */
function renderSection(section: any, styles: any): string {
  const type = section.type;
  const content = section.content || {};
  const sectionStyles = section.styles || {};
  
  switch (type) {
    case 'header':
      return renderHeaderSection(content, styles);
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
    case 'cta':
      return renderCTASection(content, styles);
    case 'footer':
      return renderFooterSection(content, styles);
    default:
      return `<!-- Unknown section type: ${type} -->`;
  }
}

function renderHeaderSection(content: any, styles: any): string {
  const logo = content.logo || { text: 'Logo' };
  const navItems = content.navItems || [];
  const cta = content.cta || {};
  
  return `
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="container mx-auto px-4 py-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        ${logo.image ? `<img src="${logo.image}" alt="${logo.text}" class="h-8">` : ''}
        <span class="font-bold text-xl">${logo.text || ''}</span>
      </div>
      <nav class="hidden md:flex items-center gap-6">
        ${navItems.map((item: any) => `<a href="${item.href || '#'}" class="text-gray-600 hover:text-gray-900">${item.label}</a>`).join('')}
      </nav>
      ${cta.text ? `<a href="${cta.href || '#'}" class="btn-primary text-white px-4 py-2 rounded-lg">${cta.text}</a>` : ''}
    </div>
  </header>`;
}

function renderHeroSection(content: any, styles: any, variant: string): string {
  const title = content.title || 'Welcome';
  const subtitle = content.subtitle || '';
  const cta = content.cta || {};
  const image = content.image || {};
  
  return `
  <section class="py-20 bg-gradient-to-br from-gray-50 to-white">
    <div class="container mx-auto px-4">
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 class="text-4xl md:text-5xl font-bold mb-6">${title}</h1>
          <p class="text-xl text-gray-600 mb-8">${subtitle}</p>
          ${cta.text ? `<a href="${cta.href || '#'}" class="btn-primary text-white px-8 py-3 rounded-lg text-lg inline-block">${cta.text}</a>` : ''}
        </div>
        ${image.src ? `<div><img src="${image.src}" alt="${image.alt || ''}" class="rounded-lg shadow-xl"></div>` : ''}
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
  const testimonials = content.testimonials || [];
  
  return `
  <section class="py-20 bg-gray-50">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold text-center mb-12">${title}</h2>
      <div class="grid md:grid-cols-3 gap-8">
        ${testimonials.map((t: any) => `
          <div class="bg-white p-6 rounded-xl shadow-sm">
            <div class="flex items-center gap-1 mb-4">
              ${Array(t.rating || 5).fill('⭐').join('')}
            </div>
            <p class="text-gray-700 mb-4">"${t.quote || ''}"</p>
            <div class="flex items-center gap-3">
              ${t.avatar ? `<img src="${t.avatar}" alt="${t.name}" class="w-10 h-10 rounded-full object-cover">` : `<div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">${(t.name || 'A')[0]}</div>`}
              <div>
                <p class="font-semibold text-gray-900">${t.name || 'Anonymous'}</p>
                <p class="text-sm text-gray-500">${t.role || ''}</p>
              </div>
            </div>
          </div>
        `).join('')}
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

function renderFooterSection(content: any, styles: any): string {
  const logo = content.logo || {};
  const links = content.links || [];
  const social = content.social || [];
  const copyright = content.copyright || '';
  
  return `
  <footer class="bg-gray-900 text-white py-12">
    <div class="container mx-auto px-4">
      <div class="grid md:grid-cols-4 gap-8 mb-8">
        <div>
          ${logo.image ? `<img src="${logo.image}" alt="${logo.text}" class="h-8 mb-4">` : ''}
          <span class="font-bold text-xl">${logo.text || ''}</span>
        </div>
        ${links.map((group: any) => `
          <div>
            <h4 class="font-semibold mb-4">${group.title || ''}</h4>
            <ul class="space-y-2">
              ${(group.items || []).map((item: any) => `<li><a href="${item.href || '#'}" class="text-gray-400 hover:text-white">${item.label}</a></li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
      <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-400">${copyright}</p>
        <div class="flex gap-4 mt-4 md:mt-0">
          ${social.map((s: any) => `<a href="${s.href || '#'}" class="text-gray-400 hover:text-white">${s.icon || s.platform}</a>`).join('')}
        </div>
      </div>
    </div>
  </footer>`;
}

/**
 * Renderiza una página interna
 */
function renderInternalPage(page: any): string {
  return `
  <div class="min-h-screen py-20">
    <div class="container mx-auto px-4 max-w-4xl">
      <h1 class="text-4xl font-bold mb-8">${page.title || ''}</h1>
      <div class="prose prose-lg max-w-none">
        ${page.content || ''}
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
