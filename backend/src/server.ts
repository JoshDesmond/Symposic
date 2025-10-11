import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import usersRouter from './auth/auth';
import interviewRouter, { setDependencies } from './claude/interview';
import { closeDatabase } from './database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8347;

app.use(cors());
app.use(express.json());

// Initialize Claude
if (false) {
  const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
  });

  // Inject dependencies into interview router
  setDependencies(anthropic);
}

// Mount routes
app.use('/api', usersRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
  
process.on('SIGINT', async () => {
  await closeDatabase();
  process.exit(0);
})
