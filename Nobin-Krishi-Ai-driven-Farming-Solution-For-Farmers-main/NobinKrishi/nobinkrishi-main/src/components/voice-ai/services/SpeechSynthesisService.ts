// Speech Synthesis Service - Web Speech API wrapper with browser compatibility
import { browserCompatibility } from './BrowserCompatibilityService';

export interface SpeechOptions {
  rate: number;
  pitch: number;
  volume: number;
}

export interface ISpeechSynthesisService {
  speak(text: string, language: string, options?: SpeechOptions): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;
  isSupported(): boolean;
  isAvailable(): Promise<boolean>;
  replay(): Promise<void>;
  onSpeakingStateChanged(callback: (isSpeaking: boolean) => void): void;
  onSpeechStarted(callback: () => void): void;
  onSpeechEnded(callback: () => void): void;
  onSpeechErrorOccurred(callback: (error: string) => void): void;
  getCapabilities(): Promise<any>;
}

export class SpeechSynthesisService implements ISpeechSynthesisService {
  private synthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPaused = false;
  private voices: SpeechSynthesisVoice[] = [];
  private onSpeakingStateChange?: (isSpeaking: boolean) => void;
  private onSpeechStart?: () => void;
  private onSpeechEnd?: () => void;
  private onSpeechError?: (error: string) => void;
  private capabilities: any = null;
  private optimizations: any = null;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    // Get browser capabilities and optimizations
    this.capabilities = await browserCompatibility.detectCapabilities();
    this.optimizations = browserCompatibility.getOptimizations();
    
    this.loadVoices();
    
    // Listen for voices changed event (some browsers load voices asynchronously)
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices(): void {
    this.voices = this.synthesis.getVoices();
  }

