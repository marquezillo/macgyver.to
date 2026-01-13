import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Settings, PanelLeftClose, Loader2, Trash2, Pencil, Check, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import { isToday, isYesterday } from 'date-fns';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat?: () => void;
  onSelectChat?: (chatId: number) => void;
  activeChatId?: number | null;
}

// Helper to group chats by date
function groupChatsByDate(chats: { id: number; title: string; updatedAt: Date }[]) {
  const today: typeof chats = [];
  const yesterday: typeof chats = [];
  const older: typeof chats = [];

  chats.forEach(chat => {
    const date = chat.updatedAt instanceof Date ? chat.updatedAt : new Date(chat.updatedAt);
    if (isToday(date)) {
      today.push(chat);
    } else if (isYesterday(date)) {
      yesterday.push(chat);
    } else {
      older.push(chat);
    }
  });

  return { today, yesterday, older };
}

export function Sidebar({ isOpen, onToggle, onNewChat, onSelectChat, activeChatId }: SidebarProps) {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  
  // State for editing and search
  const [editingChatId, setEditingChatId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch chats from database
  const { data: chats, isLoading: chatsLoading } = trpc.chat.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Delete chat mutation
  const deleteChat = trpc.chat.delete.useMutation({
    onSuccess: () => {
      utils.chat.list.invalidate();
    },
  });

  // Update chat title mutation
  const updateTitle = trpc.chat.updateTitle.useMutation({
    onSuccess: () => {
      utils.chat.list.invalidate();
      setEditingChatId(null);
    },
  });

  // Focus input when editing starts
  useEffect(() => {
    if (editingChatId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingChatId]);

  const handleDeleteChat = (e: React.MouseEvent, chatId: number) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      deleteChat.mutate({ chatId });
    }
  };

  const handleStartEdit = (e: React.MouseEvent, chat: { id: number; title: string }) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingChatId && editTitle.trim()) {
      updateTitle.mutate({ chatId: editingChatId, title: editTitle.trim() });
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(null);
    setEditTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (editingChatId && editTitle.trim()) {
        updateTitle.mutate({ chatId: editingChatId, title: editTitle.trim() });
      }
    } else if (e.key === 'Escape') {
      setEditingChatId(null);
      setEditTitle('');
    }
  };

  // Filter chats by search query
  const filteredChats = chats?.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grouped = filteredChats ? groupChatsByDate(filteredChats) : { today: [], yesterday: [], older: [] };

  const renderChatItem = (chat: { id: number; title: string; updatedAt: Date }) => {
    const isEditing = editingChatId === chat.id;
    
    return (
      <div 
        key={chat.id}
        className={cn(
          "w-full flex items-center text-sm font-normal h-9 px-2 group relative rounded-md cursor-pointer",
          activeChatId === chat.id 
            ? "bg-gray-200/70 text-gray-900" 
            : "text-gray-600 hover:bg-gray-200/50"
        )}
        onClick={() => !isEditing && onSelectChat?.(chat.id)}
      >
        {isEditing ? (
          <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
            <Input
              ref={editInputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-6 text-xs px-1 flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={handleSaveEdit}
              disabled={updateTitle.isPending}
            >
              <Check className="h-3 w-3 text-green-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={handleCancelEdit}
            >
              <X className="h-3 w-3 text-gray-400" />
            </Button>
          </div>
        ) : (
          <>
            <span className="truncate flex-1 text-left">{chat.title}</span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => handleStartEdit(e, chat)}
              >
                <Pencil className="h-3 w-3 text-gray-400 hover:text-gray-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => handleDeleteChat(e, chat.id)}
              >
                <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-500" />
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div 
      className={cn(
        "flex flex-col h-full bg-gray-50 border-r border-gray-200 transition-all duration-300 ease-in-out shrink-0",
        isOpen ? "w-[260px]" : "w-0 overflow-hidden border-none"
      )}
    >
      {/* Header: New Chat */}
      <div className="p-3 mb-2">
        <div className="flex items-center justify-between mb-4 px-1">
           <span className="font-semibold text-sm text-gray-500">Manus</span>
           <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400" onClick={onToggle}>
             <PanelLeftClose className="h-4 w-4" />
           </Button>
        </div>
        <Button 
          className="w-full justify-start gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 shadow-sm" 
          variant="outline"
          onClick={onNewChat}
        >
          <Plus className="w-4 h-4" />
          Nuevo Chat
        </Button>
      </div>

      {/* Search Bar */}
      {isAuthenticated && chats && chats.length > 0 && (
        <div className="px-3 mb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar conversaciones..."
              className="h-8 pl-8 text-xs bg-white border-gray-200"
            />
          </div>
        </div>
      )}

      {/* History List */}
      <ScrollArea className="flex-1 px-3">
        {!isAuthenticated ? (
          <div className="text-center py-8 px-4">
            <p className="text-sm text-gray-500 mb-4">Inicia sesión para ver tu historial</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = getLoginUrl()}
            >
              Iniciar Sesión
            </Button>
          </div>
        ) : chatsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : chats && chats.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-sm text-gray-500">No tienes conversaciones aún</p>
            <p className="text-xs text-gray-400 mt-1">Crea un nuevo chat para empezar</p>
          </div>
        ) : filteredChats && filteredChats.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-sm text-gray-500">No se encontraron resultados</p>
            <p className="text-xs text-gray-400 mt-1">Intenta con otra búsqueda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.today.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-400 px-2 mb-2">Hoy</h3>
                <div className="space-y-1">
                  {grouped.today.map(renderChatItem)}
                </div>
              </div>
            )}
            
            {grouped.yesterday.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-400 px-2 mb-2">Ayer</h3>
                <div className="space-y-1">
                  {grouped.yesterday.map(renderChatItem)}
                </div>
              </div>
            )}

            {grouped.older.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-400 px-2 mb-2">Anteriormente</h3>
                <div className="space-y-1">
                  {grouped.older.map(renderChatItem)}
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Footer: User Profile */}
      <div className="p-3 border-t border-gray-200 mt-auto">
        {isAuthenticated && user ? (
          <Button variant="ghost" className="w-full justify-start gap-2 px-2 h-12 hover:bg-gray-200/50">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium text-xs">
              {user.name?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="flex flex-col items-start text-left flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-700 truncate w-full">{user.name || 'Usuario'}</span>
              <span className="text-[10px] text-gray-500">{user.role === 'admin' ? 'Admin' : 'Pro Plan'}</span>
            </div>
            <Settings className="w-4 h-4 text-gray-400 shrink-0" />
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.href = getLoginUrl()}
          >
            Iniciar Sesión
          </Button>
        )}
      </div>
    </div>
  );
}
