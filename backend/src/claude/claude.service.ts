import Anthropic from '@anthropic-ai/sdk';

export class ClaudeService {
  private anthropic: Anthropic | null = null;

  constructor() {
    this.initializeClaude();
  }

  private initializeClaude(): void {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (apiKey) {
      this.anthropic = new Anthropic({
        apiKey: apiKey,
      });
      console.log('Claude service initialized successfully');
    } else {
      console.warn('CLAUDE_API_KEY not found in environment variables');
    }
  }

  // TODO implement claude service methods
}
