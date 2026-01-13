import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2, LayoutTemplate, ArrowRight } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Streamdown } from 'streamdown';

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
  content: '¡Hola! ¿En qué puedo ayudarte hoy?'
};

export function ChatInterface({ onOpenPreview, isPreviewOpen, chatId, onChatCreated }: ChatInterfaceProps) {
  const { sections, setSections } = useEditorStore();
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

  const updateChatArtifact = trpc.chat.updateArtifact.useMutation();

  // LLM mutation
  const aiChat = trpc.ai.chat.useMutation();

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
      setSections([]);
    }
  }, [chatData, chatId, setSections]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localMessages]);

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

    try {
      // Build conversation history (excluding welcome message)
      const conversationHistory = localMessages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));
      
      // Add current message
      conversationHistory.push({ role: 'user', content: userText });

      // Call real LLM
      const result = await aiChat.mutateAsync({ messages: conversationHistory });

      // If there's artifact data (landing page), update the editor
      if (result.hasArtifact && result.artifactData) {
        const artifact = result.artifactData as { sections?: unknown[] };
        if (artifact.sections) {
          setSections(artifact.sections as any);
        }
      }

      // Add AI Response locally
      const aiMsg: Message = {
        id: `temp-ai-${Date.now()}`,
        role: 'assistant',
        content: result.content,
        hasArtifact: result.hasArtifact
      };
      setLocalMessages(prev => [...prev, aiMsg]);

      // Save AI message to database
      if (isAuthenticated && currentChatId) {
        try {
          await createMessage.mutateAsync({
            chatId: currentChatId,
            role: 'assistant',
            content: result.content,
            hasArtifact: result.hasArtifact,
          });

          // Update chat artifact data if we generated something
          if (result.hasArtifact && result.artifactData) {
            await updateChatArtifact.mutateAsync({
              chatId: currentChatId,
              artifactData: result.artifactData,
            });
          }
        } catch (error) {
          console.error('Failed to save AI message:', error);
        }
      }
    } catch (error) {
      console.error('AI Error:', error);
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

  const displayMessages = localMessages;

  return (
    <div className="flex flex-col h-full bg-white w-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center">
        <h2 className="font-semibold text-sm text-gray-700">
          Nueva conversación
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
        <div className="max-w-2xl mx-auto space-y-6 pb-4">
          {messagesLoading && chatId ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : (
            displayMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
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
                      <Streamdown>{msg.content}</Streamdown>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                  
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
            ))
          )}
          
          {isProcessing && (
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
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 h-12 px-4 rounded-xl border-gray-200 focus-visible:ring-violet-500"
              disabled={isProcessing}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="h-12 w-12 rounded-xl bg-gray-900 hover:bg-gray-800"
              disabled={isProcessing || !input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
