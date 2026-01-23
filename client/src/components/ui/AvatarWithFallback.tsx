import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AvatarWithFallbackProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  accentColor?: string;
}

/**
 * Componente de avatar con fallback automático a iniciales
 * - Valida la URL antes de intentar cargar
 * - Muestra iniciales con color consistente si la imagen falla
 * - Soporta múltiples tamaños
 */
export function AvatarWithFallback({
  src,
  name,
  size = 'md',
  className = '',
  accentColor = '#6366f1'
}: AvatarWithFallbackProps) {
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
      'loremflickr.com',
      'randomuser.me', // A veces falla
      'i.pravatar.cc', // A veces falla
      'ui-avatars.com' // A veces falla
    ];
    
    if (knownBadPatterns.some(pattern => url.includes(pattern))) {
      return false;
    }
    
    return true;
  };

  // Generar iniciales
  const getInitials = (text: string): string => {
    if (!text) return 'U';
    return text
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generar color de fondo basado en el nombre (para consistencia)
  const getColorFromName = (text: string): string => {
    if (!text) return accentColor;
    
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

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl'
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Renderizar fallback con iniciales
  const renderFallback = () => {
    const bgColor = getColorFromName(name);
    
    return (
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-semibold text-white",
          sizeClasses[size],
          className
        )}
        style={{ backgroundColor: bgColor }}
      >
        {getInitials(name)}
      </div>
    );
  };

  // Si no hay URL válida o hay error, mostrar fallback
  if (!isValidUrl || hasError) {
    return renderFallback();
  }

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 rounded-full bg-gray-200 animate-pulse" />
      )}
      
      {/* Imagen real */}
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-full object-cover w-full h-full ring-2 ring-white shadow",
          isLoading ? 'opacity-0' : 'opacity-100',
          'transition-opacity duration-300'
        )}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
}

export default AvatarWithFallback;
