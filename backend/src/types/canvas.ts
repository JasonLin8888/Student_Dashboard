export interface CanvasEnrollment {
  enrollment_state?: string;
  role?: string;
  user?: {
    name?: string;
  };
}

export interface CanvasCourse {
  id: number;
  name: string;
  course_code?: string;
  enrollments?: CanvasEnrollment[];
}

export interface CanvasSubmission {
  workflow_state?: string;
  score?: number;
}

export interface CanvasAssignment {
  id: number;
  name: string;
  course_id: number;
  due_at?: string | null;
  description?: string | null;
  points_possible?: number | null;
  submission?: CanvasSubmission;
}

export interface CanvasFile {
  id: number;
  display_name: string;
  filename: string;
  content_type?: string;
  size?: number;
  url?: string;
  updated_at?: string;
}

export interface CanvasModuleItem {
  id: number;
  title?: string;
  type?: string;
  html_url?: string;
}

export interface CanvasModule {
  id: number;
  name: string;
  unlock_at?: string | null;
  state?: string;
  items_count?: number;
  items?: CanvasModuleItem[];
}

export interface CanvasCalendarEvent {
  id: number;
  title: string;
  start_at?: string | null;
  end_at?: string | null;
  description?: string | null;
  context_code?: string;
  html_url?: string;
}
