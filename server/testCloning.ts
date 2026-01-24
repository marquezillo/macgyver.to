/**
 * Script de prueba para debuggear el sistema de clonación
 * Ejecutar con: npx tsx server/testCloning.ts
 */

import { scrapeWebsite } from './webCloner';
import { analyzeScreenshot } from './visualAnalyzer';
import { cloneWebsite } from './webClonerOrchestrator';
import { detectCloneIntent } from './cloneIntentDetector';
import * as fs from 'fs';

const TEST_URL = 'https://thailandarrivalcardtourist.com/';

async function testCloning() {
  console.log('='.repeat(80));
  console.log('TEST DE CLONACIÓN - DEBUG');
  console.log('='.repeat(80));
  console.log(`URL: ${TEST_URL}\n`);

  try {
    // 1. Test de detección de intención
    console.log('\n--- PASO 1: Detección de Intención ---');
    const testMessages = [
      `hazme un clon de la web ${TEST_URL}`,
      `clona esta página: ${TEST_URL}`,
      `crea una landing igual que ${TEST_URL}`,
    ];
    
    for (const msg of testMessages) {
      const intent = detectCloneIntent(msg);
      console.log(`Mensaje: "${msg.substring(0, 50)}..."`);
      console.log(`  - isCloneRequest: ${intent.isCloneRequest}`);
      console.log(`  - URL detectada: ${intent.url}`);
      console.log(`  - Confianza: ${intent.confidence}`);
    }

    // 2. Test de scraping
    console.log('\n--- PASO 2: Scraping de la Web ---');
    console.log('Iniciando scraping...');
    const scraped = await scrapeWebsite(TEST_URL);
    
    console.log(`\nResultados del scraping:`);
    console.log(`  - Título: ${scraped.title}`);
    console.log(`  - Descripción: ${scraped.description?.substring(0, 100)}...`);
    console.log(`  - Screenshot: ${scraped.screenshot.length} bytes`);
    console.log(`  - HTML: ${scraped.html.length} caracteres`);
    
    console.log(`\n  Estilos extraídos:`);
    console.log(`    - Primary color: ${scraped.styles.colors.primary}`);
    console.log(`    - Secondary color: ${scraped.styles.colors.secondary}`);
    console.log(`    - Background: ${scraped.styles.colors.background}`);
    console.log(`    - Font family: ${scraped.styles.typography.fontFamily}`);
    
    console.log(`\n  Contenido extraído:`);
    console.log(`    - Header navItems: ${scraped.content.header?.navItems?.length || 0}`);
    console.log(`    - Hero title: "${scraped.content.hero?.title?.substring(0, 50)}..."`);
    console.log(`    - Hero subtitle: "${scraped.content.hero?.subtitle?.substring(0, 50)}..."`);
    console.log(`    - Hero primaryCTA: "${scraped.content.hero?.primaryCTA?.text}"`);
    console.log(`    - Features: ${scraped.content.features?.length || 0}`);
    console.log(`    - Testimonials: ${scraped.content.testimonials?.length || 0}`);
    console.log(`    - FAQ: ${scraped.content.faq?.length || 0}`);
    
    console.log(`\n  Assets:`);
    console.log(`    - Imágenes: ${scraped.assets.images.length}`);
    scraped.assets.images.slice(0, 5).forEach((img, i) => {
      console.log(`      ${i + 1}. [${img.type}] ${img.src.substring(0, 60)}...`);
    });
    console.log(`    - Fuentes: ${scraped.assets.fonts.join(', ') || 'ninguna detectada'}`);

    // Guardar screenshot para inspección
    fs.writeFileSync('/home/ubuntu/landing-editor/debug_cloning/screenshot.png', scraped.screenshot);
    console.log('\n  Screenshot guardado en: debug_cloning/screenshot.png');

    // 3. Test de análisis visual
    console.log('\n--- PASO 3: Análisis Visual con GPT-4 Vision ---');
    console.log('Analizando screenshot...');
    const screenshotBase64 = scraped.screenshot.toString('base64');
    const visualAnalysis = await analyzeScreenshot(screenshotBase64);
    
    console.log(`\nResultados del análisis visual:`);
    console.log(`  Secciones detectadas: ${visualAnalysis.sections.length}`);
    visualAnalysis.sections.forEach((section, i) => {
      console.log(`    ${i + 1}. ${section.type} (variante: ${section.variant || 'default'})`);
      console.log(`       Descripción: ${section.description}`);
    });
    
    console.log(`\n  Paleta de colores:`);
    console.log(`    - Primary: ${visualAnalysis.colorPalette.primary}`);
    console.log(`    - Secondary: ${visualAnalysis.colorPalette.secondary}`);
    console.log(`    - Accent: ${visualAnalysis.colorPalette.accent}`);
    console.log(`    - Background: ${visualAnalysis.colorPalette.background}`);
    console.log(`    - Foreground: ${visualAnalysis.colorPalette.foreground}`);
    
    console.log(`\n  Tipografía:`);
    console.log(`    - Heading font: ${visualAnalysis.typography.headingFont}`);
    console.log(`    - Body font: ${visualAnalysis.typography.bodyFont}`);
    console.log(`    - Style: ${visualAnalysis.typography.style}`);
    
    console.log(`\n  Estilo general:`);
    console.log(`    - Overall: ${visualAnalysis.style.overall}`);
    console.log(`    - Dark mode: ${visualAnalysis.style.darkMode}`);
    console.log(`    - Border radius: ${visualAnalysis.style.borderRadius}`);
    console.log(`    - Has gradients: ${visualAnalysis.style.hasGradients}`);
    console.log(`    - Has shadows: ${visualAnalysis.style.hasShadows}`);

    // 4. Test de clonación completa
    console.log('\n--- PASO 4: Clonación Completa ---');
    console.log('Ejecutando clonación completa...');
    const cloneResult = await cloneWebsite(TEST_URL, `hazme un clon de ${TEST_URL}`);
    
    console.log(`\nResultado de la clonación:`);
    console.log(`  - Success: ${cloneResult.success}`);
    console.log(`  - Error: ${cloneResult.error || 'ninguno'}`);
    
    if (cloneResult.landingConfig) {
      console.log(`\n  Configuración generada:`);
      console.log(`    - ID: ${cloneResult.landingConfig.id}`);
      console.log(`    - Name: ${cloneResult.landingConfig.name}`);
      console.log(`    - Secciones: ${cloneResult.landingConfig.sections.length}`);
      
      cloneResult.landingConfig.sections.forEach((section, i) => {
        console.log(`      ${i + 1}. ${section.type} (order: ${section.order})`);
        // Mostrar datos relevantes según el tipo
        if (section.type === 'hero') {
          const data = section.data as any;
          console.log(`         Title: "${data.title?.substring(0, 40)}..."`);
          console.log(`         Variant: ${data.variant}`);
          console.log(`         Image: ${data.image ? 'sí' : 'no'}`);
        }
      });
      
      console.log(`\n    Tema:`);
      console.log(`      - Primary: ${cloneResult.landingConfig.theme.colors.primary}`);
      console.log(`      - Secondary: ${cloneResult.landingConfig.theme.colors.secondary}`);
      console.log(`      - Fonts: ${cloneResult.landingConfig.theme.fonts.heading} / ${cloneResult.landingConfig.theme.fonts.body}`);
      console.log(`      - Dark mode: ${cloneResult.landingConfig.theme.darkMode}`);
      
      // Guardar configuración para inspección
      fs.writeFileSync(
        '/home/ubuntu/landing-editor/debug_cloning/landingConfig.json',
        JSON.stringify(cloneResult.landingConfig, null, 2)
      );
      console.log('\n  Configuración guardada en: debug_cloning/landingConfig.json');
    }

    console.log('\n' + '='.repeat(80));
    console.log('TEST COMPLETADO');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ ERROR EN EL TEST:', error);
  }
}

// Ejecutar el test
testCloning().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});
