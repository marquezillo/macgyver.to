/**
 * TermsPage - Página de Términos y Condiciones
 * Genera contenido legal automáticamente basado en el negocio
 */

import React from 'react';

export interface TermsPageProps {
  businessName: string;
  businessType?: string;
  contactEmail?: string;
  websiteUrl?: string;
  lastUpdated?: string;
  customSections?: TermsSection[];
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    headingColor?: string;
    accentColor?: string;
    fontFamily?: string;
  };
}

interface TermsSection {
  title: string;
  content: string;
}

const defaultSections: TermsSection[] = [
  {
    title: 'Aceptación de los Términos',
    content: 'Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos Términos y Condiciones de uso, todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de las leyes locales aplicables. Si no está de acuerdo con alguno de estos términos, tiene prohibido usar o acceder a este sitio.'
  },
  {
    title: 'Uso de la Licencia',
    content: 'Se concede permiso para descargar temporalmente una copia de los materiales (información o software) en el sitio web solo para visualización transitoria personal y no comercial. Esta es la concesión de una licencia, no una transferencia de título, y bajo esta licencia usted no puede: modificar o copiar los materiales; usar los materiales para cualquier propósito comercial; intentar descompilar o aplicar ingeniería inversa a cualquier software contenido en el sitio web; eliminar cualquier copyright u otras notaciones de propiedad de los materiales; o transferir los materiales a otra persona o "reflejar" los materiales en cualquier otro servidor.'
  },
  {
    title: 'Descargo de Responsabilidad',
    content: 'Los materiales en el sitio web se proporcionan "tal cual". No ofrecemos garantías, expresas o implícitas, y por la presente renunciamos y negamos todas las demás garantías, incluidas, entre otras, las garantías implícitas o condiciones de comerciabilidad, idoneidad para un propósito particular, o no infracción de propiedad intelectual u otra violación de derechos.'
  },
  {
    title: 'Limitaciones',
    content: 'En ningún caso seremos responsables de ningún daño (incluidos, entre otros, daños por pérdida de datos o ganancias, o debido a la interrupción del negocio) que surja del uso o la imposibilidad de usar los materiales en el sitio web, incluso si nosotros o un representante autorizado ha sido notificado oralmente o por escrito de la posibilidad de tal daño.'
  },
  {
    title: 'Precisión de los Materiales',
    content: 'Los materiales que aparecen en el sitio web podrían incluir errores técnicos, tipográficos o fotográficos. No garantizamos que ninguno de los materiales en su sitio web sea preciso, completo o actual. Podemos realizar cambios en los materiales contenidos en su sitio web en cualquier momento sin previo aviso.'
  },
  {
    title: 'Enlaces',
    content: 'No hemos revisado todos los sitios vinculados a nuestro sitio web y no somos responsables de los contenidos de ningún sitio vinculado. La inclusión de cualquier enlace no implica respaldo por nuestra parte del sitio. El uso de cualquier sitio web vinculado es bajo el propio riesgo del usuario.'
  },
  {
    title: 'Modificaciones',
    content: 'Podemos revisar estos términos de servicio para su sitio web en cualquier momento sin previo aviso. Al usar este sitio web, usted acepta estar sujeto a la versión actual de estos términos de servicio.'
  },
  {
    title: 'Ley Aplicable',
    content: 'Estos términos y condiciones se rigen e interpretan de acuerdo con las leyes aplicables y usted se somete irrevocablemente a la jurisdicción exclusiva de los tribunales en esa ubicación.'
  }
];

export const TermsPage: React.FC<TermsPageProps> = ({
  businessName,
  businessType = 'empresa',
  contactEmail,
  websiteUrl,
  lastUpdated = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
  customSections,
  styles = {}
}) => {
  const {
    backgroundColor = '#ffffff',
    textColor = '#374151',
    headingColor = '#111827',
    accentColor = '#3b82f6',
    fontFamily = 'Inter, system-ui, sans-serif'
  } = styles;

  const sections = customSections || defaultSections;

  return (
    <div 
      className="min-h-screen py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor, fontFamily }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 
            className="text-4xl font-bold mb-4"
            style={{ color: headingColor }}
          >
            Términos y Condiciones
          </h1>
          <p 
            className="text-lg"
            style={{ color: textColor }}
          >
            Última actualización: {lastUpdated}
          </p>
        </header>

        {/* Introducción */}
        <section className="mb-10">
          <p 
            className="text-lg leading-relaxed"
            style={{ color: textColor }}
          >
            Bienvenido a <strong style={{ color: headingColor }}>{businessName}</strong>. 
            Estos términos y condiciones describen las reglas y regulaciones para el uso 
            del sitio web de {businessName}
            {websiteUrl && (
              <>, ubicado en <a href={websiteUrl} style={{ color: accentColor }} className="underline">{websiteUrl}</a></>
            )}.
          </p>
        </section>

        {/* Secciones */}
        {sections.map((section, index) => (
          <section key={index} className="mb-10">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: headingColor }}
            >
              {index + 1}. {section.title}
            </h2>
            <p 
              className="text-base leading-relaxed"
              style={{ color: textColor }}
            >
              {section.content.replace(/\{businessName\}/g, businessName)}
            </p>
          </section>
        ))}

        {/* Contacto */}
        <section className="mt-16 pt-8 border-t" style={{ borderColor: `${textColor}20` }}>
          <h2 
            className="text-2xl font-semibold mb-4"
            style={{ color: headingColor }}
          >
            Contacto
          </h2>
          <p 
            className="text-base leading-relaxed"
            style={{ color: textColor }}
          >
            Si tiene alguna pregunta sobre estos Términos y Condiciones, puede contactarnos:
          </p>
          <ul className="mt-4 space-y-2" style={{ color: textColor }}>
            {contactEmail && (
              <li>
                Por correo electrónico: <a href={`mailto:${contactEmail}`} style={{ color: accentColor }} className="underline">{contactEmail}</a>
              </li>
            )}
            {websiteUrl && (
              <li>
                Visitando esta página en nuestro sitio web: <a href={websiteUrl} style={{ color: accentColor }} className="underline">{websiteUrl}</a>
              </li>
            )}
          </ul>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 text-center" style={{ borderTop: `1px solid ${textColor}20` }}>
          <p style={{ color: `${textColor}80` }} className="text-sm">
            © {new Date().getFullYear()} {businessName}. Todos los derechos reservados.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default TermsPage;
