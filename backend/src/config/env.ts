import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const canvasApiUrl = requireEnv('CANVAS_API_URL').replace(/\/+$/, '');
const canvasApiToken = requireEnv('CANVAS_API_TOKEN');
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const port = Number(process.env.PORT || 3001);

if (Number.isNaN(port)) {
  throw new Error('PORT must be a valid number');
}

export const env = {
  canvasApiUrl,
  canvasApiToken,
  frontendOrigin,
  port,
};
