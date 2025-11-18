import Anthropic from '@anthropic-ai/sdk';
import { Interview, InterviewMessage } from '@shared/types';
import { renderPrompt, getInitialMessage } from './prompt.service';

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
    const MAX_ASSISTANT_MESSAGES = 12; // Including initial prompt

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

    // Use renderPrompt to get the complete message params
    const messageParams = renderPrompt(interview.messages, '');
    const response = await this.anthropic.messages.create(messageParams);

    // Extract tool_use response
    if (response.content[0].type === 'tool_use') {
      const toolInput = response.content[0].input as {
        nextMessage: string;
        isComplete: boolean;
        estimatedProgress: number;
      };
      
      const assistantMessage: InterviewMessage = {
        role: 'assistant',
        content: toolInput.nextMessage
      };
      
      return {
        interview: {
          ...interview,
          messages: [...interview.messages, assistantMessage]
        },
        isComplete: toolInput.isComplete
      };
    } else {
      // Fallback if tool_use is not returned
      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      return {
        interview: {
          ...interview,
          messages: [...interview.messages, { role: 'assistant', content }]
        },
        isComplete: false
      };
    }
  }

  getInitialPrompt(name: string): InterviewMessage {
    const content = getInitialMessage(name);
    return { role: 'assistant', content };
  }

  // TODO implement claude service methods
}
