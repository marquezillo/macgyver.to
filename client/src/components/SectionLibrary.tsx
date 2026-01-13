import { useEditorStore, SectionType } from '@/store/editorStore';
import { Button } from '@/components/ui/button';
import { 
  LayoutTemplate, 
  List, 
  MessageSquare, 
  DollarSign, 
  MousePointerClick, 
  BarChart3, 
  HelpCircle 
} from 'lucide-react';

const sectionTypes: { type: SectionType; label: string; icon: any }[] = [
  { type: 'hero', label: 'Hero', icon: LayoutTemplate },
  { type: 'features', label: 'Features', icon: List },
  { type: 'testimonials', label: 'Testimonials', icon: MessageSquare },
  { type: 'pricing', label: 'Pricing', icon: DollarSign },
  { type: 'cta', label: 'Call to Action', icon: MousePointerClick },
  { type: 'stats', label: 'Statistics', icon: BarChart3 },
  { type: 'faq', label: 'FAQ', icon: HelpCircle },
];

export function SectionLibrary() {
  const { addSection } = useEditorStore();

  return (
    <div className="w-64 border-r bg-white flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Add Section</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sectionTypes.map(({ type, label, icon: Icon }) => (
          <Button
            key={type}
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={() => addSection(type)}
          >
            <Icon className="h-5 w-5 text-gray-500" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
