import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin';
  href: string;
}

interface FooterSectionProps {
  id: string;
  content: {
    companyName?: string;
    description?: string;
    columns?: FooterColumn[];
    socialLinks?: SocialLink[];
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    copyright?: string;
  };
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
  };
}

const socialIcons = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
};

export function FooterSection({ id, content, styles = {} }: FooterSectionProps) {
  const { selectedSectionId, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === id;

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

  const socialLinks = content?.socialLinks || [
    { platform: 'facebook' as const, href: '#' },
    { platform: 'twitter' as const, href: '#' },
    { platform: 'instagram' as const, href: '#' },
  ];

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectSection(id);
      }}
      className={cn(
        "relative py-12 px-4 sm:px-6 lg:px-8 transition-all duration-200",
        isSelected && "ring-2 ring-primary ring-offset-2",
        styles?.backgroundColor || "bg-gray-900"
      )}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <h3 
              className={cn(
                "text-xl font-bold mb-4",
                styles?.textColor || "text-white"
              )}
            >
              {content?.companyName || "Mi Empresa"}
            </h3>
            {content?.description && (
              <p 
                className={cn(
                  "text-sm mb-4",
                  styles?.textColor ? "opacity-80" : "text-gray-400"
                )}
                style={{ color: styles?.textColor }}
              >
                {content.description}
              </p>
            )}
            
            {/* Contact Info */}
            <div className="space-y-2">
              {content?.contactEmail && (
                <a 
                  href={`mailto:${content.contactEmail}`}
                  className={cn(
                    "flex items-center gap-2 text-sm hover:opacity-80 transition-opacity",
                    styles?.textColor ? "opacity-80" : "text-gray-400"
                  )}
                  style={{ color: styles?.textColor }}
                >
                  <Mail className="h-4 w-4" />
                  {content.contactEmail}
                </a>
              )}
              {content?.contactPhone && (
                <a 
                  href={`tel:${content.contactPhone}`}
                  className={cn(
                    "flex items-center gap-2 text-sm hover:opacity-80 transition-opacity",
                    styles?.textColor ? "opacity-80" : "text-gray-400"
                  )}
                  style={{ color: styles?.textColor }}
                >
                  <Phone className="h-4 w-4" />
                  {content.contactPhone}
                </a>
              )}
              {content?.address && (
                <p 
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    styles?.textColor ? "opacity-80" : "text-gray-400"
                  )}
                  style={{ color: styles?.textColor }}
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
                className={cn(
                  "text-sm font-semibold uppercase tracking-wider mb-4",
                  styles?.textColor || "text-white"
                )}
              >
                {column.title}
              </h4>
              <ul className="space-y-2">
                {column.links.map((link: FooterLink, linkIndex: number) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className={cn(
                        "text-sm hover:opacity-80 transition-opacity",
                        styles?.textColor ? "opacity-70" : "text-gray-400 hover:text-white"
                      )}
                      style={{ color: styles?.textColor }}
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
              className={cn(
                "text-sm font-semibold uppercase tracking-wider mb-4",
                styles?.textColor || "text-white"
              )}
            >
              Síguenos
            </h4>
            <div className="flex gap-4">
              {socialLinks.map((social: SocialLink, index: number) => {
                const Icon = socialIcons[social.platform];
                return (
                  <a
                    key={index}
                    href={social.href}
                    className={cn(
                      "p-2 rounded-full transition-colors",
                      styles?.accentColor 
                        ? "hover:opacity-80" 
                        : "bg-gray-800 hover:bg-gray-700 text-white"
                    )}
                    style={{ backgroundColor: styles?.accentColor }}
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
          className={cn(
            "mt-12 pt-8 border-t text-center text-sm",
            styles?.textColor ? "opacity-60 border-current/20" : "text-gray-400 border-gray-800"
          )}
          style={{ color: styles?.textColor }}
        >
          {content?.copyright || `© ${new Date().getFullYear()} Todos los derechos reservados.`}
        </div>
      </div>
    </div>
  );
}
