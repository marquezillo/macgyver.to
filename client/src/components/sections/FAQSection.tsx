import { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

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
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const items = content?.items || [
    { question: '¿Cuánto tiempo tarda el proceso?', answer: 'El proceso generalmente toma entre 24 y 48 horas hábiles.' },
    { question: '¿Qué documentos necesito?', answer: 'Necesitarás tu pasaporte vigente y una foto reciente.' },
    { question: '¿Cuál es el costo del servicio?', answer: 'El costo varía según el tipo de servicio seleccionado. Consulta nuestra tabla de precios.' },
    { question: '¿Puedo hacer seguimiento de mi solicitud?', answer: 'Sí, recibirás un número de seguimiento por correo electrónico.' },
  ];

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectSection(id);
      }}
      className={cn(
        "relative py-10 md:py-16 px-4 sm:px-6 lg:px-8 transition-all duration-200",
        isSelected && "ring-2 ring-primary ring-offset-2",
        styles?.backgroundColor || "bg-white"
      )}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 
            className={cn(
              "text-2xl md:text-3xl font-bold tracking-tight sm:text-4xl",
              styles?.textColor || "text-gray-900"
            )}
          >
            {content?.title || "Preguntas Frecuentes"}
          </h2>
          {content?.subtitle && (
            <p 
              className={cn(
                "mt-4 text-lg",
                styles?.textColor ? "opacity-80" : "text-gray-600"
              )}
              style={{ color: styles?.textColor }}
            >
              {content.subtitle}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {items.map((item: FAQItem, index: number) => (
            <div 
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIndex(openIndex === index ? null : index);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 md:px-6 py-3 md:py-4 text-left transition-colors text-sm md:text-base",
                  openIndex === index 
                    ? (styles?.accentColor || "bg-primary/5") 
                    : "bg-white hover:bg-gray-50"
                )}
              >
                <span 
                  className={cn(
                    "font-medium",
                    styles?.textColor || "text-gray-900"
                  )}
                >
                  {item.question}
                </span>
                <ChevronDown 
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    openIndex === index && "rotate-180",
                    styles?.textColor || "text-gray-500"
                  )}
                />
              </button>
              
              {openIndex === index && (
                <div 
                  className={cn(
                    "px-6 py-4 border-t border-gray-200",
                    styles?.textColor ? "opacity-80" : "text-gray-600"
                  )}
                  style={{ color: styles?.textColor }}
                >
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
