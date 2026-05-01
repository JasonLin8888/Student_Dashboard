import { BookOpen, Calendar, User } from 'lucide-react';
import { mockClasses, mockEvents, mockTasks } from '../../../data/mockData';

interface ClassViewWidgetProps {
  classId?: string;
}

export default function ClassViewWidget({ classId }: ClassViewWidgetProps) {
  const classes = classId ? mockClasses.filter((item) => item.id === classId) : mockClasses;

  return (
    <div className="h-full overflow-y-auto space-y-2 text-sm">
      {classes.map((cls) => {
        const upcomingEvents = mockEvents.filter((event) => event.classId === cls.id).slice(0, 2);
        const pendingTasks = mockTasks.filter((task) => task.classId === cls.id && !task.completed);

        return (
          <div key={cls.id} className="rounded-lg border border-gray-100 overflow-hidden">
            <div className="px-3 py-2 flex items-center gap-2" style={{ backgroundColor: `${cls.color}22`, borderLeft: `4px solid ${cls.color}` }}>
              <BookOpen size={14} style={{ color: cls.color }} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs text-gray-800 truncate">{cls.name}</p>
                <p className="text-[10px] text-gray-500 flex items-center gap-1 truncate">
                  <User size={10} />
                  {cls.professor}
                </p>
              </div>
              {pendingTasks.length > 0 && (
                <span className="text-[10px] text-white rounded-full px-1.5 py-0.5" style={{ backgroundColor: cls.color }}>
                  {pendingTasks.length}
                </span>
              )}
            </div>
            <div className="px-3 py-2 space-y-1">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-1 text-[10px] text-gray-600">
                  <Calendar size={10} className="text-gray-400" />
                  <span className="truncate">{event.title}</span>
                  <span className="ml-auto text-gray-400">{event.date}</span>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <p className="text-[10px] text-gray-400">No upcoming events</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
