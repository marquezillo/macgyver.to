/**
 * Gemini Image Generation Module
 * Genera imágenes usando Gemini 2.0 Flash (imagen-3.0-generate-002)
 * Las imágenes se guardan localmente en el servidor
 */

import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// Directorio donde se guardarán las imágenes generadas
const isDev = process.env.NODE_ENV === 'development';
const GENERATED_IMAGES_DIR = isDev 
  ? path.join(process.cwd(), 'client', 'public', 'generated-images')
  : path.join(process.cwd(), 'dist', 'generated-images');
const PUBLIC_URL_BASE = '/generated-images';

// Asegurar que el directorio existe
try {
  if (!fs.existsSync(GENERATED_IMAGES_DIR)) {
    fs.mkdirSync(GENERATED_IMAGES_DIR, { recursive: true });
    console.log(`[GeminiImage] Created images directory: ${GENERATED_IMAGES_DIR}`);
  }
} catch (error) {
  console.error(`[GeminiImage] Failed to create images directory: ${error}`);
}

interface GenerateImageOptions {
  prompt: string;
  aspectRatio?: '1:1' | '2:3' | '3:2' | '16:9' | '21:9' | '9:16' | '3:4' | '4:3';
  category?: string;
  style?: 'photorealistic' | 'artistic' | 'illustration' | 'minimal';
}

interface GeneratedImage {
  url: string;
  localPath: string;
  prompt: string;
  source: 'gemini';
}

/**
 * Genera una imagen usando Gemini API (Imagen 3)
 * Usa el endpoint correcto para generación de imágenes
 */
export async function generateImageWithGemini(options: GenerateImageOptions): Promise<GeneratedImage | null> {
  const { prompt, aspectRatio = '16:9', category = 'general', style = 'photorealistic' } = options;
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('[GeminiImage] GEMINI_API_KEY not configured');
    return null;
  }
  
  try {
    console.log(`[GeminiImage] Generating image with prompt: "${prompt.substring(0, 80)}..."`);
    
    // Construir prompt mejorado según el estilo
    const styleInstructions = {
      photorealistic: 'Ultra-realistic photography, professional lighting, high resolution, 8K quality',
      artistic: 'Artistic interpretation, creative composition, vibrant colors, expressive style',
      illustration: 'Digital illustration, clean lines, modern design, vector-like quality',
      minimal: 'Minimalist design, clean background, simple composition, elegant'
    };
    
    const enhancedPrompt = `${prompt}. 
Style: ${styleInstructions[style]}.
Purpose: Professional landing page image.
Quality: High resolution, web-optimized.
Aspect ratio: ${aspectRatio}.
No text, watermarks, or logos in the image.`;

    // Usar Gemini 2.0 Flash con capacidad de generación de imágenes
    // Endpoint: gemini-2.0-flash-exp con responseModalities IMAGE
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ 
              text: `Generate an image: ${enhancedPrompt}`
            }]
          }],
          generationConfig: {
            responseModalities: ['IMAGE', 'TEXT'],
            responseMimeType: 'image/png'
          }
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[GeminiImage] API error ${response.status}: ${errorText.substring(0, 200)}`);
      
      // Intentar con modelo alternativo si el primero falla
      return await tryAlternativeModel(enhancedPrompt, aspectRatio, category);
    }
    
    const data = await response.json();
    
    // Buscar la parte que contiene la imagen
    const candidates = data.candidates || [];
    for (const candidate of candidates) {
      const parts = candidate.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          // Tenemos una imagen en base64
          const base64Data = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          const extension = mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : 'png';
          
          // Generar nombre único
          const filename = `${category}-${randomUUID()}.${extension}`;
          const localPath = path.join(GENERATED_IMAGES_DIR, filename);
          const publicUrl = `${PUBLIC_URL_BASE}/${filename}`;
          
          // Guardar la imagen
          const buffer = Buffer.from(base64Data, 'base64');
          fs.writeFileSync(localPath, buffer);
          
          console.log(`[GeminiImage] ✓ Image saved: ${publicUrl} (${buffer.length} bytes)`);
          
          return {
            url: publicUrl,
            localPath,
            prompt,
            source: 'gemini'
          };
        }
      }
    }
    
    console.warn('[GeminiImage] No image in response, trying alternative model...');
    return await tryAlternativeModel(enhancedPrompt, aspectRatio, category);
    
  } catch (error) {
    console.error('[GeminiImage] Error generating image:', error);
    return null;
  }
}

/**
 * Intenta generar imagen con modelo alternativo (Imagen 3)
 */
async function tryAlternativeModel(
  prompt: string, 
  aspectRatio: string, 
  category: string
): Promise<GeneratedImage | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  
  try {
    console.log('[GeminiImage] Trying Imagen 3 model...');
    
    // Usar Imagen 3 directamente
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{
            prompt: prompt
          }],
          parameters: {
            sampleCount: 1,
            aspectRatio: aspectRatio,
            safetyFilterLevel: 'block_only_high',
            personGeneration: 'allow_adult'
          }
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[GeminiImage] Imagen 3 error ${response.status}: ${errorText.substring(0, 200)}`);
      return null;
    }
    
    const data = await response.json();
    const predictions = data.predictions || [];
    
    if (predictions.length > 0 && predictions[0].bytesBase64Encoded) {
      const base64Data = predictions[0].bytesBase64Encoded;
      const filename = `${category}-${randomUUID()}.png`;
      const localPath = path.join(GENERATED_IMAGES_DIR, filename);
      const publicUrl = `${PUBLIC_URL_BASE}/${filename}`;
      
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(localPath, buffer);
      
      console.log(`[GeminiImage] ✓ Imagen 3 saved: ${publicUrl}`);
      
      return {
        url: publicUrl,
        localPath,
        prompt,
        source: 'gemini'
      };
    }
    
    return null;
  } catch (error) {
    console.error('[GeminiImage] Imagen 3 error:', error);
    return null;
  }
}

