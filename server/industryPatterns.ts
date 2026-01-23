/**
 * Industry Patterns - Patrones de diseño por industria
 * Sistema escalable para generar landings específicas por nicho
 */

// Importar patrones extendidos
import { extendedIndustryPatterns, TOTAL_EXTENDED_PATTERNS } from './industryPatternsExtended';
import { nicheIndustryPatterns, TOTAL_NICHE_PATTERNS } from './industryPatternsNiche';

export interface IndustryPattern {
  id: string;
  name: string;
  nameEs: string;
  category: string;
  sections: string[];
  heroVariant: 'centered' | 'split' | 'minimal' | 'asymmetric';
  featuresVariant: 'grid' | 'animated' | 'alternating' | 'bento' | 'cards3d' | 'minimal';
  testimonialsVariant: 'grid' | 'carousel' | 'featured' | 'video' | 'masonry';
  pricingVariant?: 'cards' | 'horizontal' | 'comparison' | 'minimal' | 'gradient';
  colorPalette: string;
  suggestedImages: string[];
  ctaText: string;
  ctaTextEs: string;
  keywords: string[];
}

export const industryPatterns: Record<string, IndustryPattern> = {
  // ==================== TECNOLOGÍA ====================
  'saas': {
    id: 'saas',
    name: 'SaaS / Software',
    nameEs: 'SaaS / Software',
    category: 'technology',
    sections: ['header', 'hero', 'logocloud', 'features', 'stats', 'pricing', 'testimonials', 'faq', 'cta', 'footer'],
    heroVariant: 'asymmetric',
    featuresVariant: 'bento',
    testimonialsVariant: 'carousel',
    pricingVariant: 'cards',
    colorPalette: 'gradient',
    suggestedImages: ['dashboard', 'software interface', 'team collaboration', 'productivity'],
    ctaText: 'Start Free Trial',
    ctaTextEs: 'Prueba Gratis',
    keywords: ['software', 'saas', 'app', 'platform', 'tool', 'herramienta', 'plataforma']
  },
  'ai-startup': {
    id: 'ai-startup',
    name: 'AI / Machine Learning',
    nameEs: 'Inteligencia Artificial',
    category: 'technology',
    sections: ['header', 'hero', 'logocloud', 'features', 'process', 'stats', 'testimonials', 'pricing', 'faq', 'cta', 'footer'],
    heroVariant: 'asymmetric',
    featuresVariant: 'animated',
    testimonialsVariant: 'featured',
    pricingVariant: 'gradient',
    colorPalette: 'neon',
    suggestedImages: ['neural network', 'AI brain', 'futuristic technology', 'data visualization'],
    ctaText: 'Try AI Now',
    ctaTextEs: 'Probar IA Ahora',
    keywords: ['ai', 'artificial intelligence', 'machine learning', 'inteligencia artificial', 'ml', 'deep learning']
  },
  'mobile-app': {
    id: 'mobile-app',
    name: 'Mobile App',
    nameEs: 'Aplicación Móvil',
    category: 'technology',
    sections: ['header', 'hero', 'features', 'gallery', 'testimonials', 'stats', 'faq', 'cta', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'alternating',
    testimonialsVariant: 'carousel',
    colorPalette: 'gradient',
    suggestedImages: ['smartphone mockup', 'app interface', 'mobile user', 'app store'],
    ctaText: 'Download App',
    ctaTextEs: 'Descargar App',
    keywords: ['app', 'mobile', 'ios', 'android', 'aplicación', 'móvil']
  },
  'fintech': {
    id: 'fintech',
    name: 'Fintech / Banking',
    nameEs: 'Fintech / Banca',
    category: 'technology',
    sections: ['header', 'hero', 'logocloud', 'features', 'stats', 'process', 'testimonials', 'pricing', 'faq', 'cta', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'grid',
    testimonialsVariant: 'featured',
    pricingVariant: 'comparison',
    colorPalette: 'dark',
    suggestedImages: ['finance dashboard', 'credit card', 'banking app', 'investment'],
    ctaText: 'Open Account',
    ctaTextEs: 'Abrir Cuenta',
    keywords: ['fintech', 'bank', 'finance', 'payment', 'banca', 'finanzas', 'pagos']
  },
  'cybersecurity': {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    nameEs: 'Ciberseguridad',
    category: 'technology',
    sections: ['header', 'hero', 'logocloud', 'features', 'stats', 'process', 'testimonials', 'pricing', 'faq', 'cta', 'footer'],
    heroVariant: 'asymmetric',
    featuresVariant: 'grid',
    testimonialsVariant: 'featured',
    pricingVariant: 'comparison',
    colorPalette: 'dark',
    suggestedImages: ['security shield', 'lock', 'cyber protection', 'data encryption'],
    ctaText: 'Secure Now',
    ctaTextEs: 'Proteger Ahora',
    keywords: ['security', 'cybersecurity', 'protection', 'seguridad', 'ciberseguridad', 'protección']
  },
  'devtools': {
    id: 'devtools',
    name: 'Developer Tools',
    nameEs: 'Herramientas para Desarrolladores',
    category: 'technology',
    sections: ['header', 'hero', 'features', 'stats', 'process', 'pricing', 'testimonials', 'faq', 'cta', 'footer'],
    heroVariant: 'minimal',
    featuresVariant: 'bento',
    testimonialsVariant: 'grid',
    pricingVariant: 'cards',
    colorPalette: 'dark',
    suggestedImages: ['code editor', 'terminal', 'developer workspace', 'api'],
    ctaText: 'Get Started',
    ctaTextEs: 'Comenzar',
    keywords: ['developer', 'api', 'sdk', 'code', 'programming', 'desarrollador', 'código']
  },

  // ==================== SERVICIOS PROFESIONALES ====================
  'agency': {
    id: 'agency',
    name: 'Creative Agency',
    nameEs: 'Agencia Creativa',
    category: 'services',
    sections: ['header', 'hero', 'logocloud', 'about', 'features', 'gallery', 'process', 'testimonials', 'cta', 'footer'],
    heroVariant: 'asymmetric',
    featuresVariant: 'cards3d',
    testimonialsVariant: 'masonry',
    colorPalette: 'gradient',
    suggestedImages: ['creative team', 'design work', 'brainstorming', 'portfolio'],
    ctaText: 'Start Project',
    ctaTextEs: 'Iniciar Proyecto',
    keywords: ['agency', 'creative', 'design', 'agencia', 'creativa', 'diseño', 'marketing']
  },
  'consulting': {
    id: 'consulting',
    name: 'Consulting',
    nameEs: 'Consultoría',
    category: 'services',
    sections: ['header', 'hero', 'logocloud', 'about', 'features', 'process', 'stats', 'testimonials', 'cta', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'grid',
    testimonialsVariant: 'featured',
    colorPalette: 'light',
    suggestedImages: ['business meeting', 'consultant', 'strategy', 'professional'],
    ctaText: 'Book Consultation',
    ctaTextEs: 'Reservar Consulta',
    keywords: ['consulting', 'consultant', 'business', 'consultoría', 'consultor', 'negocio', 'estrategia']
  },
  'law-firm': {
    id: 'law-firm',
    name: 'Law Firm',
    nameEs: 'Bufete de Abogados',
    category: 'services',
    sections: ['header', 'hero', 'about', 'features', 'process', 'testimonials', 'faq', 'form', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'grid',
    testimonialsVariant: 'featured',
    colorPalette: 'dark',
    suggestedImages: ['lawyer', 'courtroom', 'legal documents', 'justice'],
    ctaText: 'Free Consultation',
    ctaTextEs: 'Consulta Gratis',
    keywords: ['lawyer', 'attorney', 'law', 'legal', 'abogado', 'bufete', 'legal']
  },
  'accounting': {
    id: 'accounting',
    name: 'Accounting / Tax',
    nameEs: 'Contabilidad / Impuestos',
    category: 'services',
    sections: ['header', 'hero', 'features', 'process', 'stats', 'testimonials', 'pricing', 'faq', 'form', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'grid',
    testimonialsVariant: 'grid',
    pricingVariant: 'comparison',
    colorPalette: 'light',
    suggestedImages: ['calculator', 'financial documents', 'accountant', 'tax forms'],
    ctaText: 'Get Quote',
    ctaTextEs: 'Solicitar Presupuesto',
    keywords: ['accounting', 'tax', 'bookkeeping', 'contabilidad', 'impuestos', 'contador']
  },
  'marketing-agency': {
    id: 'marketing-agency',
    name: 'Marketing Agency',
    nameEs: 'Agencia de Marketing',
    category: 'services',
    sections: ['header', 'hero', 'logocloud', 'features', 'stats', 'process', 'gallery', 'testimonials', 'pricing', 'cta', 'footer'],
    heroVariant: 'asymmetric',
    featuresVariant: 'bento',
    testimonialsVariant: 'carousel',
    pricingVariant: 'cards',
    colorPalette: 'gradient',
    suggestedImages: ['marketing team', 'social media', 'analytics', 'campaign'],
    ctaText: 'Grow Your Business',
    ctaTextEs: 'Haz Crecer tu Negocio',
    keywords: ['marketing', 'digital', 'seo', 'social media', 'publicidad', 'redes sociales']
  },
  'hr-recruitment': {
    id: 'hr-recruitment',
    name: 'HR / Recruitment',
    nameEs: 'RRHH / Reclutamiento',
    category: 'services',
    sections: ['header', 'hero', 'features', 'stats', 'process', 'testimonials', 'pricing', 'faq', 'cta', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'grid',
    testimonialsVariant: 'grid',
    pricingVariant: 'cards',
    colorPalette: 'light',
    suggestedImages: ['job interview', 'team', 'hiring', 'workplace'],
    ctaText: 'Find Talent',
    ctaTextEs: 'Encontrar Talento',
    keywords: ['hr', 'recruitment', 'hiring', 'rrhh', 'reclutamiento', 'talento', 'empleo']
  },

  // ==================== GASTRONOMÍA ====================
  'restaurant': {
    id: 'restaurant',
    name: 'Restaurant',
    nameEs: 'Restaurante',
    category: 'food',
    sections: ['header', 'hero', 'about', 'gallery', 'features', 'testimonials', 'form', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'grid',
    testimonialsVariant: 'carousel',
    colorPalette: 'warm',
    suggestedImages: ['restaurant interior', 'gourmet food', 'chef cooking', 'dining table'],
    ctaText: 'Reserve Table',
    ctaTextEs: 'Reservar Mesa',
    keywords: ['restaurant', 'food', 'dining', 'restaurante', 'comida', 'gastronomía']
  },
  'cafe': {
    id: 'cafe',
    name: 'Café / Coffee Shop',
    nameEs: 'Cafetería',
    category: 'food',
    sections: ['header', 'hero', 'about', 'gallery', 'features', 'testimonials', 'form', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'minimal',
    testimonialsVariant: 'masonry',
    colorPalette: 'warm',
    suggestedImages: ['coffee cup', 'cafe interior', 'barista', 'pastries'],
    ctaText: 'Visit Us',
    ctaTextEs: 'Visítanos',
    keywords: ['cafe', 'coffee', 'cafetería', 'café', 'bakery', 'panadería']
  },
  'food-delivery': {
    id: 'food-delivery',
    name: 'Food Delivery',
    nameEs: 'Delivery de Comida',
    category: 'food',
    sections: ['header', 'hero', 'features', 'process', 'stats', 'testimonials', 'faq', 'cta', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'animated',
    testimonialsVariant: 'carousel',
    colorPalette: 'gradient',
    suggestedImages: ['food delivery', 'mobile app', 'delivery person', 'food packages'],
    ctaText: 'Order Now',
    ctaTextEs: 'Pedir Ahora',
    keywords: ['delivery', 'food', 'order', 'pedido', 'comida', 'entrega']
  },
  'catering': {
    id: 'catering',
    name: 'Catering',
    nameEs: 'Catering / Eventos',
    category: 'food',
    sections: ['header', 'hero', 'about', 'gallery', 'features', 'testimonials', 'pricing', 'form', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'grid',
    testimonialsVariant: 'featured',
    pricingVariant: 'cards',
    colorPalette: 'warm',
    suggestedImages: ['catering event', 'buffet', 'wedding food', 'corporate event'],
    ctaText: 'Get Quote',
    ctaTextEs: 'Solicitar Presupuesto',
    keywords: ['catering', 'events', 'wedding', 'eventos', 'bodas', 'banquetes']
  },
  'brewery': {
    id: 'brewery',
    name: 'Brewery / Winery',
    nameEs: 'Cervecería / Bodega',
    category: 'food',
    sections: ['header', 'hero', 'about', 'gallery', 'features', 'process', 'testimonials', 'form', 'footer'],
    heroVariant: 'centered',
    featuresVariant: 'alternating',
    testimonialsVariant: 'masonry',
    colorPalette: 'warm',
    suggestedImages: ['beer brewery', 'wine cellar', 'craft beer', 'vineyard'],
    ctaText: 'Book Tour',
    ctaTextEs: 'Reservar Tour',
    keywords: ['brewery', 'winery', 'beer', 'wine', 'cervecería', 'bodega', 'vino', 'cerveza']
  },

  // ==================== SALUD Y BIENESTAR ====================
  'healthcare': {
    id: 'healthcare',
    name: 'Healthcare / Medical',
    nameEs: 'Salud / Médico',
    category: 'health',
    sections: ['header', 'hero', 'features', 'about', 'process', 'testimonials', 'faq', 'form', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'grid',
    testimonialsVariant: 'featured',
    colorPalette: 'light',
    suggestedImages: ['doctor', 'medical clinic', 'healthcare', 'hospital'],
    ctaText: 'Book Appointment',
    ctaTextEs: 'Agendar Cita',
    keywords: ['healthcare', 'medical', 'doctor', 'clinic', 'salud', 'médico', 'clínica']
  },
  'dental': {
    id: 'dental',
    name: 'Dental Clinic',
    nameEs: 'Clínica Dental',
    category: 'health',
    sections: ['header', 'hero', 'features', 'about', 'gallery', 'testimonials', 'pricing', 'faq', 'form', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'grid',
    testimonialsVariant: 'carousel',
    pricingVariant: 'comparison',
    colorPalette: 'light',
    suggestedImages: ['dentist', 'dental clinic', 'smile', 'dental equipment'],
    ctaText: 'Book Appointment',
    ctaTextEs: 'Agendar Cita',
    keywords: ['dental', 'dentist', 'teeth', 'dental', 'dentista', 'dientes', 'odontología']
  },
  'fitness': {
    id: 'fitness',
    name: 'Gym / Fitness',
    nameEs: 'Gimnasio / Fitness',
    category: 'health',
    sections: ['header', 'hero', 'features', 'gallery', 'stats', 'testimonials', 'pricing', 'faq', 'cta', 'footer'],
    heroVariant: 'asymmetric',
    featuresVariant: 'animated',
    testimonialsVariant: 'carousel',
    pricingVariant: 'cards',
    colorPalette: 'dark',
    suggestedImages: ['gym', 'fitness training', 'workout', 'athlete'],
    ctaText: 'Join Now',
    ctaTextEs: 'Únete Ahora',
    keywords: ['gym', 'fitness', 'workout', 'gimnasio', 'entrenamiento', 'ejercicio']
  },
  'yoga': {
    id: 'yoga',
    name: 'Yoga / Meditation',
    nameEs: 'Yoga / Meditación',
    category: 'health',
    sections: ['header', 'hero', 'about', 'features', 'gallery', 'testimonials', 'pricing', 'faq', 'form', 'footer'],
    heroVariant: 'centered',
    featuresVariant: 'minimal',
    testimonialsVariant: 'masonry',
    pricingVariant: 'minimal',
    colorPalette: 'minimal',
    suggestedImages: ['yoga pose', 'meditation', 'zen', 'peaceful'],
    ctaText: 'Start Journey',
    ctaTextEs: 'Comenzar',
    keywords: ['yoga', 'meditation', 'wellness', 'meditación', 'bienestar', 'mindfulness']
  },
  'spa': {
    id: 'spa',
    name: 'Spa / Wellness',
    nameEs: 'Spa / Bienestar',
    category: 'health',
    sections: ['header', 'hero', 'about', 'features', 'gallery', 'testimonials', 'pricing', 'form', 'footer'],
    heroVariant: 'centered',
    featuresVariant: 'grid',
    testimonialsVariant: 'featured',
    pricingVariant: 'cards',
    colorPalette: 'minimal',
    suggestedImages: ['spa treatment', 'massage', 'relaxation', 'wellness'],
    ctaText: 'Book Treatment',
    ctaTextEs: 'Reservar Tratamiento',
    keywords: ['spa', 'wellness', 'massage', 'bienestar', 'masaje', 'relajación']
  },
  'pharmacy': {
    id: 'pharmacy',
    name: 'Pharmacy',
    nameEs: 'Farmacia',
    category: 'health',
    sections: ['header', 'hero', 'features', 'about', 'process', 'testimonials', 'faq', 'form', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'grid',
    testimonialsVariant: 'grid',
    colorPalette: 'light',
    suggestedImages: ['pharmacy', 'medicine', 'pharmacist', 'health products'],
    ctaText: 'Shop Now',
    ctaTextEs: 'Comprar Ahora',
    keywords: ['pharmacy', 'medicine', 'health', 'farmacia', 'medicamentos', 'salud']
  },

  // ==================== EDUCACIÓN ====================
  'online-course': {
    id: 'online-course',
    name: 'Online Course',
    nameEs: 'Curso Online',
    category: 'education',
    sections: ['header', 'hero', 'features', 'about', 'process', 'stats', 'testimonials', 'pricing', 'faq', 'cta', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'bento',
    testimonialsVariant: 'video',
    pricingVariant: 'cards',
    colorPalette: 'gradient',
    suggestedImages: ['online learning', 'laptop student', 'video course', 'education'],
    ctaText: 'Enroll Now',
    ctaTextEs: 'Inscribirse Ahora',
    keywords: ['course', 'online', 'learning', 'curso', 'aprendizaje', 'educación']
  },
  'school': {
    id: 'school',
    name: 'School / Academy',
    nameEs: 'Escuela / Academia',
    category: 'education',
    sections: ['header', 'hero', 'about', 'features', 'gallery', 'stats', 'testimonials', 'faq', 'form', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'grid',
    testimonialsVariant: 'carousel',
    colorPalette: 'light',
    suggestedImages: ['classroom', 'students', 'school building', 'education'],
    ctaText: 'Apply Now',
    ctaTextEs: 'Aplicar Ahora',
    keywords: ['school', 'academy', 'education', 'escuela', 'academia', 'educación']
  },
  'tutoring': {
    id: 'tutoring',
    name: 'Tutoring',
    nameEs: 'Tutorías',
    category: 'education',
    sections: ['header', 'hero', 'features', 'about', 'process', 'testimonials', 'pricing', 'faq', 'form', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'grid',
    testimonialsVariant: 'featured',
    pricingVariant: 'comparison',
    colorPalette: 'light',
    suggestedImages: ['tutor', 'student learning', 'one on one', 'education'],
    ctaText: 'Book Session',
    ctaTextEs: 'Reservar Sesión',
    keywords: ['tutoring', 'tutor', 'learning', 'tutorías', 'clases particulares', 'profesor']
  },
  'language-school': {
    id: 'language-school',
    name: 'Language School',
    nameEs: 'Escuela de Idiomas',
    category: 'education',
    sections: ['header', 'hero', 'features', 'about', 'process', 'stats', 'testimonials', 'pricing', 'faq', 'cta', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'animated',
    testimonialsVariant: 'carousel',
    pricingVariant: 'cards',
    colorPalette: 'gradient',
    suggestedImages: ['language learning', 'conversation', 'international', 'classroom'],
    ctaText: 'Start Learning',
    ctaTextEs: 'Empezar a Aprender',
    keywords: ['language', 'english', 'spanish', 'idiomas', 'inglés', 'español', 'clases']
  },

  // ==================== INMOBILIARIO ====================
  'real-estate': {
    id: 'real-estate',
    name: 'Real Estate',
    nameEs: 'Inmobiliaria',
    category: 'real-estate',
    sections: ['header', 'hero', 'features', 'gallery', 'stats', 'testimonials', 'form', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'grid',
    testimonialsVariant: 'featured',
    colorPalette: 'light',
    suggestedImages: ['luxury home', 'real estate', 'property', 'house interior'],
    ctaText: 'View Properties',
    ctaTextEs: 'Ver Propiedades',
    keywords: ['real estate', 'property', 'home', 'inmobiliaria', 'propiedad', 'casa', 'apartamento']
  },
  'property-management': {
    id: 'property-management',
    name: 'Property Management',
    nameEs: 'Administración de Propiedades',
    category: 'real-estate',
    sections: ['header', 'hero', 'features', 'about', 'process', 'stats', 'testimonials', 'pricing', 'faq', 'form', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'grid',
    testimonialsVariant: 'grid',
    pricingVariant: 'comparison',
    colorPalette: 'light',
    suggestedImages: ['property management', 'building', 'apartment complex', 'keys'],
    ctaText: 'Get Started',
    ctaTextEs: 'Comenzar',
    keywords: ['property management', 'rental', 'landlord', 'administración', 'alquiler', 'propietario']
  },
  'architecture': {
    id: 'architecture',
    name: 'Architecture',
    nameEs: 'Arquitectura',
    category: 'real-estate',
    sections: ['header', 'hero', 'about', 'gallery', 'features', 'process', 'testimonials', 'form', 'footer'],
    heroVariant: 'asymmetric',
    featuresVariant: 'alternating',
    testimonialsVariant: 'masonry',
    colorPalette: 'minimal',
    suggestedImages: ['architecture', 'building design', 'modern house', 'blueprint'],
    ctaText: 'Start Project',
    ctaTextEs: 'Iniciar Proyecto',
    keywords: ['architecture', 'architect', 'design', 'arquitectura', 'arquitecto', 'diseño']
  },
  'interior-design': {
    id: 'interior-design',
    name: 'Interior Design',
    nameEs: 'Diseño de Interiores',
    category: 'real-estate',
    sections: ['header', 'hero', 'about', 'gallery', 'features', 'process', 'testimonials', 'form', 'footer'],
    heroVariant: 'asymmetric',
    featuresVariant: 'alternating',
    testimonialsVariant: 'masonry',
    colorPalette: 'minimal',
    suggestedImages: ['interior design', 'living room', 'modern interior', 'home decor'],
    ctaText: 'Book Consultation',
    ctaTextEs: 'Reservar Consulta',
    keywords: ['interior design', 'decor', 'home', 'diseño de interiores', 'decoración', 'hogar']
  },

  // ==================== VIAJES Y TURISMO ====================
  'travel-agency': {
    id: 'travel-agency',
    name: 'Travel Agency',
    nameEs: 'Agencia de Viajes',
    category: 'travel',
    sections: ['header', 'hero', 'features', 'gallery', 'stats', 'testimonials', 'faq', 'form', 'footer'],
    heroVariant: 'centered',
    featuresVariant: 'cards3d',
    testimonialsVariant: 'carousel',
    colorPalette: 'gradient',
    suggestedImages: ['travel destination', 'beach', 'adventure', 'vacation'],
    ctaText: 'Plan Trip',
    ctaTextEs: 'Planificar Viaje',
    keywords: ['travel', 'agency', 'vacation', 'viajes', 'agencia', 'vacaciones', 'turismo']
  },
  'hotel': {
    id: 'hotel',
    name: 'Hotel / Resort',
    nameEs: 'Hotel / Resort',
    category: 'travel',
    sections: ['header', 'hero', 'about', 'gallery', 'features', 'testimonials', 'pricing', 'faq', 'form', 'footer'],
    heroVariant: 'centered',
    featuresVariant: 'grid',
    testimonialsVariant: 'featured',
    pricingVariant: 'cards',
    colorPalette: 'warm',
    suggestedImages: ['luxury hotel', 'hotel room', 'resort pool', 'hotel lobby'],
    ctaText: 'Book Now',
    ctaTextEs: 'Reservar Ahora',
    keywords: ['hotel', 'resort', 'accommodation', 'alojamiento', 'hospedaje', 'habitación']
  },
  'tour-operator': {
    id: 'tour-operator',
    name: 'Tour Operator',
    nameEs: 'Operador Turístico',
    category: 'travel',
    sections: ['header', 'hero', 'features', 'gallery', 'process', 'stats', 'testimonials', 'pricing', 'faq', 'form', 'footer'],
    heroVariant: 'centered',
    featuresVariant: 'cards3d',
    testimonialsVariant: 'carousel',
    pricingVariant: 'cards',
    colorPalette: 'gradient',
    suggestedImages: ['tour group', 'adventure', 'sightseeing', 'travel guide'],
    ctaText: 'Book Tour',
    ctaTextEs: 'Reservar Tour',
    keywords: ['tour', 'operator', 'excursion', 'tours', 'excursiones', 'guía']
  },
  'vacation-rental': {
    id: 'vacation-rental',
    name: 'Vacation Rental',
    nameEs: 'Alquiler Vacacional',
    category: 'travel',
    sections: ['header', 'hero', 'about', 'gallery', 'features', 'testimonials', 'pricing', 'faq', 'form', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'grid',
    testimonialsVariant: 'carousel',
    pricingVariant: 'cards',
    colorPalette: 'warm',
    suggestedImages: ['vacation home', 'beach house', 'cabin', 'rental property'],
    ctaText: 'Check Availability',
    ctaTextEs: 'Ver Disponibilidad',
    keywords: ['vacation rental', 'airbnb', 'rental', 'alquiler vacacional', 'casa de vacaciones']
  },

  // ==================== E-COMMERCE ====================
  'ecommerce': {
    id: 'ecommerce',
    name: 'E-commerce Store',
    nameEs: 'Tienda Online',
    category: 'ecommerce',
    sections: ['header', 'hero', 'features', 'gallery', 'stats', 'testimonials', 'faq', 'cta', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'bento',
    testimonialsVariant: 'carousel',
    colorPalette: 'light',
    suggestedImages: ['products', 'shopping', 'ecommerce', 'online store'],
    ctaText: 'Shop Now',
    ctaTextEs: 'Comprar Ahora',
    keywords: ['ecommerce', 'store', 'shop', 'tienda', 'comprar', 'productos']
  },
  'fashion': {
    id: 'fashion',
    name: 'Fashion Brand',
    nameEs: 'Marca de Moda',
    category: 'ecommerce',
    sections: ['header', 'hero', 'about', 'gallery', 'features', 'testimonials', 'cta', 'footer'],
    heroVariant: 'asymmetric',
    featuresVariant: 'minimal',
    testimonialsVariant: 'masonry',
    colorPalette: 'minimal',
    suggestedImages: ['fashion model', 'clothing', 'fashion shoot', 'boutique'],
    ctaText: 'Shop Collection',
    ctaTextEs: 'Ver Colección',
    keywords: ['fashion', 'clothing', 'brand', 'moda', 'ropa', 'marca']
  },
  'jewelry': {
    id: 'jewelry',
    name: 'Jewelry',
    nameEs: 'Joyería',
    category: 'ecommerce',
    sections: ['header', 'hero', 'about', 'gallery', 'features', 'testimonials', 'cta', 'footer'],
    heroVariant: 'centered',
    featuresVariant: 'minimal',
    testimonialsVariant: 'featured',
    colorPalette: 'minimal',
    suggestedImages: ['jewelry', 'rings', 'necklace', 'luxury'],
    ctaText: 'Explore Collection',
    ctaTextEs: 'Explorar Colección',
    keywords: ['jewelry', 'rings', 'necklace', 'joyería', 'anillos', 'collar']
  },
  'beauty': {
    id: 'beauty',
    name: 'Beauty / Cosmetics',
    nameEs: 'Belleza / Cosméticos',
    category: 'ecommerce',
    sections: ['header', 'hero', 'features', 'gallery', 'testimonials', 'stats', 'faq', 'cta', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'animated',
    testimonialsVariant: 'carousel',
    colorPalette: 'gradient',
    suggestedImages: ['cosmetics', 'beauty products', 'makeup', 'skincare'],
    ctaText: 'Shop Beauty',
    ctaTextEs: 'Comprar Belleza',
    keywords: ['beauty', 'cosmetics', 'makeup', 'belleza', 'cosméticos', 'maquillaje']
  },

  // ==================== EVENTOS ====================
  'wedding': {
    id: 'wedding',
    name: 'Wedding Planner',
    nameEs: 'Organizador de Bodas',
    category: 'events',
    sections: ['header', 'hero', 'about', 'gallery', 'features', 'process', 'testimonials', 'pricing', 'form', 'footer'],
    heroVariant: 'centered',
    featuresVariant: 'alternating',
    testimonialsVariant: 'featured',
    pricingVariant: 'cards',
    colorPalette: 'minimal',
    suggestedImages: ['wedding', 'bride', 'wedding venue', 'flowers'],
    ctaText: 'Plan Your Day',
    ctaTextEs: 'Planifica Tu Día',
    keywords: ['wedding', 'planner', 'bride', 'boda', 'organizador', 'novia']
  },
  'event-venue': {
    id: 'event-venue',
    name: 'Event Venue',
    nameEs: 'Salón de Eventos',
    category: 'events',
    sections: ['header', 'hero', 'about', 'gallery', 'features', 'testimonials', 'pricing', 'faq', 'form', 'footer'],
    heroVariant: 'centered',
    featuresVariant: 'grid',
    testimonialsVariant: 'carousel',
    pricingVariant: 'comparison',
    colorPalette: 'warm',
    suggestedImages: ['event venue', 'ballroom', 'conference room', 'party'],
    ctaText: 'Book Venue',
    ctaTextEs: 'Reservar Salón',
    keywords: ['venue', 'event', 'party', 'salón', 'eventos', 'fiesta']
  },
  'photographer': {
    id: 'photographer',
    name: 'Photographer',
    nameEs: 'Fotógrafo',
    category: 'events',
    sections: ['header', 'hero', 'about', 'gallery', 'features', 'testimonials', 'pricing', 'form', 'footer'],
    heroVariant: 'asymmetric',
    featuresVariant: 'minimal',
    testimonialsVariant: 'masonry',
    pricingVariant: 'cards',
    colorPalette: 'dark',
    suggestedImages: ['photographer', 'camera', 'photo shoot', 'portrait'],
    ctaText: 'Book Session',
    ctaTextEs: 'Reservar Sesión',
    keywords: ['photographer', 'photography', 'photo', 'fotógrafo', 'fotografía', 'fotos']
  },
  'dj-entertainment': {
    id: 'dj-entertainment',
    name: 'DJ / Entertainment',
    nameEs: 'DJ / Entretenimiento',
    category: 'events',
    sections: ['header', 'hero', 'about', 'gallery', 'features', 'testimonials', 'pricing', 'form', 'footer'],
    heroVariant: 'asymmetric',
    featuresVariant: 'animated',
    testimonialsVariant: 'video',
    pricingVariant: 'cards',
    colorPalette: 'neon',
    suggestedImages: ['dj', 'party', 'concert', 'music'],
    ctaText: 'Book Now',
    ctaTextEs: 'Reservar Ahora',
    keywords: ['dj', 'entertainment', 'music', 'entretenimiento', 'música', 'fiesta']
  },

  // ==================== AUTOMOTRIZ ====================
  'car-dealership': {
    id: 'car-dealership',
    name: 'Car Dealership',
    nameEs: 'Concesionario de Autos',
    category: 'automotive',
    sections: ['header', 'hero', 'features', 'gallery', 'stats', 'testimonials', 'faq', 'form', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'grid',
    testimonialsVariant: 'carousel',
    colorPalette: 'dark',
    suggestedImages: ['car showroom', 'luxury car', 'car dealership', 'vehicles'],
    ctaText: 'View Inventory',
    ctaTextEs: 'Ver Inventario',
    keywords: ['car', 'dealership', 'auto', 'concesionario', 'autos', 'vehículos']
  },
  'auto-repair': {
    id: 'auto-repair',
    name: 'Auto Repair',
    nameEs: 'Taller Mecánico',
    category: 'automotive',
    sections: ['header', 'hero', 'features', 'about', 'process', 'testimonials', 'pricing', 'faq', 'form', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'grid',
    testimonialsVariant: 'grid',
    pricingVariant: 'comparison',
    colorPalette: 'dark',
    suggestedImages: ['auto repair', 'mechanic', 'car service', 'garage'],
    ctaText: 'Book Service',
    ctaTextEs: 'Agendar Servicio',
    keywords: ['auto repair', 'mechanic', 'car service', 'taller', 'mecánico', 'reparación']
  },
  'car-rental': {
    id: 'car-rental',
    name: 'Car Rental',
    nameEs: 'Alquiler de Autos',
    category: 'automotive',
    sections: ['header', 'hero', 'features', 'gallery', 'stats', 'testimonials', 'pricing', 'faq', 'form', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'animated',
    testimonialsVariant: 'carousel',
    pricingVariant: 'cards',
    colorPalette: 'gradient',
    suggestedImages: ['rental car', 'car keys', 'fleet', 'driving'],
    ctaText: 'Rent Now',
    ctaTextEs: 'Alquilar Ahora',
    keywords: ['car rental', 'rent', 'vehicle', 'alquiler', 'renta', 'vehículo']
  },

  // ==================== CONSTRUCCIÓN ====================
  'construction': {
    id: 'construction',
    name: 'Construction',
    nameEs: 'Construcción',
    category: 'construction',
    sections: ['header', 'hero', 'about', 'features', 'gallery', 'process', 'stats', 'testimonials', 'form', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'grid',
    testimonialsVariant: 'featured',
    colorPalette: 'dark',
    suggestedImages: ['construction site', 'building', 'workers', 'crane'],
    ctaText: 'Get Quote',
    ctaTextEs: 'Solicitar Presupuesto',
    keywords: ['construction', 'building', 'contractor', 'construcción', 'edificación', 'contratista']
  },
  'plumbing': {
    id: 'plumbing',
    name: 'Plumbing',
    nameEs: 'Plomería',
    category: 'construction',
    sections: ['header', 'hero', 'features', 'about', 'process', 'testimonials', 'pricing', 'faq', 'form', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'grid',
    testimonialsVariant: 'grid',
    pricingVariant: 'comparison',
    colorPalette: 'light',
    suggestedImages: ['plumber', 'pipes', 'bathroom', 'repair'],
    ctaText: 'Call Now',
    ctaTextEs: 'Llamar Ahora',
    keywords: ['plumbing', 'plumber', 'pipes', 'plomería', 'plomero', 'tuberías']
  },
  'electrician': {
    id: 'electrician',
    name: 'Electrician',
    nameEs: 'Electricista',
    category: 'construction',
    sections: ['header', 'hero', 'features', 'about', 'process', 'testimonials', 'pricing', 'faq', 'form', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'grid',
    testimonialsVariant: 'grid',
    pricingVariant: 'comparison',
    colorPalette: 'light',
    suggestedImages: ['electrician', 'wiring', 'electrical panel', 'repair'],
    ctaText: 'Get Quote',
    ctaTextEs: 'Solicitar Presupuesto',
    keywords: ['electrician', 'electrical', 'wiring', 'electricista', 'eléctrico', 'instalación']
  },
  'hvac': {
    id: 'hvac',
    name: 'HVAC',
    nameEs: 'Aire Acondicionado',
    category: 'construction',
    sections: ['header', 'hero', 'features', 'about', 'process', 'testimonials', 'pricing', 'faq', 'form', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'grid',
    testimonialsVariant: 'grid',
    pricingVariant: 'comparison',
    colorPalette: 'light',
    suggestedImages: ['hvac', 'air conditioning', 'technician', 'cooling'],
    ctaText: 'Schedule Service',
    ctaTextEs: 'Agendar Servicio',
    keywords: ['hvac', 'air conditioning', 'heating', 'aire acondicionado', 'calefacción', 'climatización']
  },
  'roofing': {
    id: 'roofing',
    name: 'Roofing',
    nameEs: 'Techos',
    category: 'construction',
    sections: ['header', 'hero', 'features', 'about', 'gallery', 'process', 'testimonials', 'faq', 'form', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'grid',
    testimonialsVariant: 'featured',
    colorPalette: 'dark',
    suggestedImages: ['roofing', 'roof repair', 'roofer', 'house roof'],
    ctaText: 'Free Inspection',
    ctaTextEs: 'Inspección Gratis',
    keywords: ['roofing', 'roof', 'repair', 'techos', 'techo', 'reparación']
  },

  // ==================== MASCOTAS ====================
  'pet-store': {
    id: 'pet-store',
    name: 'Pet Store',
    nameEs: 'Tienda de Mascotas',
    category: 'pets',
    sections: ['header', 'hero', 'features', 'gallery', 'testimonials', 'faq', 'cta', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'animated',
    testimonialsVariant: 'carousel',
    colorPalette: 'warm',
    suggestedImages: ['pet store', 'dogs', 'cats', 'pet supplies'],
    ctaText: 'Shop Now',
    ctaTextEs: 'Comprar Ahora',
    keywords: ['pet', 'store', 'animals', 'mascotas', 'tienda', 'animales']
  },
  'veterinary': {
    id: 'veterinary',
    name: 'Veterinary Clinic',
    nameEs: 'Clínica Veterinaria',
    category: 'pets',
    sections: ['header', 'hero', 'features', 'about', 'gallery', 'testimonials', 'pricing', 'faq', 'form', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'grid',
    testimonialsVariant: 'carousel',
    pricingVariant: 'comparison',
    colorPalette: 'light',
    suggestedImages: ['veterinarian', 'pet clinic', 'dog', 'cat'],
    ctaText: 'Book Appointment',
    ctaTextEs: 'Agendar Cita',
    keywords: ['veterinary', 'vet', 'pet', 'veterinaria', 'veterinario', 'mascota']
  },
  'pet-grooming': {
    id: 'pet-grooming',
    name: 'Pet Grooming',
    nameEs: 'Peluquería de Mascotas',
    category: 'pets',
    sections: ['header', 'hero', 'features', 'about', 'gallery', 'testimonials', 'pricing', 'form', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'grid',
    testimonialsVariant: 'carousel',
    pricingVariant: 'cards',
    colorPalette: 'warm',
    suggestedImages: ['pet grooming', 'dog bath', 'groomer', 'cute pet'],
    ctaText: 'Book Grooming',
    ctaTextEs: 'Reservar Cita',
    keywords: ['grooming', 'pet', 'dog', 'peluquería', 'mascota', 'baño']
  },

  // ==================== ENTRETENIMIENTO ====================
  'gaming': {
    id: 'gaming',
    name: 'Gaming',
    nameEs: 'Gaming / Videojuegos',
    category: 'entertainment',
    sections: ['header', 'hero', 'features', 'gallery', 'stats', 'testimonials', 'faq', 'cta', 'footer'],
    heroVariant: 'asymmetric',
    featuresVariant: 'animated',
    testimonialsVariant: 'video',
    colorPalette: 'neon',
    suggestedImages: ['gaming', 'esports', 'controller', 'gamer'],
    ctaText: 'Play Now',
    ctaTextEs: 'Jugar Ahora',
    keywords: ['gaming', 'games', 'esports', 'juegos', 'videojuegos', 'gamer']
  },
  'streaming': {
    id: 'streaming',
    name: 'Streaming Service',
    nameEs: 'Servicio de Streaming',
    category: 'entertainment',
    sections: ['header', 'hero', 'features', 'gallery', 'stats', 'testimonials', 'pricing', 'faq', 'cta', 'footer'],
    heroVariant: 'centered',
    featuresVariant: 'bento',
    testimonialsVariant: 'carousel',
    pricingVariant: 'cards',
    colorPalette: 'dark',
    suggestedImages: ['streaming', 'movies', 'tv shows', 'entertainment'],
    ctaText: 'Start Watching',
    ctaTextEs: 'Empezar a Ver',
    keywords: ['streaming', 'movies', 'tv', 'películas', 'series', 'entretenimiento']
  },
  'podcast': {
    id: 'podcast',
    name: 'Podcast',
    nameEs: 'Podcast',
    category: 'entertainment',
    sections: ['header', 'hero', 'about', 'features', 'gallery', 'testimonials', 'cta', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'minimal',
    testimonialsVariant: 'featured',
    colorPalette: 'gradient',
    suggestedImages: ['podcast', 'microphone', 'recording', 'host'],
    ctaText: 'Listen Now',
    ctaTextEs: 'Escuchar Ahora',
    keywords: ['podcast', 'audio', 'show', 'episodio', 'escuchar']
  },

  // ==================== NON-PROFIT ====================
  'nonprofit': {
    id: 'nonprofit',
    name: 'Non-Profit',
    nameEs: 'ONG / Sin Fines de Lucro',
    category: 'nonprofit',
    sections: ['header', 'hero', 'about', 'features', 'stats', 'gallery', 'testimonials', 'cta', 'footer'],
    heroVariant: 'centered',
    featuresVariant: 'grid',
    testimonialsVariant: 'featured',
    colorPalette: 'warm',
    suggestedImages: ['charity', 'volunteers', 'helping', 'community'],
    ctaText: 'Donate Now',
    ctaTextEs: 'Donar Ahora',
    keywords: ['nonprofit', 'charity', 'donate', 'ong', 'caridad', 'donar']
  },
  'church': {
    id: 'church',
    name: 'Church / Religious',
    nameEs: 'Iglesia / Religioso',
    category: 'nonprofit',
    sections: ['header', 'hero', 'about', 'features', 'gallery', 'testimonials', 'form', 'footer'],
    heroVariant: 'centered',
    featuresVariant: 'grid',
    testimonialsVariant: 'featured',
    colorPalette: 'warm',
    suggestedImages: ['church', 'worship', 'community', 'faith'],
    ctaText: 'Join Us',
    ctaTextEs: 'Únete',
    keywords: ['church', 'religious', 'faith', 'iglesia', 'religioso', 'fe']
  },

  // ==================== PERSONAL ====================
  'portfolio': {
    id: 'portfolio',
    name: 'Portfolio',
    nameEs: 'Portafolio Personal',
    category: 'personal',
    sections: ['header', 'hero', 'about', 'gallery', 'features', 'testimonials', 'form', 'footer'],
    heroVariant: 'minimal',
    featuresVariant: 'minimal',
    testimonialsVariant: 'masonry',
    colorPalette: 'minimal',
    suggestedImages: ['designer', 'creative work', 'portfolio', 'workspace'],
    ctaText: 'View Work',
    ctaTextEs: 'Ver Trabajo',
    keywords: ['portfolio', 'designer', 'developer', 'portafolio', 'diseñador', 'desarrollador']
  },
  'resume': {
    id: 'resume',
    name: 'Resume / CV',
    nameEs: 'Currículum',
    category: 'personal',
    sections: ['header', 'hero', 'about', 'features', 'stats', 'testimonials', 'form', 'footer'],
    heroVariant: 'split',
    featuresVariant: 'minimal',
    testimonialsVariant: 'grid',
    colorPalette: 'minimal',
    suggestedImages: ['professional', 'workspace', 'career', 'success'],
    ctaText: 'Contact Me',
    ctaTextEs: 'Contáctame',
    keywords: ['resume', 'cv', 'career', 'currículum', 'trabajo', 'profesional']
  },
  'personal-brand': {
    id: 'personal-brand',
    name: 'Personal Brand',
    nameEs: 'Marca Personal',
    category: 'personal',
    sections: ['header', 'hero', 'about', 'features', 'gallery', 'testimonials', 'cta', 'footer'],
    heroVariant: 'asymmetric',
    featuresVariant: 'alternating',
    testimonialsVariant: 'featured',
    colorPalette: 'gradient',
    suggestedImages: ['influencer', 'speaker', 'coach', 'personal brand'],
    ctaText: 'Work With Me',
    ctaTextEs: 'Trabaja Conmigo',
    keywords: ['personal brand', 'influencer', 'coach', 'marca personal', 'coaching']
  }
};

// Combinar todos los patrones (base + extendidos + nicho)
const allPatterns: Record<string, IndustryPattern> = {
  ...industryPatterns,
  ...extendedIndustryPatterns,
  ...nicheIndustryPatterns
};

/**
 * Obtiene un patrón por ID (busca en todos los patrones)
 */
export function getIndustryPattern(id: string): IndustryPattern | null {
  return allPatterns[id] || null;
}

/**
 * Lista todos los patrones disponibles (base + extendidos)
 */
export function listIndustryPatterns(): IndustryPattern[] {
  return Object.values(allPatterns);
}

/**
 * Busca patrones por keywords (busca en todos los patrones)
 */
export function findPatternByKeywords(query: string): IndustryPattern | null {
  const normalizedQuery = query.toLowerCase();
  
  // Primero buscar coincidencia exacta
  for (const pattern of Object.values(allPatterns)) {
    for (const keyword of pattern.keywords) {
      if (normalizedQuery.includes(keyword)) {
        return pattern;
      }
    }
  }
  
  return null;
}

/**
 * Obtiene patrones por categoría (busca en todos los patrones)
 */
export function getPatternsByCategory(category: string): IndustryPattern[] {
  return Object.values(allPatterns).filter(p => p.category === category);
}

/**
 * Lista todas las categorías disponibles (de todos los patrones)
 */
export function listCategories(): string[] {
  const categories = new Set<string>();
  for (const pattern of Object.values(allPatterns)) {
    categories.add(pattern.category);
  }
  return Array.from(categories);
}

/**
 * Genera el prompt adicional para una industria específica
 */
export function generateIndustryPrompt(pattern: IndustryPattern): string {
  const sections = pattern.sections.map((s, i) => `${i + 1}. ${s}`).join('\n');
  const images = pattern.suggestedImages.map(img => `- ${img}`).join('\n');
  const pricing = pattern.pricingVariant ? `- Pricing: ${pattern.pricingVariant}` : '';
  
  return `## PATRÓN DE INDUSTRIA: ${pattern.name} (${pattern.nameEs})

### Secciones recomendadas (en orden):
${sections}

### Variantes de layout a usar:
- Hero: ${pattern.heroVariant}
- Features: ${pattern.featuresVariant}
- Testimonials: ${pattern.testimonialsVariant}
${pricing}

### Paleta de colores: ${pattern.colorPalette}

### Imágenes sugeridas:
${images}

### CTA principal: "${pattern.ctaText}" / "${pattern.ctaTextEs}"`;
}

// Exportar el conteo total (base + extendidos + nicho)
export const TOTAL_BASE_PATTERNS = Object.keys(industryPatterns).length;
export const TOTAL_PATTERNS = TOTAL_BASE_PATTERNS + TOTAL_EXTENDED_PATTERNS + TOTAL_NICHE_PATTERNS;

// Exportar todos los patrones combinados
export { allPatterns };
