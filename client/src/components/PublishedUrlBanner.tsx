import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { ExternalLink, Copy, Check, Edit2, X, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PublishedUrlBannerProps {
  chatId: number | null;
  onPublish?: () => void;
}

export function PublishedUrlBanner({ chatId, onPublish }: PublishedUrlBannerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [copied, setCopied] = useState(false);

  // Fetch published URL for this chat
  const { data: publishedData, isLoading, refetch } = trpc.chat.getPublishedUrl.useQuery(
    { chatId: chatId! },
    { enabled: !!chatId }
  );

  // Check slug availability
  const { data: slugCheck } = trpc.publishedLandings.checkSlug.useQuery(
    { slug: newSlug },
    { enabled: newSlug.length >= 3 && isEditing }
  );

  // Update landing mutation
  const updateLanding = trpc.publishedLandings.update.useMutation({
    onSuccess: () => {
      toast.success('URL actualizada correctamente');
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Error al actualizar: ${error.message}`);
    },
  });

  const handleCopy = () => {
    if (publishedData?.url) {
      navigator.clipboard.writeText(publishedData.url);
      setCopied(true);
      toast.success('URL copiada al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenUrl = () => {
    if (publishedData?.url) {
      window.open(publishedData.url, '_blank');
    }
  };

  const handleStartEdit = () => {
    if (publishedData?.slug) {
      setNewSlug(publishedData.slug);
      setIsEditing(true);
    }
  };

  const handleSaveSlug = () => {
    if (!publishedData?.landingId || !newSlug.trim()) return;
    
    // Note: Changing slug requires republishing to a new URL
    // For now, just show a message that they need to republish
    toast.info('Para cambiar la URL, usa el botón "Publicar" y elige un nuevo slug');
    setIsEditing(false);
  };

  // Don't show anything if no chatId or still loading
  if (!chatId || isLoading) {
    return null;
  }

  // If not published yet, show a subtle publish prompt
  if (!publishedData) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 border-b text-sm">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Esta landing no está publicada</span>
        {onPublish && (
          <Button 
            variant="link" 
            size="sm" 
            className="h-auto p-0 text-primary"
            onClick={onPublish}
          >
            Publicar ahora
          </Button>
        )}
      </div>
    );
  }

  // Show published URL banner
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950/30 border-b border-green-200 dark:border-green-900 text-sm">
      <div className="flex items-center gap-1.5 text-green-700 dark:text-green-400">
        <Check className="h-4 w-4" />
        <span className="font-medium">Publicada:</span>
      </div>
      
      {isEditing ? (
        <div className="flex items-center gap-2 flex-1">
          <Input
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            className="h-7 text-sm max-w-[200px]"
            placeholder="nuevo-slug"
          />
          {slugCheck && (
            <span className={cn(
              "text-xs",
              slugCheck.available ? "text-green-600" : "text-red-600"
            )}>
              {slugCheck.available ? '✓ Disponible' : '✗ No disponible'}
            </span>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSaveSlug}>
            <Check className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <a 
            href={publishedData.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-green-700 dark:text-green-400 hover:underline font-mono truncate max-w-[300px]"
          >
            {publishedData.url}
          </a>
          
          <div className="flex items-center gap-1 ml-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50"
              onClick={handleCopy}
              title="Copiar URL"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50"
              onClick={handleOpenUrl}
              title="Abrir en nueva pestaña"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50"
              onClick={handleStartEdit}
              title="Editar URL"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
