import { useState, useEffect } from 'react';
import { EditorHeader } from '@/components/EditorHeader';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { Canvas } from '@/components/Canvas';
import { ChatInterface } from '@/components/ChatInterface';
import { Sidebar } from '@/components/Sidebar';
import { cn } from '@/lib/utils';
import { PanelRightClose, PanelLeftOpen, X, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/store/editorStore';

export default function Editor() {
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showSidebar, setShowSidebar] = useState(false); // Start closed on mobile
  const [showPreview, setShowPreview] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [chatKey, setChatKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const { sections, setSections } = useEditorStore();
  const [prevSectionsLen, setPrevSectionsLen] = useState(sections.length);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-show sidebar on desktop
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (sections.length > prevSectionsLen && !showPreview) {
      const timer = setTimeout(() => {
        setShowPreview(true);
      }, 500);
      return () => clearTimeout(timer);
    }
    setPrevSectionsLen(sections.length);
  }, [sections.length, prevSectionsLen, showPreview]);

  const handleNewChat = () => {
    setActiveChatId(null);
    setChatKey(prev => prev + 1);
    setSections([]);
    setShowPreview(false);
    // Close sidebar on mobile after action
    if (isMobile) setShowSidebar(false);
  };

  const handleSelectChat = (chatId: number) => {
    setActiveChatId(chatId);
    setChatKey(prev => prev + 1);
    setShowPreview(false);
    // Close sidebar on mobile after selection
    if (isMobile) setShowSidebar(false);
  };

  const handleChatCreated = (chatId: number) => {
    setActiveChatId(chatId);
  };

  const handleOpenPreview = () => {
    setShowPreview(true);
    // On mobile, preview takes full screen
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  return (
    <div className="h-[100dvh] flex bg-white overflow-hidden font-sans">
      {/* Mobile Overlay for Sidebar */}
      {isMobile && showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Column 1: Sidebar (History) */}
      <div className={cn(
        "fixed md:relative z-50 md:z-auto h-full transition-transform duration-300 ease-in-out",
        isMobile && !showSidebar && "-translate-x-full",
        isMobile && showSidebar && "translate-x-0"
      )}>
        <Sidebar 
          isOpen={true} 
          onToggle={() => setShowSidebar(false)} 
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          activeChatId={activeChatId}
        />
      </div>

      {/* Column 2: Main Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col h-full relative z-0 min-w-0",
        // On mobile when preview is open, hide chat
        isMobile && showPreview && "hidden"
      )}>
        {/* Mobile Header with Menu Button */}
        <div className="flex items-center h-14 px-4 border-b border-gray-200 md:hidden shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowSidebar(true)} 
            className="text-gray-600 hover:text-gray-900 mr-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-gray-900">Manus</span>
        </div>

        {/* Desktop: Show sidebar toggle when sidebar is hidden */}
        {!isMobile && !showSidebar && (
          <div className="absolute top-4 left-4 z-20">
            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(true)} className="text-gray-400 hover:text-gray-600">
              <PanelLeftOpen className="h-5 w-5" />
            </Button>
          </div>
        )}

        <div className="flex-1 flex justify-center h-full overflow-hidden">
           <div className={cn(
             "h-full transition-all duration-500 ease-in-out flex flex-col w-full",
             !isMobile && showPreview ? "max-w-none border-r border-gray-200" : "max-w-3xl"
           )}>
             <ChatInterface 
               key={chatKey}
               chatId={activeChatId}
               onOpenPreview={handleOpenPreview} 
               isPreviewOpen={showPreview}
               onChatCreated={handleChatCreated}
             />
           </div>
        </div>
      </div>

      {/* Column 3: Artifacts / Preview Drawer (Collapsible) */}
      <div 
        className={cn(
          "h-full bg-gray-50 border-l border-gray-200 shadow-xl transition-all duration-500 ease-in-out flex flex-col",
          // Mobile: full screen overlay
          isMobile && showPreview && "fixed inset-0 z-50 w-full",
          isMobile && !showPreview && "hidden",
          // Desktop: side panel
          !isMobile && showPreview && "w-[60%] lg:w-[55%] shrink-0",
          !isMobile && !showPreview && "w-0 overflow-hidden border-none"
        )}
      >
        {/* Preview Header */}
        <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 shrink-0">
           <div className="flex items-center gap-2">
             <Button 
               variant="ghost" 
               size="icon" 
               onClick={handleClosePreview}
               className="text-gray-500 hover:text-gray-900"
               title="Close Preview"
             >
               {isMobile ? <X className="h-5 w-5" /> : <PanelRightClose className="h-5 w-5" />}
             </Button>
             <span className="font-medium text-sm text-gray-600">Vista previa</span>
           </div>
           
           <div className="flex items-center gap-2">
             <EditorHeader viewMode={viewMode} setViewMode={setViewMode} compact={true} />
             {!isMobile && (
               <>
                 <div className="h-4 w-px bg-gray-200 mx-2" />
                 <Button 
                   variant="ghost" 
                   size="sm"
                   onClick={() => setShowProperties(!showProperties)}
                   className={cn("text-xs font-medium", showProperties ? "bg-blue-50 text-blue-600" : "text-gray-600")}
                 >
                   {showProperties ? "Hide Edit" : "Edit"}
                 </Button>
               </>
             )}
           </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col items-center bg-gray-100/50 overflow-hidden relative">
            <div 
              className={cn(
                "flex-1 w-full transition-all duration-300 ease-in-out overflow-y-auto py-4 md:py-8 px-2 md:px-6",
                viewMode === 'tablet' && "max-w-[768px] mx-auto",
                viewMode === 'mobile' && "max-w-[375px] mx-auto"
              )}
            >
              <div className="bg-white shadow-sm min-h-full rounded-lg overflow-hidden border border-gray-200/60 ring-1 ring-gray-900/5">
                <Canvas />
              </div>
            </div>
          </div>

          {/* Collapsible Properties Panel (Nested in Preview) - Desktop only */}
          {!isMobile && showProperties && (
            <div className="w-[280px] border-l border-gray-200 bg-white h-full overflow-y-auto shrink-0 animate-in slide-in-from-right-5 duration-200 absolute right-0 top-0 bottom-0 shadow-lg z-30">
              <div className="flex items-center justify-between p-3 border-b">
                 <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Properties</span>
                 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowProperties(false)}>
                   <X className="h-3 w-3" />
                 </Button>
              </div>
              <PropertiesPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
