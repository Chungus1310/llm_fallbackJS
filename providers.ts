import { OpenAI } from 'openai';
import { HfInference } from "@huggingface/inference";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AllProvidersFailedError } from './exceptions';

export abstract class LLMProvider {
  abstract generate(prompt: string, options?: { model?: string; temperature?: number; max_tokens?: number }): Promise<string>;
  abstract isAvailable(): boolean;
}

export class HuggingFaceProvider extends LLMProvider {
  private client: HfInference;
  private apiKey: string;
  private modelName: string = 'mistralai/Mistral-Nemo-Instruct-2407';  // Updated model name

  constructor(apiKey: string = process.env.HUGGINGFACE_API_KEY || '') {
    super();
    this.apiKey = apiKey;
    this.client = new HfInference(this.apiKey);
  }

  async generate(prompt: string, options?: { model?: string; temperature?: number; max_tokens?: number }): Promise<string> {
    if (!this.isAvailable()) throw new Error('HuggingFace API key not set');
    
    try {
      const response = await this.client.textGeneration({
        model: options?.model || this.modelName,
        inputs: prompt,
        parameters: {
          max_new_tokens: options?.max_tokens || 100,
          temperature: options?.temperature || 0.7,
          top_p: 0.95,
          return_full_text: false
        }
      });

      // Improve response cleaning
      let text = response.generated_text || '';
      text = text.replace(/<[^>]*>/g, '') // Remove XML tags
                 .replace(/\s+/g, ' ')     // Normalize whitespace
                 .trim();                  // Remove leading/trailing spaces
      
      return text.length > 0 ? text : 'No response generated';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`HuggingFace API error: ${errorMessage}`);
    }
  }

  isAvailable(): boolean {
    const isValidKey = typeof this.apiKey === 'string' && this.apiKey.length > 0;
    if (!isValidKey) {
      console.warn('HuggingFace API key not found in environment variables');
    }
    return isValidKey;
  }
}

export class OpenRouterProvider extends LLMProvider {
  private client: OpenAI;
  private modelName: string = 'mistralai/mistral-7b-instruct:free';
  private siteInfo: { url: string; name: string };

  constructor(
    apiKey: string = process.env.OPENROUTER_API_KEY || '',
    siteInfo = { url: 'http://localhost:3000', name: 'LLM Fallback Test' }
  ) {
    super();
    this.siteInfo = siteInfo;
    this.client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey,
      defaultHeaders: {
        "HTTP-Referer": this.siteInfo.url,
        "X-Title": this.siteInfo.name
      }
    });
  }

  async generate(prompt: string, options?: { model?: string; temperature?: number; max_tokens?: number }): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('OpenRouter API key not set');
    }

    try {
      const completion = await this.client.chat.completions.create(
        {
          model: options?.model || this.modelName,
          messages: [{ role: 'user', content: prompt }],
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.max_tokens ?? 1000,
        },
        {
          headers: {
            "HTTP-Referer": this.siteInfo.url,
            "X-Title": this.siteInfo.name
          }
        }
      );

      if (!completion.choices?.[0]?.message?.content) {
        throw new Error('No response content received');
      }

      return completion.choices[0].message.content.trim();

    } catch (error: any) {
      // Enhanced error logging
      const statusCode = error.response?.status;
      const errorBody = error.response?.data;
      
      console.error('OpenRouter Debug:', {
        error: String(error),
        status: statusCode,
        message: error.message,
        responseData: errorBody
      });

      // Specific error handling
      if (statusCode === 401) {
        throw new Error('OpenRouter authentication failed: Invalid API key');
      } else if (statusCode === 429) {
        throw new Error('OpenRouter rate limit exceeded');
      }

      throw new Error(`OpenRouter error: ${error.message || 'Unknown error'}`);
    }
  }

  isAvailable(): boolean {
    const isValidKey = typeof this.client.apiKey === 'string' && 
                      this.client.apiKey.length > 0 && 
                      this.client.apiKey !== 'invalid-key';
    
    if (!isValidKey) {
      console.warn('OpenRouter: Invalid or missing API key');
    }
    return isValidKey;
  }
}

export class NvidiaProvider extends LLMProvider {
  private client: OpenAI;
  private modelName: string = 'meta/llama-3.3-70b-instruct';

  constructor(apiKey: string = process.env.NVIDIA_API_KEY || '') {
    super();
    this.client = new OpenAI({ apiKey, baseURL: 'https://integrate.api.nvidia.com/v1' });
  }

  async generate(prompt: string, options?: { model?: string; temperature?: number; max_tokens?: number }): Promise<string> {
    if (!this.isAvailable()) throw new Error('NVIDIA API key not set');
    
    try {
      const completion = await this.client.chat.completions.create({
        model: options?.model || this.modelName,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 1000,
        top_p: 0.7,
        stream: false
      });

      const response = completion.choices[0]?.message?.content?.trim();
      return response || 'No response generated';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`NVIDIA API error: ${errorMessage}`);
    }
  }

  isAvailable(): boolean {
    const isValidKey = typeof this.client.apiKey === 'string' && this.client.apiKey.length > 0;
    if (!isValidKey) {
      console.warn('NVIDIA API key not found in environment variables');
    }
    return isValidKey;
  }
}

export class GeminiProvider extends LLMProvider {
  private client: GoogleGenerativeAI;
  private modelName: string = 'gemini-1.5-flash';
  
  constructor(apiKey: string = process.env.GEMINI_API_KEY || '') {
    super();
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generate(prompt: string, options?: { model?: string; temperature?: number; max_tokens?: number }): Promise<string> {
    if (!this.isAvailable()) throw new Error('Gemini API key not set');

    const model = this.client.getGenerativeModel({
      model: options?.model || this.modelName,
    });

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options?.temperature || 0.7,
          maxOutputTokens: options?.max_tokens || 1000,
          topP: 0.95,
          topK: 64,
        },
      });

      const response = result.response?.text()?.trim();
      return response || 'No response generated';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Gemini API error: ${errorMessage}`);
    }
  }

  isAvailable(): boolean {
    const isValidKey = typeof this.client.apiKey === 'string' && this.client.apiKey.length > 0;
    if (!isValidKey) {
      console.warn('Gemini API key not found in environment variables');
    }
    return isValidKey;
  }
}