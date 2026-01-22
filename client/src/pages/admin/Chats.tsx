import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageSquare, Star, ChevronLeft, ChevronRight, User } from "lucide-react";
import { Link } from "wouter";

export default function AdminChats() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = trpc.admin.chats.useQuery({ page, limit });

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-destructive">Acceso Denegado</CardTitle>
            <CardDescription>
              No tienes permisos para acceder al panel de administración.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Panel de Administración</h1>
              <p className="text-muted-foreground">Gestión de conversaciones</p>
            </div>
            <Link href="/" className="text-sm text-primary hover:underline">
              ← Volver a la app
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-card/50">
        <div className="container">
          <div className="flex gap-6">
            <Link href="/admin" className="py-3 border-b-2 border-transparent text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/admin/users" className="py-3 border-b-2 border-transparent text-muted-foreground hover:text-foreground">
              Usuarios
            </Link>
            <Link href="/admin/chats" className="py-3 border-b-2 border-primary text-primary font-medium">
              Conversaciones
            </Link>
            <Link href="/admin/projects" className="py-3 border-b-2 border-transparent text-muted-foreground hover:text-foreground">
              Proyectos
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversaciones
            </CardTitle>
            <CardDescription>
              {data?.total || 0} conversaciones en total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Creado</TableHead>
                      <TableHead>Actualizado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.chats.map((chat) => (
                      <TableRow key={chat.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate max-w-xs">{chat.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{chat.userName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {chat.isFavorite ? (
                            <Badge variant="default" className="bg-yellow-500">
                              <Star className="h-3 w-3 mr-1" /> Favorito
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Normal</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {chat.createdAt ? new Date(chat.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Página {page} de {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {data?.chats.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay conversaciones registradas
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
