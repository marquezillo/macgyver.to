import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  fallbackText?: string;
  fallbackColor?: string;
  className?: string;
  imgClassName?: string;
  type?: 'avatar' | 'hero' | 'gallery' | 'general';
}

/**
 * Componente de imagen con fallback elegante
 * - Muestra iniciales para avatares si la imagen falla
 * - Muestra gradiente con texto para imágenes de sección
 * - Valida URLs antes de intentar cargar
 */
export function ImageWithFallback({
  src,
  alt,
  fallbackText,
  fallbackColor = '#6366f1',
  className = '',
  imgClassName = '',
  type = 'general'
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidUrl, setIsValidUrl] = useState(false);

  // Validar URL antes de intentar cargar
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    
    if (!src) {
      setIsValidUrl(false);
      setHasError(true);
      setIsLoading(false);
      return;
    }

    // Verificar si es una URL válida
    const isValid = isValidImageUrl(src);
    setIsValidUrl(isValid);
    
    if (!isValid) {
      setHasError(true);
      setIsLoading(false);
    }
  }, [src]);

  // Función para validar URLs de imagen
  const isValidImageUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    
    // URLs vacías o placeholder
    if (url.trim() === '' || url === 'undefined' || url === 'null') return false;
    
    // URLs que son claramente texto descriptivo, no URLs reales
    if (!url.startsWith('http') && !url.startsWith('/') && !url.startsWith('data:')) {
      return false;
    }
    
    // URLs de placeholder conocidas que pueden fallar
    const knownBadPatterns = [
      'placeholder.com',
      'via.placeholder',
      'placehold.it',
      'dummyimage.com',
      'fakeimg.pl',
      'lorempixel.com',
      'placekitten.com',
      'loremflickr.com'
    ];
    
    if (knownBadPatterns.some(pattern => url.includes(pattern))) {
      return false;
    }
    
    return true;
  };

  // Generar iniciales para avatares
  const getInitials = (text: string): string => {
    if (!text) return 'U';
    return text
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generar color de fondo basado en el texto (para consistencia)
  const getColorFromText = (text: string): string => {
    if (!text) return fallbackColor;
    
    const colors = [
      '#6366f1', // indigo
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#f43f5e', // rose
      '#f97316', // orange
      '#eab308', // yellow
      '#22c55e', // green
      '#14b8a6', // teal
      '#06b6d4', // cyan
      '#3b82f6', // blue
    ];
    
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Renderizar fallback según el tipo
  const renderFallback = () => {
    const bgColor = fallbackText ? getColorFromText(fallbackText) : fallbackColor;
    
    if (type === 'avatar') {
      return (
        <div
          className={cn(
            "flex items-center justify-center rounded-full font-semibold text-white",
            className
          )}
          style={{ backgroundColor: bgColor }}
        >
          {getInitials(fallbackText || alt)}
        </div>
      );
    }
    
    if (type === 'hero') {
      return (
        <div
          className={cn(
            "flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900",
            className
          )}
        >
          <div className="text-center p-8">
            <div 
              className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: bgColor }}
            >
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            {fallbackText && (
              <p className="text-white/60 text-sm max-w-xs mx-auto">{fallbackText}</p>
            )}
          </div>
        </div>
      );
    }
    
    if (type === 'gallery') {
      return (
        <div
          className={cn(
            "flex items-center justify-center bg-gradient-to-br",
            className
          )}
          style={{ 
            background: `linear-gradient(135deg, ${bgColor}20, ${bgColor}40)` 
          }}
        >
          <div className="text-center p-4">
            <svg 
              className="w-12 h-12 mx-auto mb-2 opacity-40" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ color: bgColor }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {fallbackText && (
              <p className="text-xs opacity-60 max-w-[150px] mx-auto truncate">{fallbackText}</p>
            )}
          </div>
        </div>
      );
    }
    
    // General fallback
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100",
          className
        )}
      >
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  };

  // Si no hay URL válida o hay error, mostrar fallback
  if (!isValidUrl || hasError) {
    return renderFallback();
  }

  return (
    <div className={cn("relative", className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className={cn(
          "absolute inset-0 bg-gray-200 animate-pulse",
          type === 'avatar' ? 'rounded-full' : 'rounded-lg'
        )} />
      )}
      
      {/* Imagen real */}
      <img
        src={src}
        alt={alt}
        className={cn(
          imgClassName,
          isLoading ? 'opacity-0' : 'opacity-100',
          'transition-opacity duration-300'
        )}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
}

export default ImageWithFallback;
