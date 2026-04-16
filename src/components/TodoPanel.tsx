import { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Flag } from 'lucide-react';
import { mockTasks, mockClasses } from '../data/mockData';
import { Task } from '../types';

interface TodoPanelProps {
  filterClassId?: string;
}

const priorityColors: Record<string, string> = {
  high: 'text-red-500',
  medium: 'text-amber-500',
  low: 'text-green-500',
};

export default function TodoPanel({ filterClassId }: TodoPanelProps) {
  const [tasks, setTasks] = useState<Task[]>(
    filterClassId ? mockTasks.filter(t => t.classId === filterClassId) : mockTasks
  );
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: `t${Date.now()}`,
      title: newTaskTitle.trim(),
      completed: false,
      priority: 'medium',
      classId: filterClassId,
      createdAt: new Date().toISOString(),
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const filtered = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const getClassName = (classId?: string) => {
    return mockClasses.find(c => c.id === classId)?.name ?? '';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-800">To-Do List</h2>
          <span className="text-xs text-gray-400">{tasks.filter(t => !t.completed).length} remaining</span>
        </div>
        {/* Filter tabs */}
        <div className="flex gap-1">
          {(['all', 'active', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 text-xs rounded-full capitalize transition-colors ${
                filter === f ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Add task form */}
      <form onSubmit={addTask} className="px-4 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
          <Plus className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
      </form>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {filtered.map(task => (
          <div
            key={task.id}
            className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 group"
          >
            <button onClick={() => toggleTask(task.id)} className="mt-0.5 flex-shrink-0">
              {task.completed
                ? <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                : <Circle className="w-4 h-4 text-gray-300" />
              }
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {task.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {task.dueDate && (
                  <span className="text-xs text-gray-400">Due {task.dueDate}</span>
                )}
                {!filterClassId && task.classId && (
                  <span className="text-xs text-indigo-500">{getClassName(task.classId)}</span>
                )}
              </div>
            </div>
            <Flag className={`w-3.5 h-3.5 flex-shrink-0 ${priorityColors[task.priority]}`} />
            <button
              onClick={() => deleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No tasks {filter !== 'all' ? `(${filter})` : ''}
          </div>
        )}
      </div>
    </div>
  );
}
