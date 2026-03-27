import { aiManager } from '../ai';
import type { AIEngineConfig } from '../ai/types';
import { getDefaultModelForProvider } from '../ai/providerCatalog';

export async function initializeAI(config?: { provider?: AIEngineConfig['provider']; apiKey: string; baseUrl: string; model: string }) {
  let provider = config?.provider;
  let apiKey = config?.apiKey;
  let baseUrl = config?.baseUrl;
  let model = config?.model;

  if (!apiKey || !baseUrl) {
    try {
      const stored = await window.electronAPI?.storage?.getAISettings?.();
      if (stored?.provider) provider = provider || stored.provider;
      if (stored?.apiKey) apiKey = stored.apiKey;
      if (stored?.baseUrl) baseUrl = stored.baseUrl;
      if (stored?.defaultModel) model = model || stored.defaultModel;
    } catch {
      // Ignore storage read failures during bootstrap.
    }
  }

  if (!apiKey || !baseUrl) {
    console.log('AI is not configured yet, skipping bootstrap.');
    return false;
  }

  const resolvedProvider = provider || 'claude';

  try {
    const engineConfig: AIEngineConfig = {
      provider: resolvedProvider,
      apiKey,
      baseUrl,
      model: model || getDefaultModelForProvider(resolvedProvider),
      enabled: true,
      timeout: 120000,
      maxRetries: 3,
    };

    aiManager.registerEngine(engineConfig);
    aiManager.setDefaultEngine(resolvedProvider);
    console.log(`AI bootstrap succeeded for provider: ${resolvedProvider}`);
    return true;
  } catch (error) {
    console.error('AI bootstrap failed:', error);
    return false;
  }
}
