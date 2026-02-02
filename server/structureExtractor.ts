/**
 * Structure Extractor - Extrae la estructura real de secciones de una página web
 * Detecta secciones semánticas, su orden, y contenido específico
 */

import * as cheerio from 'cheerio';
import type { CheerioAPI } from 'cheerio';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Element = any;

export interface ExtractedSection {
  id: string;
  type: SectionType;
  order: number;
  variant: string;
  content: SectionContent;
  styles: SectionStyles;
  rawHtml?: string;
}

export type SectionType = 
  | 'header' | 'hero' | 'logocloud' | 'features' | 'services' 
  | 'about' | 'process' | 'stats' | 'testimonials' | 'pricing' 
  | 'faq' | 'gallery' | 'team' | 'portfolio' | 'clients' 
  | 'benefits' | 'location' | 'cta' | 'form' | 'footer' | 'unknown';

export interface SectionContent {
  title?: string;
  subtitle?: string;
  description?: string;
  items?: Array<{
    title: string;
    description?: string;
    icon?: string;
    image?: string;
    price?: string;
    link?: string;
  }>;
  ctas?: Array<{
    text: string;
    href: string;
    style: 'primary' | 'secondary' | 'outline';
  }>;
  images?: string[];
  stats?: Array<{ value: string; label: string }>;
  testimonials?: Array<{
    quote: string;
    author: string;
    role?: string;
    company?: string;
    avatar?: string;
    rating?: number;
  }>;
  faqs?: Array<{ question: string; answer: string }>;
  navigation?: Array<{ label: string; href: string }>;
  logo?: string;
  socialLinks?: Array<{ platform: string; url: string }>;
}

export interface SectionStyles {
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  padding?: string;
  hasGradient?: boolean;
  hasDarkBg?: boolean;
}

/**
 * Extrae la estructura completa de secciones de una página
 */
export function extractStructure(html: string): ExtractedSection[] {
  const $ = cheerio.load(html);
  const sections: ExtractedSection[] = [];
  let order = 0;

  // 1. Extraer header
  const header = extractHeader($);
  if (header) {
    sections.push({ ...header, order: order++ });
  }

  // 2. Detectar y extraer secciones del body
  const mainSections = detectMainSections($);
  for (const section of mainSections) {
    sections.push({ ...section, order: order++ });
  }

  // 3. Extraer footer
  const footer = extractFooter($);
  if (footer) {
    sections.push({ ...footer, order: order++ });
  }

  console.log(`[StructureExtractor] Extracted ${sections.length} sections:`, 
    sections.map(s => s.type).join(' → '));

  return sections;
}

/**
 * Extrae el header/navegación
 */
function extractHeader($: CheerioAPI): ExtractedSection | null {
  const header = $('header').first();
  if (!header.length) {
    const nav = $('nav').first();
    if (!nav.length) return null;
  }

  const headerEl = $('header').length ? $('header').first() : $('nav').first().parent();
  
  // Extraer logo
  const logoImg = headerEl.find('img').first();
  const logoSrc = logoImg.attr('src') || logoImg.attr('data-src') || '';
  const logoAlt = logoImg.attr('alt') || '';
  
  // Extraer navegación
  const navigation: Array<{ label: string; href: string }> = [];
  headerEl.find('nav a, header a').each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr('href') || '#';
    if (text && text.length < 30 && !text.toLowerCase().includes('logo')) {
      navigation.push({ label: text, href });
    }
  });

  // Extraer CTA del header
  const ctas: Array<{ text: string; href: string; style: 'primary' | 'secondary' | 'outline' }> = [];
  headerEl.find('a[class*="btn"], button, a[class*="cta"]').each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr('href') || '#';
    if (text && text.length < 30) {
      const classes = $(el).attr('class') || '';
      const style = classes.includes('primary') ? 'primary' : 
                    classes.includes('secondary') ? 'secondary' : 'outline';
      ctas.push({ text, href, style });
    }
  });

  return {
    id: 'header-1',
    type: 'header',
    order: 0,
    variant: 'default',
    content: {
      logo: logoSrc,
      navigation: navigation.slice(0, 8),
      ctas: ctas.slice(0, 2),
    },
    styles: extractElementStyles($, headerEl),
  };
}

