import { useParams } from 'react-router-dom';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { BookOpen, Clock, MapPin, User } from 'lucide-react';
import { mockClasses, mockAssignments, mockNotes } from '../data/mockData';
import CalendarPanel from '../components/CalendarPanel';
import TodoPanel from '../components/TodoPanel';
import { Assignment } from '../types';

function AssignmentList({ classId }: { classId: string }) {
  const assignments = mockAssignments.filter(a => a.classId === classId);

  const statusStyles: Record<Assignment['status'], string> = {
    'not-started': 'bg-gray-100 text-gray-600',
    'in-progress': 'bg-amber-100 text-amber-700',
    'completed': 'bg-green-100 text-green-700',
    'submitted': 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800">Assignments</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {assignments.map(a => (
          <div key={a.id} className="p-3 border border-gray-100 rounded-lg hover:border-indigo-200 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-sm font-medium text-gray-800">{a.title}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${statusStyles[a.status]}`}>
                {a.status.replace('-', ' ')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-1">Due: {a.dueDate} · {a.points} pts</p>
            <p className="text-xs text-gray-400 line-clamp-2">{a.instructions}</p>
            {a.grade !== undefined && (
              <p className="text-xs font-medium text-green-600 mt-1">Grade: {a.grade}%</p>
            )}
          </div>
        ))}
        {assignments.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No assignments yet</p>
        )}
      </div>
    </div>
  );
}

function NotesList({ classId }: { classId: string }) {
  const notes = mockNotes.filter(n => n.classId === classId);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800">Notes</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notes.map(n => (
          <div key={n.id} className="p-3 border border-gray-100 rounded-lg hover:border-indigo-200 cursor-pointer transition-colors">
            <p className="text-sm font-medium text-gray-800 mb-1">{n.title}</p>
            <p className="text-xs text-gray-500 mb-2">Updated {n.updatedAt}</p>
            <p className="text-xs text-gray-400 line-clamp-3">{n.content.replace(/[#*]/g, '')}</p>
            <div className="flex gap-1 mt-2 flex-wrap">
              {n.tags.map(tag => (
                <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        ))}
        {notes.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No notes yet</p>
        )}
      </div>
    </div>
  );
}

export default function ClassDashboard() {
  const { classId } = useParams<{ classId: string }>();
  const cls = mockClasses.find(c => c.id === classId);

  if (!cls) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Class not found
      </div>
    );
  }

  return (
    <div className="h-full p-4 flex flex-col">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cls.color }} />
          <h1 className="text-xl font-bold text-gray-900">{cls.name}</h1>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500 ml-7">
          <span className="flex items-center gap-1"><User className="w-3 h-3" />{cls.professor}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{cls.schedule}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{cls.room}</span>
          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{cls.credits} credits</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full gap-3">
          {/* Assignments */}
          <Panel defaultSize={30} minSize={20}>
            <div className="h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
              <AssignmentList classId={cls.id} />
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-indigo-400 rounded cursor-col-resize transition-colors" />

          {/* Notes */}
          <Panel defaultSize={35} minSize={20}>
            <div className="h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
              <NotesList classId={cls.id} />
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-gray-200 hover:bg-indigo-400 rounded cursor-col-resize transition-colors" />

          {/* Calendar + Todo */}
          <Panel defaultSize={35} minSize={20}>
            <PanelGroup direction="vertical" className="h-full gap-3">
              <Panel defaultSize={55} minSize={30}>
                <div className="h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <CalendarPanel filterClassId={cls.id} />
                </div>
              </Panel>
              <PanelResizeHandle className="h-1 bg-gray-200 hover:bg-indigo-400 rounded cursor-row-resize transition-colors" />
              <Panel defaultSize={45} minSize={25}>
                <div className="h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <TodoPanel filterClassId={cls.id} />
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
