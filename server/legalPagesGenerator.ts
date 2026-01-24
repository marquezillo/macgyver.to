/**
 * Legal Pages Generator
 * Genera automáticamente páginas legales (términos, privacidad, contacto, about)
 * basadas en los datos del negocio extraídos de la landing.
 * Soporta múltiples idiomas: español, inglés, francés, alemán, portugués, italiano
 */

import type { PageConfig, PageType, LandingMetadata } from '../shared/landingTypes';
import { getTranslations, type LanguageTranslations } from './legalPageTranslations';

interface BusinessInfo {
  businessName: string;
  businessType?: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
  websiteUrl?: string;
  description?: string;
  industry?: string;
  language?: string; // Código de idioma (es, en, fr, de, pt, it)
}

/**
 * Extrae información del negocio desde la configuración de la landing
 */
export function extractBusinessInfo(config: any): BusinessInfo {
  const sections = config?.sections || [];
  
  // Buscar información en diferentes secciones
  const header = sections.find((s: any) => s.type === 'header');
  const hero = sections.find((s: any) => s.type === 'hero');
  const footer = sections.find((s: any) => s.type === 'footer');
  const contact = sections.find((s: any) => s.type === 'contact' || s.type === 'form');
  const about = sections.find((s: any) => s.type === 'about');
  
  // Extraer nombre del negocio
  const businessName = 
    header?.content?.logo?.text ||
    hero?.content?.title ||
    config?.metadata?.businessName ||
    config?.name ||
    'Nuestra Empresa';
  
  // Extraer descripción
  const description = 
    hero?.content?.subtitle ||
    about?.content?.description ||
    config?.metadata?.description ||
    '';
  
  // Extraer email de contacto
  const contactEmail = 
    contact?.content?.email ||
    footer?.content?.email ||
    config?.metadata?.contactEmail ||
    '';
  
  // Extraer teléfono
  const phone = 
    contact?.content?.phone ||
    footer?.content?.phone ||
    config?.metadata?.phone ||
    '';
  
  // Extraer dirección
  const address = 
    contact?.content?.address ||
    footer?.content?.address ||
    config?.metadata?.address ||
    '';
  
  // Extraer industria
  const industry = config?.metadata?.industry || config?.industry || '';
  
  // Extraer idioma (prioridad: styles.language > metadata.language > 'es')
  const language = 
    config?.styles?.language ||
    config?.metadata?.language ||
    config?.language ||
    'es';
  
  return {
    businessName,
    businessType: industry || 'empresa',
    contactEmail,
    phone,
    address,
    websiteUrl: config?.metadata?.websiteUrl || '',
    description,
    industry,
    language,
  };
}

/**
 * Genera la página de Términos y Condiciones
 */
