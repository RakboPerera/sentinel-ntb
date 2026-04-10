import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import agentsRouter from './routes/agents.js';
import orchestratorRouter from './routes/orchestrator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API routes
app.use('/api/agent', agentsRouter);
app.use('/api/orchestrate', orchestratorRouter);
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Sentinel by Octave', version: '1.0.0' }));

// Serve React frontend in production
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));

// SPA fallback — all non-API routes serve index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sentinel backend running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});
