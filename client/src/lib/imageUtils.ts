/**
 * Centralized image utility functions for landing page components.
 */

const PLACEHOLDER_PATTERNS = [
  'placeholder.com',
  'via.placeholder',
  'placehold.it',
  'dummyimage.com',
  'placekitten.com',
  'picsum.photos',
];

const VALID_URL_PREFIXES = ['http://', 'https://', '/', 'data:', 'blob:'];

/**
 * Validate if a URL is a valid image URL
 */
export function isValidImageUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim();
  if (trimmed === '' || trimmed === 'undefined' || trimmed === 'null') return false;

  const hasValidPrefix = VALID_URL_PREFIXES.some((prefix) =>
    trimmed.toLowerCase().startsWith(prefix)
  );
  if (!hasValidPrefix) return false;

  const isPlaceholder = PLACEHOLDER_PATTERNS.some((pattern) =>
    trimmed.toLowerCase().includes(pattern)
  );
  if (isPlaceholder) return false;

  return true;
}

/**
 * Validate if a URL is a valid video URL
 */
export function isValidVideoUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim().toLowerCase();
  if (trimmed === '' || trimmed === 'undefined' || trimmed === 'null') return false;

  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
  const isVideoFile = videoExtensions.some((ext) => trimmed.includes(ext));

  const videoServices = [
    'youtube.com',
    'youtu.be',
    'vimeo.com',
    'cloudinary.com',
    'wistia.com',
    'loom.com',
  ];
  const isVideoService = videoServices.some((service) => trimmed.includes(service));

  return isVideoFile || isVideoService;
}

/**
 * Get initials from a name (for avatar fallbacks)
 */
export function getInitials(name: string | undefined | null): string {
  if (!name || typeof name !== 'string') return 'U';

  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Generate a placeholder gradient background for missing images
 */
export function getPlaceholderGradient(seed: string = '', accentColor: string = '#6366f1'): string {
  const colors = [
    ['#6366f1', '#8b5cf6'],
    ['#3b82f6', '#06b6d4'],
    ['#10b981', '#14b8a6'],
    ['#f59e0b', '#f97316'],
    ['#ec4899', '#f43f5e'],
  ];

  if (!seed) {
    return `linear-gradient(135deg, ${accentColor}20 0%, ${accentColor}40 100%)`;
  }

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const [from, to] = colors[Math.abs(hash) % colors.length];
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
}

/**
 * Generate CSS background-image value with fallback gradient
 */
export function getBackgroundImageStyle(
  imageUrl: string | undefined,
  fallbackColor: string = '#6366f1'
): React.CSSProperties {
  if (!isValidImageUrl(imageUrl)) {
    return {
      background: getPlaceholderGradient('', fallbackColor),
    };
  }

  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };
}


/**
 * Generate a consistent color based on text (for avatar backgrounds)
 */
export function getColorFromText(text: string | undefined | null, baseColor: string = '#6366f1'): string {
  if (!text || typeof text !== 'string') return baseColor;

  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
    '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#a855f7'
  ];

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}
