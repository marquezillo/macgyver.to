/**
 * Router para manejar requests de subdominios
 * Sirve proyectos publicados por su subdominio y slug
 * 
 * REFACTORED: Now uses shared/landingRenderer for unified rendering
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
import { 
  renderLanding, 
  LandingConfig, 
  LandingSection,
  escapeHtml,
  isLightColor,
  getContrastColor,
  getSubtitleColor
} from '../shared/landingRenderer';

const router = Router();

// ============================================================================
// SUBDOMAIN REQUEST HANDLER
// ============================================================================

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
  const pathParts = path.split('/').filter(Boolean);
  const projectSlug = pathParts[0];
  const pagePath = pathParts.slice(1).join('/') || 'home';
  
  // Si no hay slug de proyecto, mostrar lista de proyectos del usuario
  if (!projectSlug) {
    try {
      const landings = await getPublishedLandingsBySubdomain(subdomain);
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

// ============================================================================
// HTML GENERATION - USING UNIFIED RENDERER
// ============================================================================

/**
 * Converts legacy landing config to unified LandingConfig format
 */
function convertToUnifiedConfig(landing: any): LandingConfig {
  const config = landing.config as any;
  const theme = landing.theme || {};
  const seo = landing.seoMetadata || {};
  
  // Convert sections to unified format
  const sections: LandingSection[] = (config?.sections || []).map((section: any) => ({
    id: section.id || `section-${Math.random().toString(36).substr(2, 9)}`,
    type: section.type,
    content: section.content || {},
    styles: {
      ...section.styles,
      backgroundColor: section.styles?.backgroundColor || section.content?.backgroundColor,
      accentColor: section.styles?.accentColor || config?.styles?.primaryColor
    }
  }));
  
  return {
    sections,
    globalStyles: {
      primaryColor: config?.styles?.primaryColor || theme?.primaryColor || '#6366f1',
      secondaryColor: config?.styles?.secondaryColor || theme?.secondaryColor,
      backgroundColor: config?.styles?.backgroundColor || theme?.backgroundColor || '#ffffff',
      textColor: config?.styles?.textColor || theme?.textColor || '#1f2937',
      fontFamily: config?.styles?.fontFamily || theme?.fontFamily || 'Inter',
      borderRadius: config?.styles?.borderRadius || '0.5rem'
    },
    metadata: {
      title: landing.name || seo.title || 'Landing Page',
      description: seo.description || landing.description || '',
      favicon: landing.favicon,
      language: seo.language || detectLandingLanguage(landing) || 'es'
    }
  };
}

/**
 * Genera el HTML para una landing publicada usando el renderizador unificado
 */
function generateLandingHTML(landing: any, pagePath: string): string {
  const config = landing.config as any;
  const pages = (landing.pages || []) as any[];
  const seo = (landing.seoMetadata || {}) as any;
  const projectSlug = landing.slug;
  const landingLanguage = detectLandingLanguage(landing);
  
  // Handle internal pages (terms, privacy, etc.)
  if (pagePath !== 'home' && pagePath !== '') {
    let page = pages.find((p: any) => p.slug === pagePath || p.path === `/${pagePath}`);
    
    if (!page) {
      const pageType = getPageTypeFromSlug(pagePath);
      if (pageType) {
        page = pages.find((p: any) => p.type === pageType);
      }
    }
    
    if (page) {
      return renderInternalPage(page, config?.styles || {}, landing);
    }
    
    return generate404HTML(landing.subdomain, projectSlug);
  }
  
  // Convert to unified config and render
  const unifiedConfig = convertToUnifiedConfig(landing);
  return renderLanding(unifiedConfig, {
    isPreview: false,
    includeWrapper: true,
    includeScripts: true
  });
}

// ============================================================================
// INTERNAL PAGES (Terms, Privacy, Contact, About)
// ============================================================================

