import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Sparkles, Loader2, LayoutTemplate, ArrowRight } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';

interface Message {
  id: string | number;
  role: 'user' | 'assistant';
  content: string;
  hasArtifact?: boolean;
}

interface ChatInterfaceProps {
  onOpenPreview?: () => void;
  isPreviewOpen?: boolean;
  chatId?: number | null;
  onChatCreated?: (chatId: number) => void;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: '¡Hola! Soy tu AI Designer. ¿Qué vamos a construir hoy? \n\nPuedes decirme:\n- "Crea una landing para una app de fitness"\n- "Añade una sección de precios"\n- "Cambia el título del hero a \'Entrena duro\'"'
};

export function ChatInterface({ onOpenPreview, isPreviewOpen, chatId, onChatCreated }: ChatInterfaceProps) {
  const { addSection, sections, setSections } = useEditorStore();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  
  const [localMessages, setLocalMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const updateChatTitle = trpc.chat.updateTitle.useMutation({
    onSuccess: () => {
      utils.chat.list.invalidate();
    },
  });

  const updateChatArtifact = trpc.chat.updateArtifact.useMutation();

  // Sync database messages to local state
  useEffect(() => {
    if (dbMessages && dbMessages.length > 0) {
      const mapped: Message[] = dbMessages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        hasArtifact: m.hasArtifact === 1,
      }));
      setLocalMessages(mapped);
    } else if (!chatId) {
      // Reset to welcome message for new chat
      setLocalMessages([WELCOME_MESSAGE]);
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
      // Clear sections for new chat
      setSections([]);
    }
  }, [chatData, chatId, setSections]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localMessages]);

  const processCommand = async (text: string) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('landing') || lowerText.includes('crea')) {
      return {
        reply: "¡Claro! He generado una estructura base para tu landing page con Hero, Features y Testimonios.",
        hasArtifact: true,
        action: () => {
          setSections([
            { id: 'hero-1', type: 'hero', variant: 'centered', content: { title: 'Tu Nueva Landing Page', subtitle: 'Generada automáticamente con IA', ctaText: 'Empezar' } },
            { id: 'features-1', type: 'features', variant: 'grid', content: { title: 'Características Principales' } },
            { id: 'testimonials-1', type: 'testimonials', variant: 'cards', content: { title: 'Lo que dicen nuestros clientes' } }
          ]);
        }
      };
    }
    
    if (lowerText.includes('precio') || lowerText.includes('pricing')) {
      return {
        reply: "He añadido una sección de precios a tu landing.",
        hasArtifact: true,
        action: () => addSection('pricing')
      };
    }

    if (lowerText.includes('hero')) {
       return {
        reply: "He añadido una nueva sección Hero al principio.",
        hasArtifact: true,
        action: () => addSection('hero')
      };
    }

    if (lowerText.includes('faq') || lowerText.includes('preguntas')) {
       return {
        reply: "Sección de Preguntas Frecuentes añadida.",
        hasArtifact: true,
        action: () => addSection('faq')
      };
    }

    return {
      reply: "Entendido. Aunque por ahora soy una demo, pronto podré realizar cambios más complejos. Prueba pidiéndome añadir secciones como 'precios' o 'faq'.",
      hasArtifact: false,
      action: () => {}
    };
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    
    const userText = input;
    setInput('');
    setIsProcessing(true);

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

    // Process command and generate response
    setTimeout(async () => {
      const result = await processCommand(userText);
      
      // Execute Action (Modify State)
      if (result.action) {
        result.action();
      }

      // Add AI Response locally
      const aiMsg: Message = {
        id: `temp-ai-${Date.now()}`,
        role: 'assistant',
        content: result.reply,
        hasArtifact: result.hasArtifact
      };
      setLocalMessages(prev => [...prev, aiMsg]);

      // Save AI message to database
      if (isAuthenticated && currentChatId) {
        try {
          await createMessage.mutateAsync({
            chatId: currentChatId,
            role: 'assistant',
            content: result.reply,
            hasArtifact: result.hasArtifact,
          });

          // Update chat artifact data if we generated something
          if (result.hasArtifact) {
            // Get current sections from store
            const currentSections = useEditorStore.getState().sections;
            await updateChatArtifact.mutateAsync({
              chatId: currentChatId,
              artifactData: { sections: currentSections },
            });
          }
        } catch (error) {
          console.error('Failed to save AI message:', error);
        }
      }
      
      setIsProcessing(false);
    }, 1200);
  };

  const displayMessages = localMessages;

  return (
    <div className="flex flex-col h-full bg-white w-full">
      {/* Header - Minimalist */}
      <div className="p-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center">
        <h2 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          AI Designer
        </h2>
        {!isPreviewOpen && sections.length > 0 && (
           <Button variant="outline" size="sm" onClick={onOpenPreview} className="h-8 gap-2 text-xs">
             <LayoutTemplate className="w-3 h-3" />
             Ver Diseño
           </Button>
        )}
      </div>
      
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-8 pb-4">
          {messagesLoading && chatId ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : (
            displayMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${
                    msg.role === 'user' 
                      ? 'bg-gray-900 border-gray-900 text-white' 
                      : 'bg-white border-gray-200 text-indigo-600'
                  }`}
                >
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
                </div>
                <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-gray-100 text-gray-900 rounded-tr-none'
                        : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  
                  {msg.hasArtifact && (
                    <button 
                      onClick={onOpenPreview}
                      className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group text-left w-64"
                    >
                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                        <LayoutTemplate className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900">Landing Page</p>
                        <p className="text-[10px] text-gray-500 truncate">Click to view generated design</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          
          {isProcessing && (
            <div className="flex gap-4 max-w-2xl mx-auto">
               <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                 <Bot size={16} className="text-indigo-600" />
               </div>
               <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                 <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                 <span className="text-xs text-gray-400">Generando diseño...</span>
               </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-white">
        <div className="max-w-2xl mx-auto relative">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex items-end shadow-lg rounded-2xl border border-gray-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-100 transition-all"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe tu landing page..."
              className="flex-1 min-h-[56px] py-4 pl-4 pr-12 border-none focus-visible:ring-0 text-base bg-transparent"
              disabled={isProcessing}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-2 bottom-2 h-10 w-10 rounded-xl bg-gray-900 hover:bg-black transition-colors"
              disabled={isProcessing || !input.trim()}
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </form>
          <div className="mt-3 text-center">
             <p className="text-[10px] text-gray-400">AI Designer puede cometer errores. Revisa el diseño generado.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
