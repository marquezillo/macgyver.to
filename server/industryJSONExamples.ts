/**
 * Industry JSON Examples - Genera ejemplos JSON específicos por industria
 * Proporciona al LLM ejemplos concretos de estructuras para cada tipo de negocio
 */

import { IndustryPattern } from './industryPatterns';

/**
 * Genera un ejemplo JSON completo para una industria específica
 * El LLM usará este ejemplo como guía para generar la landing
 */
export function generateIndustryJSONExample(pattern: IndustryPattern, businessName: string = 'Mi Negocio'): string {
  const sections = pattern.sections.map((sectionType, index) => {
    return generateSectionExample(sectionType, index, pattern, businessName);
  });

  const jsonExample = {
    type: 'landing',
    businessType: pattern.nameEs,
    businessName: businessName,
    sections: sections.filter(s => s !== null)
  };

  return JSON.stringify(jsonExample, null, 2);
}

/**
 * Genera un ejemplo de sección específico según el tipo
 */
function generateSectionExample(
  sectionType: string, 
  index: number, 
  pattern: IndustryPattern,
  businessName: string
): Record<string, unknown> | null {
  const id = `${sectionType}-${index + 1}`;
  
  // Obtener colores según la paleta
  const colors = getColorPalette(pattern.colorPalette);
  
  switch (sectionType.toLowerCase()) {
    case 'header':
      return {
        id,
        type: 'header',
        content: {
          logo: businessName,
          navigation: [
            { label: 'Inicio', href: '#hero' },
            { label: 'Servicios', href: '#features' },
            { label: 'Testimonios', href: '#testimonials' },
            { label: 'Contacto', href: '#cta' }
          ],
          ctaText: pattern.ctaTextEs,
          ctaLink: '#cta'
        },
        styles: {
          backgroundColor: colors.background,
          textColor: colors.text,
          accentColor: colors.accent
        }
      };

    case 'hero':
      return {
        id,
        type: 'hero',
        content: {
          layout: pattern.heroVariant,
          title: `Bienvenido a ${businessName}`,
          subtitle: `Soluciones profesionales de ${pattern.nameEs.toLowerCase()} para tu éxito`,
          ctaText: pattern.ctaTextEs,
          ctaLink: '#cta',
          secondaryCtaText: 'Saber más',
          secondaryCtaLink: '#features',
          imagePrompt: pattern.suggestedImages[0] || 'professional business image'
        },
        styles: {
          backgroundColor: colors.background,
          textColor: colors.text,
          accentColor: colors.accent
        }
      };

    case 'logocloud':
      return {
        id,
        type: 'logocloud',
        content: {
          title: 'Empresas que confían en nosotros',
          logos: [
            { name: 'Empresa 1', imagePrompt: 'company logo minimalist' },
            { name: 'Empresa 2', imagePrompt: 'company logo minimalist' },
            { name: 'Empresa 3', imagePrompt: 'company logo minimalist' },
            { name: 'Empresa 4', imagePrompt: 'company logo minimalist' },
            { name: 'Empresa 5', imagePrompt: 'company logo minimalist' }
          ]
        },
        styles: {
          backgroundColor: colors.secondary,
          textColor: colors.text
        }
      };

    case 'features':
      return {
        id,
        type: 'features',
        content: {
          layout: pattern.featuresVariant,
          title: 'Nuestros Servicios',
          subtitle: 'Todo lo que necesitas en un solo lugar',
          items: [
            {
              title: 'Servicio Premium',
              description: 'Descripción detallada del servicio principal que ofrecemos',
              icon: 'Star'
            },
            {
              title: 'Atención Personalizada',
              description: 'Cada cliente recibe un trato único y personalizado',
              icon: 'Users'
            },
            {
              title: 'Resultados Garantizados',
              description: 'Nos comprometemos con tu satisfacción total',
              icon: 'CheckCircle'
            },
            {
              title: 'Soporte 24/7',
              description: 'Estamos disponibles cuando nos necesites',
              icon: 'Clock'
            }
          ]
        },
        styles: {
          backgroundColor: colors.background,
          textColor: colors.text,
          accentColor: colors.accent
        }
      };

    case 'services':
      return {
        id,
        type: 'services',
        content: {
          title: 'Nuestros Servicios',
          subtitle: 'Soluciones adaptadas a tus necesidades',
          items: [
            {
              title: 'Servicio 1',
              description: 'Descripción del primer servicio',
              icon: 'Briefcase',
              price: 'Desde $99'
            },
            {
              title: 'Servicio 2',
              description: 'Descripción del segundo servicio',
              icon: 'Settings',
              price: 'Desde $149'
            },
            {
              title: 'Servicio 3',
              description: 'Descripción del tercer servicio',
              icon: 'Zap',
              price: 'Desde $199'
            }
          ]
        },
        styles: {
          backgroundColor: colors.secondary,
          textColor: colors.text,
          accentColor: colors.accent
        }
      };

    case 'about':
      return {
        id,
        type: 'about',
        content: {
          title: 'Sobre Nosotros',
          subtitle: 'Nuestra Historia',
          description: `${businessName} nació con la misión de ofrecer servicios de ${pattern.nameEs.toLowerCase()} de la más alta calidad. Con años de experiencia en el sector, nos hemos convertido en referentes del mercado.`,
          imagePrompt: 'professional team working together',
          stats: [
            { value: '10+', label: 'Años de experiencia' },
            { value: '500+', label: 'Clientes satisfechos' },
            { value: '98%', label: 'Tasa de satisfacción' }
          ]
        },
        styles: {
          backgroundColor: colors.background,
          textColor: colors.text,
          accentColor: colors.accent
        }
      };

    case 'process':
      return {
        id,
        type: 'process',
        content: {
          title: 'Cómo Trabajamos',
          subtitle: 'Nuestro proceso paso a paso',
          steps: [
            {
              number: '01',
              title: 'Consulta Inicial',
              description: 'Analizamos tus necesidades y objetivos'
            },
            {
              number: '02',
              title: 'Propuesta Personalizada',
              description: 'Diseñamos una solución a tu medida'
            },
            {
              number: '03',
              title: 'Implementación',
              description: 'Ejecutamos el plan acordado'
            },
            {
              number: '04',
              title: 'Seguimiento',
              description: 'Monitoreamos resultados y optimizamos'
            }
          ]
        },
        styles: {
          backgroundColor: colors.secondary,
          textColor: colors.text,
          accentColor: colors.accent
        }
      };

    case 'stats':
      return {
        id,
        type: 'stats',
        content: {
          title: 'Nuestros Números',
          items: [
            { value: '10K+', label: 'Clientes Activos' },
            { value: '99%', label: 'Satisfacción' },
            { value: '24/7', label: 'Soporte' },
            { value: '50+', label: 'Países' }
          ]
        },
        styles: {
          backgroundColor: colors.accent,
          textColor: '#ffffff'
        }
      };

    case 'testimonials':
      return {
        id,
        type: 'testimonials',
        content: {
          layout: pattern.testimonialsVariant,
          title: 'Lo que dicen nuestros clientes',
          subtitle: 'Historias de éxito reales',
          items: [
            {
              name: 'María García',
              role: 'CEO, Empresa Tech',
              quote: 'Excelente servicio. Superaron todas mis expectativas y el resultado fue increíble.',
              rating: 5,
              imagePrompt: 'professional woman portrait'
            },
            {
              name: 'Carlos Rodríguez',
              role: 'Director de Marketing',
              quote: 'Profesionales de primera. Muy recomendados para cualquier proyecto.',
              rating: 5,
              imagePrompt: 'professional man portrait'
            },
            {
              name: 'Ana Martínez',
              role: 'Emprendedora',
              quote: 'Transformaron mi negocio por completo. Gracias por todo el apoyo.',
              rating: 5,
              imagePrompt: 'professional woman entrepreneur'
            }
          ]
        },
        styles: {
          backgroundColor: colors.background,
          textColor: colors.text,
          accentColor: colors.accent
        }
      };

    case 'pricing':
      return {
        id,
        type: 'pricing',
        content: {
          layout: pattern.pricingVariant || 'cards',
          title: 'Nuestros Planes',
          subtitle: 'Elige el plan perfecto para ti',
          plans: [
            {
              name: 'Básico',
              price: '$29',
              period: '/mes',
              description: 'Perfecto para empezar',
              features: ['Característica 1', 'Característica 2', 'Soporte por email'],
              ctaText: 'Empezar',
              highlighted: false
            },
            {
              name: 'Profesional',
              price: '$79',
              period: '/mes',
              description: 'Más popular',
              features: ['Todo del Básico', 'Característica 3', 'Característica 4', 'Soporte prioritario'],
              ctaText: 'Empezar',
              highlighted: true
            },
            {
              name: 'Empresarial',
              price: '$199',
              period: '/mes',
              description: 'Para grandes equipos',
              features: ['Todo del Profesional', 'Característica 5', 'API acceso', 'Soporte 24/7'],
              ctaText: 'Contactar',
              highlighted: false
            }
          ]
        },
        styles: {
          backgroundColor: colors.secondary,
          textColor: colors.text,
          accentColor: colors.accent
        }
      };

    case 'gallery':
      return {
        id,
        type: 'gallery',
        content: {
          title: 'Nuestra Galería',
          subtitle: 'Descubre nuestro trabajo',
          imagePrompts: [
            `${pattern.suggestedImages[0]} professional`,
            `${pattern.suggestedImages[1] || pattern.suggestedImages[0]} high quality`,
            `${pattern.suggestedImages[2] || pattern.suggestedImages[0]} modern`,
            `${pattern.nameEs.toLowerCase()} workspace`,
            `${pattern.nameEs.toLowerCase()} results`,
            `${pattern.nameEs.toLowerCase()} team`
          ]
        },
        styles: {
          backgroundColor: colors.background,
          textColor: colors.text
        }
      };

    case 'team':
      return {
        id,
        type: 'team',
        content: {
          title: 'Nuestro Equipo',
          subtitle: 'Los expertos detrás de tu éxito',
          members: [
            {
              name: 'Juan Pérez',
              role: 'Director General',
              bio: 'Más de 15 años de experiencia en el sector',
              imagePrompt: 'professional man CEO portrait'
            },
            {
              name: 'Laura Sánchez',
              role: 'Directora de Operaciones',
              bio: 'Especialista en optimización de procesos',
              imagePrompt: 'professional woman COO portrait'
            },
            {
              name: 'Miguel Torres',
              role: 'Director Técnico',
              bio: 'Experto en tecnología e innovación',
              imagePrompt: 'professional man CTO portrait'
            }
          ]
        },
        styles: {
          backgroundColor: colors.secondary,
          textColor: colors.text,
          accentColor: colors.accent
        }
      };

    case 'faq':
      return {
        id,
        type: 'faq',
        content: {
          title: 'Preguntas Frecuentes',
          subtitle: 'Resolvemos tus dudas',
          items: [
            {
              question: '¿Cómo puedo empezar?',
              answer: 'Es muy sencillo. Solo tienes que contactarnos y agendaremos una consulta inicial gratuita.'
            },
            {
              question: '¿Cuánto tiempo toma ver resultados?',
              answer: 'Dependiendo del servicio, los primeros resultados se ven entre 2 y 4 semanas.'
            },
            {
              question: '¿Ofrecen garantía?',
              answer: 'Sí, todos nuestros servicios incluyen garantía de satisfacción.'
            },
            {
              question: '¿Puedo cancelar en cualquier momento?',
              answer: 'Por supuesto. No hay contratos de permanencia obligatoria.'
            }
          ]
        },
        styles: {
          backgroundColor: colors.background,
          textColor: colors.text,
          accentColor: colors.accent
        }
      };

    case 'cta':
      return {
        id,
        type: 'cta',
        content: {
          title: '¿Listo para empezar?',
          subtitle: 'Únete a miles de clientes satisfechos',
          buttonText: pattern.ctaTextEs,
          buttonLink: '#form',
          secondaryText: '¿Tienes dudas? Contáctanos'
        },
        styles: {
          backgroundColor: colors.accent,
          textColor: '#ffffff',
          accentColor: colors.background
        }
      };

    case 'form':
      return {
        id,
        type: 'form',
        content: {
          title: 'Contáctanos',
          subtitle: 'Estamos aquí para ayudarte',
          fields: [
            { name: 'name', label: 'Nombre', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'phone', label: 'Teléfono', type: 'tel', required: false },
            { name: 'message', label: 'Mensaje', type: 'textarea', required: true }
          ],
          submitText: 'Enviar mensaje',
          successMessage: '¡Gracias! Te contactaremos pronto.'
        },
        styles: {
          backgroundColor: colors.secondary,
          textColor: colors.text,
          accentColor: colors.accent
        }
      };

    case 'booking':
      return {
        id,
        type: 'booking',
        content: {
          title: 'Reserva tu Cita',
          subtitle: 'Selecciona fecha y hora',
          services: [
            { name: 'Consulta inicial', duration: '30 min', price: 'Gratis' },
            { name: 'Sesión completa', duration: '60 min', price: '$99' }
          ]
        },
        styles: {
          backgroundColor: colors.background,
          textColor: colors.text,
          accentColor: colors.accent
        }
      };

    case 'menu':
      return {
        id,
        type: 'menu',
        content: {
          title: 'Nuestro Menú',
          categories: [
            {
              name: 'Entradas',
              items: [
                { name: 'Plato 1', description: 'Descripción del plato', price: '$12' },
                { name: 'Plato 2', description: 'Descripción del plato', price: '$14' }
              ]
            },
            {
              name: 'Principales',
              items: [
                { name: 'Plato 3', description: 'Descripción del plato', price: '$24' },
                { name: 'Plato 4', description: 'Descripción del plato', price: '$28' }
              ]
            }
          ]
        },
        styles: {
          backgroundColor: colors.background,
          textColor: colors.text,
          accentColor: colors.accent
        }
      };

    case 'portfolio':
      return {
        id,
        type: 'portfolio',
        content: {
          title: 'Nuestros Proyectos',
          subtitle: 'Trabajos destacados',
          projects: [
            {
              title: 'Proyecto 1',
              category: 'Categoría',
              description: 'Descripción breve del proyecto',
              imagePrompt: 'portfolio project professional'
            },
            {
              title: 'Proyecto 2',
              category: 'Categoría',
              description: 'Descripción breve del proyecto',
              imagePrompt: 'portfolio project modern'
            },
            {
              title: 'Proyecto 3',
              category: 'Categoría',
              description: 'Descripción breve del proyecto',
              imagePrompt: 'portfolio project creative'
            }
          ]
        },
        styles: {
          backgroundColor: colors.secondary,
          textColor: colors.text,
          accentColor: colors.accent
        }
      };

    case 'clients':
      return {
        id,
        type: 'clients',
        content: {
          title: 'Clientes que confían en nosotros',
          logos: [
            { name: 'Cliente 1' },
            { name: 'Cliente 2' },
            { name: 'Cliente 3' },
            { name: 'Cliente 4' },
            { name: 'Cliente 5' },
            { name: 'Cliente 6' }
          ]
        },
        styles: {
          backgroundColor: colors.background,
          textColor: colors.text
        }
      };

    case 'benefits':
      return {
        id,
        type: 'benefits',
        content: {
          title: 'Beneficios',
          subtitle: 'Por qué elegirnos',
          items: [
            { title: 'Ahorro de tiempo', description: 'Optimizamos tus procesos', icon: 'Clock' },
            { title: 'Calidad garantizada', description: 'Resultados profesionales', icon: 'Award' },
            { title: 'Soporte continuo', description: 'Siempre a tu lado', icon: 'HeadphonesIcon' }
          ]
        },
        styles: {
          backgroundColor: colors.secondary,
          textColor: colors.text,
          accentColor: colors.accent
        }
      };

    case 'location':
      return {
        id,
        type: 'location',
        content: {
          title: 'Encuéntranos',
          address: 'Calle Principal 123, Ciudad',
          phone: '+1 234 567 890',
          email: 'info@ejemplo.com',
          hours: [
            { day: 'Lunes - Viernes', hours: '9:00 - 18:00' },
            { day: 'Sábados', hours: '10:00 - 14:00' }
          ],
          mapCoordinates: { lat: 40.4168, lng: -3.7038 }
        },
        styles: {
          backgroundColor: colors.background,
          textColor: colors.text,
          accentColor: colors.accent
        }
      };

    case 'footer':
      return {
        id,
        type: 'footer',
        content: {
          companyName: businessName,
          description: `${businessName} - Tu socio de confianza en ${pattern.nameEs.toLowerCase()}`,
          links: [
            { label: 'Inicio', url: '#hero' },
            { label: 'Servicios', url: '#features' },
            { label: 'Contacto', url: '#cta' },
            { label: 'Términos', url: '/terminos' },
            { label: 'Privacidad', url: '/privacidad' }
          ],
          socialLinks: [
            { platform: 'facebook', url: '#' },
            { platform: 'instagram', url: '#' },
            { platform: 'twitter', url: '#' },
            { platform: 'linkedin', url: '#' }
          ],
          copyright: `© ${new Date().getFullYear()} ${businessName}. Todos los derechos reservados.`
        },
        styles: {
          backgroundColor: colors.dark,
          textColor: '#ffffff',
          accentColor: colors.accent
        }
      };

    default:
      return null;
  }
}