/**
 * Detecta las secciones principales del contenido
 */
function detectMainSections($: CheerioAPI): ExtractedSection[] {
  const sections: ExtractedSection[] = [];
  const processedElements = new Set<Element>();

  // Selectores para encontrar secciones
  const sectionSelectors = [
    'section',
    'main > div',
    '[class*="section"]',
    '[class*="container"] > div',
    '[id]',
  ];

  // Buscar todas las secciones potenciales
  const potentialSections: Element[] = [];
  
  for (const selector of sectionSelectors) {
    $(selector).each((_, el) => {
      // Evitar duplicados y elementos muy pequeños
      if (!processedElements.has(el)) {
        const height = estimateElementHeight($, el);
        if (height > 100) { // Solo secciones con contenido significativo
          potentialSections.push(el);
          processedElements.add(el);
        }
      }
    });
  }

  // Ordenar por posición en el DOM
  potentialSections.sort((a, b) => {
    const indexA = $('*').index($(a));
    const indexB = $('*').index($(b));
    return indexA - indexB;
  });

  // Analizar cada sección potencial
  let sectionIndex = 1;
  for (const el of potentialSections) {
    const $el = $(el);
    
    // Ignorar header y footer (ya procesados)
    if ($el.is('header') || $el.is('footer') || 
        $el.closest('header').length || $el.closest('footer').length) {
      continue;
    }

    const sectionType = detectSectionType($, $el);
    if (sectionType === 'unknown' && !hasSignificantContent($, $el)) {
      continue;
    }

    const section = extractSectionContent($, $el, sectionType, sectionIndex);
    if (section) {
      sections.push(section);
      sectionIndex++;
    }
  }

  // Si no encontramos secciones con selectores, intentar con análisis heurístico
  if (sections.length === 0) {
    return extractSectionsHeuristically($);
  }

  return deduplicateSections(sections);
}

/**
 * Detecta el tipo de sección basándose en su contenido y clases
 */