function renderInternalPage(page: any, styles: any, landing: any): string {
  const primaryColor = styles?.primaryColor || '#6366f1';
  const backgroundColor = styles?.backgroundColor || '#ffffff';
  const textColor = styles?.textColor || '#1f2937';
  const fontFamily = styles?.fontFamily || 'Inter';
  
  let content = '';
  
  switch (page.type) {
    case 'terms':
      content = renderTermsContent(page);
      break;
    case 'privacy':
      content = renderPrivacyContent(page);
      break;
    case 'contact':
      content = renderContactContent(page, styles);
      break;
    case 'about':
      content = renderAboutContent(page, styles);
      break;
    default:
      content = `<div style="padding: 2rem;"><h1>${escapeHtml(page.title)}</h1><div>${page.content || ''}</div></div>`;
  }
  
  return `<!DOCTYPE html>
<html lang="${landing.seoMetadata?.language || 'es'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(page.title)} - ${escapeHtml(landing.name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: '${fontFamily}', sans-serif; 
      background-color: ${backgroundColor}; 
      color: ${textColor}; 
      line-height: 1.6;
    }
    a { color: ${primaryColor}; }
    .container { max-width: 800px; margin: 0 auto; padding: 2rem 1rem; }
    h1 { font-size: 2rem; margin-bottom: 1.5rem; }
    h2 { font-size: 1.5rem; margin: 2rem 0 1rem; }
    p { margin-bottom: 1rem; }
    ul, ol { margin-bottom: 1rem; padding-left: 1.5rem; }
    .back-link { display: inline-block; margin-bottom: 2rem; color: ${primaryColor}; text-decoration: none; }
    .back-link:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <a href="/${landing.slug}" class="back-link">← Volver</a>
    ${content}
  </div>
</body>
</html>`;
}

function renderTermsContent(page: any): string {
  const sections = page.sections || [];
  return `
    <h1>${escapeHtml(page.title || 'Términos y Condiciones')}</h1>
    <p style="color: #6b7280; margin-bottom: 2rem;">Última actualización: ${page.lastUpdated || new Date().toLocaleDateString()}</p>
    ${sections.map((section: any) => `
      <h2>${escapeHtml(section.title)}</h2>
      <p>${escapeHtml(section.content)}</p>
    `).join('')}
  `;
}

function renderPrivacyContent(page: any): string {
  const sections = page.sections || [];
  return `
    <h1>${escapeHtml(page.title || 'Política de Privacidad')}</h1>
    <p style="color: #6b7280; margin-bottom: 2rem;">Última actualización: ${page.lastUpdated || new Date().toLocaleDateString()}</p>
    ${sections.map((section: any) => `
      <h2>${escapeHtml(section.title)}</h2>
      <p>${escapeHtml(section.content)}</p>
    `).join('')}
  `;
}

function renderContactContent(page: any, styles: any): string {
  const primaryColor = styles?.primaryColor || '#6366f1';
  return `
    <h1>${escapeHtml(page.title || 'Contacto')}</h1>
    ${page.description ? `<p style="margin-bottom: 2rem;">${escapeHtml(page.description)}</p>` : ''}
    <form style="display: flex; flex-direction: column; gap: 1rem;">
      <input type="text" placeholder="Nombre" style="padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 0.5rem;" required />
      <input type="email" placeholder="Email" style="padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 0.5rem;" required />
      <textarea placeholder="Mensaje" rows="4" style="padding: 0.75rem; border: 1px solid #e5e7eb; border-radius: 0.5rem;" required></textarea>
      <button type="submit" style="padding: 0.75rem 1.5rem; background-color: ${primaryColor}; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500;">Enviar</button>
    </form>
  `;
}

function renderAboutContent(page: any, styles: any): string {
  return `
    <h1>${escapeHtml(page.title || 'Sobre Nosotros')}</h1>
    ${page.content ? `<div>${page.content}</div>` : '<p>Información sobre la empresa.</p>'}
  `;
}

// ============================================================================
// UTILITY HTML GENERATORS
// ============================================================================

