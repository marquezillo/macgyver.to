import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Mail } from 'lucide-react';

interface AboutSectionProps {
  id: string;
  content: any;
  styles?: any;
}

export function AboutSection({ id, content, styles = {} }: AboutSectionProps) {
  const { selectedSectionId, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === id;

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
                  backgroundColor: styles?.accentColor ? `${styles.accentColor}20` : '#6366f120',
                  color: styles?.accentColor || '#6366f1'
                }}
              >
                {content.badge}
              </span>
            )}
            
            <h2 
              className={cn(
                "text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight",
                styles?.textColor || "text-gray-900"
              )}
            >
              {content?.title || "About Our Company"}
            </h2>
            
            <p 
              className={cn(
                "mt-6 text-lg leading-relaxed",
                styles?.textColor ? "opacity-80" : "text-gray-600"
              )}
              style={{ color: styles?.textColor }}
            >
              {content?.description || "We are a team of passionate individuals dedicated to creating exceptional experiences for our customers."}
            </p>

            {content?.highlights && (
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
                      style={{ backgroundColor: styles?.accentColor || '#6366f1' }}
                    >
                      ✓
                    </span>
                    <span className={cn(
                      "text-base",
                      styles?.textColor ? "opacity-80" : "text-gray-700"
                    )}
                    style={{ color: styles?.textColor }}
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
                style={{ backgroundColor: styles?.accentColor || '#6366f1' }}
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
            {content?.image ? (
              <img
                src={content.image}
                alt={content?.imageAlt || "About us"}
                className="rounded-2xl shadow-2xl w-full h-auto object-cover"
              />
            ) : (
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-400 text-lg">Company Image</span>
              </div>
            )}
            
            {/* Decorative element */}
            <div 
              className="absolute -bottom-6 -right-6 w-24 h-24 rounded-2xl -z-10"
              style={{ backgroundColor: styles?.accentColor || '#6366f1' }}
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
                className={cn(
                  "text-2xl md:text-3xl font-bold",
                  styles?.textColor || "text-gray-900"
                )}
              >
                {content?.teamTitle || "Meet Our Team"}
              </h3>
              {content?.teamSubtitle && (
                <p 
                  className={cn(
                    "mt-4 text-lg max-w-2xl mx-auto",
                    styles?.textColor ? "opacity-70" : "text-gray-600"
                  )}
                  style={{ color: styles?.textColor }}
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
              {team.map((member: any, index: number) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="text-center group"
                >
                  {/* Avatar */}
                  <div className="relative inline-block mb-4">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-32 h-32 rounded-full object-cover mx-auto ring-4 ring-white shadow-lg group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div 
                        className="w-32 h-32 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white shadow-lg"
                        style={{ backgroundColor: styles?.accentColor || '#6366f1' }}
                      >
                        {member.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <h4 
                    className={cn(
                      "text-lg font-semibold",
                      styles?.textColor || "text-gray-900"
                    )}
                  >
                    {member.name}
                  </h4>
                  <p 
                    className={cn(
                      "text-sm mt-1",
                      styles?.textColor ? "opacity-70" : "text-gray-500"
                    )}
                    style={{ color: styles?.textColor }}
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
