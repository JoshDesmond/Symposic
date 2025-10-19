import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Interview, InterviewMessage } from '@shared/types';

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
  
  async getNextMessage(interview: Interview): Promise<{ interview: Interview; isComplete: boolean }> {
    if (!this.anthropic) {
      throw new Error('Claude service not initialized');
    }

    // Check if we've reached the message limit (failsafe)
    const assistantMessages = interview.messages.filter(m => m.role === 'assistant').length;
    const MAX_ASSISTANT_MESSAGES = 4; // Including initial prompt

    if (assistantMessages >= MAX_ASSISTANT_MESSAGES) {
      // Force completion with final message
      const finalMessage = {
        role: 'assistant' as const,
        content: "Perfect - based on everything you've shared, I'll start looking for a group that matches your vibe and interests. You'll get a text from me when I've found the right networking opportunity for you. Thanks for sharing your story!"
      };
      
      return {
        interview: {
          ...interview,
          messages: [...interview.messages, finalMessage]
        },
        isComplete: true
      };
    }

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: interview.messages
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Add the new assistant message to the interview
    return {
      interview: {
        ...interview,
        messages: [...interview.messages, { role: 'assistant', content }]
      },
      isComplete: false
    };
  }

  getInitialPrompt(name: string): InterviewMessage {
    const content = INITIAL_PROMPT.replace('{{name}}', name);
    return { role: 'assistant', content };
  }

  // TODO implement claude service methods
}
