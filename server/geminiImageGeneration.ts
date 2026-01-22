/**
 * Gemini Image Generation Module
 * Genera imágenes usando Nano Banana (Gemini 2.5 Flash Image)
 * Las imágenes se guardan localmente en el servidor
 */

import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

// Directorio donde se guardarán las imágenes generadas
// En desarrollo usa client/public, en producción usa dist
const isDev = process.env.NODE_ENV === 'development';
const GENERATED_IMAGES_DIR = isDev 
  ? path.join(process.cwd(), 'client', 'public', 'generated-images')
  : path.join(process.cwd(), 'dist', 'generated-images');
const PUBLIC_URL_BASE = '/generated-images';

// Asegurar que el directorio existe
try {
  if (!fs.existsSync(GENERATED_IMAGES_DIR)) {
    fs.mkdirSync(GENERATED_IMAGES_DIR, { recursive: true });
    console.log(`[Gemini] Created images directory: ${GENERATED_IMAGES_DIR}`);
  }
} catch (error) {
  console.error(`[Gemini] Failed to create images directory: ${error}`);
}

interface GenerateImageOptions {
  prompt: string;
  aspectRatio?: '1:1' | '2:3' | '3:2' | '16:9' | '21:9';
  category?: string;
}

interface GeneratedImage {
  url: string;
  localPath: string;
  prompt: string;
}

/**
 * Genera una imagen usando Gemini API (Nano Banana)
 */
export async function generateImageWithGemini(options: GenerateImageOptions): Promise<GeneratedImage | null> {
  const { prompt, aspectRatio = '16:9', category = 'general' } = options;
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('[Gemini] API key not configured');
    return null;
  }
  
  try {
    console.log(`[Gemini] Generating image: "${prompt.substring(0, 50)}..."`);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ 
              text: `Generate a high-quality, professional image for a landing page. 
              Style: Modern, clean, visually appealing.
              Category: ${category}
              Description: ${prompt}
              
              The image should be suitable for a professional website, with good lighting and composition.`
            }]
          }],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
            // Nota: aspectRatio se maneja diferente en la API real
          }
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Gemini] API error: ${response.status} - ${errorText}`);
      return null;
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
          const extension = mimeType.includes('jpeg') ? 'jpg' : 'png';
          
          // Generar nombre único
          const filename = `${category}-${randomUUID()}.${extension}`;
          const localPath = path.join(GENERATED_IMAGES_DIR, filename);
          const publicUrl = `${PUBLIC_URL_BASE}/${filename}`;
          
          // Guardar la imagen
          const buffer = Buffer.from(base64Data, 'base64');
          fs.writeFileSync(localPath, buffer);
          
          console.log(`[Gemini] Image saved: ${publicUrl}`);
          
          return {
            url: publicUrl,
            localPath,
            prompt
          };
        }
      }
    }
    
    console.error('[Gemini] No image found in response');
    return null;
    
  } catch (error) {
    console.error('[Gemini] Error generating image:', error);
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
  const sectionPrompts: Record<string, string> = {
    hero: `A stunning hero banner image for a ${businessType} called "${businessName}". 
           Professional, high-quality, modern design with relevant imagery.`,
    
    gallery: `A beautiful gallery image showcasing ${businessType} services or products. 
              Clean, professional photography style.`,
    
    team: `A professional headshot or team photo suitable for a ${businessType} business. 
           Friendly, approachable, professional appearance.`,
    
    destinations: `An attractive destination or location image for ${businessType}. 
                   Travel-style photography with vibrant colors.`,
    
    features: `An icon or illustration representing a key feature of ${businessType}. 
               Modern, minimalist design style.`,
    
    testimonials: `A professional portrait photo suitable for a customer testimonial. 
                   Friendly, trustworthy appearance.`,
    
    about: `An image representing the story or mission of a ${businessType} business. 
            Inspiring, professional, authentic feel.`
  };
  
  // Generar imágenes para cada sección solicitada
  for (const section of sections) {
    const prompt = sectionPrompts[section.toLowerCase()] || 
                   `A professional image for the ${section} section of a ${businessType} website.`;
    
    const result = await generateImageWithGemini({
      prompt,
      aspectRatio: section === 'hero' ? '16:9' : '1:1',
      category: section
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
  category: string = 'custom'
): Promise<string | null> {
  const result = await generateImageWithGemini({
    prompt,
    aspectRatio: '16:9',
    category
  });
  
  return result?.url || null;
}

/**
 * Limpia imágenes antiguas (más de 7 días)
 */
export function cleanupOldImages(): void {
  try {
    const files = fs.readdirSync(GENERATED_IMAGES_DIR);
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días
    
    for (const file of files) {
      const filePath = path.join(GENERATED_IMAGES_DIR, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`[Gemini] Cleaned up old image: ${file}`);
      }
    }
  } catch (error) {
    console.error('[Gemini] Error cleaning up images:', error);
  }
}
