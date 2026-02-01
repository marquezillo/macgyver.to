import { isLightColor } from '@/lib/colorUtils';

/**
 * Pricing plan interface
 */
export interface Plan {
  name: string;
  price: string;
  annualPrice?: string;
  period?: string;
  description?: string;
  features?: string[];
  notIncluded?: string[];
  ctaText?: string;
  highlighted?: boolean;
  badge?: string;
  icon?: string;
}

/**
 * Pricing section content interface
 */
export interface PricingContent {
  title?: string;
  subtitle?: string;
  badge?: string;
  plans?: Plan[];
  layout?: 'cards' | 'horizontal' | 'comparison' | 'minimal' | 'gradient';
  note?: string;
  showToggle?: boolean;
  comparisonFeatures?: string[];
}

/**
 * Pricing section styles interface
 */
export interface PricingStyles {
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  cardBg?: string;
  highlightedBg?: string;
}

/**
 * Default plans for pricing section
 */
export const defaultPlans: Plan[] = [
  {
    name: 'Starter',
    price: '$29',
    annualPrice: '$24',
    period: '/month',
    description: 'Perfect for individuals and small projects',
    features: ['5 Projects', '10GB Storage', 'Email Support', 'Basic Analytics'],
    notIncluded: ['Priority Support', 'Custom Domain', 'API Access'],
    ctaText: 'Get Started',
    highlighted: false
  },
  {
    name: 'Professional',
    price: '$79',
    annualPrice: '$66',
    period: '/month',
    description: 'Best for growing businesses',
    features: ['Unlimited Projects', '100GB Storage', 'Priority Support', 'Advanced Analytics', 'Custom Domain', 'API Access'],
    notIncluded: [],
    ctaText: 'Start Free Trial',
    highlighted: true,
    badge: 'Most Popular'
  },
  {
    name: 'Enterprise',
    price: '$199',
    annualPrice: '$166',
    period: '/month',
    description: 'For large organizations',
    features: ['Everything in Pro', 'Unlimited Storage', 'Dedicated Support', 'Custom Integrations', 'SLA Guarantee', 'On-premise Option'],
    notIncluded: [],
    ctaText: 'Contact Sales',
    highlighted: false
  }
];

/**
 * Animation variants for pricing cards
 */
export const cardVariants = {
  hidden: { opacity: 0, y: 30 },
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
 * Get contrast-aware text color
 */
export const getTextColor = (bgColor?: string, defaultColor = '#1f2937') => {
  if (!bgColor) return defaultColor;
  return isLightColor(bgColor) ? '#1f2937' : '#ffffff';
};

/**
 * Get muted text color based on background
 */
export const getMutedTextColor = (bgColor?: string) => {
  if (!bgColor) return '#6b7280';
  return isLightColor(bgColor) ? '#6b7280' : '#9ca3af';
};
