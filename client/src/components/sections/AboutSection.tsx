import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Mail, ImageOff, Building2 } from 'lucide-react';
import { useState } from 'react';

interface TeamMember {
  name: string;
  role?: string;
  image?: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
}

interface AboutSectionProps {
  id: string;
  content: {
    title?: string;
    description?: string;
    badge?: string;
    image?: string;
    imageAlt?: string;
    highlights?: string[];
    ctaText?: string;
    team?: TeamMember[];
    teamTitle?: string;
    teamSubtitle?: string;
  };
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
  };
}

// Función para validar URLs de imagen
const isValidImageUrl = (url?: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  if (url.trim() === '' || url === 'undefined' || url === 'null') return false;
  if (!url.startsWith('http') && !url.startsWith('/') && !url.startsWith('data:')) return false;
  
  const badPatterns = ['placeholder.com', 'via.placeholder', 'placehold.it', 'dummyimage.com'];
  return !badPatterns.some(pattern => url.includes(pattern));
};

// Generar color basado en texto
const getColorFromText = (text: string, baseColor: string = '#6366f1'): string => {
  if (!text) return baseColor;
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'];
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

// Obtener iniciales
const getInitials = (name: string): string => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

// Componente de imagen principal con fallback
function MainImageWithFallback({ 
  src, 
  alt, 
  accentColor 
}: { 
  src?: string; 
  alt?: string; 
  accentColor?: string;
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isValid = isValidImageUrl(src);
  const showFallback = !isValid || hasError;
  const color = accentColor || '#6366f1';

  if (showFallback) {
    return (
      <div 
        className="aspect-[4/3] rounded-2xl flex flex-col items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${color}10, ${color}25)` }}
      >
        <Building2 className="w-16 h-16 mb-4 opacity-30" style={{ color }} />
        <span className="text-sm font-medium opacity-40" style={{ color }}>
          {alt || 'Company Image'}
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div 
          className="absolute inset-0 rounded-2xl animate-pulse"
          style={{ backgroundColor: `${color}15` }}
        />
      )}
      <img
        src={src}
        alt={alt || "About us"}
        className={cn(
          "rounded-2xl shadow-2xl w-full h-auto object-cover transition-opacity duration-300",
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}

// Componente de avatar de equipo con fallback
function TeamAvatarWithFallback({ 
  member, 
  accentColor 
}: { 
  member: TeamMember; 
  accentColor?: string;
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isValid = isValidImageUrl(member.image);
  const showFallback = !isValid || hasError;
  const color = getColorFromText(member.name, accentColor);

  if (showFallback) {
    return (
      <div 
        className="w-32 h-32 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white shadow-lg"
        style={{ backgroundColor: color }}
      >
        {getInitials(member.name)}
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      {isLoading && (
        <div 
          className="absolute inset-0 rounded-full animate-pulse"
          style={{ backgroundColor: `${color}30` }}
        />
      )}
      <img
        src={member.image}
        alt={member.name}
        className={cn(
          "w-32 h-32 rounded-full object-cover mx-auto ring-4 ring-white shadow-lg group-hover:scale-105 transition-all duration-300",
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}

export function AboutSection({ id, content, styles = {} }: AboutSectionProps) {
  const { selectedSectionId, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === id;
  const accentColor = styles?.accentColor || '#6366f1';

  const team = content?.team || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectSection(id);
      }}
      className={cn(
        "py-16 md:py-24 px-4 sm:px-6 lg:px-8 transition-all duration-200",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      style={{ backgroundColor: styles?.backgroundColor || '#ffffff' }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Main Content - Split Layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {content?.badge && (
              <span 
                className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4"
                style={{ 
                  backgroundColor: `${accentColor}20`,
                  color: accentColor
                }}
              >
                {content.badge}
              </span>
            )}
            
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
              style={{ color: styles?.textColor || '#111827' }}
            >
              {content?.title || "About Our Company"}
            </h2>
            
            <p 
              className="mt-6 text-lg leading-relaxed opacity-80"
              style={{ color: styles?.textColor || '#4b5563' }}
            >
              {content?.description || "We are a team of passionate individuals dedicated to creating exceptional experiences for our customers."}
            </p>

            {content?.highlights && content.highlights.length > 0 && (
              <ul className="mt-8 space-y-4">
                {content.highlights.map((highlight: string, index: number) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span 
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: accentColor }}
                    >
                      ✓
                    </span>
                    <span 
                      className="text-base opacity-80"
                      style={{ color: styles?.textColor || '#374151' }}
                    >
                      {highlight}
                    </span>
                  </motion.li>
                ))}
              </ul>
            )}

            {content?.ctaText && (
              <motion.button
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="mt-8 px-8 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: accentColor }}
              >
                {content.ctaText}
              </motion.button>
            )}
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <MainImageWithFallback 
              src={content?.image} 
              alt={content?.imageAlt}
              accentColor={accentColor}
            />
            
            {/* Decorative element */}
            <div 
              className="absolute -bottom-6 -right-6 w-24 h-24 rounded-2xl -z-10"
              style={{ backgroundColor: accentColor }}
            />
          </motion.div>
        </div>

        {/* Team Section */}
        {team.length > 0 && (
          <div className="mt-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h3 
                className="text-2xl md:text-3xl font-bold"
                style={{ color: styles?.textColor || '#111827' }}
              >
                {content?.teamTitle || "Meet Our Team"}
              </h3>
              {content?.teamSubtitle && (
                <p 
                  className="mt-4 text-lg max-w-2xl mx-auto opacity-70"
                  style={{ color: styles?.textColor || '#4b5563' }}
                >
                  {content.teamSubtitle}
                </p>
              )}
            </motion.div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={cn(
                "grid gap-8",
                team.length === 2 ? "md:grid-cols-2 max-w-2xl mx-auto" :
                team.length === 3 ? "md:grid-cols-3" :
                "md:grid-cols-4"
              )}
            >
              {team.map((member: TeamMember, index: number) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="text-center group"
                >
                  {/* Avatar */}
                  <div className="relative inline-block mb-4">
                    <TeamAvatarWithFallback member={member} accentColor={accentColor} />
                  </div>

                  {/* Info */}
                  <h4 
                    className="text-lg font-semibold"
                    style={{ color: styles?.textColor || '#111827' }}
                  >
                    {member.name}
                  </h4>
                  <p 
                    className="text-sm mt-1 opacity-70"
                    style={{ color: styles?.textColor || '#6b7280' }}
                  >
                    {member.role}
                  </p>

                  {/* Social Links */}
                  {(member.linkedin || member.twitter || member.email) && (
                    <div className="mt-3 flex justify-center gap-3">
                      {member.linkedin && (
                        <a href={member.linkedin} className="text-gray-400 hover:text-blue-600 transition-colors">
                          <Linkedin className="w-5 h-5" />
                        </a>
                      )}
                      {member.twitter && (
                        <a href={member.twitter} className="text-gray-400 hover:text-blue-400 transition-colors">
                          <Twitter className="w-5 h-5" />
                        </a>
                      )}
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="text-gray-400 hover:text-gray-600 transition-colors">
                          <Mail className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
