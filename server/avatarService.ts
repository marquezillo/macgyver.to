/**
 * Avatar Service
 * Proporciona avatares reales de personas para testimonios
 * Colección expandida con 35+ fotos por género y diversidad étnica/edad
 * 
 * IMPORTANTE: Este servicio SIEMPRE reemplaza URLs de servicios no confiables
 * (ui-avatars.com, placeholder.com, etc.) con fotos reales de Unsplash
 */

// Cache de avatares para evitar llamadas repetidas
const avatarCache: Map<string, string[]> = new Map();

// URLs de avatares de alta calidad de Unsplash
// Organizados por género con diversidad étnica y de edad
const FALLBACK_AVATARS = {
  male: [
    // Profesionales jóvenes
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
    // Diversidad étnica
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop&crop=face',
    // Profesionales maduros
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1559418162-0d309d8d10a3?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1557862921-37829c790f19?w=150&h=150&fit=crop&crop=face',
    // Casual/Creativos
    'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=150&h=150&fit=crop&crop=face',
    // Más diversidad
    'https://images.unsplash.com/photo-1507081323647-4d250478b919?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1590086782957-93c06ef21604?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1615109398623-88346a601842?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150&h=150&fit=crop&crop=face',
  ],
  female: [
    // Profesionales jóvenes
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
    // Diversidad étnica
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face',
    // Profesionales maduras
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1558898479-33c0057a5d12?w=150&h=150&fit=crop&crop=face',
    // Casual/Creativas
    'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1557862921-37829c790f19?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1592621385612-4d7129426394?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1601288496920-b6154fe3626a?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1614644147724-2d4785d69962?w=150&h=150&fit=crop&crop=face',
    // Más diversidad
    'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1619895862022-09114b41f16f?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1623366302587-b38b1ddaefd9?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1629747490241-624f07d70e1e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1645378999013-95abebf5f3c1?w=150&h=150&fit=crop&crop=face',
  ],
  neutral: [
    // Fotos profesionales sin género específico evidente
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  ],
};

// Nombres comunes para detectar género (aproximado)
// Lista expandida con más nombres internacionales
const FEMALE_NAMES = [
  // Español
  'maria', 'ana', 'laura', 'carmen', 'sofia', 'lucia', 'elena', 'paula', 'marta', 'sara',
  'isabel', 'rosa', 'pilar', 'teresa', 'cristina', 'andrea', 'patricia', 'claudia', 'monica', 'silvia',
  'beatriz', 'raquel', 'alicia', 'irene', 'nuria', 'eva', 'rocio', 'susana', 'angela', 'natalia',
  // Inglés
  'mary', 'jennifer', 'linda', 'patricia', 'elizabeth', 'susan', 'jessica', 'sarah', 'karen', 'nancy',
  'emma', 'olivia', 'ava', 'isabella', 'sophia', 'mia', 'charlotte', 'amelia', 'harper', 'evelyn',
  'emily', 'madison', 'chloe', 'grace', 'lily', 'victoria', 'hannah', 'samantha', 'ashley', 'nicole',
  // Francés
  'marie', 'camille', 'julie', 'claire', 'celine', 'aurelie', 'emilie', 'manon', 'lea', 'chloe',
  // Alemán
  'anna', 'julia', 'lisa', 'lena', 'sarah', 'laura', 'katharina', 'marie', 'sophie', 'hannah',
  // Italiano
  'giulia', 'francesca', 'chiara', 'sara', 'valentina', 'alessia', 'martina', 'giorgia', 'elisa', 'federica',
  // Portugués
  'ana', 'maria', 'joana', 'beatriz', 'mariana', 'catarina', 'ines', 'carolina', 'rita', 'sofia',
  // Asiáticos
  'yuki', 'sakura', 'mei', 'lin', 'chen', 'kim', 'lee', 'park', 'nguyen', 'tran',
  'aiko', 'haruka', 'misaki', 'nanami', 'rin', 'saki', 'yui', 'akari', 'hana', 'mio',
];

