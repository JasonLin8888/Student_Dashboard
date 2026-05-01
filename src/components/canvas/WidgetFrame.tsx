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
  const { isEditing, updateWidget, removeWidget, bringToFront, canPlaceWidget } = useDashboardCustomization();
  const drag = useRef<{ startX: number; startY: number; wx: number; wy: number; x: number; y: number } | null>(null);
  const resize = useRef<{ startX: number; startY: number; width: number; height: number } | null>(null);

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

        if (!canPlaceWidget(pageKey, nx, ny, widget.width, widget.height, {
          width: canvasRect.width,
          height: canvasRect.height,
        }, widget.id)) {
          return;
        }
      }

      drag.current.x = nx;
      drag.current.y = ny;
      updateWidget(pageKey, widget.id, { x: nx, y: ny });
    };

    const onUp = () => {
      if (drag.current) {
        const snappedX = Math.round(drag.current.x / GRID_SIZE) * GRID_SIZE;
        const snappedY = Math.round(drag.current.y / GRID_SIZE) * GRID_SIZE;
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        if (!canvasRect || canPlaceWidget(pageKey, Math.max(0, snappedX), Math.max(0, snappedY), widget.width, widget.height, {
          width: canvasRect.width,
          height: canvasRect.height,
        }, widget.id)) {
          updateWidget(pageKey, widget.id, { x: Math.max(0, snappedX), y: Math.max(0, snappedY) });
        }
      }
      drag.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [bringToFront, canvasRef, isEditing, pageKey, updateWidget, widget.height, widget.id, widget.width, widget.x, widget.y]);

  const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isEditing) return;

    e.preventDefault();
    e.stopPropagation();
    resize.current = { startX: e.clientX, startY: e.clientY, width: widget.width, height: widget.height };

    const onMove = (mv: MouseEvent) => {
      if (!resize.current) return;

      const canvasRect = canvasRef.current?.getBoundingClientRect();
      let width = Math.max(MIN_W, resize.current.width + mv.clientX - resize.current.startX);
      let height = Math.max(MIN_H, resize.current.height + mv.clientY - resize.current.startY);

      if (canvasRect) {
        width = Math.min(width, canvasRect.width - widget.x);
        height = Math.min(height, canvasRect.height - widget.y);

        if (!canPlaceWidget(pageKey, widget.x, widget.y, width, height, {
          width: canvasRect.width,
          height: canvasRect.height,
        }, widget.id)) {
          return;
        }
      }

      updateWidget(pageKey, widget.id, { width, height });
    };

    const onUp = () => {
      resize.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [canvasRef, canPlaceWidget, isEditing, pageKey, updateWidget, widget.height, widget.id, widget.width, widget.x, widget.y]);

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
      className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
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
        <div className="relative h-[calc(100%-34px)] p-2">
          <WidgetRenderer type={widget.type} classId={classId} />
          {isEditing && (
            <div
              onMouseDown={onResizeMouseDown}
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
              style={{
                background: 'linear-gradient(135deg, transparent 50%, #d1d5db 50%)',
                borderRadius: '0 0 4px 0',
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
