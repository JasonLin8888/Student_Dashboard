import { useCallback, useState } from 'react';
import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Trash2 } from 'lucide-react';

const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 320, y: 220 },
    data: { label: 'Mind Map Root' },
    style: { background: '#4F46E5', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 14px', fontWeight: 600 },
  },
];

const initialEdges: Edge[] = [];

export default function MindMapWidget() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [label, setLabel] = useState('');

  const onConnect = useCallback((connection: Connection) => {
    setEdges((current) => addEdge({ ...connection, style: { stroke: '#6366F1' } }, current));
  }, [setEdges]);

  const addNode = () => {
    const value = label.trim();
    if (!value) return;

    setNodes((current) => [
      ...current,
      {
        id: `n${Date.now()}`,
        position: { x: 160 + Math.random() * 400, y: 120 + Math.random() * 220 },
        data: { label: value },
        style: { background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px 12px' },
      },
    ]);
    setLabel('');
  };

  const removeSelected = () => {
    setNodes((current) => current.filter((item) => !item.selected));
    setEdges((current) => current.filter((item) => !item.selected));
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1.5 mb-2 shrink-0">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addNode();
          }}
          placeholder="New node"
          className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-indigo-400"
        />
        <button onClick={addNode} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
          <Plus size={12} />
          Add
        </button>
        <button onClick={removeSelected} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
          <Trash2 size={12} />
          Delete
        </button>
      </div>

      <div className="flex-1 min-h-0 rounded-lg border border-gray-200 overflow-hidden bg-white">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e5e7eb" />
        </ReactFlow>
      </div>
    </div>
  );
}
