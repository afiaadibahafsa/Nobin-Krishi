const DEFAULT_TIMEOUT_MS = 45000;
const MAX_MESSAGE_CHARS = 4000;
const MAX_HISTORY_MESSAGES = 8;

export type AiFunctionName =
  | 'gemini-farming-chat'
  | 'gemini-voice-assistant'
  | 'gemini-disease-analysis';

export interface ChatTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class AiServiceError extends Error {
  code: string;
  status?: number;

  constructor(message: string, code = 'AI_ERROR', status?: number) {
    super(message);
    this.name = 'AiServiceError';
    this.code = code;
    this.status = status;
  }
}

function getSupabaseConfig() {
  const url = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
  return { url, anonKey };
}

export function isAiBackendConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey);
}

export function sanitizeChatTurns(messages: ChatTurn[]): ChatTurn[] {
  return messages
    .filter((message) => message.content && message.content.trim().length > 0)
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_MESSAGE_CHARS),
    }));
}

function mapStatusToMessage(status: number, fallback: string): { message: string; code: string } {
  switch (status) {
    case 400:
      return { message: 'Please check your question and try again.', code: 'INVALID_REQUEST' };
    case 401:
    case 403:
      return { message: 'AI service is not configured yet. Please try again later.', code: 'AUTH' };
    case 404:
      return { message: 'AI service is not available. Please try again later.', code: 'NOT_FOUND' };
    case 408:
      return { message: 'Request timeout. Please try again.', code: 'TIMEOUT' };
    case 413:
      return { message: 'The image or message is too large. Please try a smaller one.', code: 'PAYLOAD' };
    case 429:
      return { message: 'The free AI quota is currently busy. Please wait a moment and try again.', code: 'RATE_LIMIT' };
    case 500:
    case 502:
    case 503:
    case 504:
      return { message: 'AI service is temporarily unavailable. Please try again.', code: 'UNAVAILABLE' };
    default:
      return { message: fallback || 'Failed to get AI response.', code: 'AI_ERROR' };
  }
}

export async function invokeAiFunction<TResponse>(
  functionName: AiFunctionName,
  body: Record<string, unknown>,
  options?: { timeoutMs?: number }
): Promise<TResponse> {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) {
    throw new AiServiceError(
      'AI service is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.',
      'NOT_CONFIGURED'
    );
  }

  const controller = new AbortController();
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${url}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    let payload: Record<string, unknown> | null = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const serverMessage =
        (typeof payload?.error === 'string' && payload.error) ||
        (typeof payload?.message === 'string' && payload.message) ||
        '';
      const mapped = mapStatusToMessage(response.status, serverMessage);
      throw new AiServiceError(mapped.message, mapped.code, response.status);
    }

    return (payload ?? {}) as TResponse;
  } catch (error) {
    if (error instanceof AiServiceError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new AiServiceError('Request timeout. Please try again.', 'TIMEOUT', 408);
    }

    if (!navigator.onLine || (error instanceof Error && /Failed to fetch|NetworkError/i.test(error.message))) {
      throw new AiServiceError('Connection issue, please check internet', 'NETWORK');
    }

    throw new AiServiceError('Failed to get AI response.', 'AI_ERROR');
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function requestFarmingChat(messages: ChatTurn[], language: 'bn' | 'en' = 'bn'): Promise<string> {
  const sanitized = sanitizeChatTurns(messages);
  if (sanitized.length === 0) {
    throw new AiServiceError('Please speak or type your question', 'EMPTY');
  }

  const data = await invokeAiFunction<{ reply?: string }>('gemini-farming-chat', {
    messages: sanitized,
    language,
  });

  const reply = data.reply?.trim();
  if (!reply) {
    throw new AiServiceError('No response from AI service', 'EMPTY_RESPONSE');
  }
  return reply;
}

export async function requestVoiceAssistant(messages: ChatTurn[], language: 'bn' | 'en' = 'bn'): Promise<string> {
  const sanitized = sanitizeChatTurns(messages);
  if (sanitized.length === 0) {
    throw new AiServiceError('Please speak or type your question', 'EMPTY');
  }

  const data = await invokeAiFunction<{ reply?: string }>('gemini-voice-assistant', {
    messages: sanitized,
    language,
  });

  const reply = data.reply?.trim();
  if (!reply) {
    throw new AiServiceError('No response from AI service', 'EMPTY_RESPONSE');
  }
  return reply;
}
