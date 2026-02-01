import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { Star, Quote, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { AvatarWithFallback } from '@/components/ui/AvatarWithFallback';
import { isLightColor } from '@/lib/colorUtils';
import type { TestimonialsStyles, Testimonial } from '@shared/sectionTypes';
import {
  TestimonialCard,
  MinimalTestimonialCard,
  StarRating,
  type ExtendedTestimonialsContent,
  CARD_TEXT_COLORS,
  defaultTestimonials,
  cardVariants,
  getSectionColors,
  getTestimonials
} from './testimonials';

interface TestimonialsSectionProps {
  id: string;
  content: ExtendedTestimonialsContent;
  styles?: TestimonialsStyles;
}

export function TestimonialsSection({ id, content, styles = {} }: TestimonialsSectionProps) {
  const { selectedSectionId, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === id;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(content?.autoplay !== false);
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const testimonials = getTestimonials(content);

  const layout = content?.layout || 'grid';
  const autoplayInterval = content?.autoplayInterval || 5000;
  
  // Get section colors based on background
  const { titleColor: sectionTitleColor, subtitleColor: sectionSubtitleColor } = getSectionColors(styles?.backgroundColor);

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

  // Standard testimonial card - COLORES HARDCODEADOS
  const renderTestimonialCard = (testimonial: Testimonial, index: number, featured = false) => (
    <motion.div
      key={index}
      variants={itemVariants}
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
          {renderStars(testimonial.rating)}
        </div>
      )}

      {/* QUOTE - SIEMPRE COLOR OSCURO HARDCODEADO */}
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
          {/* NAME - SIEMPRE COLOR OSCURO HARDCODEADO */}
          <p
            className={cn(
              "font-semibold",
              featured ? "text-lg" : ""
            )}
            style={{ color: CARD_TEXT_COLORS.name }}
          >
            {testimonial.name}
          </p>
          {/* ROLE - SIEMPRE COLOR GRIS MEDIO HARDCODEADO */}
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

  // Minimal testimonial card - COLORES HARDCODEADOS
  const renderMinimalCard = (testimonial: Testimonial, index: number) => (
    <motion.div
      key={index}
      variants={itemVariants}
      className="text-center py-8"
    >
      <div className="mb-6 flex justify-center">
        {renderStars(testimonial.rating || 5)}
      </div>
      {/* QUOTE - SIEMPRE OSCURO */}
      <p
        className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed mb-8 max-w-4xl mx-auto"
        style={{ color: CARD_TEXT_COLORS.quote }}
      >
        "{testimonial.text || testimonial.quote}"
      </p>
      <div className="flex items-center justify-center gap-4">
        <AvatarWithFallback
          src={testimonial.image || testimonial.avatar}
          name={testimonial.name}
          size="md"
          accentColor={styles?.accentColor || '#6366f1'}
        />
        <div className="text-left">
          {/* NAME - SIEMPRE OSCURO */}
          <p className="font-semibold" style={{ color: CARD_TEXT_COLORS.name }}>
            {testimonial.name}
          </p>
          {/* ROLE - SIEMPRE GRIS */}
          <p className="text-sm" style={{ color: CARD_TEXT_COLORS.role }}>
            {testimonial.role}{testimonial.role && testimonial.company && ' at '}{testimonial.company}
          </p>
        </div>
      </div>
    </motion.div>
  );

  // Video testimonial card - COLORES HARDCODEADOS
  const renderVideoCard = (testimonial: Testimonial, index: number) => (
    <motion.div
      key={index}
      variants={itemVariants}
      className="relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer bg-white"
      style={{ backgroundColor: styles?.cardBackground || '#ffffff' }}
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
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xl"
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

      {/* Info - COLORES HARDCODEADOS */}
      <div className="p-6">
        {testimonial.rating && (
          <div className="mb-3">
            {renderStars(testimonial.rating)}
          </div>
        )}
        {/* QUOTE - SIEMPRE OSCURO */}
        <p
          className="text-sm mb-4 line-clamp-3"
          style={{ color: CARD_TEXT_COLORS.quote }}
        >
          "{testimonial.text || testimonial.quote}"
        </p>
        <div className="flex items-center gap-3">
          <AvatarWithFallback
            src={testimonial.image || testimonial.avatar}
            name={testimonial.name}
            size="sm"
            accentColor={styles?.accentColor || '#6366f1'}
            className="w-10 h-10"
          />
          <div>
            {/* NAME - SIEMPRE OSCURO */}
            <p className="font-semibold text-sm" style={{ color: CARD_TEXT_COLORS.name }}>
              {testimonial.name}
            </p>
            {/* ROLE - SIEMPRE GRIS */}
            <p className="text-xs" style={{ color: CARD_TEXT_COLORS.role }}>
              {testimonial.role}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Carousel layout - COLORES HARDCODEADOS
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
            className="p-8 md:p-12 text-center bg-white"
            style={{ backgroundColor: styles?.cardBackground || '#ffffff' }}
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

            {/* QUOTE - SIEMPRE OSCURO */}
            <p
              className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed mb-8"
              style={{ color: CARD_TEXT_COLORS.quote }}
            >
              "{testimonials[currentIndex]?.text || testimonials[currentIndex]?.quote}"
            </p>

            <div className="flex items-center justify-center gap-4">
              <AvatarWithFallback
                src={testimonials[currentIndex]?.image || testimonials[currentIndex]?.avatar}
                name={testimonials[currentIndex]?.name || 'User'}
                size="lg"
                accentColor={styles?.accentColor || '#6366f1'}
                className="ring-4 ring-white shadow-lg"
              />
              <div className="text-left">
                {/* NAME - SIEMPRE OSCURO */}
                <p className="font-semibold text-lg" style={{ color: CARD_TEXT_COLORS.name }}>
                  {testimonials[currentIndex]?.name}
                </p>
                {/* ROLE - SIEMPRE GRIS */}
                <p className="text-sm" style={{ color: CARD_TEXT_COLORS.role }}>
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
          style={{ color: sectionTitleColor }}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  // Masonry layout - COLORES HARDCODEADOS
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
          className="break-inside-avoid rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all bg-white"
          style={{ backgroundColor: styles?.cardBackground || '#ffffff' }}
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

          {/* QUOTE - SIEMPRE OSCURO */}
          <p
            className="mb-6 leading-relaxed"
            style={{ color: CARD_TEXT_COLORS.quote }}
          >
            "{testimonial.text || testimonial.quote}"
          </p>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <AvatarWithFallback
              src={testimonial.image || testimonial.avatar}
              name={testimonial.name}
              size="sm"
              accentColor={styles?.accentColor || '#6366f1'}
              className="w-10 h-10"
            />
            <div>
              {/* NAME - SIEMPRE OSCURO */}
              <p className="font-semibold text-sm" style={{ color: CARD_TEXT_COLORS.name }}>
                {testimonial.name}
              </p>
              {/* ROLE - SIEMPRE GRIS */}
              <p className="text-xs" style={{ color: CARD_TEXT_COLORS.role }}>
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
        {/* Header - USA COLORES CALCULADOS SEGÚN FONDO DE SECCIÓN */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10 md:mb-12"
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
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight"
            style={{ color: sectionTitleColor }}
          >
            {content?.title || "Lo que dicen nuestros clientes"}
          </h2>
          {content?.subtitle && (
            <p
              className="mt-4 text-lg max-w-2xl mx-auto"
              style={{ color: sectionSubtitleColor }}
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
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
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
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
              "grid gap-4 sm:gap-6 md:gap-8",
              testimonials.length === 2 ? "grid-cols-1 sm:grid-cols-2" :
              testimonials.length === 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" :
              "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
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
