import { config } from '../config/index.js';

const staticOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5173',
];

const vercelPreview = /^https:\/\/eldohub-academy-[a-z0-9-]+-evans-kipngeno-cheruiyots-projects\.vercel\.app$/;

const configured = String(config.frontendUrl || '')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''))
  .filter(Boolean);

export function isAllowedOrigin(origin) {
  if (!origin) return true;
  const clean = origin.replace(/\/$/, '');
  return (
    staticOrigins.includes(clean) ||
    configured.includes(clean) ||
    vercelPreview.test(clean)
  );
}