function detectSectionType($: CheerioAPI, $el: cheerio.Cheerio<Element>): SectionType {
  const classes = ($el.attr('class') || '').toLowerCase();
  const id = ($el.attr('id') || '').toLowerCase();
  const text = $el.text().toLowerCase();
  
  // Patrones de detección por clases/id
  const patterns: Array<{ type: SectionType; keywords: string[] }> = [
    { type: 'hero', keywords: ['hero', 'banner', 'jumbotron', 'masthead', 'intro'] },
    { type: 'features', keywords: ['feature', 'benefit', 'service', 'capability', 'what-we'] },
    { type: 'testimonials', keywords: ['testimonial', 'review', 'quote', 'feedback', 'customer-say'] },
    { type: 'pricing', keywords: ['pricing', 'price', 'plan', 'package', 'subscription'] },
    { type: 'faq', keywords: ['faq', 'question', 'accordion', 'help'] },
    { type: 'about', keywords: ['about', 'story', 'history', 'who-we', 'mission'] },
    { type: 'team', keywords: ['team', 'staff', 'people', 'member', 'founder'] },
    { type: 'gallery', keywords: ['gallery', 'portfolio', 'work', 'project', 'showcase'] },
    { type: 'stats', keywords: ['stat', 'number', 'counter', 'metric', 'achievement'] },
    { type: 'cta', keywords: ['cta', 'call-to-action', 'get-started', 'contact', 'signup'] },
    { type: 'logocloud', keywords: ['logo', 'partner', 'client', 'brand', 'trusted'] },
    { type: 'process', keywords: ['process', 'step', 'how-it-work', 'workflow'] },
    { type: 'form', keywords: ['form', 'contact', 'newsletter', 'subscribe'] },
    { type: 'location', keywords: ['location', 'map', 'address', 'find-us', 'visit'] },
  ];

  // Buscar coincidencias en clases e id
  for (const pattern of patterns) {
    for (const keyword of pattern.keywords) {
      if (classes.includes(keyword) || id.includes(keyword)) {
        return pattern.type;
      }
    }
  }

  // Detección por contenido
  const hasH1 = $el.find('h1').length > 0;
  const hasH2 = $el.find('h2').length > 0;
  const hasCards = $el.find('[class*="card"]').length >= 3;
  const hasTestimonialQuotes = $el.find('blockquote, [class*="quote"]').length > 0;
  const hasPricing = text.includes('$') || text.includes('€') || text.includes('/mes') || text.includes('/month');
  const hasForm = $el.find('form, input, textarea').length > 0;
  const hasStats = $el.find('[class*="stat"], [class*="counter"]').length >= 2;
  const hasLogos = $el.find('img').length >= 4 && !hasCards;

  // Heurísticas de detección
  if (hasH1 && $el.index() < 3) return 'hero';
  if (hasTestimonialQuotes) return 'testimonials';
  if (hasPricing && hasCards) return 'pricing';
  if (hasForm) return 'form';
  if (hasStats) return 'stats';
  if (hasLogos && $el.find('h2, h3').length <= 1) return 'logocloud';
  if (hasCards && hasH2) return 'features';

  // Detección por texto
  if (text.includes('faq') || text.includes('preguntas frecuentes') || text.includes('frequently asked')) return 'faq';
  if (text.includes('testimonios') || text.includes('testimonials') || text.includes('what our')) return 'testimonials';
  if (text.includes('equipo') || text.includes('team') || text.includes('our people')) return 'team';

  return 'unknown';
}

/**
 * Extrae el contenido de una sección específica
 */
function extractSectionContent(
  $: CheerioAPI, 
  $el: cheerio.Cheerio<Element>, 
  type: SectionType,
  index: number
): ExtractedSection | null {
  const content: SectionContent = {};
  
  // Extraer título y subtítulo
  const h1 = $el.find('h1').first();
  const h2 = $el.find('h2').first();
  const h3 = $el.find('h3').first();
  
  content.title = h1.text().trim() || h2.text().trim() || h3.text().trim();
  
  // Buscar subtítulo (párrafo después del título)
  const titleEl = h1.length ? h1 : (h2.length ? h2 : h3);
  if (titleEl.length) {
    const subtitle = titleEl.next('p').text().trim() || 
                     titleEl.parent().find('p').first().text().trim();
    if (subtitle && subtitle.length < 300) {
      content.subtitle = subtitle;
    }
  }

  // Extraer contenido específico según el tipo
  switch (type) {
    case 'hero':
      extractHeroContent($, $el, content);
      break;
    case 'features':
    case 'services':
    case 'benefits':
      extractFeaturesContent($, $el, content);
      break;
    case 'testimonials':
      extractTestimonialsContent($, $el, content);
      break;
    case 'pricing':
      extractPricingContent($, $el, content);
      break;
    case 'faq':
      extractFaqContent($, $el, content);
      break;
    case 'stats':
      extractStatsContent($, $el, content);
      break;
    case 'logocloud':
    case 'clients':
      extractLogocloudContent($, $el, content);
      break;
    case 'team':
      extractTeamContent($, $el, content);
      break;
    case 'gallery':
    case 'portfolio':
      extractGalleryContent($, $el, content);
      break;
    case 'cta':
      extractCtaContent($, $el, content);
      break;
    case 'form':
      extractFormContent($, $el, content);
      break;
    case 'process':
      extractProcessContent($, $el, content);
      break;
  }

  // Detectar variante del layout
  const variant = detectSectionVariant($, $el, type);

  return {
    id: `${type}-${index}`,
    type,
    order: index,
    variant,
    content,
    styles: extractElementStyles($, $el),
  };
}

