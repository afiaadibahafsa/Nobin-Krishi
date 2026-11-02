// Multi-Language Detection Service - Detects language from speech input
export interface LanguageDetectionResult {
  detectedLanguage: 'bn' | 'en';
  confidence: number;
  alternatives: Array<{ language: 'bn' | 'en'; confidence: number }>;
  method: 'pattern' | 'frequency' | 'api' | 'fallback';
}

export interface LanguageDetectionConfig {
  confidenceThreshold: number; // Minimum confidence to switch language
  enableAutoSwitch: boolean; // Whether to automatically switch language
  fallbackLanguage: 'bn' | 'en'; // Default language when detection fails
  analysisWindowSize: number; // Number of characters to analyze
}

export interface IMultiLanguageDetectionService {
  detectLanguage(text: string): Promise<LanguageDetectionResult>;
  detectLanguageFromAudio(audioData: Float32Array, sampleRate: number): Promise<LanguageDetectionResult>;
  isLanguageSwitchRecommended(currentLang: 'bn' | 'en', detectedLang: 'bn' | 'en', confidence: number): boolean;
  getConfig(): LanguageDetectionConfig;
  updateConfig(config: Partial<LanguageDetectionConfig>): void;
  onLanguageDetected(callback: (result: LanguageDetectionResult) => void): void;
}

export class MultiLanguageDetectionService implements IMultiLanguageDetectionService {
  private config: LanguageDetectionConfig = {
    confidenceThreshold: 0.7,
    enableAutoSwitch: true,
    fallbackLanguage: 'bn',
    analysisWindowSize: 50
  };

  private onLanguageDetectedCallback?: (result: LanguageDetectionResult) => void;

  // Bangla Unicode ranges and patterns
  private readonly banglaPatterns = {
    // Bangla Unicode range: U+0980–U+09FF
    unicodeRange: /[\u0980-\u09FF]/g,
    // Common Bangla words and patterns
    commonWords: [
      'আমি', 'তুমি', 'সে', 'আমরা', 'তোমরা', 'তারা',
      'এই', 'সেই', 'যে', 'কি', 'কী', 'কেন', 'কোথায়', 'কখন',
      'হ্যাঁ', 'না', 'ভাল', 'ভালো', 'খারাপ',
      'ধন্যবাদ', 'দয়া', 'করে', 'অনুগ্রহ', 'সাহায্য',
      'কৃষি', 'ফসল', 'জমি', 'চাষ', 'বীজ', 'সার'
    ],
    // Bangla conjuncts and special characters
    conjuncts: /[\u09CD\u09D7]/g,
    // Bangla digits
    digits: /[\u09E6-\u09EF]/g
  };

  // English patterns
  private readonly englishPatterns = {
    // Common English words
    commonWords: [
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'is', 'are', 'was', 'were', 'have', 'has', 'had',
      'what', 'where', 'when', 'why', 'how', 'who',
      'yes', 'no', 'good', 'bad', 'help', 'please', 'thank',
      'agriculture', 'crop', 'farm', 'seed', 'fertilizer', 'harvest'
    ],
    // English letter frequency (approximate)
    letterFrequency: {
      'e': 12.7, 't': 9.1, 'a': 8.2, 'o': 7.5, 'i': 7.0, 'n': 6.7,
      's': 6.3, 'h': 6.1, 'r': 6.0, 'd': 4.3, 'l': 4.0, 'c': 2.8
    }
  };

  public async detectLanguage(text: string): Promise<LanguageDetectionResult> {
    if (!text || text.trim().length === 0) {
      return this.createFallbackResult();
    }

    const cleanText = text.trim().toLowerCase();
    
    // Method 1: Unicode pattern detection (most reliable for Bangla)
    const unicodeResult = this.detectByUnicodePatterns(cleanText);
    if (unicodeResult.confidence > 0.9) {
      return unicodeResult;
    }

    // Method 2: Word pattern matching
    const wordResult = this.detectByWordPatterns(cleanText);
    if (wordResult.confidence > this.config.confidenceThreshold) {
      return wordResult;
    }

    // Method 3: Character frequency analysis
    const frequencyResult = this.detectByCharacterFrequency(cleanText);
    if (frequencyResult.confidence > this.config.confidenceThreshold) {
      return frequencyResult;
    }

    // Method 4: Combined analysis for mixed content
    const combinedResult = this.detectByCombinedAnalysis(cleanText, [unicodeResult, wordResult, frequencyResult]);
    
    // Notify callback if provided
    if (this.onLanguageDetectedCallback) {
      this.onLanguageDetectedCallback(combinedResult);
    }

    return combinedResult;
  }

