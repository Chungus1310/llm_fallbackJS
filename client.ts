import { LLMProvider } from './providers';
import { HuggingFaceProvider, OpenRouterProvider, NvidiaProvider, GeminiProvider } from './providers';
import { AllProvidersFailedError } from './exceptions';

export class LLMClient {
  private providers: LLMProvider[];

  constructor(providers?: LLMProvider[]) {
    this.providers = providers || [
      new OpenRouterProvider(),
      new HuggingFaceProvider(),
      new NvidiaProvider(),
      new GeminiProvider()  // Add Gemini as default provider
    ];
  }

  async generate(prompt: string, options?: { temperature?: number; max_tokens?: number }): Promise<string> {
    for (const provider of this.providers) {
      if (!provider.isAvailable()) continue;
      
      try {
        const result = await provider.generate(prompt, options);
        console.log(`Successfully used ${provider.constructor.name}`);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error(`${provider.constructor.name} failed: ${errorMessage}`);
      }
    }
    
    throw new AllProvidersFailedError('All LLM providers failed');
  }

  addProvider(provider: LLMProvider): void {
    this.providers.push(provider);
  }

  setProviders(providers: LLMProvider[]): void {
    this.providers = providers;
  }
}