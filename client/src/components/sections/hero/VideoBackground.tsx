import { useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { isValidVideoUrl } from '@/lib/imageUtils';

interface VideoBackgroundProps {
  src?: string;
  poster?: string;
  accentColor?: string;
}

export function VideoBackground({ 
  src, 
  poster,
  accentColor 
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const isValid = isValidVideoUrl(src);

  if (!isValid || hasError) {
    return (
      <div 
        className="absolute inset-0"
        style={{ 
          background: `linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)`
        }}
      >
        <div 
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: accentColor || '#6366f1' }}
        />
      </div>
    );
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        poster={poster}
        className="absolute inset-0 w-full h-full object-cover"
        onError={() => setHasError(true)}
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      
      {/* Mute/Unmute button */}
      <button
        onClick={toggleMute}
        className="absolute bottom-6 right-6 z-20 p-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
        aria-label={isMuted ? "Activar sonido" : "Silenciar"}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-white" />
        ) : (
          <Volume2 className="w-5 h-5 text-white" />
        )}
      </button>
    </>
  );
}
