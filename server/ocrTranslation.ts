import { invokeLLM, invokeLLMStream, type Message } from "./_core/llm";

export interface OcrResult {
  text: string;
  language: string;
  confidence: 'high' | 'medium' | 'low';
  structuredData?: Record<string, string>;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

// Language names for display
const languageNames: Record<string, string> = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
  ru: 'Русский',
};

// Extract text from image using LLM vision capabilities
export async function extractTextFromImage(imageBase64: string, mimeType: string): Promise<OcrResult> {
  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an OCR specialist. Extract ALL text visible in the image.
Return a JSON object with:
- text: The complete extracted text, preserving structure and formatting
- language: The primary language detected (ISO 639-1 code, e.g., "es", "en")
- confidence: Your confidence level ("high", "medium", "low")
- structuredData: If the image contains structured data (forms, tables, receipts), extract key-value pairs

Be thorough and extract every piece of text visible.`,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
            },
          },
          {
            type: "text",
            text: "Extract all text from this image.",
          },
        ],
      },
    ],
    responseFormat: {
      type: "json_schema",
      json_schema: {
        name: "ocr_result",
        strict: true,
        schema: {
          type: "object",
          properties: {
            text: { type: "string" },
            language: { type: "string" },
            confidence: { type: "string", enum: ["high", "medium", "low"] },
            structuredData: { 
              type: "object",
              additionalProperties: { type: "string" }
            },
          },
          required: ["text", "language", "confidence", "structuredData"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = result.choices[0]?.message?.content;
    const parsed = JSON.parse(typeof content === "string" ? content : "{}");
    
    return {
      text: parsed.text || '',
      language: parsed.language || 'unknown',
      confidence: parsed.confidence || 'low',
      structuredData: parsed.structuredData || undefined,
    };
  } catch {
    return {
      text: '',
      language: 'unknown',
      confidence: 'low',
    };
  }
}

// Detect language of text
export async function detectLanguage(text: string): Promise<{ language: string; languageName: string; confidence: number }> {
  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Detect the language of the provided text.
Return a JSON object with:
- language: ISO 639-1 language code (e.g., "es", "en", "fr")
- confidence: A number between 0 and 1 indicating confidence`,
      },
      {
        role: "user",
        content: text.slice(0, 1000), // Limit text for detection
      },
    ],
    responseFormat: {
      type: "json_schema",
      json_schema: {
        name: "language_detection",
        strict: true,
        schema: {
          type: "object",
          properties: {
            language: { type: "string" },
            confidence: { type: "number" },
          },
          required: ["language", "confidence"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = result.choices[0]?.message?.content;
    const parsed = JSON.parse(typeof content === "string" ? content : "{}");
    const lang = parsed.language || 'unknown';
    
    return {
      language: lang,
      languageName: languageNames[lang] || lang,
      confidence: parsed.confidence || 0,
    };
  } catch {
    return {
      language: 'unknown',
      languageName: 'Desconocido',
      confidence: 0,
    };
  }
}

// Translate text to target language
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<TranslationResult> {
  const detectedLang = sourceLanguage || (await detectLanguage(text)).language;
  
  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a professional translator. Translate the provided text to ${languageNames[targetLanguage] || targetLanguage}.
Maintain the original formatting, tone, and meaning.
Return ONLY the translated text, nothing else.`,
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  const translatedText = result.choices[0]?.message?.content;

  return {
    originalText: text,
    translatedText: typeof translatedText === "string" ? translatedText : text,
    sourceLanguage: detectedLang,
    targetLanguage,
  };
}

// Streaming translation for longer texts
export async function* translateTextStream(
  text: string,
  targetLanguage: string
): AsyncGenerator<{ type: string; data: unknown }, void, unknown> {
  yield { type: "status", data: "Detectando idioma..." };
  
  const detection = await detectLanguage(text);
  yield { type: "detection", data: detection };
  
  if (detection.language === targetLanguage) {
    yield { type: "content", data: text };
    yield { type: "done", data: { message: "El texto ya está en el idioma destino." } };
    return;
  }

  yield { type: "status", data: `Traduciendo de ${detection.languageName} a ${languageNames[targetLanguage] || targetLanguage}...` };

  const messages: Message[] = [
    {
      role: "system",
      content: `You are a professional translator. Translate the following text to ${languageNames[targetLanguage] || targetLanguage}.
Maintain the original formatting, tone, and meaning.
Provide only the translation, no explanations.`,
    },
    {
      role: "user",
      content: text,
    },
  ];

  for await (const chunk of invokeLLMStream({ messages })) {
    yield { type: "content", data: chunk };
  }

  yield { type: "done", data: { sourceLanguage: detection.language, targetLanguage } };
}
