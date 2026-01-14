import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface FeaturesSectionProps {
  id: string;
  content: any;
  styles?: any;
}

export function FeaturesSection({ id, content, styles = {} }: FeaturesSectionProps) {
  const { selectedSectionId, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === id;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectSection(id);
      }}
      className={cn(
        "py-16 px-4 sm:px-6 lg:px-8 transition-all duration-200",
        isSelected && "ring-2 ring-primary ring-offset-2",
        styles?.backgroundColor || "bg-gray-50"
      )}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className={cn(
            "text-3xl font-extrabold tracking-tight sm:text-4xl",
            styles?.textColor || "text-gray-900"
          )}>
            {content?.title || "Features"}
          </h2>
          <p className={cn(
            "mt-4 max-w-2xl mx-auto text-xl",
            styles?.textColor ? "opacity-80" : "text-gray-500"
          )}
          style={{ color: styles?.textColor }}
          >
            {content?.subtitle || "Discover our amazing features"}
          </p>
        </div>

        <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-3">
          {(content?.items || []).map((item: any, index: number) => (
            <div 
              key={index}
              className={cn(
                "relative p-6 rounded-xl shadow-sm transition-all hover:shadow-md",
                styles?.cardBackgroundColor || "bg-white"
              )}
            >
              <div className="absolute top-6 left-6">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-12">
                <h3 className={cn(
                  "text-xl font-medium",
                  styles?.textColor || "text-gray-900"
                )}>
                  {item?.title || "Feature"}
                </h3>
                <p className={cn(
                  "mt-2 text-base",
                  styles?.textColor ? "opacity-70" : "text-gray-500"
                )}
                style={{ color: styles?.textColor }}
                >
                  {item?.description || "Feature description"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