const MALE_NAMES = [
  // Español
  'juan', 'carlos', 'miguel', 'jose', 'antonio', 'francisco', 'david', 'pedro', 'luis', 'javier',
  'manuel', 'rafael', 'fernando', 'pablo', 'sergio', 'jorge', 'alberto', 'alejandro', 'diego', 'andres',
  'mario', 'victor', 'raul', 'enrique', 'adrian', 'ivan', 'oscar', 'ruben', 'angel', 'marcos',
  // Inglés
  'john', 'michael', 'david', 'james', 'robert', 'william', 'richard', 'thomas', 'charles', 'daniel',
  'liam', 'noah', 'oliver', 'elijah', 'benjamin', 'lucas', 'henry', 'alexander', 'mason', 'ethan',
  'matthew', 'joseph', 'andrew', 'ryan', 'joshua', 'nathan', 'kevin', 'brian', 'steven', 'mark',
  // Francés
  'jean', 'pierre', 'michel', 'philippe', 'nicolas', 'christophe', 'laurent', 'stephane', 'eric', 'olivier',
  // Alemán
  'hans', 'peter', 'michael', 'thomas', 'andreas', 'stefan', 'christian', 'martin', 'markus', 'daniel',
  // Italiano
  'marco', 'giuseppe', 'giovanni', 'luca', 'andrea', 'francesco', 'alessandro', 'matteo', 'lorenzo', 'davide',
  // Portugués
  'joao', 'pedro', 'tiago', 'miguel', 'andre', 'bruno', 'rafael', 'hugo', 'ricardo', 'diogo',
  // Asiáticos
  'hiroshi', 'takeshi', 'kenji', 'yuki', 'ryu', 'wei', 'chen', 'wang', 'kim', 'park',
  'akira', 'daiki', 'haruto', 'kaito', 'ren', 'sota', 'yuto', 'hayato', 'kento', 'shota',
];

/**
 * Lista de patrones de URLs NO CONFIABLES que SIEMPRE deben ser reemplazadas
 * Estas URLs generan avatares genéricos o pueden fallar
 */
const UNRELIABLE_URL_PATTERNS = [
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
  'ui-avatars.com',    // ← Este es el problema principal
  'gravatar.com',
  'robohash.org',
  'dicebear.com',
  'avatars.dicebear.com',
  'api.dicebear.com',
  'boringavatars.com',
  'avatar-placeholder',
  'placeholder-avatar',
  'default-avatar',
];

/**
 * Detecta el género probable basado en el nombre
 */
function detectGender(name: string): 'male' | 'female' | 'neutral' {
  if (!name) return 'neutral';
  
  const firstName = name.toLowerCase().split(' ')[0];
  
  // Buscar coincidencia exacta primero
  if (FEMALE_NAMES.includes(firstName)) {
    return 'female';
  }
  
  if (MALE_NAMES.includes(firstName)) {
    return 'male';
  }
  
  // Buscar coincidencia parcial
  if (FEMALE_NAMES.some(n => firstName.startsWith(n) || n.startsWith(firstName))) {
    return 'female';
  }
  
  if (MALE_NAMES.some(n => firstName.startsWith(n) || n.startsWith(firstName))) {
    return 'male';
  }
  
  return 'neutral';
}

/**
 * Verifica si una URL es de un servicio NO CONFIABLE que debe ser reemplazada
 * IMPORTANTE: Esta función es más estricta que isValidAvatarUrl
 */
function isUnreliableAvatarUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return true;
  if (url.trim() === '' || url === 'undefined' || url === 'null') return true;
  
  // Verificar contra todos los patrones no confiables
  const lowerUrl = url.toLowerCase();
  return UNRELIABLE_URL_PATTERNS.some(pattern => lowerUrl.includes(pattern.toLowerCase()));
}

/**
 * Verifica si una URL es de Unsplash (fuente confiable)
 */
function isUnsplashUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.includes('unsplash.com') || url.includes('images.unsplash.com');
}

/**
 * Obtiene un avatar de Unsplash basado en el nombre
 * Usa un hash del nombre para obtener consistencia
 */
export function getAvatarForName(name: string, index: number = 0): string {
  const gender = detectGender(name);
  const avatars = FALLBACK_AVATARS[gender];
  
  // Usar combinación de índice y hash del nombre para variedad pero consistencia
  const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const avatarIndex = (index + nameHash) % avatars.length;
  
  return avatars[avatarIndex];
}

/**
 * Genera avatares para una lista de testimonios
 * IMPORTANTE: SIEMPRE reemplaza URLs de servicios no confiables con fotos reales de Unsplash
 */
