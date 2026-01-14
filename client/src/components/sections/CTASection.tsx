import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  id: string;
  content: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    secondaryCtaText?: string;
  };
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
    gradientFrom?: string;
    gradientTo?: string;
  };
}

export function CTASection({ id, content, styles = {} }: CTASectionProps) {
  const { selectedSectionId, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === id;

  const hasGradient = styles?.gradientFrom && styles?.gradientTo;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectSection(id);
      }}
      className={cn(
        "relative py-16 px-4 sm:px-6 lg:px-8 transition-all duration-200",
        isSelected && "ring-2 ring-primary ring-offset-2",
        !hasGradient && (styles?.backgroundColor || "bg-primary")
      )}
      style={hasGradient ? {
        background: `linear-gradient(135deg, ${styles.gradientFrom}, ${styles.gradientTo})`
      } : undefined}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 
          className={cn(
            "text-3xl font-bold tracking-tight sm:text-4xl",
            styles?.textColor || "text-white"
          )}
        >
          {content?.title || "¿Listo para comenzar?"}
        </h2>
        {content?.subtitle && (
          <p 
            className={cn(
              "mt-4 text-lg max-w-2xl mx-auto",
              styles?.textColor ? "opacity-90" : "text-white/90"
            )}
            style={{ color: styles?.textColor }}
          >
            {content.subtitle}
          </p>
        )}
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            className={cn(
              "group",
              styles?.buttonColor 
                ? "" 
                : "bg-white text-primary hover:bg-white/90"
            )}
            style={{ 
              backgroundColor: styles?.buttonColor,
              color: styles?.buttonColor ? 'white' : undefined
            }}
          >
            {content?.ctaText || "Comenzar ahora"}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          
          {content?.secondaryCtaText && (
            <Button 
              size="lg"
              variant="outline"
              className={cn(
                "border-2",
                styles?.textColor 
                  ? "" 
                  : "border-white text-white hover:bg-white/10"
              )}
              style={{ 
                borderColor: styles?.textColor,
                color: styles?.textColor
              }}
            >
              {content.secondaryCtaText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
