import { useRef, useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';

interface FileEntry {
  name: string;
  type: string;
  url: string;
}

export default function FileViewerWidget() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [selected, setSelected] = useState<FileEntry | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const appendFiles = (list: FileList | null) => {
    if (!list) return;
    const items: FileEntry[] = Array.from(list).map((file) => ({
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...items]);
  };

  const remove = (name: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== name));
    if (selected?.name === name) {
      setSelected(null);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div
        className="border-2 border-dashed border-gray-200 rounded-lg p-2 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-colors mb-2"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          appendFiles(e.dataTransfer.files);
        }}
      >
        <Upload size={16} className="mx-auto text-gray-400" />
        <p className="text-[10px] text-gray-500 mt-1">Drop files or click to upload</p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.txt,.md"
          onChange={(e) => appendFiles(e.target.files)}
        />
      </div>

      <div className="flex-1 min-h-0 flex gap-2">
        <div className="w-36 shrink-0 overflow-y-auto space-y-1">
          {files.map((file) => (
            <button
              key={file.name}
              onClick={() => setSelected(file)}
              className={`w-full text-left flex items-center gap-1 px-1.5 py-1 rounded text-[10px] border ${
                selected?.name === file.name ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText size={10} />
              <span className="truncate flex-1">{file.name}</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  remove(file.name);
                }}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={10} />
              </span>
            </button>
          ))}
          {files.length === 0 && <p className="text-[10px] text-gray-400">No files uploaded</p>}
        </div>

        <div className="flex-1 min-h-0 rounded border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
          {selected ? (
            selected.type === 'application/pdf' ? (
              <iframe src={selected.url} title={selected.name} className="w-full h-full" />
            ) : selected.type.startsWith('image/') ? (
              <img src={selected.url} alt={selected.name} className="max-w-full max-h-full object-contain" />
            ) : (
              <a href={selected.url} download={selected.name} className="text-xs text-indigo-600 underline">Download {selected.name}</a>
            )
          ) : (
            <p className="text-xs text-gray-400">Select a file to preview</p>
          )}
        </div>
      </div>
    </div>
  );
}
