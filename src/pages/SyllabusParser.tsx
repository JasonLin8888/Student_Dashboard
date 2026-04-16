import { useState } from 'react';
import { Upload, FileText, Calendar, CheckSquare, AlertCircle, Loader2 } from 'lucide-react';

interface ParsedData {
  courseName: string;
  professor: string;
  dates: { date: string; description: string; type: 'assignment' | 'exam' | 'event' }[];
  policies: { title: string; summary: string }[];
}

const MOCK_PARSED: ParsedData = {
  courseName: 'Introduction to Computer Science',
  professor: 'Dr. Smith',
  dates: [
    { date: '2024-10-20', description: 'Assignment 3: Binary Trees', type: 'assignment' },
    { date: '2024-10-25', description: 'Midterm Exam (Chapters 1-5)', type: 'exam' },
    { date: '2024-11-10', description: 'Assignment 4: Graph Algorithms', type: 'assignment' },
    { date: '2024-11-20', description: 'Project Proposal Due', type: 'assignment' },
    { date: '2024-12-05', description: 'Final Project Submission', type: 'assignment' },
    { date: '2024-12-15', description: 'Final Exam', type: 'exam' },
  ],
  policies: [
    { title: 'Late Work', summary: 'Assignments lose 10% per day late. No submissions accepted after 5 days.' },
    { title: 'Attendance', summary: 'Students may miss up to 3 classes. Excessive absences may result in grade reduction.' },
    { title: 'Academic Integrity', summary: 'All submitted work must be your own. Collaboration is allowed on homework but not exams.' },
    { title: 'Grading', summary: 'Assignments 40%, Midterm 25%, Final 35%. Letter grades follow standard 90/80/70/60 scale.' },
  ],
};

export default function SyllabusParser() {
  const [stage, setStage] = useState<'upload' | 'parsing' | 'results'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState<ParsedData | null>(null);
  const [addedToCalendar, setAddedToCalendar] = useState<Set<string>>(new Set());
  const [addedToTodo, setAddedToTodo] = useState<Set<string>>(new Set());

  const handleFile = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setStage('parsing');
    setTimeout(() => {
      setParsed(MOCK_PARSED);
      setStage('results');
    }, 2000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const addToCalendar = (id: string) => {
    setAddedToCalendar(prev => new Set([...prev, id]));
  };

  const addToTodo = (id: string) => {
    setAddedToTodo(prev => new Set([...prev, id]));
  };

  const addAll = () => {
    if (!parsed) return;
    const allIds = parsed.dates.map((_, i) => `date-${i}`);
    setAddedToCalendar(new Set(allIds));
    setAddedToTodo(new Set(allIds));
  };

  const typeColors: Record<string, string> = {
    assignment: 'bg-indigo-100 text-indigo-700',
    exam: 'bg-red-100 text-red-700',
    event: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Syllabus Parser</h1>
          <p className="text-gray-500 text-sm">
            Upload your course syllabus to automatically extract dates, assignments, and policies.
          </p>
        </div>

        {stage === 'upload' && (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 bg-gray-50'
            }`}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">Drop your syllabus here</p>
            <p className="text-sm text-gray-500 mb-4">Supports PDF, DOCX, and TXT files</p>
            <label className="inline-block cursor-pointer">
              <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileInput} />
              <span className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
                Browse Files
              </span>
            </label>
          </div>
        )}

        {stage === 'parsing' && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-800 mb-1">Parsing Syllabus</p>
            <p className="text-sm text-gray-500">Extracting dates, assignments, and policies from <strong>{fileName}</strong>...</p>
          </div>
        )}

        {stage === 'results' && parsed && (
          <div className="space-y-4">
            {/* Course info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <div>
                  <h2 className="font-semibold text-gray-900">{parsed.courseName}</h2>
                  <p className="text-sm text-gray-500">Instructor: {parsed.professor}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={addAll}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  <Calendar className="w-4 h-4" />
                  Add All to Calendar &amp; Tasks
                </button>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Extracted Dates ({parsed.dates.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-50">
                {parsed.dates.map((item, i) => {
                  const id = `date-${i}`;
                  const isAddedCalendar = addedToCalendar.has(id);
                  const isAddedTodo = addedToTodo.has(id);
                  return (
                    <div key={id} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[item.type]}`}>
                            {item.type}
                          </span>
                          <p className="text-sm font-medium text-gray-800">{item.description}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{item.date}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => addToCalendar(id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isAddedCalendar
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-700'
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          {isAddedCalendar ? 'Added' : 'Calendar'}
                        </button>
                        <button
                          onClick={() => addToTodo(id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isAddedTodo
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-700'
                          }`}
                        >
                          <CheckSquare className="w-3 h-3" />
                          {isAddedTodo ? 'Added' : 'Task'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Policies */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Course Policies
                </h3>
              </div>
              <div className="p-5 space-y-4">
                {parsed.policies.map((policy, i) => (
                  <div key={i}>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">{policy.title}</h4>
                    <p className="text-sm text-gray-600">{policy.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload another */}
            <button
              onClick={() => { setStage('upload'); setFileName(''); setParsed(null); setAddedToCalendar(new Set()); setAddedToTodo(new Set()); }}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Upload another syllabus
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
