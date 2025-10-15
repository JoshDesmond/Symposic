import Anthropic from '@anthropic-ai/sdk';

export class ClaudeService {
  private anthropic: Anthropic | null = null;

  setDependencies(claude: Anthropic): void {
    this.anthropic = claude;
  }

  // TODO implement claude service methods
}
