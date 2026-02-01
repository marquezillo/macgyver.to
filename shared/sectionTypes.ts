/**
 * Type-safe definitions for all landing page section components
 */

// =============================================================================
// SECTION TYPES
// =============================================================================

export type SectionType =
  | 'hero'
  | 'features'
  | 'testimonials'
  | 'pricing'
  | 'cta'
  | 'stats'
  | 'faq'
  | 'form'
  | 'footer'
  | 'process'
  | 'about'
  | 'gallery'
  | 'logocloud'
  | 'header';

// =============================================================================
// SHARED TYPES
// =============================================================================

export interface BaseStyles {
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
}

export interface ButtonConfig {
  text: string;
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

// =============================================================================
// HERO SECTION
// =============================================================================

export type HeroVariant =
  | 'default'
  | 'centered'
  | 'split'
  | 'split-left'
  | 'split-right'
  | 'minimal'
  | 'gradient'
  | 'video'
  | 'asymmetric';

export interface HeroFloatingCard {
  title?: string;
  description?: string;
  icon?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  value?: string;
  label?: string;
}

export interface HeroContent {
  title?: string;
  subtitle?: string;
  badge?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  secondaryCtaIcon?: string;
  image?: string;
  imageUrl?: string;
  imageAlt?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  videoUrl?: string;
  variant?: HeroVariant;
  showFloatingElements?: boolean;
  floatingElementsVariant?: 'minimal' | 'organic' | 'abundant' | 'geometric' | 'dots' | 'lines';
  trustedBy?: string[];
  trustBadges?: string[];
  stats?: Array<{ value: string; label: string }>;
  floatingCard?: HeroFloatingCard;
  gradientEndColor?: string;
  showScrollIndicator?: boolean;
}

export interface HeroStyles extends BaseStyles {
  gradientFrom?: string;
  gradientTo?: string;
  overlayOpacity?: number;
  backgroundImage?: string;
}

// =============================================================================
// FEATURES SECTION
// =============================================================================

export type FeaturesLayout = 'grid' | 'list' | 'alternating' | 'bento' | 'animated' | 'cards3d' | 'minimal';

export interface Feature {
  title?: string;
  description?: string;
  icon?: string;
  image?: string;
  link?: string;
  size?: 'small' | 'medium' | 'large';
  highlight?: boolean;
}

export interface FeaturesContent {
  title?: string;
  subtitle?: string;
  badge?: string;
  items?: Feature[];
  layout?: FeaturesLayout;
}

export interface FeaturesStyles extends BaseStyles {
  cardBackgroundColor?: string;
}

// =============================================================================
// TESTIMONIALS SECTION
// =============================================================================

export type TestimonialsLayout = 'grid' | 'carousel' | 'featured' | 'video' | 'masonry' | 'minimal';

export interface Testimonial {
  name: string;
  text?: string;
  quote?: string;
  rating?: number;
  image?: string;
  avatar?: string;
  role?: string;
  company?: string;
  videoUrl?: string;
  videoThumbnail?: string;
}

export interface TestimonialsContent {
  title?: string;
  subtitle?: string;
  badge?: string;
  items?: Testimonial[];
  testimonials?: Testimonial[];
  layout?: TestimonialsLayout;
}

export interface TestimonialsStyles extends BaseStyles {
  cardBackground?: string;
}

// =============================================================================
// PRICING SECTION
// =============================================================================

export type PricingLayout = 'cards' | 'horizontal' | 'comparison' | 'minimal' | 'gradient';

export interface PricingPlan {
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

export interface PricingContent {
  title?: string;
  subtitle?: string;
  badge?: string;
  plans?: PricingPlan[];
  layout?: PricingLayout;
  note?: string;
  showToggle?: boolean;
}

export interface PricingStyles extends BaseStyles {
  cardBg?: string;
  highlightedBg?: string;
}

// =============================================================================
// CTA SECTION
// =============================================================================

export interface CTAContent {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  badge?: string;
  // Aliases for backward compatibility
  ctaText?: string;
  secondaryCtaText?: string;
}

export interface CTAStyles extends BaseStyles {
  gradientFrom?: string;
  gradientTo?: string;
  buttonColor?: string;
}

// =============================================================================
// STATS SECTION
// =============================================================================

export interface StatItem {
  value: string;
  label: string;
  icon?: string;
  prefix?: string;
  suffix?: string;
}

export interface StatsContent {
  title?: string;
  subtitle?: string;
  items?: StatItem[];
  layout?: 'row' | 'grid' | 'cards';
}

export interface StatsStyles extends BaseStyles {
  cardBackground?: string;
}

// =============================================================================
// FAQ SECTION
// =============================================================================

export type FAQLayout = 'accordion' | 'grid' | 'columns';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQContent {
  title?: string;
  subtitle?: string;
  badge?: string;
  items?: FAQItem[];
  layout?: FAQLayout;
}

export interface FAQStyles extends BaseStyles {
  cardBackground?: string;
}

// =============================================================================
// FORM SECTION
// =============================================================================

export type FormFieldType = 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea' | 'number';

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export interface FormContent {
  title?: string;
  subtitle?: string;
  fields?: FormField[];
  submitText?: string;
  successMessage?: string;
  webhookUrl?: string;
  saveToDatabase?: boolean;
}

export interface FormStyles extends BaseStyles {
  buttonColor?: string;
  cardBackground?: string;
}

// =============================================================================
// FOOTER SECTION
// =============================================================================

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  platform: string;
  href: string;
}

export interface FooterContent {
  companyName?: string;
  description?: string;
  copyright?: string;
  logo?: string;
  columns?: FooterColumn[];
  socialLinks?: SocialLink[] | {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  showNewsletter?: boolean;
  // Additional contact fields
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
}

export interface FooterStyles extends BaseStyles {
  linkColor?: string;
}

// =============================================================================
// ABOUT SECTION
// =============================================================================

export interface TeamMember {
  name: string;
  role?: string;
  image?: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
}

export interface AboutContent {
  title?: string;
  description?: string;
  badge?: string;
  image?: string;
  imageAlt?: string;
  highlights?: string[];
  ctaText?: string;
  team?: TeamMember[];
  teamTitle?: string;
  teamSubtitle?: string;
}

export interface AboutStyles extends BaseStyles {}

// =============================================================================
// GALLERY SECTION
// =============================================================================

export type GalleryLayout = 'grid' | 'masonry' | 'carousel';

export interface GalleryImage {
  src: string;
  alt?: string;
  caption?: string;
}

export interface GalleryContent {
  title?: string;
  subtitle?: string;
  badge?: string;
  images?: GalleryImage[];
  layout?: GalleryLayout;
  columns?: number;
}

export interface GalleryStyles extends BaseStyles {
  gap?: string;
}

// =============================================================================
// SECTION PROPS
// =============================================================================

export interface BaseSectionProps<T extends SectionType> {
  id: string;
  content: Record<string, unknown>;
  styles?: Record<string, unknown>;
}

export type HeroSectionProps = { id: string; content: HeroContent; styles?: HeroStyles };
export type FeaturesSectionProps = { id: string; content: FeaturesContent; styles?: FeaturesStyles };
export type TestimonialsSectionProps = { id: string; content: TestimonialsContent; styles?: TestimonialsStyles };
export type PricingSectionProps = { id: string; content: PricingContent; styles?: PricingStyles };
export type CTASectionProps = { id: string; content: CTAContent; styles?: CTAStyles };
export type StatsSectionProps = { id: string; content: StatsContent; styles?: StatsStyles };
export type FAQSectionProps = { id: string; content: FAQContent; styles?: FAQStyles };
export type FormSectionProps = { id: string; content: FormContent; styles?: FormStyles; chatId?: number };
export type FooterSectionProps = { id: string; content: FooterContent; styles?: FooterStyles };
export type AboutSectionProps = { id: string; content: AboutContent; styles?: AboutStyles };
export type GallerySectionProps = { id: string; content: GalleryContent; styles?: GalleryStyles };

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getContentItems<T>(content: { items?: T[]; testimonials?: T[]; plans?: T[] }): T[] {
  return content.items || content.testimonials || content.plans || [];
}
