export interface AppClassInfo {
  id: string;
  name: string;
  professor: string;
  color: string;
  credits: number;
  schedule: string;
  room: string;
}

export interface AppAssignment {
  id: string;
  title: string;
  classId: string;
  dueDate: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'submitted';
  grade?: number;
  instructions: string;
  points: number;
}

export interface AppTask {
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

export interface AppCalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'assignment' | 'exam' | 'event' | 'reminder';
  classId?: string;
  color: string;
}

export interface AppFile {
  id: string;
  name: string;
  fileName: string;
  contentType?: string;
  size?: number;
  url?: string;
  updatedAt?: string;
}

export interface AppModuleItem {
  id: string;
  title: string;
  type: string;
  url?: string;
}

export interface AppModule {
  id: string;
  name: string;
  unlockAt?: string;
  state: string;
  itemCount: number;
  items: AppModuleItem[];
}
