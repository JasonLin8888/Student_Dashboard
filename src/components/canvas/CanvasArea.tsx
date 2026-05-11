import { useCallback, useEffect, useRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useDashboardCustomization, GRID_SIZE } from '../../context/DashboardCustomizationContext';
import WidgetFrame from './WidgetFrame';
import type { WidgetType } from '../../context/DashboardCustomizationContext';

interface CanvasAreaProps {
  pageKey: string;
  classId?: string;
  draggingType: WidgetType | null;
  onDraggedPos: (pos: { x: number; y: number; width: number; height: number } | null) => void;
  onBoundsChange?: (bounds: { width: number; height: number } | null) => void;
}

export default function CanvasArea({ pageKey, classId, draggingType, onDraggedPos, onBoundsChange }: CanvasAreaProps) {
  const { widgetsByPage } = useDashboardCustomization();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number } | null>(null);
  const widgets = widgetsByPage[pageKey] ?? [];
  const { setNodeRef, isOver } = useDroppable({ id: `canvas-${pageKey}` });

  const combineRef = (el: HTMLDivElement | null) => {
    (canvasRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    setNodeRef(el);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.style.minHeight = `${Math.max(700, rect.height)}px`;
      onBoundsChange?.({ width: rect.width, height: rect.height });
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      onBoundsChange?.(null);
    };
  }, [onBoundsChange]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingType || !isOver) {
      setPreviewPos(null);
      onDraggedPos(null);
      return;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = snap(e.clientX - rect.left);
    const y = snap(e.clientY - rect.top);

    setPreviewPos({ x, y });
    onDraggedPos({ x, y, width: rect.width, height: rect.height });
  }, [draggingType, isOver, onDraggedPos]);

  return (
    <div
      ref={combineRef}
      className={`relative flex-1 overflow-y-auto overflow-x-hidden ${isOver ? 'bg-indigo-50/40' : ''}`}
      style={{
        backgroundImage: 'radial-gradient(circle at 0 0, #d1d5db 1px, transparent 1px)',
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setPreviewPos(null);
        onDraggedPos(null);
      }}
    >
      {previewPos && draggingType && (
        <div
          className="absolute border-2 border-dashed border-indigo-400 bg-indigo-50/40 rounded-lg pointer-events-none"
          style={{ left: previewPos.x, top: previewPos.y, width: 220, height: 140, zIndex: 10 }}
        />
      )}

      {widgets.map((widget) => (
        <WidgetFrame key={widget.id} pageKey={pageKey} widget={widget} canvasRef={canvasRef} classId={classId} />
      ))}
    </div>
  );
}

function snap(value: number) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}
