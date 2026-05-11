import { useEffect, useState } from 'react';
import { Edit2 } from 'lucide-react';
import { useDashboardCustomization } from '../../context/DashboardCustomizationContext';

interface TopBarProps {
  currentPageKey: string;
  currentPageTitle: string;
}

export default function TopBar({ currentPageKey, currentPageTitle }: TopBarProps) {
  const { isEditing, setEditing, renamePageByKey } = useDashboardCustomization();

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(currentPageTitle);

  useEffect(() => {
    setTitleDraft(currentPageTitle);
    setEditingTitle(false);
  }, [currentPageTitle]);

  const commitTitle = () => {
    const next = titleDraft.trim();

    if (next) {
      renamePageByKey(currentPageKey, next);
    }

    setEditingTitle(false);
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-5 flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTitle();

              if (e.key === 'Escape') {
                setTitleDraft(currentPageTitle);
                setEditingTitle(false);
              }
            }}
            className="text-xl font-bold text-gray-900 bg-transparent border-b border-indigo-400 outline-none"
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="inline-flex items-center gap-1.5 text-xl font-bold text-gray-900 truncate"
            title="Click to rename page"
          >
            <span className="truncate">{currentPageTitle}</span>
            <Edit2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </button>
        )}
      </div>

      <button
        onClick={() => setEditing(!isEditing)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
          isEditing
            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
        }`}
        title={isEditing ? 'Disable editing' : 'Enable editing'}
      >
        <Edit2 className="w-3.5 h-3.5" />
        {isEditing ? 'Editing On' : 'Editing Off'}
      </button>
    </header>
  );
}