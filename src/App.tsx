import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MainDashboard from './pages/MainDashboard';
import ClassDashboard from './pages/ClassDashboard';
import NotesPage from './pages/NotesPage';
import MindMapPage from './pages/MindMapPage';
import SyllabusParser from './pages/SyllabusParser';

export default function App() {
  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<MainDashboard />} />
            <Route path="/class/:classId" element={<ClassDashboard />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/mindmap" element={<MindMapPage />} />
            <Route path="/syllabus" element={<SyllabusParser />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