/**
 * Obtiene la paleta de colores según el tipo
 */
function getColorPalette(paletteType: string): {
  background: string;
  secondary: string;
  text: string;
  accent: string;
  dark: string;
} {
  const palettes: Record<string, ReturnType<typeof getColorPalette>> = {
    gradient: {
      background: '#0f0f23',
      secondary: '#1a1a2e',
      text: '#ffffff',
      accent: '#6366f1',
      dark: '#0a0a14'
    },
    neon: {
      background: '#0d0d0d',
      secondary: '#1a1a1a',
      text: '#ffffff',
      accent: '#00ff88',
      dark: '#000000'
    },
    dark: {
      background: '#111827',
      secondary: '#1f2937',
      text: '#f9fafb',
      accent: '#3b82f6',
      dark: '#030712'
    },
    light: {
      background: '#ffffff',
      secondary: '#f3f4f6',
      text: '#111827',
      accent: '#2563eb',
      dark: '#1f2937'
    },
    warm: {
      background: '#fffbeb',
      secondary: '#fef3c7',
      text: '#78350f',
      accent: '#f59e0b',
      dark: '#451a03'
    },
    minimal: {
      background: '#fafafa',
      secondary: '#f5f5f5',
      text: '#171717',
      accent: '#000000',
      dark: '#0a0a0a'
    },
    nature: {
      background: '#f0fdf4',
      secondary: '#dcfce7',
      text: '#14532d',
      accent: '#22c55e',
      dark: '#052e16'
    },
    luxury: {
      background: '#1a1a1a',
      secondary: '#262626',
      text: '#fafafa',
      accent: '#d4af37',
      dark: '#0a0a0a'
    },
    medical: {
      background: '#f0f9ff',
      secondary: '#e0f2fe',
      text: '#0c4a6e',
      accent: '#0284c7',
      dark: '#082f49'
    },
    creative: {
      background: '#fdf4ff',
      secondary: '#fae8ff',
      text: '#701a75',
      accent: '#d946ef',
      dark: '#4a044e'
    }
  };

  return palettes[paletteType] || palettes.gradient;
}

