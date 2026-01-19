import { Button } from '@/components/ui/button';
import { Monitor, Smartphone, Tablet, Undo, Redo, Save, Eye, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { useEditorStore } from '@/store/editorStore';

interface EditorHeaderProps {
  viewMode: 'desktop' | 'tablet' | 'mobile';
  setViewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  compact?: boolean;
}

export function EditorHeader({ viewMode, setViewMode, compact = false }: EditorHeaderProps) {
  const { sections } = useEditorStore();

  const handleSave = async () => {
    try {
      toast.loading('Saving changes...');
      await api.saveProject('current-project', { sections });
      toast.dismiss();
      toast.success('Changes saved successfully');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to save changes');
    }
  };

  const handlePublish = async () => {
    try {
      toast.loading('Publishing...');
      const result = await api.publishProject('current-project');
      toast.dismiss();
      toast.success(`Published successfully! URL: ${result.url}`);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to publish');
    }
  };

  return (
    <header className={cn(
      "flex items-center justify-between",
      compact ? "h-full" : "h-16 border-b bg-white px-4"
    )}>
      <div className="flex items-center gap-4">
        {!compact && <h1 className="font-bold text-xl">Landing Editor</h1>}
        {!compact && <div className="h-6 w-px bg-gray-200" />}
        <div className="flex items-center gap-0.5 md:gap-1 bg-gray-100 p-0.5 md:p-1 rounded-lg">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 md:h-8 md:w-8", viewMode === 'desktop' && "bg-white shadow-sm")}
            onClick={() => setViewMode('desktop')}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 md:h-8 md:w-8", viewMode === 'tablet' && "bg-white shadow-sm")}
            onClick={() => setViewMode('tablet')}
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 md:h-8 md:w-8", viewMode === 'mobile' && "bg-white shadow-sm")}
            onClick={() => setViewMode('mobile')}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Redo className="h-4 w-4" />
        </Button>
        
        {!compact && (
          <>
            <div className="h-6 w-px bg-gray-200 mx-2" />
            <Button variant="outline" className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleSave}>
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button className="gap-2" onClick={handlePublish}>
              <UploadCloud className="h-4 w-4" />
              Publish
            </Button>
          </>
        )}
        
        {compact && (
           <>
            <div className="h-6 w-px bg-gray-200 mx-2" />
            <Button variant="ghost" size="icon" onClick={handleSave} title="Save">
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handlePublish} title="Publish">
               <UploadCloud className="h-4 w-4" />
            </Button>
           </>
        )}
      </div>
    </header>
  );
}
