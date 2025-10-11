import express, { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';

// Dependency injection
let anthropic: Anthropic;

export function setDependencies(claude: Anthropic) {
  anthropic = claude;
}

const router: Router = express.Router();

// TODO implement and test interview endpoints

export default router;

