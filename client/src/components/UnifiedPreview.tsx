/**
 * UnifiedPreview - Renders landing pages using the same HTML as the published version
 * This ensures 100% fidelity between preview and published landing
 */

import { useMemo, useRef, useEffect } from 'react';
import { renderLanding, LandingConfig, LandingSection } from '../../../shared/landingRenderer';

interface UnifiedPreviewProps {
  sections: any[];
  globalStyles?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    borderRadius?: string;
  };
  metadata?: {
    title?: string;
    description?: string;
    favicon?: string;
    language?: string;
  };
  className?: string;
  scale?: number;
}

/**
 * Converts editor sections to unified LandingConfig format
 */
function convertToUnifiedConfig(
  sections: any[],
  globalStyles?: UnifiedPreviewProps['globalStyles'],
  metadata?: UnifiedPreviewProps['metadata']
): LandingConfig {
  const convertedSections: LandingSection[] = sections.map((section) => ({
    id: section.id || `section-${Math.random().toString(36).substr(2, 9)}`,
    type: section.type,
    content: section.content || {},
    styles: {
      ...section.styles,
      backgroundColor: section.styles?.backgroundColor || section.content?.backgroundColor,
      accentColor: section.styles?.accentColor || globalStyles?.primaryColor
    }
  }));

  return {
    sections: convertedSections,
    globalStyles: {
      primaryColor: globalStyles?.primaryColor || '#6366f1',
      secondaryColor: globalStyles?.secondaryColor,
      backgroundColor: globalStyles?.backgroundColor || '#ffffff',
      textColor: globalStyles?.textColor || '#1f2937',
      fontFamily: globalStyles?.fontFamily || 'Inter',
      borderRadius: globalStyles?.borderRadius || '0.5rem'
    },
    metadata: {
      title: metadata?.title || 'Landing Page',
      description: metadata?.description || '',
      favicon: metadata?.favicon,
      language: metadata?.language || 'es'
    }
  };
}

export function UnifiedPreview({
  sections,
  globalStyles,
  metadata,
  className = '',
  scale = 1
}: UnifiedPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Generate HTML using the unified renderer
  const html = useMemo(() => {
    const config = convertToUnifiedConfig(sections, globalStyles, metadata);
    return renderLanding(config, {
      isPreview: true,
      includeWrapper: true,
      includeScripts: false
    });
  }, [sections, globalStyles, metadata]);

  // Write HTML to iframe
  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [html]);

  return (
    <div className={`unified-preview ${className}`} style={{ overflow: 'hidden' }}>
      <iframe
        ref={iframeRef}
        title="Landing Preview"
        className="w-full h-full border-0"
        style={{
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top left',
          width: scale !== 1 ? `${100 / scale}%` : '100%',
          height: scale !== 1 ? `${100 / scale}%` : '100%'
        }}
        sandbox="allow-same-origin"
      />
    </div>
  );
}

/**
 * Hook to get the HTML for a landing page
 * Useful for downloading or sharing
 */
export function useLandingHTML(
  sections: any[],
  globalStyles?: UnifiedPreviewProps['globalStyles'],
  metadata?: UnifiedPreviewProps['metadata']
): string {
  return useMemo(() => {
    const config = convertToUnifiedConfig(sections, globalStyles, metadata);
    return renderLanding(config, {
      isPreview: false,
      includeWrapper: true,
      includeScripts: true
    });
  }, [sections, globalStyles, metadata]);
}

export default UnifiedPreview;
