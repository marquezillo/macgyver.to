import { motion, type Transition } from 'framer-motion';
import { cn } from '@/lib/utils';
import React from 'react';

interface FloatingElementsProps {
  variant?: 'minimal' | 'abundant' | 'geometric' | 'organic' | 'dots' | 'lines';
  accentColor?: string;
  secondaryColor?: string;
  opacity?: number;
  className?: string;
  density?: 'low' | 'medium' | 'high';
}

// Animaciones predefinidas
const floatAnimation = {
  y: [0, -20, 0],
};

const floatTransition: Transition = {
  duration: 6,
  repeat: Infinity,
  ease: 'easeInOut',
};

const floatSlowAnimation = {
  y: [0, -15, 0],
  x: [0, 10, 0],
};

const floatSlowTransition: Transition = {
  duration: 8,
  repeat: Infinity,
  ease: 'easeInOut',
};

const pulseAnimation = {
  scale: [1, 1.1, 1],
  opacity: [0.5, 0.8, 0.5],
};

const pulseTransition: Transition = {
  duration: 4,
  repeat: Infinity,
  ease: 'easeInOut',
};

const rotateAnimation = {
  rotate: [0, 360],
};

const rotateTransition: Transition = {
  duration: 20,
  repeat: Infinity,
  ease: 'linear',
};

const driftAnimation = {
  x: [0, 30, 0, -30, 0],
  y: [0, -20, 0, 20, 0],
};

const driftTransition: Transition = {
  duration: 12,
  repeat: Infinity,
  ease: 'easeInOut',
};

// Componentes de elementos individuales
function FloatingCircle({
  size,
  color,
  blur = false,
  style,
  animation = 'float',
  delay = 0,
}: {
  size: number;
  color: string;
  blur?: boolean;
  style?: React.CSSProperties;
  animation?: 'float' | 'pulse' | 'drift';
  delay?: number;
}) {
  const animations = {
    float: floatAnimation,
    pulse: pulseAnimation,
    drift: driftAnimation,
  };

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        background: color,
        filter: blur ? 'blur(40px)' : 'none',
        ...style,
      }}
      animate={animations[animation]}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ ...floatTransition, delay }}
    />
  );
}

function FloatingRing({
  size,
  color,
  strokeWidth = 2,
  style,
  delay = 0,
}: {
  size: number;
  color: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
  delay?: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        border: `${strokeWidth}px solid ${color}`,
        ...style,
      }}
      animate={floatSlowAnimation}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ ...floatSlowTransition, delay }}
    />
  );
}

function FloatingLine({
  length,
  color,
  angle = 0,
  style,
  delay = 0,
}: {
  length: number;
  color: string;
  angle?: number;
  style?: React.CSSProperties;
  delay?: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: length,
        height: 2,
        background: color,
        transform: `rotate(${angle}deg)`,
        ...style,
      }}
      animate={{
        opacity: [0.3, 0.6, 0.3],
        scaleX: [1, 1.2, 1],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  );
}

function FloatingDot({
  size,
  color,
  style,
  delay = 0,
}: {
  size: number;
  color: string;
  style?: React.CSSProperties;
  delay?: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        background: color,
        ...style,
      }}
      animate={pulseAnimation}
      transition={{ ...pulseTransition, delay }}
    />
  );
}

function FloatingSquare({
  size,
  color,
  style,
  delay = 0,
}: {
  size: number;
  color: string;
  style?: React.CSSProperties;
  delay?: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: size,
        height: size,
        background: color,
        ...style,
      }}
      animate={{
        ...rotateAnimation,
        ...floatAnimation,
      }}
      transition={{ ...rotateTransition, delay }}
    />
  );
}

function FloatingTriangle({
  size,
  color,
  style,
  delay = 0,
}: {
  size: number;
  color: string;
  style?: React.CSSProperties;
  delay?: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: 0,
        height: 0,
        borderLeft: `${size / 2}px solid transparent`,
        borderRight: `${size / 2}px solid transparent`,
        borderBottom: `${size}px solid ${color}`,
        ...style,
      }}
      animate={driftAnimation}
      transition={{ ...driftTransition, delay }}
    />
  );
}

function FloatingBlob({
  size,
  color,
  style,
  delay = 0,
}: {
  size: number;
  color: string;
  style?: React.CSSProperties;
  delay?: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: size,
        height: size,
        background: color,
        borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
        filter: 'blur(30px)',
        ...style,
      }}
      animate={{
        borderRadius: [
          '60% 40% 30% 70% / 60% 30% 70% 40%',
          '30% 60% 70% 40% / 50% 60% 30% 60%',
          '60% 40% 30% 70% / 60% 30% 70% 40%',
        ],
        ...floatSlowAnimation,
      }}
      transition={{ ...floatSlowTransition, delay }}
    />
  );
}

