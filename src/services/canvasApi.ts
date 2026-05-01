import { Assignment, CalendarEvent, ClassInfo, Task } from '../types';
import { fetchJson } from './api';

interface DataResponse<T> {
  data: T;
}

interface AssignmentsResponse {
  data: Assignment[];
  tasks: Task[];
}

export async function fetchCourses(): Promise<ClassInfo[]> {
  const payload = await fetchJson<DataResponse<ClassInfo[]>>('/api/courses');
  return payload.data;
}

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const payload = await fetchJson<DataResponse<CalendarEvent[]>>('/api/calendar');
  return payload.data;
}

export async function fetchAssignments(courseIds: string[]): Promise<AssignmentsResponse> {
  if (courseIds.length === 0) {
    return { data: [], tasks: [] };
  }

  const params = new URLSearchParams({ course_ids: courseIds.join(',') });
  return fetchJson<AssignmentsResponse>(`/api/assignments?${params.toString()}`);
}

export async function fetchCourseFiles(courseId: string) {
  return fetchJson<DataResponse<unknown[]>>(`/api/files/${courseId}`);
}

export async function fetchModules(courseId: string) {
  return fetchJson<DataResponse<unknown[]>>(`/api/modules/${courseId}`);
}
