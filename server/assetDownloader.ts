/**
 * Asset Downloader - Descarga y almacena imágenes, logos y fuentes de sitios web
 * Guarda los assets en S3 para uso en las landings generadas
 */

import { storagePut } from './storage';
import { createHash } from 'crypto';

export interface DownloadedAsset {
  originalUrl: string;
  storedUrl: string;
  type: 'image' | 'logo' | 'icon' | 'font' | 'background';
  filename: string;
  mimeType: string;
  size: number;
}

export interface AssetDownloadResult {
  success: boolean;
  assets: DownloadedAsset[];
  errors: Array<{ url: string; error: string }>;
  totalSize: number;
}

/**
 * Descarga múltiples assets y los almacena en S3
 */
export async function downloadAssets(
  urls: Array<{ url: string; type: 'image' | 'logo' | 'icon' | 'font' | 'background' }>,
  projectId: string
): Promise<AssetDownloadResult> {
  const result: AssetDownloadResult = {
    success: true,
    assets: [],
    errors: [],
    totalSize: 0,
  };

  console.log(`[AssetDownloader] Downloading ${urls.length} assets for project ${projectId}`);

  // Procesar en paralelo con límite de concurrencia
  const batchSize = 5;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const promises = batch.map(({ url, type }) => 
      downloadSingleAsset(url, type, projectId)
        .then(asset => {
          if (asset) {
            result.assets.push(asset);
            result.totalSize += asset.size;
          }
        })
        .catch(error => {
          result.errors.push({ url, error: error.message });
        })
    );
    await Promise.all(promises);
  }

  result.success = result.errors.length === 0;
  console.log(`[AssetDownloader] Downloaded ${result.assets.length} assets (${formatBytes(result.totalSize)}), ${result.errors.length} errors`);

  return result;
}

/**
 * Descarga un solo asset y lo guarda en S3
 */
async function downloadSingleAsset(
  url: string,
  type: 'image' | 'logo' | 'icon' | 'font' | 'background',
  projectId: string
): Promise<DownloadedAsset | null> {
  try {
    // Validar y normalizar URL
    const normalizedUrl = normalizeUrl(url);
    if (!normalizedUrl) {
      console.log(`[AssetDownloader] Invalid URL: ${url}`);
      return null;
    }

    // Descargar el asset
    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/*,*/*',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Verificar tipo de contenido
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    if (!isValidAssetType(contentType, type)) {
      console.log(`[AssetDownloader] Invalid content type for ${type}: ${contentType}`);
      return null;
    }

    // Leer el contenido
    const buffer = Buffer.from(await response.arrayBuffer());
    
    // Verificar tamaño (máximo 10MB)
    if (buffer.length > 10 * 1024 * 1024) {
      console.log(`[AssetDownloader] Asset too large: ${formatBytes(buffer.length)}`);
      return null;
    }

    // Generar nombre de archivo único
    const hash = createHash('md5').update(url).digest('hex').substring(0, 8);
    const extension = getExtensionFromMimeType(contentType);
    const filename = `${type}-${hash}${extension}`;
    const storagePath = `cloned-assets/${projectId}/${filename}`;

    // Subir a S3
    const { url: storedUrl } = await storagePut(storagePath, buffer, contentType);

    console.log(`[AssetDownloader] Downloaded: ${filename} (${formatBytes(buffer.length)})`);

    return {
      originalUrl: url,
      storedUrl,
      type,
      filename,
      mimeType: contentType,
      size: buffer.length,
    };
  } catch (error) {
    console.error(`[AssetDownloader] Error downloading ${url}:`, error);
    throw error;
  }
}

/**
 * Descarga el logo de un sitio web
 */
export async function downloadLogo(
  logoUrl: string,
  projectId: string
): Promise<DownloadedAsset | null> {
  if (!logoUrl) return null;
  
  try {
    return await downloadSingleAsset(logoUrl, 'logo', projectId);
  } catch (error) {
    console.error(`[AssetDownloader] Failed to download logo:`, error);
    return null;
  }
}

/**
 * Descarga las imágenes del hero
 */
export async function downloadHeroImages(
  imageUrls: string[],
  projectId: string
): Promise<DownloadedAsset[]> {
  const result = await downloadAssets(
    imageUrls.map(url => ({ url, type: 'image' as const })),
    projectId
  );
  return result.assets;
}

/**
 * Descarga imágenes de galería/portfolio
 */
export async function downloadGalleryImages(
  imageUrls: string[],
  projectId: string,
  maxImages: number = 12
): Promise<DownloadedAsset[]> {
  const urls = imageUrls.slice(0, maxImages).map(url => ({ 
    url, 
    type: 'image' as const 
  }));
  
  const result = await downloadAssets(urls, projectId);
  return result.assets;
}

/**
 * Descarga logos de clientes/partners
 */
export async function downloadClientLogos(
  logoUrls: string[],
  projectId: string,
  maxLogos: number = 10
): Promise<DownloadedAsset[]> {
  const urls = logoUrls.slice(0, maxLogos).map(url => ({ 
    url, 
    type: 'logo' as const 
  }));
  
  const result = await downloadAssets(urls, projectId);
  return result.assets;
}

/**
 * Extrae y descarga todos los assets de una página
 */
