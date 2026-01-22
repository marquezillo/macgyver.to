import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, Settings, PanelLeftClose, Loader2, Trash2, Pencil, Check, X, Search,
  Star, Folder, FolderPlus, ChevronRight, ChevronDown, MoreHorizontal, Moon, Sun, Download, Brain, Boxes
} from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { isToday, isYesterday } from 'date-fns';
import { useTheme } from '@/contexts/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat?: () => void;
  onSelectChat?: (chatId: number) => void;
  activeChatId?: number | null;
}

// Helper to group chats by date
function groupChatsByDate(chats: { id: number; title: string; updatedAt: Date; isFavorite?: number; folderId?: number | null }[]) {
  const favorites: typeof chats = [];
  const today: typeof chats = [];
  const yesterday: typeof chats = [];
  const older: typeof chats = [];

  chats.forEach(chat => {
    if (chat.isFavorite) {
      favorites.push(chat);
    } else if (!chat.folderId) {
      const date = chat.updatedAt instanceof Date ? chat.updatedAt : new Date(chat.updatedAt);
      if (isToday(date)) {
        today.push(chat);
      } else if (isYesterday(date)) {
        yesterday.push(chat);
      } else {
        older.push(chat);
      }
    }
  });

  return { favorites, today, yesterday, older };
}

const FOLDER_COLORS = [
  { name: 'gray', bg: 'bg-gray-100', text: 'text-gray-600' },
  { name: 'blue', bg: 'bg-blue-100', text: 'text-blue-600' },
  { name: 'green', bg: 'bg-green-100', text: 'text-green-600' },
  { name: 'purple', bg: 'bg-purple-100', text: 'text-purple-600' },
  { name: 'orange', bg: 'bg-orange-100', text: 'text-orange-600' },
  { name: 'pink', bg: 'bg-pink-100', text: 'text-pink-600' },
];

