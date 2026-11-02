// Speech Recognition Service - Web Speech API wrapper with browser compatibility
import { browserCompatibility } from './BrowserCompatibilityService';

export interface SpeechResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  language: string;
}

export interface SpeechRecognitionError {
  code: string;
  message: string;
}

export interface ISpeechRecognitionService {
  startListening(language: string): Promise<void>;
  stopListening(): void;
  onResult: (callback: (text: string, isFinal: boolean) => void) => void;
  onError: (callback: (error: SpeechRecognitionError) => void) => void;
  isSupported(): boolean;
  isAvailable(): Promise<boolean>;
  getCapabilities(): Promise<any>;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
  
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    lang: string;
    start(): void;
    stop(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
    onend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  }
  
  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }
  
  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
  }
  
  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }
  
  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }
  
  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }
}

export class SpeechRecognitionService implements ISpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private resultCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private errorCallback: ((error: SpeechRecognitionError) => void) | null = null;
  private autoStopTimeout: NodeJS.Timeout | null = null;
  private capabilities: any = null;

  constructor() {
    this.initializeRecognition();
  }

  private async initializeRecognition(): Promise<void> {
    // Get browser capabilities and optimizations
    this.capabilities = await browserCompatibility.detectCapabilities();
    const optimizations = browserCompatibility.getOptimizations();

    if (!this.isSupported()) {
      console.warn('Speech Recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Apply browser-specific optimizations
    if (optimizations?.speechRecognition) {
      const opts = optimizations.speechRecognition;
      
      // Configure recognition settings with optimizations
      this.recognition.continuous = opts.continuous;
      this.recognition.interimResults = opts.interimResults;
      this.recognition.maxAlternatives = opts.maxAlternatives;

      // Apply grammars if supported (Chrome 25+)
      if (opts.grammars && 'grammars' in this.recognition) {
        try {
          const speechRecognitionList = new (window as any).SpeechGrammarList();
          // Add basic grammar for better recognition
          const grammar = '#JSGF V1.0; grammar basic; public <basic> = hello | help | yes | no;';
          speechRecognitionList.addFromString(grammar, 1);
          (this.recognition as any).grammars = speechRecognitionList;
        } catch (error) {
          console.warn('Could not set speech grammars:', error);
        }
      }
    } else {
      // Default settings
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }

    // Set up event handlers
    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('Speech recognition started');
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Call result callback with interim or final results
      if (this.resultCallback) {
        if (finalTranscript) {
          this.resultCallback(finalTranscript, true);
          this.resetAutoStopTimer();
        } else if (interimTranscript) {
          this.resultCallback(interimTranscript, false);
          this.resetAutoStopTimer();
        }
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const error: SpeechRecognitionError = {
        code: event.error,
        message: this.getErrorMessage(event.error)
      };

      if (this.errorCallback) {
        this.errorCallback(error);
      }

      this.isListening = false;
      this.clearAutoStopTimer();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.clearAutoStopTimer();
      console.log('Speech recognition ended');
    };

    this.recognition.onnomatch = () => {
      if (this.errorCallback) {
        this.errorCallback({
          code: 'no-match',
          message: 'No speech detected, please try again'
        });
      }
    };
  }

  public async startListening(language: string): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported');
    }

    if (this.isListening) {
      this.stopListening();
    }

    try {
      // Enhanced microphone permission and availability checking
      const capabilities = await browserCompatibility.detectCapabilities();
      
      // Check if microphone is available
      if (!capabilities.microphone.supported) {
        throw new Error('Microphone not supported');
      }

      if (!capabilities.microphone.available) {
        throw new Error('Microphone not available');
      }

      // Check permissions
      if (capabilities.microphone.permissions === 'denied') {
        throw new Error('Please allow microphone access');
      }

      // Request microphone access if needed
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Close the stream immediately as we just needed to check permission
          stream.getTracks().forEach(track => track.stop());
        } catch (permissionError: any) {
          if (permissionError.name === 'NotAllowedError') {
            throw new Error('Please allow microphone access');
          } else if (permissionError.name === 'NotFoundError') {
            throw new Error('Microphone not available');
          } else if (permissionError.name === 'NotReadableError') {
            throw new Error('Microphone is being used by another application');
          } else {
            throw new Error('Microphone access failed');
          }
        }
      }

      // Check network connectivity for cloud-based recognition
      if (!capabilities.network.online) {
        throw new Error('Connection issue, please check internet');
      }

      // Set language with fallback
      this.recognition.lang = language;
      
      // Start recognition
      this.recognition.start();
      
      // Set auto-stop timer (2 seconds of silence)
      this.resetAutoStopTimer();
      
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to start speech recognition');
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.clearAutoStopTimer();
    }
  }

  public onResult(callback: (text: string, isFinal: boolean) => void): void {
    this.resultCallback = callback;
  }

  public onError(callback: (error: SpeechRecognitionError) => void): void {
    this.errorCallback = callback;
  }

  public isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public async isAvailable(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      const capabilities = await browserCompatibility.detectCapabilities();
      return capabilities.speechRecognition.available && 
             capabilities.microphone.available &&
             capabilities.microphone.permissions !== 'denied';
    } catch (error) {
      console.warn('Could not check speech recognition availability:', error);
      return false;
    }
  }

  public async getCapabilities(): Promise<any> {
    if (!this.capabilities) {
      this.capabilities = await browserCompatibility.detectCapabilities();
    }
    return this.capabilities;
  }

  private resetAutoStopTimer(): void {
    this.clearAutoStopTimer();
    
    // Auto-stop after 2 seconds of silence
    this.autoStopTimeout = setTimeout(() => {
      if (this.isListening) {
        this.stopListening();
      }
    }, 2000);
  }

  private clearAutoStopTimer(): void {
    if (this.autoStopTimeout) {
      clearTimeout(this.autoStopTimeout);
      this.autoStopTimeout = null;
    }
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'not-allowed':
        return 'Please allow microphone access';
      case 'no-speech':
        return 'No speech detected, please try again';
      case 'audio-capture':
        return 'Microphone not available';
      case 'network':
        return 'Connection issue, please check internet';
      case 'aborted':
        return 'Speech recognition was aborted';
      case 'bad-grammar':
        return 'Speech recognition grammar error';
      case 'language-not-supported':
        return 'Language not supported';
      case 'service-not-allowed':
        return 'Speech recognition not supported';
      default:
        return 'Speech recognition error occurred';
    }
  }

  // Cleanup method
  public destroy(): void {
    this.stopListening();
    this.clearAutoStopTimer();
    this.resultCallback = null;
    this.errorCallback = null;
  }
}