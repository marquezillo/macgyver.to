import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { LogoCloudContent, LogoCloudStyles, LogoItem } from '@shared/sectionTypes';

interface LogoCloudSectionProps {
  id: string;
  content: LogoCloudContent;
  styles?: LogoCloudStyles;
}

// Default placeholder logos (using text-based placeholders)
const defaultLogos = [
  { name: 'Acme Corp', src: '' },
  { name: 'TechStart', src: '' },
  { name: 'GlobalCo', src: '' },
  { name: 'InnovateLab', src: '' },
  { name: 'FutureTech', src: '' },
  { name: 'DataFlow', src: '' },
];

export function LogoCloudSection({ id, content, styles = {} }: LogoCloudSectionProps) {
  const { selectedSectionId, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === id;

  const logos = content?.logos || defaultLogos;
  const variant = content?.variant || 'grid'; // grid, marquee, simple

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  // Marquee animation
  const marqueeVariants = {
    animate: {
      x: [0, -1920],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop" as const,
          duration: 30,
          
        },
      },
    },
  };

  const renderLogo = (logo: LogoItem, index: number) => (
    <div
      key={index}
      className={cn(
        "flex items-center justify-center p-4 md:p-6 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300",
        variant === 'marquee' && "flex-shrink-0 mx-8"
      )}
    >
      {logo.src ? (
        <img
          src={logo.src}
          alt={logo.name || `Partner ${index + 1}`}
          className="h-8 md:h-12 w-auto object-contain"
        />
      ) : (
        <div 
          className={cn(
            "h-10 md:h-12 px-6 flex items-center justify-center rounded-lg font-bold text-lg md:text-xl",
            styles?.textColor ? "" : "text-gray-400"
          )}
          style={{ color: styles?.textColor }}
        >
          {logo.name}
        </div>
      )}
    </div>
  );

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectSection(id);
      }}
      className={cn(
        "py-12 md:py-16 px-4 sm:px-6 lg:px-8 transition-all duration-200 overflow-hidden",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      style={{ backgroundColor: styles?.backgroundColor || '#ffffff' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {(content?.title || content?.subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            {content?.title && (
              <h2 
                className={cn(
                  "text-xl md:text-2xl font-semibold tracking-tight",
                  styles?.textColor || "text-gray-600"
                )}
              >
                {content.title}
              </h2>
            )}
            {content?.subtitle && (
              <p 
                className={cn(
                  "mt-2 text-sm",
                  styles?.textColor ? "opacity-60" : "text-gray-400"
                )}
                style={{ color: styles?.textColor }}
              >
                {content.subtitle}
              </p>
            )}
          </motion.div>
        )}

        {/* Logo Display */}
        {variant === 'marquee' ? (
          // Marquee variant - infinite scroll
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" 
                 style={{ background: `linear-gradient(to right, ${styles?.backgroundColor || '#ffffff'}, transparent)` }} />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10"
                 style={{ background: `linear-gradient(to left, ${styles?.backgroundColor || '#ffffff'}, transparent)` }} />
            
            <motion.div
              variants={marqueeVariants}
              animate="animate"
              className="flex"
            >
              {/* Duplicate logos for seamless loop */}
              {[...logos, ...logos, ...logos].map((logo: LogoItem, index: number) => renderLogo(logo, index))}
            </motion.div>
          </div>
        ) : variant === 'simple' ? (
          // Simple variant - single row centered
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-8 md:gap-12"
          >
            {logos.map((logo: LogoItem, index: number) => (
              <motion.div key={index} variants={itemVariants}>
                {renderLogo(logo, index)}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          // Grid variant - responsive grid
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={cn(
              "grid gap-4",
              logos.length <= 4 ? "grid-cols-2 md:grid-cols-4" :
              logos.length <= 6 ? "grid-cols-3 md:grid-cols-6" :
              "grid-cols-4 md:grid-cols-8"
            )}
          >
            {logos.map((logo: LogoItem, index: number) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="flex items-center justify-center"
              >
                {renderLogo(logo, index)}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Optional CTA */}
        {content?.ctaText && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <a 
              href={content.ctaLink || '#'}
              className={cn(
                "text-sm font-medium hover:underline",
                styles?.accentColor ? "" : "text-primary"
              )}
              style={{ color: styles?.accentColor }}
            >
              {content.ctaText} →
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
}
