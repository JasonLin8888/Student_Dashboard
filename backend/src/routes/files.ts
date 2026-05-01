import { Router } from 'express';
import { mapFile } from '../mappers/resourceMapper.js';
import { getPaginated } from '../services/canvasClient.js';
import { CanvasFile } from '../types/canvas.js';

const filesRouter = Router();

filesRouter.get('/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const files = await getPaginated<CanvasFile>(`/api/v1/courses/${courseId}/files?per_page=100`);
    res.json({ data: files.map(mapFile) });
  } catch (error) {
    res.status(502).json({
      error: 'Failed to fetch files from Canvas',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default filesRouter;
