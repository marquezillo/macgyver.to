/**
 * AboutPage - Página Sobre Nosotros
 * Muestra información del negocio, equipo, historia y valores
 */

import React from 'react';

export interface AboutPageProps {
  businessName: string;
  businessType?: string;
  tagline?: string;
  description?: string;
  mission?: string;
  vision?: string;
  history?: string;
  values?: { title: string; description: string; icon?: string }[];
  team?: TeamMember[];
  stats?: { label: string; value: string }[];
  contactEmail?: string;
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    headingColor?: string;
    accentColor?: string;
    fontFamily?: string;
  };
}

interface TeamMember {
  name: string;
  role: string;
  image?: string;
  bio?: string;
  social?: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

export const AboutPage: React.FC<AboutPageProps> = ({
  businessName,
  businessType = 'empresa',
  tagline,
  description,
  mission,
  vision,
  history,
  values = [],
  team = [],
  stats = [],
  contactEmail,
  styles = {}
}) => {
  const {
    backgroundColor = '#ffffff',
    textColor = '#374151',
    headingColor = '#111827',
    accentColor = '#3b82f6',
    fontFamily = 'Inter, system-ui, sans-serif'
  } = styles;

  // Valores por defecto si no se proporcionan
  const defaultValues: { title: string; description: string; icon?: string }[] = [
    { title: 'Excelencia', description: 'Nos esforzamos por ofrecer la más alta calidad en todo lo que hacemos.', icon: '⭐' },
    { title: 'Innovación', description: 'Buscamos constantemente nuevas formas de mejorar y evolucionar.', icon: '💡' },
    { title: 'Integridad', description: 'Actuamos con honestidad y transparencia en todas nuestras relaciones.', icon: '🤝' },
    { title: 'Compromiso', description: 'Estamos dedicados al éxito de nuestros clientes y comunidad.', icon: '💪' }
  ];

  const displayValues = values.length > 0 ? values : defaultValues;

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor, fontFamily }}
    >
      {/* Hero Section */}
      <section 
        className="py-20 px-4 sm:px-6 lg:px-8 text-center"
        style={{ background: `linear-gradient(135deg, ${accentColor}10 0%, ${backgroundColor} 100%)` }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ color: headingColor }}
          >
            Sobre {businessName}
          </h1>
          {tagline && (
            <p 
              className="text-xl md:text-2xl mb-8"
              style={{ color: accentColor }}
            >
              {tagline}
            </p>
          )}
          <p 
            className="text-lg leading-relaxed"
            style={{ color: textColor }}
          >
            {description || `Somos ${businessName}, una ${businessType} comprometida con ofrecer los mejores productos y servicios a nuestros clientes. Nuestra pasión por la excelencia nos impulsa a superar expectativas cada día.`}
          </p>
        </div>
      </section>

      {/* Stats Section */}
      {stats.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: `${accentColor}05` }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div 
                    className="text-4xl md:text-5xl font-bold mb-2"
                    style={{ color: accentColor }}
                  >
                    {stat.value}
                  </div>
                  <div style={{ color: textColor }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mission & Vision */}
      {(mission || vision) && (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
            {mission && (
              <div 
                className="p-8 rounded-2xl"
                style={{ backgroundColor: `${accentColor}08`, border: `1px solid ${accentColor}20` }}
              >
                <h2 
                  className="text-2xl font-bold mb-4 flex items-center gap-3"
                  style={{ color: headingColor }}
                >
                  <span className="text-3xl">🎯</span>
                  Nuestra Misión
                </h2>
                <p className="text-base leading-relaxed" style={{ color: textColor }}>
                  {mission}
                </p>
              </div>
            )}
            {vision && (
              <div 
                className="p-8 rounded-2xl"
                style={{ backgroundColor: `${accentColor}08`, border: `1px solid ${accentColor}20` }}
              >
                <h2 
                  className="text-2xl font-bold mb-4 flex items-center gap-3"
                  style={{ color: headingColor }}
                >
                  <span className="text-3xl">🔭</span>
                  Nuestra Visión
                </h2>
                <p className="text-base leading-relaxed" style={{ color: textColor }}>
                  {vision}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* History */}
      {history && (
        <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: `${textColor}05` }}>
          <div className="max-w-4xl mx-auto">
            <h2 
              className="text-3xl font-bold mb-8 text-center"
              style={{ color: headingColor }}
            >
              Nuestra Historia
            </h2>
            <p 
              className="text-lg leading-relaxed"
              style={{ color: textColor }}
            >
              {history}
            </p>
          </div>
        </section>
      )}

      {/* Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 
            className="text-3xl font-bold mb-12 text-center"
            style={{ color: headingColor }}
          >
            Nuestros Valores
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayValues.map((value, index) => (
              <div 
                key={index}
                className="p-6 rounded-xl text-center transition-transform hover:scale-105"
                style={{ backgroundColor: `${accentColor}08`, border: `1px solid ${accentColor}15` }}
              >
                {value.icon && (
                  <div className="text-4xl mb-4">{value.icon}</div>
                )}
                <h3 
                  className="text-xl font-semibold mb-3"
                  style={{ color: headingColor }}
                >
                  {value.title}
                </h3>
                <p style={{ color: textColor }} className="text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      {team.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: `${textColor}05` }}>
          <div className="max-w-6xl mx-auto">
            <h2 
              className="text-3xl font-bold mb-12 text-center"
              style={{ color: headingColor }}
            >
              Nuestro Equipo
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <div 
                  key={index}
                  className="p-6 rounded-xl text-center bg-white shadow-sm"
                >
                  {member.image ? (
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    />
                  ) : (
                    <div 
                      className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white"
                      style={{ backgroundColor: accentColor }}
                    >
                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                  )}
                  <h3 
                    className="text-xl font-semibold mb-1"
                    style={{ color: headingColor }}
                  >
                    {member.name}
                  </h3>
                  <p style={{ color: accentColor }} className="text-sm mb-3">
                    {member.role}
                  </p>
                  {member.bio && (
                    <p style={{ color: textColor }} className="text-sm">
                      {member.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center" style={{ backgroundColor: accentColor }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-white">
            ¿Listo para trabajar con nosotros?
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Estamos aquí para ayudarte a alcanzar tus objetivos.
          </p>
          <a 
            href={contactEmail ? `mailto:${contactEmail}` : '#contacto'}
            className="inline-block px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105"
            style={{ backgroundColor: 'white', color: accentColor }}
          >
            Contáctanos
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center" style={{ backgroundColor, borderTop: `1px solid ${textColor}20` }}>
        <p style={{ color: `${textColor}80` }} className="text-sm">
          © {new Date().getFullYear()} {businessName}. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};

export default AboutPage;
