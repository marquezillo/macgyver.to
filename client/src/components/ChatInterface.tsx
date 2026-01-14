import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2, LayoutTemplate, ArrowRight, Mail, Code, Globe, FileText, Lightbulb, PenLine, Search, ExternalLink, Image as ImageIcon, Paperclip, X, File, Terminal, Play } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Streamdown } from 'streamdown';
import { ChatImagePreview } from './ImageLightbox';

interface Message {
  id: string | number;
  role: 'user' | 'assistant';
  content: string;
  hasArtifact?: boolean;
  isStreaming?: boolean;
  isResearch?: boolean;
  isImage?: boolean;
  isFileAnalysis?: boolean;
  imageUrl?: string;
  fileInfo?: { name: string; type: string; url: string };
  sources?: Array<{ title: string; url: string; snippet: string }>;
  followUpQuestions?: string[];
}

interface UploadedFile {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

interface ChatInterfaceProps {
  onOpenPreview?: () => void;
  isPreviewOpen?: boolean;
  chatId?: number | null;
  onChatCreated?: (chatId: number) => void;
}

const SUGGESTIONS = [
  { icon: Search, label: 'Investiga un tema', prompt: 'Investiga sobre', color: 'indigo', isResearch: true },
  { icon: ImageIcon, label: 'Genera una imagen', prompt: 'Genera una imagen de', color: 'pink', isImage: true },
  { icon: FileText, label: 'Analiza un archivo', prompt: '', color: 'cyan', isFileUpload: true },
  { icon: Terminal, label: 'Ejecuta código', prompt: '', color: 'amber', isCodeExec: true },
  { icon: Globe, label: 'Crea una landing', prompt: 'Crea una landing page moderna para mi startup de tecnología', color: 'violet' },
  { icon: Code, label: 'Ayúdame con código', prompt: 'Necesito ayuda con un problema de programación', color: 'emerald' },
];

export function ChatInterface({ onOpenPreview, isPreviewOpen, chatId, onChatCreated }: ChatInterfaceProps) {
  const { sections, setSections } = useEditorStore();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [researchStatus, setResearchStatus] = useState<string | null>(null);
  const [researchSources, setResearchSources] = useState<Array<{ title: string; url: string; snippet: string }>>([]);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [isExecutingCode, setIsExecutingCode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch messages from database if we have a chatId
  const { data: dbMessages, isLoading: messagesLoading } = trpc.message.list.useQuery(
    { chatId: chatId! },
    { enabled: !!chatId && isAuthenticated }
  );

  // Fetch chat data to restore artifact
  const { data: chatData } = trpc.chat.get.useQuery(
    { chatId: chatId! },
    { enabled: !!chatId && isAuthenticated }
  );

  // Mutations
  const createChat = trpc.chat.create.useMutation({
    onSuccess: (chat) => {
      if (chat) {
        onChatCreated?.(chat.id);
        utils.chat.list.invalidate();
      }
    },
  });

  const createMessage = trpc.message.create.useMutation({
    onSuccess: () => {
      if (chatId) {
        utils.message.list.invalidate({ chatId });
      }
    },
  });

  const updateChatArtifact = trpc.chat.updateArtifact.useMutation();

  // Sync database messages to local state
  useEffect(() => {
    if (dbMessages && dbMessages.length > 0) {
      const mapped: Message[] = dbMessages.map(m => {
        // Parse image URL from stored content format: [Imagen generada: URL]
        const imageMatch = m.content.match(/\[Imagen generada:\s*(https?:\/\/[^\]]+)\]/);
        const isImage = !!imageMatch;
        const imageUrl = imageMatch ? imageMatch[1] : undefined;
        
        return {
          id: m.id,
          role: m.role,
          content: isImage ? 'He generado esta imagen basada en tu descripción.' : m.content,
          hasArtifact: m.hasArtifact === 1,
          isImage,
          imageUrl,
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

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localMessages, streamingContent]);

  // Deep Research streaming
  const streamResearch = useCallback(async (
    question: string,
    currentChatId: number | null | undefined
  ) => {
    abortControllerRef.current = new AbortController();
    setResearchStatus('Iniciando investigación...');
    setResearchSources([]);
    
    try {
      const response = await fetch('/api/research/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
        credentials: 'include',
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Para usar Deep Research, por favor inicia sesión primero.');
        }
        throw new Error(`Error del servidor (${response.status}). Por favor, intenta de nuevo.`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let sources: Array<{ title: string; url: string; snippet: string }> = [];
      let followUpQuestions: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          try {
            const event = JSON.parse(line.slice(6));
            
            if (event.type === 'status') {
              setResearchStatus(event.data as string);
            } else if (event.type === 'source') {
              const source = event.data as { title: string; url: string; snippet: string };
              sources.push(source);
              setResearchSources([...sources]);
            } else if (event.type === 'content') {
              accumulatedContent += event.data;
              setStreamingContent(accumulatedContent);
              setResearchStatus(null);
            } else if (event.type === 'done') {
              const doneData = event.data as { sources: typeof sources; followUpQuestions: string[] };
              sources = doneData.sources || sources;
              followUpQuestions = doneData.followUpQuestions || [];
            } else if (event.type === 'error') {
              throw new Error(event.data as string);
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }

      // Finalize the research message
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: accumulatedContent,
        isResearch: true,
        sources,
        followUpQuestions,
      };
      setLocalMessages(prev => [...prev, aiMsg]);
      setStreamingContent('');
      setResearchStatus(null);
      setResearchSources([]);

      // Save to database
      if (isAuthenticated && currentChatId) {
        try {
          await createMessage.mutateAsync({
            chatId: currentChatId,
            role: 'assistant',
            content: accumulatedContent,
            hasArtifact: false,
          });
        } catch (error) {
          console.error('Failed to save research message:', error);
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('Research aborted');
        return;
      }
      throw error;
    }
  }, [isAuthenticated, createMessage]);

  // Regular chat streaming
  const streamResponse = useCallback(async (
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    currentChatId: number | null | undefined
  ) => {
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory }),
        credentials: 'include',
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Para usar el chat, por favor inicia sesión primero.');
        }
        throw new Error(`Error del servidor (${response.status}). Por favor, intenta de nuevo.`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let finalData: { content: string; hasArtifact: boolean; artifactData: unknown } | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === 'chunk') {
              accumulatedContent += data.content;
              setStreamingContent(accumulatedContent);
            } else if (data.type === 'done') {
              finalData = data;
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }

      // Finalize the message
      if (finalData) {
        // If there's artifact data, update the editor
        if (finalData.hasArtifact && finalData.artifactData) {
          const artifact = finalData.artifactData as { sections?: unknown[] };
          if (artifact.sections) {
            setSections(artifact.sections as any);
          }
        }

        // Add final AI message
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: finalData.content,
          hasArtifact: finalData.hasArtifact,
        };
        setLocalMessages(prev => [...prev, aiMsg]);
        setStreamingContent('');

        // Save to database
        if (isAuthenticated && currentChatId) {
          try {
            await createMessage.mutateAsync({
              chatId: currentChatId,
              role: 'assistant',
              content: finalData.content,
              hasArtifact: finalData.hasArtifact,
            });

            if (finalData.hasArtifact && finalData.artifactData) {
              await updateChatArtifact.mutateAsync({
                chatId: currentChatId,
                artifactData: finalData.artifactData,
              });
            }
          } catch (error) {
            console.error('Failed to save AI message:', error);
          }
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('Stream aborted');
        return;
      }
      throw error;
    }
  }, [isAuthenticated, createMessage, updateChatArtifact, setSections]);

  // Image generation mutation
  const generateImageMutation = trpc.image.generate.useMutation();

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (16MB limit)
    if (file.size > 16 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 16MB.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadedFile(data);
      setInput(`Analiza este archivo: ${file.name}`);
    } catch (error) {
      console.error('File upload error:', error);
      alert('Error al subir el archivo. Por favor, intenta de nuevo.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // File analysis streaming
  const streamFileAnalysis = useCallback(async (
    fileUrl: string,
    mimeType: string,
    prompt: string,
    currentChatId: number | null | undefined
  ) => {
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch('/api/files/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl, mimeType, prompt }),
        credentials: 'include',
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('File analysis failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          try {
            const event = JSON.parse(line.slice(6));
            
            if (event.type === 'chunk') {
              accumulatedContent += event.content;
              setStreamingContent(accumulatedContent);
            } else if (event.type === 'done') {
              accumulatedContent = event.content;
            } else if (event.type === 'error') {
              throw new Error(event.error);
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }

      // Finalize the analysis message
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: accumulatedContent,
        isFileAnalysis: true,
      };
      setLocalMessages(prev => [...prev, aiMsg]);
      setStreamingContent('');

      // Save to database
      if (isAuthenticated && currentChatId) {
        try {
          await createMessage.mutateAsync({
            chatId: currentChatId,
            role: 'assistant',
            content: accumulatedContent,
            hasArtifact: false,
          });
        } catch (error) {
          console.error('Failed to save analysis message:', error);
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('Analysis aborted');
        return;
      }
      throw error;
    }
  }, [isAuthenticated, createMessage]);

  // Code execution function
  const executeCode = async () => {
    if (!codeInput.trim() || isExecutingCode) return;
    
    setIsExecutingCode(true);
    setCodeOutput('');
    
    try {
      const response = await fetch('/api/code/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeInput, language: 'python' }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Execution failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let output = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          try {
            const event = JSON.parse(line.slice(6));
            
            if (event.type === 'output') {
              output += event.content;
              setCodeOutput(output);
            } else if (event.type === 'done') {
              output = event.output;
              setCodeOutput(output);
            } else if (event.type === 'error') {
              setCodeOutput(`Error: ${event.error}`);
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    } catch (error) {
      console.error('Code execution error:', error);
      setCodeOutput('Error al ejecutar el código. Por favor, intenta de nuevo.');
    } finally {
      setIsExecutingCode(false);
    }
  };

  const handleSend = async (text?: string, isResearch: boolean = false, isImageGen: boolean = false) => {
    const userText = text || input;
    if (!userText.trim() || isProcessing) return;
    
    setInput('');
    setIsProcessing(true);
    setStreamingContent('');

    // Add User Message locally first
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userText
    };
    setLocalMessages(prev => [...prev, tempUserMsg]);

    let currentChatId = chatId;

    // If authenticated and no chat exists, create one
    if (isAuthenticated && !currentChatId) {
      try {
        const newChat = await createChat.mutateAsync({ 
          title: userText.substring(0, 50) + (userText.length > 50 ? '...' : '')
        });
        if (newChat) {
          currentChatId = newChat.id;
        }
      } catch (error) {
        console.error('Failed to create chat:', error);
      }
    }

    // Save user message to database
    if (isAuthenticated && currentChatId) {
      try {
        await createMessage.mutateAsync({
          chatId: currentChatId,
          role: 'user',
          content: userText,
          hasArtifact: false,
        });
      } catch (error) {
        console.error('Failed to save user message:', error);
      }
    }

    // Check if we have an uploaded file to analyze
    const fileToAnalyze = uploadedFile;
    if (fileToAnalyze) {
      setUploadedFile(null); // Clear the uploaded file
    }

    try {
      if (fileToAnalyze) {
        // File analysis mode
        // Add "analyzing" message
        const analyzingMsg: Message = {
          id: `analyzing-${Date.now()}`,
          role: 'assistant',
          content: 'Analizando archivo...',
          isStreaming: true,
        };
        setLocalMessages(prev => [...prev, analyzingMsg]);
        
        await streamFileAnalysis(
          fileToAnalyze.url,
          fileToAnalyze.mimeType,
          userText,
          currentChatId
        );
        
        // Remove the analyzing message (streamFileAnalysis adds the final message)
        setLocalMessages(prev => prev.filter(m => m.id !== analyzingMsg.id));
      } else if (isImageGen || userText.toLowerCase().startsWith('genera una imagen')) {
        // Image generation mode
        const prompt = userText.toLowerCase().startsWith('genera una imagen de') 
          ? userText.substring(21).trim() 
          : userText.toLowerCase().startsWith('genera una imagen')
            ? userText.substring(18).trim()
            : userText;
        
        // Add "generating" message
        const generatingMsg: Message = {
          id: `gen-${Date.now()}`,
          role: 'assistant',
          content: 'Generando imagen...',
          isStreaming: true,
        };
        setLocalMessages(prev => [...prev, generatingMsg]);
        
        const result = await generateImageMutation.mutateAsync({ prompt });
        
        // Replace with final message including image
        setLocalMessages(prev => {
          const filtered = prev.filter(m => m.id !== generatingMsg.id);
          return [...filtered, {
            id: `img-${Date.now()}`,
            role: 'assistant',
            content: `He generado esta imagen basada en tu descripción: "${prompt}"`,
            isImage: true,
            imageUrl: result.url,
          }];
        });
        
        // Save to database
        if (isAuthenticated && currentChatId) {
          await createMessage.mutateAsync({
            chatId: currentChatId,
            role: 'assistant',
            content: `[Imagen generada: ${result.url}]`,
            hasArtifact: false,
          });
        }
      } else if (isResearch) {
        // Use deep research
        await streamResearch(userText, currentChatId);
      } else {
        // Build conversation history
        const conversationHistory = localMessages
          .map(m => ({ role: m.role, content: m.content }));
        
        // Add current message
        conversationHistory.push({ role: 'user', content: userText });

        // Stream the response
        await streamResponse(conversationHistory, currentChatId);
      }
    } catch (error) {
      console.error('AI Error:', error);
      setStreamingContent('');
      setResearchStatus(null);
      // Add error message
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
        hasArtifact: false
      };
      setLocalMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestionClick = (prompt: string, isResearch?: boolean, isImage?: boolean, isFileUpload?: boolean, isCodeExec?: boolean) => {
    if (isFileUpload) {
      // Trigger file input
      fileInputRef.current?.click();
      return;
    }
    if (isCodeExec) {
      // Open code editor
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
    <div className="flex flex-col h-full bg-white w-full">
      {/* Header - only show when in conversation */}
      {!isEmptyChat && (
        <div className="p-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center">
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
      
      {/* Messages Area or Welcome Screen */}
      <ScrollArea className="flex-1 h-0 min-h-0">
        {isEmptyChat ? (
          /* Welcome Screen with Suggestions */
          <div className="h-full flex flex-col items-center justify-center p-8">
            <div className="max-w-2xl w-full text-center space-y-8">
              {/* Logo/Title */}
              <div className="space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-900">¿En qué puedo ayudarte?</h1>
                <p className="text-gray-500 text-sm">Selecciona una sugerencia o escribe tu mensaje</p>
              </div>

              {/* Suggestion Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                      className={`group p-4 rounded-xl border border-gray-200 bg-white text-left transition-all duration-200 ${colorClasses[suggestion.color]}`}
                    >
                      <Icon className={`w-5 h-5 text-gray-400 mb-2 transition-colors ${iconColorClasses[suggestion.color]}`} />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{suggestion.label}</span>
                      {(suggestion as any).isResearch && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded-full font-medium">Deep</span>
                      )}
                      {(suggestion as any).isImage && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-pink-100 text-pink-600 rounded-full font-medium">AI</span>
                      )}
                      {(suggestion as any).isFileUpload && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-cyan-100 text-cyan-600 rounded-full font-medium">PDF</span>
                      )}
                      {(suggestion as any).isCodeExec && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded-full font-medium">Python</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Conversation Messages */
          <div className="p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6 pb-4">
              {messagesLoading && chatId ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  {localMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 message-bubble ${
                        msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          msg.role === 'user' 
                            ? 'bg-gray-900 text-white' 
                            : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
                        }`}
                      >
                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                      </div>
                      <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`p-4 rounded-2xl text-sm leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-gray-900 text-white rounded-tr-sm'
                              : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                          }`}
                        >
                          {msg.role === 'assistant' ? (
                            <div className="prose prose-sm max-w-none">
                              <Streamdown>{msg.content}</Streamdown>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                        
                        {/* Generated Image */}
                        {msg.isImage && msg.imageUrl && (
                          <ChatImagePreview src={msg.imageUrl} alt="Imagen generada por IA" />
                        )}
                        
                        {/* Research Sources */}
                        {msg.isResearch && msg.sources && msg.sources.length > 0 && (
                          <div className="w-full bg-gray-50 rounded-xl p-3 space-y-2">
                            <p className="text-xs font-semibold text-gray-600 flex items-center gap-1">
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
                                  className="flex items-center gap-2 text-xs text-gray-600 hover:text-indigo-600 transition-colors group"
                                >
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                  <span className="truncate group-hover:underline">{source.title || source.url}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Follow-up Questions */}
                        {msg.isResearch && msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {msg.followUpQuestions.map((q, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSend(q, true)}
                                className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition-colors"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {msg.hasArtifact && (
                          <button 
                            onClick={onOpenPreview}
                            className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-violet-300 transition-all group text-left w-64"
                          >
                            <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-violet-100 transition-colors">
                              <LayoutTemplate className="w-5 h-5 text-violet-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-900">Diseño Web</p>
                              <p className="text-[10px] text-gray-500 truncate">Click para ver</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
                          </button>
                        )}
                      </div>
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
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
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
              className="h-12 w-12 rounded-xl border-gray-200 hover:bg-gray-50"
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
              className="flex-1 h-12 px-4 rounded-xl border-gray-200 focus-visible:ring-violet-500"
              disabled={isProcessing}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-12 w-12 rounded-xl bg-gray-900 hover:bg-gray-800"
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
                <label className="text-xs font-medium text-gray-500 mb-2 block">Código</label>
                <textarea
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="# Escribe tu código Python aquí...\nprint('Hola mundo')\n\n# Ejemplo:\nfor i in range(5):\n    print(f'Número: {i}')"
                  className="w-full h-40 p-3 font-mono text-sm bg-gray-900 text-green-400 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                  disabled={isExecutingCode}
                />
              </div>
              
              {/* Output */}
              {(codeOutput || isExecutingCode) && (
                <div className="p-4 border-t border-gray-100">
                  <label className="text-xs font-medium text-gray-500 mb-2 block flex items-center gap-2">
                    Output
                    {isExecutingCode && <Loader2 className="w-3 h-3 animate-spin" />}
                  </label>
                  <pre className="w-full h-32 p-3 font-mono text-sm bg-gray-100 text-gray-800 rounded-lg overflow-auto whitespace-pre-wrap">
                    {codeOutput || 'Ejecutando...'}
                  </pre>
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
                Cerrar
              </Button>
              <Button
                onClick={executeCode}
                disabled={!codeInput.trim() || isExecutingCode}
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
