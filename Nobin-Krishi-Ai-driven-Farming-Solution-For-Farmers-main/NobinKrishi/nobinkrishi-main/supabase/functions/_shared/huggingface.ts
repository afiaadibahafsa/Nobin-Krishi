const DEFAULT_SPACE = 'KissanAI/Dhenu-vision-lora-0.1';

export interface HuggingFaceResult {
  text: string;
  space: string;
}

function resolveSpaceUrl(raw?: string): { identifier: string; predictUrl: string } {
  let identifier = (raw || Deno.env.get('HF_SPACE_URL') || DEFAULT_SPACE).trim();
  identifier = identifier.replace(/\/$/, '');

  if (identifier.includes('huggingface.co/spaces/')) {
    identifier = identifier.split('/spaces/')[1].split('?')[0];
  }

  if (/^https?:\/\/.+\.hf\.space/i.test(identifier)) {
    return {
      identifier,
      predictUrl: `${identifier.replace(/\/$/, '')}/api/predict`,
    };
  }

  const slug = identifier.toLowerCase().replace('/', '-');
  return {
    identifier,
    predictUrl: `https://${slug}.hf.space/api/predict`,
  };
}

export async function analyzeImageWithHuggingFace(
  imageDataUrl: string,
  timeoutMs = 45000
): Promise<HuggingFaceResult> {
  const { identifier, predictUrl } = resolveSpaceUrl();
  const token = Deno.env.get('HF_TOKEN') || Deno.env.get('HUGGINGFACE_API_KEY');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(predictUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: [imageDataUrl],
      }),
      signal: controller.signal,
    });

    const bodyText = await response.text();
    if (!response.ok) {
      throw new Error(`Hugging Face Space returned ${response.status}`);
    }

    let payload: Record<string, unknown> = {};
    try {
      payload = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      return { text: bodyText, space: identifier };
    }

    const data = payload.data;
    if (Array.isArray(data) && data.length > 0) {
      const first = data[0];
      if (typeof first === 'string') {
        return { text: first, space: identifier };
      }
      return { text: JSON.stringify(first), space: identifier };
    }

    if (typeof payload.text === 'string') {
      return { text: payload.text, space: identifier };
    }

    return { text: JSON.stringify(payload), space: identifier };
  } finally {
    clearTimeout(timeoutId);
  }
}
