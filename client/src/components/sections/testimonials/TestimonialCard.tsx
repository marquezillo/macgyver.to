import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Star, Quote } from 'lucide-react';
import { AvatarWithFallback } from '@/components/ui/AvatarWithFallback';
import type { Testimonial, TestimonialsStyles } from '@shared/sectionTypes';
import { CARD_TEXT_COLORS, cardVariants } from './testimonialsUtils';

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
  featured?: boolean;
  styles?: TestimonialsStyles;
}

/**
 * Render star rating
 */
export function StarRating({ rating = 5 }: { rating?: number }) {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            "w-4 h-4",
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          )}
        />
      ))}
    </div>
  );
}

/**
 * Standard testimonial card with hardcoded colors for readability
 */
export function TestimonialCard({ 
  testimonial, 
  index, 
  featured = false, 
  styles 
}: TestimonialCardProps) {
  return (
    <motion.div
      key={index}
      variants={cardVariants}
      className={cn(
        "relative rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 bg-white",
        featured ? "p-8 md:p-10" : "p-6"
      )}
      style={{ backgroundColor: styles?.cardBackground || '#ffffff' }}
    >
      <Quote 
        className={cn(
          "absolute top-4 right-4 opacity-10",
          featured ? "w-12 h-12" : "w-8 h-8"
        )}
        style={{ color: styles?.accentColor || '#6366f1' }}
      />

      {testimonial.rating && (
        <div className="mb-4">
          <StarRating rating={testimonial.rating} />
        </div>
      )}

      <p
        className={cn(
          "mb-6 leading-relaxed",
          featured ? "text-lg md:text-xl" : "text-base"
        )}
        style={{ color: CARD_TEXT_COLORS.quote }}
      >
        "{testimonial.text || testimonial.quote || 'Great experience!'}"
      </p>

      <div className="flex items-center gap-4">
        <AvatarWithFallback
          src={testimonial.image || testimonial.avatar}
          name={testimonial.name}
          size={featured ? 'lg' : 'md'}
          accentColor={styles?.accentColor || '#6366f1'}
        />
        <div>
          <p
            className={cn(
              "font-semibold",
              featured ? "text-lg" : ""
            )}
            style={{ color: CARD_TEXT_COLORS.name }}
          >
            {testimonial.name}
          </p>
          {(testimonial.role || testimonial.company) && (
            <p
              className="text-sm"
              style={{ color: CARD_TEXT_COLORS.role }}
            >
              {testimonial.role}{testimonial.role && testimonial.company && ', '}{testimonial.company}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Minimal testimonial card variant
 */
export function MinimalTestimonialCard({ 
  testimonial, 
  index, 
  styles 
}: Omit<TestimonialCardProps, 'featured'>) {
  return (
    <motion.div
      key={index}
      variants={cardVariants}
      className="text-center p-6"
    >
      <p
        className="text-lg italic mb-6"
        style={{ color: CARD_TEXT_COLORS.quote }}
      >
        "{testimonial.text || testimonial.quote || 'Great experience!'}"
      </p>
      <div className="flex flex-col items-center gap-2">
        <AvatarWithFallback
          src={testimonial.image || testimonial.avatar}
          name={testimonial.name}
          size="md"
          accentColor={styles?.accentColor || '#6366f1'}
        />
        <p
          className="font-semibold"
          style={{ color: CARD_TEXT_COLORS.name }}
        >
          {testimonial.name}
        </p>
        {(testimonial.role || testimonial.company) && (
          <p
            className="text-sm"
            style={{ color: CARD_TEXT_COLORS.role }}
          >
            {testimonial.role}{testimonial.role && testimonial.company && ', '}{testimonial.company}
          </p>
        )}
      </div>
    </motion.div>
  );
}
