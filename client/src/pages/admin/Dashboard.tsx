import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, MessageSquare, FolderOpen, TrendingUp, UserPlus, MessageCircle } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();

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
              <p className="text-muted-foreground">Bienvenido, {user.name}</p>
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
            <Link href="/admin" className="py-3 border-b-2 border-primary text-primary font-medium">
              Dashboard
            </Link>
            <Link href="/admin/users" className="py-3 border-b-2 border-transparent text-muted-foreground hover:text-foreground">
              Usuarios
            </Link>
            <Link href="/admin/chats" className="py-3 border-b-2 border-transparent text-muted-foreground hover:text-foreground">
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Usuarios"
            value={stats?.totalUsers}
            icon={Users}
            loading={isLoading}
            description="Usuarios registrados"
          />
          <StatsCard
            title="Total Conversaciones"
            value={stats?.totalChats}
            icon={MessageSquare}
            loading={isLoading}
            description="Chats creados"
          />
          <StatsCard
            title="Total Mensajes"
            value={stats?.totalMessages}
            icon={MessageCircle}
            loading={isLoading}
            description="Mensajes enviados"
          />
          <StatsCard
            title="Total Proyectos"
            value={stats?.totalProjects}
            icon={FolderOpen}
            loading={isLoading}
            description="Proyectos generados"
          />
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-green-500" />
                Nuevos Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-bold">{isLoading ? <Skeleton className="h-9 w-16" /> : stats?.newUsersToday || 0}</div>
                  <div className="text-sm text-muted-foreground">Usuarios nuevos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{isLoading ? <Skeleton className="h-9 w-16" /> : stats?.newChatsToday || 0}</div>
                  <div className="text-sm text-muted-foreground">Conversaciones nuevas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Distribución de Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-bold">{isLoading ? <Skeleton className="h-9 w-16" /> : stats?.usersByRole?.user || 0}</div>
                  <div className="text-sm text-muted-foreground">Usuarios normales</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{isLoading ? <Skeleton className="h-9 w-16" /> : stats?.usersByRole?.admin || 0}</div>
                  <div className="text-sm text-muted-foreground">Administradores</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente (Últimos 7 días)</CardTitle>
            <CardDescription>Conversaciones creadas por día</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="flex items-end gap-2 h-48">
                {stats.recentActivity.map((day, index) => {
                  const maxCount = Math.max(...stats.recentActivity.map(d => d.count));
                  const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                        style={{ height: `${Math.max(height, 5)}%` }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short' })}
                      </span>
                      <span className="text-xs font-medium">{day.count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                No hay datos de actividad reciente
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  loading, 
  description 
}: { 
  title: string; 
  value?: number; 
  icon: React.ElementType; 
  loading: boolean; 
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-3xl font-bold">{value?.toLocaleString() || 0}</div>
        )}
        <div className="text-xs text-muted-foreground mt-1">{description}</div>
      </CardContent>
    </Card>
  );
}
