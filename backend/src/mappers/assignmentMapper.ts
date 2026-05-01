import { AppAssignment, AppTask } from '../types/app.js';
import { CanvasAssignment } from '../types/canvas.js';

function mapStatus(workflowState?: string): AppAssignment['status'] {
  if (!workflowState) return 'not-started';
  if (workflowState === 'graded') return 'completed';
  if (workflowState === 'submitted') return 'submitted';
  if (workflowState === 'pending_review') return 'in-progress';
  return 'not-started';
}

export function mapAssignment(assignment: CanvasAssignment): AppAssignment {
  const dueDate = assignment.due_at || new Date().toISOString();
  return {
    id: String(assignment.id),
    title: assignment.name,
    classId: String(assignment.course_id),
    dueDate,
    status: mapStatus(assignment.submission?.workflow_state),
    grade: assignment.submission?.score,
    instructions: assignment.description || '',
    points: assignment.points_possible || 0,
  };
}

export function assignmentToTask(assignment: AppAssignment): AppTask {
  const completed = assignment.status === 'completed' || assignment.status === 'submitted';
  return {
    id: `assignment-${assignment.id}`,
    title: assignment.title,
    completed,
    dueDate: assignment.dueDate,
    classId: assignment.classId,
    priority: 'medium',
    description: assignment.instructions,
    createdAt: assignment.dueDate,
    customFields: {
      source: 'canvas-assignment',
      points: String(assignment.points),
    },
  };
}
