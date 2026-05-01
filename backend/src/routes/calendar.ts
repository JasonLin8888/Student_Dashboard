import { Router } from 'express';
import { mapCalendarEvent } from '../mappers/eventMapper.js';
import { getPaginated } from '../services/canvasClient.js';
import { CanvasCalendarEvent } from '../types/canvas.js';

const calendarRouter = Router();

calendarRouter.get('/', async (_req, res) => {
  try {
    const now = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 30);

    const events = await getPaginated<CanvasCalendarEvent>(
      `/api/v1/calendar_events?start_date=${encodeURIComponent(now.toISOString())}&end_date=${encodeURIComponent(end.toISOString())}&per_page=100`
    );

    const mapped = events
      .map(mapCalendarEvent)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    res.json({ data: mapped });
  } catch (error) {
    res.status(502).json({
      error: 'Failed to fetch calendar events from Canvas',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default calendarRouter;
