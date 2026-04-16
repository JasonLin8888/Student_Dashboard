import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileText, GitBranch, Upload, ChevronRight } from 'lucide-react';
import { mockClasses } from '../data/mockData';

export default function Sidebar() {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-100 text-indigo-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">Student Hub</h1>
            <p className="text-xs text-gray-500">Fall 2024</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <NavLink to="/" end className={navLinkClass}>
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </NavLink>
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
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Classes</p>
          {mockClasses.map((cls) => (
            <NavLink key={cls.id} to={`/class/${cls.id}`} className={navLinkClass}>
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cls.color }} />
              <span className="truncate">{cls.name}</span>
              <ChevronRight className="w-3 h-3 ml-auto flex-shrink-0 opacity-40" />
            </NavLink>
          ))}
        </div>
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