export function Sidebar({ isOpen, onToggle, onNewChat, onSelectChat, activeChatId }: SidebarProps) {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, switchable } = useTheme();
  const utils = trpc.useUtils();
  
  // State for editing and search
  const [editingChatId, setEditingChatId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  const newFolderInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch chats from database - always try to fetch, will return empty if not authenticated
  const { data: chats, isLoading: chatsLoading } = trpc.chat.list.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Fetch folders
  const { data: folders } = trpc.folder.list.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
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

  // Toggle favorite mutation
  const toggleFavorite = trpc.chat.toggleFavorite.useMutation({
    onSuccess: () => {
      utils.chat.list.invalidate();
    },
  });

  // Move to folder mutation
  const moveToFolder = trpc.chat.moveToFolder.useMutation({
    onSuccess: () => {
      utils.chat.list.invalidate();
    },
  });

  // Create folder mutation
  const createFolder = trpc.folder.create.useMutation({
    onSuccess: () => {
      utils.folder.list.invalidate();
      setShowNewFolder(false);
      setNewFolderName('');
    },
  });

  // Delete folder mutation
  const deleteFolder = trpc.folder.delete.useMutation({
    onSuccess: () => {
      utils.folder.list.invalidate();
      utils.chat.list.invalidate();
    },
  });

  // Focus input when editing starts
  useEffect(() => {
    if (editingChatId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingChatId]);

  useEffect(() => {
    if (showNewFolder && newFolderInputRef.current) {
      newFolderInputRef.current.focus();
    }
  }, [showNewFolder]);

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

  const handleToggleFavorite = (e: React.MouseEvent, chatId: number, currentFavorite: number) => {
    e.stopPropagation();
    toggleFavorite.mutate({ chatId, isFavorite: !currentFavorite });
  };

  const handleMoveToFolder = (chatId: number, folderId: number | null) => {
    moveToFolder.mutate({ chatId, folderId });
  };

  const handleExportChat = async (chatId: number, format: 'markdown' | 'json') => {
    try {
      const result = await utils.client.export.conversation.query({ chatId, format });
      const blob = new Blob([result.content], { type: format === 'markdown' ? 'text/markdown' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder.mutate({ name: newFolderName.trim() });
    }
  };

  const handleDeleteFolder = (e: React.MouseEvent, folderId: number) => {
    e.stopPropagation();
    if (confirm('¿Eliminar esta carpeta? Los chats se moverán a la lista principal.')) {
      deleteFolder.mutate({ folderId });
    }
  };

  const toggleFolderExpand = (folderId: number) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  // Filter chats by search query
  const filteredChats = chats?.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grouped = filteredChats ? groupChatsByDate(filteredChats) : { favorites: [], today: [], yesterday: [], older: [] };

  // Get chats for a specific folder
  const getChatsForFolder = (folderId: number) => {
    return filteredChats?.filter(chat => chat.folderId === folderId) || [];
  };

  const renderChatItem = (chat: { id: number; title: string; updatedAt: Date; isFavorite?: number; folderId?: number | null }) => {
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
            {chat.isFavorite ? (
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-2 shrink-0" />
            ) : null}
            <span className="truncate flex-1 text-left">{chat.title}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-3 w-3 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={(e) => handleStartEdit(e as any, chat)}>
                  <Pencil className="h-3 w-3 mr-2" />
                  Renombrar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleToggleFavorite(e as any, chat.id, chat.isFavorite || 0)}>
                  <Star className={cn("h-3 w-3 mr-2", chat.isFavorite && "fill-yellow-500 text-yellow-500")} />
                  {chat.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                </DropdownMenuItem>
                
                {/* Move to folder submenu */}
                {folders && folders.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="font-medium text-xs text-gray-500" disabled>
                      Mover a carpeta
                    </DropdownMenuItem>
                    {chat.folderId && (
                      <DropdownMenuItem onClick={() => handleMoveToFolder(chat.id, null)}>
                        <X className="h-3 w-3 mr-2" />
                        Sin carpeta
                      </DropdownMenuItem>
                    )}
                    {folders.map(folder => (
                      <DropdownMenuItem 
                        key={folder.id}
                        onClick={() => handleMoveToFolder(chat.id, folder.id)}
                        disabled={chat.folderId === folder.id}
                      >
                        <Folder className={cn("h-3 w-3 mr-2", FOLDER_COLORS.find(c => c.name === folder.color)?.text || 'text-gray-500')} />
                        {folder.name}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem className="font-medium text-xs text-gray-500" disabled>
                  Exportar como
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportChat(chat.id, 'markdown')}>
                  <Download className="h-3 w-3 mr-2" />
                  Markdown (.md)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportChat(chat.id, 'json')}>
                  <Download className="h-3 w-3 mr-2" />
                  JSON (.json)
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => handleDeleteChat(e as any, chat.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    );
  };

  const renderFolderSection = (folder: { id: number; name: string; color: string | null }) => {
    const isExpanded = expandedFolders.has(folder.id);
    const folderChats = getChatsForFolder(folder.id);
    const colorClass = FOLDER_COLORS.find(c => c.name === folder.color) || FOLDER_COLORS[0];

    return (
      <div key={folder.id} className="mb-1">
        <div 
          className={cn(
            "flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer group",
            "hover:bg-gray-200/50"
          )}
          onClick={() => toggleFolderExpand(folder.id)}
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-gray-400" />
          ) : (
            <ChevronRight className="h-3 w-3 text-gray-400" />
          )}
          <Folder className={cn("h-3.5 w-3.5", colorClass.text)} />
          <span className="text-sm text-gray-600 flex-1 truncate">{folder.name}</span>
          <span className="text-xs text-gray-400">{folderChats.length}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover:opacity-100"
            onClick={(e) => handleDeleteFolder(e, folder.id)}
          >
            <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-500" />
          </Button>
        </div>
        {isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {folderChats.length === 0 ? (
              <p className="text-xs text-gray-400 px-2 py-1">Carpeta vacía</p>
            ) : (
              folderChats.map(renderChatItem)
            )}
          </div>
        )}
      </div>
    );
  };

  // Check if we have any chats to show
  const hasChats = chats && chats.length > 0;

  return (
    <div 
      className={cn(
        "flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out shrink-0",
        "w-[85vw] max-w-[280px] md:w-[260px]"
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

      {/* Search Bar - show if there are chats */}
      {hasChats && (
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
        {chatsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : !hasChats ? (
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
            {/* Favorites Section */}
            {grouped.favorites.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-400 px-2 mb-2 flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Favoritos
                </h3>
                <div className="space-y-1">
                  {grouped.favorites.map(renderChatItem)}
                </div>
              </div>
            )}

            {/* Folders Section */}
            {folders && folders.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-2 mb-2">
                  <h3 className="text-xs font-medium text-gray-400 flex items-center gap-1">
                    <Folder className="h-3 w-3" />
                    Carpetas
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => setShowNewFolder(true)}
                  >
                    <FolderPlus className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                  </Button>
                </div>
                {showNewFolder && (
                  <div className="flex items-center gap-1 px-2 mb-2">
                    <Input
                      ref={newFolderInputRef}
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Nombre de carpeta"
                      className="h-7 text-xs flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateFolder();
                        if (e.key === 'Escape') {
                          setShowNewFolder(false);
                          setNewFolderName('');
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleCreateFolder}
                      disabled={createFolder.isPending}
                    >
                      <Check className="h-3 w-3 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        setShowNewFolder(false);
                        setNewFolderName('');
                      }}
                    >
                      <X className="h-3 w-3 text-gray-400" />
                    </Button>
                  </div>
                )}
                {folders.map(renderFolderSection)}
              </div>
            )}

            {/* Show folder creation button if no folders yet but user is authenticated */}
            {isAuthenticated && (!folders || folders.length === 0) && (
              <div className="px-2">
                {showNewFolder ? (
                  <div className="flex items-center gap-1 mb-2">
                    <Input
                      ref={newFolderInputRef}
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Nombre de carpeta"
                      className="h-7 text-xs flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateFolder();
                        if (e.key === 'Escape') {
                          setShowNewFolder(false);
                          setNewFolderName('');
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleCreateFolder}
                      disabled={createFolder.isPending}
                    >
                      <Check className="h-3 w-3 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        setShowNewFolder(false);
                        setNewFolderName('');
                      }}
                    >
                      <X className="h-3 w-3 text-gray-400" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs text-gray-400 hover:text-gray-600"
                    onClick={() => setShowNewFolder(true)}
                  >
                    <FolderPlus className="h-3 w-3 mr-2" />
                    Crear carpeta
                  </Button>
                )}
              </div>
            )}

            {/* Today */}
            {grouped.today.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-400 px-2 mb-2">Hoy</h3>
                <div className="space-y-1">
                  {grouped.today.map(renderChatItem)}
                </div>
              </div>
            )}
            
            {/* Yesterday */}
            {grouped.yesterday.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-gray-400 px-2 mb-2">Ayer</h3>
                <div className="space-y-1">
                  {grouped.yesterday.map(renderChatItem)}
                </div>
              </div>
            )}

            {/* Older */}
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
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 mt-auto space-y-2">
        {/* Projects - always visible */}
        <Link href="/projects">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 px-2 h-9 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
          >
            <Boxes className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Proyectos</span>
          </Button>
        </Link>

        {/* Memory Settings - always visible */}
        <Link href="/settings/memory">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 px-2 h-9 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
          >
            <Brain className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Memoria</span>
          </Button>
        </Link>

        {/* Theme Toggle */}
        {switchable && (
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 px-2 h-9 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-yellow-500" />
            ) : (
              <Moon className="w-4 h-4 text-gray-500" />
            )}
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            </span>
          </Button>
        )}
        
        {/* User info - only show if authenticated */}
        {isAuthenticated && user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 px-2 h-12 hover:bg-gray-200/50 dark:hover:bg-gray-700/50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium text-xs">
                  {user.name?.substring(0, 2).toUpperCase() || 'US'}
                </div>
                <div className="flex flex-col items-start text-left flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate w-full">{user.name || 'Usuario'}</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">{user.role === 'admin' ? 'Admin' : 'Pro Plan'}</span>
                </div>
                <Settings className="w-4 h-4 text-gray-400 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <Link href="/settings">
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Configuración
                </DropdownMenuItem>
              </Link>
              <Link href="/account">
                <DropdownMenuItem>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Mi Cuenta
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => logout()}
                className="text-red-600 focus:text-red-600"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
