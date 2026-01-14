import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Trash2, Edit2, Brain, User, Settings, Lightbulb, Star } from 'lucide-react';
import { Link } from 'wouter';
import { toast } from 'sonner';

type MemoryCategory = 'preference' | 'fact' | 'context' | 'instruction';

const categoryConfig: Record<MemoryCategory, { label: string; icon: typeof Brain; color: string; description: string }> = {
  preference: { 
    label: 'Preferencia', 
    icon: Settings, 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    description: 'Cómo prefieres que responda la IA'
  },
  fact: { 
    label: 'Dato Personal', 
    icon: User, 
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    description: 'Información sobre ti'
  },
  context: { 
    label: 'Contexto', 
    icon: Lightbulb, 
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    description: 'Contexto de tus proyectos o trabajo'
  },
  instruction: { 
    label: 'Instrucción', 
    icon: Brain, 
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    description: 'Instrucciones especiales para la IA'
  },
};

export default function MemorySettings() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<{ id: number; content: string; category: MemoryCategory; importance: number } | null>(null);
  const [newMemory, setNewMemory] = useState({ content: '', category: 'fact' as MemoryCategory, importance: 5 });

  const { data: memories, refetch } = trpc.memory.list.useQuery({ activeOnly: false });
  const createMutation = trpc.memory.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddDialogOpen(false);
      setNewMemory({ content: '', category: 'fact', importance: 5 });
      toast.success('Memoria guardada');
    },
  });
  const updateMutation = trpc.memory.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingMemory(null);
      toast.success('Memoria actualizada');
    },
  });
  const deleteMutation = trpc.memory.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success('Memoria eliminada');
    },
  });
  const toggleMutation = trpc.memory.toggle.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleCreate = () => {
    if (!newMemory.content.trim()) {
      toast.error('El contenido no puede estar vacío');
      return;
    }
    createMutation.mutate(newMemory);
  };

  const handleUpdate = () => {
    if (!editingMemory || !editingMemory.content.trim()) {
      toast.error('El contenido no puede estar vacío');
      return;
    }
    updateMutation.mutate({
      memoryId: editingMemory.id,
      content: editingMemory.content,
      category: editingMemory.category,
      importance: editingMemory.importance,
    });
  };

  const handleDelete = (memoryId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta memoria?')) {
      deleteMutation.mutate({ memoryId });
    }
  };

  const handleToggle = (memoryId: number, isActive: boolean) => {
    toggleMutation.mutate({ memoryId, isActive });
  };

  const groupedMemories = memories?.reduce((acc, memory) => {
    const category = memory.category as MemoryCategory;
    if (!acc[category]) acc[category] = [];
    acc[category].push(memory);
    return acc;
  }, {} as Record<MemoryCategory, typeof memories>);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="h-6 w-6" />
              Memoria a Largo Plazo
            </h1>
            <p className="text-muted-foreground">
              Gestiona lo que la IA recuerda sobre ti entre conversaciones
            </p>
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Memoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva Memoria</DialogTitle>
                <DialogDescription>
                  Añade información que quieres que la IA recuerde
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select 
                    value={newMemory.category} 
                    onValueChange={(v) => setNewMemory({ ...newMemory, category: v as MemoryCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className="h-4 w-4" />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Contenido</Label>
                  <Textarea
                    placeholder="Ej: Prefiero respuestas concisas y directas"
                    value={newMemory.content}
                    onChange={(e) => setNewMemory({ ...newMemory, content: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Importancia (1-10)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={newMemory.importance}
                    onChange={(e) => setNewMemory({ ...newMemory, importance: parseInt(e.target.value) || 5 })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Guardando...' : 'Guardar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {!memories || memories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Sin memorias aún</h3>
              <p className="text-muted-foreground mb-4">
                Añade información para que la IA te conozca mejor
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Primera Memoria
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(categoryConfig).map(([category, config]) => {
              const categoryMemories = groupedMemories?.[category as MemoryCategory] || [];
              if (categoryMemories.length === 0) return null;

              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <config.icon className="h-5 w-5" />
                      {config.label}s
                    </CardTitle>
                    <CardDescription>{config.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {categoryMemories.map((memory) => (
                      <div
                        key={memory.id}
                        className={`flex items-start justify-between gap-4 p-3 rounded-lg border ${
                          memory.isActive === 0 ? 'opacity-50 bg-muted' : 'bg-card'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{memory.content}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              {memory.importance}/10
                            </Badge>
                            {memory.source === 'auto' && (
                              <Badge variant="secondary" className="text-xs">
                                Auto-detectado
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={memory.isActive === 1}
                            onCheckedChange={(checked) => handleToggle(memory.id, checked)}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingMemory({
                              id: memory.id,
                              content: memory.content,
                              category: memory.category as MemoryCategory,
                              importance: memory.importance,
                            })}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(memory.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingMemory} onOpenChange={(open) => !open && setEditingMemory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Memoria</DialogTitle>
            </DialogHeader>
            {editingMemory && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select 
                    value={editingMemory.category} 
                    onValueChange={(v) => setEditingMemory({ ...editingMemory, category: v as MemoryCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className="h-4 w-4" />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Contenido</Label>
                  <Textarea
                    value={editingMemory.content}
                    onChange={(e) => setEditingMemory({ ...editingMemory, content: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Importancia (1-10)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={editingMemory.importance}
                    onChange={(e) => setEditingMemory({ ...editingMemory, importance: parseInt(e.target.value) || 5 })}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingMemory(null)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
