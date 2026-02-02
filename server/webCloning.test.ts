/**
 * Tests for Web Cloning System
 * Tests structure extraction, asset downloading, color extraction, and cloning levels
 */

import { describe, it, expect } from 'vitest';
import { extractStructure, type ExtractedSection } from './structureExtractor';
import { detectCloningLevel, getCloningConfig, getCloningLevelSummary, generateCloningInstructions } from './cloningLevels';
import { createAssetUrlMap, replaceAssetUrls } from './assetDownloader';
import { hexToHsl, generateColorVariants, hasGoodContrast } from './colorExtractor';

// Sample HTML for testing structure extraction
const sampleHTML = `
<!DOCTYPE html>
<html>
<head><title>Test Landing</title></head>
<body>
  <header>
    <nav>
      <img src="/logo.png" alt="Logo" class="logo">
      <a href="#features">Features</a>
      <a href="#pricing">Pricing</a>
      <a href="#contact">Contact</a>
      <button class="btn-primary">Get Started</button>
    </nav>
  </header>
  
  <section class="hero">
    <h1>Welcome to Our Platform</h1>
    <p>The best solution for your business needs</p>
    <a href="#signup" class="btn-primary">Start Free Trial</a>
    <a href="#demo" class="btn-secondary">Watch Demo</a>
    <img src="/hero-image.jpg" alt="Hero">
  </section>
  
  <section class="features" id="features">
    <h2>Our Features</h2>
    <div class="card">
      <h3>Fast Performance</h3>
      <p>Lightning fast load times for your users</p>
    </div>
    <div class="card">
      <h3>Secure</h3>
      <p>Enterprise-grade security built in</p>
    </div>
    <div class="card">
      <h3>Scalable</h3>
      <p>Grows with your business needs</p>
    </div>
  </section>
  
  <section class="testimonials">
    <h2>What Our Customers Say</h2>
    <blockquote class="testimonial">
      <p>"This product changed our business completely!"</p>
      <cite class="name">John Doe</cite>
      <span class="role">CEO, TechCorp</span>
    </blockquote>
  </section>
  
  <section class="pricing" id="pricing">
    <h2>Pricing Plans</h2>
    <div class="pricing-card">
      <h3 class="name">Starter</h3>
      <span class="price">$9/month</span>
      <ul>
        <li>5 Users</li>
        <li>10GB Storage</li>
      </ul>
    </div>
  </section>
  
  <section class="faq">
    <h2>Frequently Asked Questions</h2>
    <details>
      <summary class="question">How do I get started?</summary>
      <p class="answer">Simply sign up and follow our onboarding guide.</p>
    </details>
  </section>
  
  <footer>
    <img src="/footer-logo.png" alt="Logo">
    <p>© 2024 TestCompany. All rights reserved.</p>
    <a href="https://facebook.com/test">Facebook</a>
    <a href="https://twitter.com/test">Twitter</a>
  </footer>
</body>
</html>
`;

describe('Structure Extractor', () => {
  it('should extract header with logo and navigation', () => {
    const sections = extractStructure(sampleHTML);
    const header = sections.find(s => s.type === 'header');
    
    expect(header).toBeDefined();
    expect(header?.content.logo).toContain('logo.png');
    expect(header?.content.navigation?.length).toBeGreaterThan(0);
  });

  it('should extract hero section with title and CTAs', () => {
    const sections = extractStructure(sampleHTML);
    const hero = sections.find(s => s.type === 'hero');
    
    expect(hero).toBeDefined();
    expect(hero?.content.title).toContain('Welcome');
    expect(hero?.content.ctas?.length).toBeGreaterThan(0);
  });

  it('should extract features section with items', () => {
    const sections = extractStructure(sampleHTML);
    const features = sections.find(s => s.type === 'features');
    
    expect(features).toBeDefined();
    expect(features?.content.items?.length).toBe(3);
    expect(features?.content.items?.[0].title).toBe('Fast Performance');
  });

  it('should extract testimonials', () => {
    const sections = extractStructure(sampleHTML);
    const testimonials = sections.find(s => s.type === 'testimonials');
    
    expect(testimonials).toBeDefined();
    expect(testimonials?.content.testimonials?.length).toBeGreaterThan(0);
  });

  it('should extract footer with social links', () => {
    const sections = extractStructure(sampleHTML);
    const footer = sections.find(s => s.type === 'footer');
    
    expect(footer).toBeDefined();
    expect(footer?.content.socialLinks?.length).toBeGreaterThan(0);
  });

  it('should maintain correct section order', () => {
    const sections = extractStructure(sampleHTML);
    const types = sections.map(s => s.type);
    
    // Header should be first
    expect(types[0]).toBe('header');
    // Footer should be last
    expect(types[types.length - 1]).toBe('footer');
  });
});

