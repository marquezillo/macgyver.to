import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Loader2, Globe, Check, X, ExternalLink, Copy, RefreshCw, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  landingConfig: any;
  landingName?: string;
  chatId?: number | null;
}

export function PublishModal({ isOpen, onClose, landingConfig, landingName, chatId }: PublishModalProps) {
  const [name, setName] = useState(landingName || '');
  const [slug, setSlug] = useState('');
  const [originalSlug, setOriginalSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [isEditingSlug, setIsEditingSlug] = useState(false);

  const utils = trpc.useUtils();

  // Get user's subdomain
  const { data: subdomainData } = trpc.publishedLandings.getMySubdomain.useQuery();

  // Check if this chat already has a published landing
  const { data: existingPublished } = trpc.chat.getPublishedUrl.useQuery(
    { chatId: chatId! },
    { enabled: !!chatId }
  );

  // Check slug availability (for new publications or when editing slug)
  const checkSlugQuery = trpc.publishedLandings.checkSlug.useQuery(
    { slug },
    {
      enabled: slug.length >= 3 && (!isUpdateMode || (isEditingSlug && slug !== originalSlug)),
    }
  );

  // Link chat to published landing mutation
  const linkChatMutation = trpc.chat.linkToPublishedLanding.useMutation();

  // Update existing landing mutation
  const updateLandingMutation = trpc.publishedLandings.update.useMutation({
    onSuccess: (data) => {
      toast.success('¡Landing actualizada exitosamente!');
      utils.chat.getPublishedUrl.invalidate();
      onClose();
      // Open the new URL (might have changed if slug was edited)
      const urlToOpen = data.url || existingPublished?.url;
      if (urlToOpen) {
        window.open(urlToOpen, '_blank');
      }
    },
    onError: (error) => {
      toast.error(`Error al actualizar: ${error.message}`);
    },
  });

  // Publish mutation
  const publishMutation = trpc.publishedLandings.publish.useMutation({
    onSuccess: async (data) => {
      // Link the chat to the published landing
      if (chatId && data.landing?.id) {
        try {
          await linkChatMutation.mutateAsync({
            chatId,
            publishedLandingId: data.landing.id,
          });
          utils.chat.getPublishedUrl.invalidate();
        } catch (e) {
          console.error('Failed to link chat to landing:', e);
        }
      }
      
      toast.success('¡Landing publicada exitosamente!');
      onClose();
      // Open the published URL in a new tab
      window.open(data.url, '_blank');
    },
    onError: (error) => {
      toast.error(`Error al publicar: ${error.message}`);
    },
  });

  // Set update mode if already published
  useEffect(() => {
    if (existingPublished) {
      setIsUpdateMode(true);
      setName(existingPublished.name || landingName || '');
      setSlug(existingPublished.slug || '');
      setOriginalSlug(existingPublished.slug || '');
      setPreviewUrl(existingPublished.url || '');
      setIsEditingSlug(false);
    } else {
      setIsUpdateMode(false);
      setOriginalSlug('');
      setIsEditingSlug(false);
    }
  }, [existingPublished, landingName]);

  // Update state when checkSlug query completes
  useEffect(() => {
    if (checkSlugQuery.data) {
      // For update mode with edited slug, check if it's the same as original
      if (isUpdateMode && slug === originalSlug) {
        setSlugAvailable(true);
      } else {
        setSlugAvailable(checkSlugQuery.data.available);
        if (!isUpdateMode) {
          setPreviewUrl(checkSlugQuery.data.previewUrl);
        } else if (checkSlugQuery.data.available && subdomainData) {
          // Update preview URL for edited slug
          setPreviewUrl(`https://${subdomainData.subdomain}.macgyver.to/${slug}`);
        }
      }
      setIsChecking(false);
    }
    if (checkSlugQuery.error) {
      setIsChecking(false);
    }
  }, [checkSlugQuery.data, checkSlugQuery.error, isUpdateMode, slug, originalSlug, subdomainData]);

  // Generate slug from name (only for new publications)
  useEffect(() => {
    if (name && !slug && !isUpdateMode) {
      const generatedSlug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);
      setSlug(generatedSlug);
    }
  }, [name, isUpdateMode]);

  // Check slug availability when slug changes
  useEffect(() => {
    const shouldCheck = slug.length >= 3 && (!isUpdateMode || (isEditingSlug && slug !== originalSlug));
    if (shouldCheck) {
      setIsChecking(true);
      const timer = setTimeout(() => {
        // Query will be triggered by the enabled condition
      }, 500);
      return () => clearTimeout(timer);
    } else if (!isUpdateMode) {
      setSlugAvailable(null);
      setPreviewUrl('');
    } else if (isUpdateMode && slug === originalSlug) {
      setSlugAvailable(true);
    }
  }, [slug, isUpdateMode, isEditingSlug, originalSlug]);

  const handlePublish = () => {
    if (!name.trim()) {
      toast.error('Por favor, ingresa un nombre para la landing');
      return;
    }

    if (isUpdateMode && existingPublished?.landingId) {
      // Update existing landing (including slug if changed)
      const updateData: any = {
        id: existingPublished.landingId,
        name: name.trim(),
        config: landingConfig,
      };
      
      // Include new slug if it was edited and is different
      if (isEditingSlug && slug !== originalSlug && slug.trim().length >= 3) {
        updateData.slug = slug.trim();
      }
      
      updateLandingMutation.mutate(updateData);
    } else {
      // New publication
      if (!slug.trim() || slug.length < 3) {
        toast.error('El slug debe tener al menos 3 caracteres');
        return;
      }

      publishMutation.mutate({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        config: landingConfig,
      });
    }
  };

  const handlePublishAsNew = () => {
    setIsUpdateMode(false);
    setSlug('');
    setOriginalSlug('');
    setSlugAvailable(null);
    setPreviewUrl('');
    setIsEditingSlug(false);
  };

  const handleEditSlug = () => {
    setIsEditingSlug(true);
  };

  const handleCancelEditSlug = () => {
    setSlug(originalSlug);
    setIsEditingSlug(false);
    setSlugAvailable(true);
    if (existingPublished?.url) {
      setPreviewUrl(existingPublished.url);
    }
  };

  const copyUrl = () => {
    if (previewUrl) {
      navigator.clipboard.writeText(previewUrl);
      toast.success('URL copiada al portapapeles');
    }
  };

  const isPending = publishMutation.isPending || updateLandingMutation.isPending;
  const slugChanged = isEditingSlug && slug !== originalSlug;
  const slugValid = isUpdateMode 
    ? (slug === originalSlug || (slugAvailable === true && slug.length >= 3))
    : slugAvailable === true;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            {isUpdateMode ? 'Actualizar Landing' : 'Publicar Landing'}
          </DialogTitle>
          <DialogDescription>
            {isUpdateMode 
              ? 'Actualiza el contenido de tu landing publicada'
              : 'Tu landing estará disponible en tu subdominio personal'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current URL (if already published) */}
          {isUpdateMode && existingPublished?.url && !isEditingSlug && (
            <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 border border-green-200 dark:border-green-900">
              <Label className="text-xs text-green-700 dark:text-green-400 mb-1 block">URL actual</Label>
              <div className="flex items-center gap-2">
                <a 
                  href={existingPublished.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 text-sm font-mono text-green-700 dark:text-green-400 hover:underline break-all"
                >
                  {existingPublished.url}
                </a>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={copyUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 shrink-0" 
                  onClick={() => window.open(existingPublished.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 shrink-0" 
                  onClick={handleEditSlug}
                  title="Cambiar URL"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Slug editing mode (for published landings) */}
          {isUpdateMode && isEditingSlug && (
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 border border-amber-200 dark:border-amber-900">
              <Label className="text-xs text-amber-700 dark:text-amber-400 mb-2 block">Cambiar URL</Label>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    value={slug}
                    onChange={(e) => {
                      const value = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, '')
                        .substring(0, 50);
                      setSlug(value);
                    }}
                    placeholder="nuevo-slug"
                    maxLength={50}
                    className={cn(
                      "pr-10",
                      slug === originalSlug && "border-green-500",
                      slug !== originalSlug && slugAvailable === true && "border-green-500 focus-visible:ring-green-500",
                      slug !== originalSlug && slugAvailable === false && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    {!isChecking && slugValid && <Check className="h-4 w-4 text-green-500" />}
                    {!isChecking && slug !== originalSlug && slugAvailable === false && <X className="h-4 w-4 text-red-500" />}
                  </div>
                </div>
                {slug !== originalSlug && slugAvailable === false && (
                  <p className="text-sm text-red-500">Este slug ya está en uso. Elige otro.</p>
                )}
                {slugChanged && slugAvailable && subdomainData && (
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Nueva URL: <span className="font-mono">{`https://${subdomainData.subdomain}.macgyver.to/${slug}`}</span>
                  </p>
                )}
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={handleCancelEditSlug}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Subdomain info */}
          {subdomainData && !isUpdateMode && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="text-muted-foreground">
                Tu subdominio: <span className="font-mono font-medium text-foreground">{subdomainData.subdomain}.macgyver.to</span>
              </p>
            </div>
          )}

          {/* Name input */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la landing</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mi Landing Increíble"
              maxLength={100}
            />
          </div>

          {/* Slug input (only for new publications) */}
          {!isUpdateMode && (
            <div className="space-y-2">
              <Label htmlFor="slug">URL (slug)</Label>
              <div className="relative">
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => {
                    const value = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, '')
                      .substring(0, 50);
                    setSlug(value);
                  }}
                  placeholder="mi-landing"
                  maxLength={50}
                  className={cn(
                    "pr-10",
                    slugAvailable === true && "border-green-500 focus-visible:ring-green-500",
                    slugAvailable === false && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {!isChecking && slugAvailable === true && <Check className="h-4 w-4 text-green-500" />}
                  {!isChecking && slugAvailable === false && <X className="h-4 w-4 text-red-500" />}
                </div>
              </div>
              {slugAvailable === false && (
                <p className="text-sm text-red-500">Este slug ya está en uso. Elige otro.</p>
              )}
            </div>
          )}

          {/* URL Preview (only for new publications) */}
          {previewUrl && slugAvailable && !isUpdateMode && (
            <div className="bg-muted/50 rounded-lg p-3">
              <Label className="text-xs text-muted-foreground mb-1 block">Vista previa de URL</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono text-primary break-all">
                  {previewUrl}
                </code>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={copyUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Description (only for new publications) */}
          {!isUpdateMode && (
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Una breve descripción de tu landing..."
                rows={2}
                maxLength={500}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {isUpdateMode && !isEditingSlug && (
            <Button variant="outline" onClick={handlePublishAsNew} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Publicar como nueva
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handlePublish}
              disabled={isPending || !name.trim() || (!isUpdateMode && (!slug.trim() || slugAvailable === false)) || (isEditingSlug && slug !== originalSlug && !slugValid)}
              className="gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isUpdateMode ? 'Actualizando...' : 'Publicando...'}
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  {isUpdateMode ? (slugChanged ? 'Actualizar y cambiar URL' : 'Actualizar') : 'Publicar'}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
