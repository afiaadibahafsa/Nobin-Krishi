const DEFAULT_MODEL = 'gemini-3.8-flash';
const GEMINI_TIMEOUT_MS = 40000;
const MAX_OUTPUT_TOKENS_TEXT = 1024;
const MAX_OUTPUT_TOKENS_VISION = 1400;

export interface GeminiPart {
  text?: string;
  inline_data?: {
    mime_type: string;
    data: string;
  };
}

export interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

export class ProviderError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = 'PROVIDER_ERROR') {
    super(message);
    this.name = 'ProviderError';
    this.status = status;
    this.code = code;
  }
}

function getApiKey(): string {
  const key = Deno.env.get('GEMINI_API_KEY');
  if (!key) {
    throw new ProviderError(
      'Gemini is not configured on the server.',
      503,
      'MISSING_API_KEY'
    );
  }
  return key;
}

export function getGeminiModel(): string {
  return Deno.env.get('GEMINI_MODEL') || DEFAULT_MODEL;
}

function extractText(payload: Record<string, unknown>): string {
  const candidates = payload.candidates as Array<Record<string, unknown>> | undefined;
  const first = candidates?.[0];
  const content = first?.content as Record<string, unknown> | undefined;
  const parts = content?.parts as Array<Record<string, unknown>> | undefined;
  const text = parts
    ?.map((part) => (typeof part.text === 'string' ? part.text : ''))
    .join('\n')
    .trim();

  if (text) {
    return text;
  }

  const promptFeedback = payload.promptFeedback as Record<string, unknown> | undefined;
  if (promptFeedback?.blockReason) {
    throw new ProviderError(
      'The request could not be processed. Please try a different question or image.',
      400,
      'BLOCKED'
    );
  }

  throw new ProviderError('No response from AI service', 502, 'EMPTY_RESPONSE');
}

function mapGeminiHttpError(status: number, bodyText: string): ProviderError {
  const lower = bodyText.toLowerCase();
  if (status === 429 || lower.includes('resource_exhausted') || lower.includes('quota')) {
    return new ProviderError(
      'The free AI quota is currently busy. Please wait a moment and try again.',
      429,
      'RATE_LIMIT'
    );
  }
  if (status === 400) {
    return new ProviderError('Please check your question and try again.', 400, 'INVALID_REQUEST');
  }
  if (status === 401 || status === 403) {
    return new ProviderError('AI service is not configured correctly.', 503, 'AUTH');
  }
  if (status === 404) {
    return new ProviderError(
      'The configured AI model is unavailable. Check GEMINI_MODEL.',
      503,
      'MODEL_NOT_FOUND'
    );
  }
  return new ProviderError('AI service is temporarily unavailable. Please try again.', 503, 'UNAVAILABLE');
}

export async function generateGeminiContent(options: {
  systemInstruction: string;
  contents: GeminiContent[];
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<string> {
  const apiKey = getApiKey();
  const model = getGeminiModel();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: options.systemInstruction }],
          },
          contents: options.contents,
          generationConfig: {
            temperature: options.temperature ?? 0.6,
            maxOutputTokens: options.maxOutputTokens ?? MAX_OUTPUT_TOKENS_TEXT,
          },
        }),
        signal: controller.signal,
      }
    );

    const bodyText = await response.text();
    let payload: Record<string, unknown> = {};
    try {
      payload = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      payload = {};
    }

    if (!response.ok) {
      throw mapGeminiHttpError(response.status, bodyText);
    }

    return extractText(payload);
  } catch (error) {
    if (error instanceof ProviderError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ProviderError('Request timeout. Please try again.', 408, 'TIMEOUT');
    }
    throw new ProviderError('AI service is temporarily unavailable. Please try again.', 503, 'UNAVAILABLE');
  } finally {
    clearTimeout(timeoutId);
  }
}

export function chatTurnsToGeminiContents(
  messages: Array<{ role: string; content: string }>
): GeminiContent[] {
  const contents: GeminiContent[] = [];

  for (const message of messages) {
    if (!message.content?.trim()) continue;
    if (message.role === 'system') continue;

    const role: 'user' | 'model' = message.role === 'assistant' ? 'model' : 'user';
    const last = contents[contents.length - 1];
    if (last && last.role === role) {
      last.parts[0].text = `${last.parts[0].text}\n${message.content.trim()}`;
    } else {
      contents.push({
        role,
        parts: [{ text: message.content.trim() }],
      });
    }
  }

  if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
    throw new ProviderError('Please speak or type your question', 400, 'EMPTY');
  }

  return contents;
}

export async function generateGeminiImageAnalysis(options: {
  systemInstruction: string;
  prompt: string;
  mimeType: string;
  imageBase64: string;
}): Promise<string> {
  return generateGeminiContent({
    systemInstruction: options.systemInstruction,
    contents: [
      {
        role: 'user',
        parts: [
          {
            inline_data: {
              mime_type: options.mimeType,
              data: options.imageBase64,
            },
          },
          { text: options.prompt },
        ],
      },
    ],
    temperature: 0.3,
    maxOutputTokens: MAX_OUTPUT_TOKENS_VISION,
  });
}
