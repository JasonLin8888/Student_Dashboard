import EditableCanvasPage from '../components/canvas/EditableCanvasPage';

interface MainDashboardProps {
  pageKey?: string;
  pageTitle?: string;
}

export default function MainDashboard({ pageKey = 'main', pageTitle = 'Main Dashboard' }: MainDashboardProps) {
  return <EditableCanvasPage pageKey={pageKey} pageTitle={pageTitle} template="main" />;
}
