/**
 * Web Cloner - Módulo de scraping con Playwright
 * Captura screenshots, HTML, CSS y assets de cualquier URL
 */

import { chromium, Browser, Page } from 'playwright';
import * as cheerio from 'cheerio';

// Tipos
export interface ScrapedWebsite {
  url: string;
  screenshot: Buffer;
  html: string;
  title: string;
  description: string;
  styles: ExtractedStyles;
  content: ExtractedContent;
  assets: {
    images: ImageAsset[];
    fonts: string[];
  };
}

export interface ImageAsset {
  src: string;
  alt: string;
  type: 'img' | 'background' | 'logo';
}

export interface ExtractedStyles {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    headingFamily: string;
    sizes: {
      h1: string;
      h2: string;
      h3: string;
      body: string;
    };
  };
  spacing: {
    sectionPadding: string;
    containerMaxWidth: string;
  };
  borders: {
    radius: string;
  };
}

export interface ExtractedContent {
  header?: {
    logo?: string;
    navItems: Array<{ text: string; href: string }>;
  };
  hero?: {
    title: string;
    subtitle: string;
    primaryCTA?: { text: string; href: string };
    secondaryCTA?: { text: string; href: string };
    image?: string;
  };
  features?: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  testimonials?: Array<{
    quote: string;
    name: string;
    role: string;
    avatar?: string;
  }>;
  pricing?: Array<{
    name: string;
    price: string;
    period: string;
    features: string[];
    highlighted: boolean;
  }>;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  cta?: {
    title: string;
    subtitle: string;
    buttonText: string;
  };
  footer?: {
    copyright: string;
    columns: Array<{
      title: string;
      links: Array<{ text: string; href: string }>;
    }>;
  };
}

// Browser singleton para reutilizar
let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    browserInstance = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browserInstance;
}

/**
 * Scrape una URL completa y extrae toda la información
 */
export async function scrapeWebsite(url: string): Promise<ScrapedWebsite> {
  console.log(`[WebCloner] Iniciando scraping de: ${url}`);
  
  const browser = await getBrowser();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  
  const page = await context.newPage();
  
  try {
    // Navegar a la URL
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Esperar un poco más para asegurar que todo cargó
    await page.waitForTimeout(2000);
    
    // Capturar screenshot full-page
    console.log('[WebCloner] Capturando screenshot...');
    const screenshot = await page.screenshot({ 
      fullPage: true,
      type: 'png'
    });
    
    // Extraer HTML
    console.log('[WebCloner] Extrayendo HTML...');
    const html = await page.content();
    
    // Extraer título y descripción
    const title = await page.title();
    const description = await page.$eval(
      'meta[name="description"]',
      (el) => el.getAttribute('content') || ''
    ).catch(() => '');
    
    // Extraer estilos computados
    console.log('[WebCloner] Extrayendo estilos...');
    const styles = await extractStyles(page);
    
    // Extraer contenido
    console.log('[WebCloner] Extrayendo contenido...');
    const content = await extractContent(page, html);
    
    // Extraer assets
    console.log('[WebCloner] Extrayendo assets...');
    const assets = await extractAssets(page, html);
    
    console.log('[WebCloner] Scraping completado');
    
    return {
      url,
      screenshot,
      html,
      title,
      description,
      styles,
      content,
      assets,
    };
  } finally {
    await context.close();
  }
}

/**
 * Extrae los estilos principales de la página
 */
async function extractStyles(page: Page): Promise<ExtractedStyles> {
  // Usar una función inline sin arrow functions para evitar problemas con esbuild
  const stylesData = await page.evaluate(`
    (function() {
      function rgbToHex(rgb) {
        var match = rgb.match(/\\d+/g);
        if (!match || match.length < 3) return rgb;
        var r = parseInt(match[0]);
        var g = parseInt(match[1]);
        var b = parseInt(match[2]);
        return '#' + [r, g, b].map(function(x) { return x.toString(16).padStart(2, '0'); }).join('');
      }
      
      var primaryButton = document.querySelector('button, .btn, [class*="primary"], a[class*="btn"]');
      var primaryBg = primaryButton ? window.getComputedStyle(primaryButton).backgroundColor : 'rgb(59, 130, 246)';
      
      var body = document.body;
      var bodyStyles = window.getComputedStyle(body);
      
      var h1 = document.querySelector('h1');
      var h1Styles = h1 ? window.getComputedStyle(h1) : null;
      
      return {
        colors: {
          primary: rgbToHex(primaryBg),
          secondary: rgbToHex(bodyStyles.backgroundColor || 'rgb(255, 255, 255)'),
          accent: rgbToHex(primaryBg),
          background: rgbToHex(bodyStyles.backgroundColor || 'rgb(255, 255, 255)'),
          foreground: rgbToHex(bodyStyles.color || 'rgb(0, 0, 0)'),
          muted: '#6b7280',
          border: '#e5e7eb'
        },
        typography: {
          fontFamily: bodyStyles.fontFamily.split(',')[0].replace(/['"]/g, '') || 'Inter',
          headingFamily: h1Styles ? h1Styles.fontFamily.split(',')[0].replace(/['"]/g, '') : 'Inter',
          sizes: {
            h1: h1Styles ? h1Styles.fontSize : '48px',
            h2: '36px',
            h3: '24px',
            body: bodyStyles.fontSize || '16px'
          }
        },
        spacing: {
          sectionPadding: '80px',
          containerMaxWidth: '1280px'
        },
        borders: {
          radius: '8px'
        }
      };
    })()
  `);
  
  return stylesData as ExtractedStyles;
}

/**
 * Extrae el contenido estructurado de la página
 */
