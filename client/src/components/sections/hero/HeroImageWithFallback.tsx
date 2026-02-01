import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ImageOff } from 'lucide-react';
import { isValidImageUrl } from '@/lib/imageUtils';

interface HeroImageWithFallbackProps {
  src?: string;
  alt?: string;
  accentColor?: string;
  className?: string;
  isBackground?: boolean;
}

export function HeroImageWithFallback({ 
  src, 
  alt, 
  accentColor,
  className = '',
  isBackground = false
}: HeroImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isValid = isValidImageUrl(src);
  const showFallback = !isValid || hasError;
  const color = accentColor || '#6366f1';

  if (showFallback) {
    if (isBackground) {
      return (
        <div 
          className={cn("absolute inset-0", className)}
          style={{ 
            background: `linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)`
          }}
        >
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