// Variantes de patrones
function MinimalPattern({ accentColor, opacity }: { accentColor: string; opacity: number }) {
  return (
    <>
      <FloatingCircle
        size={300}
        color={accentColor}
        blur
        style={{ top: '10%', right: '-5%', opacity: opacity * 0.3 }}
        animation="drift"
      />
      <FloatingCircle
        size={200}
        color={accentColor}
        blur
        style={{ bottom: '20%', left: '-5%', opacity: opacity * 0.2 }}
        animation="float"
        delay={1}
      />
      <FloatingRing
        size={100}
        color={accentColor}
        style={{ top: '30%', left: '10%', opacity: opacity * 0.3 }}
        delay={0.5}
      />
    </>
  );
}

function AbundantPattern({ accentColor, secondaryColor, opacity }: { accentColor: string; secondaryColor: string; opacity: number }) {
  return (
    <>
      {/* Blobs grandes de fondo */}
      <FloatingBlob
        size={400}
        color={accentColor}
        style={{ top: '-10%', right: '-10%', opacity: opacity * 0.15 }}
        delay={0}
      />
      <FloatingBlob
        size={350}
        color={secondaryColor}
        style={{ bottom: '-5%', left: '-10%', opacity: opacity * 0.12 }}
        delay={0.5}
      />
      
      {/* Círculos medianos */}
      <FloatingCircle
        size={150}
        color={accentColor}
        blur
        style={{ top: '20%', left: '15%', opacity: opacity * 0.25 }}
        animation="float"
        delay={0.3}
      />
      <FloatingCircle
        size={100}
        color={secondaryColor}
        blur
        style={{ top: '60%', right: '20%', opacity: opacity * 0.2 }}
        animation="pulse"
        delay={0.8}
      />
      
      {/* Anillos */}
      <FloatingRing
        size={80}
        color={accentColor}
        style={{ top: '40%', left: '5%', opacity: opacity * 0.4 }}
        delay={0.2}
      />
      <FloatingRing
        size={60}
        color={secondaryColor}
        strokeWidth={1}
        style={{ bottom: '30%', right: '10%', opacity: opacity * 0.3 }}
        delay={0.6}
      />
      
      {/* Puntos pequeños */}
      <FloatingDot
        size={8}
        color={accentColor}
        style={{ top: '25%', right: '30%', opacity: opacity * 0.6 }}
        delay={0.1}
      />
      <FloatingDot
        size={6}
        color={secondaryColor}
        style={{ top: '70%', left: '25%', opacity: opacity * 0.5 }}
        delay={0.4}
      />
      <FloatingDot
        size={10}
        color={accentColor}
        style={{ bottom: '40%', right: '40%', opacity: opacity * 0.4 }}
        delay={0.7}
      />
    </>
  );
}

function GeometricPattern({ accentColor, secondaryColor, opacity }: { accentColor: string; secondaryColor: string; opacity: number }) {
  return (
    <>
      {/* Cuadrados */}
      <FloatingSquare
        size={40}
        color={accentColor}
        style={{ top: '15%', right: '20%', opacity: opacity * 0.3 }}
        delay={0}
      />
      <FloatingSquare
        size={25}
        color={secondaryColor}
        style={{ bottom: '25%', left: '15%', opacity: opacity * 0.25 }}
        delay={0.4}
      />
      
      {/* Triángulos */}
      <FloatingTriangle
        size={50}
        color={accentColor}
        style={{ top: '50%', left: '8%', opacity: opacity * 0.2 }}
        delay={0.2}
      />
      <FloatingTriangle
        size={35}
        color={secondaryColor}
        style={{ top: '30%', right: '12%', opacity: opacity * 0.25 }}
        delay={0.6}
      />
      
      {/* Líneas */}
      <FloatingLine
        length={100}
        color={accentColor}
        angle={45}
        style={{ top: '20%', left: '30%', opacity: opacity * 0.3 }}
        delay={0.1}
      />
      <FloatingLine
        length={80}
        color={secondaryColor}
        angle={-30}
        style={{ bottom: '35%', right: '25%', opacity: opacity * 0.25 }}
        delay={0.5}
      />
      
      {/* Círculos pequeños */}
      <FloatingDot
        size={12}
        color={accentColor}
        style={{ top: '65%', right: '35%', opacity: opacity * 0.4 }}
        delay={0.3}
      />
      <FloatingRing
        size={50}
        color={secondaryColor}
        strokeWidth={1}
        style={{ bottom: '15%', right: '8%', opacity: opacity * 0.3 }}
        delay={0.7}
      />
    </>
  );
}

