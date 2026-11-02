// Advanced Voice Features Service - Integrates all advanced voice capabilities
import { VoiceActivityDetectionService, VoiceActivityResult, VoiceActivityConfig } from './VoiceActivityDetectionService';
import { MultiLanguageDetectionService, LanguageDetectionResult, LanguageDetectionConfig } from './MultiLanguageDetectionService';
import { VoiceCommandService, VoiceCommandResult, VoiceCommand, VoiceCommandConfig } from './VoiceCommandService';
import { VoiceCalibrationService, VoiceProfile, CalibrationSession, CalibrationConfig } from './VoiceCalibrationService';
import { NoiseCancellationService, NoiseProfile, NoiseAnalysis, NoiseCancellationConfig } from './NoiseCancellationService';

export interface AdvancedVoiceFeaturesConfig {
  voiceActivityDetection: Partial<VoiceActivityConfig>;
  languageDetection: Partial<LanguageDetectionConfig>;
  voiceCommands: Partial<VoiceCommandConfig>;
  noiseReduction: Partial<NoiseCancellationConfig>;
  enabledFeatures: {
    voiceActivityDetection: boolean;
    languageDetection: boolean;
    voiceCommands: boolean;
    noiseReduction: boolean;
    voiceCalibration: boolean;
  };
}

export interface VoiceProcessingResult {
  originalText: string;
  processedText: string;
  detectedLanguage: 'bn' | 'en';
  languageConfidence: number;
  voiceCommand: VoiceCommandResult | null;
  voiceActivity: VoiceActivityResult | null;
  noiseAnalysis: NoiseAnalysis | null;
  recommendations: string[];
}

export interface IAdvancedVoiceFeaturesService {
  initialize(config?: Partial<AdvancedVoiceFeaturesConfig>): Promise<void>;
  shutdown(): void;
  isInitialized(): boolean;
  processVoiceInput(text: string, audioData?: Float32Array, currentLanguage?: 'bn' | 'en'): Promise<VoiceProcessingResult>;
  startVoiceActivityDetection(): Promise<void>;
  stopVoiceActivityDetection(): void;
  startNoiseReduction(): Promise<void>;
  stopNoiseReduction(): void;
  createVoiceProfile(name: string, language: 'bn' | 'en'): Promise<VoiceProfile>;
  startCalibration(profileId: string): Promise<CalibrationSession>;
  getRecommendations(): string[];
  getFeatureStatus(): { [feature: string]: boolean };
  updateConfig(config: Partial<AdvancedVoiceFeaturesConfig>): void;
  onLanguageDetected(callback: (result: LanguageDetectionResult) => void): void;
  onVoiceCommand(callback: (result: VoiceCommandResult) => void): void;
  onVoiceActivity(callback: (result: VoiceActivityResult) => void): void;
  onNoiseAnalysis(callback: (analysis: NoiseAnalysis) => void): void;
}

export class AdvancedVoiceFeaturesService implements IAdvancedVoiceFeaturesService {
  private voiceActivityService: VoiceActivityDetectionService;
  private languageDetectionService: MultiLanguageDetectionService;
  private voiceCommandService: VoiceCommandService;
  private voiceCalibrationService: VoiceCalibrationService;
  private noiseCancellationService: NoiseCancellationService;

  private isReady = false;
  private config: AdvancedVoiceFeaturesConfig = {
    voiceActivityDetection: {
      threshold: 0.01,
      minSpeechDuration: 300,
      maxSilenceDuration: 2000
    },
    languageDetection: {
      confidenceThreshold: 0.7,
      enableAutoSwitch: true,
      fallbackLanguage: 'bn'
    },
    voiceCommands: {
      enabled: true,
      confidenceThreshold: 0.7,
      fuzzyMatching: true
    },
    noiseReduction: {
      enabled: true,
      aggressiveness: 0.5,
      adaptiveMode: true
    },
    enabledFeatures: {
      voiceActivityDetection: true,
      languageDetection: true,
      voiceCommands: true,
      noiseReduction: true,
      voiceCalibration: true
    }
  };

