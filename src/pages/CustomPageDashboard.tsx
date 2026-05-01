import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useDashboardCustomization } from '../context/DashboardCustomizationContext';
import EditableCanvasPage from '../components/canvas/EditableCanvasPage';

export default function CustomPageDashboard() {
  const { pageId } = useParams<{ pageId: string }>();
  const { userPages } = useDashboardCustomization();

  const page = useMemo(() => userPages.find((item) => item.id === pageId), [userPages, pageId]);

  if (!page) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-500">
        Page not found
      </div>
    );
  }

  return (
    <EditableCanvasPage
      pageKey={`custom:${page.id}`}
      pageTitle={page.name}
      template="custom"
    />
  );
}