  public async speak(text: string, language: string, options?: SpeechOptions): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Speech synthesis not supported');
    }

    // Check availability
    const available = await this.isAvailable();
    if (!available) {
      throw new Error('Speech synthesis not available');
    }

    // Stop any current speech
    this.stop();

    // Use browser-specific optimizations for text chunking
    const chunkSize = this.optimizations?.speechSynthesis?.chunkSize || 200;
    
    if (text.length > chunkSize) {
      return this.speakLongText(text, language, options);
    }

    return new Promise((resolve, reject) => {
      try {
        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        this.currentUtterance = utterance;

        // Set language - ensure proper language matching for speech output (Requirements 3.2, 3.3)
        utterance.lang = language;

        // Apply voice settings with defaults (Requirements 3.4: rate 0.9, pitch 1.0, volume 1.0)
        const settings = {
          rate: 0.9,
          pitch: 1.0,
          volume: 1.0,
          ...options
        };

        utterance.rate = Math.max(0.1, Math.min(10, settings.rate));
        utterance.pitch = Math.max(0, Math.min(2, settings.pitch));
        utterance.volume = Math.max(0, Math.min(1, settings.volume));

        // Find appropriate voice for language with browser-specific optimizations
        const voice = this.findVoiceForLanguage(language);
        if (voice) {
          utterance.voice = voice;
        } else if (this.optimizations?.speechSynthesis?.voiceURI) {
          // Use optimized voice URI if available
          const optimizedVoice = this.voices.find(v => v.voiceURI === this.optimizations.speechSynthesis.voiceURI);
          if (optimizedVoice) {
            utterance.voice = optimizedVoice;
          }
        }

        // Set up event handlers with visual feedback support (Requirements 3.5)
        utterance.onstart = () => {
          console.log('Speech synthesis started');
          if (this.onSpeechStart) {
            this.onSpeechStart();
          }
          if (this.onSpeakingStateChange) {
            this.onSpeakingStateChange(true);
          }
        };

        utterance.onend = () => {
          console.log('Speech synthesis ended');
          this.currentUtterance = null;
          this.isPaused = false;
          if (this.onSpeechEnd) {
            this.onSpeechEnd();
          }
          if (this.onSpeakingStateChange) {
            this.onSpeakingStateChange(false);
          }
          resolve();
        };

        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event.error);
          this.currentUtterance = null;
          this.isPaused = false;
          
          // Enhanced error handling for speech synthesis with browser-specific messages
          let errorMessage = 'Speech synthesis error';
          switch (event.error) {
            case 'not-allowed':
              errorMessage = 'Speech synthesis not allowed';
              break;
            case 'audio-busy':
              errorMessage = 'Audio system is busy';
              break;
            case 'audio-hardware':
              errorMessage = 'Audio hardware error';
              break;
            case 'network':
              errorMessage = 'Network error during speech synthesis';
              break;
            case 'synthesis-unavailable':
              errorMessage = 'Speech synthesis unavailable';
              break;
            case 'synthesis-failed':
              errorMessage = 'Speech synthesis failed';
              break;
            case 'language-unavailable':
              errorMessage = 'Voice for selected language unavailable';
              break;
            case 'voice-unavailable':
              errorMessage = 'Selected voice unavailable';
              break;
            case 'text-too-long':
              errorMessage = 'Text too long for speech synthesis';
              break;
            case 'invalid-argument':
              errorMessage = 'Invalid speech synthesis parameters';
              break;
            default:
              errorMessage = `Speech synthesis failed: ${event.error}`;
          }
          
          if (this.onSpeechError) {
            this.onSpeechError(errorMessage);
          }
          if (this.onSpeakingStateChange) {
            this.onSpeakingStateChange(false);
          }
          reject(new Error(errorMessage));
        };

        utterance.onpause = () => {
          this.isPaused = true;
          console.log('Speech synthesis paused');
        };

        utterance.onresume = () => {
          this.isPaused = false;
          console.log('Speech synthesis resumed');
        };

        // Start speaking
        this.synthesis.speak(utterance);

      } catch (error) {
        if (this.onSpeakingStateChange) {
          this.onSpeakingStateChange(false);
        }
        reject(error);
      }
    });
  }

  public pause(): void {
    if (this.synthesis.speaking && !this.isPaused) {
      this.synthesis.pause();
    }
  }

  public resume(): void {
    if (this.synthesis.speaking && this.isPaused) {
      this.synthesis.resume();
    }
  }

  public stop(): void {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    this.currentUtterance = null;
    this.isPaused = false;
  }

  public isSupported(): boolean {
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  public async isAvailable(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      if (!this.capabilities) {
        this.capabilities = await browserCompatibility.detectCapabilities();
      }
      return this.capabilities.speechSynthesis.available;
    } catch (error) {
      console.warn('Could not check speech synthesis availability:', error);
      return false;
    }
  }

  public async getCapabilities(): Promise<any> {
    if (!this.capabilities) {
      this.capabilities = await browserCompatibility.detectCapabilities();
    }
    return this.capabilities;
  }

  public isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  public isPausedState(): boolean {
    return this.isPaused;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  public getVoicesForLanguage(language: string): SpeechSynthesisVoice[] {
    const langCode = language.split('-')[0]; // Get base language code (e.g., 'bn' from 'bn-BD')
    return this.voices.filter(voice => 
      voice.lang.startsWith(langCode) || voice.lang.startsWith(language)
    );
  }

  private findVoiceForLanguage(language: string): SpeechSynthesisVoice | null {
    // First try exact match
    let voice = this.voices.find(v => v.lang === language);
    
    if (!voice) {
      // Try base language match (e.g., 'bn' for 'bn-BD')
      const baseLang = language.split('-')[0];
      voice = this.voices.find(v => v.lang.startsWith(baseLang));
    }

    if (!voice) {
      // For Bangla, try common variants
      if (language.startsWith('bn')) {
        voice = this.voices.find(v => 
          v.lang.includes('bn') || 
          v.name.toLowerCase().includes('bangla') ||
          v.name.toLowerCase().includes('bengali')
        );
      }
    }

    return voice || null;
  }

  // Chunk long text for better speech synthesis with browser-specific optimizations
  public async speakLongText(text: string, language: string, options?: SpeechOptions): Promise<void> {
    const chunkSize = this.optimizations?.speechSynthesis?.chunkSize || 200;
    const pauseBetweenChunks = this.optimizations?.speechSynthesis?.pauseBetweenChunks || 100;
    
    if (text.length <= chunkSize) {
      return this.speak(text, language, options);
    }

    // Split text into sentences or chunks
    const chunks = this.chunkText(text, chunkSize);
    
    for (const chunk of chunks) {
      if (chunk.trim()) {
        await this.speak(chunk.trim(), language, options);
        
        // Browser-specific pause between chunks
        await new Promise(resolve => setTimeout(resolve, pauseBetweenChunks));
      }
    }
  }

  private chunkText(text: string, maxLength: number): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/);
    
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;
      
      if (currentChunk.length + trimmedSentence.length + 1 <= maxLength) {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk + '.');
        }
        currentChunk = trimmedSentence;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk + '.');
    }
    
    return chunks;
  }

  // Cleanup method
  public destroy(): void {
    this.stop();
    if (this.synthesis.onvoiceschanged) {
      this.synthesis.onvoiceschanged = null;
    }
  }

  // Callback registration methods for visual feedback (Requirements 3.5)
  public onSpeakingStateChanged(callback: (isSpeaking: boolean) => void): void {
    this.onSpeakingStateChange = callback;
  }

  public onSpeechStarted(callback: () => void): void {
    this.onSpeechStart = callback;
  }

  public onSpeechEnded(callback: () => void): void {
    this.onSpeechEnd = callback;
  }

  public onSpeechErrorOccurred(callback: (error: string) => void): void {
    this.onSpeechError = callback;
  }

  // Replay functionality (Requirements 3.6)
  public async replay(): Promise<void> {
    if (this.currentUtterance) {
      const text = this.currentUtterance.text;
      const language = this.currentUtterance.lang;
      const options: SpeechOptions = {
        rate: this.currentUtterance.rate,
        pitch: this.currentUtterance.pitch,
        volume: this.currentUtterance.volume
      };
      
      await this.speak(text, language, options);
    }
  }

  // Get current speech state
  public getCurrentSpeechInfo(): { text: string; language: string; options: SpeechOptions } | null {
    if (this.currentUtterance) {
      return {
        text: this.currentUtterance.text,
        language: this.currentUtterance.lang,
        options: {
          rate: this.currentUtterance.rate,
          pitch: this.currentUtterance.pitch,
          volume: this.currentUtterance.volume
        }
      };
    }
    return null;
  }
}