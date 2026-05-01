import { AppCalendarEvent } from '../types/app.js';
import { CanvasCalendarEvent } from '../types/canvas.js';
import { stableColor } from './color.js';

function parseCourseId(contextCode?: string): string | undefined {
  if (!contextCode) return undefined;
  const match = contextCode.match(/course_(\d+)/);
  return match?.[1];
}

function inferType(title: string): AppCalendarEvent['type'] {
  const lowered = title.toLowerCase();
  if (lowered.includes('exam') || lowered.includes('quiz') || lowered.includes('midterm') || lowered.includes('final')) {
    return 'exam';
  }
  if (lowered.includes('reminder')) {
    return 'reminder';
  }
  if (lowered.includes('assignment') || lowered.includes('due')) {
    return 'assignment';
  }
  return 'event';
}

export function mapCalendarEvent(event: CanvasCalendarEvent): AppCalendarEvent {
  const classId = parseCourseId(event.context_code);
  const color = classId ? stableColor(classId) : '#6366F1';
  return {
    id: String(event.id),
    title: event.title,
    date: event.start_at || event.end_at || new Date().toISOString(),
    type: inferType(event.title),
    classId,
    color,
  };
}
