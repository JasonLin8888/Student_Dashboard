import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MainDashboard from './pages/MainDashboard';
import ClassDashboard from './pages/ClassDashboard';
import NotesPage from './pages/NotesPage';
import MindMapPage from './pages/MindMapPage';
import SyllabusParser from './pages/SyllabusParser';
import CustomPageDashboard from './pages/CustomPageDashboard';
import { DashboardCustomizationProvider } from './context/DashboardCustomizationContext';
import { CanvasDataProvider } from './context/CanvasDataContext';

export default function App() {
  return (
    <CanvasDataProvider>
      <DashboardCustomizationProvider>
        <Router>
          <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-hidden">
              <Routes>
                <Route path="/" element={<MainDashboard pageKey="main" pageTitle="Main Dashboard" />} />
                <Route path="/class/:classId" element={<ClassDashboard />} />
                <Route path="/page/:pageId" element={<CustomPageDashboard />} />
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/mindmap" element={<MindMapPage />} />
                <Route path="/syllabus" element={<SyllabusParser />} />
              </Routes>
            </main>
          </div>
        </Router>
      </DashboardCustomizationProvider>
    </CanvasDataProvider>
  );
}
