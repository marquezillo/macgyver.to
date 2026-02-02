import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  ChevronDown, 
  ChevronRight,
  Code,
  Database,
  Layout,
  Server,
  Shield,
  Palette,
  Zap,
  FileCode,
  Settings,
  Rocket,
  Download,
  ExternalLink,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  description?: string;
}

export interface TaskSection {
  id: string;
  title: string;
  icon: string;
  tasks: Task[];
  status: 'pending' | 'in-progress' | 'completed';
}

interface TaskPlanViewProps {
  sections: TaskSection[];
  projectName?: string;
  onTaskClick?: (taskId: string) => void;
  previewUrl?: string;
  onDownloadZip?: () => void;
  onOpenPreview?: () => void;
  isProjectComplete?: boolean;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  'code': Code,
  'database': Database,
  'layout': Layout,
  'server': Server,
  'shield': Shield,
  'palette': Palette,
  'zap': Zap,
  'file-code': FileCode,
  'settings': Settings,
  'rocket': Rocket,
};

export function TaskPlanView({ sections, projectName, onTaskClick, previewUrl, onDownloadZip, onOpenPreview, isProjectComplete }: TaskPlanViewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(sections.map(s => s.id)));

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Circle className="h-4 w-4 text-gray-300" />;
    }
  };

  const getSectionStatusIcon = (status: TaskSection['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  const completedTasks = sections.reduce((acc, s) => acc + s.tasks.filter(t => t.status === 'completed').length, 0);
  const totalTasks = sections.reduce((acc, s) => acc + s.tasks.length, 0);
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Rocket className="h-5 w-5 text-purple-500" />
            {projectName || 'Plan del Proyecto'}
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {completedTasks}/{totalTasks} tareas
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Action buttons when project is complete */}
        {(isProjectComplete || progress === 100) && (
          <div className="flex gap-2 mt-3">
            {previewUrl && (
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => window.open(previewUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                Ver Preview
              </Button>
            )}
            {onOpenPreview && (
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1 gap-2"
                onClick={onOpenPreview}
              >
                <Play className="h-4 w-4" />
                Abrir Proyecto
              </Button>
            )}
            {onDownloadZip && (
              <Button 
                size="sm" 
                variant="default"
                className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                onClick={onDownloadZip}
              >
                <Download className="h-4 w-4" />
                Descargar ZIP
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {sections.map((section) => {
          const IconComponent = iconMap[section.icon] || Code;
          const isExpanded = expandedSections.has(section.id);
          const sectionCompletedTasks = section.tasks.filter(t => t.status === 'completed').length;

          return (
            <div key={section.id} className="bg-white dark:bg-gray-900">
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
                <div className={cn(
                  "p-1.5 rounded-lg",
                  section.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                  section.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  'bg-gray-100 dark:bg-gray-800'
                )}>
                  <IconComponent className={cn(
                    "h-4 w-4",
                    section.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                    section.status === 'in-progress' ? 'text-blue-600 dark:text-blue-400' :
                    'text-gray-500 dark:text-gray-400'
                  )} />
                </div>
                <span className="flex-1 text-left font-medium text-gray-900 dark:text-white">
                  {section.title}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {sectionCompletedTasks}/{section.tasks.length}
                </span>
                {getSectionStatusIcon(section.status)}
              </button>

              {/* Tasks */}
              {isExpanded && (
                <div className="pb-2">
                  {section.tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick?.(task.id)}
                      className={cn(
                        "ml-10 mr-4 px-3 py-2 rounded-lg flex items-start gap-3 cursor-pointer transition-colors",
                        task.status === 'in-progress' && 'bg-blue-50 dark:bg-blue-900/20',
                        task.status === 'completed' && 'opacity-60',
                        "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      )}
                    >
                      {getStatusIcon(task.status)}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm",
                          task.status === 'completed' ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'
                        )}>
                          {task.title}
                        </p>
                        {task.description && task.status === 'in-progress' && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper function to parse task plan from AI response
export function parseTaskPlan(content: string): TaskSection[] | null {
  // Look for JSON task plan in the content
  const jsonMatch = content.match(/```json\s*(\{[\s\S]*?"taskPlan"[\s\S]*?\})\s*```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.taskPlan && Array.isArray(parsed.taskPlan.sections)) {
        return parsed.taskPlan.sections;
      }
    } catch (e) {
      console.error('Failed to parse task plan JSON:', e);
    }
  }

  // Look for markdown-style task list
  const sections: TaskSection[] = [];
  const sectionRegex = /##\s*(.+?)\n([\s\S]*?)(?=##\s|$)/g;
  let match;

  while ((match = sectionRegex.exec(content)) !== null) {
    const sectionTitle = match[1].trim();
    const sectionContent = match[2];
    const tasks: Task[] = [];

    // Parse tasks from checkboxes
    const taskRegex = /[-*]\s*\[([ xX])\]\s*(.+)/g;
    let taskMatch;
    let taskIndex = 0;

    while ((taskMatch = taskRegex.exec(sectionContent)) !== null) {
      const isCompleted = taskMatch[1].toLowerCase() === 'x';
      tasks.push({
        id: `task-${sections.length}-${taskIndex}`,
        title: taskMatch[2].trim(),
        status: isCompleted ? 'completed' : 'pending'
      });
      taskIndex++;
    }

    if (tasks.length > 0) {
      const completedCount = tasks.filter(t => t.status === 'completed').length;
      sections.push({
        id: `section-${sections.length}`,
        title: sectionTitle,
        icon: getSectionIcon(sectionTitle),
        tasks,
        status: completedCount === tasks.length ? 'completed' : 
                completedCount > 0 ? 'in-progress' : 'pending'
      });
    }
  }

  return sections.length > 0 ? sections : null;
}

function getSectionIcon(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('base de datos') || lower.includes('database') || lower.includes('schema')) return 'database';
  if (lower.includes('backend') || lower.includes('api') || lower.includes('servidor')) return 'server';
  if (lower.includes('frontend') || lower.includes('ui') || lower.includes('interfaz')) return 'layout';
  if (lower.includes('auth') || lower.includes('seguridad') || lower.includes('autenticación')) return 'shield';
  if (lower.includes('diseño') || lower.includes('estilo') || lower.includes('css')) return 'palette';
  if (lower.includes('deploy') || lower.includes('despliegue') || lower.includes('producción')) return 'rocket';
  if (lower.includes('config') || lower.includes('configuración')) return 'settings';
  if (lower.includes('optimización') || lower.includes('rendimiento')) return 'zap';
  return 'code';
}
