import { isAiBackendConfigured, requestVoiceAssistant, type ChatTurn } from '@/services/ai/invokeFunction';

export interface APIOptions {
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface APIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface DhenuAPIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface IDhenuAPIClient {
  sendMessage(messages: APIMessage[], options?: APIOptions): Promise<string>;
}

function detectLanguage(messages: APIMessage[]): 'bn' | 'en' {
  const lastUser = [...messages].reverse().find((message) => message.role === 'user');
  return lastUser && /[\u0980-\u09FF]/.test(lastUser.content) ? 'bn' : 'en';
}

export class DhenuAPIClient implements IDhenuAPIClient {
  private apiKey: string;
  private baseURL: string;
  private defaultOptions: APIOptions;

  constructor(apiKey?: string, baseURL?: string) {
    this.apiKey = apiKey || '';
    this.baseURL = baseURL || (import.meta.env.VITE_SUPABASE_URL || '');
    this.defaultOptions = {
      model: 'gemini-voice-assistant',
      temperature: 0.5,
      maxTokens: 500
    };
  }

  public async sendMessage(messages: APIMessage[], options?: APIOptions): Promise<string> {
    void options;

    if (!messages || messages.length === 0) {
      throw new Error('Messages array cannot be empty');
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('Connection issue, please check internet');
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage.content || lastMessage.content.trim() === '') {
      throw new Error('Please speak or type your question');
    }

    const contextMessages: ChatTurn[] = messages
      .filter((message) => message.role !== 'system' || !/language switched/i.test(message.content))
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

    return requestVoiceAssistant(contextMessages, detectLanguage(messages));
  }

  public validateAPIKey(): boolean {
    if (isAiBackendConfigured()) {
      return true;
    }
    return !!(this.apiKey && this.apiKey.length > 10 && this.apiKey !== 'dummy-api-key');
  }

  public async checkNetworkConnectivity(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return false;
    }

    try {
      const response = await fetch('https://httpbin.org/status/200', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      void response;
      return true;
    } catch (error) {
      void error;
      return false;
    }
  }

  public async testConnectionWithTimeout(timeoutMs: number = 10000): Promise<boolean> {
    void timeoutMs;
    try {
      const testMessages: APIMessage[] = [
        { role: 'user', content: 'Test' }
      ];
      await this.sendMessage(testMessages);
      return true;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }

  public async testConnection(): Promise<boolean> {
    return this.testConnectionWithTimeout();
  }

  public async getAPIStatus(): Promise<{ status: 'online' | 'offline'; message: string }> {
    try {
      const isOnline = await this.testConnection();
      return {
        status: isOnline ? 'online' : 'offline',
        message: isOnline ? 'API is working correctly' : 'API is not responding'
      };
    } catch (error) {
      return {
        status: 'offline',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public updateAPIKey(newApiKey: string): void {
    this.apiKey = newApiKey;
  }

  public updateBaseURL(newBaseURL: string): void {
    this.baseURL = newBaseURL;
  }

  public getConfig(): { baseURL: string; hasApiKey: boolean; defaultOptions: APIOptions } {
    return {
      baseURL: this.baseURL,
      hasApiKey: isAiBackendConfigured() || !!this.apiKey,
      defaultOptions: { ...this.defaultOptions }
    };
  }
}
