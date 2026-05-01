import { useEffect, useRef, useState } from 'react';
import { Eraser, Pen, Trash2 } from 'lucide-react';

export default function HandwritingWidget() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCtx = () => canvasRef.current?.getContext('2d') ?? null;

  const getPos = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    drawing.current = true;
    lastPos.current = getPos(e);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!drawing.current || !lastPos.current) return;
    const ctx = getCtx();
    if (!ctx) return;

    const pos = getPos(e);
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = tool === 'eraser' ? 14 : 3;
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : '#1e293b';
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastPos.current = pos;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1 mb-2 shrink-0">
        <button onClick={() => setTool('pen')} className={`p-1 rounded ${tool === 'pen' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}>
          <Pen size={13} />
        </button>
        <button onClick={() => setTool('eraser')} className={`p-1 rounded ${tool === 'eraser' ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-gray-100'}`}>
          <Eraser size={13} />
        </button>
        <button onClick={clear} className="p-1 rounded text-gray-500 hover:bg-gray-100 hover:text-red-500">
          <Trash2 size={13} />
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="flex-1 w-full border border-gray-200 rounded-lg"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={() => {
          drawing.current = false;
          lastPos.current = null;
        }}
        onMouseLeave={() => {
          drawing.current = false;
          lastPos.current = null;
        }}
      />
    </div>
  );
}
