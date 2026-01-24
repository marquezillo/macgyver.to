/**
 * Industry-specific image keywords for better image selection
 * Each industry has primary keywords (most relevant) and secondary keywords (complementary)
 */

export interface IndustryKeywords {
  primary: string[];
  secondary: string[];
  heroKeywords: string[];
  featureKeywords: string[];
  testimonialBackgrounds: string[];
}

export const industryImageKeywords: Record<string, IndustryKeywords> = {
  // RESTAURANTES Y COMIDA
  restaurant: {
    primary: ['restaurant interior', 'fine dining', 'chef cooking', 'gourmet food plating'],
    secondary: ['restaurant ambiance', 'dinner table setting', 'wine glasses', 'culinary art'],
    heroKeywords: ['elegant restaurant', 'chef preparing food', 'luxury dining room'],
    featureKeywords: ['fresh ingredients', 'cooking process', 'restaurant kitchen'],
    testimonialBackgrounds: ['restaurant booth', 'dining atmosphere', 'cozy restaurant']
  },
  sushi: {
    primary: ['sushi chef', 'japanese restaurant', 'sushi platter', 'sashimi fresh'],
    secondary: ['sake bottle', 'chopsticks bamboo', 'japanese cuisine', 'omakase'],
    heroKeywords: ['sushi master chef', 'japanese restaurant interior', 'fresh sushi roll'],
    featureKeywords: ['fresh fish market', 'sushi preparation', 'japanese knife'],
    testimonialBackgrounds: ['japanese dining', 'zen restaurant', 'minimalist japanese']
  },
  cafe: {
    primary: ['coffee shop interior', 'barista making coffee', 'latte art', 'cozy cafe'],
    secondary: ['coffee beans roasting', 'espresso machine', 'pastry display', 'cafe ambiance'],
    heroKeywords: ['artisan coffee shop', 'barista pouring latte', 'modern cafe interior'],
    featureKeywords: ['coffee brewing', 'fresh pastries', 'coffee beans'],
    testimonialBackgrounds: ['cafe corner', 'coffee shop seating', 'warm cafe']
  },
  bakery: {
    primary: ['artisan bread', 'bakery display', 'fresh pastries', 'baker kneading dough'],
    secondary: ['croissants golden', 'sourdough bread', 'pastry chef', 'bakery oven'],
    heroKeywords: ['artisan bakery', 'fresh baked bread', 'pastry display case'],
    featureKeywords: ['bread making', 'pastry preparation', 'flour dusting'],
    testimonialBackgrounds: ['bakery interior', 'warm bakery', 'rustic bakery']
  },
  pizzeria: {
    primary: ['pizza oven wood', 'pizza chef tossing', 'italian pizzeria', 'fresh pizza'],
    secondary: ['pizza ingredients', 'mozzarella cheese', 'italian restaurant', 'pizza slice'],
    heroKeywords: ['wood fired pizza oven', 'pizza chef', 'authentic italian pizzeria'],
    featureKeywords: ['pizza making', 'fresh ingredients pizza', 'pizza dough'],
    testimonialBackgrounds: ['italian restaurant', 'pizzeria interior', 'rustic italian']
  },

  // TECNOLOGÍA
  technology: {
    primary: ['modern office tech', 'software development', 'tech startup', 'digital innovation'],
    secondary: ['coding screen', 'tech team meeting', 'modern workspace', 'digital devices'],
    heroKeywords: ['tech company office', 'innovation lab', 'modern tech workspace'],
    featureKeywords: ['software interface', 'tech development', 'digital solution'],
    testimonialBackgrounds: ['modern office', 'tech workspace', 'startup office']
  },
  saas: {
    primary: ['dashboard interface', 'software platform', 'cloud computing', 'data analytics'],
    secondary: ['team collaboration', 'productivity tools', 'business software', 'tech solution'],
    heroKeywords: ['saas dashboard', 'cloud platform', 'business software interface'],
    featureKeywords: ['analytics dashboard', 'software features', 'integration'],
    testimonialBackgrounds: ['modern office', 'business meeting', 'professional workspace']
  },
  startup: {
    primary: ['startup team', 'modern coworking', 'innovation hub', 'entrepreneurship'],
    secondary: ['brainstorming session', 'pitch presentation', 'startup culture', 'agile team'],
    heroKeywords: ['startup office', 'young entrepreneurs', 'innovation workspace'],
    featureKeywords: ['team collaboration', 'product development', 'growth'],
    testimonialBackgrounds: ['coworking space', 'startup environment', 'modern office']
  },

  // SALUD Y BIENESTAR
  healthcare: {
    primary: ['modern hospital', 'medical professional', 'healthcare facility', 'doctor patient'],
    secondary: ['medical equipment', 'health clinic', 'caring nurse', 'medical consultation'],
    heroKeywords: ['modern medical center', 'caring doctor', 'healthcare facility'],
    featureKeywords: ['medical care', 'health services', 'patient care'],
    testimonialBackgrounds: ['clinic waiting room', 'medical office', 'healthcare']
  },
  dental: {
    primary: ['modern dental clinic', 'dentist patient', 'dental equipment', 'smile makeover'],
    secondary: ['dental chair', 'teeth whitening', 'dental hygiene', 'orthodontics'],
    heroKeywords: ['modern dental office', 'friendly dentist', 'dental care'],
    featureKeywords: ['dental treatment', 'oral health', 'dental technology'],
    testimonialBackgrounds: ['dental clinic', 'bright dental office', 'clean clinic']
  },
  spa: {
    primary: ['luxury spa', 'massage therapy', 'wellness retreat', 'relaxation'],
    secondary: ['spa treatment', 'aromatherapy', 'hot stones massage', 'zen atmosphere'],
    heroKeywords: ['luxury spa interior', 'relaxing massage', 'wellness center'],
    featureKeywords: ['spa treatment', 'skincare', 'relaxation therapy'],
    testimonialBackgrounds: ['spa ambiance', 'peaceful spa', 'zen spa']
  },
  gym: {
    primary: ['modern gym', 'fitness training', 'workout equipment', 'personal trainer'],
    secondary: ['weight lifting', 'cardio exercise', 'fitness class', 'gym interior'],
    heroKeywords: ['modern fitness center', 'gym workout', 'fitness training'],
    featureKeywords: ['exercise equipment', 'fitness class', 'training session'],
    testimonialBackgrounds: ['gym interior', 'fitness center', 'workout space']
  },
  yoga: {
    primary: ['yoga studio', 'meditation practice', 'yoga pose', 'mindfulness'],
    secondary: ['yoga class', 'zen space', 'peaceful meditation', 'yoga mat'],
    heroKeywords: ['serene yoga studio', 'yoga practice', 'meditation space'],
    featureKeywords: ['yoga poses', 'mindfulness', 'wellness'],
    testimonialBackgrounds: ['yoga studio', 'peaceful space', 'zen interior']
  },

  // EDUCACIÓN
  education: {
    primary: ['modern classroom', 'students learning', 'education technology', 'teaching'],
    secondary: ['library study', 'online learning', 'academic', 'school campus'],
    heroKeywords: ['modern school', 'students studying', 'education'],
    featureKeywords: ['learning environment', 'classroom', 'education tools'],
    testimonialBackgrounds: ['library', 'campus', 'study space']
  },
  online_course: {
    primary: ['online learning', 'e-learning platform', 'video course', 'digital education'],
    secondary: ['student laptop', 'webinar', 'online class', 'remote learning'],
    heroKeywords: ['online education', 'e-learning', 'digital course'],
    featureKeywords: ['video lessons', 'online platform', 'learning'],
    testimonialBackgrounds: ['home office', 'study desk', 'learning space']
  },

  // SERVICIOS PROFESIONALES
  legal: {
    primary: ['law office', 'lawyer consultation', 'legal services', 'courthouse'],
    secondary: ['legal documents', 'attorney meeting', 'law firm', 'justice'],
    heroKeywords: ['professional law office', 'lawyer', 'legal consultation'],
    featureKeywords: ['legal services', 'consultation', 'documents'],
    testimonialBackgrounds: ['law office', 'professional office', 'meeting room']
  },
  accounting: {
    primary: ['accounting office', 'financial analysis', 'business consulting', 'tax services'],
    secondary: ['financial reports', 'calculator documents', 'business meeting', 'audit'],
    heroKeywords: ['accounting firm', 'financial consulting', 'business services'],
    featureKeywords: ['financial analysis', 'tax preparation', 'consulting'],
    testimonialBackgrounds: ['professional office', 'meeting room', 'business']
  },
  consulting: {
    primary: ['business consulting', 'strategy meeting', 'professional advice', 'corporate'],
    secondary: ['presentation', 'team discussion', 'business analysis', 'planning'],
    heroKeywords: ['consulting firm', 'business strategy', 'professional meeting'],
    featureKeywords: ['strategy', 'analysis', 'business growth'],
    testimonialBackgrounds: ['conference room', 'office meeting', 'professional']
  },

  // INMOBILIARIA
  real_estate: {
    primary: ['luxury home', 'modern apartment', 'real estate', 'property'],
    secondary: ['house interior', 'real estate agent', 'home tour', 'architecture'],
    heroKeywords: ['luxury property', 'modern home', 'real estate'],
    featureKeywords: ['home interior', 'property features', 'architecture'],
    testimonialBackgrounds: ['home living room', 'modern interior', 'property']
  },

  // RETAIL Y ECOMMERCE
  ecommerce: {
    primary: ['online shopping', 'ecommerce', 'product display', 'shopping cart'],
    secondary: ['delivery package', 'mobile shopping', 'product photography', 'retail'],
    heroKeywords: ['online store', 'ecommerce platform', 'shopping'],
    featureKeywords: ['products', 'delivery', 'shopping experience'],
    testimonialBackgrounds: ['modern retail', 'shopping', 'store']
  },
  fashion: {
    primary: ['fashion boutique', 'clothing store', 'fashion model', 'designer clothes'],
    secondary: ['fashion photography', 'style', 'wardrobe', 'accessories'],
    heroKeywords: ['fashion store', 'clothing boutique', 'style'],
    featureKeywords: ['fashion items', 'clothing', 'accessories'],
    testimonialBackgrounds: ['fashion store', 'boutique', 'stylish']
  },

  // VIAJES Y TURISMO
  travel: {
    primary: ['travel destination', 'vacation', 'tourism', 'adventure'],
    secondary: ['airplane travel', 'hotel resort', 'beach vacation', 'exploration'],
    heroKeywords: ['travel adventure', 'vacation destination', 'tourism'],
    featureKeywords: ['destinations', 'travel experience', 'adventure'],
    testimonialBackgrounds: ['travel', 'vacation', 'destination']
  },
  hotel: {
    primary: ['luxury hotel', 'hotel room', 'resort', 'hospitality'],
    secondary: ['hotel lobby', 'room service', 'hotel pool', 'accommodation'],
    heroKeywords: ['luxury hotel', 'resort', 'hospitality'],
    featureKeywords: ['hotel amenities', 'room', 'service'],
    testimonialBackgrounds: ['hotel lobby', 'resort', 'luxury']
  },

  // EVENTOS
  wedding: {
    primary: ['wedding ceremony', 'bride groom', 'wedding venue', 'wedding decoration'],
    secondary: ['wedding flowers', 'wedding cake', 'reception', 'romantic'],
    heroKeywords: ['beautiful wedding', 'wedding venue', 'ceremony'],
    featureKeywords: ['wedding planning', 'decoration', 'celebration'],
    testimonialBackgrounds: ['wedding venue', 'romantic', 'elegant']
  },
  events: {
    primary: ['event venue', 'corporate event', 'celebration', 'party'],
    secondary: ['event decoration', 'conference', 'gala', 'catering'],
    heroKeywords: ['event space', 'celebration', 'venue'],
    featureKeywords: ['event planning', 'decoration', 'catering'],
    testimonialBackgrounds: ['event venue', 'celebration', 'party']
  },

  // AUTOMOTRIZ
  automotive: {
    primary: ['car dealership', 'luxury car', 'auto repair', 'vehicle'],
    secondary: ['car showroom', 'mechanic', 'car service', 'automobile'],
    heroKeywords: ['car dealership', 'luxury vehicle', 'automotive'],
    featureKeywords: ['car service', 'vehicles', 'automotive'],
    testimonialBackgrounds: ['car showroom', 'dealership', 'automotive']
  },

  // MASCOTAS
  pets: {
    primary: ['pet store', 'veterinary clinic', 'dog grooming', 'pet care'],
    secondary: ['cute pets', 'pet services', 'animal hospital', 'pet supplies'],
    heroKeywords: ['pet care', 'veterinary', 'pet services'],
    featureKeywords: ['pet grooming', 'veterinary care', 'pet supplies'],
    testimonialBackgrounds: ['pet clinic', 'pet store', 'animal care']
  },

  // DEFAULT
  default: {
    primary: ['modern business', 'professional team', 'office workspace', 'corporate'],
    secondary: ['business meeting', 'teamwork', 'success', 'growth'],
    heroKeywords: ['professional business', 'modern office', 'team'],
    featureKeywords: ['services', 'quality', 'professional'],
    testimonialBackgrounds: ['office', 'professional', 'business']
  }
};

