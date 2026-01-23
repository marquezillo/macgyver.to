import { useState } from 'react';
import { useEditorStore, Section, SectionType } from '@/store/editorStore';
import { cn } from '@/lib/utils';
import { 
  GripVertical, 
  Trash2, 
  Copy, 
  ChevronUp, 
  ChevronDown, 
  Plus,
  Layout,
  Type,
  MessageSquare,
  DollarSign,
  HelpCircle,
  Mail,
  BarChart3,
  Star,
  Users,
  Image,
  Building2,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent,
  DragStartEvent,
  DragOverlay
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const sectionIcons: Record<SectionType, React.ReactNode> = {
  hero: <Layout className="w-4 h-4" />,
  features: <Star className="w-4 h-4" />,
  testimonials: <MessageSquare className="w-4 h-4" />,
  pricing: <DollarSign className="w-4 h-4" />,
  cta: <Type className="w-4 h-4" />,
  stats: <BarChart3 className="w-4 h-4" />,
  faq: <HelpCircle className="w-4 h-4" />,
  form: <Mail className="w-4 h-4" />,
  footer: <Layout className="w-4 h-4" />,
  process: <Layout className="w-4 h-4" />,
  about: <Users className="w-4 h-4" />,
  gallery: <Image className="w-4 h-4" />,
  logocloud: <Building2 className="w-4 h-4" />,
  logos: <Building2 className="w-4 h-4" />,
  partners: <Building2 className="w-4 h-4" />,
  clients: <Building2 className="w-4 h-4" />,
  header: <Menu className="w-4 h-4" />,
  navbar: <Menu className="w-4 h-4" />,
  nav: <Menu className="w-4 h-4" />,
};

const sectionLabels: Record<SectionType, string> = {
  hero: 'Hero',
  features: 'Features',
  testimonials: 'Testimonials',
  pricing: 'Pricing',
  cta: 'Call to Action',
  stats: 'Statistics',
  faq: 'FAQ',
  form: 'Contact Form',
  footer: 'Footer',
  process: 'Process',
  about: 'About',
  gallery: 'Gallery',
  logocloud: 'Logo Cloud',
  logos: 'Logos',
  partners: 'Partners',
  clients: 'Clients',
  header: 'Header',
  navbar: 'Navbar',
  nav: 'Navigation',
};

interface SortableSectionItemProps {
  section: Section;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function SortableSectionItem({
  section,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: SortableSectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center gap-2 p-3 rounded-lg border transition-all duration-200",
        isDragging && "opacity-50 scale-105 shadow-lg z-50",
        isSelected 
          ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20" 
          : "border-zinc-200 hover:border-zinc-300 bg-white",
        "cursor-pointer"
      )}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-center w-6 h-6 rounded hover:bg-zinc-100 cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4 text-zinc-400" />
      </div>

      {/* Section Icon & Name */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          isSelected ? "bg-blue-100 text-blue-600" : "bg-zinc-100 text-zinc-600"
        )}>
          {sectionIcons[section.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-zinc-900 truncate">
            {sectionLabels[section.type]}
          </div>
          <div className="text-xs text-zinc-500 truncate">
            {section.content?.title || section.content?.companyName || 'Sin título'}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={cn(
        "flex items-center gap-1 transition-opacity duration-200",
        isHovered || isSelected ? "opacity-100" : "opacity-0"
      )}>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
          disabled={isFirst}
        >
          <ChevronUp className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
          disabled={isLast}
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
        >
          <Copy className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

interface SectionEditorProps {
  className?: string;
}

export function SectionEditor({ className }: SectionEditorProps) {
  const { 
    sections, 
    selectedSectionId, 
    selectSection, 
    removeSection, 
    reorderSections,
    addSection 
  } = useEditorStore();
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      reorderSections(active.id as string, over.id as string);
    }
    
    setActiveId(null);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      reorderSections(sections[index].id, sections[index - 1].id);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < sections.length - 1) {
      reorderSections(sections[index].id, sections[index + 1].id);
    }
  };

  const handleDuplicate = (section: Section) => {
    addSection(section.type);
  };

  const activeSection = activeId ? sections.find(s => s.id === activeId) : null;

  const availableSections: SectionType[] = [
    'hero', 'features', 'testimonials', 'pricing', 'cta', 'stats', 'faq', 'form', 'footer'
  ];

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <Layout className="w-5 h-5 text-zinc-600" />
          <span className="font-semibold text-zinc-900">Secciones</span>
          <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
            {sections.length}
          </span>
        </div>
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setShowAddMenu(!showAddMenu)}
          >
            <Plus className="w-4 h-4" />
            Añadir
          </Button>
          
          {showAddMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowAddMenu(false)} 
              />
              <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-zinc-200 rounded-xl shadow-xl p-2 min-w-[200px]">
                {availableSections.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      addSection(type);
                      setShowAddMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-100 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600">
                      {sectionIcons[type]}
                    </div>
                    <span className="text-sm font-medium text-zinc-900">
                      {sectionLabels[type]}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Section List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
              <Layout className="w-8 h-8 text-zinc-400" />
            </div>
            <p className="text-zinc-600 font-medium mb-2">No hay secciones</p>
            <p className="text-sm text-zinc-500 mb-4">
              Añade secciones para construir tu landing page
            </p>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setShowAddMenu(true)}
            >
              <Plus className="w-4 h-4" />
              Añadir sección
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section, index) => (
                <SortableSectionItem
                  key={section.id}
                  section={section}
                  isSelected={selectedSectionId === section.id}
                  onSelect={() => selectSection(section.id)}
                  onDelete={() => removeSection(section.id)}
                  onDuplicate={() => handleDuplicate(section)}
                  onMoveUp={() => handleMoveUp(index)}
                  onMoveDown={() => handleMoveDown(index)}
                  isFirst={index === 0}
                  isLast={index === sections.length - 1}
                />
              ))}
            </SortableContext>
            
            <DragOverlay>
              {activeSection && (
                <div className="flex items-center gap-2 p-3 rounded-lg border border-blue-500 bg-blue-50 shadow-xl">
                  <GripVertical className="w-4 h-4 text-zinc-400" />
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    {sectionIcons[activeSection.type]}
                  </div>
                  <span className="text-sm font-medium text-zinc-900">
                    {sectionLabels[activeSection.type]}
                  </span>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Footer hint */}
      <div className="p-4 border-t border-zinc-200 bg-zinc-50">
        <p className="text-xs text-zinc-500 text-center">
          Arrastra para reordenar • Haz clic para editar
        </p>
      </div>
    </div>
  );
}
