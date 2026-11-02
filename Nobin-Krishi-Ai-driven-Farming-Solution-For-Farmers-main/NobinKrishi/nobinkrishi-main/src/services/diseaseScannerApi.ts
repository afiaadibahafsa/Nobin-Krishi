/**
 * Service for interacting with Hugging Face Space running Dhenu Vision LoRA model
 * Handles image upload, inference, retries, and error handling
 * Uses @gradio/client for reliable Space integration
 */

import { client } from '@gradio/client';

export interface DiseaseAnalysisResult {
  diseaseName?: string;
  diseaseNameBn?: string;
  symptoms?: string[];
  severity?: "Low" | "Medium" | "High";
  confidence?: number;
  crop?: string;
  type?: string;
  description?: string;
  treatment?: string[];
  prevention?: string[];
  rawResponse?: string;
}

/**
 * Convert base64 image data URL to File object for Gradio client
 */
function base64ToFile(base64: string, filename: string = 'crop_image.jpg'): File {
  const base64Data = base64.split(',')[1] || base64;
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/jpeg' });
  return new File([blob], filename, { type: 'image/jpeg' });
}

/**
 * Parse AI response text into structured disease information
 * The model returns plain text, so we need to extract structured data
 */
function parseDiseaseResponse(responseText: string): DiseaseAnalysisResult {
  const result: DiseaseAnalysisResult = {
    rawResponse: responseText,
  };

  // Try to extract disease name (common patterns)
  const diseaseNameMatch = responseText.match(/(?:disease|identified|detected)[\s:]+([A-Z][a-z\s]+(?:Blast|Blight|Spot|Mosaic|Rot|Wilt|Rust)?)/i);
  if (diseaseNameMatch) {
    result.diseaseName = diseaseNameMatch[1].trim();
  }

  // Try to extract severity
  const severityMatch = responseText.match(/(?:severity|level)[\s:]+(low|medium|high|mild|moderate|severe)/i);
  if (severityMatch) {
    const severity = severityMatch[1].toLowerCase();
    if (severity.includes('high') || severity.includes('severe')) {
      result.severity = "High";
    } else if (severity.includes('medium') || severity.includes('moderate')) {
      result.severity = "Medium";
    } else {
      result.severity = "Low";
    }
  }

  // Try to extract confidence
  const confidenceMatch = responseText.match(/(?:confidence|accuracy)[\s:]+(\d+(?:\.\d+)?)%?/i);
  if (confidenceMatch) {
    result.confidence = parseFloat(confidenceMatch[1]);
  }

  // Extract symptoms (look for bullet points or numbered lists)
  const symptoms: string[] = [];
  const symptomLines = responseText.match(/(?:symptom|sign)[s]?:?\s*\n?([•\-\*]\s*.+|(?:\d+\.\s*.+))/gi);
  if (symptomLines) {
    symptomLines.forEach(line => {
      const cleanLine = line.replace(/^[•\-\*\d\.\s]+/i, '').trim();
      if (cleanLine) symptoms.push(cleanLine);
    });
  }
  if (symptoms.length > 0) {
    result.symptoms = symptoms;
  }

  // Extract treatment recommendations
  const treatmentLines = responseText.match(/(?:treatment|cure|remedy|action)[s]?:?\s*\n?([•\-\*]\s*.+|(?:\d+\.\s*.+))/gi);
  if (treatmentLines) {
    const treatments: string[] = [];
    treatmentLines.forEach(line => {
      const cleanLine = line.replace(/^[•\-\*\d\.\s]+/i, '').trim();
      if (cleanLine) treatments.push(cleanLine);
    });
    if (treatments.length > 0) {
      result.treatment = treatments;
    }
  }

  // Extract prevention advice
  const preventionLines = responseText.match(/(?:prevention|prevent|avoid)[s]?:?\s*\n?([•\-\*]\s*.+|(?:\d+\.\s*.+))/gi);
  if (preventionLines) {
    const preventions: string[] = [];
    preventionLines.forEach(line => {
      const cleanLine = line.replace(/^[•\-\*\d\.\s]+/i, '').trim();
      if (cleanLine) preventions.push(cleanLine);
    });
    if (preventions.length > 0) {
      result.prevention = preventions;
    }
  }

  // Try to identify crop type
  const cropMatch = responseText.match(/(?:crop|plant)[\s:]+(rice|wheat|maize|corn|potato|tomato)/i);
  if (cropMatch) {
    result.crop = cropMatch[1].charAt(0).toUpperCase() + cropMatch[1].slice(1);
  }

  // Extract description (first paragraph or sentence)
  const descriptionMatch = responseText.match(/(?:description|about|information)[\s:]+(.+?)(?:\.\s|symptom|treatment|prevention)/i);
  if (descriptionMatch) {
    result.description = descriptionMatch[1].trim();
  } else {
    // Fallback: use first sentence
    const firstSentence = responseText.split(/[.!?]/)[0];
    if (firstSentence.length > 20) {
      result.description = firstSentence.trim();
    }
  }

  return result;
}

