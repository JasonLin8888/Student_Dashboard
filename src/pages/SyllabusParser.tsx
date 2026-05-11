import React, { useEffect, useRef, useState } from 'react';
import {
  Upload,
  FileText,
  Calendar,
  CheckSquare,
  AlertCircle,
  Loader2,
  Check,
  Edit2,
  ArrowLeft,
  Layers,
} from 'lucide-react';

type Section = {
  id: string;
  title: string;
  text: string;
  confidence: number; // 0-100
  confirmed?: boolean;
  editing?: boolean;
};

type SyllabusFile = {
  id: string;
  name: string;
  sections: Section[];
  // mock pages for PDF rendering: each page has blocks with positions (percent)
  pages?: {
    id: string;
    blocks: { id: string; text: string; top: number; left: number; width: number; height: number; sectionId?: string }[];
  }[];
};

const COMMON_SECTIONS = [
  'Attendance Policy',
  'Late Policy',
  'Grading Policy',
  'Academic Integrity Policy',
  'Important Dates',
  'Readings',
];

function uid(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 9);
}

function mockExtractSections(fileName: string, selected: string[]) {
  // create mock sections with random confidence and placeholder text
  const sections = (selected.length ? selected : COMMON_SECTIONS).map((title, i) => ({
    id: uid('sec-'),
    title,
    text: `Extracted content for "${title}" from ${fileName}. This is mocked sample text to demonstrate the verification UI.`,
    confidence: Math.floor(60 + Math.random() * 40),
    confirmed: false,
    editing: false,
  }));
  return sections as Section[];
}

