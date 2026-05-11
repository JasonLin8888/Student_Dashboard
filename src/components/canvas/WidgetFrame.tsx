import { useCallback, useRef } from 'react';
import { ChevronDown, ChevronUp, GripVertical, X } from 'lucide-react';
import { CanvasWidget, GRID_SIZE, useDashboardCustomization } from '../../context/DashboardCustomizationContext';
import WidgetRenderer from './WidgetRenderer';

interface WidgetFrameProps {
  pageKey: string;
  widget: CanvasWidget;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  classId?: string;
}

const MIN_W = 220;
const MIN_H = 140;

export default function WidgetFrame({ pageKey, widget, canvasRef, classId }: WidgetFrameProps) {
  const { isEditing, updateWidget, removeWidget, bringToFront } = useDashboardCustomization();
  const drag = useRef<{ startX: number; startY: number; wx: number; wy: number; x: number; y: number } | null>(null);
  const resize = useRef<{
    startX: number;
    startY: number;
    x: number;
    y: number;
    width: number;
    height: number;
    direction: string;
  } | null>(null);
  const onHeaderMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isEditing) return;
    if ((e.target as HTMLElement).closest('button')) return;

    e.preventDefault();
    bringToFront(pageKey, widget.id);
    drag.current = { startX: e.clientX, startY: e.clientY, wx: widget.x, wy: widget.y, x: widget.x, y: widget.y };

    const onMove = (mv: MouseEvent) => {
      if (!drag.current) return;

      const dx = mv.clientX - drag.current.startX;
      const dy = mv.clientY - drag.current.startY;
      let nx = drag.current.wx + dx;
      let ny = drag.current.wy + dy;

      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        nx = Math.max(0, Math.min(nx, canvasRect.width - widget.width));
        ny = Math.max(0, Math.min(ny, canvasRect.height - widget.height));
      }

      drag.current.x = nx;
      drag.current.y = ny;
      updateWidget(pageKey, widget.id, { x: nx, y: ny });
    };

    const onUp = () => {
      drag.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [bringToFront, canvasRef, isEditing, pageKey, updateWidget, widget.height, widget.id, widget.width, widget.x, widget.y]);

  const onResizeMouseDown = useCallback((e: React.MouseEvent, direction: string) => {
    if (!isEditing) return;

    e.preventDefault();
    e.stopPropagation();

    resize.current = {
      startX: e.clientX,
      startY: e.clientY,
      x: widget.x,
      y: widget.y,
      width: widget.width,
      height: widget.height,
      direction,
    };

    const onMove = (mv: MouseEvent) => {
      if (!resize.current) return;

      const dx = mv.clientX - resize.current.startX;
      const dy = mv.clientY - resize.current.startY;

      let nextX = resize.current.x;
      let nextY = resize.current.y;
      let nextWidth = resize.current.width;
      let nextHeight = resize.current.height;

      if (direction.includes('e')) {
        nextWidth = resize.current.width + dx;
      }

      if (direction.includes('s')) {
        nextHeight = resize.current.height + dy;
      }

      if (direction.includes('w')) {
        nextX = resize.current.x + dx;
        nextWidth = resize.current.width - dx;
      }

      if (direction.includes('n')) {
        nextY = resize.current.y + dy;
        nextHeight = resize.current.height - dy;
      }

      nextX = Math.round(nextX / GRID_SIZE) * GRID_SIZE;
      nextY = Math.round(nextY / GRID_SIZE) * GRID_SIZE;
      nextWidth = Math.round(nextWidth / GRID_SIZE) * GRID_SIZE;
      nextHeight = Math.round(nextHeight / GRID_SIZE) * GRID_SIZE;

      nextWidth = Math.max(MIN_W, nextWidth);
      nextHeight = Math.max(MIN_H, nextHeight);

      const canvasRect = canvasRef.current?.getBoundingClientRect();

      if (canvasRect) {
        nextX = Math.max(0, nextX);
        nextY = Math.max(0, nextY);
        nextWidth = Math.min(nextWidth, canvasRect.width - nextX);
        nextHeight = Math.min(nextHeight, canvasRect.height - nextY);
      }

      updateWidget(pageKey, widget.id, {
        x: nextX,
        y: nextY,
        width: nextWidth,
        height: nextHeight,
      });
    };

    const onUp = () => {
      resize.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [
    canvasRef,
    isEditing,
    pageKey,
    updateWidget,
    widget.height,
    widget.id,
    widget.width,
    widget.x,
    widget.y,
  ]);

  return (
    <div
      style={{
        position: 'absolute',
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.collapsed ? 'auto' : widget.height,
        zIndex: widget.zIndex,
      }}
      className="relative rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
      onMouseDown={() => bringToFront(pageKey, widget.id)}
    >
      <div
        className={`flex items-center gap-1.5 px-2 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-400 text-white ${isEditing ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
        onMouseDown={onHeaderMouseDown}
      >
        {isEditing && <GripVertical size={13} className="text-white/75" />}
        <span className="text-xs font-semibold truncate flex-1">{widget.title}</span>
        <button
          onClick={() => updateWidget(pageKey, widget.id, { collapsed: !widget.collapsed })}
          className="text-white/80 hover:text-white"
          title={widget.collapsed ? 'Expand' : 'Collapse'}
        >
          {widget.collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
        {isEditing && (
          <button
            onClick={() => removeWidget(pageKey, widget.id)}
            className="text-white/80 hover:text-white"
            title="Remove widget"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {!widget.collapsed && (
        <div className="h-[calc(100%_-_34px)] p-2">
          <WidgetRenderer type={widget.type} classId={classId} />
        </div>
      )}

      {!widget.collapsed && isEditing && (
        <>
          <div
            onMouseDown={(e) => onResizeMouseDown(e, 'n')}
            className="absolute top-0 left-2 right-2 h-2 cursor-n-resize z-10"
          />
          <div
            onMouseDown={(e) => onResizeMouseDown(e, 's')}
            className="absolute bottom-0 left-2 right-2 h-2 cursor-s-resize z-10"
          />
          <div
            onMouseDown={(e) => onResizeMouseDown(e, 'w')}
            className="absolute left-0 top-2 bottom-2 w-2 cursor-w-resize z-10"
          />
          <div
            onMouseDown={(e) => onResizeMouseDown(e, 'e')}
            className="absolute right-0 top-2 bottom-2 w-2 cursor-e-resize z-10"
          />

          <div
            onMouseDown={(e) => onResizeMouseDown(e, 'nw')}
            className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-20"
          />
          <div
            onMouseDown={(e) => onResizeMouseDown(e, 'ne')}
            className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize z-20"
          />
          <div
            onMouseDown={(e) => onResizeMouseDown(e, 'sw')}
            className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize z-20"
          />
          <div
            onMouseDown={(e) => onResizeMouseDown(e, 'se')}
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-20"
          />
        </>
      )}
    </div>
  );
}