/**
 * Call Hugging Face Space using Gradio client with retry logic
 * Handles timeouts, retries, and various response formats
 */
async function callHuggingFaceSpace(
  imageFile: File,
  spaceUrl: string,
  retries: number = 2,
  timeout: number = 45000
): Promise<string> {
  // Clean up the space URL (remove trailing slashes)
  // Handle both full URLs and space identifiers like "KissanAI/Dhenu-vision-lora-0.1"
  let cleanUrl = spaceUrl.replace(/\/$/, '');
  
  // If it's a space identifier (username/space-name), keep it as is
  // If it's a full URL, use it directly
  const isSpaceIdentifier = /^[^/]+\/[^/]+$/.test(cleanUrl) && !cleanUrl.startsWith('http');
  if (!isSpaceIdentifier && !cleanUrl.startsWith('http')) {
    // Assume it's a space identifier
    cleanUrl = cleanUrl;
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create a promise that will timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timeout: Model is taking too long to respond. Please try again.'));
        }, timeout);
      });

      // Create the Gradio client and make the prediction
      const predictionPromise = (async () => {
        try {
          // Connect to the Gradio Space
          // The client function can accept either a space identifier or full URL
          const app = await client(cleanUrl, {
            fetch: fetch,
          });

          // Gradio client returns an app object with predict methods
          // The predict method typically takes an endpoint index (0 for first endpoint)
          // and an array of inputs
          // For image inputs, we pass the File object
          
          // Try endpoint index 0 (most common for single-input models)
          let result: any;
          
          try {
            // Most Gradio Spaces use index 0 for the main predict function
            result = await app.predict(0, [imageFile]);
          } catch (indexError: any) {
            // If index 0 fails, try to find the correct endpoint
            // Some spaces might have named endpoints
            try {
              // Try with endpoint name if available
              if (app.endpoints && app.endpoints.length > 0) {
                result = await app.predict(app.endpoints[0].name || 0, [imageFile]);
              } else {
                // Try alternative: submit method
                result = await app.submit(0, [imageFile]);
              }
            } catch (altError: any) {
              throw new Error(`Could not find valid prediction endpoint: ${altError.message || altError}`);
            }
          }

          // Handle different response formats from Gradio
          // The Gradio client predict() method typically returns the output directly
          // or wrapped in a data structure, depending on the Space configuration
          
          // First, check if result is a string (direct output)
          if (typeof result === 'string') {
            return result;
          }
          
          // Check if result is an array (common for multi-output Spaces)
          if (Array.isArray(result) && result.length > 0) {
            const firstResult = result[0];
            if (typeof firstResult === 'string') {
              return firstResult;
            }
            if (firstResult && typeof firstResult === 'object') {
              // Try to extract text from object
              if (firstResult.text) return firstResult.text;
              if (firstResult.label) return firstResult.label;
              if (firstResult.output) {
                return typeof firstResult.output === 'string' ? firstResult.output : JSON.stringify(firstResult.output);
              }
              if (firstResult.disease) {
                return typeof firstResult.disease === 'string' ? firstResult.disease : JSON.stringify(firstResult.disease);
              }
              return JSON.stringify(firstResult);
            }
            return JSON.stringify(firstResult);
          }
          
          // Check if result is an object
          if (result && typeof result === 'object') {
            // Check if result has a data property (wrapped response)
            if (result.data && Array.isArray(result.data) && result.data.length > 0) {
              const output = result.data[0];
              if (typeof output === 'string') {
                return output;
              }
              if (output && typeof output === 'object') {
                if (output.text) return output.text;
                if (output.label) return output.label;
                if (output.output) {
                  return typeof output.output === 'string' ? output.output : JSON.stringify(output.output);
                }
                if (output.disease) {
                  return typeof output.disease === 'string' ? output.disease : JSON.stringify(output.disease);
                }
                return JSON.stringify(output);
              }
            }
            
            // Check for direct string properties
            if (result.text) return result.text;
            if (result.label) return result.label;
            if (result.output) {
              return typeof result.output === 'string' ? result.output : JSON.stringify(result.output);
            }
            if (result.disease) {
              return typeof result.disease === 'string' ? result.disease : JSON.stringify(result.disease);
            }
            
            // Last resort: stringify the whole result
            return JSON.stringify(result);
          }

          throw new Error('Unexpected response format from Gradio Space');
        } catch (error: any) {
          // Re-throw with more context
          const errorMessage = error.message || error.toString() || 'Unknown error';
          throw new Error(`Gradio client error: ${errorMessage}`);
        }
      })();

      // Race between the prediction and timeout
      const responseText = await Promise.race([predictionPromise, timeoutPromise]);
      return responseText;
    } catch (error: any) {
      // If it's the last attempt, throw the error
      if (attempt === retries) {
        // Provide user-friendly error message
        const errorMsg = error.message || 'Failed to connect to the AI model';
        if (errorMsg.includes('timeout') || errorMsg.includes('Timeout')) {
          throw new Error('Request timeout: Model is taking too long to respond. Please try again.');
        }
        if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError') || errorMsg.includes('fetch')) {
          throw new Error('Unable to reach the AI model. Please check your connection and try again.');
        }
        if (errorMsg.includes('404') || errorMsg.includes('not found') || errorMsg.includes('Could not find')) {
          throw new Error('Model is temporarily unavailable. Please try again in a moment.');
        }
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const waitTime = 2000 * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw new Error('Failed to get response after retries');
}