export function generateTermsPage(info: BusinessInfo): PageConfig {
  const lastUpdated = new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const content = `
<div class="prose prose-lg max-w-none">
  <p class="text-lg text-gray-600 mb-8">
    Última actualización: ${lastUpdated}
  </p>
  
  <p class="mb-6">
    Bienvenido a <strong>${info.businessName}</strong>. Estos términos y condiciones describen las reglas 
    y regulaciones para el uso de nuestro sitio web${info.websiteUrl ? `, ubicado en ${info.websiteUrl}` : ''}.
  </p>
  
  <h2 class="text-2xl font-semibold mt-8 mb-4">1. Aceptación de los Términos</h2>
  <p class="mb-6">
    Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos Términos y Condiciones de uso, 
    todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de las leyes 
    locales aplicables. Si no está de acuerdo con alguno de estos términos, tiene prohibido usar o acceder 
    a este sitio.
  </p>
  
  <h2 class="text-2xl font-semibold mt-8 mb-4">2. Uso de la Licencia</h2>
  <p class="mb-6">
    Se concede permiso para descargar temporalmente una copia de los materiales (información o software) 
    en el sitio web de ${info.businessName} solo para visualización transitoria personal y no comercial. 
    Esta es la concesión de una licencia, no una transferencia de título.
  </p>
  
  <h2 class="text-2xl font-semibold mt-8 mb-4">3. Descargo de Responsabilidad</h2>
  <p class="mb-6">
    Los materiales en el sitio web de ${info.businessName} se proporcionan "tal cual". ${info.businessName} 
    no ofrece garantías, expresas o implícitas, y por la presente renuncia y niega todas las demás garantías, 
    incluidas, entre otras, las garantías implícitas de comerciabilidad, idoneidad para un propósito particular, 
    o no infracción de propiedad intelectual.
  </p>
  
  <h2 class="text-2xl font-semibold mt-8 mb-4">4. Limitaciones</h2>
  <p class="mb-6">
    En ningún caso ${info.businessName} o sus proveedores serán responsables de ningún daño (incluidos, 
    entre otros, daños por pérdida de datos o ganancias, o debido a la interrupción del negocio) que surja 
    del uso o la imposibilidad de usar los materiales en el sitio web.
  </p>
  
  <h2 class="text-2xl font-semibold mt-8 mb-4">5. Precisión de los Materiales</h2>
  <p class="mb-6">
    Los materiales que aparecen en el sitio web de ${info.businessName} podrían incluir errores técnicos, 
    tipográficos o fotográficos. ${info.businessName} no garantiza que ninguno de los materiales en su 
    sitio web sea preciso, completo o actual.
  </p>
  
  <h2 class="text-2xl font-semibold mt-8 mb-4">6. Enlaces</h2>
  <p class="mb-6">
    ${info.businessName} no ha revisado todos los sitios vinculados a su sitio web y no es responsable 
    de los contenidos de ningún sitio vinculado. La inclusión de cualquier enlace no implica respaldo 
    por parte de ${info.businessName}. El uso de cualquier sitio web vinculado es bajo el propio riesgo 
    del usuario.
  </p>
  
  <h2 class="text-2xl font-semibold mt-8 mb-4">7. Modificaciones</h2>
  <p class="mb-6">
    ${info.businessName} puede revisar estos términos de servicio para su sitio web en cualquier momento 
    sin previo aviso. Al usar este sitio web, usted acepta estar sujeto a la versión actual de estos 
    términos de servicio.
  </p>
  
  <h2 class="text-2xl font-semibold mt-8 mb-4">8. Ley Aplicable</h2>
  <p class="mb-6">
    Estos términos y condiciones se rigen e interpretan de acuerdo con las leyes aplicables y usted 
    se somete irrevocablemente a la jurisdicción exclusiva de los tribunales competentes.
  </p>
  
  ${info.contactEmail ? `
  <h2 class="text-2xl font-semibold mt-8 mb-4">Contacto</h2>
  <p class="mb-6">
    Si tiene alguna pregunta sobre estos Términos y Condiciones, puede contactarnos en: 
    <a href="mailto:${info.contactEmail}" class="text-primary hover:underline">${info.contactEmail}</a>
  </p>
  ` : ''}
  
  <div class="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500">
    <p>© ${new Date().getFullYear()} ${info.businessName}. Todos los derechos reservados.</p>
  </div>
</div>
  `.trim();
  
  // Obtener traducciones según el idioma
  const translations = getTranslations(info.language || 'es');
  
  return {
    id: `page-terms-${Date.now()}`,
    type: 'terms',
    slug: translations.terms.slug,
    title: translations.terms.title,
    enabled: true,
    data: {
      businessName: info.businessName,
      contactEmail: info.contactEmail,
      content,
      language: info.language,
    },
  };
}

/**
 * Genera la página de Política de Privacidad
 */