/**
 * Extrae contenido específico del hero
 */
function extractHeroContent($: CheerioAPI, $el: cheerio.Cheerio<Element>, content: SectionContent): void {
  // Extraer CTAs
  content.ctas = [];
  $el.find('a[class*="btn"], button, a[class*="cta"]').each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr('href') || '#';
    if (text && text.length < 50) {
      const classes = $(el).attr('class') || '';
      const style = classes.includes('secondary') || classes.includes('outline') ? 'secondary' : 'primary';
      content.ctas!.push({ text, href, style });
    }
  });
  content.ctas = content.ctas.slice(0, 2);

  // Extraer imagen del hero
  const heroImg = $el.find('img').first();
  if (heroImg.length) {
    content.images = [heroImg.attr('src') || heroImg.attr('data-src') || ''];
  }
}

/**
 * Extrae contenido de features/servicios
 */
function extractFeaturesContent($: CheerioAPI, $el: cheerio.Cheerio<Element>, content: SectionContent): void {
  content.items = [];
  
  // Buscar cards o items de features
  const cardSelectors = '[class*="card"], [class*="feature"], [class*="item"], [class*="col"]';
  $el.find(cardSelectors).each((_, el) => {
    const $card = $(el);
    const title = $card.find('h3, h4, h5, strong').first().text().trim();
    const description = $card.find('p').first().text().trim();
    const icon = $card.find('svg, [class*="icon"], i').first().attr('class') || '';
    const image = $card.find('img').first().attr('src') || '';
    
    if (title && title.length < 100) {
      content.items!.push({
        title,
        description: description.length < 500 ? description : description.substring(0, 500),
        icon: icon || undefined,
        image: image || undefined,
      });
    }
  });

  content.items = content.items.slice(0, 8);
}

/**
 * Extrae testimonios
 */
function extractTestimonialsContent($: CheerioAPI, $el: cheerio.Cheerio<Element>, content: SectionContent): void {
  content.testimonials = [];
  
  const testimonialSelectors = '[class*="testimonial"], [class*="review"], blockquote, [class*="quote"]';
  $el.find(testimonialSelectors).each((_, el) => {
    const $testimonial = $(el);
    const quote = $testimonial.find('p, blockquote').first().text().trim() ||
                  $testimonial.text().trim();
    const author = $testimonial.find('[class*="name"], [class*="author"], strong, cite').first().text().trim();
    const role = $testimonial.find('[class*="role"], [class*="title"], [class*="position"]').first().text().trim();
    const avatar = $testimonial.find('img').first().attr('src') || '';
    
    // Detectar rating (estrellas)
    const stars = $testimonial.find('[class*="star"], svg').length;
    const rating = stars > 0 && stars <= 5 ? stars : undefined;
    
    if (quote && quote.length > 20 && quote.length < 1000) {
      content.testimonials!.push({
        quote: quote.replace(/[""]/g, '"'),
        author: author || 'Cliente',
        role: role || undefined,
        avatar: avatar || undefined,
        rating,
      });
    }
  });

  content.testimonials = content.testimonials.slice(0, 6);
}

/**
 * Extrae contenido de pricing
 */
function extractPricingContent($: CheerioAPI, $el: cheerio.Cheerio<Element>, content: SectionContent): void {
  content.items = [];
  
  $el.find('[class*="pricing"], [class*="plan"], [class*="card"]').each((_, el) => {
    const $plan = $(el);
    const title = $plan.find('h3, h4, [class*="name"]').first().text().trim();
    const priceText = $plan.find('[class*="price"], [class*="amount"]').first().text().trim();
    const price = priceText.match(/[\$€£]?\d+(?:[.,]\d+)?/)?.[0] || priceText;
    
    // Extraer features del plan
    const features: string[] = [];
    $plan.find('li, [class*="feature"]').each((_, li) => {
      const text = $(li).text().trim();
      if (text && text.length < 100) {
        features.push(text);
      }
    });
    
    if (title || price) {
      content.items!.push({
        title: title || 'Plan',
        price: price || '',
        description: features.slice(0, 8).join(' • '),
      });
    }
  });

  content.items = content.items.slice(0, 4);
}