export function generateAvatarsForTestimonials(
  testimonials: Array<{ name: string; image?: string; avatar?: string }>
): Array<{ name: string; image: string; avatar: string }> {
  // Mantener track de avatares usados para evitar duplicados
  const usedAvatars = new Set<string>();
  
  console.log(`[AvatarService] Processing ${testimonials.length} testimonials for avatar enrichment...`);
  
  return testimonials.map((testimonial, index) => {
    const existingUrl = testimonial.image || testimonial.avatar;
    
    // SOLO mantener URLs de Unsplash existentes (son confiables)
    // SIEMPRE reemplazar URLs de servicios no confiables
    if (existingUrl && isUnsplashUrl(existingUrl) && !isUnreliableAvatarUrl(existingUrl)) {
      console.log(`[AvatarService] ✓ Keeping existing Unsplash URL for ${testimonial.name}`);
      usedAvatars.add(existingUrl);
      return {
        ...testimonial,
        image: existingUrl,
        avatar: existingUrl,
      };
    }
    
    // Log si estamos reemplazando una URL no confiable
    if (existingUrl && isUnreliableAvatarUrl(existingUrl)) {
      console.log(`[AvatarService] ⚠ Replacing unreliable URL for ${testimonial.name}: ${existingUrl.substring(0, 50)}...`);
    }
    
    // Generar nuevo avatar basado en el nombre
    const gender = detectGender(testimonial.name);
    const avatars = FALLBACK_AVATARS[gender];
    
    // Buscar un avatar que no se haya usado
    let avatarUrl = '';
    for (let i = 0; i < avatars.length; i++) {
      const candidateIndex = (index + i) % avatars.length;
      const candidate = avatars[candidateIndex];
      if (!usedAvatars.has(candidate)) {
        avatarUrl = candidate;
        usedAvatars.add(candidate);
        break;
      }
    }
    
    // Si todos están usados, usar uno basado en el nombre
    if (!avatarUrl) {
      avatarUrl = getAvatarForName(testimonial.name, index);
    }
    
    console.log(`[AvatarService] ✓ Assigned real photo to ${testimonial.name} (${gender})`);
    
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
  const usedIndices = new Set<number>();
  
  if (preferredGender === 'male') {
    const avatars = FALLBACK_AVATARS.male;
    for (let i = 0; i < count && i < avatars.length; i++) {
      result.push(avatars[i]);
    }
  } else if (preferredGender === 'female') {
    const avatars = FALLBACK_AVATARS.female;
    for (let i = 0; i < count && i < avatars.length; i++) {
      result.push(avatars[i]);
    }
  } else {
    // Mezclar géneros alternando
    const maleAvatars = FALLBACK_AVATARS.male;
    const femaleAvatars = FALLBACK_AVATARS.female;
    
    for (let i = 0; i < count; i++) {
      if (i % 2 === 0) {
        const idx = Math.floor(i / 2) % maleAvatars.length;
        result.push(maleAvatars[idx]);
      } else {
        const idx = Math.floor(i / 2) % femaleAvatars.length;
        result.push(femaleAvatars[idx]);
      }
    }
  }
  
  return result;
}

/**
 * Valida si una URL de avatar es válida y accesible
 * NOTA: Esta función es usada por el frontend para decidir si mostrar imagen o fallback
 */
export function isValidAvatarUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url.trim() === '' || url === 'undefined' || url === 'null') return false;
  
  // URLs de Unsplash y Pexels son confiables
  if (url.includes('unsplash.com') || url.includes('pexels.com')) return true;
  
  // Rechazar URLs de servicios que pueden fallar
  if (isUnreliableAvatarUrl(url)) {
    return false;
  }
  
  // Aceptar otras URLs que parecen válidas
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Obtiene estadísticas de la colección de avatares
 */
export function getAvatarStats(): { male: number; female: number; neutral: number; total: number } {
  return {
    male: FALLBACK_AVATARS.male.length,
    female: FALLBACK_AVATARS.female.length,
    neutral: FALLBACK_AVATARS.neutral.length,
    total: FALLBACK_AVATARS.male.length + FALLBACK_AVATARS.female.length + FALLBACK_AVATARS.neutral.length,
  };
}
