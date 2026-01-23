import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

interface Testimonial {
  name: string;
  text?: string;
  quote?: string;
  rating?: number;
  image?: string;
  avatar?: string;
  role?: string;
  company?: string;
}

interface TestimonialsSectionProps {
  id: string;
  content: {
    title?: string;
    subtitle?: string;
    badge?: string;
    items?: Testimonial[];
    testimonials?: Testimonial[];
    layout?: 'grid' | 'carousel' | 'featured';
  };
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    cardBackground?: string;
    accentColor?: string;
  };
}

export function TestimonialsSection({ id, content, styles = {} }: TestimonialsSectionProps) {
  const { selectedSectionId, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === id;

  const rawTestimonials = content?.items || content?.testimonials || [];
  const testimonials = (Array.isArray(rawTestimonials) && rawTestimonials.length > 0) ? rawTestimonials : [
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

  const layout = content?.layout || 'grid';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const renderStars = (rating: number = 5) => {
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
  };

  const renderTestimonialCard = (testimonial: Testimonial, index: number, featured = false) => (
    <motion.div
      key={index}
      variants={itemVariants}
      className={cn(
        "relative rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300",
        featured ? "p-8 md:p-10" : "p-6",
        styles?.cardBackground || "bg-white"
      )}
    >
      {/* Quote Icon */}
      <Quote 
        className={cn(
          "absolute top-4 right-4 opacity-10",
          featured ? "w-12 h-12" : "w-8 h-8"
        )}
        style={{ color: styles?.accentColor || '#6366f1' }}
      />

      {/* Rating */}
      {testimonial.rating && (
        <div className="mb-4">
          {renderStars(testimonial.rating)}
        </div>
      )}

      {/* Testimonial Text */}
      <p
        className={cn(
          "mb-6 leading-relaxed",
          featured ? "text-lg md:text-xl" : "text-base",
          styles?.textColor ? "opacity-80" : "text-gray-600"
        )}
        style={{ color: styles?.textColor }}
      >
        "{testimonial.text || testimonial.quote || 'Great experience!'}"
      </p>

      {/* Author Info */}
      <div className="flex items-center gap-4">
        {(testimonial.image || testimonial.avatar) ? (
          <img
            src={testimonial.image || testimonial.avatar}
            alt={testimonial.name}
            className={cn(
              "rounded-full object-cover ring-2 ring-white shadow",
              featured ? "w-14 h-14" : "w-12 h-12"
            )}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div 
            className={cn(
              "rounded-full flex items-center justify-center font-semibold text-white",
              featured ? "w-14 h-14 text-lg" : "w-12 h-12"
            )}
            style={{ backgroundColor: styles?.accentColor || '#6366f1' }}
          >
            {(testimonial.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
        )}
        <div>
          <p
            className={cn(
              "font-semibold",
              featured ? "text-lg" : "",
              styles?.textColor || "text-gray-900"
            )}
          >
            {testimonial.name}
          </p>
          {(testimonial.role || testimonial.company) && (
            <p
              className={cn(
                "text-sm",
                styles?.textColor ? "opacity-60" : "text-gray-500"
              )}
              style={{ color: styles?.textColor }}
            >
              {testimonial.role}{testimonial.role && testimonial.company && ', '}{testimonial.company}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectSection(id);
      }}
      className={cn(
        "relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 transition-all duration-200",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      style={{ backgroundColor: styles?.backgroundColor || '#f9fafb' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          {content?.badge && (
            <span 
              className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
              style={{ 
                backgroundColor: styles?.accentColor ? `${styles.accentColor}20` : '#6366f120',
                color: styles?.accentColor || '#6366f1'
              }}
            >
              {content.badge}
            </span>
          )}
          <h2
            className={cn(
              "text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight",
              styles?.textColor || "text-gray-900"
            )}
          >
            {content?.title || "Lo que dicen nuestros clientes"}
          </h2>
          {content?.subtitle && (
            <p
              className={cn(
                "mt-4 text-lg max-w-2xl mx-auto",
                styles?.textColor ? "opacity-70" : "text-gray-600"
              )}
              style={{ color: styles?.textColor }}
            >
              {content.subtitle}
            </p>
          )}
        </motion.div>

        {/* Testimonials */}
        {layout === 'featured' && testimonials.length >= 3 ? (
          // Featured layout: 1 large + 2 small
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-6"
          >
            <div className="lg:row-span-2">
              {renderTestimonialCard(testimonials[0], 0, true)}
            </div>
            <div className="space-y-6">
              {renderTestimonialCard(testimonials[1], 1)}
              {renderTestimonialCard(testimonials[2], 2)}
            </div>
          </motion.div>
        ) : (
          // Grid layout
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={cn(
              "grid gap-6 md:gap-8",
              testimonials.length === 2 ? "md:grid-cols-2" :
              testimonials.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" :
              "md:grid-cols-2 lg:grid-cols-3"
            )}
          >
            {testimonials.map((testimonial: Testimonial, index: number) => 
              renderTestimonialCard(testimonial, index)
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
