import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { Star, Quote, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface Testimonial {
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

interface TestimonialsSectionProps {
  id: string;
  content: {
    title?: string;
    subtitle?: string;
    badge?: string;
    items?: Testimonial[];
    testimonials?: Testimonial[];
    layout?: 'grid' | 'carousel' | 'featured' | 'video' | 'masonry' | 'minimal';
    autoplay?: boolean;
    autoplayInterval?: number;
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(content?.autoplay !== false);
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
  const autoplayInterval = content?.autoplayInterval || 5000;

  // Carousel autoplay
  useEffect(() => {
    if (layout === 'carousel' && isPlaying && testimonials.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, autoplayInterval);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [layout, isPlaying, testimonials.length, autoplayInterval]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

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

  // Standard testimonial card
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
      <Quote 
        className={cn(
          "absolute top-4 right-4 opacity-10",
          featured ? "w-12 h-12" : "w-8 h-8"
        )}
        style={{ color: styles?.accentColor || '#6366f1' }}
      />

      {testimonial.rating && (
        <div className="mb-4">
          {renderStars(testimonial.rating)}
        </div>
      )}

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

  // Minimal testimonial card (for minimal layout)
  const renderMinimalCard = (testimonial: Testimonial, index: number) => (
    <motion.div
      key={index}
      variants={itemVariants}
      className="text-center py-8"
    >
      <div className="mb-6">
        {renderStars(testimonial.rating || 5)}
      </div>
      <p
        className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed mb-8 max-w-4xl mx-auto"
        style={{ color: styles?.textColor || '#1a1a1a' }}
      >
        "{testimonial.text || testimonial.quote}"
      </p>
      <div className="flex items-center justify-center gap-4">
        {(testimonial.image || testimonial.avatar) && (
          <img
            src={testimonial.image || testimonial.avatar}
            alt={testimonial.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
        <div className="text-left">
          <p className="font-semibold" style={{ color: styles?.textColor }}>
            {testimonial.name}
          </p>
          <p className="text-sm opacity-60" style={{ color: styles?.textColor }}>
            {testimonial.role}{testimonial.role && testimonial.company && ' at '}{testimonial.company}
          </p>
        </div>
      </div>
    </motion.div>
  );

  // Video testimonial card
  const renderVideoCard = (testimonial: Testimonial, index: number) => (
    <motion.div
      key={index}
      variants={itemVariants}
      className={cn(
        "relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer",
        styles?.cardBackground || "bg-white"
      )}
      onClick={() => setActiveVideo(activeVideo === index ? null : index)}
    >
      {/* Video Thumbnail */}
      <div className="relative aspect-video bg-gray-900">
        {testimonial.videoThumbnail ? (
          <img
            src={testimonial.videoThumbnail}
            alt={testimonial.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: styles?.accentColor || '#6366f1' }}
            >
              {(testimonial.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center bg-white/90 group-hover:scale-110 transition-transform"
          >
            <Play className="w-6 h-6 ml-1" style={{ color: styles?.accentColor || '#6366f1' }} />
          </div>
        </div>

        {/* Video Embed (when active) */}
        {activeVideo === index && testimonial.videoUrl && (
          <div className="absolute inset-0 bg-black">
            <iframe
              src={testimonial.videoUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-6">
        {testimonial.rating && (
          <div className="mb-3">
            {renderStars(testimonial.rating)}
          </div>
        )}
        <p
          className="text-sm mb-4 line-clamp-3"
          style={{ color: styles?.textColor ? `${styles.textColor}cc` : '#666' }}
        >
          "{testimonial.text || testimonial.quote}"
        </p>
        <div className="flex items-center gap-3">
          {(testimonial.image || testimonial.avatar) && (
            <img
              src={testimonial.image || testimonial.avatar}
              alt={testimonial.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div>
            <p className="font-semibold text-sm" style={{ color: styles?.textColor }}>
              {testimonial.name}
            </p>
            <p className="text-xs opacity-60" style={{ color: styles?.textColor }}>
              {testimonial.role}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Carousel layout
  const renderCarousel = () => (
    <div className="relative max-w-4xl mx-auto">
      {/* Main Carousel */}
      <div className="overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "p-8 md:p-12 text-center",
              styles?.cardBackground || "bg-white"
            )}
          >
            <Quote 
              className="w-12 h-12 mx-auto mb-6 opacity-20"
              style={{ color: styles?.accentColor || '#6366f1' }}
            />
            
            {testimonials[currentIndex]?.rating && (
              <div className="flex justify-center mb-6">
                {renderStars(testimonials[currentIndex].rating)}
              </div>
            )}

            <p
              className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed mb-8"
              style={{ color: styles?.textColor || '#1a1a1a' }}
            >
              "{testimonials[currentIndex]?.text || testimonials[currentIndex]?.quote}"
            </p>

            <div className="flex items-center justify-center gap-4">
              {(testimonials[currentIndex]?.image || testimonials[currentIndex]?.avatar) ? (
                <img
                  src={testimonials[currentIndex]?.image || testimonials[currentIndex]?.avatar}
                  alt={testimonials[currentIndex]?.name}
                  className="w-14 h-14 rounded-full object-cover ring-4 ring-white shadow-lg"
                />
              ) : (
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center font-semibold text-white text-lg"
                  style={{ backgroundColor: styles?.accentColor || '#6366f1' }}
                >
                  {(testimonials[currentIndex]?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
              <div className="text-left">
                <p className="font-semibold text-lg" style={{ color: styles?.textColor }}>
                  {testimonials[currentIndex]?.name}
                </p>
                <p className="text-sm opacity-60" style={{ color: styles?.textColor }}>
                  {testimonials[currentIndex]?.role}
                  {testimonials[currentIndex]?.role && testimonials[currentIndex]?.company && ', '}
                  {testimonials[currentIndex]?.company}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {testimonials.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            style={{ color: styles?.accentColor || '#6366f1' }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            style={{ color: styles?.accentColor || '#6366f1' }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots & Play/Pause */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <div className="flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex 
                  ? "w-8" 
                  : "opacity-40 hover:opacity-70"
              )}
              style={{ 
                backgroundColor: styles?.accentColor || '#6366f1'
              }}
            />
          ))}
        </div>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-8 h-8 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: styles?.textColor }}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  // Masonry layout
  const renderMasonry = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
    >
      {testimonials.map((testimonial, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className={cn(
            "break-inside-avoid rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all",
            styles?.cardBackground || "bg-white"
          )}
        >
          <Quote 
            className="w-8 h-8 mb-4 opacity-20"
            style={{ color: styles?.accentColor || '#6366f1' }}
          />
          
          {testimonial.rating && (
            <div className="mb-3">
              {renderStars(testimonial.rating)}
            </div>
          )}

          <p
            className="mb-6 leading-relaxed"
            style={{ color: styles?.textColor ? `${styles.textColor}cc` : '#666' }}
          >
            "{testimonial.text || testimonial.quote}"
          </p>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            {(testimonial.image || testimonial.avatar) ? (
              <img
                src={testimonial.image || testimonial.avatar}
                alt={testimonial.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white text-sm"
                style={{ backgroundColor: styles?.accentColor || '#6366f1' }}
              >
                {(testimonial.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
            )}
            <div>
              <p className="font-semibold text-sm" style={{ color: styles?.textColor }}>
                {testimonial.name}
              </p>
              <p className="text-xs opacity-60" style={{ color: styles?.textColor }}>
                {testimonial.role}{testimonial.role && testimonial.company && ', '}{testimonial.company}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
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

        {/* Testimonials by Layout */}
        {layout === 'carousel' ? (
          renderCarousel()
        ) : layout === 'video' ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial, index) => renderVideoCard(testimonial, index))}
          </motion.div>
        ) : layout === 'masonry' ? (
          renderMasonry()
        ) : layout === 'minimal' ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="divide-y divide-gray-200"
          >
            {testimonials.map((testimonial, index) => renderMinimalCard(testimonial, index))}
          </motion.div>
        ) : layout === 'featured' && testimonials.length >= 3 ? (
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
            {testimonials.map((testimonial, index) => 
              renderTestimonialCard(testimonial, index)
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
