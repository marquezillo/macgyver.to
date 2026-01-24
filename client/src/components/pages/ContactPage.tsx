/**
 * ContactPage - Página de Contacto
 * Formulario de contacto con información de la empresa
 */

import React, { useState } from 'react';

export interface ContactPageProps {
  businessName: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
  mapEmbedUrl?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  businessHours?: { day: string; hours: string }[];
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    headingColor?: string;
    accentColor?: string;
    fontFamily?: string;
  };
  onSubmit?: (data: ContactFormData) => void;
}

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  businessName,
  contactEmail,
  phone,
  address,
  mapEmbedUrl,
  socialLinks = {},
  businessHours = [],
  styles = {},
  onSubmit
}) => {
  const {
    backgroundColor = '#ffffff',
    textColor = '#374151',
    headingColor = '#111827',
    accentColor = '#3b82f6',
    fontFamily = 'Inter, system-ui, sans-serif'
  } = styles;

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (onSubmit) {
      await onSubmit(formData);
    }
    
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const defaultHours = [
    { day: 'Lunes - Viernes', hours: '9:00 - 18:00' },
    { day: 'Sábado', hours: '10:00 - 14:00' },
    { day: 'Domingo', hours: 'Cerrado' }
  ];

  const displayHours = businessHours.length > 0 ? businessHours : defaultHours;

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
            Contáctanos
          </h1>
          <p 
            className="text-lg"
            style={{ color: textColor }}
          >
            Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          
          {/* Contact Form */}
          <div 
            className="p-8 rounded-2xl"
            style={{ backgroundColor: `${textColor}05`, border: `1px solid ${textColor}10` }}
          >
            <h2 
              className="text-2xl font-bold mb-6"
              style={{ color: headingColor }}
            >
              Envíanos un mensaje
            </h2>

            {submitted ? (
              <div 
                className="p-8 rounded-xl text-center"
                style={{ backgroundColor: `${accentColor}10` }}
              >
                <div className="text-5xl mb-4">✅</div>
                <h3 
                  className="text-xl font-semibold mb-2"
                  style={{ color: headingColor }}
                >
                  ¡Mensaje enviado!
                </h3>
                <p style={{ color: textColor }}>
                  Gracias por contactarnos. Te responderemos pronto.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                  }}
                  className="mt-6 px-6 py-2 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: accentColor, color: 'white' }}
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label 
                      htmlFor="name" 
                      className="block text-sm font-medium mb-2"
                      style={{ color: headingColor }}
                    >
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ 
                        borderColor: `${textColor}20`,
                        backgroundColor: 'white',
                        color: headingColor
                      }}
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label 
                      htmlFor="email" 
                      className="block text-sm font-medium mb-2"
                      style={{ color: headingColor }}
                    >
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ 
                        borderColor: `${textColor}20`,
                        backgroundColor: 'white',
                        color: headingColor
                      }}
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label 
                      htmlFor="phone" 
                      className="block text-sm font-medium mb-2"
                      style={{ color: headingColor }}
                    >
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ 
                        borderColor: `${textColor}20`,
                        backgroundColor: 'white',
                        color: headingColor
                      }}
                      placeholder="+34 600 000 000"
                    />
                  </div>
                  <div>
                    <label 
                      htmlFor="subject" 
                      className="block text-sm font-medium mb-2"
                      style={{ color: headingColor }}
                    >
                      Asunto *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                      style={{ 
                        borderColor: `${textColor}20`,
                        backgroundColor: 'white',
                        color: headingColor
                      }}
                    >
                      <option value="">Selecciona un asunto</option>
                      <option value="info">Información general</option>
                      <option value="quote">Solicitar presupuesto</option>
                      <option value="support">Soporte técnico</option>
                      <option value="partnership">Colaboración</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label 
                    htmlFor="message" 
                    className="block text-sm font-medium mb-2"
                    style={{ color: headingColor }}
                  >
                    Mensaje *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all resize-none"
                    style={{ 
                      borderColor: `${textColor}20`,
                      backgroundColor: 'white',
                      color: headingColor
                    }}
                    placeholder="¿En qué podemos ayudarte?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-lg font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: accentColor, color: 'white' }}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            {/* Info Cards */}
            <div className="space-y-4">
              {contactEmail && (
                <div 
                  className="p-6 rounded-xl flex items-start gap-4"
                  style={{ backgroundColor: `${accentColor}08`, border: `1px solid ${accentColor}15` }}
                >
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: accentColor, color: 'white' }}
                  >
                    ✉️
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: headingColor }}>
                      Correo electrónico
                    </h3>
                    <a 
                      href={`mailto:${contactEmail}`}
                      className="hover:underline"
                      style={{ color: accentColor }}
                    >
                      {contactEmail}
                    </a>
                  </div>
                </div>
              )}

              {phone && (
                <div 
                  className="p-6 rounded-xl flex items-start gap-4"
                  style={{ backgroundColor: `${accentColor}08`, border: `1px solid ${accentColor}15` }}
                >
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: accentColor, color: 'white' }}
                  >
                    📞
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: headingColor }}>
                      Teléfono
                    </h3>
                    <a 
                      href={`tel:${phone}`}
                      className="hover:underline"
                      style={{ color: accentColor }}
                    >
                      {phone}
                    </a>
                  </div>
                </div>
              )}

              {address && (
                <div 
                  className="p-6 rounded-xl flex items-start gap-4"
                  style={{ backgroundColor: `${accentColor}08`, border: `1px solid ${accentColor}15` }}
                >
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: accentColor, color: 'white' }}
                  >
                    📍
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: headingColor }}>
                      Dirección
                    </h3>
                    <p style={{ color: textColor }}>{address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Business Hours */}
            <div 
              className="p-6 rounded-xl"
              style={{ backgroundColor: `${textColor}05`, border: `1px solid ${textColor}10` }}
            >
              <h3 
                className="font-semibold mb-4 flex items-center gap-2"
                style={{ color: headingColor }}
              >
                🕐 Horario de atención
              </h3>
              <div className="space-y-2">
                {displayHours.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span style={{ color: textColor }}>{item.day}</span>
                    <span style={{ color: headingColor }} className="font-medium">{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            {Object.keys(socialLinks).length > 0 && (
              <div>
                <h3 
                  className="font-semibold mb-4"
                  style={{ color: headingColor }}
                >
                  Síguenos en redes sociales
                </h3>
                <div className="flex gap-3">
                  {socialLinks.facebook && (
                    <a 
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-transform hover:scale-110"
                      style={{ backgroundColor: `${accentColor}10`, color: accentColor }}
                    >
                      📘
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a 
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-transform hover:scale-110"
                      style={{ backgroundColor: `${accentColor}10`, color: accentColor }}
                    >
                      📷
                    </a>
                  )}
                  {socialLinks.twitter && (
                    <a 
                      href={socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-transform hover:scale-110"
                      style={{ backgroundColor: `${accentColor}10`, color: accentColor }}
                    >
                      🐦
                    </a>
                  )}
                  {socialLinks.linkedin && (
                    <a 
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-transform hover:scale-110"
                      style={{ backgroundColor: `${accentColor}10`, color: accentColor }}
                    >
                      💼
                    </a>
                  )}
                  {socialLinks.youtube && (
                    <a 
                      href={socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-transform hover:scale-110"
                      style={{ backgroundColor: `${accentColor}10`, color: accentColor }}
                    >
                      ▶️
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Map */}
      {mapEmbedUrl && (
        <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: `${textColor}05` }}>
          <div className="max-w-6xl mx-auto">
            <h2 
              className="text-2xl font-bold mb-8 text-center"
              style={{ color: headingColor }}
            >
              Encuéntranos
            </h2>
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación"
              />
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 text-center" style={{ backgroundColor, borderTop: `1px solid ${textColor}20` }}>
        <p style={{ color: `${textColor}80` }} className="text-sm">
          © {new Date().getFullYear()} {businessName}. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};

export default ContactPage;
