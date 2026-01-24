/**
 * Language Detector
 * Detecta el idioma del usuario para generar contenido en el idioma correcto
 */

// Palabras comunes en español que indican que el usuario escribe en español
const SPANISH_INDICATORS = [
  // Artículos
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  // Preposiciones
  'de', 'del', 'en', 'con', 'para', 'por', 'sobre', 'entre', 'hacia', 'desde',
  // Verbos comunes
  'crea', 'crear', 'genera', 'generar', 'hazme', 'haz', 'quiero', 'necesito',
  'diseña', 'diseñar', 'construye', 'construir', 'desarrolla', 'desarrollar',
  // Sustantivos comunes en solicitudes
  'página', 'pagina', 'landing', 'sitio', 'web', 'empresa', 'negocio',
  'restaurante', 'clínica', 'clinica', 'tienda', 'agencia', 'estudio',
  // Adjetivos
  'profesional', 'moderna', 'moderno', 'elegante', 'minimalista',
  // Conectores
  'que', 'como', 'porque', 'aunque', 'pero', 'también', 'tambien',
  // Palabras específicas de landing pages
  'sección', 'seccion', 'secciones', 'testimonios', 'precios', 'servicios',
  'contacto', 'formulario', 'llamada', 'acción', 'accion',
  // Colores en español
  'azul', 'rojo', 'verde', 'amarillo', 'naranja', 'morado', 'rosa', 'negro', 'blanco',
];

// Palabras comunes en inglés que indican que el usuario escribe en inglés
const ENGLISH_INDICATORS = [
  // Articles
  'the', 'a', 'an',
  // Prepositions
  'of', 'in', 'with', 'for', 'on', 'about', 'between', 'from', 'to',
  // Common verbs
  'create', 'generate', 'make', 'build', 'design', 'develop', 'want', 'need',
  // Common nouns in requests
  'page', 'website', 'site', 'business', 'company', 'restaurant', 'clinic',
  'store', 'agency', 'studio',
  // Adjectives
  'professional', 'modern', 'elegant', 'minimalist', 'clean',
  // Connectors
  'that', 'which', 'because', 'although', 'but', 'also', 'however',
  // Landing page specific
  'section', 'sections', 'testimonials', 'pricing', 'services', 'contact',
  'form', 'call', 'action', 'hero', 'features',
  // Colors in English
  'blue', 'red', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white',
];

export type Language = 'es' | 'en';

export interface LanguageDetectionResult {
  language: Language;
  confidence: number;
  spanishScore: number;
  englishScore: number;
}

/**
 * Detecta el idioma del mensaje del usuario
 */
export function detectLanguage(message: string): LanguageDetectionResult {
  const messageLower = message.toLowerCase();
  const words = messageLower.split(/\s+/);
  
  let spanishScore = 0;
  let englishScore = 0;
  
  // Contar palabras en español
  for (const word of words) {
    if (SPANISH_INDICATORS.includes(word)) {
      spanishScore++;
    }
  }
  
  // Contar palabras en inglés
  for (const word of words) {
    if (ENGLISH_INDICATORS.includes(word)) {
      englishScore++;
    }
  }
  
  // Detectar caracteres especiales del español
  if (/[áéíóúüñ¿¡]/i.test(message)) {
    spanishScore += 3;
  }
  
  // Calcular confianza
  const totalScore = spanishScore + englishScore;
  const confidence = totalScore > 0 
    ? Math.abs(spanishScore - englishScore) / totalScore 
    : 0;
  
  // Determinar idioma
  const language: Language = spanishScore >= englishScore ? 'es' : 'en';
  
  return {
    language,
    confidence,
    spanishScore,
    englishScore,
  };
}

/**
 * Genera instrucciones de idioma para el LLM
 */