describe('Cloning Level Detection', () => {
  it('should detect inspiration level by default', () => {
    const level = detectCloningLevel('Crea una landing para mi restaurante');
    expect(level).toBe('inspiration');
  });

  it('should detect replica level with similar keywords', () => {
    const cases = [
      'Hazme una web similar a esta',
      'Quiero una réplica de este sitio',
      'Clona esta página para mi negocio',
      'Crea algo parecido a esta web',
    ];
    
    cases.forEach(msg => {
      const level = detectCloningLevel(msg);
      expect(level).toBe('replica');
    });
  });

  it('should detect exact level with exact keywords', () => {
    const cases = [
      'Quiero una copia exacta de esta web',
      'Hazme una réplica idéntica',
      'Copia 100% este diseño',
      'Clone exactly this website',
    ];
    
    cases.forEach(msg => {
      const level = detectCloningLevel(msg);
      expect(level).toBe('exact');
    });
  });
});

describe('Cloning Configuration', () => {
  it('should return correct config for inspiration level', () => {
    const config = getCloningConfig('inspiration');
    
    expect(config.copyColors).toBe(true);
    expect(config.copyTypography).toBe(true);
    expect(config.copyStructure).toBe(true);
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

  it('should allow custom options override', () => {
    const config = getCloningConfig('inspiration', {
      businessName: 'TestBusiness',
      copyImages: true,
    });
    
    expect(config.businessName).toBe('TestBusiness');
    expect(config.copyImages).toBe(true);
  });
});

describe('Cloning Level Summary', () => {
  it('should return correct summary for each level', () => {
    const levels = ['inspiration', 'replica', 'exact'] as const;
    
    levels.forEach(level => {
      const summary = getCloningLevelSummary(level);
      
      expect(summary.emoji).toBeDefined();
      expect(summary.name).toBeDefined();
      expect(summary.description).toBeDefined();
      expect(summary.whatsCopied.length).toBeGreaterThan(0);
      expect(summary.whatsNew.length).toBeGreaterThan(0);
    });
  });
});

describe('Asset URL Mapping', () => {
  it('should create URL map from assets', () => {
    const assets = [
      { originalUrl: 'https://example.com/logo.png', storedUrl: 'https://s3.com/logo.png', type: 'logo' as const, filename: 'logo.png', mimeType: 'image/png', size: 1000 },
      { originalUrl: 'https://example.com/hero.jpg', storedUrl: 'https://s3.com/hero.jpg', type: 'image' as const, filename: 'hero.jpg', mimeType: 'image/jpeg', size: 5000 },
    ];
    
    const map = createAssetUrlMap(assets);
    
    expect(map.get('https://example.com/logo.png')).toBe('https://s3.com/logo.png');
    expect(map.get('https://example.com/hero.jpg')).toBe('https://s3.com/hero.jpg');
  });

  it('should replace URLs in content', () => {
    const content = '<img src="https://example.com/logo.png"> <img src="https://example.com/hero.jpg">';
    const map = new Map([
      ['https://example.com/logo.png', 'https://s3.com/logo.png'],
      ['https://example.com/hero.jpg', 'https://s3.com/hero.jpg'],
    ]);
    
    const result = replaceAssetUrls(content, map);
    
    expect(result).toContain('https://s3.com/logo.png');
    expect(result).toContain('https://s3.com/hero.jpg');
    expect(result).not.toContain('https://example.com');
  });
});

describe('Color Utilities', () => {
  it('should convert hex to HSL correctly', () => {
    // Red
    const red = hexToHsl('#ff0000');
    expect(red.h).toBe(0);
    expect(red.s).toBe(100);
    expect(red.l).toBe(50);
    
    // Blue
    const blue = hexToHsl('#0000ff');
    expect(blue.h).toBe(240);
    expect(blue.s).toBe(100);
    expect(blue.l).toBe(50);
    
    // White
    const white = hexToHsl('#ffffff');
    expect(white.l).toBe(100);
    
    // Black
    const black = hexToHsl('#000000');
    expect(black.l).toBe(0);
  });

  it('should generate color variants', () => {
    const variants = generateColorVariants('#3b82f6');
    
    expect(variants.base).toBe('#3b82f6');
    expect(variants.lighter).toBeDefined();
    expect(variants.light).toBeDefined();
    expect(variants.dark).toBeDefined();
    expect(variants.darker).toBeDefined();
    
    // Lighter should have higher luminance
    const baseLum = hexToHsl(variants.base).l;
    const lighterLum = hexToHsl(variants.lighter).l;
    expect(lighterLum).toBeGreaterThan(baseLum);
  });

  it('should detect good contrast', () => {
    // Black on white - good contrast
    expect(hasGoodContrast('#000000', '#ffffff')).toBe(true);
    
    // White on black - good contrast
    expect(hasGoodContrast('#ffffff', '#000000')).toBe(true);
    
    // Light gray on white - poor contrast
    expect(hasGoodContrast('#cccccc', '#ffffff')).toBe(false);
  });
});

describe('Cloning Instructions Generation', () => {
  const mockExtractedData = {
    url: 'https://example.com',
    title: 'Example Site',
    description: 'A test website',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#f59e0b',
      background: '#ffffff',
      text: '#1f2937',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    content: {
      heroTitle: 'Welcome to Example',
      heroSubtitle: 'The best platform',
      features: [
        { title: 'Feature 1', description: 'Description 1' },
        { title: 'Feature 2', description: 'Description 2' },
      ],
      testimonials: [],
      services: [],
      faq: [],
    },
    images: [
      { src: 'https://example.com/hero.jpg', alt: 'Hero', type: 'hero' as const },
    ],
    industry: {
      detected: true,
      patternId: 'saas',
      patternName: 'SaaS',
      confidence: 'high' as const,
    },
    style: {
      darkMode: false,
      hasGradients: false,
      borderRadius: '8px',
    },
    language: {
      detected: 'en',
      confidence: 0.95,
    },
  };

  it('should generate instructions for inspiration level', () => {
    const config = getCloningConfig('inspiration');
    const instructions = generateCloningInstructions('inspiration', mockExtractedData, config);
    
    expect(instructions).toContain('INSPIRACIÓN');
    expect(instructions).toContain('#3b82f6');
    expect(instructions).toContain('GENERA contenido nuevo');
    expect(instructions).not.toContain('COPIAR EXACTAMENTE');
  });

  it('should generate instructions for replica level', () => {
    const config = getCloningConfig('replica');
    const instructions = generateCloningInstructions('replica', mockExtractedData, config);
    
    expect(instructions).toContain('RÉPLICA VISUAL');
    expect(instructions).toContain('#3b82f6');
    expect(instructions).toContain('Adapta el contenido');
  });

  it('should generate instructions for exact level', () => {
    const config = getCloningConfig('exact');
    const instructions = generateCloningInstructions('exact', mockExtractedData, config);
    
    expect(instructions).toContain('COPIA EXACTA');
    expect(instructions).toContain('#3b82f6');
    expect(instructions).toContain('COPIAR EXACTAMENTE');
    expect(instructions).toContain('Welcome to Example');
  });

  it('should include language instructions', () => {
    const config = getCloningConfig('replica');
    const instructions = generateCloningInstructions('replica', mockExtractedData, config);
    
    expect(instructions).toContain('Inglés');
    expect(instructions).toContain('IDIOMA');
  });
});