function generateProjectListHTML(subdomain: string, landings: any[]): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proyectos - ${escapeHtml(subdomain)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #f8fafc; min-height: 100vh; padding: 2rem; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 2rem; margin-bottom: 2rem; color: #1f2937; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
    .card { background: white; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: transform 0.2s, box-shadow 0.2s; }
    .card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
    .card a { text-decoration: none; color: inherit; display: block; }
    .card-img { height: 180px; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem; font-weight: 700; }
    .card-body { padding: 1.25rem; }
    .card-title { font-size: 1.125rem; font-weight: 600; color: #1f2937; margin-bottom: 0.5rem; }
    .card-desc { font-size: 0.875rem; color: #6b7280; }
    .empty { text-align: center; padding: 4rem 2rem; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Proyectos de ${escapeHtml(subdomain)}</h1>
    ${landings.length > 0 ? `
      <div class="grid">
        ${landings.map(landing => `
          <div class="card">
            <a href="/${escapeHtml(landing.slug)}">
              <div class="card-img">${escapeHtml((landing.name || 'P').charAt(0).toUpperCase())}</div>
              <div class="card-body">
                <div class="card-title">${escapeHtml(landing.name || 'Sin título')}</div>
                <div class="card-desc">${escapeHtml(landing.description || 'Sin descripción')}</div>
              </div>
            </a>
          </div>
        `).join('')}
      </div>
    ` : `
      <div class="empty">
        <p>No hay proyectos publicados todavía.</p>
      </div>
    `}
  </div>
</body>
</html>`;
}

function generate404HTML(subdomain: string, slug: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Página no encontrada</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .container { text-align: center; padding: 2rem; }
    h1 { font-size: 6rem; font-weight: 700; color: #e5e7eb; margin-bottom: 1rem; }
    h2 { font-size: 1.5rem; color: #1f2937; margin-bottom: 1rem; }
    p { color: #6b7280; margin-bottom: 2rem; }
    a { display: inline-block; padding: 0.75rem 1.5rem; background: #6366f1; color: white; text-decoration: none; border-radius: 0.5rem; font-weight: 500; }
    a:hover { background: #4f46e5; }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <h2>Página no encontrada</h2>
    <p>El proyecto "${escapeHtml(slug)}" no existe o no está publicado.</p>
    <a href="/">Ver todos los proyectos</a>
  </div>
</body>
</html>`;
}

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * API para publicar una landing
 */
router.post('/api/landing/publish', async (req: Request, res: Response) => {
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
    
    const { chatId, name, description, config, theme, pages, seoMetadata, favicon, slug: requestedSlug, isPublic = true } = req.body;
    
    if (!chatId || !config) {
      return res.status(400).json({ error: 'chatId and config are required' });
    }
    
    // Verificar que el chat pertenece al usuario
    const chat = await getChatById(chatId, user.id);
    if (!chat) {
      return res.status(403).json({ error: 'Chat not found or access denied' });
    }
    
    // Generar subdominio basado en el ID del usuario
    const subdomain = generateUserSubdomain(user.id);
    
    // Generar o usar el slug proporcionado
    const slug = requestedSlug || generateProjectSlug(name || 'landing', Date.now());
    
    // Verificar disponibilidad del slug
    const slugAvailable = await isSlugAvailable(subdomain, slug, undefined);
    if (!slugAvailable) {
      return res.status(409).json({ error: 'Slug already in use', slug });
    }
    
    // Crear la landing publicada
    const landing = await createPublishedLanding({
      chatId,
      userId: user.id,
      subdomain,
      slug,
      name: name || 'Mi Landing',
      description: description || '',
      config,
      theme: theme || {},
      pages: pages || [],
      seoMetadata: seoMetadata || {},
      favicon: favicon || null
    });
    
    // Construir la URL pública
    const baseHost = process.env.BASE_HOST || 'macgyver.to';
    const publicUrl = `https://${subdomain}.${baseHost}/${slug}`;
    
    res.json({
      success: true,
      landing: {
        id: landing.id,
        subdomain,
        slug,
        publicUrl,
        isPublic
      }
    });
    
  } catch (error: any) {
    console.error('[API] Error publishing landing:', error);
    res.status(500).json({ error: error.message || 'Failed to publish landing' });
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
    
    const { id } = req.params;
    const updates = req.body;
    
    // Actualizar la landing
    const landing = await updatePublishedLanding(parseInt(id), user.id, updates);
    
    if (!landing) {
      return res.status(404).json({ error: 'Landing not found or access denied' });
    }
    
    res.json({ success: true, landing });
    
  } catch (error: any) {
    console.error('[API] Error updating landing:', error);
    res.status(500).json({ error: error.message || 'Failed to update landing' });
  }
});

/**
 * API para obtener landings del usuario
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
    const baseHost = process.env.BASE_HOST || 'macgyver.to';
    
    // Añadir URL pública a cada landing
    const landingsWithUrls = landings.map(landing => ({
      ...landing,
      publicUrl: `https://${landing.subdomain}.${baseHost}/${landing.slug}`
    }));
    
    res.json({ landings: landingsWithUrls });
    
  } catch (error: any) {
    console.error('[API] Error fetching landings:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch landings' });
  }
});

/**
 * API para obtener estadísticas de una landing
 */
router.get('/api/landing/:id/stats', async (req: Request, res: Response) => {
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
    
    const { id } = req.params;
    const stats = await getPublishedLandingStats(user.id);
    
    if (!stats) {
      return res.status(404).json({ error: 'Landing not found or access denied' });
    }
    
    res.json({ stats });
    
  } catch (error: any) {
    console.error('[API] Error fetching stats:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch stats' });
  }
});

/**
 * API para eliminar una landing
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
    
    const { id } = req.params;
    const deleted = await deletePublishedLanding(parseInt(id), user.id);
    
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
