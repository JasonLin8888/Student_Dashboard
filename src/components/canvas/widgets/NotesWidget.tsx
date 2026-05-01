import { useState } from 'react';
import { Bold, Italic, List, Heading2 } from 'lucide-react';

export default function NotesWidget() {
  const [content, setContent] = useState('# My Notes\n\nStart writing here...\n\n- Item 1\n- Item 2\n');

  const insert = (before: string, after = '') => {
    const textarea = document.getElementById('widget-notes-editor') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const replacement = `${before}${selected}${after}`;
    setContent(`${content.slice(0, start)}${replacement}${content.slice(end)}`);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-1 border-b border-gray-200 pb-1 mb-2 shrink-0">
        <Tool title="Heading" onClick={() => insert('## ')}>
          <Heading2 size={12} />
        </Tool>
        <Tool title="Bold" onClick={() => insert('**', '**')}>
          <Bold size={12} />
        </Tool>
        <Tool title="Italic" onClick={() => insert('*', '*')}>
          <Italic size={12} />
        </Tool>
        <Tool title="List" onClick={() => insert('- ')}>
          <List size={12} />
        </Tool>
      </div>
      <textarea
        id="widget-notes-editor"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 resize-none text-xs font-mono border border-gray-200 rounded-lg p-2 outline-none focus:border-indigo-400"
      />
    </div>
  );
}

function Tool({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="p-1 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700"
    >
      {children}
    </button>
  );
}