  // Callbacks
  private onLanguageDetectedCallback?: (result: LanguageDetectionResult) => void;
  private onVoiceCommandCallback?: (result: VoiceCommandResult) => void;
  private onVoiceActivityCallback?: (result: VoiceActivityResult) => void;
  private onNoiseAnalysisCallback?: (analysis: NoiseAnalysis) => void;

  // Processing state
  private lastLanguageDetection: LanguageDetectionResult | null = null;
  private processingHistory: VoiceProcessingResult[] = [];
  private recommendations: string[] = [];

  constructor() {
    this.voiceActivityService = new VoiceActivityDetectionService();
    this.languageDetectionService = new MultiLanguageDetectionService();
    this.voiceCommandService = new VoiceCommandService();
    this.voiceCalibrationService = new VoiceCalibrationService();
    this.noiseCancellationService = new NoiseCancellationService();
  }

  public async initialize(config?: Partial<AdvancedVoiceFeaturesConfig>): Promise<void> {
    if (this.isReady) {
      return;
    }

    // Update configuration
    if (config) {
      this.updateConfig(config);
    }

    try {
      // Check browser support for all features
      const supportStatus = this.checkBrowserSupport();
      
      // Initialize services based on support and configuration
      await this.initializeServices(supportStatus);

      // Set up service callbacks
      this.setupServiceCallbacks();

      this.isReady = true;
      console.log('Advanced Voice Features Service initialized successfully');

    } catch (error) {
      console.error('Failed to initialize Advanced Voice Features Service:', error);
      throw new Error('Could not initialize advanced voice features');
    }
  }

  public shutdown(): void {
    if (!this.isReady) {
      return;
    }

    // Stop all services
    this.voiceActivityService.stop();
    this.noiseCancellationService.stop();

    this.isReady = false;
    console.log('Advanced Voice Features Service shut down');
  }

  public isInitialized(): boolean {
    return this.isReady;
  }