export function generateLanguageInstructions(detection: LanguageDetectionResult): string {
  if (detection.language === 'es') {
    return `
## ⚠️ INSTRUCCIONES CRÍTICAS DE IDIOMA - ESPAÑOL ⚠️

**EL USUARIO ESCRIBE EN ESPAÑOL. DEBES GENERAR TODO EL CONTENIDO EN ESPAÑOL.**

Esto es OBLIGATORIO y tiene MÁXIMA PRIORIDAD:

✅ Títulos en español: "Sushi Japonés Auténtico" (NO "Authentic Japanese Sushi")
✅ Botones en español: "Reserva tu Mesa" (NO "Reserve Your Table")
✅ CTAs en español: "Comenzar", "Contáctanos", "Ver más", "Saber más"
✅ Formularios en español: "Nombre", "Correo electrónico", "Teléfono", "Mensaje"
✅ Testimonios en español: "La mejor experiencia..." (NO "The best experience...")
✅ FAQs en español: "¿Ofrecen opciones vegetarianas?" (NO "Do you offer...")
✅ Precios en español: "Mensual", "Anual", "Más popular", "/mes"
✅ Footer en español: "Todos los derechos reservados" (NO "All rights reserved")

❌ PROHIBIDO usar inglés en cualquier parte del contenido.
❌ PROHIBIDO mezclar idiomas.

TODA la landing page DEBE estar 100% en ESPAÑOL.
`;
  } else {
    return `
IMPORTANT LANGUAGE INSTRUCTIONS:
The user is writing in ENGLISH. You MUST generate ALL content in English:
- All section titles and headings in English
- All body text and descriptions in English
- All button labels and CTAs in English (e.g., "Get Started", "Contact Us", "Learn More")
- All form labels in English (e.g., "Name", "Email", "Phone")
- All placeholder text in English
- All testimonial quotes in English
- All FAQ questions and answers in English
- All pricing labels in English (e.g., "Monthly", "Yearly", "Most Popular")

DO NOT mix languages. The entire landing page must be in English.
`;
  }
}

/**
 * Obtiene traducciones comunes para elementos de UI
 */
export function getUITranslations(language: Language): Record<string, string> {
  if (language === 'es') {
    return {
      // CTAs
      getStarted: 'Comenzar',
      learnMore: 'Saber más',
      contactUs: 'Contáctanos',
      viewMore: 'Ver más',
      subscribe: 'Suscribirse',
      signUp: 'Registrarse',
      login: 'Iniciar sesión',
      submit: 'Enviar',
      send: 'Enviar',
      book: 'Reservar',
      bookNow: 'Reservar ahora',
      buyNow: 'Comprar ahora',
      tryFree: 'Prueba gratis',
      startTrial: 'Iniciar prueba',
      
      // Form labels
      name: 'Nombre',
      fullName: 'Nombre completo',
      email: 'Correo electrónico',
      phone: 'Teléfono',
      message: 'Mensaje',
      subject: 'Asunto',
      company: 'Empresa',
      
      // Pricing
      monthly: 'Mensual',
      yearly: 'Anual',
      perMonth: '/mes',
      perYear: '/año',
      mostPopular: 'Más popular',
      recommended: 'Recomendado',
      
      // Sections
      features: 'Características',
      services: 'Servicios',
      testimonials: 'Testimonios',
      pricing: 'Precios',
      faq: 'Preguntas frecuentes',
      contact: 'Contacto',
      about: 'Sobre nosotros',
      team: 'Equipo',
      gallery: 'Galería',
      
      // Common
      readMore: 'Leer más',
      seeAll: 'Ver todo',
      close: 'Cerrar',
      next: 'Siguiente',
      previous: 'Anterior',
    };
  } else {
    return {
      // CTAs
      getStarted: 'Get Started',
      learnMore: 'Learn More',
      contactUs: 'Contact Us',
      viewMore: 'View More',
      subscribe: 'Subscribe',
      signUp: 'Sign Up',
      login: 'Login',
      submit: 'Submit',
      send: 'Send',
      book: 'Book',
      bookNow: 'Book Now',
      buyNow: 'Buy Now',
      tryFree: 'Try Free',
      startTrial: 'Start Trial',
      
      // Form labels
      name: 'Name',
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      message: 'Message',
      subject: 'Subject',
      company: 'Company',
      
      // Pricing
      monthly: 'Monthly',
      yearly: 'Yearly',
      perMonth: '/month',
      perYear: '/year',
      mostPopular: 'Most Popular',
      recommended: 'Recommended',
      
      // Sections
      features: 'Features',
      services: 'Services',
      testimonials: 'Testimonials',
      pricing: 'Pricing',
      faq: 'FAQ',
      contact: 'Contact',
      about: 'About Us',
      team: 'Team',
      gallery: 'Gallery',
      
      // Common
      readMore: 'Read More',
      seeAll: 'See All',
      close: 'Close',
      next: 'Next',
      previous: 'Previous',
    };
  }
}
