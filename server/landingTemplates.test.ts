import { describe, it, expect } from 'vitest';
import { 
  templates, 
  getTemplate, 
  listTemplates, 
  applyTemplateToLanding, 
  generateCSSVariables 
} from './landingTemplates';

describe('Landing Templates', () => {
  describe('templates object', () => {
    it('should have 6 predefined templates', () => {
      expect(Object.keys(templates)).toHaveLength(6);
    });

    it('should include dark, light, gradient, minimal, neon, and warm templates', () => {
      expect(templates).toHaveProperty('dark');
      expect(templates).toHaveProperty('light');
      expect(templates).toHaveProperty('gradient');
      expect(templates).toHaveProperty('minimal');
      expect(templates).toHaveProperty('neon');
      expect(templates).toHaveProperty('warm');
    });

    it('each template should have required properties', () => {
      Object.values(templates).forEach((template) => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('preview');
        expect(template).toHaveProperty('colors');
        expect(template).toHaveProperty('typography');
        expect(template).toHaveProperty('effects');
        expect(template).toHaveProperty('tailwindClasses');
      });
    });

    it('each template should have all color properties', () => {
      Object.values(templates).forEach((template) => {
        expect(template.colors).toHaveProperty('background');
        expect(template.colors).toHaveProperty('backgroundSecondary');
        expect(template.colors).toHaveProperty('text');
        expect(template.colors).toHaveProperty('textSecondary');
        expect(template.colors).toHaveProperty('primary');
        expect(template.colors).toHaveProperty('primaryHover');
        expect(template.colors).toHaveProperty('accent');
        expect(template.colors).toHaveProperty('border');
      });
    });
  });

  describe('getTemplate', () => {
    it('should return the correct template by ID', () => {
      const darkTemplate = getTemplate('dark');
      expect(darkTemplate.id).toBe('dark');
      expect(darkTemplate.name).toBe('Dark Mode');
    });

    it('should return dark template as fallback for unknown ID', () => {
      const unknownTemplate = getTemplate('unknown-template');
      expect(unknownTemplate.id).toBe('dark');
    });
  });

  describe('listTemplates', () => {
    it('should return an array of all templates', () => {
      const allTemplates = listTemplates();
      expect(Array.isArray(allTemplates)).toBe(true);
      expect(allTemplates).toHaveLength(6);
    });

    it('should include all template IDs', () => {
      const allTemplates = listTemplates();
      const ids = allTemplates.map(t => t.id);
      expect(ids).toContain('dark');
      expect(ids).toContain('light');
      expect(ids).toContain('gradient');
      expect(ids).toContain('minimal');
      expect(ids).toContain('neon');
      expect(ids).toContain('warm');
    });
  });

  describe('applyTemplateToLanding', () => {
    it('should apply template to landing JSON', () => {
      const landingJSON = {
        type: 'landing',
        businessName: 'Test Business',
        sections: [],
      };

      const result = applyTemplateToLanding(landingJSON, 'dark');
      
      expect(result).toHaveProperty('template', 'dark');
      expect(result).toHaveProperty('globalStyles');
      expect(result.globalStyles).toHaveProperty('colors');
      expect(result.globalStyles).toHaveProperty('typography');
      expect(result.globalStyles).toHaveProperty('effects');
      expect(result.globalStyles).toHaveProperty('tailwindClasses');
    });

    it('should preserve original landing properties', () => {
      const landingJSON = {
        type: 'landing',
        businessName: 'Test Business',
        sections: [{ id: '1', type: 'hero' }],
      };

      const result = applyTemplateToLanding(landingJSON, 'gradient');
      
      expect(result.type).toBe('landing');
      expect(result.businessName).toBe('Test Business');
      expect(result.sections).toHaveLength(1);
    });

    it('should use dark template as fallback for unknown template ID', () => {
      const landingJSON = { type: 'landing' };
      const result = applyTemplateToLanding(landingJSON, 'unknown');
      
      expect(result.template).toBe('unknown');
      expect((result.globalStyles as any).colors.background).toBe('#0a0a0a');
    });
  });

  describe('generateCSSVariables', () => {
    it('should generate valid CSS variables', () => {
      const css = generateCSSVariables('dark');
      
      expect(css).toContain(':root');
      expect(css).toContain('--color-background');
      expect(css).toContain('--color-text');
      expect(css).toContain('--color-primary');
      expect(css).toContain('--font-heading');
      expect(css).toContain('--font-body');
    });

    it('should include correct color values for dark template', () => {
      const css = generateCSSVariables('dark');
      
      expect(css).toContain('#0a0a0a');
      expect(css).toContain('#fafafa');
      expect(css).toContain('#3b82f6');
    });

    it('should include correct color values for light template', () => {
      const css = generateCSSVariables('light');
      
      expect(css).toContain('#ffffff');
      expect(css).toContain('#0f172a');
      expect(css).toContain('#2563eb');
    });
  });
});
