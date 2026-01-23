import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Users, Star, Clock, Award, TrendingUp, Globe, Zap, Heart } from 'lucide-react';

interface StatsSectionProps {
  id: string;
  content: any;
  styles?: any;
}

// Animated counter component
function AnimatedCounter({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// Parse stat value to extract number and suffix
function parseStatValue(value: string): { number: number; suffix: string; prefix: string } {
  const match = value.match(/^([^\d]*)(\d+(?:,\d+)*(?:\.\d+)?)(.*)$/);
  if (match) {
    return {
      prefix: match[1] || '',
      number: parseFloat(match[2].replace(/,/g, '')),
      suffix: match[3] || ''
    };
  }
  return { number: 0, suffix: '', prefix: '' };
}

// Icon mapping
const iconMap: Record<string, any> = {
  users: Users,
  star: Star,
  clock: Clock,
  award: Award,
  trending: TrendingUp,
  globe: Globe,
  zap: Zap,
  heart: Heart,
};

export function StatsSection({ id, content, styles = {} }: StatsSectionProps) {
  const { selectedSectionId, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === id;

  const stats = content?.items || [
    { value: '10,000+', label: 'Happy Customers', icon: 'users' },
    { value: '98%', label: 'Satisfaction Rate', icon: 'star' },
    { value: '24/7', label: 'Support Available', icon: 'clock' },
    { value: '50+', label: 'Awards Won', icon: 'award' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const isDark = styles?.backgroundColor && 
    (styles.backgroundColor.includes('#0') || 
     styles.backgroundColor.includes('#1') || 
     styles.backgroundColor.includes('#2') ||
     styles.backgroundColor === '#000' ||
     styles.backgroundColor === 'black');

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectSection(id);
      }}
      className={cn(
        "py-16 md:py-24 px-4 sm:px-6 lg:px-8 transition-all duration-200",
        isSelected && "ring-2 ring-primary ring-offset-2",
        !styles?.backgroundColor && "bg-gradient-to-br from-gray-900 to-gray-800"
      )}
      style={{ backgroundColor: styles?.backgroundColor }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {(content?.title || content?.subtitle) && (
          <div className="text-center mb-12">
            {content?.title && (
              <motion.h2 
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={cn(
                  "text-3xl md:text-4xl font-bold tracking-tight",
                  isDark || !styles?.backgroundColor ? "text-white" : "text-gray-900"
                )}
                style={{ color: styles?.textColor }}
              >
                {content.title}
              </motion.h2>
            )}
            {content?.subtitle && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={cn(
                  "mt-4 text-lg max-w-2xl mx-auto",
                  isDark || !styles?.backgroundColor ? "text-gray-300" : "text-gray-600"
                )}
                style={{ color: styles?.textColor ? `${styles.textColor}99` : undefined }}
              >
                {content.subtitle}
              </motion.p>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={cn(
            "grid gap-8",
            stats.length === 3 ? "md:grid-cols-3" : 
            stats.length === 2 ? "md:grid-cols-2" : 
            "md:grid-cols-4"
          )}
        >
          {stats.map((stat: any, index: number) => {
            const IconComponent = iconMap[stat.icon?.toLowerCase()] || Users;
            const parsed = parseStatValue(stat.value);

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className={cn(
                  "text-center p-6 rounded-2xl",
                  styles?.cardBg ? "" : (isDark || !styles?.backgroundColor ? "bg-white/5 backdrop-blur-sm" : "bg-gray-50")
                )}
                style={{ backgroundColor: styles?.cardBg }}
              >
                {/* Icon */}
                <div 
                  className={cn(
                    "inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4",
                    isDark || !styles?.backgroundColor ? "bg-white/10" : "bg-primary/10"
                  )}
                  style={{ backgroundColor: styles?.accentColor ? `${styles.accentColor}20` : undefined }}
                >
                  <IconComponent 
                    className="w-7 h-7" 
                    style={{ color: styles?.accentColor || (isDark || !styles?.backgroundColor ? '#ffffff' : '#6366f1') }}
                  />
                </div>

                {/* Value */}
                <div 
                  className={cn(
                    "text-4xl md:text-5xl font-bold tracking-tight",
                    isDark || !styles?.backgroundColor ? "text-white" : "text-gray-900"
                  )}
                  style={{ color: styles?.textColor }}
                >
                  {parsed.number > 0 ? (
                    <AnimatedCounter 
                      value={parsed.number} 
                      suffix={parsed.suffix} 
                      prefix={parsed.prefix}
                    />
                  ) : (
                    stat.value
                  )}
                </div>

                {/* Label */}
                <div 
                  className={cn(
                    "mt-2 text-sm md:text-base font-medium",
                    isDark || !styles?.backgroundColor ? "text-gray-400" : "text-gray-600"
                  )}
                  style={{ color: styles?.textColor ? `${styles.textColor}99` : undefined }}
                >
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
