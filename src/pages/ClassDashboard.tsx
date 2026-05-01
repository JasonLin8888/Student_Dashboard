import { useParams } from 'react-router-dom';
import EditableCanvasPage from '../components/canvas/EditableCanvasPage';
import { mockClasses } from '../data/mockData';

export default function ClassDashboard() {
  const { classId } = useParams<{ classId: string }>();
  const cls = mockClasses.find((item) => item.id === classId);

  if (!cls) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-gray-500">
        Class not found
      </div>
    );
  }

  return (
    <EditableCanvasPage
      pageKey={`class:${cls.id}`}
      pageTitle={cls.name}
      template="class"
      classId={cls.id}
    />
  );
}