/**
 * Detecta la industria basándose en el mensaje del usuario
 */
export function detectIndustry(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  // Mapeo de palabras clave a industrias
  const industryPatterns: Record<string, string[]> = {
    sushi: ['sushi', 'japonés', 'japanese', 'omakase', 'sashimi', 'nigiri'],
    restaurant: ['restaurante', 'restaurant', 'comida', 'food', 'gastronomy', 'gastronomía', 'dining'],
    cafe: ['café', 'cafetería', 'coffee', 'coffee shop', 'barista'],
    bakery: ['panadería', 'bakery', 'bread', 'pan', 'pastry', 'pastelería'],
    pizzeria: ['pizza', 'pizzería', 'pizzeria', 'italian food'],
    technology: ['tecnología', 'technology', 'tech', 'software', 'app', 'digital'],
    saas: ['saas', 'plataforma', 'platform', 'software service', 'cloud'],
    startup: ['startup', 'emprendimiento', 'entrepreneurship', 'innovation'],
    healthcare: ['salud', 'health', 'medical', 'médico', 'hospital', 'clínica', 'clinic'],
    dental: ['dental', 'dentista', 'dentist', 'teeth', 'dientes', 'ortodoncista'],
    spa: ['spa', 'wellness', 'bienestar', 'massage', 'masaje', 'relajación'],
    gym: ['gym', 'gimnasio', 'fitness', 'exercise', 'workout', 'entrenamiento'],
    yoga: ['yoga', 'meditation', 'meditación', 'mindfulness', 'pilates'],
    education: ['educación', 'education', 'school', 'escuela', 'academy', 'academia'],
    online_course: ['curso online', 'online course', 'e-learning', 'formación online'],
    legal: ['abogado', 'lawyer', 'legal', 'law firm', 'bufete', 'jurídico'],
    accounting: ['contabilidad', 'accounting', 'tax', 'impuestos', 'fiscal', 'auditoría'],
    consulting: ['consultoría', 'consulting', 'asesoría', 'advisory'],
    real_estate: ['inmobiliaria', 'real estate', 'property', 'propiedades', 'bienes raíces'],
    ecommerce: ['ecommerce', 'tienda online', 'online store', 'shop'],
    fashion: ['moda', 'fashion', 'ropa', 'clothing', 'boutique'],
    travel: ['viajes', 'travel', 'turismo', 'tourism', 'vacation', 'vacaciones'],
    hotel: ['hotel', 'resort', 'alojamiento', 'accommodation', 'hospedaje'],
    wedding: ['boda', 'wedding', 'matrimonio', 'nupcial', 'bridal'],
    events: ['eventos', 'events', 'catering', 'celebración', 'fiesta'],
    automotive: ['coches', 'cars', 'auto', 'vehículos', 'vehicles', 'taller', 'concesionario'],
    pets: ['mascotas', 'pets', 'veterinario', 'veterinary', 'perros', 'gatos', 'grooming']
  };

  for (const [industry, patterns] of Object.entries(industryPatterns)) {
    if (patterns.some(pattern => message.includes(pattern))) {
      return industry;
    }
  }

  return 'default';
}