export function generatePrivacyPage(info: BusinessInfo): PageConfig {
  const lastUpdated = new Date().toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const content = `
<div class="prose prose-lg max-w-none">
  <p class="text-lg text-gray-600 mb-8">
    Última actualización: ${lastUpdated}
  </p>
  
  <p class="mb-6">
    En <strong>${info.businessName}</strong> nos tomamos muy en serio la privacidad de nuestros usuarios. 
    Esta Política de Privacidad describe cómo recopilamos, usamos y protegemos su información personal.
  </p>
  
  <h2 class="text-2xl font-semibold mt-8 mb-4">1. Información que Recopilamos</h2>
  <p class="mb-4">Podemos recopilar los siguientes tipos de información:</p>
  <ul class="list-disc pl-6 mb-6 space-y-2">
    <li><strong>Información de contacto:</strong> nombre, dirección de correo electrónico, número de teléfono</li>
    <li><strong>Información de uso:</strong> cómo interactúa con nuestro sitio web</li>
    <li><strong>Información técnica:</strong> dirección IP, tipo de navegador, dispositivo</li>
    <li><strong>Cookies:</strong> pequeños archivos de datos almacenados en su dispositivo</li>
  </ul>
  
  <h2 class="text-2xl font-semibold mt-8 mb-4">2. Cómo Usamos su Información</h2>
  <p class="mb-4">Utilizamos la información recopilada para:</p>
  <ul class="list-disc pl-6 mb-6 space-y-2">
    <li>Proporcionar y mejorar nuestros servicios</li>
    <li>Comunicarnos con usted sobre actualizaciones y ofertas</li>
    <li>Personalizar su experiencia en nuestro sitio</li>
    <li>Cumplir con obligaciones legales</li>
    <li>Proteger contra actividades fraudulentas</li>
  </ul>
  
  <h2 class="text-2xl font-semibold mt-8 mb-4">3. Protección de Datos</h2>
  <p class="mb-6">
    Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger su información 
    personal contra acceso no autorizado, alteración, divulgación o destrucción. Sin embargo, ningún 
    método de transmisión por Internet es 100% seguro.
  </p>
  
  <h2 class="text-2xl font-semibold mt-8 mb-4">4. Cookies</h2>
  <p class="mb-6">
    Nuestro sitio web utiliza cookies para mejorar su experiencia. Las cookies son pequeños archivos 
    de texto que se almacenan en su dispositivo. Puede configurar su navegador para rechazar cookies, 
    aunque esto puede afectar la funcionalidad del sitio.
  </p>
  
  <h2 class="text-2xl font-semibold mt-8 mb-4">5. Compartir Información</h2>
  <p class="mb-6">
    No vendemos, comercializamos ni transferimos su información personal a terceros sin su consentimiento, 
    excepto cuando sea necesario para proporcionar nuestros servicios o cuando la ley lo requiera.
  </p>
  
  <h2 class="text-2xl font-semibold mt-8 mb-4">6. Sus Derechos</h2>
  <p class="mb-4">Usted tiene derecho a:</p>
  <ul class="list-disc pl-6 mb-6 space-y-2">
    <li>Acceder a sus datos personales</li>
    <li>Rectificar datos inexactos</li>
    <li>Solicitar la eliminación de sus datos</li>
    <li>Oponerse al procesamiento de sus datos</li>
    <li>Solicitar la portabilidad de sus datos</li>
  </ul>
  
  <h2 class="text-2xl font-semibold mt-8 mb-4">7. Retención de Datos</h2>
  <p class="mb-6">
    Conservamos su información personal solo durante el tiempo necesario para cumplir con los fines 
    para los que fue recopilada, o según lo requiera la ley aplicable.
  </p>
  
  <h2 class="text-2xl font-semibold mt-8 mb-4">8. Cambios en esta Política</h2>
  <p class="mb-6">
    Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos sobre cambios 
    significativos publicando la nueva política en nuestro sitio web.
  </p>
  
  ${info.contactEmail ? `
  <h2 class="text-2xl font-semibold mt-8 mb-4">Contacto</h2>
  <p class="mb-6">
    Si tiene preguntas sobre esta Política de Privacidad, contáctenos en: 
    <a href="mailto:${info.contactEmail}" class="text-primary hover:underline">${info.contactEmail}</a>
  </p>
  ` : ''}
  
  <div class="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500">
    <p>© ${new Date().getFullYear()} ${info.businessName}. Todos los derechos reservados.</p>
  </div>
</div>
  `.trim();
  
  // Obtener traducciones según el idioma
  const translations = getTranslations(info.language || 'es');
  
  return {
    id: `page-privacy-${Date.now()}`,
    type: 'privacy',
    slug: translations.privacy.slug,
    title: translations.privacy.title,
    enabled: true,
    data: {
      businessName: info.businessName,
      contactEmail: info.contactEmail,
      content,
      language: info.language,
    },
  };
}

/**
 * Genera la página de Contacto
 */
export function generateContactPage(info: BusinessInfo): PageConfig {
  const content = `
<div class="max-w-4xl mx-auto">
  <p class="text-lg text-gray-600 mb-8 text-center">
    ¿Tienes alguna pregunta o comentario? Nos encantaría escucharte. 
    Completa el formulario a continuación o utiliza nuestros datos de contacto.
  </p>
  
  <div class="grid md:grid-cols-2 gap-12">
    <!-- Información de contacto -->
    <div class="space-y-6">
      <h2 class="text-2xl font-semibold mb-6">Información de Contacto</h2>
      
      ${info.contactEmail ? `
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
        </div>
        <div>
          <h3 class="font-semibold text-gray-900">Email</h3>
          <a href="mailto:${info.contactEmail}" class="text-primary hover:underline">${info.contactEmail}</a>
        </div>
      </div>
      ` : ''}
      
      ${info.phone ? `
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
          </svg>
        </div>
        <div>
          <h3 class="font-semibold text-gray-900">Teléfono</h3>
          <a href="tel:${info.phone}" class="text-primary hover:underline">${info.phone}</a>
        </div>
      </div>
      ` : ''}
      
      ${info.address ? `
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <div>
          <h3 class="font-semibold text-gray-900">Dirección</h3>
          <p class="text-gray-600">${info.address}</p>
        </div>
      </div>
      ` : ''}
      
      <div class="pt-6">
        <h3 class="font-semibold text-gray-900 mb-4">Horario de Atención</h3>
        <div class="space-y-2 text-gray-600">
          <p>Lunes - Viernes: 9:00 - 18:00</p>
          <p>Sábado: 10:00 - 14:00</p>
          <p>Domingo: Cerrado</p>
        </div>
      </div>
    </div>
    
    <!-- Formulario de contacto -->
    <div class="bg-gray-50 p-8 rounded-2xl">
      <h2 class="text-2xl font-semibold mb-6">Envíanos un Mensaje</h2>
      <form class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Tu nombre">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="tu@email.com">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
          <input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="¿En qué podemos ayudarte?">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
          <textarea rows="4" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Escribe tu mensaje aquí..."></textarea>
        </div>
        <button type="submit" class="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
          Enviar Mensaje
        </button>
      </form>
    </div>
  </div>
</div>
  `.trim();
  
  // Obtener traducciones según el idioma
  const translations = getTranslations(info.language || 'es');
  
  return {
    id: `page-contact-${Date.now()}`,
    type: 'contact',
    slug: translations.contact.slug,
    title: translations.contact.title,
    enabled: true,
    data: {
      businessName: info.businessName,
      contactEmail: info.contactEmail,
      phone: info.phone,
      address: info.address,
      content,
      language: info.language,
    },
  };
}

