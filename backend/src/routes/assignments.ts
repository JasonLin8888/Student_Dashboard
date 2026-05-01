import { Router } from 'express';
import { assignmentToTask, mapAssignment } from '../mappers/assignmentMapper.js';
import { getPaginated } from '../services/canvasClient.js';
import { CanvasAssignment } from '../types/canvas.js';

const assignmentsRouter = Router();

assignmentsRouter.get('/', async (req, res) => {
  try {
    const courseIdsParam = String(req.query.course_ids || '');
    const courseIds = courseIdsParam
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (courseIds.length === 0) {
      return res.status(400).json({ error: 'course_ids query parameter is required' });
    }

    const allAssignments = await Promise.all(
      courseIds.map((courseId) =>
        getPaginated<CanvasAssignment>(
          `/api/v1/courses/${courseId}/assignments?include[]=submission&order_by=due_at&per_page=100`
        )
      )
    );

    const mappedAssignments = allAssignments
      .flat()
      .map(mapAssignment)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return res.json({
      data: mappedAssignments,
      tasks: mappedAssignments.map(assignmentToTask),
    });
  } catch (error) {
    return res.status(502).json({
      error: 'Failed to fetch assignments from Canvas',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default assignmentsRouter;
