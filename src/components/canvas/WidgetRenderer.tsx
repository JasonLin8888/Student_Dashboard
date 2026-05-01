import CalendarPanel from '../CalendarPanel';
import InboxPanel from '../InboxPanel';
import PomodoroPanel from '../PomodoroPanel';
import TodoPanel from '../TodoPanel';
import { WidgetType } from '../../context/DashboardCustomizationContext';
import ClassViewWidget from './widgets/ClassViewWidget';
import FileViewerWidget from './widgets/FileViewerWidget';
import HandwritingWidget from './widgets/HandwritingWidget';
import LatexWidget from './widgets/LatexWidget';
import MindMapWidget from './widgets/MindMapWidget';
import NotesWidget from './widgets/NotesWidget';

interface WidgetRendererProps {
  type: WidgetType;
  classId?: string;
}

export default function WidgetRenderer({ type, classId }: WidgetRendererProps) {
  if (type === 'calendar') {
    return <CalendarPanel filterClassId={classId} />;
  }
  if (type === 'todo') {
    return <TodoPanel filterClassId={classId} />;
  }
  if (type === 'inbox') {
    return <InboxPanel />;
  }
  if (type === 'pomodoro') {
    return <PomodoroPanel />;
  }
  if (type === 'classview') {
    return <ClassViewWidget classId={classId} />;
  }
  if (type === 'notes') {
    return <NotesWidget />;
  }
  if (type === 'latex') {
    return <LatexWidget />;
  }
  if (type === 'handwriting') {
    return <HandwritingWidget />;
  }
  if (type === 'fileviewer') {
    return <FileViewerWidget />;
  }
  return <MindMapWidget />;
}
