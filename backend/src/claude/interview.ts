import express, { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import Database from '../database';

// Dependency injection
let database: Database;
let anthropic: Anthropic;

export function setDependencies(db: Database, claude: Anthropic) {
  database = db;
  anthropic = claude;
}

const router: Router = express.Router();

// TODO implement and test interview endpoints

export default router;

