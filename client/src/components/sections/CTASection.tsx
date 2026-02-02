import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { isLightColor } from '@/lib/colorUtils';
import type { CTAContent, CTAStyles } from '@shared/sectionTypes';

interface CTASectionProps {
  id: string;
  content: CTAContent;
  styles?: CTAStyles;
}

// isLightColor now imported from @/lib/colorUtils

export function CTASection({ id, content, styles = {} }: CTASectionProps) {
  const { selectedSectionId, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === id;

  const hasGradient = styles?.gradientFrom && styles?.gradientTo;
  
  // Determinar el color de fondo efectivo
  const effectiveBgColor = hasGradient ? styles.gradientFrom : (styles?.backgroundColor || 'bg-primary');
  const isLightBg = isLightColor(effectiveBgColor || '');
  
  // Colores de texto basados en el fondo
  const textColor = styles?.textColor || (isLightBg ? '#111827' : '#ffffff');
  const subtitleColor = styles?.textColor || (isLightBg ? '#4b5563' : 'rgba(255,255,255,0.9)');

  return (
    <section
      id={id}
      onClick={(e) => {
        e.stopPropagation();
        selectSection(id);
      }}
      className={cn(
        "relative py-10 md:py-16 px-4 sm:px-6 lg:px-8 transition-all duration-200 scroll-mt-20",
        isSelected && "ring-2 ring-primary ring-offset-2",
        !hasGradient && (styles?.backgroundColor || "bg-primary")
      )}
      style={hasGradient ? {
        background: `linear-gradient(135deg, ${styles.gradientFrom}, ${styles.gradientTo})`
      } : undefined}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight"
          style={{ color: textColor }}
        >
          {content?.title || "¿Listo para comenzar?"}
        </h2>
        {content?.subtitle && (
          <p 
            className="mt-3 md:mt-4 text-base md:text-lg max-w-2xl mx-auto"
            style={{ color: subtitleColor }}
          >
            {content.subtitle}
          </p>
        )}
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            className="group"
            style={{ 
              backgroundColor: styles?.buttonColor || (isLightBg ? '#111827' : '#ffffff'),
              color: styles?.buttonColor ? '#ffffff' : (isLightBg ? '#ffffff' : '#111827')
            }}
          >
            {content?.ctaText || "Comenzar ahora"}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          
          {content?.secondaryCtaText && (
            <Button 
              size="lg"
              variant="outline"
              className="border-2"
              style={{ 
                borderColor: textColor,
                color: textColor,
                backgroundColor: 'transparent'
              }}
            >
              {content.secondaryCtaText}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
