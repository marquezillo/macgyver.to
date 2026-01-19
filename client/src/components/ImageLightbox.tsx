import { useState, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, Download, RotateCw, Maximize2 } from 'lucide-react';

interface ImageLightboxProps {
  src: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({ src, alt = 'Imagen', isOpen, onClose }: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          setScale(s => Math.min(s + 0.25, 5));
          break;
        case '-':
          setScale(s => Math.max(s - 0.25, 0.25));
          break;
        case 'r':
          setRotation(r => (r + 90) % 360);
          break;
        case '0':
          setScale(1);
          setPosition({ x: 0, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.25, 5));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.25, 0.25));
  const handleRotate = () => setRotation(r => (r + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `imagen-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback: open in new tab
      window.open(src, '_blank');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(s => Math.max(0.25, Math.min(5, s + delta)));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Toolbar */}
      <div 
        className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 md:gap-2 bg-white/10 backdrop-blur-md rounded-full px-2 md:px-4 py-1.5 md:py-2 z-10"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={handleZoomOut}
          className="p-1.5 md:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          title="Alejar (-)"
        >
          <ZoomOut className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <span className="text-white/80 text-xs md:text-sm min-w-[50px] md:min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-1.5 md:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          title="Acercar (+)"
        >
          <ZoomIn className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <div className="w-px h-6 bg-white/20 mx-1" />
        <button
          onClick={handleRotate}
          className="p-1.5 md:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          title="Rotar (R)"
        >
          <RotateCw className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <button
          onClick={handleReset}
          className="p-1.5 md:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          title="Restablecer (0)"
        >
          <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <div className="w-px h-6 bg-white/20 mx-1" />
        <button
          onClick={handleDownload}
          className="p-1.5 md:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          title="Descargar"
        >
          <Download className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
        title="Cerrar (Esc)"
      >
        <X size={24} />
      </button>

      {/* Image container */}
      <div
        className="relative max-w-[90vw] max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[85vh] object-contain select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
          draggable={false}
        />
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs hidden md:block">
        Esc: cerrar · +/-: zoom · R: rotar · 0: restablecer · Scroll: zoom
      </div>
    </div>
  );
}

// Inline image preview component for chat
interface ChatImagePreviewProps {
  src: string;
  alt?: string;
}

export function ChatImagePreview({ src, alt = 'Imagen generada' }: ChatImagePreviewProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `imagen-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      window.open(src, '_blank');
    }
  };

  return (
    <>
      <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 shadow-sm max-w-md bg-white">
        {/* Image with click to open lightbox */}
        <div 
          className="relative cursor-pointer group"
          onClick={() => setIsLightboxOpen(true)}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {hasError ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">No se pudo cargar la imagen</p>
              <a 
                href={src} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:underline mt-2 inline-block"
              >
                Abrir enlace
              </a>
            </div>
          ) : (
            <>
              <img 
                src={src} 
                alt={alt}
                className={`w-full h-auto transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                }}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center gap-2 text-white text-sm font-medium">
                  <ZoomIn className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Ver imagen</span>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Action bar */}
        {!hasError && (
          <div className="p-2 bg-gray-50 flex justify-between items-center border-t border-gray-100">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full" />
              Generada con IA
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="text-xs text-gray-600 hover:text-indigo-600 flex items-center gap-1 transition-colors"
              >
                <ZoomIn className="w-3 h-3" />
                Ampliar
              </button>
              <button
                onClick={handleDownload}
                className="text-xs text-gray-600 hover:text-indigo-600 flex items-center gap-1 transition-colors"
              >
                <Download className="w-3 h-3" />
                Descargar
              </button>
            </div>
          </div>
        )}
      </div>

      <ImageLightbox
        src={src}
        alt={alt}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />
    </>
  );
}
