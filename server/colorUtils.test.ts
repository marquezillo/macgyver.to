import { describe, it, expect } from 'vitest';
import { parseColor, isLightColor, getContrastColors } from '../client/src/lib/colorUtils';

describe('colorUtils', () => {
  describe('parseColor', () => {
    it('should parse hex colors', () => {
      expect(parseColor('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(parseColor('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(parseColor('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('should parse short hex colors', () => {
      expect(parseColor('#f00')).toEqual({ r: 255, g: 0, b: 0 });
      expect(parseColor('#0f0')).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should parse rgb colors', () => {
      expect(parseColor('rgb(255, 0, 0)')).toEqual({ r: 255, g: 0, b: 0 });
      expect(parseColor('rgb(0,255,0)')).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('should parse rgba colors', () => {
      expect(parseColor('rgba(255, 0, 0, 0.5)')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should return null for invalid colors', () => {
      expect(parseColor('')).toBeNull();
      expect(parseColor('invalid')).toBeNull();
      expect(parseColor(undefined as any)).toBeNull();
    });
  });

  describe('isLightColor', () => {
    it('should detect light colors', () => {
      expect(isLightColor('#ffffff')).toBe(true);
      expect(isLightColor('#f0f0f0')).toBe(true);
      expect(isLightColor('#ffff00')).toBe(true); // Yellow is light
    });

    it('should detect dark colors', () => {
      expect(isLightColor('#000000')).toBe(false);
      expect(isLightColor('#1a1a1a')).toBe(false);
      expect(isLightColor('#0000ff')).toBe(false); // Blue is dark
    });

    it('should handle undefined/empty', () => {
      expect(isLightColor(undefined)).toBe(true); // Default to light
      expect(isLightColor('')).toBe(true);
    });

    it('should handle named colors', () => {
      expect(isLightColor('white')).toBe(true);
      expect(isLightColor('black')).toBe(false);
    });
  });

  describe('getContrastColors', () => {
    it('should return light text for dark backgrounds', () => {
      const result = getContrastColors('#000000');
      expect(result.textColor).toBe('#ffffff');
    });

    it('should return dark text for light backgrounds', () => {
      const result = getContrastColors('#ffffff');
      expect(result.textColor).toBe('#111827');
    });

    it('should return light text when hasImage is true', () => {
      const result = getContrastColors('#ffffff', true);
      expect(result.textColor).toBe('#ffffff');
    });
  });

  // hexToRgb and rgbToHex not implemented in current colorUtils
});
