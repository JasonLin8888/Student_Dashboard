import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { mockAssignments, mockClasses, mockEvents, mockTasks } from '../data/mockData';
import { Assignment, CalendarEvent, ClassInfo, Task } from '../types';
import { fetchAssignments, fetchCalendarEvents, fetchCourses } from '../services/canvasApi';

interface CanvasDataState {
  classes: ClassInfo[];
  assignments: Assignment[];
  tasks: Task[];
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  refreshCoreData: () => Promise<void>;
  fetchAssignmentsForCourses: (courseIds: string[]) => Promise<void>;
}

const CanvasDataContext = createContext<CanvasDataState | null>(null);

function dedupeTasks(tasks: Task[]): Task[] {
  const map = new Map<string, Task>();
  tasks.forEach((task) => {
    map.set(task.id, task);
  });
  return Array.from(map.values());
}

function upcomingAssignments(assignments: Assignment[], days = 30): Assignment[] {
  const now = Date.now();
  const end = now + days * 24 * 60 * 60 * 1000;
  return assignments.filter((assignment) => {
    const due = new Date(assignment.dueDate).getTime();
    return Number.isFinite(due) && due >= now && due <= end;
  });
}

export function CanvasDataProvider({ children }: { children: React.ReactNode }) {
  const [classes, setClasses] = useState<ClassInfo[]>(mockClasses);
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignmentsForCourses = useCallback(async (courseIds: string[]) => {
    if (courseIds.length === 0) {
      setAssignments([]);
      setTasks([]);
      return;
    }

    const result = await fetchAssignments(courseIds);
    const filteredAssignments = upcomingAssignments(result.data);
    setAssignments(filteredAssignments);
    setTasks(dedupeTasks(result.tasks));
  }, []);

  const refreshCoreData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [courseList, calendarEvents] = await Promise.all([
        fetchCourses(),
        fetchCalendarEvents(),
      ]);

      setClasses(courseList);
      setEvents(calendarEvents);

      await fetchAssignmentsForCourses(courseList.map((course) => course.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Canvas data');
      setClasses(mockClasses);
      setAssignments(mockAssignments);
      setTasks(mockTasks);
      setEvents(mockEvents);
    } finally {
      setLoading(false);
    }
  }, [fetchAssignmentsForCourses]);

  useEffect(() => {
    refreshCoreData();
  }, [refreshCoreData]);

  const value = useMemo(() => ({
    classes,
    assignments,
    tasks,
    events,
    loading,
    error,
    refreshCoreData,
    fetchAssignmentsForCourses,
  }), [classes, assignments, tasks, events, loading, error, refreshCoreData, fetchAssignmentsForCourses]);

  return <CanvasDataContext.Provider value={value}>{children}</CanvasDataContext.Provider>;
}

export function useCanvasData() {
  const context = useContext(CanvasDataContext);
  if (!context) {
    throw new Error('useCanvasData must be used within CanvasDataProvider');
  }
  return context;
}
