import { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea' | 'number';
  placeholder?: string;
  required?: boolean;
  options?: (string | SelectOption)[]; // For select fields - can be strings or {value, label} objects
}

interface FormSectionProps {
  id: string;
  content: {
    title?: string;
    subtitle?: string;
    fields?: FormField[];
    submitText?: string;
    successMessage?: string;
    webhookUrl?: string;
    saveToDatabase?: boolean;
    country?: string;
    landingIdentifier?: string;
  };
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
    cardBackground?: string;
  };
  chatId?: number;
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

export function FormSection({ id, content, styles = {}, chatId }: FormSectionProps) {
  const { selectedSectionId, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === id;
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fields = content?.fields || [
    { id: 'name', label: 'Nombre completo', type: 'text', placeholder: 'Tu nombre', required: true },
    { id: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'tu@email.com', required: true },
    { id: 'phone', label: 'Teléfono', type: 'tel', placeholder: '+34 600 000 000' },
    { id: 'message', label: 'Mensaje', type: 'textarea', placeholder: 'Tu mensaje...' },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitStatus('submitting');
    setErrorMessage('');

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const data: Record<string, string> = {};
    
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    try {
      // Submit to our backend API
      const response = await fetch('/api/form-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formSectionId: id,
          chatId: chatId,
          country: content?.country,
          landingIdentifier: content?.landingIdentifier,
          formData: data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al enviar el formulario');
      }

      // Also send to custom webhook if configured
      if (content?.webhookUrl && content.webhookUrl !== '/api/form-submit') {
        try {
          await fetch(content.webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
        } catch (webhookError) {
          console.warn('Webhook call failed:', webhookError);
          // Don't fail the submission if webhook fails
        }
      }

      setSubmitStatus('success');
      formElement.reset();
      
      // Reset to idle after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error al enviar el formulario');
      
      // Reset to idle after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
        setErrorMessage('');
      }, 5000);
    }
  };

  return (
    <div
      id="form"
      onClick={(e) => {
        e.stopPropagation();
        selectSection(id);
      }}
      className={cn(
        "relative py-10 md:py-16 px-4 sm:px-6 lg:px-8 transition-all duration-200",
        isSelected && "ring-2 ring-primary ring-offset-2",
        styles?.backgroundColor || "bg-gray-50"
      )}
    >
      <div className="max-w-2xl mx-auto">
        {(content?.title || content?.subtitle) && (
          <div className="text-center mb-6 md:mb-10">
            {content?.title && (
              <h2 
                className={cn(
                  "text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight",
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
            "rounded-xl shadow-lg p-4 md:p-8",
            styles?.cardBackground || "bg-white"
          )}
        >
          {submitStatus === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ¡Enviado correctamente!
              </h3>
              <p className="text-gray-600">
                {content?.successMessage || '¡Gracias! Te contactaremos pronto.'}
              </p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                      disabled={submitStatus === 'submitting'}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={field.id}
                      name={field.id}
                      required={field.required}
                      disabled={submitStatus === 'submitting'}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">{field.placeholder || 'Selecciona una opción'}</option>
                      {field.options?.map((option, idx) => {
                        // Handle both string options and {value, label} objects
                        const optionValue = typeof option === 'string' ? option : option.value;
                        const optionLabel = typeof option === 'string' ? option : option.label;
                        return (
                          <option key={`${optionValue}-${idx}`} value={optionValue}>{optionLabel}</option>
                        );
                      })}
                    </select>
                  ) : (
                    <Input
                      id={field.id}
                      name={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      required={field.required}
                      disabled={submitStatus === 'submitting'}
                      className="w-full"
                    />
                  )}
                </div>
              ))}

              {submitStatus === 'error' && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <Button 
                type="submit"
                size="lg"
                disabled={submitStatus === 'submitting'}
                className={cn(
                  "w-full",
                  styles?.buttonColor ? "" : "bg-primary text-primary-foreground"
                )}
                style={{ backgroundColor: styles?.buttonColor }}
              >
                {submitStatus === 'submitting' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  content?.submitText || "Enviar"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
