import type { AIProvider, IAIEngine, AIEngineConfig } from './types';
import { OpenClawEngine } from './engines/OpenClawEngine';
import { ClaudeEngine } from './engines/ClaudeEngine';

export class AIEngineFactory {
  private static engines: Map<string, IAIEngine> = new Map();

  static createEngine(config: AIEngineConfig): IAIEngine {
    const key = this.getEngineKey(config.provider, config.baseUrl);

    if (this.engines.has(key)) {
      const engine = this.engines.get(key)!;
      engine.updateConfig(config);
      return engine;
    }

    let engine: IAIEngine;

    switch (config.provider) {
      case 'openclaw':
      case 'openai':
      case 'bailian':
      case 'glm':
      case 'deepseek':
      case 'qwen':
        engine = new OpenClawEngine(config);
        break;

      case 'claude':
        engine = new ClaudeEngine(config);
        break;

      case 'gemini':
        throw new Error('Gemini engine not implemented yet');

      case 'ernie':
        throw new Error('ERNIE engine not implemented yet');

      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }

    this.engines.set(key, engine);
    return engine;
  }

  static getEngine(provider: AIProvider, baseUrl?: string): IAIEngine | undefined {
    const key = this.getEngineKey(provider, baseUrl);
    return this.engines.get(key);
  }

  static getAllEngines(): IAIEngine[] {
    return Array.from(this.engines.values());
  }

  static removeEngine(provider: AIProvider, baseUrl?: string): boolean {
    const key = this.getEngineKey(provider, baseUrl);
    return this.engines.delete(key);
  }

  static clearAll(): void {
    this.engines.clear();
  }

  private static getEngineKey(provider: AIProvider, baseUrl?: string): string {
    return baseUrl ? `${provider}:${baseUrl}` : provider;
  }
}