export default function SyllabusParser() {
  const [stage, setStage] = useState<'upload' | 'verify' | 'view'>('verify');
  // Preload two mock syllabi with pages and extracted sections
  const [files, setFiles] = useState<SyllabusFile[]>(() => {
    const f1Id = uid('file-');
    const f2Id = uid('file-');
    const s1_sections: Section[] = [
      { id: uid('sec-'), title: 'Attendance Policy', text: 'Attendance: You may miss up to 3 classes. More absences lower grade.', confidence: 92, confirmed: false },
      { id: uid('sec-'), title: 'Grading Policy', text: 'Grading: Homework 40%, Midterm 25%, Final 35%.', confidence: 88, confirmed: false },
      { id: uid('sec-'), title: 'Important Dates', text: 'Oct 20: Assignment 3. Nov 10: Assignment 4. Dec 15: Final.', confidence: 78, confirmed: false },
    ];
    const s2_sections: Section[] = [
      { id: uid('sec-'), title: 'Attendance Policy', text: 'Attendance required. More than 2 misses requires excuse.', confidence: 85, confirmed: false },
      { id: uid('sec-'), title: 'Academic Integrity Policy', text: 'No cheating. All work must be original.', confidence: 90, confirmed: false },
      { id: uid('sec-'), title: 'Readings', text: 'Chapter readings: Week1-8 as listed in schedule.', confidence: 70, confirmed: false },
    ];

    const f1 = {
      id: f1Id,
      name: 'CS101_Syllabus.pdf',
      sections: s1_sections,
      pages: [
        {
          id: uid('pg-'),
          blocks: [
            { id: uid('b-'), text: 'Course Overview and policies...', top: 5, left: 5, width: 90, height: 20, sectionId: s1_sections[0].id },
            { id: uid('b-'), text: 'Grading breakdown and scale...', top: 30, left: 5, width: 90, height: 20, sectionId: s1_sections[1].id },
            { id: uid('b-'), text: 'Schedule and important dates...', top: 60, left: 5, width: 90, height: 25, sectionId: s1_sections[2].id },
          ],
        },
      ],
    } as SyllabusFile;

    const f2 = {
      id: f2Id,
      name: 'ENG201_Syllabus.pdf',
      sections: s2_sections,
      pages: [
        {
          id: uid('pg-'),
          blocks: [
            { id: uid('b-'), text: 'Attendance rules and participation...', top: 8, left: 6, width: 88, height: 18, sectionId: s2_sections[0].id },
            { id: uid('b-'), text: 'Academic integrity statement and policies...', top: 35, left: 6, width: 88, height: 18, sectionId: s2_sections[1].id },
            { id: uid('b-'), text: 'Assigned readings by week...', top: 62, left: 6, width: 88, height: 26, sectionId: s2_sections[2].id },
          ],
        },
      ],
    } as SyllabusFile;

    return [f1, f2];
  });
  const [selectedSections, setSelectedSections] = useState<string[]>([...COMMON_SECTIONS.slice(0, 3)]);
  const [customInput, setCustomInput] = useState('');
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Upload handlers
  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const newFiles: SyllabusFile[] = Array.from(fileList).map((f) => {
      const secs = mockExtractSections(f.name, selectedSections);
      // create simple mock page with blocks mapped to sections
      const page = {
        id: uid('pg-'),
        blocks: secs.map((s, i) => ({ id: uid('b-'), text: `Source block for ${s.title}`, top: 5 + i * 30, left: 5, width: 90, height: 20, sectionId: s.id })),
      };
      return { id: uid('file-'), name: f.name, sections: secs, pages: [page] } as SyllabusFile;
    });
    setFiles((s) => {
      const merged = [...s, ...newFiles];
      // after adding, switch to verify and open first new file
      setTimeout(() => {
        setStage('verify');
        setCurrentFileId(newFiles[0]?.id ?? merged[0]?.id ?? null);
        setCurrentSectionId(newFiles[0]?.sections?.[0]?.id ?? merged[0]?.sections?.[0]?.id ?? null);
      }, 80);
      return merged;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  // Chips: add/remove/reorder
  const addChip = (label: string) => {
    if (!label) return;
    setSelectedSections((s) => (s.includes(label) ? s : [...s, label]));
    setCustomInput('');
  };

  const removeChip = (label: string) => {
    setSelectedSections((s) => s.filter((x) => x !== label));
  };

  const onChipDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const onChipDrop = (index: number) => {
    if (draggingIndex === null) return;
    setSelectedSections((s) => {
      const copy = [...s];
      const [item] = copy.splice(draggingIndex, 1);
      copy.splice(index, 0, item);
      return copy;
    });
    setDraggingIndex(null);
  };

  // Extraction
  const extractSectionsForAll = () => {
    if (files.length === 0) return;
    // Only run mock extraction for files without sections
    setFiles((prev) => prev.map((f) => ({ ...f, sections: f.sections && f.sections.length > 0 ? f.sections : mockExtractSections(f.name, selectedSections) })));
    setCurrentFileId(files[0].id);
    setStage('verify');
    setTimeout(() => {
      const firstSec = (files[0].sections && files[0].sections[0]?.id) ?? null;
      setCurrentSectionId(firstSec);
    }, 100);
  };

  // Review actions
  const setSectionEditing = (fileId: string, sectionId: string, editing: boolean) => {
    setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, sections: f.sections.map(sec => sec.id === sectionId ? { ...sec, editing } : sec) } : f));
  };

  const updateSectionText = (fileId: string, sectionId: string, text: string) => {
    setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, sections: f.sections.map(sec => sec.id === sectionId ? { ...sec, text } : sec) } : f));
  };

  const confirmSection = (fileId: string, sectionId: string) => {
    setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, sections: f.sections.map(sec => sec.id === sectionId ? { ...sec, confirmed: true, editing: false } : sec) } : f));
    // move to next unconfirmed section in same file
    const f = files.find(x => x.id === fileId);
    if (!f) return;
    const idx = f.sections.findIndex(s => s.id === sectionId);
    const next = f.sections.slice(idx + 1).find(s => !s.confirmed);
    if (next) {
      setCurrentSectionId(next.id);
    } else {
      // if there is another file with unconfirmed sections, go there
      const nextFile = files.find(ff => ff.id !== fileId && ff.sections.some(s => !s.confirmed));
      if (nextFile) {
        setCurrentFileId(nextFile.id);
        const firstUn = nextFile.sections.find(s => !s.confirmed);
        setCurrentSectionId(firstUn ? firstUn.id : null);
      } else {
        // all done -> go to view
        setStage('view');
      }
    }
  };

  const confirmAllSectionsForCurrentFile = (fileId: string) => {
    setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, sections: f.sections.map(s => ({ ...s, confirmed: true })) } : f));
    // go to next file or view
    const nextFile = files.find(ff => ff.id !== fileId && ff.sections.some(s => !s.confirmed));
    if (nextFile) {
      setCurrentFileId(nextFile.id);
      const firstUn = nextFile.sections.find(s => !s.confirmed);
      setCurrentSectionId(firstUn ? firstUn.id : null);
    } else {
      setStage('view');
    }
  };

  // Helper wrapper to match JSX usage
  const confirmAllForFile = (fileId: string) => {
    confirmAllSectionsForCurrentFile(fileId);
  };

  // View/compare
  const [selectedCompareFiles, setSelectedCompareFiles] = useState<string[]>([]);
  const toggleCompareSelect = (id: string) => {
    setSelectedCompareFiles((s) => s.includes(id) ? s.filter(x => x !== id) : (s.length < 2 ? [...s, id] : [s[1], id]));
  };

  // helpers
  const currentFile = files.find(f => f.id === currentFileId) ?? files[0] ?? null;
  const currentSection = currentFile?.sections.find(s => s.id === currentSectionId) ?? currentFile?.sections[0] ?? null;

  useEffect(() => {
    if (!currentSection && currentFile) {
      setCurrentSectionId(currentFile.sections[0]?.id ?? null);
    }
  }, [currentFileId, files]);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Syllabus Parser</h1>
          <p className="text-gray-500">Upload your syllabus, choose sections to extract, then verify the results.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${stage === 'upload' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>1. Upload</div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${stage === 'verify' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>2. Verify</div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${stage === 'view' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>3. View/Compare</div>
        </div>

        {stage === 'upload' && (
          <div>
            <div
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={handleDrop}
              className="border-2 border-dashed rounded-xl p-8 text-center transition-colors bg-gray-50 hover:border-indigo-300"
            >
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-700 mb-1">Drop your syllabus here</p>
              <p className="text-sm text-gray-500 mb-4">Supports PDF files. Multiple files allowed.</p>
              <div className="flex items-center justify-center gap-3">
                <label className="inline-block cursor-pointer">
                  <input ref={fileInputRef} type="file" className="hidden" accept=".pdf" multiple onChange={(e) => handleFiles(e.target.files)} />
                  <span className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Browse Files</span>
                </label>
              </div>
            </div>

            {/* Uploaded list */}
            <div className="mt-6 bg-white border border-gray-100 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Uploaded Files</h3>
              {files.length === 0 ? (
                <p className="text-sm text-gray-500">No files uploaded yet.</p>
              ) : (
                <div className="space-y-2">
                  {files.map((f) => (
                    <div key={f.id} className="flex items-center justify-between gap-3 bg-gray-50 p-3 rounded">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-800">{f.name}</div>
                          <div className="text-xs text-gray-500">{f.sections.length ? `${f.sections.length} sections` : 'Not extracted yet'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setFiles((s) => s.filter(x => x.id !== f.id))}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section selection */}
            <div className="mt-6 bg-white border border-gray-100 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Specify Sections to Extract</h3>
              <p className="text-xs text-gray-500 mb-3">Click to add common sections, or type and press Enter to add a custom section.</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_SECTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => addChip(c)}
                    className={`px-3 py-1 rounded-full text-sm ${selectedSections.includes(c) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex gap-2 items-center">
                <input
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { addChip(customInput.trim()); } }}
                  placeholder="Add custom section and press Enter"
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                />
                <button onClick={() => addChip(customInput.trim())} className="px-3 py-2 bg-gray-100 rounded">Add</button>
              </div>

              <div className="mt-4">
                <div className="text-xs text-gray-500 mb-2">Selected Sections (drag to reorder)</div>
                <div className="flex flex-wrap gap-2">
                  {selectedSections.map((s, i) => (
                    <div
                      key={s}
                      draggable
                      onDragStart={() => onChipDragStart(i)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onChipDrop(i)}
                      className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{s}</span>
                      <button onClick={() => removeChip(s)} className="text-xs text-indigo-600">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-500">Ready to extract sections from uploaded files.</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setSelectedSections([...COMMON_SECTIONS.slice(0,3)]); }}
                    className="text-sm text-gray-600 hover:underline"
                  >Reset</button>
                  <button
                    onClick={extractSectionsForAll}
                    className={`px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white ${files.length === 0 ? 'opacity-60 pointer-events-none' : ''}`}
                  >
                    Extract Sections
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {stage==='verify' && currentFile && (
          <div className="relative">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <div className="bg-white rounded border p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3"><FileText className="text-indigo-600" /> <div>{currentFile.name}</div></div>
                    <div className="text-sm text-gray-500">{currentFile.sections.filter(s=>s.confirmed).length}/{currentFile.sections.length} confirmed</div>
                  </div>
                  <div className="mt-4 h-[70vh] overflow-auto border rounded p-4 bg-gray-50">
                    {currentFile.pages?.map(page=> (
                      <div key={page.id} className="mb-6">
                        <div className="relative w-full bg-white border" style={{paddingBottom: '141%'}}>
                          <div className="absolute inset-0 p-4">
                            {page.blocks.map(blk => (
                              <div key={blk.id} style={{ position: 'absolute', top: `${blk.top}%`, left: `${blk.left}%`, width: `${blk.width}%`, height: `${blk.height}%` }} className={`${blk.sectionId===currentSection?.id ? 'ring-2 ring-yellow-300 bg-yellow-50' : ''} p-2 rounded text-sm`}>
                                <div className="font-semibold text-xs">{currentFile.sections.find(s=>s.id===blk.sectionId)?.title}</div>
                                <div className="text-xs">{blk.text}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-span-1 bg-white rounded border p-4 h-[70vh] flex flex-col">
                <div className="flex justify-between items-center mb-3"><div className="font-semibold">Extracted Sections</div><div className="text-xs text-gray-500">Click to highlight</div></div>
                <div className="overflow-auto flex-1 space-y-3">
                  {currentFile.sections.map(sec => (
                    <div key={sec.id} className={`${sec.id===currentSection?.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-100'} p-3 rounded border` }>
                      <div className="flex justify-between items-start">
                        <button onClick={()=>setCurrentSectionId(sec.id)} className="text-left font-medium">{sec.title}</button>
                        <div className="text-xs text-gray-500">{sec.confidence>=80? 'High' : sec.confidence>=65? 'Medium' : 'Low'}</div>
                      </div>
                      <div className="mt-2 text-sm text-gray-700">{sec.text}</div>
                      <div className="mt-3 flex gap-2">
                        <button onClick={()=>confirmSection(currentFile.id, sec.id)} className="px-3 py-1 rounded bg-indigo-600 text-white text-sm">Confirm</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="fixed right-6 bottom-6 z-50 flex gap-3">
              <button onClick={()=>setStage('upload')} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded"><ArrowLeft className="w-4 h-4"/> Back</button>
              <button onClick={()=>confirmAllForFile(currentFile.id)} className="px-4 py-2 bg-indigo-600 text-white rounded">Confirm All Sections</button>
            </div>
          </div>
        )}

        {stage === 'view' && (
          <div>
            <div className="bg-white border border-gray-100 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                  <div className="font-semibold">Extracted Syllabi</div>
                  <div className="text-sm text-gray-500">Select up to two to compare</div>
                </div>
              <div className="mt-3 flex gap-3 overflow-x-auto py-2">
                {files.length === 0 && <div className="text-sm text-gray-500">No syllabi available.</div>}
                {files.map((f) => (
                  <div key={f.id} className={`min-w-[220px] p-3 rounded border ${selectedCompareFiles.includes(f.id) ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 bg-white'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{f.name}</div>
                        <div className="text-xs text-gray-500">{f.sections.length} sections</div>
                      </div>
                      <div>
                        <button onClick={() => toggleCompareSelect(f.id)} className="text-sm px-2 py-1 bg-gray-100 rounded">{selectedCompareFiles.includes(f.id) ? 'Selected' : 'Select'}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedCompareFiles.length === 0 ? (
              <div className="text-center py-20 text-gray-500">Select a syllabus above to begin comparison</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedCompareFiles.map((fid) => {
                  const f = files.find(x => x.id === fid)!;
                  return (
                    <div key={fid} className="bg-white border border-gray-100 p-4 rounded-lg">
                      <div className="font-semibold mb-3">{f.name}</div>
                      <div className="space-y-4">
                        {f.sections.map((sec) => (
                          <div key={sec.id} className="p-3 border rounded">
                            <div className="text-sm font-medium mb-1">{sec.title}</div>
                            <div className="text-sm text-gray-700">{sec.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Footer actions for view */}
            <div className="mt-6 flex items-center gap-3">
              <button onClick={() => setStage('verify')} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded"> <ArrowLeft className="w-4 h-4"/> Back</button>
              <button onClick={() => { setStage('upload'); setTimeout(()=> fileInputRef.current?.click(), 80); }} className="flex items-center gap-2 px-3 py-2  bg-indigo-600 text-white rounded"> <Upload className="w-4 h-4"/> Upload More</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
