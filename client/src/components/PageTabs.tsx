/**
 * PageTabs Component
 * 
 * Displays tabs for multi-page landings, allowing users to switch between pages.
 */

import { useState } from 'react';
import { Plus, Home, FileText, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMultiPageStore, type Page, type PageType } from '@/store/multiPageStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface PageTabsProps {
  className?: string;
  onPageChange?: (pageId: string) => void;
}

export function PageTabs({ className, onPageChange }: PageTabsProps) {
  const { 
    currentProject,
    activePage, 
    setActivePage, 
    addPage, 
    togglePage,
  } = useMultiPageStore();
  
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);

  // Don't render if no project
  if (!currentProject) {
    return null;
  }

  const enabledPages = currentProject.pages.filter(p => p.enabled);
  
  // Don't render if no additional pages enabled
  if (enabledPages.length === 0) {
    return null;
  }

  const handlePageClick = (pageId: string) => {
    setActivePage(pageId);
    onPageChange?.(pageId);
  };

  const handleAddPage = (type: PageType) => {
    addPage(type);
  };

  const getPageIcon = (page: Page) => {
    if (page.type === 'home') return <Home className="h-3.5 w-3.5" />;
    return <FileText className="h-3.5 w-3.5" />;
  };

  return (
    <div className={cn(
      "flex items-center gap-1 px-2 py-1.5 bg-gray-50 border-b border-gray-200 overflow-x-auto",
      className
    )}>
      <span className="text-xs font-medium text-gray-500 mr-2 shrink-0">Páginas:</span>
      
      <div className="flex items-center gap-1">
        {/* Home tab */}
        <button
          onClick={() => handlePageClick('home')}
          className={cn(
            "group flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
            "hover:bg-white hover:shadow-sm",
            activePage === 'home'
              ? "bg-white shadow-sm text-blue-600 border border-blue-200"
              : "text-gray-600 border border-transparent"
          )}
        >
          <Home className="h-3.5 w-3.5" />
          <span>Inicio</span>
        </button>

        {/* Additional pages */}
        {enabledPages.map((page) => (
          <button
            key={page.id}
            onClick={() => handlePageClick(page.id)}
            className={cn(
              "group flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              "hover:bg-white hover:shadow-sm",
              activePage === page.id
                ? "bg-white shadow-sm text-blue-600 border border-blue-200"
                : "text-gray-600 border border-transparent"
            )}
          >
            {getPageIcon(page)}
            <span>{page.title}</span>
            <span className="text-gray-400 text-[10px]">{page.slug}</span>
          </button>
        ))}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-gray-500 hover:text-gray-700"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Añadir</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleAddPage('contact')}>
            <FileText className="h-4 w-4 mr-2" />
            Página de Contacto
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddPage('about')}>
            <FileText className="h-4 w-4 mr-2" />
            Página Nosotros
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddPage('terms')}>
            <FileText className="h-4 w-4 mr-2" />
            Términos y Condiciones
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAddPage('privacy')}>
            <FileText className="h-4 w-4 mr-2" />
            Política de Privacidad
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsManageDialogOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Gestionar Páginas
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Manage Pages Dialog */}
      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Gestionar Páginas</DialogTitle>
            <DialogDescription>
              Activa o desactiva las páginas adicionales de tu landing.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {currentProject.pages.map((page) => (
              <div key={page.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-sm">{page.title}</p>
                    <p className="text-xs text-gray-500">{page.slug}</p>
                  </div>
                </div>
                <Switch
                  checked={page.enabled}
                  onCheckedChange={() => togglePage(page.id)}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsManageDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
