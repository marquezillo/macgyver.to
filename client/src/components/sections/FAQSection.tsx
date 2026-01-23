import { useState, useCallback, MouseEvent } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { ChevronDown, Plus, Minus } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  id: string;
  content: {
    title?: string;
    subtitle?: string;
    items?: FAQItem[];
  };
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
  };
}

export function FAQSection({ id, content, styles = {} }: FAQSectionProps) {
  const { selectedSectionId, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === id;
  // Allow multiple items to be open at once for better UX
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set([0]));

  const items = content?.items || [
    { question: '¿Cuánto tiempo tarda el proceso?', answer: 'El proceso generalmente toma entre 24 y 48 horas hábiles.' },
    { question: '¿Qué documentos necesito?', answer: 'Necesitarás tu pasaporte vigente y una foto reciente.' },
    { question: '¿Cuál es el costo del servicio?', answer: 'El costo varía según el tipo de servicio seleccionado. Consulta nuestra tabla de precios.' },
    { question: '¿Puedo hacer seguimiento de mi solicitud?', answer: 'Sí, recibirás un número de seguimiento por correo electrónico.' },
  ];

  const handleSectionClick = useCallback((e: MouseEvent) => {
    // Only select section if clicking on the background, not on FAQ items
    const target = e.target as HTMLElement;
    if (target.closest('[data-faq-item]')) {
      return;
    }
    selectSection(id);
  }, [id, selectSection]);

  const toggleItem = useCallback((index: number, e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setOpenIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const isItemOpen = (index: number) => openIndices.has(index);

  // Determine text colors based on background
  const bgColor = styles?.backgroundColor || '#ffffff';
  const isDarkBg = bgColor.toLowerCase().includes('#0') || 
                   bgColor.toLowerCase().includes('#1') || 
                   bgColor.toLowerCase().includes('#2') ||
                   bgColor.toLowerCase() === '#000' ||
                   bgColor.toLowerCase() === '#000000';
  
  const textColorClass = styles?.textColor || (isDarkBg ? 'text-white' : 'text-gray-900');
  const subtitleColorClass = isDarkBg ? 'text-gray-300' : 'text-gray-600';
  const itemBgClass = isDarkBg ? 'bg-white/5' : 'bg-white';
  const itemHoverBgClass = isDarkBg ? 'hover:bg-white/10' : 'hover:bg-gray-50';
  const borderColorClass = isDarkBg ? 'border-white/10' : 'border-gray-200';
  const answerBgClass = isDarkBg ? 'bg-white/5' : 'bg-gray-50';

  return (
    <div
      onClick={handleSectionClick}
      className={cn(
        "relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 transition-all duration-200",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      style={{ backgroundColor: bgColor }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 
            className={cn(
              "text-3xl md:text-4xl font-bold tracking-tight",
              textColorClass
            )}
            style={{ color: styles?.textColor }}
          >
            {content?.title || "Preguntas Frecuentes"}
          </h2>
          {content?.subtitle && (
            <p 
              className={cn(
                "mt-4 text-lg md:text-xl",
                subtitleColorClass
              )}
            >
              {content.subtitle}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {items.map((item: FAQItem, index: number) => {
            const isOpen = isItemOpen(index);
            
            return (
              <div 
                key={`faq-item-${index}`}
                data-faq-item="true"
                className={cn(
                  "rounded-xl overflow-hidden transition-all duration-300",
                  borderColorClass,
                  "border"
                )}
              >
                <button
                  type="button"
                  onClick={(e) => toggleItem(index, e)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={cn(
                    "w-full flex items-center justify-between px-6 py-5 text-left transition-all duration-200",
                    itemBgClass,
                    itemHoverBgClass,
                    "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/50"
                  )}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span 
                    className={cn(
                      "font-semibold text-base md:text-lg pr-4",
                      textColorClass
                    )}
                    style={{ color: styles?.textColor }}
                  >
                    {item.question}
                  </span>
                  <span 
                    className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                      isOpen 
                        ? (styles?.accentColor || "bg-primary text-white") 
                        : (isDarkBg ? "bg-white/10 text-white" : "bg-gray-100 text-gray-600")
                    )}
                    style={isOpen && styles?.accentColor ? { backgroundColor: styles.accentColor } : undefined}
                  >
                    {isOpen ? (
                      <Minus className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </span>
                </button>
                
                <div
                  id={`faq-answer-${index}`}
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div 
                    className={cn(
                      "px-6 py-5 text-base leading-relaxed",
                      answerBgClass,
                      isDarkBg ? "text-gray-300" : "text-gray-600"
                    )}
                  >
                    {item.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
