/**
 * Avatar Service
 * Proporciona avatares reales de personas para testimonios
 * Usa RandomUser API como fuente principal
 */

// Cache de avatares para evitar llamadas repetidas
const avatarCache: Map<string, string[]> = new Map();

// URLs de avatares de alta calidad pre-generados (fallback)
const FALLBACK_AVATARS = {
  male: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
  ],
  female: [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
  ],
  neutral: [
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=150&h=150&fit=crop&crop=face',
  ],
};

// Nombres comunes para detectar género (aproximado)
const FEMALE_NAMES = [
  'maria', 'ana', 'laura', 'carmen', 'sofia', 'lucia', 'elena', 'paula', 'marta', 'sara',
  'mary', 'jennifer', 'linda', 'patricia', 'elizabeth', 'susan', 'jessica', 'sarah', 'karen', 'nancy',
  'emma', 'olivia', 'ava', 'isabella', 'sophia', 'mia', 'charlotte', 'amelia', 'harper', 'evelyn',
];

const MALE_NAMES = [
  'juan', 'carlos', 'miguel', 'jose', 'antonio', 'francisco', 'david', 'pedro', 'luis', 'javier',
  'john', 'michael', 'david', 'james', 'robert', 'william', 'richard', 'thomas', 'charles', 'daniel',
  'liam', 'noah', 'oliver', 'elijah', 'william', 'james', 'benjamin', 'lucas', 'henry', 'alexander',
];

/**
 * Detecta el género probable basado en el nombre
 */
function detectGender(name: string): 'male' | 'female' | 'neutral' {
  if (!name) return 'neutral';
  
  const firstName = name.toLowerCase().split(' ')[0];
  
  if (FEMALE_NAMES.some(n => firstName.includes(n))) {
    return 'female';
  }
  
  if (MALE_NAMES.some(n => firstName.includes(n))) {
    return 'male';
  }
  
  return 'neutral';
}

/**
 * Obtiene un avatar de Unsplash basado en el nombre
 */
export function getAvatarForName(name: string, index: number = 0): string {
  const gender = detectGender(name);
  const avatars = FALLBACK_AVATARS[gender];
  
  // Usar el índice para obtener un avatar diferente para cada testimonio
  const avatarIndex = index % avatars.length;
  return avatars[avatarIndex];
}

/**
 * Genera avatares para una lista de testimonios
 */
export function generateAvatarsForTestimonials(
  testimonials: Array<{ name: string; image?: string; avatar?: string }>
): Array<{ name: string; image: string; avatar: string }> {
  return testimonials.map((testimonial, index) => {
    // Si ya tiene una imagen válida de Unsplash, mantenerla
    if (testimonial.image && testimonial.image.includes('unsplash.com')) {
      return {
        ...testimonial,
        image: testimonial.image,
        avatar: testimonial.image,
      };
    }
    
    if (testimonial.avatar && testimonial.avatar.includes('unsplash.com')) {
      return {
        ...testimonial,
        image: testimonial.avatar,
        avatar: testimonial.avatar,
      };
    }
    
    // Generar nuevo avatar basado en el nombre
    const avatarUrl = getAvatarForName(testimonial.name, index);
    
    return {
      ...testimonial,
      image: avatarUrl,
      avatar: avatarUrl,
    };
  });
}

/**
 * Obtiene múltiples avatares únicos
 */
export function getMultipleAvatars(count: number, preferredGender?: 'male' | 'female' | 'mixed'): string[] {
  const result: string[] = [];
  
  if (preferredGender === 'male') {
    for (let i = 0; i < count; i++) {
      result.push(FALLBACK_AVATARS.male[i % FALLBACK_AVATARS.male.length]);
    }
  } else if (preferredGender === 'female') {
    for (let i = 0; i < count; i++) {
      result.push(FALLBACK_AVATARS.female[i % FALLBACK_AVATARS.female.length]);
    }
  } else {
    // Mezclar géneros
    const allAvatars = [...FALLBACK_AVATARS.male, ...FALLBACK_AVATARS.female, ...FALLBACK_AVATARS.neutral];
    for (let i = 0; i < count; i++) {
      result.push(allAvatars[i % allAvatars.length]);
    }
  }
  
  return result;
}

/**
 * Valida si una URL de avatar es válida y accesible
 */
export function isValidAvatarUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url.trim() === '' || url === 'undefined' || url === 'null') return false;
  
  // Solo aceptar URLs de Unsplash (fuente confiable)
  if (url.includes('unsplash.com')) return true;
  
  // Rechazar URLs de servicios que pueden fallar
  const unreliablePatterns = [
    'placeholder.com',
    'via.placeholder',
    'placehold.it',
    'dummyimage.com',
    'fakeimg.pl',
    'lorempixel.com',
    'placekitten.com',
    'loremflickr.com',
    'randomuser.me',
    'i.pravatar.cc',
    'ui-avatars.com',
    'gravatar.com',
  ];
  
  if (unreliablePatterns.some(pattern => url.includes(pattern))) {
    return false;
  }
  
  // Aceptar otras URLs que parecen válidas
  return url.startsWith('http://') || url.startsWith('https://');
}
