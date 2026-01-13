import { useEditorStore } from '@/store/editorStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export function PropertiesPanel() {
  const { sections, selectedSectionId, updateSection, updateSectionStyles, removeSection } = useEditorStore();
  
  const selectedSection = sections.find(s => s.id === selectedSectionId);

  if (!selectedSection) {
    return (
      <div className="w-80 border-l bg-white p-6 flex items-center justify-center text-gray-500">
        Select a section to edit properties
      </div>
    );
  }

  const handleContentChange = (key: string, value: any) => {
    updateSection(selectedSection.id, { [key]: value });
  };

  const handleStyleChange = (key: string, value: any) => {
    updateSectionStyles(selectedSection.id, { [key]: value });
  };

  return (
    <div className="w-80 border-l bg-white flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold text-lg capitalize">{selectedSection.type} Settings</h2>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => removeSection(selectedSection.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Content Fields */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Content</h3>
          
          {Object.entries(selectedSection.content).map(([key, value]) => {
            if (typeof value === 'string') {
              return (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                  {key.includes('description') || key.length > 50 ? (
                    <Textarea 
                      id={key} 
                      value={value} 
                      onChange={(e) => handleContentChange(key, e.target.value)}
                      rows={3}
                    />
                  ) : (
                    <Input 
                      id={key} 
                      value={value} 
                      onChange={(e) => handleContentChange(key, e.target.value)}
                    />
                  )}
                </div>
              );
            }
            return null; // Skip arrays/objects for now (implement specialized editors later)
          })}
        </div>

        {/* Style Fields */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Styles</h3>
          
          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="flex gap-2">
              {['bg-white', 'bg-gray-50', 'bg-blue-50', 'bg-slate-900'].map((bg) => (
                <button
                  key={bg}
                  className={`w-8 h-8 rounded-full border ${bg} ${selectedSection.styles?.backgroundColor === bg ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  onClick={() => handleStyleChange('backgroundColor', bg)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Text Color</Label>
            <div className="flex gap-2">
              {['text-gray-900', 'text-gray-500', 'text-blue-600', 'text-white'].map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border ${color.replace('text-', 'bg-')} ${selectedSection.styles?.textColor === color ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  onClick={() => handleStyleChange('textColor', color)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
