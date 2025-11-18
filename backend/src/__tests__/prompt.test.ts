import { PromptConfig } from "../claude/prompts/prompt.types";
import { loadPromptConfig, getInitialMessage, renderPrompt } from "../claude/prompt.service";
import { InterviewMessage } from "@shared/types";
import { Tool } from "@anthropic-ai/sdk/resources/messages";

describe('Prompt Service', () => {
  test('should load a valid prompt config for version 0.1.0', () => {
    const config = loadPromptConfig('0.1.0');
    
    expect(config).toBeDefined();
    expect(config.version).toBe('0.1.0');
    expect(config.metadata).toBeDefined();
    expect(config.system).toBeDefined();
    expect(config.initial).toBeDefined();
    expect(config.user).toBeDefined();
    expect(config.tools).toBeDefined();
    expect(Array.isArray(config.tools)).toBe(true);
  });

  test('should retrieve an initial message from the prompt service', () => {
    const message = getInitialMessage('TestUser');
    
    expect(message).toBeDefined();
    expect(typeof message).toBe('string');
    expect(message).toContain('TestUser');
  });
  
  test('should render prompt with proper replacements and structure', () => {
    const messages: InterviewMessage[] = [
      { role: 'assistant', content: 'Hello! What is your name?' },
      { role: 'user', content: 'My name is John' }
    ];
    
    const result = renderPrompt(messages, 'TestUser');
    
    // Verify basic structure
    expect(result).toBeDefined();
    expect(result.model).toBe('claude-haiku-4-5-20251001');
    expect(result.max_tokens).toBe(512);
    expect(result.messages).toBeDefined();
    expect(Array.isArray(result.messages)).toBe(true);
    expect(result.tools).toBeDefined();
    expect(Array.isArray(result.tools)).toBe(true);
    expect(result.tool_choice).toBeDefined();
    expect(result.tool_choice?.type).toBe('tool');
    
    // Verify the last message is the rendered user prompt with replacements
    const lastMessage = result.messages[result.messages.length - 1];
    expect(lastMessage.role).toBe('user');
    expect(typeof lastMessage.content).toBe('string');
    const userPrompt = lastMessage.content as string;
    
    // Verify {{INTEVIEW_LENGTH}} was replaced
    expect(userPrompt).toContain('2');
    expect(userPrompt).not.toContain('{{INTEVIEW_LENGTH}}');
    
    // Verify {{MESSAGES}} was replaced with the message history
    expect(userPrompt).toContain('assistant: Hello! What is your name?');
    expect(userPrompt).toContain('user: My name is John');
    expect(userPrompt).not.toContain('{{MESSAGES}}');
    
    // Verify tools structure
    expect(result.tools!.length).toBeGreaterThan(0);
    expect(result.tools![0].name).toBe('send_interview_response');
  });
}); 