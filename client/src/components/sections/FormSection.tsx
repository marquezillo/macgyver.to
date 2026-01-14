import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea' | 'number';
  placeholder?: string;
  required?: boolean;
  options?: string[]; // For select fields
}

interface FormSectionProps {
  id: string;
  content: {
    title?: string;
    subtitle?: string;
    fields?: FormField[];
    submitText?: string;
    successMessage?: string;
  };
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
    cardBackground?: string;
  };
}

export function FormSection({ id, content, styles = {} }: FormSectionProps) {
  const { selectedSectionId, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === id;

  const fields = content?.fields || [
    { id: 'name', label: 'Nombre completo', type: 'text', placeholder: 'Tu nombre', required: true },
    { id: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'tu@email.com', required: true },
    { id: 'phone', label: 'Teléfono', type: 'tel', placeholder: '+34 600 000 000' },
    { id: 'message', label: 'Mensaje', type: 'textarea', placeholder: 'Tu mensaje...' },
  ];

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectSection(id);
      }}
      className={cn(
        "relative py-16 px-4 sm:px-6 lg:px-8 transition-all duration-200",
        isSelected && "ring-2 ring-primary ring-offset-2",
        styles?.backgroundColor || "bg-gray-50"
      )}
    >
      <div className="max-w-2xl mx-auto">
        {(content?.title || content?.subtitle) && (
          <div className="text-center mb-10">
            {content?.title && (
              <h2 
                className={cn(
                  "text-3xl font-bold tracking-tight sm:text-4xl",
                  styles?.textColor || "text-gray-900"
                )}
              >
                {content.title}
              </h2>
            )}
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
        )}

        <div 
          className={cn(
            "rounded-xl shadow-lg p-8",
            styles?.cardBackground || "bg-white"
          )}
        >
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {fields.map((field: FormField) => (
              <div key={field.id} className="space-y-2">
                <Label 
                  htmlFor={field.id}
                  className={cn(
                    "text-sm font-medium",
                    styles?.textColor || "text-gray-700"
                  )}
                >
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.id}
                    name={field.id}
                    placeholder={field.placeholder}
                    required={field.required}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                ) : field.type === 'select' ? (
                  <select
                    id={field.id}
                    name={field.id}
                    required={field.required}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">{field.placeholder || 'Selecciona una opción'}</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full"
                  />
                )}
              </div>
            ))}

            <Button 
              type="submit"
              size="lg"
              className={cn(
                "w-full",
                styles?.buttonColor ? "" : "bg-primary text-primary-foreground"
              )}
              style={{ backgroundColor: styles?.buttonColor }}
            >
              {content?.submitText || "Enviar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
