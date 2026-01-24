/**
 * Middleware para detectar y manejar subdominios
 * Extrae el subdominio del header X-Subdomain (enviado por Nginx)
 * o del hostname directamente
 */

import { Request, Response, NextFunction } from 'express';

// Extender el tipo Request para incluir subdomain
declare global {
  namespace Express {
    interface Request {
      subdomain?: string;
      isSubdomainRequest?: boolean;
    }
  }
}

/**
 * Middleware que detecta subdominios y los añade al request
 */
export function subdomainMiddleware(req: Request, res: Response, next: NextFunction) {
  // Primero intentar obtener del header X-Subdomain (enviado por Nginx)
  const subdomainHeader = req.headers['x-subdomain'] as string | undefined;
  
  if (subdomainHeader && subdomainHeader !== '') {
    req.subdomain = subdomainHeader;
    req.isSubdomainRequest = true;
    return next();
  }
  
  // Fallback: extraer del hostname
  const host = req.hostname || req.headers.host || '';
  const parts = host.split('.');
  
  // Verificar si es un subdominio de macgyver.to
  // Formato esperado: {subdomain}.macgyver.to
  if (parts.length >= 3 && parts[parts.length - 2] === 'macgyver' && parts[parts.length - 1] === 'to') {
    // Obtener todo excepto los últimos dos segmentos (macgyver.to)
    const subdomain = parts.slice(0, -2).join('.');
    
    // Ignorar 'www' como subdominio
    if (subdomain && subdomain !== 'www') {
      req.subdomain = subdomain;
      req.isSubdomainRequest = true;
      return next();
    }
  }
  
  // No es un subdominio, continuar normalmente
  req.isSubdomainRequest = false;
  next();
}

/**
 * Genera un subdominio único basado en el userId
 * Formato: hash corto del ID
 */
export function generateUserSubdomain(userId: number): string {
  // Crear un hash simple pero único basado en el userId
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let hash = '';
  let num = userId * 2654435761; // Multiplicador de Knuth
  
  for (let i = 0; i < 8; i++) {
    hash += chars[Math.abs(num) % chars.length];
    num = Math.floor(num / chars.length);
  }
  
  return hash;
}

/**
 * Genera un slug único para un proyecto
 * Formato: nombre-slugificado-hash
 */
export function generateProjectSlug(projectName: string, projectId: number): string {
  // Slugificar el nombre
  const slug = projectName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales por guiones
    .replace(/^-+|-+$/g, '') // Eliminar guiones al inicio/final
    .substring(0, 30); // Limitar longitud
  
  // Añadir hash corto del ID
  const hash = projectId.toString(36).padStart(4, '0');
  
  return `${slug}-${hash}`;
}

/**
 * Construye la URL completa de un proyecto
 */
export function getProjectUrl(userSubdomain: string, projectSlug: string, page?: string): string {
  const baseUrl = `https://${userSubdomain}.macgyver.to`;
  const projectPath = `/${projectSlug}`;
  const pagePath = page ? `/${page.replace(/^\//, '')}` : '';
  
  return `${baseUrl}${projectPath}${pagePath}`;
}

/**
 * Parsea una URL de proyecto y extrae sus componentes
 */
export function parseProjectUrl(url: string): {
  subdomain: string;
  projectSlug: string;
  page: string;
} | null {
  try {
    const urlObj = new URL(url);
    const host = urlObj.hostname;
    const parts = host.split('.');
    
    if (parts.length < 3 || parts[parts.length - 2] !== 'macgyver' || parts[parts.length - 1] !== 'to') {
      return null;
    }
    
    const subdomain = parts.slice(0, -2).join('.');
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    const projectSlug = pathParts[0] || '';
    const page = pathParts.slice(1).join('/');
    
    return { subdomain, projectSlug, page };
  } catch {
    return null;
  }
}
