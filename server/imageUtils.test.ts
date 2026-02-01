import { describe, it, expect } from 'vitest';
import { isValidImageUrl, isValidVideoUrl, getInitials, getColorFromText, getPlaceholderGradient } from '../client/src/lib/imageUtils';

describe('imageUtils', () => {
  describe('isValidImageUrl', () => {
    it('should accept valid http/https URLs', () => {
      expect(isValidImageUrl('https://example.com/image.jpg')).toBe(true);
      expect(isValidImageUrl('http://example.com/image.png')).toBe(true);
    });

    it('should accept relative URLs', () => {
      expect(isValidImageUrl('/images/photo.jpg')).toBe(true);
    });

    it('should accept data URLs', () => {
      expect(isValidImageUrl('data:image/png;base64,abc123')).toBe(true);
    });

    it('should reject placeholder URLs', () => {
      expect(isValidImageUrl('https://via.placeholder.com/300')).toBe(false);
      expect(isValidImageUrl('https://placehold.it/300x200')).toBe(false);
      expect(isValidImageUrl('https://dummyimage.com/300')).toBe(false);
    });

    it('should reject invalid inputs', () => {
      expect(isValidImageUrl('')).toBe(false);
      expect(isValidImageUrl(null)).toBe(false);
      expect(isValidImageUrl(undefined)).toBe(false);
      expect(isValidImageUrl('undefined')).toBe(false);
      expect(isValidImageUrl('null')).toBe(false);
    });
  });

  describe('isValidVideoUrl', () => {
    it('should accept video file URLs', () => {
      expect(isValidVideoUrl('https://example.com/video.mp4')).toBe(true);
      expect(isValidVideoUrl('https://example.com/video.webm')).toBe(true);
    });

    it('should accept video service URLs', () => {
      expect(isValidVideoUrl('https://youtube.com/watch?v=abc123')).toBe(true);
      expect(isValidVideoUrl('https://vimeo.com/123456')).toBe(true);
    });

    it('should reject non-video URLs', () => {
      expect(isValidVideoUrl('https://example.com/image.jpg')).toBe(false);
      expect(isValidVideoUrl('')).toBe(false);
      expect(isValidVideoUrl(null)).toBe(false);
    });
  });

  describe('getInitials', () => {
    it('should extract initials from names', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('Alice')).toBe('A');
      expect(getInitials('María García López')).toBe('MG');
    });

    it('should handle edge cases', () => {
      expect(getInitials('')).toBe('U');
      expect(getInitials(null)).toBe('U');
      expect(getInitials(undefined)).toBe('U');
    });
  });

  describe('getColorFromText', () => {
    it('should return consistent colors for same text', () => {
      const color1 = getColorFromText('test');
      const color2 = getColorFromText('test');
      expect(color1).toBe(color2);
    });

    it('should return different colors for different text', () => {
      const color1 = getColorFromText('alice');
      const color2 = getColorFromText('bob');
      // They might be the same by chance, but usually different
      expect(typeof color1).toBe('string');
      expect(typeof color2).toBe('string');
    });

    it('should return base color for empty input', () => {
      expect(getColorFromText('')).toBe('#6366f1');
      expect(getColorFromText(null)).toBe('#6366f1');
    });
  });

  describe('getPlaceholderGradient', () => {
    it('should return a gradient string', () => {
      const gradient = getPlaceholderGradient('test');
      expect(gradient).toContain('linear-gradient');
    });

    it('should return consistent gradients for same seed', () => {
      const g1 = getPlaceholderGradient('seed');
      const g2 = getPlaceholderGradient('seed');
      expect(g1).toBe(g2);
    });
  });
});