/**
 * Obtiene las palabras clave de imagen para una industria
 */
export function getIndustryKeywords(industry: string): IndustryKeywords {
  return industryImageKeywords[industry] || industryImageKeywords.default;
}

/**
 * Genera una consulta de búsqueda de imagen optimizada
 */
export function generateImageQuery(
  industry: string, 
  context: 'hero' | 'feature' | 'testimonial' | 'general',
  additionalKeywords?: string[]
): string {
  const keywords = getIndustryKeywords(industry);
  
  let baseKeywords: string[];
  switch (context) {
    case 'hero':
      baseKeywords = keywords.heroKeywords;
      break;
    case 'feature':
      baseKeywords = keywords.featureKeywords;
      break;
    case 'testimonial':
      baseKeywords = keywords.testimonialBackgrounds;
      break;
    default:
      baseKeywords = keywords.primary;
  }

  // Seleccionar un keyword aleatorio del array
  const randomKeyword = baseKeywords[Math.floor(Math.random() * baseKeywords.length)];
  
  // Añadir keywords adicionales si se proporcionan
  if (additionalKeywords && additionalKeywords.length > 0) {
    return `${randomKeyword} ${additionalKeywords.join(' ')}`;
  }

  return randomKeyword;
}

/**
 * Obtiene múltiples queries para variedad de imágenes
 */
export function getMultipleImageQueries(
  industry: string,
  context: 'hero' | 'feature' | 'testimonial' | 'general',
  count: number = 3
): string[] {
  const keywords = getIndustryKeywords(industry);
  
  let sourceKeywords: string[];
  switch (context) {
    case 'hero':
      sourceKeywords = [...keywords.heroKeywords, ...keywords.primary];
      break;
    case 'feature':
      sourceKeywords = [...keywords.featureKeywords, ...keywords.secondary];
      break;
    case 'testimonial':
      sourceKeywords = keywords.testimonialBackgrounds;
      break;
    default:
      sourceKeywords = [...keywords.primary, ...keywords.secondary];
  }

  // Mezclar y seleccionar
  const shuffled = sourceKeywords.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
