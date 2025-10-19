import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { InterviewMessage } from '@shared/types';

// Import prompts
const INITIAL_PROMPT = readFileSync(join(__dirname, 'prompt.txt'), 'utf-8');
const SYSTEM_PROMPT = readFileSync(join(__dirname, 'systemPrompt.txt'), 'utf-8');

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
  
  // TODO return an InterviewMessage object with the role 'assistant' and the content of the next message
  // input: Also an InterviewMessage object with the role 'user' and the content of the user's message
  async getNextMessage(messages: Array<{ role: 'user' | 'assistant'; content: string }> ): Promise<string> {
    if (!this.anthropic) {
      throw new Error('Claude service not initialized');
    }

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: messages
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }

  // TODO return an InterviewMessage object with the role 'assistant' and the content of the initial prompt
  getInitialPrompt(name: string): string {
    return INITIAL_PROMPT.replace('{{name}}', name);
  }

  // TODO implement claude service methods
}
