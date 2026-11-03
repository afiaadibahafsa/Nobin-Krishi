import { jsonResponse, optionsResponse } from '../_shared/cors.ts';
import { chatTurnsToGeminiContents, generateGeminiContent, ProviderError } from '../_shared/gemini.ts';
import { FARMING_CHAT_SYSTEM_PROMPT } from '../_shared/prompts.ts';
import { parseJsonBody, parseLanguage, sanitizeMessages } from '../_shared/validate.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return optionsResponse();
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = parseJsonBody(await req.text());
    const language = parseLanguage(body.language);
    const messages = sanitizeMessages(body.messages);
    const contents = chatTurnsToGeminiContents(messages);

    const reply = await generateGeminiContent({
      systemInstruction: `${FARMING_CHAT_SYSTEM_PROMPT}\nPreferred language: ${language === 'bn' ? 'Bangla' : 'English'}.`,
      contents,
      temperature: 0.6,
      maxOutputTokens: 1024,
    });

    return jsonResponse({ reply, provider: 'gemini' });
  } catch (error) {
    if (error instanceof ProviderError) {
      return jsonResponse({ error: error.message, code: error.code }, error.status);
    }
    return jsonResponse({ error: 'AI service is temporarily unavailable. Please try again.' }, 503);
  }
});
