import { Section } from '@/store/editorStore';
import { HeroSection } from './sections/HeroSection';
import { FeaturesSection } from './sections/FeaturesSection';

interface SectionRendererProps {
  section: Section;
}

export function SectionRenderer({ section }: SectionRendererProps) {
  switch (section.type) {
    case 'hero':
      return <HeroSection id={section.id} content={section.content} styles={section.styles} />;
    case 'features':
      return <FeaturesSection id={section.id} content={section.content} styles={section.styles} />;
    default:
      return (
        <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
          Unknown section type: {section.type}
        </div>
      );
  }
}
