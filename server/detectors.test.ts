import { describe, it, expect } from 'vitest';
import { detectUserColors, generateColorInstructions } from './userColorDetector';
import { detectLanguage, generateLanguageInstructions, getUITranslations } from './languageDetector';
import { generateAvatarsForTestimonials, getAvatarForName, isValidAvatarUrl } from './avatarService';

describe('User Color Detector', () => {
  it('should detect Spanish color names', () => {
    const result = detectUserColors('Crea una landing con colores azules');
    expect(result.detected).toBe(true);
    expect(result.colorNames).toContain('azul');
    expect(result.primary).toBe('#2563eb');
  });

  it('should detect English color names', () => {
    const result = detectUserColors('Create a landing with blue colors');
    expect(result.detected).toBe(true);
    expect(result.colorNames).toContain('blue');
    expect(result.primary).toBe('#2563eb');
  });

  it('should detect multiple colors', () => {
    const result = detectUserColors('Quiero colores azul y verde');
    expect(result.detected).toBe(true);
    expect(result.colorNames.length).toBeGreaterThanOrEqual(2);
  });

  it('should return no detection for messages without colors', () => {
    const result = detectUserColors('Crea una landing para mi restaurante');
    expect(result.detected).toBe(false);
    expect(result.colorNames.length).toBe(0);
  });

  it('should generate color instructions when colors detected', () => {
    const colors = detectUserColors('Usa colores azules');
    const instructions = generateColorInstructions(colors);
    expect(instructions).toContain('Primary color');
    expect(instructions).toContain('#2563eb');
  });

  it('should return empty instructions when no colors detected', () => {
    const colors = detectUserColors('Crea una landing');
    const instructions = generateColorInstructions(colors);
    expect(instructions).toBe('');
  });
});

describe('Language Detector', () => {
  it('should detect Spanish language', () => {
    const result = detectLanguage('Crea una landing page para mi clínica dental');
    expect(result.language).toBe('es');
    expect(result.spanishScore).toBeGreaterThan(result.englishScore);
  });

  it('should detect English language', () => {
    const result = detectLanguage('Create a landing page for my dental clinic');
    expect(result.language).toBe('en');
    expect(result.englishScore).toBeGreaterThan(result.spanishScore);
  });

  it('should detect Spanish with special characters', () => {
    const result = detectLanguage('Diseña una página con sección de preguntas frecuentes');
    expect(result.language).toBe('es');
  });

  it('should generate Spanish instructions for Spanish messages', () => {
    const detection = detectLanguage('Crea una landing para mi negocio');
    const instructions = generateLanguageInstructions(detection);
    expect(instructions).toContain('ESPAÑOL');
    expect(instructions).toContain('español');
  });

  it('should generate English instructions for English messages', () => {
    const detection = detectLanguage('Create a landing for my business');
    const instructions = generateLanguageInstructions(detection);
    expect(instructions).toContain('ENGLISH');
    expect(instructions).toContain('English');
  });

  it('should provide correct UI translations for Spanish', () => {
    const translations = getUITranslations('es');
    expect(translations.getStarted).toBe('Comenzar');
    expect(translations.contactUs).toBe('Contáctanos');
    expect(translations.name).toBe('Nombre');
  });

  it('should provide correct UI translations for English', () => {
    const translations = getUITranslations('en');
    expect(translations.getStarted).toBe('Get Started');
    expect(translations.contactUs).toBe('Contact Us');
    expect(translations.name).toBe('Name');
  });
});

describe('Avatar Service', () => {
  it('should return avatar URL for a name', () => {
    const avatar = getAvatarForName('María García', 0);
    expect(avatar).toContain('unsplash.com');
  });

  it('should return different avatars for different indices', () => {
    const avatar1 = getAvatarForName('John Doe', 0);
    const avatar2 = getAvatarForName('John Doe', 1);
    expect(avatar1).not.toBe(avatar2);
  });

  it('should enrich testimonials with avatar URLs', () => {
    const testimonials = [
      { name: 'María García' },
      { name: 'John Smith' },
      { name: 'Ana López' }
    ];
    
    const enriched = generateAvatarsForTestimonials(testimonials);
    
    expect(enriched.length).toBe(3);
    enriched.forEach(t => {
      expect(t.image).toContain('unsplash.com');
      expect(t.avatar).toContain('unsplash.com');
    });
  });

  it('should keep existing valid Unsplash URLs', () => {
    const testimonials = [
      { 
        name: 'Test User',
        image: 'https://images.unsplash.com/photo-existing?w=150'
      }
    ];
    
    const enriched = generateAvatarsForTestimonials(testimonials);
    expect(enriched[0].image).toBe('https://images.unsplash.com/photo-existing?w=150');
  });

  it('should validate Unsplash URLs as valid', () => {
    expect(isValidAvatarUrl('https://images.unsplash.com/photo-123?w=150')).toBe(true);
  });

  it('should reject placeholder URLs as invalid', () => {
    expect(isValidAvatarUrl('https://via.placeholder.com/150')).toBe(false);
    expect(isValidAvatarUrl('https://randomuser.me/api/portraits/men/1.jpg')).toBe(false);
  });

  it('should reject empty or invalid URLs', () => {
    expect(isValidAvatarUrl('')).toBe(false);
    expect(isValidAvatarUrl('undefined')).toBe(false);
    expect(isValidAvatarUrl('null')).toBe(false);
  });
});