/**
 * Extrae FAQs
 */
function extractFaqContent($: CheerioAPI, $el: cheerio.Cheerio<Element>, content: SectionContent): void {
  content.faqs = [];
  
  // Buscar en accordions, details, o divs con estructura Q&A
  const faqSelectors = 'details, [class*="accordion"], [class*="faq-item"], [class*="question"]';
  $el.find(faqSelectors).each((_, el) => {
    const $faq = $(el);
    const question = $faq.find('summary, [class*="question"], h3, h4, button').first().text().trim();
    const answer = $faq.find('[class*="answer"], p, [class*="content"]').first().text().trim() ||
                   $faq.find('div').last().text().trim();
    
    if (question && answer && question.length < 200) {
      content.faqs!.push({
        question,
        answer: answer.length < 1000 ? answer : answer.substring(0, 1000),
      });
    }
  });

  content.faqs = content.faqs.slice(0, 10);
}

/**
 * Extrae estadísticas
 */
function extractStatsContent($: CheerioAPI, $el: cheerio.Cheerio<Element>, content: SectionContent): void {
  content.stats = [];
  
  $el.find('[class*="stat"], [class*="counter"], [class*="number"]').each((_, el) => {
    const $stat = $(el);
    const value = $stat.find('[class*="value"], [class*="number"], strong, span').first().text().trim() ||
                  $stat.contents().first().text().trim();
    const label = $stat.find('[class*="label"], [class*="title"], p').first().text().trim();
    
    if (value && /\d/.test(value)) {
      content.stats!.push({
        value: value.replace(/\s+/g, ''),
        label: label || '',
      });
    }
  });

  content.stats = content.stats.slice(0, 6);
}

/**
 * Extrae logos de clientes/partners
 */
function extractLogocloudContent($: CheerioAPI, $el: cheerio.Cheerio<Element>, content: SectionContent): void {
  content.images = [];
  
  $el.find('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    if (src && !src.startsWith('data:')) {
      content.images!.push(src);
    }
  });

  content.images = content.images.slice(0, 12);
}

/**
 * Extrae miembros del equipo
 */
function extractTeamContent($: CheerioAPI, $el: cheerio.Cheerio<Element>, content: SectionContent): void {
  content.items = [];
  
  $el.find('[class*="member"], [class*="team"], [class*="card"]').each((_, el) => {
    const $member = $(el);
    const name = $member.find('h3, h4, [class*="name"]').first().text().trim();
    const role = $member.find('[class*="role"], [class*="title"], [class*="position"], p').first().text().trim();
    const image = $member.find('img').first().attr('src') || '';
    
    if (name) {
      content.items!.push({
        title: name,
        description: role,
        image: image || undefined,
      });
    }
  });

  content.items = content.items.slice(0, 8);
}

/**
 * Extrae galería/portfolio
 */
function extractGalleryContent($: CheerioAPI, $el: cheerio.Cheerio<Element>, content: SectionContent): void {
  content.images = [];
  content.items = [];
  
  $el.find('img, [class*="project"], [class*="work"]').each((_, el) => {
    const $item = $(el);
    
    if ($item.is('img')) {
      const src = $item.attr('src') || $item.attr('data-src') || '';
      if (src && !src.startsWith('data:')) {
        content.images!.push(src);
      }
    } else {
      const title = $item.find('h3, h4, [class*="title"]').first().text().trim();
      const image = $item.find('img').first().attr('src') || '';
      const description = $item.find('p, [class*="description"]').first().text().trim();
      
      if (title || image) {
        content.items!.push({
          title: title || 'Project',
          description: description || undefined,
          image: image || undefined,
        });
      }
    }
  });

  content.images = content.images?.slice(0, 12);
  content.items = content.items?.slice(0, 8);
}

