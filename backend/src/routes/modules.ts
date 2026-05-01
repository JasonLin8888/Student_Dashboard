import { Router } from 'express';
import { mapModule } from '../mappers/resourceMapper.js';
import { getPaginated } from '../services/canvasClient.js';
import { CanvasModule } from '../types/canvas.js';

const modulesRouter = Router();

modulesRouter.get('/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const modules = await getPaginated<CanvasModule>(`/api/v1/courses/${courseId}/modules?include[]=items&per_page=100`);
    res.json({ data: modules.map(mapModule) });
  } catch (error) {
    res.status(502).json({
      error: 'Failed to fetch modules from Canvas',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default modulesRouter;
