/**
 * Router para manejar requests de subdominios
 * Sirve proyectos publicados por su subdominio y slug
 */

import { Router, Request, Response } from 'express';
import { getChatById, getChatsByUserId, getUserByOpenId } from './db';
import { generateUserSubdomain, parseProjectUrl } from './subdomainMiddleware';

const router = Router();

/**
 * Middleware que detecta si es un request de subdominio y lo maneja
 */
export async function handleSubdomainRequest(req: Request, res: Response, next: Function) {
  // Si no es un request de subdominio, continuar normalmente
  if (!req.isSubdomainRequest || !req.subdomain) {
    return next();
  }
  
  const subdomain = req.subdomain;
  const path = req.path;
  
  // Extraer el slug del proyecto y la página del path
  // Formato: /{projectSlug}/{page}
  const pathParts = path.split('/').filter(Boolean);
  const projectSlug = pathParts[0];
  const pagePath = pathParts.slice(1).join('/');
  
  // Si no hay slug de proyecto, mostrar página de usuario
  if (!projectSlug) {
    return res.json({
      type: 'user_projects',
      subdomain,
      message: 'Lista de proyectos del usuario',
      // TODO: Implementar lista de proyectos públicos del usuario
      projects: []
    });
  }
  
  // TODO: Buscar el proyecto por subdomain + slug
  // Por ahora, devolver información de debug
  return res.json({
    type: 'project_view',
    subdomain,
    projectSlug,
    pagePath: pagePath || 'home',
    message: 'Sistema de subdominios activo. Implementación de proyectos pendiente.',
    url: `https://${subdomain}.macgyver.to/${projectSlug}${pagePath ? '/' + pagePath : ''}`
  });
}

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

export default router;