/**
 * Genera múltiples imágenes para una landing page
 */
export async function generateLandingImages(
  businessType: string,
  businessName: string,
  sections: string[]
): Promise<Record<string, string>> {
  const images: Record<string, string> = {};
  
  // Definir prompts específicos por tipo de sección
  const sectionPrompts: Record<string, { prompt: string; style: GenerateImageOptions['style'] }> = {
    hero: {
      prompt: `A stunning hero banner for a ${businessType} business called "${businessName}". 
               Professional, high-quality, modern design with relevant imagery that captures the essence of the business.`,
      style: 'photorealistic'
    },
    
    gallery: {
      prompt: `A beautiful gallery image showcasing ${businessType} services or products. 
              Clean, professional photography with excellent lighting and composition.`,
      style: 'photorealistic'
    },
    
    team: {
      prompt: `A professional team photo or workspace image for a ${businessType} business. 
               Modern office environment, collaborative atmosphere, professional appearance.`,
      style: 'photorealistic'
    },
    
    features: {
      prompt: `A modern illustration representing key features of ${businessType}. 
               Clean, minimalist design with subtle gradients and professional colors.`,
      style: 'illustration'
    },
    
    testimonials: {
      prompt: `A professional portrait photo suitable for a customer testimonial. 
               Friendly, trustworthy appearance, natural lighting, clean background.`,
      style: 'photorealistic'
    },
    
    about: {
      prompt: `An inspiring image representing the story and mission of a ${businessType} business. 
              Professional, authentic feel that builds trust and connection.`,
      style: 'photorealistic'
    },
    
    process: {
      prompt: `A visual representation of a professional workflow or process for ${businessType}. 
               Modern, organized, step-by-step visual with clean design.`,
      style: 'illustration'
    },
    
    stats: {
      prompt: `An abstract visualization representing growth, success and data for ${businessType}. 
               Modern geometric shapes, professional colors, clean composition.`,
      style: 'minimal'
    }
  };
  
  // Generar imágenes para cada sección solicitada
  for (const section of sections) {
    const config = sectionPrompts[section.toLowerCase()] || {
      prompt: `A professional image for the ${section} section of a ${businessType} website.`,
      style: 'photorealistic' as const
    };
    
    const result = await generateImageWithGemini({
      prompt: config.prompt,
      aspectRatio: section === 'hero' ? '16:9' : '1:1',
      category: section,
      style: config.style
    });
    
    if (result) {
      images[section] = result.url;
    }
  }
  
  return images;
}

/**
 * Genera una imagen específica con prompt personalizado
 */
export async function generateCustomImage(
  prompt: string,
  category: string = 'custom',
  aspectRatio: GenerateImageOptions['aspectRatio'] = '16:9'
): Promise<string | null> {
  const result = await generateImageWithGemini({
    prompt,
    aspectRatio,
    category,
    style: 'photorealistic'
  });
  
  return result?.url || null;
}

/**
 * Limpia imágenes antiguas (más de 7 días)
 */
export function cleanupOldImages(): void {
  try {
    if (!fs.existsSync(GENERATED_IMAGES_DIR)) return;
    
    const files = fs.readdirSync(GENERATED_IMAGES_DIR);
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días
    let cleaned = 0;
    
    for (const file of files) {
      const filePath = path.join(GENERATED_IMAGES_DIR, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`[GeminiImage] Cleaned up ${cleaned} old images`);
    }
  } catch (error) {
    console.error('[GeminiImage] Error cleaning up images:', error);
  }
}
