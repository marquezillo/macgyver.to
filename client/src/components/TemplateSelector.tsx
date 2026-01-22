import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import { Check, Palette, Moon, Sun, Sparkles, Square, Flame, Zap } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelect: (templateId: string) => void;
  className?: string;
}

const templateIcons: Record<string, React.ReactNode> = {
  dark: <Moon className="w-5 h-5" />,
  light: <Sun className="w-5 h-5" />,
  gradient: <Sparkles className="w-5 h-5" />,
  minimal: <Square className="w-5 h-5" />,
  neon: <Zap className="w-5 h-5" />,
  warm: <Flame className="w-5 h-5" />,
};

export function TemplateSelector({ selectedTemplate, onSelect, className }: TemplateSelectorProps) {
  const { data: templates, isLoading } = trpc.templates.list.useQuery();
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className={cn("flex gap-2 animate-pulse", className)}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="w-16 h-16 rounded-xl bg-zinc-800/50"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Palette className="w-4 h-4" />
        <span>Elige un estilo</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {templates?.map((template) => {
          const isSelected = selectedTemplate === template.id;
          const isHovered = hoveredTemplate === template.id;
          
          return (
            <button
              key={template.id}
              onClick={() => onSelect(template.id)}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              className={cn(
                "relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200",
                "hover:scale-105 hover:shadow-lg",
                isSelected
                  ? "border-blue-500 bg-blue-500/10 shadow-blue-500/20"
                  : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
              )}
              style={{
                boxShadow: isSelected || isHovered
                  ? `0 0 20px ${template.colors.primary}40`
                  : undefined,
              }}
            >
              {/* Color preview */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                style={{
                  backgroundColor: template.colors.background,
                  color: template.colors.text,
                  border: `2px solid ${template.colors.primary}`,
                }}
              >
                {templateIcons[template.id] || template.preview}
              </div>
              
              {/* Template name */}
              <span className={cn(
                "text-xs font-medium",
                isSelected ? "text-blue-400" : "text-zinc-400"
              )}>
                {template.name}
              </span>
              
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Template description */}
      {hoveredTemplate && templates && (
        <div className="text-xs text-zinc-500 h-4 transition-opacity">
          {templates.find(t => t.id === hoveredTemplate)?.description}
        </div>
      )}
    </div>
  );
}

// Compact version for inline use
export function TemplateDropdown({ selectedTemplate, onSelect }: TemplateSelectorProps) {
  const { data: templates } = trpc.templates.list.useQuery();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentTemplate = templates?.find(t => t.id === selectedTemplate);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-colors"
      >
        <div
          className="w-4 h-4 rounded"
          style={{ backgroundColor: currentTemplate?.colors.primary || '#3b82f6' }}
        />
        <span className="text-sm text-zinc-300">
          {currentTemplate?.name || 'Dark Mode'}
        </span>
      </button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 z-50 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl p-2 min-w-[200px]">
            {templates?.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  onSelect(template.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  selectedTemplate === template.id
                    ? "bg-blue-500/20 text-blue-400"
                    : "hover:bg-zinc-800 text-zinc-300"
                )}
              >
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-xs"
                  style={{
                    backgroundColor: template.colors.background,
                    color: template.colors.text,
                    border: `1px solid ${template.colors.primary}`,
                  }}
                >
                  {template.preview}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{template.name}</div>
                  <div className="text-xs text-zinc-500">{template.description}</div>
                </div>
                {selectedTemplate === template.id && (
                  <Check className="w-4 h-4 text-blue-400" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