  public async processVoiceInput(
    text: string, 
    audioData?: Float32Array, 
    currentLanguage?: 'bn' | 'en'
  ): Promise<VoiceProcessingResult> {
    if (!this.isReady) {
      throw new Error('Service not initialized');
    }

    const result: VoiceProcessingResult = {
      originalText: text,
      processedText: text,
      detectedLanguage: currentLanguage || 'bn',
      languageConfidence: 0.5,
      voiceCommand: null,
      voiceActivity: null,
      noiseAnalysis: null,
      recommendations: []
    };

    try {
      // 1. Language Detection
      if (this.config.enabledFeatures.languageDetection && text.trim()) {
        const languageResult = await this.languageDetectionService.detectLanguage(text);
        result.detectedLanguage = languageResult.detectedLanguage;
        result.languageConfidence = languageResult.confidence;
        this.lastLanguageDetection = languageResult;

        // Check if language switch is recommended
        if (currentLanguage && 
            this.languageDetectionService.isLanguageSwitchRecommended(
              currentLanguage, 
              languageResult.detectedLanguage, 
              languageResult.confidence
            )) {
          result.recommendations.push(
            `Language switch recommended: ${languageResult.detectedLanguage} (${Math.round(languageResult.confidence * 100)}% confidence)`
          );
        }
      }

      // 2. Voice Command Detection
      if (this.config.enabledFeatures.voiceCommands && text.trim()) {
        const commandResult = this.voiceCommandService.processText(text, result.detectedLanguage);
        if (commandResult) {
          result.voiceCommand = commandResult;
          result.recommendations.push(`Voice command detected: ${commandResult.command.description}`);
        }
      }

      // 3. Audio Analysis (if audio data provided)
      if (audioData && audioData.length > 0) {
        // Voice Activity Detection
        if (this.config.enabledFeatures.voiceActivityDetection && this.voiceActivityService.isActive()) {
          // Voice activity is handled in real-time, but we can get current state
          const currentVolume = this.voiceActivityService.getCurrentVolume();
          result.voiceActivity = {
            isVoiceActive: currentVolume > (this.config.voiceActivityDetection.threshold || 0.01),
            volume: currentVolume,
            frequency: 0, // Would be calculated from audio data
            confidence: currentVolume > 0 ? Math.min(currentVolume * 10, 1) : 0,
            timestamp: Date.now()
          };
        }

        // Noise Analysis
        if (this.config.enabledFeatures.noiseReduction && this.noiseCancellationService.isActive()) {
          result.noiseAnalysis = this.noiseCancellationService.analyzeNoise(audioData);
          
          if (result.noiseAnalysis.noiseLevel > 0.1) {
            result.recommendations.push('High noise level detected - consider using noise reduction');
          }
          
          if (result.noiseAnalysis.signalToNoiseRatio < 10) {
            result.recommendations.push('Poor signal-to-noise ratio - try speaking closer to microphone');
          }
        }

        // Audio-based Language Detection
        if (this.config.enabledFeatures.languageDetection) {
          try {
            const audioLanguageResult = await this.languageDetectionService.detectLanguageFromAudio(
              audioData, 
              16000 // Sample rate
            );
            
            // Compare with text-based detection
            if (this.lastLanguageDetection && 
                audioLanguageResult.detectedLanguage !== this.lastLanguageDetection.detectedLanguage &&
                audioLanguageResult.confidence > 0.6) {
              result.recommendations.push(
                `Audio analysis suggests different language: ${audioLanguageResult.detectedLanguage}`
              );
            }
          } catch (error) {
            console.warn('Audio-based language detection failed:', error);
          }
        }
      }

      // 4. Apply Voice Profile Optimizations (if available)
      const activeProfile = this.getActiveVoiceProfile();
      if (activeProfile) {
        const optimizations = this.voiceCalibrationService.getOptimalSettings(activeProfile.id);
        if (optimizations) {
          result.recommendations.push(`Using voice profile: ${activeProfile.name}`);
        }
      }

      // 5. Generate Additional Recommendations
      result.recommendations.push(...this.generateRecommendations(result));

      // Store processing result for analysis
      this.processingHistory.push(result);
      if (this.processingHistory.length > 100) {
        this.processingHistory = this.processingHistory.slice(-50); // Keep last 50 results
      }

      return result;

    } catch (error) {
      console.error('Error processing voice input:', error);
      result.recommendations.push('Error occurred during voice processing');
      return result;
    }
  }

  public async startVoiceActivityDetection(): Promise<void> {
    if (!this.config.enabledFeatures.voiceActivityDetection) {
      return;
    }

    try {
      await this.voiceActivityService.start(this.config.voiceActivityDetection);
    } catch (error) {
      console.error('Failed to start voice activity detection:', error);
      throw error;
    }
  }

  public stopVoiceActivityDetection(): void {
    this.voiceActivityService.stop();
  }

  public async startNoiseReduction(): Promise<void> {
    if (!this.config.enabledFeatures.noiseReduction) {
      return;
    }

    try {
      await this.noiseCancellationService.start(this.config.noiseReduction);
    } catch (error) {
      console.error('Failed to start noise reduction:', error);
      throw error;
    }
  }

  public stopNoiseReduction(): void {
    this.noiseCancellationService.stop();
  }

  public async createVoiceProfile(name: string, language: 'bn' | 'en'): Promise<VoiceProfile> {
    return await this.voiceCalibrationService.createProfile(name, language);
  }

  public async startCalibration(profileId: string): Promise<CalibrationSession> {
    return await this.voiceCalibrationService.startCalibration(profileId);
  }

  public getRecommendations(): string[] {
    return [...this.recommendations];
  }

