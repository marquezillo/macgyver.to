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
  
  // La imagen puede venir de content.backgroundImage, content.imageUrl, o styles.backgroundImage
  const backgroundImage = content?.backgroundImage || content?.imageUrl || styles?.backgroundImage;
  
  // Si hay imagen de fondo, el texto debe ser blanco para legibilidad
  const hasBackgroundImage = !!backgroundImage;
  const textColorClass = hasBackgroundImage ? 'text-white' : (styles?.textColor || 'text-gray-900');
  const subtitleColorClass = hasBackgroundImage ? 'text-white/90' : (styles?.textColor || 'text-gray-500');

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectSection(id);
      }}
      className={cn(
        "relative py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 transition-all duration-200 min-h-[400px] md:min-h-[500px]",
        isSelected && "ring-2 ring-primary ring-offset-2",
        !backgroundImage && (styles?.backgroundColor || "bg-gradient-to-br from-gray-900 to-gray-800")
      )}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: !backgroundImage ? styles?.backgroundColor : undefined,
      }}
    >
      {/* Overlay para mejor legibilidad del texto sobre la imagen */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      )}
      
      <div className="relative max-w-7xl mx-auto text-center flex flex-col justify-center h-full">
        <h1 
          className={cn(
            "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight",
            textColorClass
          )}
          style={{ 
            color: hasBackgroundImage ? '#ffffff' : styles?.textColor,
            textShadow: hasBackgroundImage ? '0 2px 4px rgba(0,0,0,0.3)' : undefined
          }}
        >
          {content?.title || "Welcome"}
        </h1>
        <p 
          className={cn(
            "mt-4 md:mt-6 max-w-3xl mx-auto text-lg md:text-xl lg:text-2xl",
            subtitleColorClass
          )}
          style={{ 
            color: hasBackgroundImage ? 'rgba(255,255,255,0.9)' : styles?.textColor,
            textShadow: hasBackgroundImage ? '0 1px 2px rgba(0,0,0,0.2)' : undefined
          }}
        >
          {content?.subtitle || "Your subtitle here"}
        </p>
        <div className="mt-8 md:mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            size="lg"
            className={cn(
              "text-lg px-8 py-6",
              styles?.accentColor ? "" : "bg-orange-500 hover:bg-orange-600 text-white"
            )}
            style={{ backgroundColor: styles?.accentColor || styles?.buttonColor }}
          >
            {content?.ctaText || "Get Started"}
          </Button>
          {content?.secondaryCtaText && (
            <Button 
              size="lg"
              variant="outline"
              className={cn(
                "text-lg px-8 py-6",
                hasBackgroundImage && "border-white text-white hover:bg-white/10"
              )}
            >
              {content.secondaryCtaText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
