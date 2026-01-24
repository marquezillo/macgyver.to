/**
 * Traducciones de URLs y contenido para páginas legales
 * Soporta: español, inglés, francés, alemán, portugués, italiano
 */

export interface LegalPageTranslation {
  slug: string;
  title: string;
  navLabel: string;
}

export interface LanguageTranslations {
  terms: LegalPageTranslation;
  privacy: LegalPageTranslation;
  contact: LegalPageTranslation;
  about: LegalPageTranslation;
  // Labels adicionales
  labels: {
    navigation: string;
    legal: string;
    home: string;
    allRightsReserved: string;
  };
}

export const legalPageTranslations: Record<string, LanguageTranslations> = {
  // Español
  es: {
    terms: { slug: 'terminos', title: 'Términos y Condiciones', navLabel: 'Términos y Condiciones' },
    privacy: { slug: 'privacidad', title: 'Política de Privacidad', navLabel: 'Política de Privacidad' },
    contact: { slug: 'contacto', title: 'Contacto', navLabel: 'Contacto' },
    about: { slug: 'nosotros', title: 'Sobre Nosotros', navLabel: 'Sobre Nosotros' },
    labels: {
      navigation: 'Navegación',
      legal: 'Legal',
      home: 'Inicio',
      allRightsReserved: 'Todos los derechos reservados.',
    },
  },
  
  // Inglés
  en: {
    terms: { slug: 'terms', title: 'Terms and Conditions', navLabel: 'Terms & Conditions' },
    privacy: { slug: 'privacy', title: 'Privacy Policy', navLabel: 'Privacy Policy' },
    contact: { slug: 'contact', title: 'Contact Us', navLabel: 'Contact' },
    about: { slug: 'about', title: 'About Us', navLabel: 'About Us' },
    labels: {
      navigation: 'Navigation',
      legal: 'Legal',
      home: 'Home',
      allRightsReserved: 'All rights reserved.',
    },
  },
  
  // Francés
  fr: {
    terms: { slug: 'conditions', title: 'Conditions Générales', navLabel: 'Conditions Générales' },
    privacy: { slug: 'confidentialite', title: 'Politique de Confidentialité', navLabel: 'Confidentialité' },
    contact: { slug: 'contact', title: 'Contactez-nous', navLabel: 'Contact' },
    about: { slug: 'a-propos', title: 'À Propos de Nous', navLabel: 'À Propos' },
    labels: {
      navigation: 'Navigation',
      legal: 'Mentions Légales',
      home: 'Accueil',
      allRightsReserved: 'Tous droits réservés.',
    },
  },
  
  // Alemán
  de: {
    terms: { slug: 'agb', title: 'Allgemeine Geschäftsbedingungen', navLabel: 'AGB' },
    privacy: { slug: 'datenschutz', title: 'Datenschutzerklärung', navLabel: 'Datenschutz' },
    contact: { slug: 'kontakt', title: 'Kontakt', navLabel: 'Kontakt' },
    about: { slug: 'ueber-uns', title: 'Über Uns', navLabel: 'Über Uns' },
    labels: {
      navigation: 'Navigation',
      legal: 'Rechtliches',
      home: 'Startseite',
      allRightsReserved: 'Alle Rechte vorbehalten.',
    },
  },
  
  // Portugués
  pt: {
    terms: { slug: 'termos', title: 'Termos e Condições', navLabel: 'Termos e Condições' },
    privacy: { slug: 'privacidade', title: 'Política de Privacidade', navLabel: 'Privacidade' },
    contact: { slug: 'contato', title: 'Contato', navLabel: 'Contato' },
    about: { slug: 'sobre', title: 'Sobre Nós', navLabel: 'Sobre Nós' },
    labels: {
      navigation: 'Navegação',
      legal: 'Legal',
      home: 'Início',
      allRightsReserved: 'Todos os direitos reservados.',
    },
  },
  
  // Italiano
  it: {
    terms: { slug: 'termini', title: 'Termini e Condizioni', navLabel: 'Termini e Condizioni' },
    privacy: { slug: 'privacy', title: 'Informativa sulla Privacy', navLabel: 'Privacy' },
    contact: { slug: 'contatti', title: 'Contattaci', navLabel: 'Contatti' },
    about: { slug: 'chi-siamo', title: 'Chi Siamo', navLabel: 'Chi Siamo' },
    labels: {
      navigation: 'Navigazione',
      legal: 'Legale',
      home: 'Home',
      allRightsReserved: 'Tutti i diritti riservati.',
    },
  },
};

/**
 * Obtiene las traducciones para un idioma específico
 * Si el idioma no existe, devuelve español por defecto
 */
export function getTranslations(language: string): LanguageTranslations {
  // Normalizar el código de idioma (ej: "es-ES" -> "es")
  const langCode = language.toLowerCase().split('-')[0];
  return legalPageTranslations[langCode] || legalPageTranslations['es'];
}

/**
 * Obtiene el slug de una página legal según el idioma
 */
export function getLegalPageSlug(pageType: 'terms' | 'privacy' | 'contact' | 'about', language: string): string {
  const translations = getTranslations(language);
  return translations[pageType].slug;
}

/**
 * Mapea un slug de cualquier idioma al tipo de página
 * Útil para reconocer URLs en múltiples idiomas
 */
export function getPageTypeFromSlug(slug: string): 'terms' | 'privacy' | 'contact' | 'about' | null {
  const normalizedSlug = slug.toLowerCase();
  
  for (const lang of Object.values(legalPageTranslations)) {
    if (lang.terms.slug === normalizedSlug) return 'terms';
    if (lang.privacy.slug === normalizedSlug) return 'privacy';
    if (lang.contact.slug === normalizedSlug) return 'contact';
    if (lang.about.slug === normalizedSlug) return 'about';
  }
  
  return null;
}

/**
 * Detecta el idioma de la landing basándose en el contenido o configuración
 */
export function detectLandingLanguage(landing: any): string {
  // Prioridad 1: Idioma explícito en SEO metadata
  if (landing.seoMetadata?.language) {
    return landing.seoMetadata.language;
  }
  
  // Prioridad 2: Idioma en el tema
  if (landing.theme?.language) {
    return landing.theme.language;
  }
  
  // Prioridad 3: Idioma en la configuración
  if (landing.config?.language) {
    return landing.config.language;
  }
  
  // Default: español
  return 'es';
}
