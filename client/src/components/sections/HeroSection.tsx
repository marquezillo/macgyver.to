import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Play, ChevronDown, ImageOff } from 'lucide-react';
import { useState } from 'react';

interface HeroSectionProps {
  id: string;
  content: any;
  styles?: any;
}

// Función para validar URLs de imagen
const isValidImageUrl = (url?: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  if (url.trim() === '' || url === 'undefined' || url === 'null') return false;
  if (!url.startsWith('http') && !url.startsWith('/') && !url.startsWith('data:')) return false;
  const badPatterns = ['placeholder.com', 'via.placeholder', 'placehold.it', 'dummyimage.com'];
  return !badPatterns.some(pattern => url.includes(pattern));
};

// Función para asegurar contraste de texto
const ensureContrast = (bgColor?: string, hasImage?: boolean): { textColor: string; subtitleColor: string; badgeBg: string; badgeText: string } => {
  // Si hay imagen de fondo, siempre usar blanco con sombra
  if (hasImage) {
    return {
      textColor: '#ffffff',
      subtitleColor: 'rgba(255,255,255,0.9)',
      badgeBg: 'rgba(255,255,255,0.15)',
      badgeText: '#ffffff'
    };
  }
  
  // Si hay color de fondo, determinar si es oscuro o claro
  if (bgColor) {
    const isLight = isLightColor(bgColor);
    return {
      textColor: isLight ? '#111827' : '#ffffff',
      subtitleColor: isLight ? '#4b5563' : 'rgba(255,255,255,0.8)',
      badgeBg: isLight ? '#6366f120' : 'rgba(255,255,255,0.15)',
      badgeText: isLight ? '#6366f1' : '#ffffff'
    };
  }
  
  // Default: fondo oscuro
  return {
    textColor: '#ffffff',
    subtitleColor: 'rgba(255,255,255,0.8)',
    badgeBg: 'rgba(255,255,255,0.15)',
    badgeText: '#ffffff'
  };
};

// Determinar si un color es claro
const isLightColor = (color: string): boolean => {
  if (!color) return false;
  
  // Convertir hex a RGB
  let r, g, b;
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g);
    if (match) {
      [r, g, b] = match.map(Number);
    } else {
      return false;
    }
  } else {
    return false;
  }
  
  // Calcular luminosidad
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};

