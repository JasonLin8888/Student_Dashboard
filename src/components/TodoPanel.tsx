import { useMemo, useState } from 'react';
import { CheckCircle2, Circle, Clock3, Plus, Settings2, Trash2 } from 'lucide-react';
import { mockTasks, mockClasses } from '../data/mockData';
import { Task } from '../types';
import TaskEditor, { TodoEditorTask, TodoTaskStatus } from './TaskEditor';

interface TodoPanelProps {
  filterClassId?: string;
}

type TaskStatus = TodoTaskStatus;

interface EnhancedTask extends Task {
  status: TaskStatus;
  order: number;
}

const STORAGE_KEY = 'student-dashboard-email-style-tasks-v1';

function statusFromTask(task: Task): TaskStatus {
  return task.completed ? 'done' : 'todo';
}

function toEnhanced(tasks: Task[]): EnhancedTask[] {
  return tasks.map((task, index) => ({
    ...task,
    status: statusFromTask(task),
    order: index,
  }));
}

function loadTasks(): EnhancedTask[] {
  if (typeof window === 'undefined') {
    return toEnhanced(mockTasks);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return toEnhanced(mockTasks);
  }

  try {
    const parsed = JSON.parse(raw) as EnhancedTask[];
    return parsed
      .map((task, index) => ({
        ...task,
        status: task.status ?? (task.completed ? 'done' : 'todo'),
        order: Number.isFinite(task.order) ? task.order : index,
      }))
      .sort((a, b) => a.order - b.order);
  } catch {
    return toEnhanced(mockTasks);
  }
}