/**
 * Extrae CTA section
 */
function extractCtaContent($: CheerioAPI, $el: cheerio.Cheerio<Element>, content: SectionContent): void {
  content.ctas = [];
  
  $el.find('a[class*="btn"], button, a[class*="cta"]').each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr('href') || '#';
    if (text && text.length < 50) {
      content.ctas!.push({ text, href, style: 'primary' });
    }
  });

  content.ctas = content.ctas.slice(0, 2);
}

/**
 * Extrae formulario
 */
function extractFormContent($: CheerioAPI, $el: cheerio.Cheerio<Element>, content: SectionContent): void {
  content.items = [];
  
  $el.find('input, textarea, select').each((_, el) => {
    const $input = $(el);
    const name = $input.attr('name') || $input.attr('placeholder') || '';
    const type = $input.attr('type') || 'text';
    const label = $input.prev('label').text().trim() || 
                  $input.closest('label').text().trim() ||
                  $input.attr('placeholder') || '';
    
    if (name || label) {
      content.items!.push({
        title: label || name,
        description: type,
      });
    }
  });
}

/**
 * Extrae proceso/pasos
 */
function extractProcessContent($: CheerioAPI, $el: cheerio.Cheerio<Element>, content: SectionContent): void {
  content.items = [];
  
  $el.find('[class*="step"], [class*="process"], [class*="timeline"]').each((i, el) => {
    const $step = $(el);
    const title = $step.find('h3, h4, [class*="title"]').first().text().trim();
    const description = $step.find('p, [class*="description"]').first().text().trim();
    const number = $step.find('[class*="number"], [class*="step"]').first().text().trim() || `${i + 1}`;
    
    if (title) {
      content.items!.push({
        title,
        description,
        icon: number,
      });
    }
  });

  content.items = content.items.slice(0, 6);
}

/**
 * Extrae el footer
 */
function extractFooter($: CheerioAPI): ExtractedSection | null {
  const footer = $('footer').first();
  if (!footer.length) return null;

  const content: SectionContent = {
    navigation: [],
    socialLinks: [],
  };

  // Extraer links del footer
  footer.find('a').each((_, el) => {
    const text = $(el).text().trim();
    const href = $(el).attr('href') || '#';
    
    // Detectar redes sociales
    const socialPatterns = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok'];
    const isSocial = socialPatterns.some(p => href.toLowerCase().includes(p) || text.toLowerCase().includes(p));
    
    if (isSocial) {
      const platform = socialPatterns.find(p => href.toLowerCase().includes(p) || text.toLowerCase().includes(p)) || 'link';
      content.socialLinks!.push({ platform, url: href });
    } else if (text && text.length < 50) {
      content.navigation!.push({ label: text, href });
    }
  });

  // Extraer copyright
  const copyrightMatch = footer.text().match(/©.*?\d{4}.*?(?:\.|$)/);
  if (copyrightMatch) {
    content.description = copyrightMatch[0].trim();
  }

  // Extraer logo
  const footerLogo = footer.find('img').first();
  content.logo = footerLogo.attr('src') || '';

  return {
    id: 'footer-1',
    type: 'footer',
    order: 999,
    variant: 'default',
    content,
    styles: extractElementStyles($, footer),
  };
}

/**
 * Detecta la variante de layout de una sección
 */
