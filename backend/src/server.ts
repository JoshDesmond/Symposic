import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import Database from './database';
import usersRouter, { setDatabase } from './auth/auth';
import interviewRouter, { setDependencies } from './claude/interview';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8347;

// Initialize Claude
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

app.use(cors());
app.use(bodyParser.json());

// Initialize database
const database = new Database();
database.runMigrations();

// Inject database into users router
setDatabase(database);

// Inject dependencies into interview router
setDependencies(database, anthropic);

// Mount routes
app.use('/api', usersRouter);
app.use('/api', interviewRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

