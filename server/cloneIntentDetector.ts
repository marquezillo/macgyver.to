/**
 * Clone Intent Detector - Detecta intención de clonación en mensajes de chat
 * Integrado 100% en el flujo de conversación
 */

export interface CloneIntent {
  isCloneRequest: boolean;
  url: string | null;
  confidence: number; // 0-1
}

// Patrones que indican intención de clonar
const CLONE_PATTERNS = [
  // Español - Patrones directos
  /(?:hazme|haz)\s+(?:un\s+)?clon(?:a)?(?:me)?\s+(?:de\s+)?(?:la\s+|esta\s+)?(?:web|landing|página|pagina|sitio)?/i,
  /(?:créa|crea|hazme|genera|diseña|construye|haz)(?:me)?\s+(?:una\s+)?(?:web|landing|página|pagina|sitio)\s+(?:como|igual\s+(?:a|que)|parecida?\s+a|similar\s+a|basada?\s+en)/i,
  /(?:clona|copia|replica|imita|duplica)(?:me)?\s+(?:esta\s+)?(?:web|landing|página|pagina|sitio|diseño)?/i,
  /(?:quiero|necesito|me\s+gustaría|quisiera)\s+(?:una\s+)?(?:web|landing|página|pagina)\s+(?:como|igual\s+(?:a|que)|parecida?\s+a)/i,
  /(?:inspirate|basate|toma\s+como\s+referencia|usa\s+como\s+modelo)\s+(?:en\s+)?(?:esta\s+)?(?:web|landing|página|pagina)/i,
  /(?:copia|replica|clona)\s+(?:el\s+)?(?:diseño|estilo|layout)\s+(?:de\s+)?/i,
  /(?:hazlo|hazla|creala|crealo)\s+(?:igual|como)\s+(?:esta|este|a\s+esta)/i,
  /(?:web|landing|página)\s+(?:como|igual\s+a)\s+(?:esta|este)/i,
  
  // Español - Patrones adicionales
  /clon(?:a|ar)?\s+(?:de\s+)?(?:la\s+)?(?:web|página|landing)/i,
  /(?:hazme|haz|crea|genera)\s+(?:una?\s+)?(?:copia|clon|réplica)/i,
  /(?:igual|idéntica?|exacta?)\s+(?:a|que)\s+(?:esta|esa)\s+(?:web|página|landing)/i,
  /(?:basándote|basandote|basado)\s+en\s+(?:esta|esa)\s+(?:web|página|url)/i,
  /(?:clonar|copiar|replicar)\s+(?:esta|esa|la)\s+(?:web|página|landing)/i,
  
  // Inglés
  /(?:create|make|build|design|generate)\s+(?:me\s+)?(?:a\s+)?(?:web(?:site)?|landing(?:\s+page)?|page|site)\s+(?:like|similar\s+to|based\s+on)/i,
  /(?:clone|copy|replicate|duplicate)\s+(?:this\s+)?(?:web|landing|page|site|design)?/i,
  /(?:i\s+want|i\s+need|i'd\s+like)\s+(?:a\s+)?(?:web|landing|page)\s+(?:like|similar\s+to)/i,
  /(?:use\s+as\s+reference|take\s+inspiration\s+from|base\s+it\s+on)\s+(?:this\s+)?(?:web|landing|page)/i,
  /(?:copy|replicate|clone)\s+(?:the\s+)?(?:design|style|layout)\s+(?:of|from)/i,
  /(?:make\s+it|create\s+it)\s+(?:like|similar\s+to)\s+(?:this|that)/i,
  /website\s+like/i,
  /clone\s+(?:this\s+)?(?:web|page|site|url)/i,
];

// Palabras clave simples que junto con una URL indican clonación
const SIMPLE_CLONE_KEYWORDS = [
  'clon', 'clona', 'clonar', 'clone',
  'copia', 'copiar', 'copy',
  'replica', 'replicar', 'replicate',
  'igual', 'idéntica', 'identica', 'exacta',
  'como esta', 'like this', 'similar',
  'basándote', 'basandote', 'based on',
  'igual que', 'igual a', 'like',
];

// Patrones para extraer URLs
const URL_PATTERNS = [
  // URLs completas
  /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi,
  // Dominios sin protocolo
  /(?:www\.)?[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:\/[^\s<>"{}|\\^`\[\]]*)?/gi,
];

/**
 * Detecta si un mensaje contiene intención de clonar una web
 */
export function detectCloneIntent(message: string): CloneIntent {
  const normalizedMessage = message.toLowerCase().trim();
  
  // Primero buscar URL
  let url: string | null = null;
  for (const pattern of URL_PATTERNS) {
    const matches = message.match(pattern);
    if (matches && matches.length > 0) {
      url = matches[0];
      // Asegurar que tenga protocolo
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      break;
    }
  }
  
  // Buscar patrones de clonación
  let matchedPatterns = 0;
  for (const pattern of CLONE_PATTERNS) {
    if (pattern.test(normalizedMessage)) {
      matchedPatterns++;
    }
  }
  
  // Si hay URL, buscar palabras clave simples
  let hasSimpleKeyword = false;
  if (url) {
    for (const keyword of SIMPLE_CLONE_KEYWORDS) {
      if (normalizedMessage.includes(keyword.toLowerCase())) {
        hasSimpleKeyword = true;
        break;
      }
    }
  }
  
  // Calcular confianza
  let confidence = 0;
  let isCloneRequest = false;
  
  if (matchedPatterns >= 2) {
    confidence = 0.95;
    isCloneRequest = true;
  } else if (matchedPatterns === 1) {
    confidence = url ? 0.9 : 0.7;
    isCloneRequest = true;
  } else if (url && hasSimpleKeyword) {
    // URL + palabra clave simple = probable clonación
    confidence = 0.85;
    isCloneRequest = true;
  }
  
  return {
    isCloneRequest,
    url,
    confidence,
  };
}

/**
 * Extrae la URL de un mensaje aunque no haya intención clara de clonar
 */
export function extractUrl(message: string): string | null {
  for (const pattern of URL_PATTERNS) {
    const matches = message.match(pattern);
    if (matches && matches.length > 0) {
      let url = matches[0];
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      return url;
    }
  }
  return null;
}

/**
 * Genera instrucciones adicionales para el LLM cuando se detecta intención de clonar
 */
export function generateCloneInstructions(url: string): string {
  return `
## INSTRUCCIONES DE CLONACIÓN DE WEB

El usuario quiere una landing page basada en: ${url}

IMPORTANTE: Debes analizar la web de referencia y crear una landing que:
1. Mantenga la misma estructura de secciones (hero, features, testimonials, etc.)
2. Use colores similares o idénticos
3. Replique el estilo tipográfico
4. Copie el layout y espaciado
5. Adapte el contenido al nuevo negocio del usuario (si lo especifica)

Si el usuario no especifica un negocio, usa contenido placeholder relevante.
`;
}
