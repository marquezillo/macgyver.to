import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  ExternalLink, 
  Image as ImageIcon, 
  Search, 
  Paperclip, 
  File, 
  X,
  Code,
  Globe,
  FileText,
  LayoutTemplate,
  Terminal,
  Play,
  Copy,
  Check,
  FolderPlus
} from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Streamdown } from 'streamdown';
import { ChatImagePreview } from './ImageLightbox';

interface Message {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  hasArtifact?: boolean;
  isResearch?: boolean;
  sources?: Array<{ title: string; url: string; snippet: string }>;
  isImage?: boolean;
  imageUrl?: string;
  imagePrompt?: string;
}

interface ChatInterfaceProps {
  onOpenPreview: () => void;
  isPreviewOpen: boolean;
  chatId?: number | null;
  onChatCreated?: (chatId: number) => void;
}

const SUGGESTIONS = [
  { icon: Globe, label: 'Crea una landing', prompt: 'Crea una landing page moderna para ', color: 'blue' },
  { icon: FolderPlus, label: 'Crear proyecto', prompt: 'Crea un proyecto full-stack para ', color: 'emerald', isProject: true },
];

export function ChatInterface({ onOpenPreview, isPreviewOpen, chatId, onChatCreated }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [researchStatus, setResearchStatus] = useState<string | null>(null);
  const [researchSources, setResearchSources] = useState<Array<{ title: string; url: string; snippet: string }>>([]);
  const [uploadedFile, setUploadedFile] = useState<{ filename: string; content: string; type: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [codeInput, setCodeInput] = useState('# Escribe tu código Python aquí\nprint("Hola mundo!")');
  const [codeOutput, setCodeOutput] = useState('');
  const [isExecutingCode, setIsExecutingCode] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  
  const { setSections, sections } = useEditorStore();
  const { isAuthenticated, user } = useAuth();
  
  // Check if running in standalone mode (no auth required)
  // @ts-ignore - Runtime config injected by server
  const isStandaloneMode = window.__RUNTIME_CONFIG__?.standaloneMode === true;
  const canUseChat = isAuthenticated || isStandaloneMode;
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch messages from database if we have a chatId
  const { data: dbMessages, isLoading: messagesLoading } = trpc.message.list.useQuery(
    { chatId: chatId! },
    { enabled: !!chatId && canUseChat }
  );

  // Fetch chat data to restore artifact
  const { data: chatData } = trpc.chat.get.useQuery(
    { chatId: chatId! },
    { enabled: !!chatId && canUseChat }
  );

  // Mutations
  const createChat = trpc.chat.create.useMutation({
    onSuccess: (chat) => {
      if (chat) {
        onChatCreated?.(chat.id);
        utils.chat.list.invalidate();
      }
    }
  });
  const createMessage = trpc.message.create.useMutation();
  const utils = trpc.useUtils();

  const updateChatArtifact = trpc.chat.updateArtifact.useMutation();

  // Sync database messages to local state
  useEffect(() => {
    if (dbMessages && dbMessages.length > 0) {
      const mapped: Message[] = dbMessages.map(m => {
        // Parse image URL from stored content format: [Imagen generada: URL] or [Imagen generada: /path]
        const imageMatch = m.content.match(/\[Imagen generada:\s*(\/[^\]]+|https?:\/\/[^\]]+)\]/);
        // Parse prompt for regeneration: [Prompt: text]
        const promptMatch = m.content.match(/\[Prompt:\s*([^\]]+)\]/);
        const isImage = !!imageMatch;
        const imageUrl = imageMatch ? imageMatch[1] : undefined;
        
        return {
          id: m.id,
          role: m.role,
          content: isImage ? 'He generado esta imagen basada en tu descripción.' : m.content,
          hasArtifact: m.hasArtifact === 1,
          isImage,
          imageUrl,
          imagePrompt: promptMatch ? promptMatch[1] : undefined,
        };
      });
      setLocalMessages(mapped);
    } else if (!chatId) {
      setLocalMessages([]);
    }
  }, [dbMessages, chatId]);

  // Restore artifact data when loading a chat
  useEffect(() => {
    if (chatData?.artifactData) {
      const artifact = chatData.artifactData as { sections?: unknown[] };
      if (artifact.sections && Array.isArray(artifact.sections)) {
        setSections(artifact.sections as any);
      }
    } else if (!chatId) {
      setSections([]);
    }
  }, [chatData, chatId, setSections]);

  // Auto-scroll to bottom - only within messages container
  useEffect(() => {
    if (messagesContainerRef.current && scrollRef.current) {
      // Scroll within the messages container only, not the whole page
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [localMessages, streamingContent]);

  // Deep Research streaming
  const streamResearch = useCallback(async (
    query: string,
    currentChatId: number | null
  ) => {
    setResearchStatus('Iniciando investigación...');
    setResearchSources([]);
    
    try {
      const response = await fetch('/api/research/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query, chatId: currentChatId }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Debes iniciar sesión para usar Deep Research');
        }
        throw new Error('Research request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let fullContent = '';
      let sources: Array<{ title: string; url: string; snippet: string }> = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6));
              
              // Handle server events with { type, data } format
              if (event.type === 'status') {
                setResearchStatus(event.data as string);
              }
              if (event.type === 'source') {
                const source = event.data as { title: string; url: string; snippet: string };
                sources.push(source);
                setResearchSources([...sources]);
              }
              if (event.type === 'queries') {
                // Optional: show queries being searched
                console.log('[Deep Research] Queries:', event.data);
              }
              if (event.type === 'content') {
                fullContent += event.data as string;
                setStreamingContent(fullContent);
                setResearchStatus(null);
              }
              if (event.type === 'done') {
                // Research complete - extract sources and followUpQuestions from data
                const doneData = event.data as { sources: Array<{ title: string; url: string; snippet: string }>; followUpQuestions: string[] };
                if (doneData.sources) {
                  sources = doneData.sources;
                  setResearchSources(doneData.sources);
                }
                setResearchStatus(null);
              }
              if (event.type === 'error') {
                console.error('[Deep Research] Error:', event.data);
                setResearchStatus('Error en la investigación');
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      return { content: fullContent, sources };
    } catch (error) {
      console.error('Research error:', error);
      throw error;
    }
  }, []);

  // Regular chat streaming
  const streamResponse = useCallback(async (
    messages: Array<{ role: string; content: string }>,
    currentChatId: number | null
  ) => {
    console.log('[ChatInterface] streamResponse called with chatId:', currentChatId);
    abortControllerRef.current = new AbortController();
    
    try {
      console.log('[ChatInterface] Starting fetch to /api/ai/stream');
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages,
          chatId: currentChatId 
        }),
        signal: abortControllerRef.current.signal,
      });

      console.log('[ChatInterface] Fetch response status:', response.status);
      if (!response.ok) {
        console.log('[ChatInterface] Response not OK, status:', response.status);
        if (response.status === 401) {
          throw new Error('Debes iniciar sesión para usar el chat');
        }
        throw new Error('Stream request failed');
      }
      console.log('[ChatInterface] Response OK, starting to read stream');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let fullContent = '';
      let hasArtifact = false;

      let finalContent = '';
      let isGeneratingLanding = false;
      
      // Buffer to accumulate incomplete lines across chunks
      let lineBuffer = '';

      console.log('[ChatInterface] Starting to read stream');
      // Debug: Send a request to server to verify stream is starting
      fetch('/api/debug-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Stream starting', chatId: currentChatId })
      }).catch(() => {});
      let chunkCount = 0;
      while (true) {
        const { done, value } = await reader.read();
        chunkCount++;
        console.log('[ChatInterface] Read chunk', chunkCount, 'done:', done, 'valueLength:', value?.length || 0);
        // Debug: Send chunk info to server
        fetch('/api/debug-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Chunk read', chunkCount, done, valueLength: value?.length || 0 })
        }).catch(() => {});
        if (done) {
          console.log('[ChatInterface] Stream ended after', chunkCount, 'chunks');
          break;
        }

        const chunk = decoder.decode(value);
        console.log('[ChatInterface] Decoded chunk:', chunk.substring(0, 200));
        // Debug: Send large chunks to server for inspection
        if (chunk.length > 500) {
          fetch('/api/debug-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Large chunk', length: chunk.length, preview: chunk.substring(0, 500), hasDone: chunk.includes('"type":"done"') })
          }).catch(() => {});
        }
        
        // Accumulate chunk with buffer and split by newlines
        lineBuffer += chunk;
        const lines = lineBuffer.split('\n');
        
        // Keep the last incomplete line in the buffer
        lineBuffer = lines.pop() || '';

        for (const line of lines) {
          console.log('[ChatInterface] Processing line:', line.substring(0, 100));
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6);
              console.log('[ChatInterface] Parsing JSON:', jsonStr.substring(0, 100));
              // Debug: Send JSON string to server if it contains done
              if (jsonStr.includes('"type":"done"')) {
                fetch('/api/debug-log', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ message: 'Attempting to parse done JSON', length: jsonStr.length, preview: jsonStr.substring(0, 200) })
                }).catch(() => {});
              }
              const data = JSON.parse(jsonStr);
              console.log('[ChatInterface] Parsed data type:', data.type);
              // Debug: Send parsed data type to server
              fetch('/api/debug-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'Parsed data', type: data.type, hasArtifact: !!data.artifactData })
              }).catch(() => {});
              
                // Handle done event - this contains the clean message
                if (data.type === 'done') {
                  console.log('[ChatInterface] Received done event:', data);
                  // Use the clean content from done event
                  if (data.content) {
                    finalContent = data.content;
                  }
                  // Handle artifact
                  if (data.artifactData) {
                    hasArtifact = true;
                    console.log('[ChatInterface] Received artifact data:', data.artifactData);
                    console.log('[ChatInterface] Sections count:', data.artifactData.sections?.length || 0);
                    console.log('[ChatInterface] Calling setSections with:', data.artifactData.sections);
                    setSections(data.artifactData.sections || []);
                    console.log('[ChatInterface] setSections called');
                  
                    // Save artifact to database
                    console.log('[ChatInterface] currentChatId for artifact save:', currentChatId);
                    // Debug: Send a request to server to verify this code is reached
                    fetch('/api/debug-log', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ message: 'Frontend reached artifact save', currentChatId, sectionsCount: data.artifactData.sections?.length })
                    }).catch(() => {});
                    if (currentChatId) {
                      console.log('[ChatInterface] Calling updateChatArtifact.mutate with chatId:', currentChatId);
                      updateChatArtifact.mutate({
                        chatId: currentChatId,
                        artifactData: data.artifactData
                      }, {
                        onSuccess: () => console.log('[ChatInterface] Artifact saved successfully'),
                        onError: (err) => console.error('[ChatInterface] Error saving artifact:', err)
                      });
                    } else {
                      console.log('[ChatInterface] No currentChatId, skipping artifact save');
                    }
                  }
              } else if (data.type === 'chunk' && data.content) {
                // Regular streaming chunk
                fullContent += data.content;
                
                // Check if this looks like a landing JSON being generated
                if (fullContent.includes('"type": "landing"') || fullContent.includes('"type":"landing"') || 
                    fullContent.includes('```json') && fullContent.includes('"sections"')) {
                  isGeneratingLanding = true;
                  // Show a friendly message instead of JSON
                  setStreamingContent('🎨 Generando tu landing page...\n\nEstoy diseñando las secciones, colores y contenido para tu página. En unos segundos podrás ver el preview a la derecha.');
                } else if (!isGeneratingLanding) {
                  // Only show content if not generating a landing
                  setStreamingContent(fullContent);
                }
              } else if (data.content && !data.type) {
                // Legacy format support
                fullContent += data.content;
                if (!isGeneratingLanding) {
                  setStreamingContent(fullContent);
                }
              }
            } catch (parseError) {
              // Debug: Send parse error to server
              if (line.includes('"type":"done"')) {
                fetch('/api/debug-log', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ message: 'Parse error for done JSON', error: String(parseError), lineLength: line.length, linePreview: line.substring(0, 300) })
                }).catch(() => {});
              }
              // Skip invalid JSON
            }
          }
        }
      }

      // Use finalContent if we got a clean message from done event, otherwise use accumulated content
      const resultContent = finalContent || (isGeneratingLanding ? 'He creado tu landing page. Puedes ver el preview a la derecha.' : fullContent);
      return { content: resultContent, hasArtifact };
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return { content: streamingContent, hasArtifact: false };
      }
      throw error;
    }
  }, [setSections, streamingContent, updateChatArtifact]);

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        setUploadedFile({
          filename: file.name,
          content: base64,
          type: file.type
        });
        setIsUploading(false);
      };
      reader.onerror = () => {
        console.error('Error reading file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File upload error:', error);
      setIsUploading(false);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Code execution handler
  const handleExecuteCode = async () => {
    if (!codeInput.trim()) return;
    
    setIsExecutingCode(true);
    setCodeOutput('');
    
    try {
      const response = await fetch('/api/execute-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeInput }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCodeOutput(result.output || 'Código ejecutado sin salida');
      } else {
        setCodeOutput(`Error: ${result.error}`);
      }
    } catch (error) {
      setCodeOutput(`Error de conexión: ${(error as Error).message}`);
    } finally {
      setIsExecutingCode(false);
    }
  };

  const handleSend = async (overrideInput?: string, isResearch = false, isImage = false) => {
    const messageContent = overrideInput ?? input;
    if (!messageContent.trim() && !uploadedFile) return;

    // Build the full message content
    let fullContent = messageContent;
    if (uploadedFile) {
      fullContent = `[Archivo adjunto: ${uploadedFile.filename}]\n\n${messageContent || 'Analiza este archivo'}`;
    }

    const userMessage: Message = { role: 'user', content: fullContent };
    setLocalMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    setStreamingContent('');

    try {
      // Create chat if needed
      let currentChatId = chatId;
      if (!currentChatId && canUseChat) {
        const title = fullContent.slice(0, 50) + (fullContent.length > 50 ? '...' : '');
        const chat = await createChat.mutateAsync({ title });
        if (chat) {
          currentChatId = chat.id;
        }
      }

      // Save user message to database
      if (canUseChat && currentChatId) {
        await createMessage.mutateAsync({
          chatId: currentChatId,
          role: 'user',
          content: fullContent,
          hasArtifact: false,
        });
      }

      // Check if this is a research request (auto-detect "Investiga [" pattern)
      const isResearchRequest = isResearch || messageContent.toLowerCase().startsWith('investiga [') || messageContent.toLowerCase().startsWith('investiga:') || messageContent.toLowerCase().includes('investiga sobre');

      // Check if this is an image generation request - detect multiple patterns and synonyms
      const lowerMessage = messageContent.toLowerCase();
      const imageKeywords = [
        // Verbos de generación
        'genera', 'generar', 'generame', 'genérame',
        'crea', 'crear', 'creame', 'créame',
        'haz', 'hazme', 'hacer',
        'dibuja', 'dibujar', 'dibujame', 'dibújame',
        'diseña', 'diseñar', 'diseñame',
        'produce', 'producir', 'produceme',
        'muestra', 'mostrar', 'muestrame', 'muéstrame',
        'dame', 'quiero', 'necesito',
      ];
      const imageNouns = [
        'imagen', 'imagenes', 'imágenes',
        'foto', 'fotos', 'fotografía', 'fotografías',
        'ilustración', 'ilustracion', 'ilustraciones',
        'dibujo', 'dibujos',
        'gráfico', 'grafico', 'gráficos', 'graficos',
        'arte', 'artwork',
        'picture', 'image', 'photo',
        'visual', 'visualización',
        'retrato', 'retratos',
        'poster', 'póster',
        'banner', 'logo', 'icono',
      ];
      
      // Check if message contains both a generation verb and an image noun
      const hasImageVerb = imageKeywords.some(verb => lowerMessage.includes(verb));
      const hasImageNoun = imageNouns.some(noun => lowerMessage.includes(noun));
      
      // Exclude landing page requests from being treated as image requests
      const isLandingRequest = lowerMessage.includes('landing') || 
                               lowerMessage.includes('página web') || 
                               lowerMessage.includes('pagina web') ||
                               lowerMessage.includes('sitio web') ||
                               lowerMessage.includes('website');
      
      const isImageRequest = isImage || (hasImageVerb && hasImageNoun && !isLandingRequest);
      
      if (isImageRequest) {
        // Generate image
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: messageContent }),
        });
        
        const result = await response.json();
        
        if (result.success && result.url) {
          const assistantMessage: Message = {
            role: 'assistant',
            content: 'He generado esta imagen basada en tu descripción.',
            isImage: true,
            imageUrl: result.url,
            imagePrompt: messageContent,
          };
          setLocalMessages(prev => [...prev, assistantMessage]);
          
          // Save to database with prompt for regeneration
          if (canUseChat && currentChatId) {
            await createMessage.mutateAsync({
              chatId: currentChatId,
              role: 'assistant',
              content: `[Imagen generada: ${result.url}][Prompt: ${messageContent}]`,
              hasArtifact: false,
            });
          }
        } else {
          throw new Error(result.error || 'Error generating image');
        }
      } else if (isResearchRequest) {
        // Use deep research
        const result = await streamResearch(messageContent, currentChatId ?? null);
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: result.content,
          isResearch: true,
          sources: result.sources,
        };
        setLocalMessages(prev => [...prev, assistantMessage]);
        setStreamingContent('');
        setResearchSources([]);

        // Save to database
        if (canUseChat && currentChatId) {
          await createMessage.mutateAsync({
            chatId: currentChatId,
            role: 'assistant',
            content: result.content,
            hasArtifact: false,
          });
        }
      } else if (uploadedFile && (uploadedFile.type === 'application/pdf' || uploadedFile.filename.toLowerCase().endsWith('.pdf'))) {
        // PDF file - use dedicated analysis endpoint with chunking
        const formData = new FormData();
        const blob = new Blob([Uint8Array.from(atob(uploadedFile.content), c => c.charCodeAt(0))], { type: uploadedFile.type });
        formData.append('file', blob, uploadedFile.filename);
        
        const uploadResponse = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Error al subir el archivo');
        }
        
        const uploadResult = await uploadResponse.json();
        
        const analyzeResponse = await fetch('/api/files/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileUrl: uploadResult.url,
            mimeType: uploadedFile.type,
            prompt: messageContent || 'Analiza este documento PDF y proporciona un resumen detallado.',
          }),
        });
        
        if (!analyzeResponse.ok) {
          throw new Error('Error al analizar el archivo');
        }
        
        const reader = analyzeResponse.body?.getReader();
        const decoder = new TextDecoder();
        let analysisContent = '';
        
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === 'chunk') {
                    analysisContent += data.content;
                    setStreamingContent(analysisContent);
                  } else if (data.type === 'done') {
                    analysisContent = data.content;
                  }
                } catch (e) {}
              }
            }
          }
        }
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: analysisContent,
          hasArtifact: false,
        };
        setLocalMessages(prev => [...prev, assistantMessage]);
        setStreamingContent('');
        
        if (canUseChat && currentChatId) {
          await createMessage.mutateAsync({
            chatId: currentChatId,
            role: 'assistant',
            content: analysisContent,
            hasArtifact: false,
          });
        }
        setUploadedFile(null);
      } else {
        // Regular chat with streaming (including non-PDF files)
        const messagesForAPI = [...localMessages, userMessage].map(m => ({
          role: m.role,
          content: m.content,
        }));

        // Add file content if present (for images and other files)
        if (uploadedFile) {
          messagesForAPI[messagesForAPI.length - 1].content = JSON.stringify({
            text: messageContent || 'Analiza este archivo',
            file: uploadedFile
          });
        }

        const result = await streamResponse(messagesForAPI, currentChatId ?? null);
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: result.content,
          hasArtifact: result.hasArtifact,
        };
        setLocalMessages(prev => [...prev, assistantMessage]);
        setStreamingContent('');

        // Save to database
        if (canUseChat && currentChatId) {
          await createMessage.mutateAsync({
            chatId: currentChatId,
            role: 'assistant',
            content: result.content,
            hasArtifact: result.hasArtifact,
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: (error as Error).message || 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
      };
      setLocalMessages(prev => [...prev, errorMessage]);
      setStreamingContent('');
      setResearchStatus(null);
    } finally {
      setIsProcessing(false);
      setUploadedFile(null);
    }
  };

  const handleSuggestionClick = (prompt: string, isResearch = false, isImage = false, isFileUpload = false, isCodeExec = false) => {
    if (isFileUpload) {
      fileInputRef.current?.click();
      return;
    }
    if (isCodeExec) {
      setShowCodeEditor(true);
      return;
    }
    if (isResearch || isImage) {
      setInput(prompt + ' ');
    } else {
      setInput(prompt);
    }
  };

  const isEmptyChat = localMessages.length === 0 && !chatId;

  return (
    <div className="flex flex-col h-full bg-white w-full" style={{ maxHeight: '100%', overflow: 'hidden' }}>
      {/* Header - only show when in conversation */}
      {!isEmptyChat && (
        <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center" style={{ flexShrink: 0 }}>
          <h2 className="font-semibold text-sm text-gray-700">
            Conversación
          </h2>
          {!isPreviewOpen && sections.length > 0 && (
             <Button variant="outline" size="sm" onClick={onOpenPreview} className="h-8 gap-2 text-xs">
               <LayoutTemplate className="w-3 h-3" />
               Ver Diseño
             </Button>
          )}
        </div>
      )}
      
      {/* Messages Area or Welcome Screen - This is the scrollable area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto"
        style={{ minHeight: 0 }}
      >
        {isEmptyChat ? (
          /* Welcome Screen with Suggestions */
          <div className="h-full flex flex-col items-center justify-center p-4 md:p-8">
            <div className="max-w-2xl w-full text-center space-y-8">
              {/* Logo/Title */}
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900">¿En qué puedo ayudarte?</h1>
                <p className="text-gray-500 text-sm">Selecciona una sugerencia o escribe tu mensaje</p>
              </div>

              {/* Suggestion Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                {SUGGESTIONS.map((suggestion, index) => {
                  const Icon = suggestion.icon;
                  const colorClasses: Record<string, string> = {
                    indigo: 'hover:border-indigo-300 hover:bg-indigo-50/50',
                    pink: 'hover:border-pink-300 hover:bg-pink-50/50',
                    cyan: 'hover:border-cyan-300 hover:bg-cyan-50/50',
                    violet: 'hover:border-violet-300 hover:bg-violet-50/50',
                    blue: 'hover:border-blue-300 hover:bg-blue-50/50',
                    emerald: 'hover:border-emerald-300 hover:bg-emerald-50/50',
                    amber: 'hover:border-amber-300 hover:bg-amber-50/50',
                    rose: 'hover:border-rose-300 hover:bg-rose-50/50',
                  };
                  const iconColorClasses: Record<string, string> = {
                    indigo: 'group-hover:text-indigo-600',
                    pink: 'group-hover:text-pink-600',
                    cyan: 'group-hover:text-cyan-600',
                    violet: 'group-hover:text-violet-600',
                    blue: 'group-hover:text-blue-600',
                    emerald: 'group-hover:text-emerald-600',
                    amber: 'group-hover:text-amber-600',
                    rose: 'group-hover:text-rose-600',
                  };
                  return (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion.prompt, (suggestion as any).isResearch, (suggestion as any).isImage, (suggestion as any).isFileUpload, (suggestion as any).isCodeExec)}
                      className={`group p-3 md:p-4 rounded-xl border border-gray-200 bg-white text-left transition-all duration-200 ${colorClasses[suggestion.color]}`}
                    >
                      <Icon className={`w-4 h-4 md:w-5 md:h-5 text-gray-400 mb-1.5 md:mb-2 transition-colors ${iconColorClasses[suggestion.color]}`} />
                      <span className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-gray-900 block">{suggestion.label}</span>
                      {(suggestion as any).isResearch && (
                        <span className="ml-1 md:ml-2 text-[8px] md:text-[10px] px-1 md:px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded-full font-medium">Deep</span>
                      )}
                      {(suggestion as any).isImage && (
                        <span className="ml-1 md:ml-2 text-[8px] md:text-[10px] px-1 md:px-1.5 py-0.5 bg-pink-100 text-pink-600 rounded-full font-medium">AI</span>
                      )}
                      {(suggestion as any).isFileUpload && (
                        <span className="ml-1 md:ml-2 text-[8px] md:text-[10px] px-1 md:px-1.5 py-0.5 bg-cyan-100 text-cyan-600 rounded-full font-medium">PDF</span>
                      )}
                      {(suggestion as any).isCodeExec && (
                        <span className="ml-1 md:ml-2 text-[8px] md:text-[10px] px-1 md:px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded-full font-medium">Python</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Conversation Messages */
          <div className="p-3 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6 pb-4">
              {messagesLoading && chatId ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  {localMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 message-bubble ${msg.role === 'user' ? 'justify-end' : ''}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                          <Bot size={14} className="text-white" />
                        </div>
                      )}
                      <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`p-4 rounded-2xl text-sm leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-gray-900 text-white rounded-tr-sm'
                              : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                          }`}
                        >
                          {msg.role === 'assistant' ? (
                            <div className="streamdown-container prose prose-sm max-w-none">
                              <Streamdown>{msg.content}</Streamdown>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                        
                        {/* Generated Image */}
                        {msg.isImage && msg.imageUrl && (
                          <ChatImagePreview 
                            src={msg.imageUrl} 
                            alt="Imagen generada por IA" 
                            prompt={msg.imagePrompt}
                            onRegenerate={async (prompt) => {
                              try {
                                const response = await fetch('/api/generate-image', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ prompt }),
                                });
                                const result = await response.json();
                                if (result.success && result.url) {
                                  return result.url;
                                }
                                return null;
                              } catch (error) {
                                console.error('Error regenerating image:', error);
                                return null;
                              }
                            }}
                          />
                        )}
                        
                        {/* Research Sources */}
                        {msg.isResearch && msg.sources && msg.sources.length > 0 && (
                          <div className="w-full bg-gray-50 rounded-xl p-3 space-y-2">
                            <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                              <Search className="w-3 h-3" />
                              Fuentes ({msg.sources.length})
                            </p>
                            <div className="space-y-1.5">
                              {msg.sources.slice(0, 5).map((source, idx) => (
                                <a
                                  key={idx}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                                >
                                  <ExternalLink className="w-3 h-3 text-gray-400 mt-0.5 shrink-0 group-hover:text-indigo-500" />
                                  <div className="min-w-0">
                                    <p className="text-xs font-medium text-gray-700 truncate group-hover:text-indigo-600">
                                      {source.title || 'Sin título'}
                                    </p>
                                    <p className="text-[10px] text-gray-400 truncate">{source.url}</p>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Artifact indicator */}
                        {msg.hasArtifact && (
                          <button
                            onClick={onOpenPreview}
                            className="flex items-center gap-2 text-xs text-violet-600 hover:text-violet-700 bg-violet-50 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <LayoutTemplate className="w-3 h-3" />
                            Ver diseño generado
                          </button>
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                          <User size={14} className="text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Research status */}
                  {researchStatus && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                        <Search size={14} className="text-white" />
                      </div>
                      <div className="flex flex-col gap-2 max-w-[85%] items-start">
                        <div className="p-4 rounded-2xl rounded-tl-sm text-sm leading-relaxed bg-indigo-50 text-indigo-800">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{researchStatus}</span>
                          </div>
                          {researchSources.length > 0 && (
                            <div className="mt-3 space-y-1">
                              {researchSources.map((source, idx) => (
                                <div key={idx} className="text-xs text-indigo-600 truncate">
                                  • {source.title || source.url}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Streaming message */}
                  {streamingContent && !researchStatus && (
                    <div className="flex gap-3 message-bubble" data-streaming="true">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                        <Bot size={14} className="text-white" />
                      </div>
                      <div className="flex flex-col gap-2 max-w-[85%] items-start">
                        <div className="p-4 rounded-2xl rounded-tl-sm text-sm leading-relaxed bg-gray-100 text-gray-800">
                          <div className="streamdown-container prose prose-sm max-w-none">
                            <Streamdown>{streamingContent}</Streamdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Loading indicator when processing but not yet streaming */}
                  {isProcessing && !streamingContent && !researchStatus && (
                    <div className="flex gap-3">
                       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                         <Bot size={14} className="text-white" />
                       </div>
                       <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                         <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                         <span className="text-sm text-gray-500">Pensando...</span>
                       </div>
                    </div>
                  )}
                </>
              )}
              <div ref={scrollRef} />
            </div>
          </div>
        )}
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="p-3 md:p-4 bg-white border-t border-gray-100" style={{ flexShrink: 0 }}>
        <div className="max-w-2xl mx-auto">
          {/* File attachment preview */}
          {uploadedFile && (
            <div className="mb-2 p-2 bg-cyan-50 border border-cyan-200 rounded-lg flex items-center gap-2">
              <File className="w-4 h-4 text-cyan-600" />
              <span className="text-sm text-cyan-800 flex-1 truncate">{uploadedFile.filename}</span>
              <button
                type="button"
                onClick={() => setUploadedFile(null)}
                className="p-1 hover:bg-cyan-100 rounded"
              >
                <X className="w-4 h-4 text-cyan-600" />
              </button>
            </div>
          )}
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.webp"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Check if input starts with research trigger
              const isResearchQuery = input.toLowerCase().startsWith('investiga');
              handleSend(undefined, isResearchQuery);
            }}
            className="relative flex items-center gap-2"
          >
            {/* Attachment button */}
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-10 w-10 md:h-12 md:w-12 rounded-xl border-gray-200 hover:bg-gray-50"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing || isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Paperclip className="w-4 h-4 text-gray-500" />
              )}
            </Button>
            
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={uploadedFile ? "Describe qué quieres analizar del archivo..." : "Escribe un mensaje..."}
              className="flex-1 h-10 md:h-12 px-3 md:px-4 rounded-xl border-gray-200 focus-visible:ring-violet-500 text-sm md:text-base"
              disabled={isProcessing}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gray-900 hover:bg-gray-800"
              disabled={isProcessing || (!input.trim() && !uploadedFile)}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            Adjunta archivos con el clip o escribe "Investiga [tema]" para Deep Research
          </p>
        </div>
      </div>

      {/* Code Editor Modal */}
      {showCodeEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-gray-900">Ejecutar Código Python</h3>
              </div>
              <button
                onClick={() => {
                  setShowCodeEditor(false);
                  setCodeInput('');
                  setCodeOutput('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Code Input */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="p-4 flex-1 min-h-0">
                <div className="relative h-full">
                  <textarea
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    className="w-full h-full min-h-[200px] p-4 font-mono text-sm bg-gray-900 text-gray-100 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="# Escribe tu código Python aquí"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(codeInput);
                      setCodeCopied(true);
                      setTimeout(() => setCodeCopied(false), 2000);
                    }}
                    className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Copiar código"
                  >
                    {codeCopied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Output */}
              {codeOutput && (
                <div className="px-4 pb-4">
                  <div className="bg-gray-100 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">Salida:</p>
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">{codeOutput}</pre>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCodeEditor(false);
                  setCodeInput('');
                  setCodeOutput('');
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleExecuteCode}
                disabled={isExecutingCode || !codeInput.trim()}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isExecutingCode ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Ejecutando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Ejecutar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
