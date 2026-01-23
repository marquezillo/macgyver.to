import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { CheckCircle2, Zap, Shield, Rocket, Star, Heart, Globe, Clock, Award, ArrowRight, Sparkles, Target, TrendingUp, Users, BarChart3, Lock, Cpu, Cloud } from 'lucide-react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useState, useRef } from 'react';

interface Feature {
  title?: string;
  description?: string;
  icon?: string;
  image?: string;
  link?: string;
  size?: 'small' | 'medium' | 'large';
  highlight?: boolean;
}

interface FeaturesSectionProps {
  id: string;
  content: {
    title?: string;
    subtitle?: string;
    badge?: string;
    items?: Feature[];
    layout?: 'grid' | 'list' | 'alternating' | 'bento' | 'animated' | 'cards3d' | 'minimal';
  };
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    cardBackgroundColor?: string;
  };
}

// Extended icon mapping
const iconMap: Record<string, any> = {
  check: CheckCircle2,
  zap: Zap,
  shield: Shield,
  rocket: Rocket,
  star: Star,
  heart: Heart,
  globe: Globe,
  clock: Clock,
  award: Award,
  sparkles: Sparkles,
  target: Target,
  trending: TrendingUp,
  users: Users,
  chart: BarChart3,
  lock: Lock,
  cpu: Cpu,
  cloud: Cloud,
};

