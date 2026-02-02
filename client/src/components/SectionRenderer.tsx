import { Section } from '@/store/editorStore';
import { HeroSection } from './sections/HeroSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { FormSection } from './sections/FormSection';
import { FAQSection } from './sections/FAQSection';
import { CTASection } from './sections/CTASection';
import { FooterSection } from './sections/FooterSection';
import { TestimonialsSection } from './sections/TestimonialsSection';
import { ProcessSection } from './sections/ProcessSection';
import { PricingSection } from './sections/PricingSection';
import { StatsSection } from './sections/StatsSection';
import { AboutSection } from './sections/AboutSection';
import { GallerySection } from './sections/GallerySection';
import { LogoCloudSection } from './sections/LogoCloudSection';
import { HeaderSection } from './sections/HeaderSection';

interface SectionRendererProps {
  section: Section;
}

// Wrapper component that adds id for anchor linking and smooth scroll
function SectionWrapper({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-20">
      {children}
    </div>
  );
}

export function SectionRenderer({ section }: SectionRendererProps) {
  const renderSection = () => {
    switch (section.type) {
      case 'hero':
        return <HeroSection id={section.id} content={section.content} styles={section.styles || {}} />;
      case 'features':
        return <FeaturesSection id={section.id} content={section.content} styles={section.styles || {}} />;
      case 'form':
        return <FormSection id={section.id} content={section.content} styles={section.styles || {}} />;
      case 'faq':
        return <FAQSection id={section.id} content={section.content} styles={section.styles || {}} />;
      case 'cta':
        return <CTASection id={section.id} content={section.content} styles={section.styles || {}} />;
      case 'footer':
        return <FooterSection id={section.id} content={section.content} styles={section.styles || {}} />;
      case 'testimonials':
        return <TestimonialsSection id={section.id} content={section.content} styles={section.styles || {}} />;
      case 'process':
        return <ProcessSection id={section.id} content={section.content} styles={section.styles || {}} />;
      case 'pricing':
        return <PricingSection id={section.id} content={section.content} styles={section.styles || {}} />;
      case 'stats':
        return <StatsSection id={section.id} content={section.content} styles={section.styles || {}} />;
      case 'about':
        return <AboutSection id={section.id} content={section.content} styles={section.styles || {}} />;
      case 'gallery':
        return <GallerySection id={section.id} content={section.content} styles={section.styles || {}} />;
      case 'logocloud':
      case 'logos':
      case 'partners':
      case 'clients':
        return <LogoCloudSection id={section.id} content={section.content} styles={section.styles || {}} />;
      case 'header':
      case 'navbar':
      case 'nav':
        return <HeaderSection id={section.id} content={section.content} styles={section.styles || {}} />;
      default:
        return (
          <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
            Unknown section type: {section.type}
          </div>
        );
    }
  };

  return (
    <SectionWrapper id={section.id}>
      {renderSection()}
    </SectionWrapper>
  );
}
