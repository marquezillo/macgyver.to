import { describe, it, expect } from 'vitest';
import { detectIndustry, enrichPromptWithIndustry } from './industryDetector';
import { generateIndustryJSONExample, generateIndustryInstructions } from './industryJSONExamples';
import { allPatterns } from './industryPatterns';

describe('Industry Detection', () => {
  it('should detect SaaS industry from keywords', () => {
    const result = detectIndustry('Crea una landing para mi software de gestión');
    expect(result.detected).toBe(true);
    expect(result.pattern?.id).toBe('saas');
  });

  it('should detect restaurant industry', () => {
    const result = detectIndustry('Necesito una landing para mi restaurante italiano');
    expect(result.detected).toBe(true);
    expect(result.pattern?.category).toBe('food');
  });

  it('should detect yoga/fitness industry', () => {
    const result = detectIndustry('Quiero una web para mi estudio de yoga');
    expect(result.detected).toBe(true);
    // Yoga can be categorized as health or fitness depending on the pattern
    expect(['health', 'fitness']).toContain(result.pattern?.category);
  });

  it('should detect real estate industry', () => {
    const result = detectIndustry('Landing para inmobiliaria de lujo');
    expect(result.detected).toBe(true);
    expect(result.pattern?.category).toBe('real-estate');
  });
});

describe('Industry JSON Examples', () => {
  it('should generate valid JSON for SaaS pattern', () => {
    const saasPattern = allPatterns['saas'];
    const jsonStr = generateIndustryJSONExample(saasPattern, 'TechCorp');
    const json = JSON.parse(jsonStr);
    
    expect(json.type).toBe('landing');
    expect(json.businessName).toBe('TechCorp');
    expect(json.sections.length).toBeGreaterThan(5);
    
    // Check that sections follow the pattern
    const sectionTypes = json.sections.map((s: any) => s.type);
    expect(sectionTypes).toContain('hero');
    expect(sectionTypes).toContain('features');
    expect(sectionTypes).toContain('testimonials');
  });

  it('should include layout variants in sections', () => {
    const saasPattern = allPatterns['saas'];
    const jsonStr = generateIndustryJSONExample(saasPattern, 'TestApp');
    const json = JSON.parse(jsonStr);
    
    const heroSection = json.sections.find((s: any) => s.type === 'hero');
    expect(heroSection.content.layout).toBe(saasPattern.heroVariant);
    
    const featuresSection = json.sections.find((s: any) => s.type === 'features');
    expect(featuresSection.content.layout).toBe(saasPattern.featuresVariant);
  });

  it('should generate instructions with JSON example', () => {
    const restaurantPattern = allPatterns['restaurant'];
    const instructions = generateIndustryInstructions(restaurantPattern, 'La Trattoria');
    
    expect(instructions).toContain('INSTRUCCIONES OBLIGATORIAS');
    expect(instructions).toContain('Restaurant');
    expect(instructions).toContain('La Trattoria');
    expect(instructions).toContain('json');
  });
});

describe('Prompt Enrichment', () => {
  it('should enrich prompt with industry context', () => {
    const basePrompt = 'Eres un asistente de IA.';
    const enriched = enrichPromptWithIndustry(basePrompt, 'Crea landing para mi gimnasio FitLife');
    
    expect(enriched).toContain(basePrompt);
    expect(enriched).toContain('INSTRUCCIONES OBLIGATORIAS');
    expect(enriched).toContain('layout');
  });

  it('should extract business name from message', () => {
    const basePrompt = 'Base prompt';
    const enriched = enrichPromptWithIndustry(basePrompt, 'Landing para restaurante "El Buen Sabor"');
    
    expect(enriched).toContain('El Buen Sabor');
  });

  it('should return base prompt if no industry detected', () => {
    const basePrompt = 'Eres un asistente de IA.';
    const enriched = enrichPromptWithIndustry(basePrompt, 'Hola, cómo estás?');
    
    expect(enriched).toBe(basePrompt);
  });
});

describe('Pattern Coverage', () => {
  it('should have sections defined for all patterns', () => {
    for (const [id, pattern] of Object.entries(allPatterns)) {
      expect(pattern.sections.length).toBeGreaterThan(0);
      expect(pattern.heroVariant).toBeDefined();
      expect(pattern.featuresVariant).toBeDefined();
      expect(pattern.testimonialsVariant).toBeDefined();
    }
  });

  it('should generate valid JSON for multiple industries', () => {
    const testPatterns = ['saas', 'restaurant', 'yoga', 'real-estate', 'dental'];
    
    for (const patternId of testPatterns) {
      const pattern = allPatterns[patternId];
      if (pattern) {
        const jsonStr = generateIndustryJSONExample(pattern, 'TestBusiness');
        expect(() => JSON.parse(jsonStr)).not.toThrow();
      }
    }
  });
});