// 3D Card Component
function Card3D({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-100, 100], [10, -10]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-10, 10]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FeaturesSection({ id, content, styles = {} }: FeaturesSectionProps) {
  const { selectedSectionId, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === id;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const items = content?.items || [];
  const layout = content?.layout || 'grid';

  const getIcon = (iconName?: string) => {
    const IconComponent = iconMap[iconName?.toLowerCase() || ''] || CheckCircle2;
    return IconComponent;
  };

  // Animated Icon with pulse effect
  const AnimatedIcon = ({ icon, accentColor }: { icon: string; accentColor: string }) => {
    const IconComponent = getIcon(icon);
    return (
      <motion.div 
        className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl"
        style={{ backgroundColor: `${accentColor}15` }}
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{ backgroundColor: accentColor }}
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 0.2, scale: 1.2 }}
          transition={{ duration: 0.3 }}
        />
        <IconComponent className="w-7 h-7 relative z-10" style={{ color: accentColor }} />
      </motion.div>
    );
  };

  // Grid Layout (Default)
  const renderGridLayout = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={cn(
        "grid gap-6 md:gap-8",
        items.length === 2 ? "md:grid-cols-2" :
        items.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" :
        "md:grid-cols-2 lg:grid-cols-3"
      )}
    >
      {items.map((item, index) => {
        const IconComponent = getIcon(item?.icon);
        return (
          <motion.div 
            key={index}
            variants={itemVariants}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={cn(
              "group relative p-6 md:p-8 rounded-2xl transition-all duration-300",
              "hover:shadow-lg hover:-translate-y-1",
              styles?.cardBackgroundColor || "bg-white"
            )}
            style={{ backgroundColor: styles?.cardBackgroundColor }}
          >
            <div 
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 transition-transform group-hover:scale-110"
              style={{ backgroundColor: styles?.accentColor ? `${styles.accentColor}20` : '#6366f120' }}
            >
              <IconComponent className="w-6 h-6" style={{ color: styles?.accentColor || '#6366f1' }} />
            </div>

            <h3 className={cn("text-lg md:text-xl font-semibold", styles?.textColor || "text-gray-900")}>
              {item?.title || "Feature"}
            </h3>
            <p className={cn("mt-2 text-base leading-relaxed", styles?.textColor ? "opacity-70" : "text-gray-600")}
               style={{ color: styles?.textColor }}>
              {item?.description || "Feature description"}
            </p>

            {item?.link && (
              <a href={item.link} className="mt-4 inline-flex items-center text-sm font-medium group/link"
                 style={{ color: styles?.accentColor || '#6366f1' }}>
                Learn more 
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover/link:translate-x-1" />
              </a>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );

  // Alternating Layout with Images
  const renderAlternatingLayout = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="space-y-20 md:space-y-32"
    >
      {items.map((item, index) => {
        const IconComponent = getIcon(item?.icon);
        const isEven = index % 2 === 0;
        
        return (
          <motion.div
            key={index}
            variants={itemVariants}
            className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          >
            {/* Content */}
            <div className={cn(isEven ? "lg:order-1" : "lg:order-2")}>
              <motion.div 
                initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div 
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
                  style={{ backgroundColor: styles?.accentColor ? `${styles.accentColor}15` : '#6366f115' }}
                >
                  <IconComponent className="w-7 h-7" style={{ color: styles?.accentColor || '#6366f1' }} />
                </div>
                
                <h3 className={cn("text-2xl md:text-3xl lg:text-4xl font-bold leading-tight", styles?.textColor || "text-gray-900")}>
                  {item?.title || "Feature"}
                </h3>
                
                <p className={cn("mt-4 text-lg leading-relaxed", styles?.textColor ? "opacity-70" : "text-gray-600")}
                   style={{ color: styles?.textColor }}>
                  {item?.description || "Feature description"}
                </p>

                {item?.link && (
                  <motion.a 
                    href={item.link}
                    className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white"
                    style={{ backgroundColor: styles?.accentColor || '#6366f1' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Learn more <ArrowRight className="w-4 h-4" />
                  </motion.a>
                )}
              </motion.div>
            </div>

            {/* Image */}
            <div className={cn(isEven ? "lg:order-2" : "lg:order-1")}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                {item?.image ? (
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="rounded-3xl shadow-2xl w-full"
                  />
                ) : (
                  <div 
                    className="aspect-[4/3] rounded-3xl shadow-2xl"
                    style={{ 
                      background: `linear-gradient(135deg, ${styles?.accentColor || '#6366f1'}20, ${styles?.accentColor || '#6366f1'}40)` 
                    }}
                  />
                )}
                {/* Decorative elements */}
                <div 
                  className="absolute -z-10 -top-4 -right-4 w-full h-full rounded-3xl"
                  style={{ backgroundColor: styles?.accentColor ? `${styles.accentColor}10` : '#6366f110' }}
                />
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );

  // Bento Grid Layout
  const renderBentoLayout = () => {
    const getBentoSize = (index: number, total: number) => {
      if (total <= 3) return 'col-span-1';
      if (index === 0) return 'md:col-span-2 md:row-span-2';
      if (index === 3 && total > 4) return 'md:col-span-2';
      return 'col-span-1';
    };

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid md:grid-cols-3 gap-4 md:gap-6"
      >
        {items.map((item, index) => {
          const IconComponent = getIcon(item?.icon);
          const sizeClass = item?.size === 'large' ? 'md:col-span-2 md:row-span-2' :
                           item?.size === 'medium' ? 'md:col-span-2' :
                           getBentoSize(index, items.length);
          const isLarge = sizeClass.includes('row-span-2');

          return (
            <motion.div 
              key={index}
              variants={itemVariants}
              className={cn(
                "group relative rounded-3xl overflow-hidden transition-all duration-300",
                "hover:shadow-xl",
                sizeClass,
                item?.highlight ? "ring-2" : ""
              )}
              style={{ 
                backgroundColor: styles?.cardBackgroundColor || '#ffffff',
                borderColor: item?.highlight ? (styles?.accentColor || '#6366f1') : undefined
              }}
            >
              {/* Background gradient on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ 
                  background: `linear-gradient(135deg, ${styles?.accentColor || '#6366f1'}05, ${styles?.accentColor || '#6366f1'}15)` 
                }}
              />

              <div className={cn("relative p-6 md:p-8 h-full flex flex-col", isLarge && "justify-between")}>
                {/* Icon */}
                <div 
                  className={cn(
                    "inline-flex items-center justify-center rounded-2xl mb-4 transition-transform group-hover:scale-110",
                    isLarge ? "w-16 h-16" : "w-12 h-12"
                  )}
                  style={{ backgroundColor: styles?.accentColor ? `${styles.accentColor}15` : '#6366f115' }}
                >
                  <IconComponent 
                    className={isLarge ? "w-8 h-8" : "w-6 h-6"} 
                    style={{ color: styles?.accentColor || '#6366f1' }} 
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className={cn(
                    "font-bold",
                    isLarge ? "text-2xl md:text-3xl" : "text-lg md:text-xl",
                    styles?.textColor || "text-gray-900"
                  )}>
                    {item?.title || "Feature"}
                  </h3>
                  <p className={cn(
                    "mt-2 leading-relaxed",
                    isLarge ? "text-base md:text-lg" : "text-sm md:text-base",
                    styles?.textColor ? "opacity-70" : "text-gray-600"
                  )}
                  style={{ color: styles?.textColor }}>
                    {item?.description || "Feature description"}
                  </p>
                </div>

                {/* Image for large cards */}
                {isLarge && item?.image && (
                  <div className="mt-6">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="rounded-2xl w-full h-48 object-cover"
                    />
                  </div>
                )}

                {/* Link */}
                {item?.link && (
                  <a 
                    href={item.link}
                    className="mt-4 inline-flex items-center text-sm font-medium group/link"
                    style={{ color: styles?.accentColor || '#6366f1' }}
                  >
                    Learn more 
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover/link:translate-x-1" />
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  // Animated Icons Layout
  const renderAnimatedLayout = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {items.map((item, index) => (
        <motion.div 
          key={index}
          variants={itemVariants}
          whileHover={{ y: -8 }}
          className={cn(
            "group relative p-8 rounded-3xl transition-all duration-300",
            "bg-gradient-to-br from-white to-gray-50",
            "border border-gray-100 hover:border-transparent",
            "hover:shadow-2xl"
          )}
          style={{ 
            backgroundColor: styles?.cardBackgroundColor,
            boxShadow: hoveredIndex === index ? `0 25px 50px -12px ${styles?.accentColor || '#6366f1'}30` : undefined
          }}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Animated Icon */}
          <AnimatedIcon icon={item?.icon || 'check'} accentColor={styles?.accentColor || '#6366f1'} />

          {/* Floating particles effect */}
          {hoveredIndex === index && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{ backgroundColor: styles?.accentColor || '#6366f1' }}
                  initial={{ opacity: 0, scale: 0, x: 56, y: 56 }}
                  animate={{ 
                    opacity: [0, 0.6, 0],
                    scale: [0, 1, 0],
                    x: [56, 56 + (Math.random() - 0.5) * 100],
                    y: [56, 56 - 50 - Math.random() * 50]
                  }}
                  transition={{ 
                    duration: 1,
                    delay: i * 0.2,
                    repeat: Infinity,
                    repeatDelay: 0.5
                  }}
                />
              ))}
            </>
          )}

          <h3 className={cn("mt-6 text-xl font-bold", styles?.textColor || "text-gray-900")}>
            {item?.title || "Feature"}
          </h3>
          
          <p className={cn("mt-3 text-base leading-relaxed", styles?.textColor ? "opacity-70" : "text-gray-600")}
             style={{ color: styles?.textColor }}>
            {item?.description || "Feature description"}
          </p>

          {item?.link && (
            <motion.a 
              href={item.link}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: styles?.accentColor || '#6366f1' }}
              whileHover={{ x: 4 }}
            >
              Explore <ArrowRight className="w-4 h-4" />
            </motion.a>
          )}
        </motion.div>
      ))}
    </motion.div>
  );

  // 3D Cards Layout
  const renderCards3DLayout = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {items.map((item, index) => {
        const IconComponent = getIcon(item?.icon);
        return (
          <Card3D
            key={index}
            className={cn(
              "p-8 rounded-3xl cursor-pointer",
              "bg-gradient-to-br from-white to-gray-50",
              "border border-gray-200 shadow-lg"
            )}
            style={{ backgroundColor: styles?.cardBackgroundColor }}
          >
            <motion.div variants={itemVariants}>
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ 
                  backgroundColor: styles?.accentColor ? `${styles.accentColor}15` : '#6366f115',
                  transform: 'translateZ(20px)'
                }}
              >
                <IconComponent className="w-7 h-7" style={{ color: styles?.accentColor || '#6366f1' }} />
              </div>

              <h3 
                className={cn("text-xl font-bold", styles?.textColor || "text-gray-900")}
                style={{ transform: 'translateZ(30px)' }}
              >
                {item?.title || "Feature"}
              </h3>
              
              <p 
                className={cn("mt-3 text-base leading-relaxed", styles?.textColor ? "opacity-70" : "text-gray-600")}
                style={{ color: styles?.textColor, transform: 'translateZ(15px)' }}
              >
                {item?.description || "Feature description"}
              </p>

              {item?.link && (
                <a 
                  href={item.link}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold"
                  style={{ color: styles?.accentColor || '#6366f1', transform: 'translateZ(25px)' }}
                >
                  Learn more <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </motion.div>
          </Card3D>
        );
      })}
    </motion.div>
  );

  // Minimal Layout
  const renderMinimalLayout = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-10"
    >
      {items.map((item, index) => {
        const IconComponent = getIcon(item?.icon);
        return (
          <motion.div key={index} variants={itemVariants} className="text-center">
            <div 
              className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: styles?.accentColor ? `${styles.accentColor}10` : '#6366f110' }}
            >
              <IconComponent className="w-6 h-6" style={{ color: styles?.accentColor || '#6366f1' }} />
            </div>
            <h3 className={cn("text-lg font-semibold", styles?.textColor || "text-gray-900")}>
              {item?.title || "Feature"}
            </h3>
            <p className={cn("mt-2 text-sm", styles?.textColor ? "opacity-60" : "text-gray-500")}
               style={{ color: styles?.textColor }}>
              {item?.description || "Feature description"}
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  );

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
          className="text-center mb-16"
        >
          {content?.badge && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
              style={{ 
                backgroundColor: styles?.accentColor ? `${styles.accentColor}20` : '#6366f120',
                color: styles?.accentColor || '#6366f1'
              }}
            >
              {content.badge}
            </motion.span>
          )}
          <h2 className={cn(
            "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight",
            styles?.textColor || "text-gray-900"
          )}>
            {content?.title || "Features"}
          </h2>
          <p className={cn(
            "mt-4 max-w-2xl mx-auto text-lg md:text-xl",
            styles?.textColor ? "opacity-70" : "text-gray-600"
          )}
          style={{ color: styles?.textColor }}>
            {content?.subtitle || "Discover our amazing features"}
          </p>
        </motion.div>

        {/* Features by Layout */}
        {layout === 'alternating' ? renderAlternatingLayout() :
         layout === 'bento' ? renderBentoLayout() :
         layout === 'animated' ? renderAnimatedLayout() :
         layout === 'cards3d' ? renderCards3DLayout() :
         layout === 'minimal' ? renderMinimalLayout() :
         renderGridLayout()}
      </div>
    </div>
  );
}
