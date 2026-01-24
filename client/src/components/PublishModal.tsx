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
import { Loader2, Globe, Check, X, ExternalLink, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  landingConfig: any;
  landingName?: string;
}

export function PublishModal({ isOpen, onClose, landingConfig, landingName }: PublishModalProps) {
  const [name, setName] = useState(landingName || '');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Get user's subdomain
  const { data: subdomainData } = trpc.publishedLandings.getMySubdomain.useQuery();

  // Check slug availability
  const checkSlugQuery = trpc.publishedLandings.checkSlug.useQuery(
    { slug },
    {
      enabled: slug.length >= 3,
    }
  );

  // Update state when checkSlug query completes
  useEffect(() => {
    if (checkSlugQuery.data) {
      setSlugAvailable(checkSlugQuery.data.available);
      setPreviewUrl(checkSlugQuery.data.previewUrl);
      setIsChecking(false);
    }
    if (checkSlugQuery.error) {
      setIsChecking(false);
    }
  }, [checkSlugQuery.data, checkSlugQuery.error]);

  // Publish mutation
  const publishMutation = trpc.publishedLandings.publish.useMutation({
    onSuccess: (data) => {
      toast.success('¡Landing publicada exitosamente!');
      onClose();
      // Open the published URL in a new tab
      window.open(data.url, '_blank');
    },
    onError: (error) => {
      toast.error(`Error al publicar: ${error.message}`);
    },
  });

  // Generate slug from name
  useEffect(() => {
    if (name && !slug) {
      const generatedSlug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);
      setSlug(generatedSlug);
    }
  }, [name]);

  // Check slug availability when slug changes
  useEffect(() => {
    if (slug.length >= 3) {
      setIsChecking(true);
      const timer = setTimeout(() => {
        // Trigger the query
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSlugAvailable(null);
      setPreviewUrl('');
    }
  }, [slug]);

  const handlePublish = () => {
    if (!name.trim()) {
      toast.error('Por favor, ingresa un nombre para la landing');
      return;
    }

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
  };

  const copyUrl = () => {
    if (previewUrl) {
      navigator.clipboard.writeText(previewUrl);
      toast.success('URL copiada al portapapeles');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Publicar Landing
          </DialogTitle>
          <DialogDescription>
            Tu landing estará disponible en tu subdominio personal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Subdomain info */}
          {subdomainData && (
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

          {/* Slug input */}
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

          {/* URL Preview */}
          {previewUrl && slugAvailable && (
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

          {/* Description */}
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handlePublish}
            disabled={publishMutation.isPending || !name.trim() || !slug.trim() || slugAvailable === false}
            className="gap-2"
          >
            {publishMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                Publicar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
