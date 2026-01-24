import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, X, Phone, MessageCircle, Calendar, Mail, Sparkles } from 'lucide-react';

interface StickyCTAProps {
  text?: string;
  buttonText?: string;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'minimal' | 'expanded' | 'floating-button' | 'bottom-bar';
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center' | 'top-right';
  accentColor?: string;
  showAfterScroll?: number; // Pixels to scroll before showing
  icon?: 'arrow' | 'phone' | 'message' | 'calendar' | 'mail' | 'sparkles' | 'none';
  secondaryAction?: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
  dismissible?: boolean;
  className?: string;
}

const iconMap = {
  arrow: ArrowRight,
  phone: Phone,
  message: MessageCircle,
  calendar: Calendar,
  mail: Mail,
  sparkles: Sparkles,
  none: null,
};

export function StickyCTA({
  text = '¿Listo para empezar?',
  buttonText = 'Comenzar ahora',
  href = '#contact',
  onClick,
  variant = 'default',
  position = 'bottom-right',
  accentColor = '#6366f1',
  showAfterScroll = 500,
  icon = 'arrow',
  secondaryAction,
  dismissible = true,
  className,
}: StickyCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isDismissed) return;
      
      const scrollY = window.scrollY;
      const shouldShow = scrollY > showAfterScroll;
      
      // También ocultar cerca del footer
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const nearBottom = scrollY + windowHeight > documentHeight - 200;
      
      setIsVisible(shouldShow && !nearBottom);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfterScroll, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = href;
      }
    }
  };

  const IconComponent = icon !== 'none' ? iconMap[icon] : null;

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4 md:bottom-6 md:right-6',
    'bottom-left': 'bottom-4 left-4 md:bottom-6 md:left-6',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-20 right-4 md:right-6',
  };

  const variants = {
    hidden: {
      opacity: 0,
      y: position.includes('bottom') ? 20 : -20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  // Variante: Botón flotante simple
  if (variant === 'floating-button') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={cn(
              'fixed z-50',
              positionClasses[position],
              className
            )}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <Button
              onClick={handleClick}
              className="rounded-full shadow-lg hover:shadow-xl transition-shadow px-6 py-6 text-base font-medium"
              style={{
                background: accentColor,
                color: '#ffffff',
              }}
            >
              {IconComponent && <IconComponent className="w-5 h-5 mr-2" />}
              {buttonText}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Variante: Barra inferior fija
  if (variant === 'bottom-bar') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50 py-3 px-4 md:px-6',
              'backdrop-blur-lg border-t',
              className
            )}
            style={{
              background: `linear-gradient(to right, ${accentColor}15, ${accentColor}25)`,
              borderColor: `${accentColor}30`,
            }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <p className="text-sm md:text-base font-medium text-foreground hidden sm:block">
                {text}
              </p>
              <div className="flex items-center gap-3 flex-1 sm:flex-none justify-end">
                {secondaryAction && (
                  <Button
                    variant="ghost"
                    onClick={secondaryAction.onClick || (() => window.location.href = secondaryAction.href || '#')}
                    className="text-sm"
                  >
                    {secondaryAction.text}
                  </Button>
                )}
                <Button
                  onClick={handleClick}
                  className="text-sm md:text-base font-medium"
                  style={{
                    background: accentColor,
                    color: '#ffffff',
                  }}
                >
                  {IconComponent && <IconComponent className="w-4 h-4 mr-2" />}
                  {buttonText}
                </Button>
                {dismissible && (
                  <button
                    onClick={handleDismiss}
                    className="p-1 rounded-full hover:bg-foreground/10 transition-colors"
                    aria-label="Cerrar"
                  >
                    <X className="w-4 h-4 text-foreground/60" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Variante: Minimal (solo botón con glow)
  if (variant === 'minimal') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={cn(
              'fixed z-50',
              positionClasses[position],
              className
            )}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="relative">
              {/* Glow effect */}
              <div
                className="absolute inset-0 rounded-full blur-xl opacity-50"
                style={{ background: accentColor }}
              />
              <Button
                onClick={handleClick}
                className="relative rounded-full shadow-2xl px-6 py-6 text-base font-medium"
                style={{
                  background: accentColor,
                  color: '#ffffff',
                }}
              >
                {IconComponent && <IconComponent className="w-5 h-5" />}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Variante: Expanded (card con más info)
  if (variant === 'expanded') {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={cn(
              'fixed z-50',
              positionClasses[position],
              'w-80 max-w-[calc(100vw-2rem)]',
              className
            )}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div
              className="rounded-2xl shadow-2xl p-5 backdrop-blur-lg border"
              style={{
                background: `linear-gradient(135deg, ${accentColor}10, ${accentColor}05)`,
                borderColor: `${accentColor}30`,
              }}
            >
              {dismissible && (
                <button
                  onClick={handleDismiss}
                  className="absolute top-3 right-3 p-1 rounded-full hover:bg-foreground/10 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4 text-foreground/60" />
                </button>
              )}
              
              <div className="flex items-start gap-3 mb-4">
                {IconComponent && (
                  <div
                    className="p-2 rounded-lg"
                    style={{ background: `${accentColor}20` }}
                  >
                    <IconComponent
                      className="w-5 h-5"
                      style={{ color: accentColor }}
                    />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">{text}</p>
                  <p className="text-sm text-foreground/60 mt-1">
                    No te pierdas esta oportunidad
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleClick}
                  className="flex-1 font-medium"
                  style={{
                    background: accentColor,
                    color: '#ffffff',
                  }}
                >
                  {buttonText}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                {secondaryAction && (
                  <Button
                    variant="outline"
                    onClick={secondaryAction.onClick || (() => window.location.href = secondaryAction.href || '#')}
                    className="px-4"
                  >
                    {secondaryAction.text}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Variante: Default (card compacta)
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            'fixed z-50',
            positionClasses[position],
            className
          )}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={variants}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div
            className="rounded-xl shadow-2xl p-4 backdrop-blur-lg border flex items-center gap-3"
            style={{
              background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}08)`,
              borderColor: `${accentColor}25`,
            }}
          >
            <p className="text-sm font-medium text-foreground max-w-[150px]">
              {text}
            </p>
            <Button
              onClick={handleClick}
              size="sm"
              className="font-medium whitespace-nowrap"
              style={{
                background: accentColor,
                color: '#ffffff',
              }}
            >
              {buttonText}
              {IconComponent && <IconComponent className="w-4 h-4 ml-1" />}
            </Button>
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="p-1 rounded-full hover:bg-foreground/10 transition-colors ml-1"
                aria-label="Cerrar"
              >
                <X className="w-3 h-3 text-foreground/60" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default StickyCTA;
