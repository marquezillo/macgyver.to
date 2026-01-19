import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  id: string;
  content: any;
  styles?: any;
}

export function HeroSection({ id, content, styles = {} }: HeroSectionProps) {
  const { selectedSectionId, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === id;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectSection(id);
      }}
      className={cn(
        "relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 transition-all duration-200",
        isSelected && "ring-2 ring-primary ring-offset-2",
        styles?.backgroundColor || "bg-white"
      )}
      style={{
        backgroundImage: styles?.backgroundImage ? `url(${styles.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {styles?.overlay && (
        <div className="absolute inset-0 bg-black/50" />
      )}
      
      <div className="relative max-w-7xl mx-auto text-center">
        <h1 
          className={cn(
            "text-2xl sm:text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl",
            styles?.textColor || "text-gray-900"
          )}
        >
          {content?.title || "Welcome"}
        </h1>
        <p 
          className={cn(
            "mt-4 md:mt-6 max-w-2xl mx-auto text-base md:text-xl",
            styles?.textColor ? "opacity-90" : "text-gray-500"
          )}
          style={{ color: styles?.textColor }}
        >
          {content?.subtitle || "Your subtitle here"}
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Button 
            size="lg"
            className={cn(
              styles?.buttonColor ? "" : "bg-primary text-primary-foreground"
            )}
            style={{ backgroundColor: styles?.buttonColor }}
          >
            {content?.ctaText || "Get Started"}
          </Button>
        </div>
      </div>
    </div>
  );
}
