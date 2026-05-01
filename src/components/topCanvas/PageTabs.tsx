import { Copy, Edit2, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockClasses } from '../../data/mockData';
import { useDashboardCustomization } from '../../context/DashboardCustomizationContext';

interface PageTabsProps {
  currentPageKey: string;
  currentPageTitle: string;
}

interface PageItem {
  key: string;
  name: string;
  route: string;
  userPageId?: string;
}

export default function PageTabs({ currentPageKey, currentPageTitle }: PageTabsProps) {
  const navigate = useNavigate();
  const {
    userPages,
    isEditing,
    setEditing,
    createUserPage,
    renamePageByKey,
    duplicateIntoUserPage,
    deletePageByKey,
    resolvePageName,
    isPageVisible,
  } = useDashboardCustomization();

  const pages: PageItem[] = [
    { key: 'main', name: 'Main Dashboard', route: '/' },
    ...mockClasses.map((cls) => ({
      key: `class:${cls.id}`,
      name: cls.name,
      route: `/class/${cls.id}`,
    })),
    ...userPages.map((page) => ({
      key: `custom:${page.id}`,
      name: page.name,
      route: `/page/${page.id}`,
      userPageId: page.id,
    })),
  ]
    .filter((page) => isPageVisible(page.key))
    .map((page) => ({
      ...page,
      name: resolvePageName(page.key, page.name),
    }));

  const handleDuplicate = (page: PageItem) => {
    const newId = duplicateIntoUserPage(page.key, page.name);
    navigate(`/page/${newId}`);
  };

  const handleRename = (page: PageItem) => {
    const value = window.prompt('Rename page', page.name);
    if (value && value.trim()) {
      renamePageByKey(page.key, value);
    }
  };

  const handleDelete = (page: PageItem) => {
    const ok = window.confirm(`Are you sure you want to delete "${page.name}"?`);
    if (!ok) return;

    deletePageByKey(page.key);
    if (currentPageKey === page.key) {
      navigate('/');
    }
  };

  const handleCreate = () => {
    const created = createUserPage();
    navigate(`/page/${created}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 mb-3">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dashboard Pages</p>
          <h2 className="text-sm font-semibold text-gray-800">{currentPageTitle}</h2>
        </div>
        <div className="flex items-center gap-2">
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
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            title="Add page"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Page
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {pages.map((page) => {
          const active = currentPageKey === page.key;
          return (
            <div
              key={page.key}
              className={`group inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-lg border text-xs ${
                active
                  ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                  : 'bg-gray-50 text-gray-600 border-gray-200'
              }`}
            >
              <button onClick={() => navigate(page.route)} className="font-medium truncate max-w-40" title={page.name}>
                {page.name}
              </button>

              <button
                onClick={() => handleDuplicate(page)}
                className="text-gray-400 hover:text-indigo-600 p-1"
                title="Duplicate page"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              {page.userPageId && (
                <>
                  <button
                    onClick={() => handleRename(page)}
                    className="text-gray-400 hover:text-indigo-600 p-1"
                    title="Rename page"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(page)}
                    className="text-gray-400 hover:text-red-500 p-1"
                    title="Delete page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