  public getFeatureStatus(): { [feature: string]: boolean } {
    return {
      voiceActivityDetection: this.voiceActivityService.isActive(),
      languageDetection: this.config.enabledFeatures.languageDetection,
      voiceCommands: this.config.enabledFeatures.voiceCommands,
      noiseReduction: this.noiseCancellationService.isActive(),
      voiceCalibration: this.config.enabledFeatures.voiceCalibration
    };
  }

  public updateConfig(config: Partial<AdvancedVoiceFeaturesConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      enabledFeatures: {
        ...this.config.enabledFeatures,
        ...config.enabledFeatures
      }
    };

    // Update individual service configurations
    if (config.voiceActivityDetection) {
      this.voiceActivityService.updateConfig(config.voiceActivityDetection);
    }
    if (config.languageDetection) {
      this.languageDetectionService.updateConfig(config.languageDetection);
    }
    if (config.voiceCommands) {
      this.voiceCommandService.updateConfig(config.voiceCommands);
    }
    if (config.noiseReduction) {
      this.noiseCancellationService.updateConfig(config.noiseReduction);
    }
  }

  public onLanguageDetected(callback: (result: LanguageDetectionResult) => void): void {
    this.onLanguageDetectedCallback = callback;
  }

  public onVoiceCommand(callback: (result: VoiceCommandResult) => void): void {
    this.onVoiceCommandCallback = callback;
  }

  public onVoiceActivity(callback: (result: VoiceActivityResult) => void): void {
    this.onVoiceActivityCallback = callback;
  }

  public onNoiseAnalysis(callback: (analysis: NoiseAnalysis) => void): void {
    this.onNoiseAnalysisCallback = callback;
  }

  private checkBrowserSupport(): { [feature: string]: boolean } {
    return {
      voiceActivityDetection: VoiceActivityDetectionService.isSupported(),
      languageDetection: MultiLanguageDetectionService.isSupported(),
      voiceCommands: VoiceCommandService.isSupported(),
      voiceCalibration: VoiceCalibrationService.isSupported(),
      noiseReduction: NoiseCancellationService.isSupported()
    };
  }

  private async initializeServices(supportStatus: { [feature: string]: boolean }): Promise<void> {
    // Initialize services based on support and configuration
    const initPromises: Promise<void>[] = [];

    // Language Detection Service
    if (supportStatus.languageDetection && this.config.enabledFeatures.languageDetection) {
      this.languageDetectionService.updateConfig(this.config.languageDetection);
    }

    // Voice Command Service
    if (supportStatus.voiceCommands && this.config.enabledFeatures.voiceCommands) {
      this.voiceCommandService.updateConfig(this.config.voiceCommands);
    }

    // Voice Activity Detection Service
    if (supportStatus.voiceActivityDetection && this.config.enabledFeatures.voiceActivityDetection) {
      // Will be started when needed
    }

    // Noise Cancellation Service
    if (supportStatus.noiseReduction && this.config.enabledFeatures.noiseReduction) {
      // Will be started when needed
    }

    await Promise.all(initPromises);
  }

  private setupServiceCallbacks(): void {
    // Language Detection callbacks
    this.languageDetectionService.onLanguageDetected((result) => {
      if (this.onLanguageDetectedCallback) {
        this.onLanguageDetectedCallback(result);
      }
    });

    // Voice Command callbacks
    this.voiceCommandService.onCommandDetected((result) => {
      if (this.onVoiceCommandCallback) {
        this.onVoiceCommandCallback(result);
      }
    });

    // Voice Activity Detection callbacks
    this.voiceActivityService.onVoiceActivity((result) => {
      if (this.onVoiceActivityCallback) {
        this.onVoiceActivityCallback(result);
      }
    });

    // Noise Analysis callbacks
    this.noiseCancellationService.onNoiseAnalysis((analysis) => {
      if (this.onNoiseAnalysisCallback) {
        this.onNoiseAnalysisCallback(analysis);
      }
    });
  }

  private generateRecommendations(result: VoiceProcessingResult): string[] {
    const recommendations: string[] = [];

    // Language consistency recommendations
    if (result.languageConfidence < 0.6) {
      recommendations.push('Language detection confidence is low - try speaking more clearly');
    }

    // Voice activity recommendations
    if (result.voiceActivity) {
      if (result.voiceActivity.volume < 0.01) {
        recommendations.push('Voice volume is low - try speaking louder');
      } else if (result.voiceActivity.volume > 0.8) {
        recommendations.push('Voice volume is high - try speaking softer');
      }
    }

    // Noise recommendations
    if (result.noiseAnalysis) {
      if (result.noiseAnalysis.noiseLevel > 0.05) {
        recommendations.push('Background noise detected - consider using a quieter environment');
      }
      
      if (!result.noiseAnalysis.voicePresent && result.originalText.length > 0) {
        recommendations.push('Voice not clearly detected in audio - check microphone positioning');
      }
    }

    // Processing history analysis
    if (this.processingHistory.length >= 5) {
      const recentResults = this.processingHistory.slice(-5);
      const avgConfidence = recentResults.reduce((sum, r) => sum + r.languageConfidence, 0) / recentResults.length;
      
      if (avgConfidence < 0.5) {
        recommendations.push('Consistent low language detection confidence - consider voice calibration');
      }
    }

    return recommendations;
  }

  private getActiveVoiceProfile(): VoiceProfile | null {
    // Get the most recently used or best-performing profile
    const profiles = this.voiceCalibrationService.getAllProfiles();
    if (profiles.length === 0) {
      return null;
    }

    // Sort by accuracy and last updated
    profiles.sort((a, b) => {
      const scoreA = a.recognitionAccuracy * 0.7 + (Date.now() - a.lastUpdated.getTime()) / (1000 * 60 * 60 * 24) * 0.3;
      const scoreB = b.recognitionAccuracy * 0.7 + (Date.now() - b.lastUpdated.getTime()) / (1000 * 60 * 60 * 24) * 0.3;
      return scoreB - scoreA;
    });

    return profiles[0];
  }

  // Get comprehensive statistics
  public getStats(): {
    processingHistory: number;
    averageLanguageConfidence: number;
    commandsDetected: number;
    recommendationsGenerated: number;
    activeFeatures: string[];
  } {
    const commandsDetected = this.processingHistory.filter(r => r.voiceCommand !== null).length;
    const avgConfidence = this.processingHistory.length > 0 
      ? this.processingHistory.reduce((sum, r) => sum + r.languageConfidence, 0) / this.processingHistory.length 
      : 0;
    const totalRecommendations = this.processingHistory.reduce((sum, r) => sum + r.recommendations.length, 0);
    
    const activeFeatures = Object.entries(this.getFeatureStatus())
      .filter(([_, active]) => active)
      .map(([feature, _]) => feature);

    return {
      processingHistory: this.processingHistory.length,
      averageLanguageConfidence: avgConfidence,
      commandsDetected,
      recommendationsGenerated: totalRecommendations,
      activeFeatures
    };
  }

  // Export configuration for backup/restore
  public exportConfig(): string {
    return JSON.stringify({
      config: this.config,
      profiles: this.voiceCalibrationService.getAllProfiles(),
      commands: this.voiceCommandService.getCommands()
    }, null, 2);
  }

  // Import configuration from backup
  public async importConfig(configData: string): Promise<void> {
    try {
      const data = JSON.parse(configData);
      
      if (data.config) {
        this.updateConfig(data.config);
      }
      
      if (data.profiles) {
        for (const profile of data.profiles) {
          await this.voiceCalibrationService.importProfile(JSON.stringify(profile));
        }
      }
      
      if (data.commands) {
        for (const command of data.commands) {
          this.voiceCommandService.addCommand(command);
        }
      }
    } catch (error) {
      throw new Error('Failed to import configuration: Invalid data format');
    }
  }
}