// Componente de imagen con fallback para Hero
function HeroImageWithFallback({ 
  src, 
  alt, 
  accentColor,
  className = '',
  isBackground = false
}: { 
  src?: string; 
  alt?: string; 
  accentColor?: string;
  className?: string;
  isBackground?: boolean;
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isValid = isValidImageUrl(src);
  const showFallback = !isValid || hasError;
  const color = accentColor || '#6366f1';

  if (showFallback) {
    if (isBackground) {
      // Para fondos, mostrar gradiente elegante
      return (
        <div 
          className={cn("absolute inset-0", className)}
          style={{ 
            background: `linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)`
          }}
        >
          {/* Decorative elements */}
          <div 
            className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: color }}
          />
          <div 
            className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-10"
            style={{ backgroundColor: color }}
          />
        </div>
      );
    }
    
    // Para imágenes inline
    return (
      <div 
        className={cn(
          "flex flex-col items-center justify-center rounded-2xl",
          className
        )}
        style={{ 
          background: `linear-gradient(135deg, ${color}15, ${color}30)` 
        }}
      >
        <ImageOff className="w-12 h-12 mb-3 opacity-30" style={{ color }} />
        {alt && (
          <span className="text-sm opacity-40" style={{ color }}>{alt}</span>
        )}
      </div>
    );
  }

  if (isBackground) {
    return (
      <>
        {isLoading && (
          <div 
            className="absolute inset-0 animate-pulse"
            style={{ backgroundColor: '#1e293b' }}
          />
        )}
        <div
          className={cn("absolute inset-0 transition-opacity duration-500", isLoading ? 'opacity-0' : 'opacity-100')}
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        <img 
          src={src} 
          alt="" 
          className="hidden" 
          onError={() => setHasError(true)}
          onLoad={() => setIsLoading(false)}
        />
      </>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {isLoading && (
        <div 
          className="absolute inset-0 rounded-2xl animate-pulse"
          style={{ backgroundColor: `${color}20` }}
        />
      )}
      <img
        src={src}
        alt={alt || "Hero image"}
        className={cn(
          "rounded-2xl shadow-2xl w-full h-auto transition-opacity duration-300",
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}

export function HeroSection({ id, content, styles = {} }: HeroSectionProps) {
  const { selectedSectionId, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === id;
  
  const backgroundImage = content?.backgroundImage || content?.imageUrl || styles?.backgroundImage;
  const variant = content?.variant || 'centered';
  const accentColor = styles?.accentColor || '#6366f1';
  
  const hasValidBgImage = isValidImageUrl(backgroundImage) && variant !== 'split';
  const colors = ensureContrast(styles?.backgroundColor, hasValidBgImage);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  // Render centered hero
  const renderCenteredHero = () => (
    <div
      className={cn(
        "relative py-20 md:py-32 lg:py-40 px-4 sm:px-6 lg:px-8 min-h-[500px] md:min-h-[600px]",
        !backgroundImage && "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
      )}
      style={{
        backgroundColor: !backgroundImage ? styles?.backgroundColor : undefined,
      }}
    >
      {/* Background image with fallback */}
      {backgroundImage && (
        <HeroImageWithFallback 
          src={backgroundImage} 
          accentColor={accentColor}
          isBackground={true}
        />
      )}
      
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative max-w-5xl mx-auto text-center flex flex-col justify-center h-full"
      >
        {content?.badge && (
          <motion.span 
            variants={fadeInUp}
            className="inline-block mx-auto px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{ 
              backgroundColor: colors.badgeBg,
              color: colors.badgeText
            }}
          >
            {content.badge}
          </motion.span>
        )}
        
        <motion.h1 
          variants={fadeInUp}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
          style={{ 
            color: colors.textColor,
            textShadow: hasValidBgImage ? '0 4px 12px rgba(0,0,0,0.4)' : undefined
          }}
        >
          {content?.title || "Welcome"}
        </motion.h1>
        
        <motion.p 
          variants={fadeInUp}
          className="mt-6 max-w-3xl mx-auto text-lg md:text-xl lg:text-2xl"
          style={{ color: colors.subtitleColor }}
        >
          {content?.subtitle || "Your subtitle here"}
        </motion.p>
        
        <motion.div 
          variants={fadeInUp}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
        >
          <Button 
            size="lg"
            className="text-lg px-8 py-6 group text-white"
            style={{ backgroundColor: accentColor }}
          >
            {content?.ctaText || "Get Started"}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          {content?.secondaryCtaText && (
            <Button 
              size="lg"
              variant="outline"
              className={cn(
                "text-lg px-8 py-6",
                hasValidBgImage ? "border-white/30 text-white hover:bg-white/10" : "border-gray-300"
              )}
              style={{ 
                color: hasValidBgImage ? '#ffffff' : colors.textColor,
                borderColor: hasValidBgImage ? 'rgba(255,255,255,0.3)' : undefined
              }}
            >
              {content?.secondaryCtaIcon === 'play' && <Play className="mr-2 w-5 h-5" />}
              {content.secondaryCtaText}
            </Button>
          )}
        </motion.div>

        {/* Stats row */}
        {content?.stats && content.stats.length > 0 && (
          <motion.div 
            variants={fadeInUp}
            className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {content.stats.map((stat: any, index: number) => (
              <div key={index} className="text-center">
                <div 
                  className="text-3xl md:text-4xl font-bold"
                  style={{ color: colors.textColor }}
                >
                  {stat.value}
                </div>
                <div 
                  className="text-sm mt-1"
                  style={{ color: colors.subtitleColor }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Scroll indicator */}
        {content?.showScrollIndicator && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ChevronDown 
                className="w-8 h-8"
                style={{ color: `${colors.textColor}80` }}
              />
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );

  const renderSplitHero = () => {
    const splitColors = ensureContrast(styles?.backgroundColor, false);
    const bgIsLight = isLightColor(styles?.backgroundColor || '#ffffff');
    
    return (
      <div
        className="py-16 md:py-24 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: styles?.backgroundColor || '#ffffff' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text Content */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className={content?.imagePosition === 'left' ? 'lg:order-2' : ''}
            >
              {content?.badge && (
                <motion.span 
                  variants={fadeInUp}
                  className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6"
                  style={{ 
                    backgroundColor: `${accentColor}20`,
                    color: accentColor
                  }}
                >
                  {content.badge}
                </motion.span>
              )}
              
              <motion.h1 
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
                style={{ color: splitColors.textColor }}
              >
                {content?.title || "Welcome"}
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="mt-6 text-lg md:text-xl"
                style={{ color: splitColors.subtitleColor }}
              >
                {content?.subtitle || "Your subtitle here"}
              </motion.p>
              
              <motion.div 
                variants={fadeInUp}
                className="mt-8 flex flex-col sm:flex-row gap-4"
              >
                <Button 
                  size="lg"
                  className="text-lg px-8 py-6 group text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  {content?.ctaText || "Get Started"}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                {content?.secondaryCtaText && (
                  <Button 
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6"
                    style={{ 
                      color: splitColors.textColor,
                      borderColor: bgIsLight ? '#d1d5db' : 'rgba(255,255,255,0.3)'
                    }}
                  >
                    {content.secondaryCtaText}
                  </Button>
                )}
              </motion.div>

              {/* Trust badges */}
              {content?.trustBadges && content.trustBadges.length > 0 && (
                <motion.div 
                  variants={fadeInUp}
                  className="mt-10 flex items-center gap-6 flex-wrap"
                >
                  {content.trustBadges.map((badge: string, index: number) => (
                    <span 
                      key={index} 
                      className="text-sm flex items-center gap-2"
                      style={{ color: splitColors.subtitleColor }}
                    >
                      <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">✓</span>
                      {badge}
                    </span>
                  ))}
                </motion.div>
              )}
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: content?.imagePosition === 'left' ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className={cn(
                "relative",
                content?.imagePosition === 'left' ? 'lg:order-1' : ''
              )}
            >
              <HeroImageWithFallback 
                src={backgroundImage}
                alt={content?.imageAlt}
                accentColor={accentColor}
                className="aspect-[4/3]"
              />
              
              {/* Floating card */}
              {content?.floatingCard && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4"
                >
                  <div className="text-2xl font-bold" style={{ color: accentColor }}>
                    {content.floatingCard.value}
                  </div>
                  <div className="text-sm text-gray-500">{content.floatingCard.label}</div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    );
  };

  const renderMinimalHero = () => {
    const minimalColors = ensureContrast(styles?.backgroundColor, false);
    
    return (
      <div
        className="py-24 md:py-32 lg:py-40 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: styles?.backgroundColor || '#ffffff' }}
      >
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h1 
            variants={fadeInUp}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
            style={{ color: minimalColors.textColor }}
          >
            {content?.title || "Welcome"}
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="mt-8 text-xl md:text-2xl max-w-2xl mx-auto"
            style={{ color: minimalColors.subtitleColor }}
          >
            {content?.subtitle || "Your subtitle here"}
          </motion.p>
          
          <motion.div 
            variants={fadeInUp}
            className="mt-12"
          >
            <Button 
              size="lg"
              className="text-lg px-10 py-7 rounded-full group text-white"
              style={{ backgroundColor: accentColor }}
            >
              {content?.ctaText || "Get Started"}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  };

  const renderAsymmetricHero = () => (
    <div
      className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{ backgroundColor: styles?.backgroundColor || '#0a0a0a' }}
    >
      {/* Background gradient */}
      <div 
        className="absolute top-0 right-0 w-1/2 h-full opacity-30"
        style={{ 
          background: `radial-gradient(circle at 70% 30%, ${accentColor}40 0%, transparent 50%)`
        }}
      />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Text - takes 7 columns */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7"
          >
            {content?.badge && (
              <motion.span 
                variants={fadeInUp}
                className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6 border"
                style={{ 
                  borderColor: accentColor,
                  color: accentColor
                }}
              >
                {content.badge}
              </motion.span>
            )}
            
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-white"
            >
              {content?.title || "Welcome"}
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="mt-6 text-lg md:text-xl text-gray-400 max-w-xl"
            >
              {content?.subtitle || "Your subtitle here"}
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <Button 
                size="lg"
                className="text-lg px-8 py-6 group text-white"
                style={{ backgroundColor: accentColor }}
              >
                {content?.ctaText || "Get Started"}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              {content?.secondaryCtaText && (
                <Button 
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 border-gray-700 text-white hover:bg-white/5"
                >
                  {content.secondaryCtaText}
                </Button>
              )}
            </motion.div>
          </motion.div>

          {/* Image - takes 5 columns */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative">
              <HeroImageWithFallback 
                src={backgroundImage}
                alt={content?.imageAlt}
                accentColor={accentColor}
                className="aspect-square"
              />
              {/* Glow effect */}
              <div 
                className="absolute -inset-4 rounded-3xl opacity-20 blur-2xl -z-10"
                style={{ backgroundColor: accentColor }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectSection(id);
      }}
      className={cn(
        "transition-all duration-200",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
    >
      {variant === 'split' && renderSplitHero()}
      {variant === 'minimal' && renderMinimalHero()}
      {variant === 'asymmetric' && renderAsymmetricHero()}
      {(variant === 'centered' || !['split', 'minimal', 'asymmetric'].includes(variant)) && renderCenteredHero()}
    </div>
  );
}
