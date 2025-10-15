import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import authRouter from './routes/auth.routes';
import claudeRouter from './routes/claude.routes';
import { ClaudeService } from './services/claude.service';
import { closeDatabase } from './database';

dotenv.config();

console.log(`Creating server`);

const app = express();
const PORT = parseInt(process.env.PORT ?? '8347');

app.use(cors());
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Initialize Claude
if (false) {
  const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
  });

  // Inject dependencies into claude service
  const claudeService = new ClaudeService();
  claudeService.setDependencies(anthropic);
}

// Mount routes
app.use('/api', authRouter);
app.use('/api/claude', claudeRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check called');
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Accessible at http://localhost:${PORT} from WSL2`);
});
  
process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
})