function saveTasks(tasks: EnhancedTask[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function cycleStatus(current: TaskStatus): TaskStatus {
  if (current === 'todo') return 'in_progress';
  if (current === 'in_progress') return 'done';
  return 'todo';
}

function statusIcon(status: TaskStatus) {
  if (status === 'done') {
    return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  }
  if (status === 'in_progress') {
    return <Clock3 className="w-4 h-4 text-amber-500" />;
  }
  return <Circle className="w-4 h-4 text-gray-300" />;
}

function statusLabel(status: TaskStatus) {
  if (status === 'in_progress') return 'In Progress';
  if (status === 'done') return 'Done';
  return 'To Do';
}

export default function TodoPanel({ filterClassId }: TodoPanelProps) {
  const [tasks, setTasks] = useState<EnhancedTask[]>(() => loadTasks());
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | TaskStatus>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [editorTaskId, setEditorTaskId] = useState<string | null>(null);

  const updateTasks = (updater: (current: EnhancedTask[]) => EnhancedTask[]) => {
    setTasks((current) => {
      const next = updater(current).map((task, index) => ({
        ...task,
        completed: task.status === 'done',
        order: index,
      }));
      saveTasks(next);
      return next;
    });
  };

  const visibleTasks = useMemo(() => {
    const source = filterClassId ? tasks.filter((task) => task.classId === filterClassId) : tasks;
    if (filter === 'all') return source;
    return source.filter((task) => task.status === filter);
  }, [tasks, filter, filterClassId]);

  const toggleTask = (id: string) => {
    updateTasks((current) => current.map((task) => (
      task.id === id ? { ...task, status: cycleStatus(task.status) } : task
    )));
  };

  const deleteTask = (id: string) => {
    updateTasks((current) => current.filter((task) => task.id !== id));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: EnhancedTask = {
      id: `t${Date.now()}`,
      title: newTaskTitle.trim(),
      completed: false,
      status: 'todo',
      order: tasks.length,
      priority: 'medium',
      classId: filterClassId,
      createdAt: new Date().toISOString(),
    };
    updateTasks((current) => [newTask, ...current]);
    setNewTaskTitle('');
  };

  const startEditing = (task: EnhancedTask) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  };

  const commitEditing = () => {
    if (!editingId) return;
    const title = editingTitle.trim();
    if (!title) {
      setEditingId(null);
      return;
    }

    updateTasks((current) => current.map((task) => (
      task.id === editingId ? { ...task, title } : task
    )));
    setEditingId(null);
  };

  const updateDueDate = (id: string, dueDate: string) => {
    updateTasks((current) => current.map((task) => (
      task.id === id ? { ...task, dueDate: dueDate || undefined } : task
    )));
  };

  const reorder = (dragId: string, overId: string) => {
    if (dragId === overId) return;
    updateTasks((current) => {
      const next = [...current];
      const fromIndex = next.findIndex((task) => task.id === dragId);
      const toIndex = next.findIndex((task) => task.id === overId);
      if (fromIndex < 0 || toIndex < 0) return current;

      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const getClassName = (classId?: string) => {
    return mockClasses.find(c => c.id === classId)?.name ?? '';
  };

  const editorTask = useMemo(() => {
    if (!editorTaskId) return null;
    return tasks.find((task) => task.id === editorTaskId) ?? null;
  }, [tasks, editorTaskId]);

  const saveFromEditor = (patch: Partial<TodoEditorTask>) => {
    if (!editorTask) return;

    updateTasks((current) => current.map((task) => {
      if (task.id !== editorTask.id) return task;
      return {
        ...task,
        title: patch.title ?? task.title,
        description: patch.description,
        dueDate: patch.dueDate,
        status: patch.status ?? task.status,
        customFields: patch.customFields ?? task.customFields,
      };
    }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-800">To-Do List</h2>
          <span className="text-xs text-gray-400">{tasks.filter(t => t.status !== 'done').length} remaining</span>
        </div>
        {/* Filter tabs */}
        <div className="flex gap-1">
          {(['all', 'todo', 'in_progress', 'done'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 text-xs rounded-full capitalize transition-colors ${
                filter === f ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {f === 'in_progress' ? 'in progress' : f}
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
        {visibleTasks.map(task => (
          <div
            key={task.id}
            draggable
            onDragStart={() => setDraggedId(task.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (!draggedId) return;
              reorder(draggedId, task.id);
              setDraggedId(null);
            }}
            onDragEnd={() => setDraggedId(null)}
            className={`flex items-start gap-2 p-2 rounded-lg group border ${
              draggedId === task.id ? 'border-indigo-300 bg-indigo-50' : 'border-transparent hover:bg-gray-50'
            }`}
          >
            <button onClick={() => toggleTask(task.id)} className="mt-0.5 flex-shrink-0">
              {statusIcon(task.status)}
            </button>
            <div className="flex-1 min-w-0">
              {editingId === task.id ? (
                <input
                  autoFocus
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={commitEditing}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitEditing();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="text-sm w-full bg-white border border-indigo-200 rounded px-1.5 py-0.5 outline-none"
                />
              ) : (
                <button
                  onClick={() => startEditing(task)}
                  className={`text-sm text-left ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}
                >
                  {task.title}
                </button>
              )}
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">{statusLabel(task.status)}</span>
                <input
                  type="date"
                  value={task.dueDate ?? ''}
                  onChange={(e) => updateDueDate(task.id, e.target.value)}
                  className="text-xs border border-gray-200 rounded px-1.5 py-0.5 text-gray-500 bg-white"
                />
                {!filterClassId && task.classId && (
                  <span className="text-xs text-indigo-500">{getClassName(task.classId)}</span>
                )}
              </div>
              {task.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
              )}
              {!!task.customFields && Object.keys(task.customFields).length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {Object.entries(task.customFields).slice(0, 3).map(([key, value]) => (
                    <span key={key} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                      {key}: {value || '-'}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setEditorTaskId(task.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              title="Open task editor"
            >
              <Settings2 className="w-3.5 h-3.5 text-gray-400 hover:text-indigo-600" />
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
            </button>
          </div>
        ))}
        {visibleTasks.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No tasks {filter !== 'all' ? `(${filter})` : ''}
          </div>
        )}
      </div>

      {editorTask && (
        <TaskEditor
          task={editorTask}
          onClose={() => setEditorTaskId(null)}
          onSave={saveFromEditor}
        />
      )}
    </div>
  );
}
