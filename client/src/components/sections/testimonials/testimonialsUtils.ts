import { isLightColor } from '@/lib/colorUtils';
import type { Testimonial, TestimonialsContent, TestimonialsStyles } from '@shared/sectionTypes';

/**
 * Extended testimonial with video support
 */
export interface ExtendedTestimonial extends Testimonial {
  videoThumbnail?: string;
}

/**
 * Extended testimonials content with autoplay options
 */
export interface ExtendedTestimonialsContent extends TestimonialsContent {
  autoplay?: boolean;
  autoplayInterval?: number;
}

/**
 * Hardcoded card text colors for consistent readability
 * Cards always have white/light background
 */
export const CARD_TEXT_COLORS = {
  name: '#1f2937',      // gray-800 - always visible
  quote: '#374151',     // gray-700 - always visible
  role: '#6b7280',      // gray-500 - always visible
};

/**
 * Default testimonials when none provided
 */
export const defaultTestimonials: Testimonial[] = [
  {
    name: 'María García',
    text: 'Excelente servicio, superó todas mis expectativas. Lo recomiendo totalmente.',
    rating: 5,
    role: 'CEO',
    company: 'Tech Solutions'
  },
  {
    name: 'Carlos Rodríguez',
    text: 'Profesionales y eficientes. El mejor equipo con el que he trabajado.',
    rating: 5,
    role: 'Director',
    company: 'Marketing Pro'
  },
  {
    name: 'Ana Martínez',
    text: 'Resultados increíbles en tiempo récord. Definitivamente volveré a contratar.',
    rating: 5,
    role: 'Fundadora',
    company: 'StartupX'
  }
];

/**
 * Animation variants for testimonial cards
 */
export const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

/**
 * Get section title/subtitle colors based on background
 */
export const getSectionColors = (backgroundColor?: string) => {
  const isLight = isLightColor(backgroundColor);
  return {
    titleColor: isLight ? '#111827' : '#ffffff',
    subtitleColor: isLight ? '#4b5563' : 'rgba(255,255,255,0.8)'
  };
};

/**
 * Get testimonials from content with fallback to defaults
 */
export const getTestimonials = (content: ExtendedTestimonialsContent): Testimonial[] => {
  const rawTestimonials = content?.items || content?.testimonials || [];
  return (Array.isArray(rawTestimonials) && rawTestimonials.length > 0) 
    ? rawTestimonials 
    : defaultTestimonials;
};
