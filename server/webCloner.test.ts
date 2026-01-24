/**
 * Tests para el sistema de clonación de webs
 */

import { describe, it, expect } from 'vitest';
import { detectCloneIntent, extractUrl, generateCloneInstructions } from './cloneIntentDetector';

describe('Clone Intent Detector', () => {
  describe('detectCloneIntent', () => {
    it('detecta intención de clonar en español con URL', () => {
      const result = detectCloneIntent('Créame una web como https://stripe.com');
      expect(result.isCloneRequest).toBe(true);
      expect(result.url).toBe('https://stripe.com');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('detecta intención de clonar con "clona esta web"', () => {
      const result = detectCloneIntent('Clona esta web: https://linear.app');
      expect(result.isCloneRequest).toBe(true);
      expect(result.url).toBe('https://linear.app');
    });

    it('detecta intención de clonar con "hazme una landing igual"', () => {
      const result = detectCloneIntent('Hazme una landing igual a https://vercel.com');
      expect(result.isCloneRequest).toBe(true);
      expect(result.url).toBe('https://vercel.com');
    });

    it('detecta intención de clonar en inglés', () => {
      const result = detectCloneIntent('Create a website like https://notion.so');
      expect(result.isCloneRequest).toBe(true);
      expect(result.url).toBe('https://notion.so');
    });

    it('detecta intención con "copia el diseño"', () => {
      const result = detectCloneIntent('Copia el diseño de https://figma.com');
      expect(result.isCloneRequest).toBe(true);
      expect(result.url).toBe('https://figma.com');
    });

    it('NO detecta intención cuando no hay patrones de clonación', () => {
      const result = detectCloneIntent('Crea una landing para mi restaurante');
      expect(result.isCloneRequest).toBe(false);
    });

    it('detecta URL sin protocolo', () => {
      const result = detectCloneIntent('Hazme una web como stripe.com');
      expect(result.isCloneRequest).toBe(true);
      expect(result.url).toBe('https://stripe.com');
    });

    it('detecta URL con www', () => {
      const result = detectCloneIntent('Clona www.example.com');
      expect(result.isCloneRequest).toBe(true);
      expect(result.url).toBe('https://www.example.com');
    });
  });

  describe('extractUrl', () => {
    it('extrae URL completa con https', () => {
      const url = extractUrl('Mira esta página https://example.com/page');
      expect(url).toBe('https://example.com/page');
    });

    it('extrae URL con http', () => {
      const url = extractUrl('Visita http://test.com');
      expect(url).toBe('http://test.com');
    });

    it('extrae dominio sin protocolo y añade https', () => {
      const url = extractUrl('El sitio es example.com');
      expect(url).toBe('https://example.com');
    });

    it('retorna null si no hay URL', () => {
      const url = extractUrl('No hay ninguna URL aquí');
      expect(url).toBeNull();
    });
  });

  describe('generateCloneInstructions', () => {
    it('genera instrucciones con la URL proporcionada', () => {
      const instructions = generateCloneInstructions('https://stripe.com');
      expect(instructions).toContain('https://stripe.com');
      expect(instructions).toContain('INSTRUCCIONES DE CLONACIÓN');
    });
  });
});
