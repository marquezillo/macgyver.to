import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  text?: string;
  quote?: string;  // Alias de text
  rating?: number;
  image?: string;
  avatar?: string;  // Alias de image
  role?: string;
  company?: string;
}

interface TestimonialsSectionProps {
  id: string;
  content: {
    title?: string;
    subtitle?: string;
    items?: Testimonial[];
    testimonials?: Testimonial[];  // Alias de items
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

  // Los testimonials pueden venir como content.items, content.testimonials, o directamente en content
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

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectSection(id);
      }}
      className={cn(
        "relative py-10 md:py-16 px-4 sm:px-6 lg:px-8 transition-all duration-200",
        isSelected && "ring-2 ring-primary ring-offset-2",
        styles?.backgroundColor || "bg-gray-50"
      )}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2
            className={cn(
              "text-2xl md:text-3xl font-bold tracking-tight sm:text-4xl",
              styles?.textColor || "text-gray-900"
            )}
          >
            {content?.title || "Lo que dicen nuestros clientes"}
          </h2>
          {content?.subtitle && (
            <p
              className={cn(
                "mt-4 text-lg max-w-2xl mx-auto",
                styles?.textColor ? "opacity-80" : "text-gray-600"
              )}
              style={{ color: styles?.textColor }}
            >
              {content.subtitle}
            </p>
          )}
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial: Testimonial, index: number) => (
            <div
              key={index}
              className={cn(
                "relative p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300",
                styles?.cardBackground || "bg-white"
              )}
            >
              {/* Quote Icon */}
              <Quote 
                className={cn(
                  "absolute top-4 right-4 w-8 h-8 opacity-10",
                  styles?.accentColor || "text-primary"
                )}
                style={{ color: styles?.accentColor }}
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
                  "text-base mb-6 leading-relaxed",
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
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = 'w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold';
                        fallback.textContent = (testimonial.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase();
                        parent.insertBefore(fallback, target);
                      }
                    }}
                  />
                ) : (
                  <div 
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white",
                      styles?.accentColor ? "" : "bg-primary"
                    )}
                    style={{ backgroundColor: styles?.accentColor }}
                  >
                    {(testimonial.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                )}
                <div>
                  <p
                    className={cn(
                      "font-semibold",
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
