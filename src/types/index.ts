export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  classId?: string;
  priority: 'low' | 'medium' | 'high';
  description?: string;
  customFields?: Record<string, string>;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'assignment' | 'exam' | 'event' | 'reminder';
  classId?: string;
  color: string;
}

export interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  read: boolean;
  hasAttachment: boolean;
  body: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  professor: string;
  color: string;
  credits: number;
  schedule: string;
  room: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  classId?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface Assignment {
  id: string;
  title: string;
  classId: string;
  dueDate: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'submitted';
  grade?: number;
  instructions: string;
  points: number;
}
