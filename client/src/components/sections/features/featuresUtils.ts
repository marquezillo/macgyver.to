import { isLightColor } from '@/lib/colorUtils';
import type { Feature, FeaturesContent, FeaturesStyles } from '@shared/sectionTypes';

/**
 * Animation variants for feature cards
 */
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

/**
 * Default features when none provided
 */
export const defaultFeatures: Feature[] = [
  {
    icon: 'zap',
    title: 'Lightning Fast',
    description: 'Optimized performance for the best user experience'
  },
  {
    icon: 'shield',
    title: 'Secure by Default',
    description: 'Enterprise-grade security built into every layer'
  },
  {
    icon: 'sparkles',
    title: 'AI Powered',
    description: 'Smart features that learn and adapt to your needs'
  },
  {
    icon: 'globe',
    title: 'Global Scale',
    description: 'Deploy anywhere with our worldwide infrastructure'
  }
];

/**
 * Get features from content with fallback to defaults
 */
export const getFeatures = (content: FeaturesContent): Feature[] => {
  const rawFeatures = content?.items || [];
  return (Array.isArray(rawFeatures) && rawFeatures.length > 0) 
    ? rawFeatures 
    : defaultFeatures;
};

/**
 * Get section colors based on background
 */
export const getSectionColors = (backgroundColor?: string) => {
  const isLight = isLightColor(backgroundColor);
  return {
    titleColor: isLight ? '#111827' : '#ffffff',
    subtitleColor: isLight ? '#4b5563' : 'rgba(255,255,255,0.8)',
    textColor: isLight ? '#374151' : '#e5e7eb'
  };
};

/**
 * Get card colors based on card background
 */
export const getCardColors = (cardBackground?: string) => {
  const isLight = isLightColor(cardBackground);
  return {
    titleColor: isLight ? '#111827' : '#ffffff',
    descriptionColor: isLight ? '#6b7280' : '#9ca3af'
  };
};
