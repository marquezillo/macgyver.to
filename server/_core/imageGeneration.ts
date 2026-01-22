/**
 * Image generation helper using OpenAI DALL-E 3
 *
 * Example usage:
 *   const { url: imageUrl } = await generateImage({
 *     prompt: "A serene landscape with mountains"
 *   });
 *
 * For editing (uses GPT-4o Vision to describe, then regenerates):
 *   const { url: imageUrl } = await generateImage({
 *     prompt: "Add a rainbow to this landscape",
 *     originalImages: [{
 *       url: "https://example.com/original.jpg",
 *       mimeType: "image/jpeg"
 *     }]
 *   });
 */
import { localStoragePut } from "server/localStorage";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY_CUSTOM;

export type GenerateImageOptions = {
  prompt: string;
  originalImages?: Array<{
    url?: string;
    b64Json?: string;
    mimeType?: string;
  }>;
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
};

export type GenerateImageResponse = {
  url?: string;
};

export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResponse> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY_CUSTOM is not configured");
  }

  console.log(`[ImageGen] Starting image generation with prompt: ${options.prompt.substring(0, 50)}...`);

  let finalPrompt = options.prompt;

  // If there are original images, use GPT-4o Vision to understand them first
  if (options.originalImages && options.originalImages.length > 0) {
    const imageUrl = options.originalImages[0].url || 
      (options.originalImages[0].b64Json 
        ? `data:${options.originalImages[0].mimeType || 'image/png'};base64,${options.originalImages[0].b64Json}`
        : null);

    if (imageUrl) {
      // Use GPT-4o to analyze the image and create a better prompt
      const visionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          max_tokens: 500,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Describe this image in detail for image generation. Then incorporate this modification request: "${options.prompt}". Output only the final prompt for DALL-E, nothing else.`,
                },
                {
                  type: "image_url",
                  image_url: { url: imageUrl },
                },
              ],
            },
          ],
        }),
      });

      if (visionResponse.ok) {
        const visionData = await visionResponse.json();
        finalPrompt = visionData.choices?.[0]?.message?.content || options.prompt;
      }
    }
  }

  console.log(`[ImageGen] Calling DALL-E 3 API...`);

  // Generate image with DALL-E 3
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: finalPrompt,
      n: 1,
      size: options.size || "1024x1024",
      quality: options.quality || "standard",
      style: options.style || "vivid",
      response_format: "b64_json",
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error(`[ImageGen] DALL-E API error: ${response.status} ${response.statusText} - ${detail}`);
    throw new Error(
      `DALL-E image generation failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
    );
  }

  const result = await response.json() as {
    data: Array<{ b64_json: string; revised_prompt?: string }>;
  };

  console.log(`[ImageGen] DALL-E response received, saving image...`);

  const base64Data = result.data[0].b64_json;
  const buffer = Buffer.from(base64Data, "base64");

  // Save to local storage
  const { url } = await localStoragePut(
    `generated/${Date.now()}.png`,
    buffer,
    "image/png"
  );

  console.log(`[ImageGen] Image saved successfully: ${url}`);

  return { url };
}

// Generate image with specific provider (for flexibility)
export async function generateImageWithProvider(
  options: GenerateImageOptions & { provider?: "openai" | "manus" }
): Promise<GenerateImageResponse> {
  // Currently only OpenAI is supported
  return generateImage(options);
}
