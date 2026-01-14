import { invokeLLM, invokeLLMStream, type Message } from "./_core/llm";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const execAsync = promisify(exec);

export interface VideoInfo {
  title: string;
  channel: string;
  duration: string;
  description: string;
  url: string;
}

export interface VideoSummaryResult {
  videoInfo: VideoInfo;
  transcript: string;
  summary: string;
  keyPoints: string[];
  timestamps: { time: string; topic: string }[];
}

// Extract YouTube video ID from URL
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Fetch video metadata using YouTube oEmbed API
async function fetchVideoMetadata(url: string): Promise<Partial<VideoInfo>> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      throw new Error('Video not found');
    }

    const data = await response.json() as { title?: string; author_name?: string };
    
    return {
      title: data.title || 'Unknown',
      channel: data.author_name || 'Unknown',
      url,
    };
  } catch {
    return { url, title: 'Unknown', channel: 'Unknown' };
  }
}

// Transcribe video audio using manus-speech-to-text
async function transcribeVideo(videoUrl: string): Promise<string> {
  const tempDir = '/tmp/video-transcripts';
  const id = randomUUID();
  
  await mkdir(tempDir, { recursive: true });
  
  const audioPath = join(tempDir, `${id}.mp3`);
  const transcriptPath = join(tempDir, `${id}.txt`);
  
  try {
    // Download audio from YouTube using yt-dlp (if available) or fallback
    try {
      await execAsync(`yt-dlp -x --audio-format mp3 -o "${audioPath}" "${videoUrl}"`, { timeout: 120000 });
    } catch {
      // If yt-dlp is not available, we'll use a simpler approach
      // For now, return a message that transcription requires the audio file
      throw new Error('Transcripción de video requiere descarga de audio. Por favor, sube el archivo de audio directamente.');
    }
    
    // Transcribe using manus-speech-to-text
    const { stdout } = await execAsync(`manus-speech-to-text "${audioPath}"`, { timeout: 300000 });
    
    // Clean up
    await unlink(audioPath).catch(() => {});
    
    return stdout.trim();
  } catch (error) {
    await unlink(audioPath).catch(() => {});
    throw error;
  }
}

// Generate summary from transcript
async function generateSummary(
  transcript: string,
  videoInfo: Partial<VideoInfo>
): Promise<{ summary: string; keyPoints: string[]; timestamps: { time: string; topic: string }[] }> {
  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a video content analyst. Analyze the provided transcript and create a comprehensive summary.

Return a JSON object with:
- summary: A detailed summary of the video content (2-3 paragraphs)
- keyPoints: Array of 5-10 key takeaways or important points
- timestamps: Array of objects with {time, topic} for main sections (estimate times if not clear)

Be thorough and capture the main ideas and insights from the video.`,
      },
      {
        role: "user",
        content: `Video: ${videoInfo.title || 'Unknown'}\nChannel: ${videoInfo.channel || 'Unknown'}\n\nTranscript:\n${transcript.slice(0, 15000)}`,
      },
    ],
    responseFormat: {
      type: "json_schema",
      json_schema: {
        name: "video_summary",
        strict: true,
        schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            keyPoints: { type: "array", items: { type: "string" } },
            timestamps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  time: { type: "string" },
                  topic: { type: "string" },
                },
                required: ["time", "topic"],
                additionalProperties: false,
              },
            },
          },
          required: ["summary", "keyPoints", "timestamps"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const content = result.choices[0]?.message?.content;
    return JSON.parse(typeof content === "string" ? content : "{}");
  } catch {
    return { summary: '', keyPoints: [], timestamps: [] };
  }
}

// Main function to summarize a YouTube video
export async function summarizeYouTubeVideo(url: string): Promise<VideoSummaryResult> {
  const videoId = extractYouTubeId(url);
  if (!videoId) {
    throw new Error('URL de YouTube no válida');
  }

  // Fetch metadata
  const metadata = await fetchVideoMetadata(url);
  
  // Transcribe
  const transcript = await transcribeVideo(url);
  
  // Generate summary
  const { summary, keyPoints, timestamps } = await generateSummary(transcript, metadata);

  return {
    videoInfo: {
      title: metadata.title || 'Unknown',
      channel: metadata.channel || 'Unknown',
      duration: metadata.duration || 'Unknown',
      description: metadata.description || '',
      url,
    },
    transcript,
    summary,
    keyPoints,
    timestamps,
  };
}

// Streaming version for real-time feedback
export async function* summarizeVideoStream(
  url: string
): AsyncGenerator<{ type: string; data: unknown }, void, unknown> {
  const videoId = extractYouTubeId(url);
  if (!videoId) {
    yield { type: "error", data: "URL de YouTube no válida" };
    return;
  }

  yield { type: "status", data: "Obteniendo información del video..." };
  
  const metadata = await fetchVideoMetadata(url);
  yield { type: "metadata", data: metadata };

  yield { type: "status", data: "Transcribiendo audio del video..." };
  
  let transcript: string;
  try {
    transcript = await transcribeVideo(url);
    yield { type: "transcript", data: transcript.slice(0, 500) + '...' };
  } catch (error) {
    // If transcription fails, try to generate summary from metadata only
    yield { type: "warning", data: "No se pudo transcribir el video. Generando resumen basado en metadatos..." };
    transcript = `Video: ${metadata.title}\nChannel: ${metadata.channel}\nDescription: ${metadata.description || 'No description available'}`;
  }

  yield { type: "status", data: "Generando resumen..." };

  const messages: Message[] = [
    {
      role: "system",
      content: `You are a video content analyst. Based on the provided information, create a comprehensive summary of the video.

Structure your response in Spanish:
## Resumen
Overview of the video content

## Puntos Clave
- Key takeaways and insights

## Temas Principales
List the main topics covered

Use markdown formatting.`,
    },
    {
      role: "user",
      content: `Video: ${metadata.title}\nChannel: ${metadata.channel}\n\nContent:\n${transcript.slice(0, 12000)}`,
    },
  ];

  for await (const chunk of invokeLLMStream({ messages })) {
    yield { type: "content", data: chunk };
  }

  yield { type: "done", data: { videoId, title: metadata.title } };
}

// Summarize from uploaded audio/video file
export async function summarizeFromFile(
  filePath: string,
  fileName: string
): Promise<{ transcript: string; summary: string; keyPoints: string[] }> {
  // Transcribe using manus-speech-to-text
  const { stdout } = await execAsync(`manus-speech-to-text "${filePath}"`, { timeout: 300000 });
  const transcript = stdout.trim();

  // Generate summary
  const { summary, keyPoints } = await generateSummary(transcript, { title: fileName });

  return { transcript, summary, keyPoints };
}
