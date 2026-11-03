import { ProviderError } from './gemini.ts';

export const MAX_CHAT_MESSAGES = 8;
export const MAX_MESSAGE_CHARS = 4000;
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);

export interface ChatTurn {
  role: string;
  content: string;
}

export function parseJsonBody(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new ProviderError('Invalid request format', 400, 'INVALID_JSON');
  }
}

export function sanitizeMessages(input: unknown): ChatTurn[] {
  if (!Array.isArray(input) || input.length === 0) {
    throw new ProviderError('Please speak or type your question', 400, 'EMPTY');
  }

  const messages = input
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const role = String((item as ChatTurn).role || 'user');
      const content = String((item as ChatTurn).content || '').trim().slice(0, MAX_MESSAGE_CHARS);
      return { role, content };
    })
    .filter((item) => item.content.length > 0)
    .slice(-MAX_CHAT_MESSAGES);

  if (messages.length === 0) {
    throw new ProviderError('Please speak or type your question', 400, 'EMPTY');
  }

  return messages;
}

export function parseLanguage(input: unknown): 'bn' | 'en' {
  return input === 'en' ? 'en' : 'bn';
}

function estimateBase64Bytes(base64: string): number {
  const padding = (base64.match(/=+$/) || [''])[0].length;
  return Math.floor((base64.length * 3) / 4) - padding;
}

export function parseImagePayload(body: Record<string, unknown>): {
  mimeType: string;
  base64: string;
  dataUrl: string;
} {
  const raw = String(body.imageBase64 || body.image || '');
  if (!raw) {
    throw new ProviderError('Please upload a crop or plant image.', 400, 'MISSING_IMAGE');
  }

  let mimeType = String(body.mimeType || 'image/jpeg');
  let base64 = raw;

  const dataUrlMatch = raw.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (dataUrlMatch) {
    mimeType = dataUrlMatch[1];
    base64 = dataUrlMatch[2];
  }

  if (mimeType === 'image/jpg') {
    mimeType = 'image/jpeg';
  }

  if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {
    throw new ProviderError('Please upload a JPEG, PNG, or WebP image.', 400, 'INVALID_IMAGE_TYPE');
  }

  if (estimateBase64Bytes(base64) > MAX_IMAGE_BYTES) {
    throw new ProviderError('Please use an image smaller than 4 MB.', 413, 'IMAGE_TOO_LARGE');
  }

  return {
    mimeType,
    base64,
    dataUrl: `data:${mimeType};base64,${base64}`,
  };
}