/**
 * Genera la página Sobre Nosotros
 */
export function generateAboutPage(info: BusinessInfo): PageConfig {
  const content = `
<div class="max-w-4xl mx-auto">
  <p class="text-xl text-gray-600 mb-12 text-center leading-relaxed">
    ${info.description || `En ${info.businessName} nos dedicamos a ofrecer los mejores servicios y productos a nuestros clientes, con un compromiso inquebrantable con la calidad y la satisfacción.`}
  </p>
  
  <div class="grid md:grid-cols-2 gap-12 mb-16">
    <div>
      <h2 class="text-2xl font-semibold mb-4">Nuestra Misión</h2>
      <p class="text-gray-600 leading-relaxed">
        Nuestra misión es proporcionar soluciones excepcionales que superen las expectativas de nuestros 
        clientes, manteniendo los más altos estándares de calidad e innovación en todo lo que hacemos.
      </p>
    </div>
    <div>
      <h2 class="text-2xl font-semibold mb-4">Nuestra Visión</h2>
      <p class="text-gray-600 leading-relaxed">
        Aspiramos a ser líderes reconocidos en nuestro sector, destacando por nuestra excelencia, 
        integridad y compromiso con el desarrollo sostenible y el bienestar de nuestra comunidad.
      </p>
    </div>
  </div>
  
  <div class="bg-gray-50 rounded-2xl p-8 mb-16">
    <h2 class="text-2xl font-semibold mb-6 text-center">Nuestros Valores</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="text-center">
        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 class="font-semibold mb-2">Calidad</h3>
        <p class="text-gray-600 text-sm">Nos comprometemos con la excelencia en cada detalle</p>
      </div>
      <div class="text-center">
        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
        <h3 class="font-semibold mb-2">Compromiso</h3>
        <p class="text-gray-600 text-sm">Dedicación total a nuestros clientes y su satisfacción</p>
      </div>
      <div class="text-center">
        <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <h3 class="font-semibold mb-2">Innovación</h3>
        <p class="text-gray-600 text-sm">Siempre buscando nuevas formas de mejorar</p>
      </div>
    </div>
  </div>
  
  <div class="text-center">
    <h2 class="text-2xl font-semibold mb-4">¿Quieres saber más?</h2>
    <p class="text-gray-600 mb-6">
      Estamos aquí para responder todas tus preguntas y ayudarte en lo que necesites.
    </p>
    <a href="/contacto" class="inline-block bg-primary text-white py-3 px-8 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
      Contáctanos
    </a>
  </div>
</div>
  `.trim();
  
  // Obtener traducciones según el idioma
  const translations = getTranslations(info.language || 'es');
  
  return {
    id: `page-about-${Date.now()}`,
    type: 'about',
    slug: translations.about.slug,
    title: translations.about.title,
    enabled: true,
    data: {
      businessName: info.businessName,
      description: info.description,
      content,
      language: info.language,
    },
  };
}

/**
 * Genera todas las páginas legales automáticamente
 */
export function generateAllLegalPages(config: any): PageConfig[] {
  const info = extractBusinessInfo(config);
  
  return [
    generateTermsPage(info),
    generatePrivacyPage(info),
    generateContactPage(info),
    generateAboutPage(info),
  ];
}

/**
 * Genera páginas específicas según los tipos solicitados
 */
export function generateLegalPages(config: any, pageTypes: PageType[]): PageConfig[] {
  const info = extractBusinessInfo(config);
  const pages: PageConfig[] = [];
  
  for (const type of pageTypes) {
    switch (type) {
      case 'terms':
        pages.push(generateTermsPage(info));
        break;
      case 'privacy':
        pages.push(generatePrivacyPage(info));
        break;
      case 'contact':
        pages.push(generateContactPage(info));
        break;
      case 'about':
        pages.push(generateAboutPage(info));
        break;
    }
  }
  
  return pages;
}

export { BusinessInfo };