export async function extractAndDownloadAllAssets(
  html: string,
  baseUrl: string,
  projectId: string
): Promise<{
  logo: DownloadedAsset | null;
  heroImages: DownloadedAsset[];
  galleryImages: DownloadedAsset[];
  backgroundImages: DownloadedAsset[];
  clientLogos: DownloadedAsset[];
}> {
  const cheerio = await import('cheerio');
  const $ = cheerio.load(html);
  
  // Extraer logo
  let logoUrl = '';
  const logoSelectors = [
    'header img[class*="logo"]',
    'nav img[class*="logo"]',
    '.logo img',
    'header img:first-child',
    'a[class*="logo"] img',
  ];
  
  for (const selector of logoSelectors) {
    const logoEl = $(selector).first();
    if (logoEl.length) {
      logoUrl = resolveUrl(logoEl.attr('src') || logoEl.attr('data-src') || '', baseUrl);
      if (logoUrl) break;
    }
  }

  // Extraer imágenes del hero
  const heroImages: string[] = [];
  const heroSection = $('section:first-of-type, [class*="hero"], [class*="banner"]').first();
  heroSection.find('img').each((_, el) => {
    const src = resolveUrl($(el).attr('src') || $(el).attr('data-src') || '', baseUrl);
    if (src && !src.includes('logo')) {
      heroImages.push(src);
    }
  });

  // Extraer imágenes de galería
  const galleryImages: string[] = [];
  $('[class*="gallery"], [class*="portfolio"], [class*="work"]').find('img').each((_, el) => {
    const src = resolveUrl($(el).attr('src') || $(el).attr('data-src') || '', baseUrl);
    if (src) {
      galleryImages.push(src);
    }
  });

  // Extraer background images
  const backgroundImages: string[] = [];
  $('[style*="background"]').each((_, el) => {
    const style = $(el).attr('style') || '';
    const match = style.match(/url\(['"]?([^'")\s]+)['"]?\)/);
    if (match && match[1]) {
      const src = resolveUrl(match[1], baseUrl);
      if (src) {
        backgroundImages.push(src);
      }
    }
  });

  // Extraer logos de clientes
  const clientLogos: string[] = [];
  $('[class*="client"], [class*="partner"], [class*="logo-cloud"], [class*="trusted"]').find('img').each((_, el) => {
    const src = resolveUrl($(el).attr('src') || $(el).attr('data-src') || '', baseUrl);
    if (src) {
      clientLogos.push(src);
    }
  });

  // Descargar todos los assets
  console.log(`[AssetDownloader] Found assets: logo=${logoUrl ? 1 : 0}, hero=${heroImages.length}, gallery=${galleryImages.length}, bg=${backgroundImages.length}, clients=${clientLogos.length}`);

  const [logo, heroResult, galleryResult, bgResult, clientResult] = await Promise.all([
    logoUrl ? downloadLogo(logoUrl, projectId) : Promise.resolve(null),
    downloadHeroImages(heroImages.slice(0, 3), projectId),
    downloadGalleryImages(galleryImages, projectId),
    downloadAssets(backgroundImages.slice(0, 5).map(url => ({ url, type: 'background' as const })), projectId),
    downloadClientLogos(clientLogos, projectId),
  ]);

  return {
    logo,
    heroImages: heroResult,
    galleryImages: galleryResult,
    backgroundImages: bgResult.assets,
    clientLogos: clientResult,
  };
}

/**
 * Normaliza una URL
 */
function normalizeUrl(url: string): string | null {
  if (!url) return null;
  
  // Ignorar data URLs
  if (url.startsWith('data:')) return null;
  
  // Ignorar URLs de placeholder
  if (url.includes('placeholder') || url.includes('via.placeholder')) return null;
  
  try {
    // Si es una URL relativa, no podemos procesarla aquí
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return null;
    }
    
    const parsed = new URL(url);
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Resuelve una URL relativa contra una base
 */
function resolveUrl(url: string, baseUrl: string): string {
  if (!url) return '';
  
  // Ignorar data URLs
  if (url.startsWith('data:')) return '';
  
  try {
    // Si ya es absoluta
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Resolver contra base
    const base = new URL(baseUrl);
    const resolved = new URL(url, base);
    return resolved.href;
  } catch {
    return '';
  }
}

/**
 * Verifica si el tipo de contenido es válido para el tipo de asset
 */
function isValidAssetType(contentType: string, assetType: string): boolean {
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif'];
  const fontTypes = ['font/woff', 'font/woff2', 'font/ttf', 'font/otf', 'application/font-woff', 'application/font-woff2'];
  
  if (assetType === 'font') {
    return fontTypes.some(t => contentType.includes(t));
  }
  
  // Para imágenes, logos, iconos y backgrounds
  return imageTypes.some(t => contentType.includes(t)) || contentType.includes('image/');
}

/**
 * Obtiene la extensión de archivo desde el tipo MIME
 */
function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'image/avif': '.avif',
    'font/woff': '.woff',
    'font/woff2': '.woff2',
    'font/ttf': '.ttf',
    'font/otf': '.otf',
  };
  
  for (const [mime, ext] of Object.entries(mimeToExt)) {
    if (mimeType.includes(mime)) {
      return ext;
    }
  }
  
  return '.bin';
}

/**
 * Formatea bytes a formato legible
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Genera un mapa de URLs originales a URLs almacenadas
 */
export function createAssetUrlMap(assets: DownloadedAsset[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const asset of assets) {
    map.set(asset.originalUrl, asset.storedUrl);
  }
  return map;
}

/**
 * Reemplaza URLs originales con URLs almacenadas en contenido
 */
export function replaceAssetUrls(content: string, urlMap: Map<string, string>): string {
  let result = content;
  urlMap.forEach((stored, original) => {
    result = result.replace(new RegExp(escapeRegExp(original), 'g'), stored);
  });
  return result;
}

/**
 * Escapa caracteres especiales para RegExp
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
