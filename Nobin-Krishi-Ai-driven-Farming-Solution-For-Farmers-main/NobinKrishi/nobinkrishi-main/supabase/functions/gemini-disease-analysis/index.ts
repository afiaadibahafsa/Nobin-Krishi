import { jsonResponse, optionsResponse } from '../_shared/cors.ts';
import { generateGeminiImageAnalysis, ProviderError } from '../_shared/gemini.ts';
import { analyzeImageWithHuggingFace } from '../_shared/huggingface.ts';
import { DISEASE_ANALYSIS_SYSTEM_PROMPT } from '../_shared/prompts.ts';
import { parseImagePayload, parseJsonBody, parseLanguage } from '../_shared/validate.ts';

interface DiseaseAnalysisJson {
  imageRelevant?: boolean;
  needsBetterImage?: boolean;
  hasVisibleIssue?: boolean;
  likelyCondition?: string | null;
  likelyConditionBn?: string | null;
  crop?: string | null;
  issueType?: string | null;
  severity?: 'Low' | 'Medium' | 'High' | 'Uncertain';
  confidence?: 'uncertain' | 'low' | 'medium' | 'high';
  visibleSymptoms?: string[];
  possibleAlternatives?: string[];
  nextSteps?: string[];
  prevention?: string[];
  whenToConsultSpecialist?: string;
  farmerSummary?: string;
  disclaimer?: string;
}

function extractJson(text: string): DiseaseAnalysisJson {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  const raw = fenced?.[1] || text;
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('No JSON object');
  }
  return JSON.parse(raw.slice(start, end + 1)) as DiseaseAnalysisJson;
}

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
    const image = parseImagePayload(body);
    const requestedProvider = String(body.provider || Deno.env.get('DISEASE_IMAGE_PROVIDER') || 'gemini')
      .toLowerCase();

    if (requestedProvider === 'huggingface') {
      const hf = await analyzeImageWithHuggingFace(image.dataUrl);
      return jsonResponse({
        provider: 'huggingface',
        comparedWithSecondModel: false,
        rawResponse: hf.text,
        analysis: {
          farmerSummary: hf.text,
          likelyCondition: null,
          confidence: 'uncertain',
          disclaimer:
            'This is an optional Dhenu Vision / Hugging Face result. It is not a verified laboratory diagnosis.',
        },
      });
    }

    const prompt = [
      `Language hint: ${language === 'bn' ? 'Bangla' : 'English'}.`,
      'Identify visible crop or plant symptoms only.',
      'Distinguish likely possibilities from uncertain guesses.',
      'If the photo is not a plant, is blurry, or is insufficient, ask for a better image.',
    ].join(' ');

    const reply = await generateGeminiImageAnalysis({
      systemInstruction: DISEASE_ANALYSIS_SYSTEM_PROMPT,
      prompt,
      mimeType: image.mimeType,
      imageBase64: image.base64,
    });

    let analysis: DiseaseAnalysisJson;
    try {
      analysis = extractJson(reply);
    } catch {
      analysis = {
        farmerSummary: reply,
        confidence: 'uncertain',
        needsBetterImage: false,
        disclaimer:
          'This is general image-based agricultural information, not a verified laboratory diagnosis.',
      };
    }

    return jsonResponse({
      provider: 'gemini',
      comparedWithSecondModel: false,
      analysis,
    });
  } catch (error) {
    if (error instanceof ProviderError) {
      return jsonResponse({ error: error.message, code: error.code }, error.status);
    }
    if (error instanceof Error && /Hugging Face/i.test(error.message)) {
      return jsonResponse(
        { error: 'The Hugging Face / Dhenu Vision provider is currently unavailable.', code: 'HF_UNAVAILABLE' },
        503
      );
    }
    return jsonResponse({ error: 'AI service is temporarily unavailable. Please try again.' }, 503);
  }
});