/**
 * Analyze crop disease from image
 * 
 * @param imageBase64 - Base64 encoded image data URL
 * @param spaceUrl - Hugging Face Space URL (defaults to KissanAI/Dhenu-vision-lora-0.1)
 * @returns Parsed disease analysis result
 */
export async function analyzeDisease(
  imageBase64: string,
  spaceUrl?: string
): Promise<DiseaseAnalysisResult> {
  // Default Space URL - can be either:
  // 1. Space identifier: "KissanAI/Dhenu-vision-lora-0.1"
  // 2. Full URL: "https://kissanai-dhenu-vision-lora-01.hf.space"
  // 3. Hugging Face Space URL: "https://huggingface.co/spaces/KissanAI/Dhenu-vision-lora-0.1"
  let defaultSpaceUrl = spaceUrl || import.meta.env.VITE_HF_SPACE_URL;
  
  if (!defaultSpaceUrl) {
    // Default to space identifier (Gradio client can handle this)
    defaultSpaceUrl = 'KissanAI/Dhenu-vision-lora-0.1';
  } else if (defaultSpaceUrl.includes('huggingface.co/spaces/')) {
    // Convert Hugging Face Space URL to space identifier
    const spacePath = defaultSpaceUrl.split('/spaces/')[1];
    defaultSpaceUrl = spacePath.split('?')[0]; // Remove query params if any
  } else if (defaultSpaceUrl.includes('.hf.space')) {
    // Keep full URL as is - Gradio client can handle both formats
    defaultSpaceUrl = defaultSpaceUrl;
  }
  // If it's already a space identifier (username/space-name), keep it as is

  try {
    // Convert base64 to File object for Gradio client
    const imageFile = base64ToFile(imageBase64);

    // Call the Hugging Face Space using Gradio client
    const responseText = await callHuggingFaceSpace(imageFile, defaultSpaceUrl);

    // Parse the response
    const parsedResult = parseDiseaseResponse(responseText);

    // If we couldn't parse much, at least return the raw response
    if (!parsedResult.diseaseName && !parsedResult.description) {
      parsedResult.description = responseText.substring(0, 500);
    }

    return parsedResult;
  } catch (error: any) {
    // Re-throw with user-friendly message
    const errorMessage = error.message || 'Failed to analyze image';
    throw new Error(errorMessage);
  }
}

