import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, Settings, PanelLeftClose, Loader2, Trash2, Pencil, Check, X, Search,
  Star, FolderKanban, FolderPlus, ChevronRight, ChevronDown, MoreHorizontal, Moon, Sun, Download, Brain, Boxes, Globe,
  ExternalLink, Share2
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

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

const PROJECT_COLORS = [
  { name: 'gray', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  { name: 'blue', bg: 'bg-blue-100', text: 'text-blue-600', dot: 'bg-blue-500' },
  { name: 'green', bg: 'bg-green-100', text: 'text-green-600', dot: 'bg-green-500' },
  { name: 'purple', bg: 'bg-purple-100', text: 'text-purple-600', dot: 'bg-purple-500' },
  { name: 'orange', bg: 'bg-orange-100', text: 'text-orange-600', dot: 'bg-orange-500' },
  { name: 'pink', bg: 'bg-pink-100', text: 'text-pink-600', dot: 'bg-pink-500' },
];

export function Sidebar({ isOpen, onToggle, onNewChat, onSelectChat, activeChatId }: SidebarProps) {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, switchable } = useTheme();
  const utils = trpc.useUtils();
  
  // State for editing and search
  const [editingChatId, setEditingChatId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [showProjectsSection, setShowProjectsSection] = useState(true);
  const editInputRef = useRef<HTMLInputElement>(null);
  const newProjectInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch chats from database - always try to fetch, will return empty if not authenticated
  const { data: chats, isLoading: chatsLoading } = trpc.chat.list.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Fetch folders (now called projects)
  const { data: projects } = trpc.folder.list.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Delete chat mutation
  const deleteChat = trpc.chat.delete.useMutation({
    onSuccess: () => {
      utils.chat.list.invalidate();
      toast.success('Conversación eliminada');
    },
  });

  // Update chat title mutation
  const updateTitle = trpc.chat.updateTitle.useMutation({
    onSuccess: () => {
      utils.chat.list.invalidate();
      setEditingChatId(null);
      toast.success('Nombre actualizado');
    },
  });

  // Toggle favorite mutation
  const toggleFavorite = trpc.chat.toggleFavorite.useMutation({
    onSuccess: (_, variables) => {
      utils.chat.list.invalidate();
      toast.success(variables.isFavorite ? 'Añadido a favoritos' : 'Quitado de favoritos');
    },
  });

  // Move to project mutation
  const moveToProject = trpc.chat.moveToFolder.useMutation({
    onSuccess: () => {
      utils.chat.list.invalidate();
      toast.success('Movido al proyecto');
    },
  });

  // Create project mutation
  const createProject = trpc.folder.create.useMutation({
    onSuccess: () => {
      utils.folder.list.invalidate();
      setShowNewProject(false);
      setNewProjectName('');
      toast.success('Proyecto creado');
    },
  });

  // Delete project mutation
  const deleteProject = trpc.folder.delete.useMutation({
    onSuccess: () => {
      utils.folder.list.invalidate();
      utils.chat.list.invalidate();
      toast.success('Proyecto eliminado');
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
    if (showNewProject && newProjectInputRef.current) {
      newProjectInputRef.current.focus();
    }
  }, [showNewProject]);

  const handleDeleteChat = (chatId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      deleteChat.mutate({ chatId });
    }
  };

  const handleStartEdit = (chat: { id: number; title: string }) => {
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

  const handleToggleFavorite = (chatId: number, currentFavorite: number) => {
    toggleFavorite.mutate({ chatId, isFavorite: !currentFavorite });
  };

  const handleMoveToProject = (chatId: number, projectId: number | null) => {
    moveToProject.mutate({ chatId, folderId: projectId });
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
      toast.success('Conversación exportada');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Error al exportar');
    }
  };

  const handleShareChat = (chatId: number) => {
    // For now, just copy a link - can be expanded later
    const url = `${window.location.origin}/?chat=${chatId}`;
    navigator.clipboard.writeText(url);
    toast.success('Enlace copiado al portapapeles');
  };

  const handleOpenInNewTab = (chatId: number) => {
    window.open(`${window.location.origin}/?chat=${chatId}`, '_blank');
  };

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject.mutate({ name: newProjectName.trim() });
    }
  };

  const handleDeleteProject = (e: React.MouseEvent, projectId: number) => {
    e.stopPropagation();
    if (confirm('¿Eliminar este proyecto? Las conversaciones se moverán a la lista principal.')) {
      deleteProject.mutate({ folderId: projectId });
    }
  };

  const toggleProjectExpand = (projectId: number) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  // Filter chats by search query
  const filteredChats = chats?.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedAll = filteredChats ? groupChatsByDate(filteredChats) : { favorites: [], today: [], yesterday: [], older: [] };
  
  // State to show all conversations or limit to 20
  const [showAllConversations, setShowAllConversations] = useState(false);
  
  // Limit conversations to 20 total (excluding favorites and projects) unless "show all" is clicked
  const MAX_VISIBLE_CONVERSATIONS = 20;
  
  const { grouped, totalConversations, hasMoreConversations } = useMemo(() => {
    const allConversations = [
      ...groupedAll.today,
      ...groupedAll.yesterday,
      ...groupedAll.older
    ];
    const total = allConversations.length;
    const hasMore = total > MAX_VISIBLE_CONVERSATIONS && !showAllConversations;
    
    if (showAllConversations || total <= MAX_VISIBLE_CONVERSATIONS) {
      return { grouped: groupedAll, totalConversations: total, hasMoreConversations: false };
    }
    
    // Limit to 20 conversations distributed across today, yesterday, older
    let remaining = MAX_VISIBLE_CONVERSATIONS;
    const limitedToday = groupedAll.today.slice(0, remaining);
    remaining -= limitedToday.length;
    const limitedYesterday = remaining > 0 ? groupedAll.yesterday.slice(0, remaining) : [];
    remaining -= limitedYesterday.length;
    const limitedOlder = remaining > 0 ? groupedAll.older.slice(0, remaining) : [];
    
    return {
      grouped: {
        favorites: groupedAll.favorites,
        today: limitedToday,
        yesterday: limitedYesterday,
        older: limitedOlder
      },
      totalConversations: total,
      hasMoreConversations: hasMore
    };
  }, [groupedAll, showAllConversations]);

  // Get chats for a specific project
  const getChatsForProject = (projectId: number) => {
    return filteredChats?.filter(chat => chat.folderId === projectId) || [];
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
                  className="h-6 w-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                {/* Share */}
                <DropdownMenuItem onClick={() => handleShareChat(chat.id)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </DropdownMenuItem>
                
                {/* Rename */}
                <DropdownMenuItem onClick={() => handleStartEdit(chat)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Renombrar
                </DropdownMenuItem>
                
                {/* Add to favorites */}
                <DropdownMenuItem onClick={() => handleToggleFavorite(chat.id, chat.isFavorite || 0)}>
                  <Star className={cn("h-4 w-4 mr-2", chat.isFavorite && "fill-yellow-500 text-yellow-500")} />
                  {chat.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                </DropdownMenuItem>
                
                {/* Open in new tab */}
                <DropdownMenuItem onClick={() => handleOpenInNewTab(chat.id)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir en una nueva pestaña
                </DropdownMenuItem>
                
                {/* Move to project - submenu */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <FolderKanban className="h-4 w-4 mr-2" />
                    Mover a proyecto
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="w-48">
                      {chat.folderId && (
                        <DropdownMenuItem onClick={() => handleMoveToProject(chat.id, null)}>
                          <X className="h-4 w-4 mr-2" />
                          Sin proyecto
                        </DropdownMenuItem>
                      )}
                      {projects && projects.length > 0 ? (
                        projects.map(project => {
                          const colorClass = PROJECT_COLORS.find(c => c.name === project.color) || PROJECT_COLORS[0];
                          return (
                            <DropdownMenuItem 
                              key={project.id}
                              onClick={() => handleMoveToProject(chat.id, project.id)}
                              disabled={chat.folderId === project.id}
                            >
                              <div className={cn("h-2 w-2 rounded-full mr-2", colorClass.dot)} />
                              {project.name}
                            </DropdownMenuItem>
                          );
                        })
                      ) : (
                        <DropdownMenuItem disabled className="text-gray-400 text-xs">
                          No hay proyectos
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setShowNewProject(true)}>
                        <FolderPlus className="h-4 w-4 mr-2" />
                        Crear proyecto
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                
                <DropdownMenuSeparator />
                
                {/* Delete - in red */}
                <DropdownMenuItem 
                  onClick={() => handleDeleteChat(chat.id)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    );
  };

  const renderProjectSection = (project: { id: number; name: string; color: string | null }) => {
    const isExpanded = expandedProjects.has(project.id);
    const projectChats = getChatsForProject(project.id);
    const colorClass = PROJECT_COLORS.find(c => c.name === project.color) || PROJECT_COLORS[0];

    return (
      <div key={project.id} className="mb-1">
        <div 
          className={cn(
            "flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer group",
            "hover:bg-gray-200/50"
          )}
          onClick={() => toggleProjectExpand(project.id)}
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-gray-400 shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 text-gray-400 shrink-0" />
          )}
          <div className={cn("h-2 w-2 rounded-full shrink-0", colorClass.dot)} />
          <span className="text-sm text-gray-600 flex-1 truncate">{project.name}</span>
          <span className="text-xs text-gray-400">{projectChats.length}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover:opacity-100"
            onClick={(e) => handleDeleteProject(e, project.id)}
          >
            <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-500" />
          </Button>
        </div>
        {isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {projectChats.length === 0 ? (
              <p className="text-xs text-gray-400 px-2 py-1">Proyecto vacío</p>
            ) : (
              projectChats.map(renderChatItem)
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

      {/* Projects Section - Collapsible */}
      {isAuthenticated && (
        <div className="px-3 mb-2">
          <div 
            className="flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-200/50"
            onClick={() => setShowProjectsSection(!showProjectsSection)}
          >
            <div className="flex items-center gap-1.5">
              {showProjectsSection ? (
                <ChevronDown className="h-3 w-3 text-gray-400" />
              ) : (
                <ChevronRight className="h-3 w-3 text-gray-400" />
              )}
              <FolderKanban className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs font-medium text-gray-500">Proyectos</span>
            </div>
            <span className="text-xs text-gray-400">{projects?.length || 0}</span>
          </div>
          
          {showProjectsSection && (
            <div className="mt-1 ml-2">
              {/* New Project Input */}
              {showNewProject && (
                <div className="flex items-center gap-1 px-2 mb-2">
                  <Input
                    ref={newProjectInputRef}
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Nombre del proyecto"
                    className="h-7 text-xs flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateProject();
                      if (e.key === 'Escape') {
                        setShowNewProject(false);
                        setNewProjectName('');
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleCreateProject}
                    disabled={createProject.isPending}
                  >
                    <Check className="h-3 w-3 text-green-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      setShowNewProject(false);
                      setNewProjectName('');
                    }}
                  >
                    <X className="h-3 w-3 text-gray-400" />
                  </Button>
                </div>
              )}
              
              {/* Project List */}
              {projects && projects.length > 0 ? (
                projects.map(renderProjectSection)
              ) : !showNewProject && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs text-gray-400 hover:text-gray-600 h-8"
                  onClick={() => setShowNewProject(true)}
                >
                  <FolderPlus className="h-3 w-3 mr-2" />
                  Crear proyecto
                </Button>
              )}
              
              {/* Add Project Button when projects exist */}
              {projects && projects.length > 0 && !showNewProject && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs text-gray-400 hover:text-gray-600 h-7 mt-1"
                  onClick={() => setShowNewProject(true)}
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Añadir proyecto
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* History List - with proper scroll */}
      <ScrollArea className="flex-1 px-3" style={{ minHeight: 0, maxHeight: 'calc(100vh - 400px)' }}>
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
            
            {/* View All Conversations Link */}
            {hasMoreConversations && (
              <div className="pt-2 pb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                  onClick={() => setShowAllConversations(true)}
                >
                  Ver todas las conversaciones ({totalConversations})
                </Button>
              </div>
            )}
            
            {/* Collapse button when showing all */}
            {showAllConversations && totalConversations > MAX_VISIBLE_CONVERSATIONS && (
              <div className="pt-2 pb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-xs text-gray-400 hover:text-gray-600"
                  onClick={() => setShowAllConversations(false)}
                >
                  Mostrar menos
                </Button>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Footer: Navigation Links */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 mt-auto space-y-2">
        {/* My Landings - always visible */}
        <Link href="/my-landings">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 px-2 h-9 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
          >
            <Globe className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Mis Landings</span>
          </Button>
        </Link>

        {/* Projects - always visible */}
        <Link href="/projects">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 px-2 h-9 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
          >
            <Boxes className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Mis Apps</span>
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
              {user.role === 'admin' && (
                <>
                  <DropdownMenuSeparator />
                  <Link href="/admin">
                    <DropdownMenuItem className="text-purple-600 focus:text-purple-600">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Panel de Admin
                    </DropdownMenuItem>
                  </Link>
                </>
              )}
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
