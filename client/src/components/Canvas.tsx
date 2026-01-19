import { useEditorStore } from '@/store/editorStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SectionRenderer } from './SectionRenderer';
import { cn } from '@/lib/utils';

function SortableSection({ section }: { section: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="group relative">
      <div className={cn("absolute inset-0 border-2 border-primary opacity-0 pointer-events-none transition-opacity", isDragging && "opacity-100")} />
      <SectionRenderer section={section} />
    </div>
  );
}

export function Canvas() {
  const { sections, reorderSections, selectSection } = useEditorStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
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

  return (
    <div 
      className="flex-1 bg-gray-100 overflow-y-auto p-2 md:p-8"
      onClick={() => selectSection(null)}
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
