import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { Edit2 } from 'lucide-react';
import PageTabs from '../topCanvas/PageTabs';
import { useDashboardCustomization, WidgetType } from '../../context/DashboardCustomizationContext';
import CanvasArea from './CanvasArea';
import WidgetPalette from './WidgetPalette';

interface EditableCanvasPageProps {
  pageKey: string;
  pageTitle: string;
  template: 'main' | 'class' | 'custom';
  classId?: string;
}

export default function EditableCanvasPage({ pageKey, pageTitle, template, classId }: EditableCanvasPageProps) {
  const {
    isEditing,
    ensurePageLayout,
    addWidgetAtPosition,
    resolvePageName,
    renamePageByKey,
  } = useDashboardCustomization();
  const [draggingType, setDraggingType] = useState<WidgetType | null>(null);
  const [draggedPos, setDraggedPos] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [canvasBounds, setCanvasBounds] = useState<{ width: number; height: number } | null>(null);
  const [paletteCollapsed, setPaletteCollapsed] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const resolvedTitle = useMemo(() => resolvePageName(pageKey, pageTitle), [pageKey, pageTitle, resolvePageName]);

  useEffect(() => {
    ensurePageLayout(pageKey, template);
  }, [ensurePageLayout, pageKey, template]);

  useEffect(() => {
    setTitleDraft(resolvedTitle);
    setEditingTitle(false);
  }, [resolvedTitle]);

  const handleDragStart = (event: DragStartEvent) => {
    const type = event.active.data.current?.type as WidgetType | undefined;
    if (type) {
      setDraggingType(type);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const type = event.active.data.current?.type as WidgetType | undefined;
    const overCanvas = event.over?.id === `canvas-${pageKey}`;

    setDraggingType(null);

    if (!type || !overCanvas || !draggedPos) {
      setDraggedPos(null);
      return;
    }

    addWidgetAtPosition(pageKey, type, draggedPos.x, draggedPos.y, {
      width: draggedPos.width,
      height: draggedPos.height,
    });
    setDraggedPos(null);
  };

  const commitTitle = () => {
    const next = titleDraft.trim();
    if (next) {
      renamePageByKey(pageKey, next);
    }
    setEditingTitle(false);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-full p-4 flex flex-col">
        <PageTabs currentPageKey={pageKey} currentPageTitle={resolvedTitle} />

        <div className="mb-3 flex items-center gap-2">
          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitTitle();
                if (e.key === 'Escape') {
                  setTitleDraft(resolvedTitle);
                  setEditingTitle(false);
                }
              }}
              className="text-xl font-bold text-gray-900 bg-transparent border-b border-indigo-400 outline-none"
            />
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              className="inline-flex items-center gap-1.5 text-xl font-bold text-gray-900"
              title="Click to rename page"
            >
              {resolvedTitle}
              <Edit2 className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-hidden rounded-xl border border-gray-200 bg-white flex">
          <CanvasArea
            pageKey={pageKey}
            classId={classId}
            draggingType={draggingType}
            onDraggedPos={setDraggedPos}
            onBoundsChange={setCanvasBounds}
          />
          {isEditing && (
            <WidgetPalette
              pageKey={pageKey}
              collapsed={paletteCollapsed}
              onToggle={() => setPaletteCollapsed((current) => !current)}
            />
          )}
        </div>
      </div>

      <DragOverlay>
        {draggingType && (
          <div className="bg-white border border-indigo-300 rounded-lg shadow-xl px-3 py-2 text-xs font-semibold text-indigo-600 opacity-90 pointer-events-none">
            + {draggingType}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
