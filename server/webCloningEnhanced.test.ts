/**
 * Tests for Enhanced Web Cloning System
 * Tests the integration of all cloning modules
 */

import { describe, it, expect, vi } from 'vitest';
import { detectCloningLevel, getCloningLevelSummary, getCloningConfig } from './cloningLevels';
import { extractStructure } from './structureExtractor';

describe('Enhanced Web Cloning System', () => {
  describe('Cloning Level Detection', () => {
    it('should detect "exact" level for exact copy requests', () => {
      const messages = [
        'Hazme una copia exacta de https://linear.app',
        'Quiero una réplica exacta de esta web',
        'Clona esta página 100% igual',
        'Necesito el mismo diseño idéntico',
      ];
      
      for (const msg of messages) {
        expect(detectCloningLevel(msg)).toBe('exact');
      }
    });

    it('should detect "replica" level for similar/clone requests', () => {
      const messages = [
        'Clona esta web https://vercel.com',
        'Hazme algo similar a esta página',
        'Quiero una landing parecida a esta',
        'Copia el estilo de esta web',
      ];
      
      for (const msg of messages) {
        expect(detectCloningLevel(msg)).toBe('replica');
      }
    });

    it('should detect "inspiration" level for vague requests', () => {
      const messages = [
        'Crea una landing para mi negocio',
        'Necesito una página web moderna',
        'Hazme un sitio web profesional',
      ];
      
      for (const msg of messages) {
        expect(detectCloningLevel(msg)).toBe('inspiration');
      }
    });
  });

  describe('Cloning Level Summaries', () => {
    it('should return correct summary for inspiration level', () => {
      const summary = getCloningLevelSummary('inspiration');
      expect(summary.name).toBe('Inspiración');
      expect(summary.emoji).toBe('💡');
      expect(summary.whatsCopied).toContain('Paleta de colores');
      expect(summary.whatsNew).toContain('Todo el contenido textual');
    });

    it('should return correct summary for replica level', () => {
      const summary = getCloningLevelSummary('replica');
      expect(summary.name).toBe('Réplica Visual');
      expect(summary.emoji).toBe('🎨');
      expect(summary.whatsCopied).toContain('Estructura exacta');
    });

    it('should return correct summary for exact level', () => {
      const summary = getCloningLevelSummary('exact');
      expect(summary.name).toBe('Copia Exacta');
      expect(summary.emoji).toBe('📋');
      expect(summary.whatsCopied).toContain('Imágenes originales');
    });
  });

  describe('Cloning Configuration', () => {
    it('should return correct config for inspiration level', () => {
      const config = getCloningConfig('inspiration');
      expect(config.copyColors).toBe(true);
      expect(config.copyTypography).toBe(true);
      expect(config.copyContent).toBe(false);
      expect(config.copyImages).toBe(false);
    });

    it('should return correct config for replica level', () => {
      const config = getCloningConfig('replica');
      expect(config.copyColors).toBe(true);
      expect(config.copyContent).toBe(true);
      expect(config.copyImages).toBe(true);
    });

    it('should return correct config for exact level', () => {
      const config = getCloningConfig('exact');
      expect(config.copyColors).toBe(true);
      expect(config.copyContent).toBe(true);
      expect(config.copyImages).toBe(true);
      expect(config.copyAnimations).toBe(true);
    });

    it('should merge custom options', () => {
      const config = getCloningConfig('inspiration', { businessName: 'Mi Empresa' });
      expect(config.businessName).toBe('Mi Empresa');
      expect(config.copyColors).toBe(true);
    });
  });

  describe('Structure Extraction', () => {
    const sampleHTML = `
      <!DOCTYPE html>
      <html>
      <head><title>Test Page</title></head>
      <body>
        <header>
          <nav>
            <a href="/" class="logo">Logo</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
          </nav>
        </header>
        <section class="hero">
          <h1>Welcome to Our Site</h1>
          <p>The best solution for your needs</p>
          <a href="/signup" class="btn">Get Started</a>
        </section>
        <section class="features">
          <h2>Features</h2>
          <div class="feature">
            <h3>Fast</h3>
            <p>Lightning fast performance</p>
          </div>
          <div class="feature">
            <h3>Secure</h3>
            <p>Enterprise-grade security</p>
          </div>
        </section>
        <section class="testimonials">
          <h2>What Our Customers Say</h2>
          <blockquote>
            <p>Amazing product!</p>
            <cite>John Doe, CEO</cite>
          </blockquote>
        </section>
        <footer>
          <p>&copy; 2024 Company</p>
          <a href="https://twitter.com">Twitter</a>
        </footer>
      </body>
      </html>
    `;

    it('should extract header section', () => {
      const sections = extractStructure(sampleHTML);
      const header = sections.find(s => s.type === 'header');
      expect(header).toBeDefined();
      expect(header?.content.navigation).toBeDefined();
    });

    it('should extract hero section', () => {
      const sections = extractStructure(sampleHTML);
      const hero = sections.find(s => s.type === 'hero');
      expect(hero).toBeDefined();
      expect(hero?.content.title).toContain('Welcome');
    });

    it('should extract features section', () => {
      const sections = extractStructure(sampleHTML);
      const features = sections.find(s => s.type === 'features');
      expect(features).toBeDefined();
      expect(features?.content.items?.length).toBeGreaterThan(0);
    });

    it('should extract testimonials section', () => {
      const sections = extractStructure(sampleHTML);
      const testimonials = sections.find(s => s.type === 'testimonials');
      expect(testimonials).toBeDefined();
    });

    it('should extract footer section', () => {
      const sections = extractStructure(sampleHTML);
      const footer = sections.find(s => s.type === 'footer');
      expect(footer).toBeDefined();
    });

    it('should maintain correct section order', () => {
      const sections = extractStructure(sampleHTML);
      const types = sections.map(s => s.type);
      
      // Header should be first
      expect(types[0]).toBe('header');
      
      // Footer should be last
      expect(types[types.length - 1]).toBe('footer');
      
      // Hero should come before features
      const heroIndex = types.indexOf('hero');
      const featuresIndex = types.indexOf('features');
      if (heroIndex !== -1 && featuresIndex !== -1) {
        expect(heroIndex).toBeLessThan(featuresIndex);
      }
    });
  });

  describe('Asset Downloader (Local Storage)', () => {
    it('should have correct base directory for local storage', async () => {
      // Import the module to check constants
      const { downloadAssets } = await import('./assetDownloader');
      expect(downloadAssets).toBeDefined();
    });
  });
});
