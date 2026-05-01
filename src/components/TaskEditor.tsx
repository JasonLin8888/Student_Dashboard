import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';

export type TodoTaskStatus = 'todo' | 'in_progress' | 'done';

export interface TodoEditorTask {
  id: string;
  title: string;
  dueDate?: string;
  classId?: string;
  status: TodoTaskStatus;
  description?: string;
  customFields?: Record<string, string>;
}

interface TaskEditorProps {
  task: TodoEditorTask;
  onClose: () => void;
  onSave: (patch: Partial<TodoEditorTask>) => void;
}

function statusLabel(status: TodoTaskStatus) {
  if (status === 'in_progress') return 'In Progress';
  if (status === 'done') return 'Done';
  return 'To Do';
}

export default function TaskEditor({ task, onClose, onSave }: TaskEditorProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [dueDate, setDueDate] = useState(task.dueDate ?? '');
  const [status, setStatus] = useState<TodoTaskStatus>(task.status);
  const [fields, setFields] = useState<Record<string, string>>(task.customFields ?? {});
  const [newField, setNewField] = useState('');

  const fieldEntries = useMemo(() => Object.entries(fields), [fields]);

  const commit = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    onSave({
      title: trimmedTitle,
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      status,
      customFields: fields,
    });
    onClose();
  };

  const addField = () => {
    const key = newField.trim();
    if (!key || fields[key] !== undefined) return;
    setFields((current) => ({ ...current, [key]: '' }));
    setNewField('');
  };

  const removeField = (key: string) => {
    setFields((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const updateFieldValue = (key: string, value: string) => {
    setFields((current) => ({ ...current, [key]: value }));
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-gray-200 z-50 shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Edit Task</h3>
            <p className="text-xs text-gray-500">{statusLabel(status)}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 resize-none"
              placeholder="Add details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TodoTaskStatus)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Custom Fields</label>
            <div className="flex items-center gap-2">
              <input
                value={newField}
                onChange={(e) => setNewField(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addField();
                  }
                }}
                placeholder="Field name"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
              <button
                onClick={addField}
                className="inline-flex items-center gap-1 px-2.5 py-2 text-xs rounded-lg border border-gray-200 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>

            <div className="space-y-2">
              {fieldEntries.length === 0 && (
                <p className="text-xs text-gray-400">No custom fields yet.</p>
              )}
              {fieldEntries.map(([key, value]) => (
                <div key={key} className="grid grid-cols-[120px_1fr_auto] gap-2 items-center">
                  <p className="text-xs font-medium text-gray-600 truncate" title={key}>{key}</p>
                  <input
                    value={value}
                    onChange={(e) => updateFieldValue(key, e.target.value)}
                    className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:border-indigo-400"
                    placeholder="Value"
                  />
                  <button onClick={() => removeField(key)} className="text-gray-400 hover:text-red-500 p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-3 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={commit}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
          >
            Save
          </button>
        </div>
      </aside>
    </>
  );
}
