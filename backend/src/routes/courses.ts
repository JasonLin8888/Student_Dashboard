import { Router } from 'express';
import { mapCourse, isActiveCourse } from '../mappers/courseMapper.js';
import { getPaginated } from '../services/canvasClient.js';
import { CanvasCourse } from '../types/canvas.js';

const coursesRouter = Router();

coursesRouter.get('/', async (_req, res) => {
  try {
    const courses = await getPaginated<CanvasCourse>('/api/v1/courses?enrollment_state=active&include[]=teachers&per_page=100');
    const activeCourses = courses
      .filter(isActiveCourse)
      .map(mapCourse)
      .sort((a, b) => a.name.localeCompare(b.name));

    res.json({ data: activeCourses });
  } catch (error) {
    res.status(502).json({
      error: 'Failed to fetch courses from Canvas',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default coursesRouter;
