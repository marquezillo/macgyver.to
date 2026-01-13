import { useState, useEffect } from 'react';
import { EditorHeader } from '@/components/EditorHeader';
import { PropertiesPanel } from '@/components/PropertiesPanel';
import { Canvas } from '@/components/Canvas';
import { ChatInterface } from '@/components/ChatInterface';
import { Sidebar } from '@/components/Sidebar';
import { cn } from '@/lib/utils';
import { PanelRightClose, PanelRightOpen, X, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/store/editorStore';

export default function Editor() {
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [chatKey, setChatKey] = useState(0);
  
  const { sections, setSections } = useEditorStore();
  const [prevSectionsLen, setPrevSectionsLen] = useState(sections.length);

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
  };

  const handleSelectChat = (chatId: number) => {
    setActiveChatId(chatId);
    setChatKey(prev => prev + 1);
    setShowPreview(false);
  };

  const handleChatCreated = (chatId: number) => {
    setActiveChatId(chatId);
  };

  return (
    <div className="h-screen flex bg-white overflow-hidden font-sans">
      {/* Column 1: Sidebar (History) */}
      <Sidebar 
        isOpen={showSidebar} 
        onToggle={() => setShowSidebar(false)} 
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        activeChatId={activeChatId}
      />

      {/* Column 2: Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative z-0 min-w-0">
        {!showSidebar && (
          <div className="absolute top-4 left-4 z-20">
            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(true)} className="text-gray-400 hover:text-gray-600">
              <PanelLeftOpen className="h-5 w-5" />
            </Button>
          </div>
        )}

        <div className="flex-1 flex justify-center h-full">
           <div className={cn(
             "h-full transition-all duration-500 ease-in-out flex flex-col",
             showPreview ? "w-full max-w-none border-r border-gray-200" : "w-full max-w-3xl"
           )}>
             <ChatInterface 
               key={chatKey}
               chatId={activeChatId}
               onOpenPreview={() => setShowPreview(true)} 
               isPreviewOpen={showPreview}
               onChatCreated={handleChatCreated}
             />
           </div>
        </div>
      </div>

      {/* Column 3: Artifacts / Preview Drawer (Collapsible) */}
      <div 
        className={cn(
          "shrink-0 h-full bg-gray-50 border-l border-gray-200 shadow-xl z-20 transition-all duration-500 ease-in-out flex flex-col absolute right-0 top-0 bottom-0 md:relative",
          showPreview ? "w-full md:w-[60%] lg:w-[55%]" : "w-0 translate-x-full md:translate-x-0 md:w-0 overflow-hidden border-none"
        )}
      >
        {/* Preview Header */}
        <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 shrink-0">
           <div className="flex items-center gap-2">
             <Button 
               variant="ghost" 
               size="icon" 
               onClick={() => setShowPreview(false)}
               className="text-gray-500 hover:text-gray-900"
               title="Close Preview"
             >
               <PanelRightClose className="h-5 w-5" />
             </Button>
             <span className="font-medium text-sm text-gray-600">Vista previa</span>
           </div>
           
           <div className="flex items-center gap-2">
             <EditorHeader viewMode={viewMode} setViewMode={setViewMode} compact={true} />
             <div className="h-4 w-px bg-gray-200 mx-2" />
             <Button 
               variant="ghost" 
               size="sm"
               onClick={() => setShowProperties(!showProperties)}
               className={cn("text-xs font-medium", showProperties ? "bg-blue-50 text-blue-600" : "text-gray-600")}
             >
               {showProperties ? "Hide Edit" : "Edit"}
             </Button>
           </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col items-center bg-gray-100/50 overflow-hidden relative">
            <div 
              className={cn(
                "flex-1 w-full transition-all duration-300 ease-in-out overflow-y-auto py-8 px-6",
                viewMode === 'tablet' && "max-w-[768px] mx-auto",
                viewMode === 'mobile' && "max-w-[375px] mx-auto"
              )}
            >
              <div className="bg-white shadow-sm min-h-full rounded-lg overflow-hidden border border-gray-200/60 ring-1 ring-gray-900/5">
                <Canvas />
              </div>
            </div>
          </div>

          {/* Collapsible Properties Panel (Nested in Preview) */}
          {showProperties && (
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
