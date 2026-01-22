import { describe, it, expect, vi, beforeEach } from 'vitest';
import { enrichLandingWithImages, enrichLandingQuick } from './landingImageEnricher';

// Mock the image search module
vi.mock('./imageSearch', () => ({
  searchImages: vi.fn().mockResolvedValue([
    {
      url: 'https://example.com/image1.jpg',
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      alt: 'Test image',
      source: 'unsplash',
      width: 1920,
      height: 1080,
    },
  ]),
}));

// Mock the Gemini image generation
vi.mock('./geminiImageGeneration', () => ({
  generateCustomImage: vi.fn().mockResolvedValue('https://example.com/generated-avatar.jpg'),
}));

describe('Landing Image Enricher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('enrichLandingWithImages', () => {
    it('should enrich hero section with background image', async () => {
      const sections = [
        {
          id: 'hero-1',
          type: 'hero',
          content: {
            title: 'Welcome to Our Business',
            subtitle: 'We provide great services',
          },
        },
      ];

      const result = await enrichLandingWithImages(sections, 'restaurant', 'Test Restaurant');

      expect(result).toHaveLength(1);
      expect(result[0].content.backgroundImage).toBeDefined();
      expect(result[0].content.imageUrl).toBeDefined();
    });

    it('should enrich testimonials section with avatars', { timeout: 30000 }, async () => {
      const sections = [
        {
          id: 'testimonials-1',
          type: 'testimonials',
          content: {
            title: 'What Our Customers Say',
            testimonials: [
              { name: 'John Doe', role: 'CEO', quote: 'Great service!' },
            ],
          },
        },
      ];

      const result = await enrichLandingWithImages(sections, 'technology', 'Tech Corp');

      expect(result).toHaveLength(1);
      const testimonials = result[0].content.testimonials as Array<{ avatar?: string }>;
      expect(testimonials[0].avatar).toBeDefined();
    });

    it('should enrich team section with member photos', { timeout: 30000 }, async () => {
      const sections = [
        {
          id: 'team-1',
          type: 'team',
          content: {
            title: 'Our Team',
            members: [
              { name: 'Alice Johnson', role: 'CEO' },
              { name: 'Bob Smith', position: 'CTO' },
            ],
          },
        },
      ];

      const result = await enrichLandingWithImages(sections, 'startup', 'Startup Inc');

      expect(result).toHaveLength(1);
      const members = result[0].content.members as Array<{ image?: string }>;
      expect(members[0].image).toBeDefined();
      expect(members[1].image).toBeDefined();
    });

    it('should enrich gallery section with images', async () => {
      const sections = [
        {
          id: 'gallery-1',
          type: 'gallery',
          content: {
            title: 'Our Work',
          },
        },
      ];

      const result = await enrichLandingWithImages(sections, 'photography', 'Photo Studio');

      expect(result).toHaveLength(1);
      expect(result[0].content.images).toBeDefined();
      expect(Array.isArray(result[0].content.images)).toBe(true);
    });

    it('should enrich about section with image', async () => {
      const sections = [
        {
          id: 'about-1',
          type: 'about',
          content: {
            title: 'About Us',
            description: 'We are a great company',
          },
        },
      ];

      const result = await enrichLandingWithImages(sections, 'consulting', 'Consult Co');

      expect(result).toHaveLength(1);
      expect(result[0].content.imageUrl).toBeDefined();
    });

    it('should not modify sections that already have images', async () => {
      const existingImageUrl = 'https://existing-image.com/photo.jpg';
      const sections = [
        {
          id: 'hero-1',
          type: 'hero',
          content: {
            title: 'Welcome',
            backgroundImage: existingImageUrl,
          },
        },
      ];

      const result = await enrichLandingWithImages(sections, 'business', 'Business Co');

      expect(result).toHaveLength(1);
      expect(result[0].content.backgroundImage).toBe(existingImageUrl);
    });

    it('should handle multiple section types in one landing', async () => {
      const sections = [
        { id: 'hero-1', type: 'hero', content: { title: 'Welcome' } },
        { id: 'about-1', type: 'about', content: { title: 'About Us' } },
        { id: 'cta-1', type: 'cta', content: { title: 'Contact Us' } },
      ];

      const result = await enrichLandingWithImages(sections, 'agency', 'Creative Agency');

      expect(result).toHaveLength(3);
      // Hero and About should have images
      expect(result[0].content.backgroundImage || result[0].content.imageUrl).toBeDefined();
      expect(result[1].content.imageUrl).toBeDefined();
    });
  });

  describe('enrichLandingQuick', () => {
    it('should only enrich hero section in quick mode', async () => {
      const sections = [
        { id: 'hero-1', type: 'hero', content: { title: 'Welcome' } },
        { id: 'testimonials-1', type: 'testimonials', content: { testimonials: [{ name: 'John' }] } },
      ];

      const result = await enrichLandingQuick(sections, 'business');

      expect(result).toHaveLength(2);
      // Hero should have image
      expect(result[0].content.backgroundImage || result[0].content.imageUrl).toBeDefined();
      // Testimonials should not be enriched in quick mode
      const testimonials = result[1].content.testimonials as Array<{ avatar?: string }>;
      expect(testimonials[0].avatar).toBeUndefined();
    });
  });
});
