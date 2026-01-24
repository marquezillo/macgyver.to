/**
 * PrivacyPage - Página de Política de Privacidad
 * Genera contenido de privacidad automáticamente basado en el negocio
 */

import React from 'react';

export interface PrivacyPageProps {
  businessName: string;
  businessType?: string;
  contactEmail?: string;
  websiteUrl?: string;
  lastUpdated?: string;
  collectsData?: {
    personalInfo?: boolean;
    cookies?: boolean;
    analytics?: boolean;
    payments?: boolean;
    location?: boolean;
  };
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    headingColor?: string;
    accentColor?: string;
    fontFamily?: string;
  };
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({
  businessName,
  businessType = 'empresa',
  contactEmail,
  websiteUrl,
  lastUpdated = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }),
  collectsData = { personalInfo: true, cookies: true, analytics: true },
  styles = {}
}) => {
  const {
    backgroundColor = '#ffffff',
    textColor = '#374151',
    headingColor = '#111827',
    accentColor = '#3b82f6',
    fontFamily = 'Inter, system-ui, sans-serif'
  } = styles;

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
            Política de Privacidad
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
            En <strong style={{ color: headingColor }}>{businessName}</strong>, accesible desde 
            {websiteUrl && <> <a href={websiteUrl} style={{ color: accentColor }} className="underline">{websiteUrl}</a></>}, 
            una de nuestras principales prioridades es la privacidad de nuestros visitantes. 
            Este documento de Política de Privacidad contiene los tipos de información que se 
            recopilan y registran y cómo la utilizamos.
          </p>
        </section>

        {/* Consentimiento */}
        <section className="mb-10">
          <h2 
            className="text-2xl font-semibold mb-4"
            style={{ color: headingColor }}
          >
            Consentimiento
          </h2>
          <p 
            className="text-base leading-relaxed"
            style={{ color: textColor }}
          >
            Al utilizar nuestro sitio web, usted acepta nuestra Política de Privacidad y 
            acepta sus términos.
          </p>
        </section>

        {/* Información que recopilamos */}
        <section className="mb-10">
          <h2 
            className="text-2xl font-semibold mb-4"
            style={{ color: headingColor }}
          >
            Información que Recopilamos
          </h2>
          <p 
            className="text-base leading-relaxed mb-4"
            style={{ color: textColor }}
          >
            La información personal que se le solicita proporcionar, y las razones por las 
            que se le solicita proporcionarla, se le aclararán en el momento en que le 
            solicitemos que proporcione su información personal.
          </p>
          {collectsData.personalInfo && (
            <p className="text-base leading-relaxed mb-4" style={{ color: textColor }}>
              Si se comunica con nosotros directamente, podemos recibir información adicional 
              sobre usted, como su nombre, dirección de correo electrónico, número de teléfono, 
              el contenido del mensaje y/o los archivos adjuntos que nos envíe, y cualquier 
              otra información que elija proporcionar.
            </p>
          )}
        </section>

        {/* Cómo usamos su información */}
        <section className="mb-10">
          <h2 
            className="text-2xl font-semibold mb-4"
            style={{ color: headingColor }}
          >
            Cómo Usamos su Información
          </h2>
          <p 
            className="text-base leading-relaxed mb-4"
            style={{ color: textColor }}
          >
            Utilizamos la información que recopilamos de varias maneras, incluyendo para:
          </p>
          <ul className="list-disc pl-6 space-y-2" style={{ color: textColor }}>
            <li>Proporcionar, operar y mantener nuestro sitio web</li>
            <li>Mejorar, personalizar y expandir nuestro sitio web</li>
            <li>Comprender y analizar cómo utiliza nuestro sitio web</li>
            <li>Desarrollar nuevos productos, servicios, características y funcionalidades</li>
            <li>Comunicarnos con usted para proporcionarle actualizaciones y otra información</li>
            <li>Enviarle correos electrónicos</li>
            <li>Encontrar y prevenir el fraude</li>
          </ul>
        </section>

        {/* Cookies */}
        {collectsData.cookies && (
          <section className="mb-10">
            <h2 
              className="text-2xl font-semibold mb-4"
              style={{ color: headingColor }}
            >
              Cookies
            </h2>
            <p 
              className="text-base leading-relaxed mb-4"
              style={{ color: textColor }}
            >
              Como cualquier otro sitio web, {businessName} utiliza "cookies". Estas cookies 
              se utilizan para almacenar información, incluidas las preferencias de los 
              visitantes y las páginas del sitio web que el visitante accedió o visitó. 
              La información se utiliza para optimizar la experiencia de los usuarios 
              personalizando el contenido de nuestra página web según el tipo de navegador 
              de los visitantes y/u otra información.
            </p>
          </section>
        )}

        {/* Derechos de privacidad */}
        <section className="mb-10">
          <h2 
            className="text-2xl font-semibold mb-4"
            style={{ color: headingColor }}
          >
            Sus Derechos de Privacidad
          </h2>
          <p 
            className="text-base leading-relaxed mb-4"
            style={{ color: textColor }}
          >
            Nos gustaría asegurarnos de que está completamente al tanto de todos sus derechos 
            de protección de datos. Todo usuario tiene derecho a lo siguiente:
          </p>
          <ul className="list-disc pl-6 space-y-2" style={{ color: textColor }}>
            <li><strong>Derecho de acceso</strong> – Tiene derecho a solicitar copias de sus datos personales.</li>
            <li><strong>Derecho de rectificación</strong> – Tiene derecho a solicitar que corrijamos cualquier información que crea que es inexacta.</li>
            <li><strong>Derecho de supresión</strong> – Tiene derecho a solicitar que borremos sus datos personales, bajo ciertas condiciones.</li>
            <li><strong>Derecho a restringir el procesamiento</strong> – Tiene derecho a solicitar que restrinjamos el procesamiento de sus datos personales.</li>
            <li><strong>Derecho a oponerse al procesamiento</strong> – Tiene derecho a oponerse a nuestro procesamiento de sus datos personales.</li>
            <li><strong>Derecho a la portabilidad de datos</strong> – Tiene derecho a solicitar que transfiramos los datos que hemos recopilado a otra organización.</li>
          </ul>
        </section>

        {/* Seguridad */}
        <section className="mb-10">
          <h2 
            className="text-2xl font-semibold mb-4"
            style={{ color: headingColor }}
          >
            Seguridad de la Información
          </h2>
          <p 
            className="text-base leading-relaxed"
            style={{ color: textColor }}
          >
            La seguridad de su información personal es importante para nosotros, pero recuerde 
            que ningún método de transmisión por Internet o método de almacenamiento electrónico 
            es 100% seguro. Si bien nos esforzamos por utilizar medios comercialmente aceptables 
            para proteger su información personal, no podemos garantizar su seguridad absoluta.
          </p>
        </section>

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
            Si tiene alguna pregunta sobre esta Política de Privacidad, puede contactarnos:
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

export default PrivacyPage;