async function extractContent(page: Page, html: string): Promise<ExtractedContent> {
  const $ = cheerio.load(html);
  const content: ExtractedContent = {};
  
  // Extraer header/nav
  const navItems: Array<{ text: string; href: string }> = [];
  $('nav a, header a').each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr('href') || '#';
    if (text && text.length < 50) {
      navItems.push({ text, href });
    }
  });
  
  const logo = $('header img, nav img, .logo img').first().attr('src') || '';
  content.header = { logo, navItems: navItems.slice(0, 6) };
  
  // Extraer hero (primer h1 + párrafo cercano)
  const h1 = $('h1').first();
  if (h1.length) {
    const heroTitle = h1.text().trim();
    const heroSubtitle = h1.next('p').text().trim() || 
                         h1.parent().find('p').first().text().trim() ||
                         $('h1').parent().next().find('p').first().text().trim();
    
    // Buscar CTAs cerca del hero
    const heroCTAs = h1.parent().find('a, button').slice(0, 2);
    const primaryCTA = heroCTAs.first();
    const secondaryCTA = heroCTAs.eq(1);
    
    // Buscar imagen del hero
    const heroImage = h1.parent().find('img').first().attr('src') ||
                      h1.closest('section').find('img').first().attr('src') || '';
    
    content.hero = {
      title: heroTitle,
      subtitle: heroSubtitle,
      primaryCTA: primaryCTA.length ? { text: primaryCTA.text().trim(), href: primaryCTA.attr('href') || '#' } : undefined,
      secondaryCTA: secondaryCTA.length ? { text: secondaryCTA.text().trim(), href: secondaryCTA.attr('href') || '#' } : undefined,
      image: heroImage,
    };
  }
  
  // Extraer features (buscar grids de cards con iconos)
  const features: ExtractedContent['features'] = [];
  $('[class*="feature"], [class*="card"], [class*="benefit"]').each((_, el) => {
    const title = $(el).find('h2, h3, h4').first().text().trim();
    const description = $(el).find('p').first().text().trim();
    if (title && description && title.length < 100) {
      features.push({ title, description });
    }
  });
  if (features.length > 0) {
    content.features = features.slice(0, 6);
  }
  
  // Extraer testimonios
  const testimonials: ExtractedContent['testimonials'] = [];
  $('[class*="testimonial"], [class*="review"], [class*="quote"], blockquote').each((_, el) => {
    const quote = $(el).find('p, blockquote').first().text().trim() ||
                  $(el).text().trim();
    const name = $(el).find('[class*="name"], [class*="author"], strong, b').first().text().trim();
    const role = $(el).find('[class*="role"], [class*="title"], [class*="position"]').first().text().trim();
    const avatar = $(el).find('img').first().attr('src') || '';
    
    if (quote && quote.length > 20 && quote.length < 500) {
      testimonials.push({ quote, name: name || 'Cliente', role: role || '', avatar });
    }
  });
  if (testimonials.length > 0) {
    content.testimonials = testimonials.slice(0, 6);
  }
  
  // Extraer FAQ
  const faq: ExtractedContent['faq'] = [];
  $('[class*="faq"], [class*="accordion"], details, summary').each((_, el) => {
    const question = $(el).find('h3, h4, summary, [class*="question"]').first().text().trim() ||
                     $(el).is('summary') ? $(el).text().trim() : '';
    const answer = $(el).find('p, [class*="answer"]').first().text().trim() ||
                   $(el).next('div, p').text().trim();
    if (question && answer && question.length > 5) {
      faq.push({ question, answer });
    }
  });
  if (faq.length > 0) {
    content.faq = faq.slice(0, 8);
  }
  
  // Extraer footer
  const footerColumns: Array<{ title: string; links: Array<{ text: string; href: string }> }> = [];
  $('footer [class*="col"], footer > div > div').each((_, el) => {
    const title = $(el).find('h3, h4, h5, strong').first().text().trim();
    const links: Array<{ text: string; href: string }> = [];
    $(el).find('a').each((_, link) => {
      const text = $(link).text().trim();
      const href = $(link).attr('href') || '#';
      if (text && text.length < 50) {
        links.push({ text, href });
      }
    });
    if (title || links.length > 0) {
      footerColumns.push({ title: title || '', links });
    }
  });
  
  const copyright = $('footer').text().match(/©.*?\d{4}.*?(?:\.|$)/)?.[0] || 
                    `© ${new Date().getFullYear()} All rights reserved.`;
  
  content.footer = {
    copyright,
    columns: footerColumns.slice(0, 4),
  };
  
  return content;
}

/**
 * Extrae las URLs de imágenes y fuentes
 */
async function extractAssets(page: Page, html: string): Promise<{ images: ImageAsset[]; fonts: string[] }> {
  const $ = cheerio.load(html);
  const images: ImageAsset[] = [];
  const fonts: string[] = [];
  
  // Extraer imágenes de <img>
  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    const alt = $(el).attr('alt') || '';
    if (src && !src.startsWith('data:')) {
      const isLogo = $(el).closest('header, nav, .logo').length > 0;
      images.push({ src, alt, type: isLogo ? 'logo' : 'img' });
    }
  });
  
  // Extraer imágenes de background-image en estilos inline
  $('[style*="background"]').each((_, el) => {
    const style = $(el).attr('style') || '';
    const match = style.match(/url\(['"]?([^'")\s]+)['"]?\)/);
    if (match && match[1]) {
      images.push({ src: match[1], alt: '', type: 'background' });
    }
  });
  
  // Extraer fuentes de Google Fonts
  $('link[href*="fonts.googleapis.com"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const familyMatch = href.match(/family=([^&:]+)/);
    if (familyMatch) {
      fonts.push(familyMatch[1].replace(/\+/g, ' '));
    }
  });
  
  return { images: images.slice(0, 20), fonts };
}

/**
 * Cierra el browser cuando ya no se necesita
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}
