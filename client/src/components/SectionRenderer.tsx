import { Section } from '@/store/editorStore';
import { HeroSection } from './sections/HeroSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { FormSection } from './sections/FormSection';
import { FAQSection } from './sections/FAQSection';
import { CTASection } from './sections/CTASection';
import { FooterSection } from './sections/FooterSection';

interface SectionRendererProps {
  section: Section;
}

export function SectionRenderer({ section }: SectionRendererProps) {
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
    default:
      return (
        <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
          Unknown section type: {section.type}
        </div>
      );
  }
}