  public async detectLanguageFromAudio(audioData: Float32Array, sampleRate: number): Promise<LanguageDetectionResult> {
    // Audio-based language detection using frequency analysis
    // This is a simplified implementation - in production, you might use ML models
    
    try {
      // Analyze frequency characteristics
      const frequencyAnalysis = this.analyzeAudioFrequencies(audioData, sampleRate);
      
      // Bangla typically has different frequency characteristics than English
      // This is a heuristic-based approach
      const banglaScore = this.calculateBanglaAudioScore(frequencyAnalysis);
      const englishScore = this.calculateEnglishAudioScore(frequencyAnalysis);
      
      const totalScore = banglaScore + englishScore;
      const banglaConfidence = totalScore > 0 ? banglaScore / totalScore : 0.5;
      const englishConfidence = totalScore > 0 ? englishScore / totalScore : 0.5;
      
      const detectedLanguage = banglaConfidence > englishConfidence ? 'bn' : 'en';
      const confidence = Math.max(banglaConfidence, englishConfidence);
      
      const result: LanguageDetectionResult = {
        detectedLanguage,
        confidence,
        alternatives: [
          { language: 'bn', confidence: banglaConfidence },
          { language: 'en', confidence: englishConfidence }
        ],
        method: 'frequency'
      };

      if (this.onLanguageDetectedCallback) {
        this.onLanguageDetectedCallback(result);
      }

      return result;
    } catch (error) {
      console.warn('Audio language detection failed:', error);
      return this.createFallbackResult();
    }
  }

  public isLanguageSwitchRecommended(currentLang: 'bn' | 'en', detectedLang: 'bn' | 'en', confidence: number): boolean {
    if (!this.config.enableAutoSwitch) {
      return false;
    }

    // Don't switch if languages are the same
    if (currentLang === detectedLang) {
      return false;
    }

    // Only switch if confidence is above threshold
    return confidence >= this.config.confidenceThreshold;
  }

  public getConfig(): LanguageDetectionConfig {
    return { ...this.config };
  }

