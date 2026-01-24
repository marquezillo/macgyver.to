import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderSectionProps {
  id: string;
  content: any;
  styles?: any;
}

export function HeaderSection({ id, content, styles = {} }: HeaderSectionProps) {
  const { selectedSectionId, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === id;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = content?.navItems || [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  const isDark = styles?.backgroundColor && 
    (styles.backgroundColor.includes('#0') || 
     styles.backgroundColor.includes('#1') || 
     styles.backgroundColor.includes('#2') ||
     styles.backgroundColor === '#000' ||
     styles.backgroundColor === 'black');

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectSection(id);
      }}
      className={cn(
        "sticky top-0 z-50 transition-all duration-200",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "px-4 sm:px-6 lg:px-8 py-4 backdrop-blur-md border-b",
          isDark 
            ? "bg-gray-900/90 border-gray-800" 
            : "bg-white/90 border-gray-200"
        )}
        style={{ 
          backgroundColor: styles?.backgroundColor 
            ? `${styles.backgroundColor}e6` // Add transparency
            : undefined 
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            {content?.logo ? (
              <img 
                src={content.logo} 
                alt={content?.logoAlt || 'Logo'} 
                className="h-8 md:h-10 w-auto"
              />
            ) : (
              <span 
                className={cn(
                  "text-xl md:text-2xl font-bold",
                  isDark ? "text-white" : "text-gray-900"
                )}
                style={{ color: styles?.textColor }}
              >
                {content?.logoText || 'Brand'}
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item: any, index: number) => {
              // Si es una página interna, usar Link de wouter
              const isInternalPage = item.isPage || (item.href && item.href.startsWith('/') && !item.href.startsWith('/#'));
              
              if (isInternalPage) {
                return (
                  <a
                    key={index}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:opacity-80",
                      isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                    )}
                    style={{ color: styles?.textColor }}
                  >
                    {item.label}
                  </a>
                );
              }
              
              return (
                <a
                  key={index}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:opacity-80",
                    isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                  )}
                  style={{ color: styles?.textColor }}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            {content?.secondaryCtaText && (
              <a
                href={content.secondaryCtaLink || '#'}
                className={cn(
                  "text-sm font-medium transition-colors",
                  isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                )}
                style={{ color: styles?.textColor }}
              >
                {content.secondaryCtaText}
              </a>
            )}
            <Button
              className="px-6"
              style={{ 
                backgroundColor: styles?.accentColor || '#6366f1',
                color: '#ffffff'
              }}
            >
              {content?.ctaText || 'Get Started'}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className={cn(
              "md:hidden p-2 rounded-lg",
              isDark ? "text-white" : "text-gray-900"
            )}
            style={{ color: styles?.textColor }}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(
              "md:hidden mt-4 pb-4 border-t",
              isDark ? "border-gray-800" : "border-gray-200"
            )}
          >
            <nav className="flex flex-col gap-4 pt-4">
              {navItems.map((item: any, index: number) => (
                <a
                  key={index}
                  href={item.href}
                  className={cn(
                    "text-base font-medium transition-colors",
                    isDark ? "text-gray-300" : "text-gray-600"
                  )}
                  style={{ color: styles?.textColor }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-4">
                {content?.secondaryCtaText && (
                  <a
                    href={content.secondaryCtaLink || '#'}
                    className={cn(
                      "text-base font-medium text-center py-2",
                      isDark ? "text-gray-300" : "text-gray-600"
                    )}
                    style={{ color: styles?.textColor }}
                  >
                    {content.secondaryCtaText}
                  </a>
                )}
                <Button
                  className="w-full"
                  style={{ 
                    backgroundColor: styles?.accentColor || '#6366f1',
                    color: '#ffffff'
                  }}
                >
                  {content?.ctaText || 'Get Started'}
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </motion.header>
    </div>
  );
}
