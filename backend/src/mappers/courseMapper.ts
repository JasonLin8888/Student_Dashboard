import { AppClassInfo } from '../types/app.js';
import { CanvasCourse } from '../types/canvas.js';
import { stableColor } from './color.js';

function extractProfessor(course: CanvasCourse): string {
  const teacher = course.enrollments?.find((enrollment) =>
    (enrollment.role || '').toLowerCase().includes('teacher')
  );
  return teacher?.user?.name || 'Instructor';
}

export function isActiveCourse(course: CanvasCourse): boolean {
  const states = (course.enrollments || []).map((enrollment) => enrollment.enrollment_state || 'active');
  return states.length === 0 || states.some((state) => state === 'active');
}

export function mapCourse(course: CanvasCourse): AppClassInfo {
  const id = String(course.id);
  return {
    id,
    name: course.name,
    professor: extractProfessor(course),
    color: stableColor(id),
    credits: 0,
    schedule: 'TBD',
    room: 'TBD',
  };
}