  public updateConfig(config: Partial<LanguageDetectionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public onLanguageDetected(callback: (result: LanguageDetectionResult) => void): void {
    this.onLanguageDetectedCallback = callback;
  }

  private detectByUnicodePatterns(text: string): LanguageDetectionResult {
    const banglaMatches = text.match(this.banglaPatterns.unicodeRange) || [];
    const totalChars = text.replace(/\s/g, '').length;
    
    if (totalChars === 0) {
      return this.createFallbackResult();
    }

    const banglaRatio = banglaMatches.length / totalChars;
    const englishRatio = 1 - banglaRatio;

    // If more than 50% Bangla characters, it's likely Bangla
    const detectedLanguage = banglaRatio > 0.5 ? 'bn' : 'en';
    const confidence = Math.max(banglaRatio, englishRatio);

    return {
      detectedLanguage,
      confidence,
      alternatives: [
        { language: 'bn', confidence: banglaRatio },
        { language: 'en', confidence: englishRatio }
      ],
      method: 'pattern'
    };
  }

  private detectByWordPatterns(text: string): LanguageDetectionResult {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    
    if (words.length === 0) {
      return this.createFallbackResult();
    }

    let banglaWordCount = 0;
    let englishWordCount = 0;

    for (const word of words) {
      // Check for Bangla words
      if (this.banglaPatterns.commonWords.some(banglaWord => word.includes(banglaWord))) {
        banglaWordCount++;
      }
      // Check for English words
      else if (this.englishPatterns.commonWords.includes(word.toLowerCase())) {
        englishWordCount++;
      }
      // Check if word contains Bangla characters
      else if (this.banglaPatterns.unicodeRange.test(word)) {
        banglaWordCount++;
      }
    }

    const totalMatches = banglaWordCount + englishWordCount;
    
    if (totalMatches === 0) {
      return this.createFallbackResult();
    }

    const banglaConfidence = banglaWordCount / totalMatches;
    const englishConfidence = englishWordCount / totalMatches;
    
    const detectedLanguage = banglaConfidence > englishConfidence ? 'bn' : 'en';
    const confidence = Math.max(banglaConfidence, englishConfidence);

    return {
      detectedLanguage,
      confidence,
      alternatives: [
        { language: 'bn', confidence: banglaConfidence },
        { language: 'en', confidence: englishConfidence }
      ],
      method: 'pattern'
    };
  }

  private detectByCharacterFrequency(text: string): LanguageDetectionResult {
    const chars = text.toLowerCase().replace(/\s/g, '');
    
    if (chars.length === 0) {
      return this.createFallbackResult();
    }

    // Count character frequencies
    const charFreq: { [key: string]: number } = {};
    for (const char of chars) {
      charFreq[char] = (charFreq[char] || 0) + 1;
    }

    // Calculate English likelihood based on common letter frequencies
    let englishScore = 0;
    for (const [char, freq] of Object.entries(charFreq)) {
      if (this.englishPatterns.letterFrequency[char]) {
        englishScore += (freq / chars.length) * this.englishPatterns.letterFrequency[char];
      }
    }

    // Calculate Bangla likelihood (presence of Bangla characters)
    const banglaCharCount = chars.match(this.banglaPatterns.unicodeRange)?.length || 0;
    const banglaScore = banglaCharCount / chars.length;

    // Normalize scores
    const totalScore = englishScore + banglaScore;
    const englishConfidence = totalScore > 0 ? englishScore / totalScore : 0.5;
    const banglaConfidence = totalScore > 0 ? banglaScore / totalScore : 0.5;

    const detectedLanguage = banglaConfidence > englishConfidence ? 'bn' : 'en';
    const confidence = Math.max(banglaConfidence, englishConfidence);

    return {
      detectedLanguage,
      confidence,
      alternatives: [
        { language: 'bn', confidence: banglaConfidence },
        { language: 'en', confidence: englishConfidence }
      ],
      method: 'frequency'
    };
  }

  private detectByCombinedAnalysis(text: string, results: LanguageDetectionResult[]): LanguageDetectionResult {
    // Weight different methods
    const weights = {
      pattern: 0.5,
      frequency: 0.3,
      fallback: 0.2
    };

    let banglaScore = 0;
    let englishScore = 0;
    let totalWeight = 0;

    for (const result of results) {
      const weight = weights[result.method] || 0.1;
      totalWeight += weight;

      if (result.detectedLanguage === 'bn') {
        banglaScore += result.confidence * weight;
      } else {
        englishScore += result.confidence * weight;
      }
    }

    // Normalize scores
    if (totalWeight > 0) {
      banglaScore /= totalWeight;
      englishScore /= totalWeight;
    }

    const detectedLanguage = banglaScore > englishScore ? 'bn' : 'en';
    const confidence = Math.max(banglaScore, englishScore);

    return {
      detectedLanguage,
      confidence,
      alternatives: [
        { language: 'bn', confidence: banglaScore },
        { language: 'en', confidence: englishScore }
      ],
      method: 'pattern'
    };
  }

  private analyzeAudioFrequencies(audioData: Float32Array, sampleRate: number): {
    dominantFrequency: number;
    frequencySpread: number;
    energyDistribution: number[];
  } {
    // Simple FFT-like analysis (simplified for demo)
    const fftSize = Math.min(2048, audioData.length);
    const frequencies: number[] = [];
    
    // Calculate frequency bins
    for (let i = 0; i < fftSize / 2; i++) {
      const frequency = (i * sampleRate) / fftSize;
      frequencies.push(frequency);
    }

    // Find dominant frequency (simplified)
    let maxAmplitude = 0;
    let dominantFrequency = 0;
    
    for (let i = 0; i < Math.min(frequencies.length, audioData.length); i++) {
      const amplitude = Math.abs(audioData[i]);
      if (amplitude > maxAmplitude) {
        maxAmplitude = amplitude;
        dominantFrequency = frequencies[i];
      }
    }

    // Calculate frequency spread
    const frequencySpread = this.calculateFrequencySpread(audioData, frequencies);

    // Energy distribution in different frequency bands
    const energyDistribution = this.calculateEnergyDistribution(audioData, sampleRate);

    return {
      dominantFrequency,
      frequencySpread,
      energyDistribution
    };
  }

  private calculateFrequencySpread(audioData: Float32Array, frequencies: number[]): number {
    // Simplified frequency spread calculation
    let weightedSum = 0;
    let totalEnergy = 0;

    for (let i = 0; i < Math.min(frequencies.length, audioData.length); i++) {
      const energy = audioData[i] * audioData[i];
      weightedSum += frequencies[i] * energy;
      totalEnergy += energy;
    }

    return totalEnergy > 0 ? weightedSum / totalEnergy : 0;
  }

  private calculateEnergyDistribution(audioData: Float32Array, sampleRate: number): number[] {
    // Divide into frequency bands: low (0-500Hz), mid (500-2000Hz), high (2000Hz+)
    const bands = [0, 500, 2000, sampleRate / 2];
    const energyDistribution: number[] = [];

    for (let band = 0; band < bands.length - 1; band++) {
      let bandEnergy = 0;
      const startIndex = Math.floor((bands[band] * audioData.length * 2) / sampleRate);
      const endIndex = Math.floor((bands[band + 1] * audioData.length * 2) / sampleRate);

      for (let i = startIndex; i < Math.min(endIndex, audioData.length); i++) {
        bandEnergy += audioData[i] * audioData[i];
      }

      energyDistribution.push(bandEnergy);
    }

    return energyDistribution;
  }

  private calculateBanglaAudioScore(analysis: any): number {
    // Heuristic: Bangla tends to have more energy in mid frequencies
    // This is a simplified approach - real implementation would use trained models
    const { dominantFrequency, energyDistribution } = analysis;
    
    let score = 0;
    
    // Bangla speech characteristics (simplified heuristics)
    if (dominantFrequency > 200 && dominantFrequency < 1500) {
      score += 0.3;
    }
    
    // Mid-frequency energy preference
    if (energyDistribution.length >= 2 && energyDistribution[1] > energyDistribution[0]) {
      score += 0.4;
    }
    
    // Additional heuristics can be added based on linguistic research
    score += Math.random() * 0.3; // Placeholder for more sophisticated analysis
    
    return Math.min(score, 1.0);
  }

  private calculateEnglishAudioScore(analysis: any): number {
    // Heuristic: English tends to have different frequency characteristics
    const { dominantFrequency, energyDistribution } = analysis;
    
    let score = 0;
    
    // English speech characteristics (simplified heuristics)
    if (dominantFrequency > 300 && dominantFrequency < 2000) {
      score += 0.3;
    }
    
    // Different energy distribution pattern
    if (energyDistribution.length >= 3) {
      const totalEnergy = energyDistribution.reduce((sum, energy) => sum + energy, 0);
      if (totalEnergy > 0) {
        const highFreqRatio = energyDistribution[2] / totalEnergy;
        if (highFreqRatio > 0.2) {
          score += 0.4;
        }
      }
    }
    
    // Additional heuristics
    score += Math.random() * 0.3; // Placeholder for more sophisticated analysis
    
    return Math.min(score, 1.0);
  }

  private createFallbackResult(): LanguageDetectionResult {
    return {
      detectedLanguage: this.config.fallbackLanguage,
      confidence: 0.5,
      alternatives: [
        { language: 'bn', confidence: 0.5 },
        { language: 'en', confidence: 0.5 }
      ],
      method: 'fallback'
    };
  }

  // Static method to check if language detection is supported
  public static isSupported(): boolean {
    // Basic support check - in production, you might check for specific APIs
    return typeof window !== 'undefined' && typeof navigator !== 'undefined';
  }
}