import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Globe, Mail, Phone, MapPin } from 'lucide-react';
import { isLightColor } from '@/lib/colorUtils';
import type { FooterContent, FooterStyles, FooterLink, FooterColumn, SocialLink } from '@shared/sectionTypes';

interface FooterSectionProps {
  id: string;
  content: FooterContent;
  styles?: FooterStyles;
}

const socialIcons: Record<string, typeof Facebook> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: Globe,
  whatsapp: Globe,
  pinterest: Globe,
};

// isLightColor now imported from @/lib/colorUtils

export function FooterSection({ id, content, styles = {} }: FooterSectionProps) {
  const { selectedSectionId, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === id;

  // Determinar colores basados en el fondo
  const bgColor = styles?.backgroundColor || 'bg-gray-900';
  const isLightBg = isLightColor(bgColor);
  
  // Colores de texto que garantizan contraste
  const primaryTextColor = styles?.textColor || (isLightBg ? '#111827' : '#ffffff');
  const secondaryTextColor = styles?.textColor || (isLightBg ? '#4b5563' : '#9ca3af');
  const borderColor = isLightBg ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';

  const columns = content?.columns || [
    {
      title: 'Servicios',
      links: [
        { label: 'Solicitud Online', href: '#' },
        { label: 'Verificar Estado', href: '#' },
        { label: 'Preguntas Frecuentes', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Términos y Condiciones', href: '#' },
        { label: 'Política de Privacidad', href: '#' },
        { label: 'Política de Reembolso', href: '#' },
      ],
    },
  ];

  // Handle both array and object formats for socialLinks
  const rawSocialLinks = content?.socialLinks;
  const socialLinks: SocialLink[] = Array.isArray(rawSocialLinks) 
    ? rawSocialLinks 
    : rawSocialLinks 
      ? Object.entries(rawSocialLinks)
          .filter(([_, href]) => href)
          .map(([platform, href]) => ({ platform, href: href as string }))
      : [
          { platform: 'facebook', href: '#' },
          { platform: 'twitter', href: '#' },
          { platform: 'instagram', href: '#' },
        ];

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectSection(id);
      }}
      className={cn(
        "relative py-8 md:py-12 px-4 sm:px-6 lg:px-8 transition-all duration-200",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      style={{ backgroundColor: bgColor.startsWith('#') || bgColor.startsWith('rgb') ? bgColor : undefined }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <h3 
              className="text-lg md:text-xl font-bold mb-3 md:mb-4"
              style={{ color: primaryTextColor }}
            >
              {content?.companyName || "Mi Empresa"}
            </h3>
            {content?.description && (
              <p 
                className="text-sm mb-4"
                style={{ color: secondaryTextColor }}
              >
                {content.description}
              </p>
            )}
            
            {/* Contact Info */}
            <div className="space-y-2">
              {content?.contactEmail && (
                <a 
                  href={`mailto:${content.contactEmail}`}
                  className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
                  style={{ color: secondaryTextColor }}
                >
                  <Mail className="h-4 w-4" />
                  {content.contactEmail}
                </a>
              )}
              {content?.contactPhone && (
                <a 
                  href={`tel:${content.contactPhone}`}
                  className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
                  style={{ color: secondaryTextColor }}
                >
                  <Phone className="h-4 w-4" />
                  {content.contactPhone}
                </a>
              )}
              {content?.address && (
                <p 
                  className="flex items-center gap-2 text-sm"
                  style={{ color: secondaryTextColor }}
                >
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  {content.address}
                </p>
              )}
            </div>
          </div>

          {/* Link Columns */}
          {columns.map((column: FooterColumn, index: number) => (
            <div key={index}>
              <h4 
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: primaryTextColor }}
              >
                {column.title}
              </h4>
              <ul className="space-y-2">
                {(column.links || []).map((link: FooterLink, linkIndex: number) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-sm hover:opacity-80 transition-opacity"
                      style={{ color: secondaryTextColor }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social Links */}
          <div>
            <h4 
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: primaryTextColor }}
            >
              Síguenos
            </h4>
            <div className="flex gap-4">
              {socialLinks.map((social: SocialLink, index: number) => {
                const Icon = socialIcons[social.platform.toLowerCase()] || Globe;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="p-2 rounded-full transition-colors"
                    style={{ 
                      backgroundColor: styles?.accentColor || (isLightBg ? '#e5e7eb' : '#374151'),
                      color: isLightBg ? '#111827' : '#ffffff'
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div 
          className="mt-8 md:mt-12 pt-6 md:pt-8 border-t text-center text-xs md:text-sm"
          style={{ 
            color: secondaryTextColor,
            borderColor: borderColor
          }}
        >
          {content?.copyright || `© ${new Date().getFullYear()} Todos los derechos reservados.`}
        </div>
      </div>
    </div>
  );
}
