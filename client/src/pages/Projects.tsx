import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  Plus, 
  Folder, 
  Play, 
  Square, 
  Trash2, 
  ExternalLink, 
  Code, 
  Database,
  Loader2,
  RefreshCw,
  FileCode,
  Settings
} from 'lucide-react';
import { getLoginUrl } from '@/const';

export default function Projects() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProject, setNewProject] = useState<{ name: string; description: string; type: 'landing' | 'webapp' | 'api' }>({ name: '', description: '', type: 'webapp' });
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [deployingProject, setDeployingProject] = useState<number | null>(null);

  // Queries
  const { data: projects, isLoading: projectsLoading, refetch: refetchProjects } = trpc.project.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: projectFiles } = trpc.project.files.useQuery(
    { projectId: selectedProject! },
    { enabled: !!selectedProject }
  );

  const { data: projectStatus, refetch: refetchStatus } = trpc.project.status.useQuery(
    { projectId: selectedProject! },
    { enabled: !!selectedProject, refetchInterval: 5000 }
  );

  // Mutations
  const createMutation = trpc.project.create.useMutation({
    onSuccess: () => {
      toast.success('Proyecto creado');
      setIsCreateOpen(false);
      setNewProject({ name: '', description: '', type: 'webapp' });
      refetchProjects();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const deleteMutation = trpc.project.delete.useMutation({
    onSuccess: () => {
      toast.success('Proyecto eliminado');
      setSelectedProject(null);
      refetchProjects();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const deployMutation = trpc.project.deploy.useMutation({
    onSuccess: (result) => {
      setDeployingProject(null);
      if (result.success) {
        toast.success(`Proyecto desplegado: ${result.url}`);
      } else {
        toast.error(result.error || 'Error en despliegue');
      }
      refetchStatus();
      refetchProjects();
    },
    onError: (error) => {
      setDeployingProject(null);
      toast.error(error.message);
    }
  });

  const stopMutation = trpc.project.stop.useMutation({
    onSuccess: () => {
      toast.success('Proyecto detenido');
      refetchStatus();
      refetchProjects();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleCreate = () => {
    if (!newProject.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    createMutation.mutate(newProject);
  };

  const handleDeploy = (projectId: number) => {
    setDeployingProject(projectId);
    deployMutation.mutate({ projectId });
  };

  const handleStop = (projectId: number) => {
    stopMutation.mutate({ projectId });
  };

  const handleDelete = (projectId: number) => {
    if (confirm('¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.')) {
      deleteMutation.mutate({ projectId });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-500">En ejecución</Badge>;
      case 'building':
        return <Badge className="bg-yellow-500">Construyendo</Badge>;
      case 'stopped':
        return <Badge variant="secondary">Detenido</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Acceso requerido</h1>
        <p className="text-muted-foreground">Inicia sesión para gestionar tus proyectos</p>
        <Button onClick={() => window.location.href = getLoginUrl()}>
          Iniciar Sesión
        </Button>
      </div>
    );
  }

  const selectedProjectData = projects?.find(p => p.id === selectedProject);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Project List */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Mis Proyectos
          </h2>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Nuevo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
                <DialogDescription>
                  Crea un nuevo proyecto full-stack con base de datos
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del proyecto</Label>
                  <Input
                    id="name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="mi-proyecto"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Describe tu proyecto..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de proyecto</Label>
                  <Select
                    value={newProject.type}
                    onValueChange={(value: 'landing' | 'webapp' | 'api') => 
                      setNewProject({ ...newProject, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="webapp">Web App (React + Express)</SelectItem>
                      <SelectItem value="landing">Landing Page</SelectItem>
                      <SelectItem value="api">API Backend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Crear Proyecto
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {projectsLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : projects?.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                <p>No tienes proyectos aún</p>
                <p className="text-sm">Crea uno para empezar</p>
              </div>
            ) : (
              projects?.map((project) => (
                <Card
                  key={project.id}
                  className={`cursor-pointer transition-colors hover:bg-accent ${
                    selectedProject === project.id ? 'border-primary bg-accent' : ''
                  }`}
                  onClick={() => setSelectedProject(project.id)}
                >
                  <CardHeader className="p-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{project.name}</CardTitle>
                      {getStatusBadge(project.status)}
                    </div>
                    <CardDescription className="text-xs line-clamp-1">
                      {project.description || 'Sin descripción'}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedProject && selectedProjectData ? (
          <>
            {/* Project Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">{selectedProjectData.name}</h1>
                <p className="text-sm text-muted-foreground">{selectedProjectData.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {projectStatus?.status === 'running' ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(projectStatus.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Abrir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStop(selectedProject)}
                      disabled={stopMutation.isPending}
                    >
                      <Square className="h-4 w-4 mr-1" />
                      Detener
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleDeploy(selectedProject)}
                    disabled={deployingProject === selectedProject}
                  >
                    {deployingProject === selectedProject ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    Desplegar
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    refetchProjects();
                    refetchStatus();
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(selectedProject)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>

            {/* Project Tabs */}
            <Tabs defaultValue="files" className="flex-1 flex flex-col">
              <TabsList className="mx-4 mt-2 w-fit">
                <TabsTrigger value="files" className="gap-1">
                  <FileCode className="h-4 w-4" />
                  Archivos
                </TabsTrigger>
                <TabsTrigger value="database" className="gap-1">
                  <Database className="h-4 w-4" />
                  Base de Datos
                </TabsTrigger>
                <TabsTrigger value="logs" className="gap-1">
                  <Code className="h-4 w-4" />
                  Logs
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-1">
                  <Settings className="h-4 w-4" />
                  Configuración
                </TabsTrigger>
              </TabsList>

              <TabsContent value="files" className="flex-1 m-4 mt-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Archivos del Proyecto</CardTitle>
                    <CardDescription>
                      {projectFiles?.length || 0} archivos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      {projectFiles?.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          <p>No hay archivos generados</p>
                          <p className="text-sm">Usa el chat para generar código para este proyecto</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {projectFiles?.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer"
                            >
                              <FileCode className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-mono">{file.path}</span>
                              <Badge variant="outline" className="ml-auto text-xs">
                                {file.fileType}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="database" className="flex-1 m-4 mt-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Base de Datos</CardTitle>
                    <CardDescription>
                      Schema: {selectedProjectData.dbSchema || `project_${selectedProject}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                      <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Las tablas se crearán automáticamente</p>
                      <p className="text-sm">cuando generes código con base de datos</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="logs" className="flex-1 m-4 mt-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Logs de Construcción</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-4 rounded">
                        {projectStatus?.buildLog || 'Sin logs disponibles'}
                      </pre>
                    </ScrollArea>
                    {projectStatus?.lastError && (
                      <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded">
                        <p className="text-sm font-medium text-destructive">Último error:</p>
                        <p className="text-sm">{projectStatus.lastError}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="flex-1 m-4 mt-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Configuración</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Puerto</Label>
                      <p className="text-sm text-muted-foreground">
                        {projectStatus?.port || 'No asignado'}
                      </p>
                    </div>
                    <div>
                      <Label>URL Pública</Label>
                      <p className="text-sm text-muted-foreground">
                        {projectStatus?.url || 'No disponible'}
                      </p>
                    </div>
                    <div>
                      <Label>Tipo de Proyecto</Label>
                      <p className="text-sm text-muted-foreground capitalize">
                        {selectedProjectData.type}
                      </p>
                    </div>
                    <div>
                      <Label>Creado</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedProjectData.createdAt).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Folder className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Selecciona un proyecto</p>
              <p className="text-sm">o crea uno nuevo para empezar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
