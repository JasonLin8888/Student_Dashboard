import { useState } from 'react';
import { Plus, Search, Tag, Edit3, Trash2 } from 'lucide-react';
import { mockNotes, mockClasses } from '../data/mockData';
import { Note } from '../types';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0] ?? null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingContent, setEditingContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const getClassName = (classId?: string) =>
    mockClasses.find(c => c.id === classId)?.name ?? 'General';

  const getClassColor = (classId?: string) =>
    mockClasses.find(c => c.id === classId)?.color ?? '#6366F1';

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createNote = () => {
    const newNote: Note = {
      id: `n${Date.now()}`,
      title: 'Untitled Note',
      content: '# Untitled Note\n\nStart typing...',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      tags: [],
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setEditingContent(newNote.content);
    setIsEditing(true);
  };

  const startEditing = () => {
    if (selectedNote) {
      setEditingContent(selectedNote.content);
      setIsEditing(true);
    }
  };

  const saveNote = () => {
    if (!selectedNote) return;
    const updated = notes.map(n =>
      n.id === selectedNote.id
        ? { ...n, content: editingContent, updatedAt: new Date().toISOString().split('T')[0] }
        : n
    );
    setNotes(updated);
    setSelectedNote({ ...selectedNote, content: editingContent });
    setIsEditing(false);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    if (selectedNote?.id === id) setSelectedNote(null);
  };

  const escapeHtml = (str: string) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line) => {
        if (line.startsWith('# ')) return `<h1 class="text-2xl font-bold text-gray-900 mb-3">${escapeHtml(line.slice(2))}</h1>`;
        if (line.startsWith('## ')) return `<h2 class="text-lg font-semibold text-gray-800 mb-2 mt-4">${escapeHtml(line.slice(3))}</h2>`;
        if (line.startsWith('### ')) return `<h3 class="text-base font-semibold text-gray-700 mb-1 mt-3">${escapeHtml(line.slice(4))}</h3>`;
        if (line.startsWith('- ') || line.startsWith('* ')) return `<li class="ml-4 text-gray-600 mb-1">${escapeHtml(line.slice(2))}</li>`;
        if (line.match(/^\d+\. /)) return `<li class="ml-4 text-gray-600 mb-1 list-decimal">${escapeHtml(line.replace(/^\d+\. /, ''))}</li>`;
        if (line === '') return `<div class="h-2"></div>`;
        return `<p class="text-gray-600 mb-1 leading-relaxed">${escapeHtml(line)}</p>`;
      })
      .join('');
  };

  return (
    <div className="h-full flex">
      {/* Sidebar - note list */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">Notes</h2>
            <button
              onClick={createNote}
              className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <Search className="w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {filtered.map(note => (
            <button
              key={note.id}
              onClick={() => { setSelectedNote(note); setIsEditing(false); }}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 group ${
                selectedNote?.id === note.id ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{note.title}</p>
                  <p className="text-xs text-gray-400 truncate">{note.updatedAt}</p>
                  {note.classId && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getClassColor(note.classId) }} />
                      <span className="text-xs text-gray-500">{getClassName(note.classId)}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); deleteNote(note.id); }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Note editor/viewer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedNote ? (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
              <div className="flex items-center gap-2">
                {selectedNote.classId && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                    style={{ backgroundColor: getClassColor(selectedNote.classId) }}
                  >
                    {getClassName(selectedNote.classId)}
                  </span>
                )}
                <div className="flex gap-1">
                  {selectedNote.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" />{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <button
                    onClick={saveNote}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={startEditing}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isEditing ? (
                <textarea
                  value={editingContent}
                  onChange={e => setEditingContent(e.target.value)}
                  className="w-full h-full p-6 text-sm font-mono text-gray-800 outline-none resize-none bg-gray-50"
                  placeholder="Write your note in Markdown..."
                />
              ) : (
                <div
                  className="p-8 max-w-3xl"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedNote.content) }}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Edit3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a note or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
