import { useState, useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Trash2 } from 'lucide-react';

const initialNodes: Node[] = [
  { id: '1', position: { x: 400, y: 300 }, data: { label: 'CS Midterm Prep' }, style: { background: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', fontWeight: 600 } },
  { id: '2', position: { x: 200, y: 180 }, data: { label: 'Data Structures' }, style: { background: '#EEF2FF', border: '2px solid #4F46E5', borderRadius: '8px', padding: '8px 14px' } },
  { id: '3', position: { x: 600, y: 180 }, data: { label: 'Algorithms' }, style: { background: '#EEF2FF', border: '2px solid #4F46E5', borderRadius: '8px', padding: '8px 14px' } },
  { id: '4', position: { x: 100, y: 320 }, data: { label: 'Arrays' }, style: { background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 12px', fontSize: '12px' } },
  { id: '5', position: { x: 240, y: 320 }, data: { label: 'Linked Lists' }, style: { background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 12px', fontSize: '12px' } },
  { id: '6', position: { x: 540, y: 320 }, data: { label: 'Sorting' }, style: { background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 12px', fontSize: '12px' } },
  { id: '7', position: { x: 680, y: 320 }, data: { label: 'Searching' }, style: { background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', padding: '6px 12px', fontSize: '12px' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#4F46E5' } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#4F46E5' } },
  { id: 'e2-4', source: '2', target: '4', style: { stroke: '#9CA3AF' } },
  { id: 'e2-5', source: '2', target: '5', style: { stroke: '#9CA3AF' } },
  { id: 'e3-6', source: '3', target: '6', style: { stroke: '#9CA3AF' } },
  { id: 'e3-7', source: '3', target: '7', style: { stroke: '#9CA3AF' } },
];

export default function MindMapPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeLabel, setNodeLabel] = useState('');

  const onConnect = useCallback((connection: Connection) => {
    setEdges(eds => addEdge({ ...connection, style: { stroke: '#6366F1' } }, eds));
  }, [setEdges]);

  const addNode = () => {
    if (!nodeLabel.trim()) return;
    const newNode: Node = {
      id: `n${Date.now()}`,
      position: { x: Math.random() * 400 + 200, y: Math.random() * 300 + 150 },
      data: { label: nodeLabel },
      style: { background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px 14px' },
    };
    setNodes(nds => [...nds, newNode]);
    setNodeLabel('');
  };

  const deleteSelected = () => {
    setNodes(nds => nds.filter(n => !n.selected));
    setEdges(eds => eds.filter(e => !e.selected));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
        <h2 className="font-semibold text-gray-800">Mind Map</h2>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={nodeLabel}
            onChange={e => setNodeLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addNode()}
            placeholder="New node label..."
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-400 w-48"
          />
          <button
            onClick={addNode}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Node
          </button>
          <button
            onClick={deleteSelected}
            className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* React Flow canvas */}
      <div className="flex-1">
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

      {/* Instructions */}
      <div className="px-4 py-2 bg-white border-t border-gray-200 flex gap-4 text-xs text-gray-400">
        <span>🖱️ Drag nodes to move</span>
        <span>🔗 Drag from a node handle to connect</span>
        <span>✨ Click a node to select, then Delete to remove</span>
      </div>
    </div>
  );
}
