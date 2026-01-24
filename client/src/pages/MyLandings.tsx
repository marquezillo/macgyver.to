import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { 
  Globe, 
  ExternalLink, 
  Copy, 
  MoreVertical, 
  Trash2, 
  Eye, 
  Calendar,
  BarChart3,
  Plus,
  Loader2,
  Link as LinkIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'wouter';

export default function MyLandings() {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  // Fetch user's published landings
  const { data: landings, isLoading, refetch } = trpc.publishedLandings.myLandings.useQuery();
  
  // Get user's subdomain
  const { data: subdomainData } = trpc.publishedLandings.getMySubdomain.useQuery();
  
  // Delete mutation
  const deleteMutation = trpc.publishedLandings.delete.useMutation({
    onSuccess: () => {
      toast.success('Landing eliminada correctamente');
      refetch();
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(`Error al eliminar: ${error.message}`);
    },
  });

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copiada al portapapeles');
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate({ id: deleteId });
    }
  };

  // Calculate total stats
  const totalViews = landings?.reduce((sum, l) => sum + (l.viewCount || 0), 0) || 0;
  const activeLandings = landings?.filter(l => l.isActive)?.length || 0;

  return (
    <div className="container py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mis Landings</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona todas tus landings publicadas
          </p>
        </div>
        <Link href="/">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Landing
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Landings</CardDescription>
            <CardTitle className="text-3xl">{landings?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Landings Activas</CardDescription>
            <CardTitle className="text-3xl">{activeLandings}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Visitas</CardDescription>
            <CardTitle className="text-3xl">{totalViews.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Subdomain Info */}
      {subdomainData && (
        <Card className="mb-8 bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <LinkIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tu subdominio personal</p>
                <p className="font-mono font-medium">{subdomainData.baseUrl}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Landings List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-72" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : landings && landings.length > 0 ? (
        <div className="grid gap-4">
          {landings.map((landing) => (
            <Card key={landing.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Icon */}
                  <div className="p-3 rounded-lg bg-primary/10 shrink-0 w-fit">
                    <Globe className="h-8 w-8 text-primary" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg truncate">{landing.name}</h3>
                      {landing.isActive ? (
                        <Badge variant="default" className="bg-green-500">Activa</Badge>
                      ) : (
                        <Badge variant="secondary">Inactiva</Badge>
                      )}
                    </div>
                    
                    <a 
                      href={landing.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline font-mono flex items-center gap-1 mb-2"
                    >
                      {landing.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {landing.viewCount || 0} visitas
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {landing.publishedAt 
                          ? formatDistanceToNow(new Date(landing.publishedAt), { addSuffix: true, locale: es })
                          : 'Sin fecha'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyUrl(landing.url)}
                      className="gap-1"
                    >
                      <Copy className="h-4 w-4" />
                      Copiar URL
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <a href={landing.url} target="_blank" rel="noopener noreferrer" className="gap-1">
                        <ExternalLink className="h-4 w-4" />
                        Ver
                      </a>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <a href={landing.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Abrir en nueva pestaña
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyUrl(landing.url)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar URL
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(landing.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-4">
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No tienes landings publicadas</h3>
            <p className="text-muted-foreground mb-6">
              Crea tu primera landing y publícala para verla aquí
            </p>
            <Link href="/">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Crear Landing
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta landing?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La landing dejará de estar disponible en su URL.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
