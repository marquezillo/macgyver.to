import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Play, ChevronDown } from 'lucide-react';

interface HeroSectionProps {
  id: string;
  content: any;
  styles?: any;
}

export function HeroSection({ id, content, styles = {} }: HeroSectionProps) {
  const { selectedSectionId, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === id;
  
  const backgroundImage = content?.backgroundImage || content?.imageUrl || styles?.backgroundImage;
  const variant = content?.variant || 'centered'; // centered, split, minimal, asymmetric, video
  
  const hasBackgroundImage = !!backgroundImage && variant !== 'split';
  const textColorClass = hasBackgroundImage ? 'text-white' : (styles?.textColor || 'text-gray-900');

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  // Render different hero variants
  const renderCenteredHero = () => (
    <div
      className={cn(
        "relative py-20 md:py-32 lg:py-40 px-4 sm:px-6 lg:px-8 min-h-[500px] md:min-h-[600px]",
        !backgroundImage && (styles?.backgroundColor || "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900")
      )}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: !backgroundImage ? styles?.backgroundColor : undefined,
      }}
    >
      {backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
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
              backgroundColor: hasBackgroundImage ? 'rgba(255,255,255,0.15)' : (styles?.accentColor ? `${styles.accentColor}20` : '#6366f120'),
              color: hasBackgroundImage ? '#ffffff' : (styles?.accentColor || '#6366f1')
            }}
          >
            {content.badge}
          </motion.span>
        )}
        
        <motion.h1 
          variants={fadeInUp}
          className={cn(
            "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight",
            textColorClass
          )}
          style={{ 
            color: hasBackgroundImage ? '#ffffff' : styles?.textColor,
            textShadow: hasBackgroundImage ? '0 4px 12px rgba(0,0,0,0.3)' : undefined
          }}
        >
          {content?.title || "Welcome"}
        </motion.h1>
        
        <motion.p 
          variants={fadeInUp}
          className={cn(
            "mt-6 max-w-3xl mx-auto text-lg md:text-xl lg:text-2xl",
            hasBackgroundImage ? "text-white/90" : "text-gray-600"
          )}
          style={{ 
            color: hasBackgroundImage ? 'rgba(255,255,255,0.9)' : styles?.textColor,
          }}
        >
          {content?.subtitle || "Your subtitle here"}
        </motion.p>
        
        <motion.div 
          variants={fadeInUp}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
        >
          <Button 
            size="lg"
            className="text-lg px-8 py-6 group"
            style={{ backgroundColor: styles?.accentColor || '#6366f1' }}
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
                hasBackgroundImage && "border-white/30 text-white hover:bg-white/10"
              )}
            >
              {content?.secondaryCtaIcon === 'play' && <Play className="mr-2 w-5 h-5" />}
              {content.secondaryCtaText}
            </Button>
          )}
        </motion.div>

        {/* Stats row */}
        {content?.stats && (
          <motion.div 
            variants={fadeInUp}
            className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {content.stats.map((stat: any, index: number) => (
              <div key={index} className="text-center">
                <div className={cn(
                  "text-3xl md:text-4xl font-bold",
                  hasBackgroundImage ? "text-white" : "text-gray-900"
                )}>
                  {stat.value}
                </div>
                <div className={cn(
                  "text-sm mt-1",
                  hasBackgroundImage ? "text-white/70" : "text-gray-500"
                )}>
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
              <ChevronDown className={cn(
                "w-8 h-8",
                hasBackgroundImage ? "text-white/50" : "text-gray-400"
              )} />
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );

  const renderSplitHero = () => (
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
                  backgroundColor: styles?.accentColor ? `${styles.accentColor}20` : '#6366f120',
                  color: styles?.accentColor || '#6366f1'
                }}
              >
                {content.badge}
              </motion.span>
            )}
            
            <motion.h1 
              variants={fadeInUp}
              className={cn(
                "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight",
                styles?.textColor || "text-gray-900"
              )}
            >
              {content?.title || "Welcome"}
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className={cn(
                "mt-6 text-lg md:text-xl",
                styles?.textColor ? "opacity-70" : "text-gray-600"
              )}
              style={{ color: styles?.textColor }}
            >
              {content?.subtitle || "Your subtitle here"}
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="mt-8 flex flex-col sm:flex-row gap-4"
            >
              <Button 
                size="lg"
                className="text-lg px-8 py-6 group"
                style={{ backgroundColor: styles?.accentColor || '#6366f1' }}
              >
                {content?.ctaText || "Get Started"}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              {content?.secondaryCtaText && (
                <Button 
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6"
                >
                  {content.secondaryCtaText}
                </Button>
              )}
            </motion.div>

            {/* Trust badges */}
            {content?.trustBadges && (
              <motion.div 
                variants={fadeInUp}
                className="mt-10 flex items-center gap-6 flex-wrap"
              >
                {content.trustBadges.map((badge: string, index: number) => (
                  <span key={index} className="text-sm text-gray-500 flex items-center gap-2">
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
            {backgroundImage ? (
              <img
                src={backgroundImage}
                alt={content?.imageAlt || "Hero image"}
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            ) : (
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-400 text-lg">Hero Image</span>
              </div>
            )}
            
            {/* Floating card */}
            {content?.floatingCard && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4"
              >
                <div className="text-2xl font-bold" style={{ color: styles?.accentColor || '#6366f1' }}>
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

  const renderMinimalHero = () => (
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
          className={cn(
            "text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]",
            styles?.textColor || "text-gray-900"
          )}
        >
          {content?.title || "Welcome"}
        </motion.h1>
        
        <motion.p 
          variants={fadeInUp}
          className={cn(
            "mt-8 text-xl md:text-2xl max-w-2xl mx-auto",
            styles?.textColor ? "opacity-70" : "text-gray-600"
          )}
          style={{ color: styles?.textColor }}
        >
          {content?.subtitle || "Your subtitle here"}
        </motion.p>
        
        <motion.div 
          variants={fadeInUp}
          className="mt-12"
        >
          <Button 
            size="lg"
            className="text-lg px-10 py-7 rounded-full group"
            style={{ backgroundColor: styles?.accentColor || '#6366f1' }}
          >
            {content?.ctaText || "Get Started"}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );

  const renderAsymmetricHero = () => (
    <div
      className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{ backgroundColor: styles?.backgroundColor || '#0a0a0a' }}
    >
      {/* Background gradient */}
      <div 
        className="absolute top-0 right-0 w-1/2 h-full opacity-30"
        style={{ 
          background: `radial-gradient(circle at 70% 30%, ${styles?.accentColor || '#6366f1'}40 0%, transparent 50%)`
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
                  borderColor: styles?.accentColor || '#6366f1',
                  color: styles?.accentColor || '#6366f1'
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
                className="text-lg px-8 py-6 group"
                style={{ backgroundColor: styles?.accentColor || '#6366f1' }}
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

          {/* Image - takes 5 columns, offset */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative"
          >
            {backgroundImage ? (
              <div className="relative">
                <img
                  src={backgroundImage}
                  alt={content?.imageAlt || "Hero image"}
                  className="rounded-2xl shadow-2xl w-full h-auto"
                />
                {/* Glow effect */}
                <div 
                  className="absolute -inset-4 rounded-3xl opacity-20 blur-2xl -z-10"
                  style={{ backgroundColor: styles?.accentColor || '#6366f1' }}
                />
              </div>
            ) : (
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <span className="text-gray-600 text-lg">Hero Image</span>
              </div>
            )}
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