function OrganicPattern({ accentColor, secondaryColor, opacity }: { accentColor: string; secondaryColor: string; opacity: number }) {
  return (
    <>
      {/* Blobs orgánicos */}
      <FloatingBlob
        size={500}
        color={accentColor}
        style={{ top: '-15%', right: '-15%', opacity: opacity * 0.1 }}
        delay={0}
      />
      <FloatingBlob
        size={400}
        color={secondaryColor}
        style={{ bottom: '-10%', left: '-15%', opacity: opacity * 0.08 }}
        delay={0.3}
      />
      <FloatingBlob
        size={250}
        color={accentColor}
        style={{ top: '40%', left: '5%', opacity: opacity * 0.12 }}
        delay={0.6}
      />
      
      {/* Círculos suaves */}
      <FloatingCircle
        size={180}
        color={secondaryColor}
        blur
        style={{ top: '25%', right: '10%', opacity: opacity * 0.15 }}
        animation="drift"
        delay={0.2}
      />
      <FloatingCircle
        size={120}
        color={accentColor}
        blur
        style={{ bottom: '30%', right: '30%', opacity: opacity * 0.12 }}
        animation="float"
        delay={0.5}
      />
    </>
  );
}

function DotsPattern({ accentColor, secondaryColor, opacity }: { accentColor: string; secondaryColor: string; opacity: number }) {
  const dots = [];
  for (let i = 0; i < 15; i++) {
    const size = 4 + Math.random() * 8;
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    const color = i % 2 === 0 ? accentColor : secondaryColor;
    const delay = Math.random() * 2;
    
    dots.push(
      <FloatingDot
        key={i}
        size={size}
        color={color}
        style={{
          top: `${top}%`,
          left: `${left}%`,
          opacity: opacity * (0.3 + Math.random() * 0.4),
        }}
        delay={delay}
      />
    );
  }
  return <>{dots}</>;
}

function LinesPattern({ accentColor, secondaryColor, opacity }: { accentColor: string; secondaryColor: string; opacity: number }) {
  return (
    <>
      <FloatingLine
        length={150}
        color={accentColor}
        angle={30}
        style={{ top: '15%', left: '10%', opacity: opacity * 0.3 }}
        delay={0}
      />
      <FloatingLine
        length={120}
        color={secondaryColor}
        angle={-45}
        style={{ top: '30%', right: '15%', opacity: opacity * 0.25 }}
        delay={0.3}
      />
      <FloatingLine
        length={100}
        color={accentColor}
        angle={60}
        style={{ bottom: '25%', left: '20%', opacity: opacity * 0.2 }}
        delay={0.6}
      />
      <FloatingLine
        length={80}
        color={secondaryColor}
        angle={-15}
        style={{ bottom: '40%', right: '25%', opacity: opacity * 0.25 }}
        delay={0.9}
      />
      <FloatingLine
        length={60}
        color={accentColor}
        angle={75}
        style={{ top: '60%', left: '5%', opacity: opacity * 0.2 }}
        delay={1.2}
      />
    </>
  );
}

export function FloatingElements({
  variant = 'minimal',
  accentColor = '#6366f1',
  secondaryColor,
  opacity = 1,
  className,
  density = 'medium',
}: FloatingElementsProps) {
  // Calcular color secundario si no se proporciona
  const secondary = secondaryColor || adjustColorBrightness(accentColor, 40);
  
  // Ajustar opacidad según densidad
  const densityMultiplier = {
    low: 0.6,
    medium: 1,
    high: 1.4,
  };
  const adjustedOpacity = opacity * densityMultiplier[density];

  const patterns: Record<string, React.ReactNode> = {
    minimal: <MinimalPattern accentColor={accentColor} opacity={adjustedOpacity} />,
    abundant: <AbundantPattern accentColor={accentColor} secondaryColor={secondary} opacity={adjustedOpacity} />,
    geometric: <GeometricPattern accentColor={accentColor} secondaryColor={secondary} opacity={adjustedOpacity} />,
    organic: <OrganicPattern accentColor={accentColor} secondaryColor={secondary} opacity={adjustedOpacity} />,
    dots: <DotsPattern accentColor={accentColor} secondaryColor={secondary} opacity={adjustedOpacity} />,
    lines: <LinesPattern accentColor={accentColor} secondaryColor={secondary} opacity={adjustedOpacity} />,
  };

  return (
    <div
      className={cn(
        'absolute inset-0 overflow-hidden pointer-events-none z-0',
        className
      )}
      aria-hidden="true"
    >
      {patterns[variant] || patterns.minimal}
    </div>
  );
}

// Utilidad para ajustar brillo de color
function adjustColorBrightness(hex: string, percent: number): string {
  // Remover # si existe
  hex = hex.replace('#', '');
  
  // Convertir a RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Ajustar brillo
  r = Math.min(255, Math.max(0, r + (percent * 2.55)));
  g = Math.min(255, Math.max(0, g + (percent * 2.55)));
  b = Math.min(255, Math.max(0, b + (percent * 2.55)));
  
  // Convertir de vuelta a hex
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

export default FloatingElements;
