import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { CheckCircle2, Zap, Shield, Rocket, Star, Heart, Globe, Clock, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeaturesSectionProps {
  id: string;
  content: any;
  styles?: any;
}

// Icon mapping for dynamic icons
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
};

export function FeaturesSection({ id, content, styles = {} }: FeaturesSectionProps) {
  const { selectedSectionId, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === id;

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
  const layout = content?.layout || 'grid'; // grid, list, alternating

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectSection(id);
      }}
      className={cn(
        "py-10 md:py-20 px-4 sm:px-6 lg:px-8 transition-all duration-200",
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
          className="text-center"
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
          <h2 className={cn(
            "text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight",
            styles?.textColor || "text-gray-900"
          )}>
            {content?.title || "Features"}
          </h2>
          <p className={cn(
            "mt-3 md:mt-4 max-w-2xl mx-auto text-base md:text-lg",
            styles?.textColor ? "opacity-70" : "text-gray-600"
          )}
          style={{ color: styles?.textColor }}
          >
            {content?.subtitle || "Discover our amazing features"}
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={cn(
            "mt-12 md:mt-16",
            layout === 'list' 
              ? "space-y-6" 
              : layout === 'alternating'
                ? "space-y-16"
                : cn(
                    "grid gap-6 md:gap-8",
                    items.length === 2 ? "md:grid-cols-2" :
                    items.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" :
                    "md:grid-cols-2 lg:grid-cols-3"
                  )
          )}
        >
          {items.map((item: any, index: number) => {
            const IconComponent = iconMap[item?.icon?.toLowerCase()] || CheckCircle2;

            if (layout === 'alternating') {
              // Alternating layout with image
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={cn(
                    "grid md:grid-cols-2 gap-8 items-center",
                    index % 2 === 1 && "md:flex-row-reverse"
                  )}
                >
                  <div className={index % 2 === 1 ? "md:order-2" : ""}>
                    <div 
                      className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                      style={{ 
                        backgroundColor: styles?.accentColor ? `${styles.accentColor}20` : '#6366f120'
                      }}
                    >
                      <IconComponent 
                        className="w-6 h-6" 
                        style={{ color: styles?.accentColor || '#6366f1' }}
                      />
                    </div>
                    <h3 className={cn(
                      "text-xl md:text-2xl font-semibold",
                      styles?.textColor || "text-gray-900"
                    )}>
                      {item?.title || "Feature"}
                    </h3>
                    <p className={cn(
                      "mt-3 text-base leading-relaxed",
                      styles?.textColor ? "opacity-70" : "text-gray-600"
                    )}
                    style={{ color: styles?.textColor }}
                    >
                      {item?.description || "Feature description"}
                    </p>
                  </div>
                  <div className={index % 2 === 1 ? "md:order-1" : ""}>
                    {item?.image ? (
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="rounded-2xl shadow-lg w-full"
                      />
                    ) : (
                      <div className="aspect-video rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300" />
                    )}
                  </div>
                </motion.div>
              );
            }

            // Grid or list layout
            return (
              <motion.div 
                key={index}
                variants={itemVariants}
                className={cn(
                  "group relative p-6 md:p-8 rounded-2xl transition-all duration-300",
                  "hover:shadow-lg hover:-translate-y-1",
                  styles?.cardBackgroundColor || "bg-white"
                )}
                style={{ backgroundColor: styles?.cardBackgroundColor }}
              >
                {/* Icon */}
                <div 
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 transition-transform group-hover:scale-110"
                  style={{ 
                    backgroundColor: styles?.accentColor ? `${styles.accentColor}20` : '#6366f120'
                  }}
                >
                  <IconComponent 
                    className="w-6 h-6" 
                    style={{ color: styles?.accentColor || '#6366f1' }}
                  />
                </div>

                {/* Content */}
                <h3 className={cn(
                  "text-lg md:text-xl font-semibold",
                  styles?.textColor || "text-gray-900"
                )}>
                  {item?.title || "Feature"}
                </h3>
                <p className={cn(
                  "mt-2 text-base leading-relaxed",
                  styles?.textColor ? "opacity-70" : "text-gray-600"
                )}
                style={{ color: styles?.textColor }}
                >
                  {item?.description || "Feature description"}
                </p>

                {/* Optional link */}
                {item?.link && (
                  <a 
                    href={item.link}
                    className="mt-4 inline-flex items-center text-sm font-medium"
                    style={{ color: styles?.accentColor || '#6366f1' }}
                  >
                    Learn more →
                  </a>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
