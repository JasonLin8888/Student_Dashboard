import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Code2,
  File,
  FileText,
  Mail,
  Network,
  PenLine,
  Timer,
} from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { WidgetType, useDashboardCustomization } from '../../context/DashboardCustomizationContext';

const items: Array<{ type: WidgetType; label: string; icon: React.ComponentType<{ size?: string | number }> }> = [
  { type: 'calendar', label: 'Calendar', icon: Calendar },
  { type: 'todo', label: 'To-Do List', icon: CheckSquare },
  { type: 'inbox', label: 'Inbox', icon: Mail },
  { type: 'classview', label: 'Class View', icon: BookOpen },
  { type: 'notes', label: 'Notes', icon: FileText },
  { type: 'latex', label: 'LaTeX Editor', icon: Code2 },
  { type: 'handwriting', label: 'Handwriting', icon: PenLine },
  { type: 'mindmap', label: 'Mind Map', icon: Network },
  { type: 'pomodoro', label: 'Pomodoro', icon: Timer },
  { type: 'fileviewer', label: 'File Viewer', icon: File },
];

interface WidgetPaletteProps {
  pageKey: string;
  collapsed: boolean;
  onToggle: () => void;
}

function DraggablePaletteItem({
  type,
  label,
  Icon,
  onAdd,
}: {
  type: WidgetType;
  label: string;
  Icon: React.ComponentType<{ size?: string | number }>;
  onAdd: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type },
  });

  return (
    <button
      ref={setNodeRef}
      onClick={onAdd}
      {...listeners}
      {...attributes}
      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors text-sm ${isDragging ? 'opacity-40' : ''}`}
    >
      <Icon size={14} />
      <span>{label}</span>
    </button>
  );
}

export default function WidgetPalette({ pageKey, collapsed, onToggle }: WidgetPaletteProps) {
  const { addWidget } = useDashboardCustomization();

  if (collapsed) {
    return (
      <aside className="w-10 border-l border-gray-200 bg-white flex items-start justify-center py-3">
        <button
          onClick={onToggle}
          className="p-1 rounded text-gray-500 hover:bg-gray-100"
          title="Expand widget palette"
        >
          <ChevronLeft size={14} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-64 border-l border-gray-200 bg-white p-3 overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Widgets</p>
        <button
          onClick={onToggle}
          className="p-1 rounded text-gray-500 hover:bg-gray-100"
          title="Collapse widget palette"
        >
          <ChevronRight size={14} />
        </button>
      </div>
      <p className="text-[11px] text-gray-400 mb-3">Click to add. Then drag on the canvas to place.</p>
      <div className="space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <DraggablePaletteItem
              key={item.type}
              type={item.type}
              label={item.label}
              Icon={Icon}
              onAdd={() => addWidget(pageKey, item.type)}
            />
          );
        })}
      </div>
    </aside>
  );
}
