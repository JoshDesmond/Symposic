
export interface PromptConfig {
  version: string;
  metadata: {
    description: string;
    created: string;
  };
  /** The 'system' prompt sent to the Claude API */
  system: string;
  initial: string;
  /** The 'user' prompt sent to the Claude API */
  user: string;
  tools: Array<{
    name: string;
    description: string;
    input_schema: {
      type: string;
      properties: Record<string, {
        type: string
        description: string;
        minimum?: number; // TODO I'm not sure if this was halucinated and does anything or not
        maximum?: number;
      }>;
      required: string[];
    };
  }>;
}
