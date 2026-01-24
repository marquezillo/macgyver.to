/**
 * PageRenderer - Renderiza páginas internas según su tipo
 */

import React from 'react';
import { TermsPage } from './TermsPage';
import { PrivacyPage } from './PrivacyPage';
import { AboutPage } from './AboutPage';
import { ContactPage } from './ContactPage';
import type { PageConfig, ThemeConfig, LandingMetadata } from '@shared/landingTypes';

interface PageRendererProps {
  page: PageConfig;
  theme: ThemeConfig;
  metadata: LandingMetadata;
  onContactSubmit?: (data: { name: string; email: string; phone?: string; subject: string; message: string }) => void;
}

export const PageRenderer: React.FC<PageRendererProps> = ({
  page,
  theme,
  metadata,
  onContactSubmit
}) => {
  // Convertir theme a styles para los componentes de página
  const styles = {
    backgroundColor: theme.colors.background,
    textColor: theme.colors.foreground,
    headingColor: theme.darkMode ? '#ffffff' : '#111827',
    accentColor: theme.colors.primary,
    fontFamily: theme.fonts.body
  };

  switch (page.type) {
    case 'terms':
      return (
        <TermsPage
          businessName={metadata.businessName}
          businessType={metadata.businessType}
          contactEmail={metadata.contactEmail}
          websiteUrl={metadata.websiteUrl}
          styles={styles}
          {...(page.data as Record<string, unknown>)}
        />
      );

    case 'privacy':
      return (
        <PrivacyPage
          businessName={metadata.businessName}
          businessType={metadata.businessType}
          contactEmail={metadata.contactEmail}
          websiteUrl={metadata.websiteUrl}
          styles={styles}
          {...(page.data as Record<string, unknown>)}
        />
      );

    case 'about':
      return (
        <AboutPage
          businessName={metadata.businessName}
          businessType={metadata.businessType}
          contactEmail={metadata.contactEmail}
          styles={styles}
          {...(page.data as Record<string, unknown>)}
        />
      );

    case 'contact':
      return (
        <ContactPage
          businessName={metadata.businessName}
          contactEmail={metadata.contactEmail}
          phone={metadata.phone}
          address={metadata.address}
          socialLinks={metadata.socialLinks}
          styles={styles}
          onSubmit={onContactSubmit}
          {...(page.data as Record<string, unknown>)}
        />
      );

    default:
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4" style={{ color: theme.colors.foreground }}>
              Página no encontrada
            </h1>
            <p style={{ color: theme.colors.muted }}>
              El tipo de página "{page.type}" no está soportado.
            </p>
          </div>
        </div>
      );
  }
};

export default PageRenderer;
