import { useEditorStore } from '@/store/editorStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SectionRenderer } from './SectionRenderer';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

function SortableSection({ section }: { section: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      {/* Drag handle - only this element triggers drag */}
      <div 
        {...attributes} 
        {...listeners}
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-r-lg cursor-grab active:cursor-grabbing",
          "bg-gray-800/80 text-white opacity-0 group-hover:opacity-100 transition-opacity",
          "hover:bg-gray-700",
          isDragging && "opacity-100"
        )}
        title="Arrastra para reordenar"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      
      <div className={cn(
        "border-2 border-transparent transition-all",
        isDragging && "border-primary opacity-75"
      )}>
        <SectionRenderer section={section} />
      </div>
    </div>
  );
}

export function Canvas() {
  const { sections, reorderSections, selectSection } = useEditorStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderSections(active.id as string, over.id as string);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the canvas background
    if (e.target === e.currentTarget) {
      selectSection(null);
    }
  };

  return (
    <div 
      className="flex-1 bg-gray-100 overflow-y-auto p-2 md:p-8"
      onClick={handleCanvasClick}
    >
      <div className="max-w-5xl mx-auto bg-white shadow-lg min-h-[400px] md:min-h-[800px] rounded-lg overflow-hidden">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={sections.map(s => s.id)} 
            strategy={verticalListSortingStrategy}
          >
            {sections.map((section) => (
              <SortableSection key={section.id} section={section} />
            ))}
          </SortableContext>
        </DndContext>
        
        {sections.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-400 p-8 md:p-20 text-center text-sm md:text-base">
            Drag and drop sections here or click to add
          </div>
        )}
      </div>
    </div>
  );
}
