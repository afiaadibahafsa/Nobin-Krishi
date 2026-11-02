// Dhenu API Client for AI integration
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

export class DhenuAPIClient implements IDhenuAPIClient {
  private apiKey: string;
  private baseURL: string;
  private defaultOptions: APIOptions;

  constructor(apiKey: string, baseURL?: string) {
    this.apiKey = apiKey;
    this.baseURL = baseURL || 'https://api.dhenu.ai/v1'; // Default Dhenu API endpoint
    this.defaultOptions = {
      model: 'dhenu2-in-8b-preview',
      temperature: 0.7,
      maxTokens: 500
    };
  }

  public async sendMessage(messages: APIMessage[], options?: APIOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API key is required');
    }

    if (!messages || messages.length === 0) {
      throw new Error('Messages array cannot be empty');
    }

    // Check network connectivity
    if (!navigator.onLine) {
      throw new Error('Connection issue, please check internet');
    }

    const requestOptions = { ...this.defaultOptions, ...options };

    // Input validation
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage.content || lastMessage.content.trim() === '') {
      throw new Error('Please speak or type your question');
    }

    // Prepare system message for agricultural context
    const systemMessage: APIMessage = {
      role: 'system',
      content: 'You are a helpful agricultural assistant for farmers in Bangladesh. Provide practical, accurate advice about farming, crops, weather, market prices, and agricultural best practices. Respond in the same language as the user\'s question (Bangla or English). Keep responses concise and actionable.'
    };

    // Prepare request body
    const requestBody = {
      model: requestOptions.model,
      messages: [systemMessage, ...messages],
      temperature: requestOptions.temperature,
      max_tokens: requestOptions.maxTokens,
      stream: false
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData.error && errorData.error.message) {
            errorMessage = errorData.error.message;
          }
        } catch (parseError) {
          // If we can't parse the error response, use the status text
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        }

        // Handle specific HTTP status codes
        switch (response.status) {
          case 400:
            throw new Error('Invalid request format');
          case 401:
            throw new Error('Invalid API key');
          case 403:
            throw new Error('API access forbidden');
          case 404:
            throw new Error('API endpoint not found');
          case 429:
            throw new Error('Rate limit exceeded. Please try again later.');
          case 500:
            throw new Error('AI service temporarily unavailable');
          case 502:
          case 503:
          case 504:
            throw new Error('AI service temporarily unavailable');
          default:
            throw new Error(errorMessage);
        }
      }

      const data: DhenuAPIResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from AI service');
      }

      const aiResponse = data.choices[0].message.content;
      
      if (!aiResponse || aiResponse.trim() === '') {
        throw new Error('Empty response from AI service');
      }

      return aiResponse.trim();

    } catch (error) {
      console.error('Dhenu API Error:', error);
      
      if (error instanceof Error) {
        // Handle specific error types
        if (error.name === 'AbortError') {
          throw new Error('Request timeout. Please try again.');
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Connection issue, please check internet');
        } else if (error.message.includes('401')) {
          throw new Error('Invalid API key');
        } else if (error.message.includes('429')) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503') || error.message.includes('504')) {
          throw new Error('AI service temporarily unavailable');
        }
        
        throw error;
      }
      
      throw new Error('Failed to get AI response');
    }
  }

  // Validate API key format
  public validateAPIKey(): boolean {
    return !!(this.apiKey && this.apiKey.length > 10);
  }

  // Network connectivity monitoring
  public async checkNetworkConnectivity(): Promise<boolean> {
    if (!navigator.onLine) {
      return false;
    }

    try {
      // Try to fetch a small resource to verify actual connectivity
      const response = await fetch('https://httpbin.org/status/200', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Enhanced connection test with timeout
  public async testConnectionWithTimeout(timeoutMs: number = 10000): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const testMessages: APIMessage[] = [
        { role: 'user', content: 'Test' }
      ];
      
      await this.sendMessage(testMessages);
      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }

  // Get API status
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

  // Update API key
  public updateAPIKey(newApiKey: string): void {
    this.apiKey = newApiKey;
  }

  // Update base URL (for testing or different endpoints)
  public updateBaseURL(newBaseURL: string): void {
    this.baseURL = newBaseURL;
  }

  // Get current configuration
  public getConfig(): { baseURL: string; hasApiKey: boolean; defaultOptions: APIOptions } {
    return {
      baseURL: this.baseURL,
      hasApiKey: !!this.apiKey,
      defaultOptions: { ...this.defaultOptions }
    };
  }
}