import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { InterviewMessage } from '@shared/types';
import { compareVersions } from '../util/semver';
import { PromptConfig } from './prompts/prompt.types';
import { MessageCreateParamsNonStreaming } from '@anthropic-ai/sdk/resources/messages';

const PROMPT_CONFIG_VERSION = '0.1.0';
// Global state: Load prompt config for 0.1.0
const PROMPT_CONFIG: PromptConfig = loadPromptConfig(PROMPT_CONFIG_VERSION);

/**
 * Loads a given prompt config from disk
 */
export function loadPromptConfig(version: string): PromptConfig {
  const promptsDir = join(__dirname, 'prompts');
  const configPath = join(promptsDir, version, 'config.json');
  const configJson = readFileSync(configPath, 'utf-8');
  const config = JSON.parse(configJson) as PromptConfig;
  
  // Expand user.txt if it's a file reference
  if (config.user === './user.txt') {
    const userPath = join(promptsDir, version, 'user.txt');
    config.user = readFileSync(userPath, 'utf-8');
  }
  
  return config;
}

/**
 * Renders the prompt template with the provided messages.
 * Replaces {{INTEVIEW_LENGTH}} and {{MESSAGES}} placeholders.
 * @param messages - Array of interview messages
 * @param name - The name of the user, used for initial greeting
 * @returns The complete MessageCreateParamsNonStreaming object to send to the Claude API
 */
export function renderPrompt(messages: InterviewMessage[], name: string): MessageCreateParamsNonStreaming {
  if (!PROMPT_CONFIG) {
    throw new Error('Prompt config not found.');
  }
  
  const interviewLength = messages.length;
  
  // Replace placeholders in the user prompt
  const renderedUserPrompt = PROMPT_CONFIG.user
    .replace(/\{\{INTEVIEW_LENGTH\}\}/g, interviewLength.toString())
    .replace(/\{\{MESSAGES\}\}/g, messages.map(message => `${message.role}: ${message.content}`).join('\n'));
  
  // Convert interview messages to Claude API format
  const claudeMessages = messages.map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content
  }));
  
  // Add the rendered user prompt as the final message
  claudeMessages.push({
    role: 'user',
    content: renderedUserPrompt
  });
  
  // Convert tools from config to Claude API format
  const tools = PROMPT_CONFIG.tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    input_schema: {
      type: 'object' as const,
      properties: tool.input_schema.properties,
      required: tool.input_schema.required
    }
  }));
  
  return {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: PROMPT_CONFIG.system || undefined,
    messages: claudeMessages,
    tools: tools,
    tool_choice: { type: 'tool', name: tools[0].name }
  };
}

/** Returns the initial message from the prompt config, for use as the initial message in the interview */
export function getInitialMessage(name: string): string {
  if (!PROMPT_CONFIG) {
    throw new Error('Prompt config not found.');
  }
  return PROMPT_CONFIG.initial.replace('{{name}}', name);
}