/**
 * Genera instrucciones específicas para el LLM basadas en el patrón
 */
export function generateIndustryInstructions(pattern: IndustryPattern, businessName: string = 'Mi Negocio'): string {
  const jsonExample = generateIndustryJSONExample(pattern, businessName);
  
  return `
## 🎯 INSTRUCCIONES OBLIGATORIAS PARA ESTA LANDING

### Industria Detectada: ${pattern.name} (${pattern.nameEs})
### Categoría: ${pattern.category}

### ⚠️ ESTRUCTURA OBLIGATORIA DE SECCIONES (en este orden exacto):
${pattern.sections.map((s, i) => `${i + 1}. **${s}**`).join('\n')}

### ⚠️ VARIANTES DE LAYOUT OBLIGATORIAS:
- Hero: **${pattern.heroVariant}** (DEBES incluir "layout": "${pattern.heroVariant}" en el content del hero)
- Features: **${pattern.featuresVariant}** (DEBES incluir "layout": "${pattern.featuresVariant}" en el content de features)
- Testimonials: **${pattern.testimonialsVariant}** (DEBES incluir "layout": "${pattern.testimonialsVariant}" en el content de testimonials)
${pattern.pricingVariant ? `- Pricing: **${pattern.pricingVariant}** (DEBES incluir "layout": "${pattern.pricingVariant}" en el content de pricing)` : ''}

### Paleta de Colores: ${pattern.colorPalette}
### CTA Principal: "${pattern.ctaTextEs}"

### 📋 EJEMPLO JSON QUE DEBES SEGUIR:
\`\`\`json
${jsonExample}
\`\`\`

### ⚠️ REGLAS CRÍTICAS:
1. DEBES usar EXACTAMENTE las secciones listadas arriba, en ese orden
2. DEBES incluir el campo "layout" en hero, features, testimonials y pricing
3. NO uses la estructura genérica Hero → Features → Testimonials → CTA
4. ADAPTA el contenido al negocio del usuario pero MANTÉN la estructura
5. USA los colores de la paleta ${pattern.colorPalette}
`;
}
