import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import assignmentsRouter from './routes/assignments.js';
import calendarRouter from './routes/calendar.js';
import coursesRouter from './routes/courses.js';
import filesRouter from './routes/files.js';
import modulesRouter from './routes/modules.js';

const app = express();

app.use(cors({ origin: env.frontendOrigin }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/courses', coursesRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/files', filesRouter);
app.use('/api/modules', modulesRouter);

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({
    error: 'Internal server error',
    details: error.message,
  });
});

app.listen(env.port, () => {
  console.log(`Canvas backend listening on port ${env.port}`);
});
