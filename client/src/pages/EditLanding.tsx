import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useEditorStore } from '@/store/editorStore';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Save, ExternalLink, Monitor, Smartphone, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Canvas } from '@/components/Canvas';
import { cn } from '@/lib/utils';

export default function EditLanding() {
  const { id } = useParams<{ id: string }>();
  const landingId = parseInt(id || '0', 10);
  
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isSaving, setIsSaving] = useState(false);
  const [landingUrl, setLandingUrl] = useState<string>('');
  const [landingName, setLandingName] = useState<string>('');
  
  const { setSections, sections } = useEditorStore();
  
  // Fetch landing data
  const { data: landing, isLoading, error } = trpc.publishedLandings.getById.useQuery(
    { id: landingId },
    { enabled: landingId > 0 }
  );
  
  // Update mutation
  const updateMutation = trpc.publishedLandings.update.useMutation({
    onSuccess: () => {
      toast.success('Landing actualizada correctamente');
      setIsSaving(false);
    },
    onError: (error) => {
      toast.error(`Error al guardar: ${error.message}`);
      setIsSaving(false);
    },
  });
  
  // Load landing into editor when data arrives
  useEffect(() => {
    if (landing?.config) {
      // Parse config if it's a string
      const config = typeof landing.config === 'string' 
        ? JSON.parse(landing.config) 
        : landing.config;
      
      if (config.sections && Array.isArray(config.sections)) {
        setSections(config.sections);
      }
      
      setLandingUrl(landing.url || '');
      setLandingName(landing.name || '');
    }
  }, [landing, setSections]);
  
  // Handle save
  const handleSave = async () => {
    if (!landingId) return;
    
    setIsSaving(true);
    
    // Build updated config
    const updatedConfig = {
      sections,
      metadata: {
        updatedAt: new Date().toISOString(),
        version: '1.0',
      },
    };
    
    updateMutation.mutate({
      id: landingId,
      config: updatedConfig,
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <p className="text-gray-500 dark:text-gray-400">Cargando landing...</p>
        </div>
      </div>
    );
  }
  
  if (error || !landing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Landing no encontrada
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            La landing que buscas no existe o no tienes permiso para editarla.
          </p>
          <Link href="/my-landings">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver a Mis Landings
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/my-landings">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Mis Landings
            </Button>
          </Link>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
          <div>
            <h1 className="font-semibold text-gray-900 dark:text-white">
              Editando: {landingName}
            </h1>
            {landingUrl && (
              <a 
                href={landingUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                {landingUrl}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Buttons */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                viewMode === 'desktop' && "bg-white dark:bg-gray-600 shadow-sm"
              )}
              onClick={() => setViewMode('desktop')}
              title="Vista escritorio"
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                viewMode === 'tablet' && "bg-white dark:bg-gray-600 shadow-sm"
              )}
              onClick={() => setViewMode('tablet')}
              title="Vista tablet"
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                viewMode === 'mobile' && "bg-white dark:bg-gray-600 shadow-sm"
              )}
              onClick={() => setViewMode('mobile')}
              title="Vista móvil"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
          
          <Button 
            variant="outline"
            size="sm"
            asChild
          >
            <a href={landingUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Ver en vivo
            </a>
          </Button>
          
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </header>
      
      {/* Editor Content */}
      <div className="flex-1 overflow-auto">
        <div className={cn(
          "mx-auto transition-all duration-300",
          viewMode === 'desktop' && "w-full",
          viewMode === 'tablet' && "max-w-[768px]",
          viewMode === 'mobile' && "max-w-[375px]"
        )}>
          <Canvas />
        </div>
      </div>
    </div>
  );
}
