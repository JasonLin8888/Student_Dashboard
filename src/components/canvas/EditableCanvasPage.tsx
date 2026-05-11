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
import TopBar from './TopBar';
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
  } = useDashboardCustomization();
  const [draggingType, setDraggingType] = useState<WidgetType | null>(null);
  const [draggedPos, setDraggedPos] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [paletteCollapsed, setPaletteCollapsed] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const resolvedTitle = useMemo(() => resolvePageName(pageKey, pageTitle), [pageKey, pageTitle, resolvePageName]);

  useEffect(() => {
    ensurePageLayout(pageKey, template);
  }, [ensurePageLayout, pageKey, template]);

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

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-full flex flex-col">
        <TopBar currentPageKey={pageKey} currentPageTitle={resolvedTitle} />

        <div className="mt-4 mx-4 flex-1 min-h-0 overflow-hidden rounded-xl border border-gray-200 bg-white flex">
          <CanvasArea
            pageKey={pageKey}
            classId={classId}
            draggingType={draggingType}
            onDraggedPos={setDraggedPos}
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
