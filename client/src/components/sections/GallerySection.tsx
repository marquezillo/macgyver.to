import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface GallerySectionProps {
  id: string;
  content: any;
  styles?: any;
}

export function GallerySection({ id, content, styles = {} }: GallerySectionProps) {
  const { selectedSectionId, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === id;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = content?.images || [
    { src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', alt: 'Gallery image 1', caption: 'Modern workspace' },
    { src: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800', alt: 'Gallery image 2', caption: 'Team collaboration' },
    { src: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800', alt: 'Gallery image 3', caption: 'Creative office' },
    { src: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800', alt: 'Gallery image 4', caption: 'Innovation hub' },
    { src: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800', alt: 'Gallery image 5', caption: 'Meeting room' },
    { src: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800', alt: 'Gallery image 6', caption: 'Open space' },
  ];

  const layout = content?.layout || 'grid'; // grid, masonry, carousel

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectSection(id);
      }}
      className={cn(
        "py-16 md:py-24 px-4 sm:px-6 lg:px-8 transition-all duration-200",
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
          <h2 
            className={cn(
              "text-3xl md:text-4xl font-bold tracking-tight",
              styles?.textColor || "text-gray-900"
            )}
          >
            {content?.title || "Our Gallery"}
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

        {/* Gallery Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={cn(
            "grid gap-4",
            layout === 'masonry' 
              ? "columns-2 md:columns-3 lg:columns-4 space-y-4" 
              : images.length <= 4 
                ? "grid-cols-2 md:grid-cols-4" 
                : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          )}
        >
          {images.map((image: any, index: number) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={cn(
                "group relative overflow-hidden rounded-xl cursor-pointer",
                layout === 'masonry' ? "break-inside-avoid mb-4" : "aspect-square"
              )}
              onClick={(e) => {
                e.stopPropagation();
                openLightbox(index);
              }}
            >
              <img
                src={image.src}
                alt={image.alt || `Gallery image ${index + 1}`}
                className={cn(
                  "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110",
                  layout !== 'masonry' && "absolute inset-0"
                )}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <ZoomIn className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Caption */}
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-sm font-medium">{image.caption}</p>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Navigation */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 p-2 text-white/70 hover:text-white transition-colors z-10"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
            >
              <ChevronRight className="w-10 h-10" />
            </button>

            {/* Image */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl max-h-[85vh] px-16"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[currentIndex].src}
                alt={images[currentIndex].alt}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              {images[currentIndex].caption && (
                <p className="text-white text-center mt-4 text-lg">
                  {images[currentIndex].caption}
                </p>
              )}
            </motion.div>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