function detectSectionVariant($: CheerioAPI, $el: cheerio.Cheerio<Element>, type: SectionType): string {
  const hasImage = $el.find('img').length > 0;
  const imagePosition = $el.find('img').first().parent().index();
  const textPosition = $el.find('h1, h2, h3').first().parent().index();
  
  // Detectar grid layout
  const gridCols = $el.find('[class*="grid"], [class*="col"]').length;
  
  switch (type) {
    case 'hero':
      if (!hasImage) return 'centered';
      if (imagePosition < textPosition) return 'split-right';
      return 'split-left';
    
    case 'features':
      if (gridCols >= 4) return 'grid';
      if (gridCols === 3) return 'cards3d';
      if ($el.find('[class*="alternate"]').length) return 'alternating';
      return 'bento';
    
    case 'testimonials':
      if ($el.find('[class*="carousel"], [class*="slider"]').length) return 'carousel';
      if ($el.find('[class*="masonry"]').length) return 'masonry';
      if ($el.find('[class*="featured"]').length) return 'featured';
      return 'grid';
    
    case 'pricing':
      if ($el.find('[class*="comparison"]').length) return 'comparison';
      if ($el.find('[class*="horizontal"]').length) return 'horizontal';
      return 'cards';
    
    default:
      return 'default';
  }
}

/**
 * Extrae estilos de un elemento
 */
function extractElementStyles($: CheerioAPI, $el: cheerio.Cheerio<Element>): SectionStyles {
  const style = $el.attr('style') || '';
  const classes = $el.attr('class') || '';
  
  // Detectar colores de fondo
  const bgColorMatch = style.match(/background(?:-color)?:\s*([^;]+)/i);
  const bgColor = bgColorMatch ? bgColorMatch[1].trim() : undefined;
  
  // Detectar si es oscuro
  const hasDarkBg = classes.includes('dark') || 
                    classes.includes('bg-black') || 
                    classes.includes('bg-gray-9') ||
                    (bgColor && isDarkColor(bgColor));
  
  // Detectar gradiente
  const hasGradient = style.includes('gradient') || classes.includes('gradient');
  
  return {
    backgroundColor: bgColor,
  hasDarkBg: hasDarkBg || false,
  hasGradient: hasGradient ? true : false,
  };
}

/**
 * Verifica si un color es oscuro
 */
function isDarkColor(color: string): boolean {
  // Convertir a RGB si es hex
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }
  
  // Colores conocidos oscuros
  const darkColors = ['black', 'dark', 'navy', 'slate', 'gray-8', 'gray-9'];
  return darkColors.some(dc => color.toLowerCase().includes(dc));
}

/**
 * Estima la altura de un elemento
 */
function estimateElementHeight($: CheerioAPI, el: Element): number {
  const $el = $(el);
  const children = $el.children().length;
  const text = $el.text().length;
  const images = $el.find('img').length;
  
  // Estimación heurística
  return children * 50 + text * 0.5 + images * 100;
}

/**
 * Verifica si un elemento tiene contenido significativo
 */
function hasSignificantContent($: CheerioAPI, $el: cheerio.Cheerio<Element>): boolean {
  const text = $el.text().trim();
  const images = $el.find('img').length;
  const headings = $el.find('h1, h2, h3, h4').length;
  
  return text.length > 50 || images > 0 || headings > 0;
}

/**
 * Extrae secciones usando heurísticas cuando los selectores fallan
 */
function extractSectionsHeuristically($: CheerioAPI): ExtractedSection[] {
  const sections: ExtractedSection[] = [];
  let order = 1;

  // Buscar h1 para el hero
  const h1 = $('h1').first();
  if (h1.length) {
    const heroSection = h1.closest('section, div').first();
    if (heroSection.length) {
      const section = extractSectionContent($, heroSection, 'hero', order++);
      if (section) sections.push(section);
    }
  }

  // Buscar h2s para otras secciones
  $('h2').each((_, el) => {
    const $h2 = $(el);
    const sectionEl = $h2.closest('section, div').first();
    if (sectionEl.length && !sectionEl.is('header') && !sectionEl.is('footer')) {
      const type = detectSectionType($, sectionEl);
      const section = extractSectionContent($, sectionEl, type !== 'unknown' ? type : 'features', order++);
      if (section) sections.push(section);
    }
  });

  return sections;
}

/**
 * Elimina secciones duplicadas
 */
function deduplicateSections(sections: ExtractedSection[]): ExtractedSection[] {
  const seen = new Set<string>();
  return sections.filter(section => {
    const key = `${section.type}-${section.content.title || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
