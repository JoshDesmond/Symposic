import { Request, Response } from 'express';
import { ClaudeService } from '../services/claude.service';

export class ClaudeController {
  private claudeService: ClaudeService;

  constructor() {
    this.claudeService = new ClaudeService();
  }

  // TODO implement interview endpoints
}
