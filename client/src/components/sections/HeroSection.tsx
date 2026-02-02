import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Play, ChevronDown } from 'lucide-react';
import { FloatingElements } from '@/components/ui/FloatingElements';
import { isLightColor } from '@/lib/colorUtils';
import { isValidImageUrl, isValidVideoUrl } from '@/lib/imageUtils';
import type { HeroContent, HeroStyles, StatItem } from '@shared/sectionTypes';
import { HeroImageWithFallback, VideoBackground, fadeInUp, staggerContainer, ensureContrast } from './hero';

interface HeroSectionProps {
  id: string;
  content: HeroContent;
  styles?: HeroStyles;
}

export function HeroSection({ id, content, styles = {} }: HeroSectionProps) {
  const { selectedSectionId, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === id;
  
  const backgroundImage = content?.backgroundImage || content?.imageUrl || styles?.backgroundImage;
  const videoUrl = content?.videoUrl || content?.backgroundVideo;
  const variant = content?.variant || 'centered';
  const accentColor = styles?.accentColor || '#6366f1';
  
  const hasValidBgImage = isValidImageUrl(backgroundImage) && !['split', 'split-left', 'split-right'].includes(variant);
  const hasValidVideo = isValidVideoUrl(videoUrl);
  const colors = ensureContrast(styles?.backgroundColor, hasValidBgImage || hasValidVideo);

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

  // Render Hero con Video de Fondo
  const renderVideoHero = () => (
    <div className="relative py-20 md:py-32 lg:py-40 px-4 sm:px-6 lg:px-8 min-h-[600px] md:min-h-[700px] overflow-hidden">
      <VideoBackground 
        src={videoUrl} 
        poster={backgroundImage}
        accentColor={accentColor}
      />
      
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto text-center flex flex-col justify-center h-full"
      >
        {content?.badge && (
          <motion.span 
            variants={fadeInUp}
            className="inline-block mx-auto px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm"
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: '#ffffff'
            }}
          >
            {content.badge}
          </motion.span>
        )}
        
        <motion.h1 
          variants={fadeInUp}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight text-white"
          style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
        >
          {content?.title || "Welcome"}
        </motion.h1>
        
        <motion.p 
          variants={fadeInUp}
          className="mt-6 max-w-3xl mx-auto text-lg md:text-xl lg:text-2xl text-white/90"
        >
          {content?.subtitle || "Your subtitle here"}
        </motion.p>
        
        <motion.div 
          variants={fadeInUp}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
        >
          <Button 
            size="lg"
            className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 group text-white"
            style={{ backgroundColor: accentColor }}
          >
            {content?.ctaText || "Get Started"}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          {content?.secondaryCtaText && (
            <Button 
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
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
            className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-2xl mx-auto"
          >
            {content.stats.map((stat: StatItem, index: number) => (
              <div key={index} className="text-center backdrop-blur-sm bg-white/5 rounded-xl p-4">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm mt-1 text-white/70">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );

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
      {backgroundImage && (
        <HeroImageWithFallback 
          src={backgroundImage} 
          accentColor={accentColor}
          isBackground={true}
        />
      )}
      
      {content?.showFloatingElements === true && (
        <FloatingElements
          variant={content?.floatingElementsVariant || 'minimal'}
          accentColor={accentColor}
          opacity={hasValidBgImage ? 0.3 : 0.5}
          density="low"
          className="z-0"
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
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight"
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
            className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 group text-white"
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
                "w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6",
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
            className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-2xl mx-auto"
          >
            {content.stats.map((stat: StatItem, index: number) => (
              <div key={index} className="text-center">
                <div 
                  className="text-2xl sm:text-3xl md:text-4xl font-bold"
                  style={{ color: colors.textColor }}
                >
                  {stat.value}
                </div>
                <div 
                  className="text-xs sm:text-sm mt-1"
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

  // Render Split Hero (imagen a la derecha, texto a la izquierda)
  const renderSplitHero = (imagePosition: 'left' | 'right' = 'right') => {
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
              className={imagePosition === 'left' ? 'lg:order-2' : ''}
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
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
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
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 group text-white"
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

              {/* Stats inline */}
              {content?.stats && content.stats.length > 0 && (
                <motion.div 
                  variants={fadeInUp}
                  className="mt-10 flex items-center gap-8 flex-wrap"
                >
                  {content.stats.map((stat: StatItem, index: number) => (
                    <div key={index}>
                      <div 
                        className="text-2xl md:text-3xl font-bold"
                        style={{ color: accentColor }}
                      >
                        {stat.value}
                      </div>
                      <div 
                        className="text-sm"
                        style={{ color: splitColors.subtitleColor }}
                      >
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: imagePosition === 'left' ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className={cn(
                "relative",
                imagePosition === 'left' ? 'lg:order-1' : ''
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

  // Render Minimal Hero
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

  // Render Asymmetric Hero
  const renderAsymmetricHero = () => (
    <div
      className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{ backgroundColor: styles?.backgroundColor || '#0a0a0a' }}
    >
      <div 
        className="absolute top-0 right-0 w-1/2 h-full opacity-30"
        style={{ 
          background: `radial-gradient(circle at 70% 30%, ${accentColor}40 0%, transparent 50%)`
        }}
      />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
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
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 group text-white"
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

  // Render Gradient Hero
  const renderGradientHero = () => {
    const gradientStart = accentColor;
    const gradientEnd = content?.gradientEndColor || '#8b5cf6';
    
    return (
      <div
        className="relative py-20 md:py-32 lg:py-40 px-4 sm:px-6 lg:px-8 min-h-[500px] md:min-h-[600px] overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`
        }}
      >
        {/* Decorative shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-black/10 blur-3xl" />
        </div>
        
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-5xl mx-auto text-center"
        >
          {content?.badge && (
            <motion.span 
              variants={fadeInUp}
              className="inline-block mx-auto px-4 py-2 rounded-full text-sm font-medium mb-6 bg-white/20 text-white backdrop-blur-sm"
            >
              {content.badge}
            </motion.span>
          )}
          
          <motion.h1 
            variants={fadeInUp}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight text-white"
          >
            {content?.title || "Welcome"}
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="mt-6 max-w-3xl mx-auto text-lg md:text-xl lg:text-2xl text-white/90"
          >
            {content?.subtitle || "Your subtitle here"}
          </motion.p>
          
          <motion.div 
            variants={fadeInUp}
            className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
          >
            <Button 
              size="lg"
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 group bg-white hover:bg-gray-100"
              style={{ color: gradientStart }}
            >
              {content?.ctaText || "Get Started"}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            {content?.secondaryCtaText && (
              <Button 
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 border-white/30 text-white hover:bg-white/10"
              >
                {content.secondaryCtaText}
              </Button>
            )}
          </motion.div>

          {/* Stats row */}
          {content?.stats && content.stats.length > 0 && (
            <motion.div 
              variants={fadeInUp}
              className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-2xl mx-auto"
            >
              {content.stats.map((stat: StatItem, index: number) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm mt-1 text-white/70">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  };

  return (
    <section
      id={id}
      onClick={(e) => {
        e.stopPropagation();
        selectSection(id);
      }}
      className={cn(
        "transition-all duration-200 scroll-mt-20",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
    >
      {/* Video hero */}
      {variant === 'video' && renderVideoHero()}
      
      {/* Split variants */}
      {variant === 'split' && renderSplitHero('right')}
      {variant === 'split-left' && renderSplitHero('left')}
      {variant === 'split-right' && renderSplitHero('right')}
      
      {/* Other variants */}
      {variant === 'minimal' && renderMinimalHero()}
      {variant === 'asymmetric' && renderAsymmetricHero()}
      {variant === 'gradient' && renderGradientHero()}
      
      {/* Default centered */}
      {(variant === 'centered' || !['split', 'split-left', 'split-right', 'minimal', 'asymmetric', 'video', 'gradient'].includes(variant)) && renderCenteredHero()}
    </section>
  );
}
