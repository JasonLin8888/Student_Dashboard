import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { mockClasses } from '../data/mockData';
import { useDashboardCustomization } from '../context/DashboardCustomizationContext';
import { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  GitBranch,
  Upload,
  ChevronRight,
  Plus,
  Edit2,
  Copy,
  Trash2,
} from 'lucide-react';

export default function Sidebar() {
  const {
    userPages,
    isPageVisible,
    resolvePageName,
    createUserPage,
    duplicateIntoUserPage,
    deletePageByKey,
    renamePageByKey,
  } = useDashboardCustomization();

  const navigate = useNavigate();
  const location = useLocation();

  const handleCreatePage = () => {
    const created = createUserPage();
    navigate(`/page/${created}`);
  };

  const handleDuplicate = (pageId: string, pageName: string) => {
    const newId = duplicateIntoUserPage(`custom:${pageId}`, pageName);
    navigate(`/page/${newId}`);
  };

  const handleDelete = (pageId: string, pageName: string) => {
    const ok = window.confirm(`Are you sure you want to delete "${pageName}"?`);
    if (!ok) return;

    deletePageByKey(`custom:${pageId}`);

    if (location.pathname === `/page/${pageId}`) {
      navigate('/');
    }
  };

  const handleRename = (pageId: string, name: string) => {
    renamePageByKey(`custom:${pageId}`, name);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-100 text-indigo-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">StudySpace</h1>
            <p className="text-xs text-gray-500">Fall 2024</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {isPageVisible('main') && (
          <NavLink to="/" end className={navLinkClass}>
            <LayoutDashboard className="w-4 h-4" />
            {resolvePageName('main', 'Dashboard')}
          </NavLink>
        )}
        <NavLink to="/notes" className={navLinkClass}>
          <FileText className="w-4 h-4" />
          Notes
        </NavLink>
        <NavLink to="/mindmap" className={navLinkClass}>
          <GitBranch className="w-4 h-4" />
          Mind Map
        </NavLink>
        <NavLink to="/syllabus" className={navLinkClass}>
          <Upload className="w-4 h-4" />
          Syllabus Parser
        </NavLink>

        {/* Classes */}
        <div className="pt-3">
          <div className="px-3 mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Classes
            </p>

            <button
              onClick={handleCreatePage}
              className="w-6 h-6 inline-flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
              title="Add page"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          {mockClasses.filter((cls) => isPageVisible(`class:${cls.id}`)).map((cls) => (
            <NavLink key={cls.id} to={`/class/${cls.id}`} className={navLinkClass}>
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cls.color }} />
              <span className="truncate">{resolvePageName(`class:${cls.id}`, cls.name)}</span>
              <ChevronRight className="w-3 h-3 ml-auto flex-shrink-0 opacity-40" />
            </NavLink>
          ))}
        </div>

        {/* Custom pages */}
        {userPages.filter((page) => isPageVisible(`custom:${page.id}`)).length > 0 && (
          <div className="pt-3">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Custom Pages</p>
            {userPages
              .filter((page) => isPageVisible(`custom:${page.id}`))
              .map((page) => {
                const name = resolvePageName(`custom:${page.id}`, page.name);

                return (
                  <PageRow
                    key={page.id}
                    name={name}
                    active={location.pathname === `/page/${page.id}`}
                    onSelect={() => navigate(`/page/${page.id}`)}
                    onDuplicate={() => handleDuplicate(page.id, name)}
                    onRemove={() => handleDelete(page.id, name)}
                    onRename={(newName) => handleRename(page.id, newName)}
                  />
                );
              })}
          </div>
        )}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-indigo-600">JS</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">Jane Student</p>
            <p className="text-xs text-gray-500 truncate">jane@university.edu</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

interface PageRowProps {
  name: string;
  active: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onRename: (name: string) => void;
}

function PageRow({ name, active, onSelect, onDuplicate, onRemove, onRename }: PageRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  const commit = () => {
    const next = draft.trim();

    if (next) {
      onRename(next);
    } else {
      setDraft(name);
    }

    setEditing(false);
  };

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer group transition-colors ${
        active
          ? 'bg-indigo-100 text-indigo-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <LayoutDashboard className="w-4 h-4 flex-shrink-0" />

      {editing ? (
        <input
          autoFocus
          className="flex-1 min-w-0 text-sm font-medium bg-transparent outline-none border-b border-indigo-400"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();

            if (e.key === 'Escape') {
              setDraft(name);
              setEditing(false);
            }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className="flex-1 min-w-0 text-sm font-medium truncate"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
        >
          {name}
        </span>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          setEditing(true);
        }}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-600 transition-colors p-1"
        title="Rename page"
      >
        <Edit2 size={13} />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-600 transition-colors p-1"
        title="Duplicate page"
      >
        <Copy size={13} />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-colors p-1"
        title="Delete page"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}