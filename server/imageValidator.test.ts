import { describe, it, expect } from 'vitest';
import {
  validateImageUrlSync,
  validateImageUrlAsync,
  getFallbackGradient,
  validateLandingImages,
  clearValidationCache,
} from './imageValidator';
import { getAvatarStats, generateAvatarsForTestimonials, getMultipleAvatars } from './avatarService';

describe('Image Validator', () => {
  describe('validateImageUrlSync', () => {
    it('should reject empty URLs', () => {
      const result = validateImageUrlSync('');
      expect(result.valid).toBe(false);
      expect(result.fallback).toBeDefined();
    });

    it('should reject null/undefined string values', () => {
      expect(validateImageUrlSync('undefined').valid).toBe(false);
      expect(validateImageUrlSync('null').valid).toBe(false);
    });

    it('should accept valid Unsplash URLs', () => {
      const result = validateImageUrlSync('https://images.unsplash.com/photo-123?w=150');
      expect(result.valid).toBe(true);
    });

    it('should accept valid Pexels URLs', () => {
      const result = validateImageUrlSync('https://images.pexels.com/photos/123/image.jpg');
      expect(result.valid).toBe(true);
    });

    it('should reject placeholder URLs', () => {
      expect(validateImageUrlSync('https://via.placeholder.com/150').valid).toBe(false);
      expect(validateImageUrlSync('https://placehold.co/300x200').valid).toBe(false);
      expect(validateImageUrlSync('https://dummyimage.com/600x400').valid).toBe(false);
    });

    it('should accept relative URLs', () => {
      const result = validateImageUrlSync('/images/logo.png');
      expect(result.valid).toBe(true);
    });

    it('should accept data URLs', () => {
      const result = validateImageUrlSync('data:image/png;base64,iVBORw0KGgo=');
      expect(result.valid).toBe(true);
    });

    it('should reject URLs without protocol', () => {
      const result = validateImageUrlSync('example.com/image.jpg');
      expect(result.valid).toBe(false);
    });
  });

  describe('getFallbackGradient', () => {
    it('should return a gradient string', () => {
      const gradient = getFallbackGradient(0);
      expect(gradient).toContain('linear-gradient');
    });

    it('should return different gradients for different seeds', () => {
      const gradient1 = getFallbackGradient(0);
      const gradient2 = getFallbackGradient(1);
      expect(gradient1).not.toBe(gradient2);
    });

    it('should accept string seeds', () => {
      const gradient = getFallbackGradient('test-string');
      expect(gradient).toContain('linear-gradient');
    });
  });

  describe('validateLandingImages', () => {
    it('should validate backgroundImage in sections', () => {
      const landing = {
        sections: [
          {
            type: 'hero',
            content: {
              title: 'Test',
              backgroundImage: 'https://via.placeholder.com/1200x600',
            },
          },
        ],
      };

      const result = validateLandingImages(landing);
      expect(result.sections[0].content.backgroundImage).toContain('linear-gradient');
    });

    it('should keep valid Unsplash images', () => {
      const validUrl = 'https://images.unsplash.com/photo-123?w=1200';
      const landing = {
        sections: [
          {
            type: 'hero',
            content: {
              title: 'Test',
              backgroundImage: validUrl,
            },
          },
        ],
      };

      const result = validateLandingImages(landing);
      expect(result.sections[0].content.backgroundImage).toBe(validUrl);
    });

    it('should validate items array with images', () => {
      const landing = {
        sections: [
          {
            type: 'testimonials',
            content: {
              items: [
                { name: 'John', image: 'https://via.placeholder.com/150' },
                { name: 'Jane', image: 'https://images.unsplash.com/photo-456?w=150' },
              ],
            },
          },
        ],
      };

      const result = validateLandingImages(landing);
      const items = result.sections[0].content.items as Array<{ image: string }>;
      
      expect(items[0].image).toContain('linear-gradient');
      expect(items[1].image).toContain('unsplash.com');
    });

    it('should validate gallery images array', () => {
      const landing = {
        sections: [
          {
            type: 'gallery',
            content: {
              images: [
                { url: 'https://via.placeholder.com/300' },
                { url: 'https://images.pexels.com/photos/123.jpg' },
              ],
            },
          },
        ],
      };

      const result = validateLandingImages(landing);
      const images = result.sections[0].content.images as Array<{ url: string }>;
      
      expect(images[0].url).toContain('linear-gradient');
      expect(images[1].url).toContain('pexels.com');
    });
  });
});

describe('Avatar Service - Expanded Collection', () => {
  it('should have 35+ male avatars', () => {
    const stats = getAvatarStats();
    expect(stats.male).toBeGreaterThanOrEqual(35);
  });

  it('should have 35+ female avatars', () => {
    const stats = getAvatarStats();
    expect(stats.female).toBeGreaterThanOrEqual(35);
  });

  it('should have 75+ total avatars', () => {
    const stats = getAvatarStats();
    expect(stats.total).toBeGreaterThanOrEqual(75);
  });

  it('should generate unique avatars for multiple testimonials', () => {
    const testimonials = [
      { name: 'María García' },
      { name: 'Carlos López' },
      { name: 'Ana Martínez' },
      { name: 'Juan Rodríguez' },
      { name: 'Laura Sánchez' },
    ];

    const enriched = generateAvatarsForTestimonials(testimonials);
    const avatarUrls = enriched.map(t => t.image);
    const uniqueUrls = new Set(avatarUrls);

    // All avatars should be unique
    expect(uniqueUrls.size).toBe(avatarUrls.length);
  });

  it('should return mixed gender avatars when requested', () => {
    const avatars = getMultipleAvatars(10, 'mixed');
    expect(avatars.length).toBe(10);
    
    // Should have variety (not all the same)
    const uniqueAvatars = new Set(avatars);
    expect(uniqueAvatars.size).toBeGreaterThan(1);
  });

  it('should return all male avatars when requested', () => {
    const avatars = getMultipleAvatars(5, 'male');
    expect(avatars.length).toBe(5);
    // All should be Unsplash URLs
    avatars.forEach(url => {
      expect(url).toContain('unsplash.com');
    });
  });

  it('should return all female avatars when requested', () => {
    const avatars = getMultipleAvatars(5, 'female');
    expect(avatars.length).toBe(5);
    // All should be Unsplash URLs
    avatars.forEach(url => {
      expect(url).toContain('unsplash.com');
    });
  });
});
