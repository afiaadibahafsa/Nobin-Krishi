// Export all voice AI services
export { SpeechRecognitionService } from './SpeechRecognitionService';
export { SpeechSynthesisService } from './SpeechSynthesisService';
export { DhenuAPIClient } from './DhenuAPIClient';
export { BrowserCompatibilityService, browserCompatibility } from './BrowserCompatibilityService';

// Advanced Voice Features (Requirements 6.6, 7.6)
export { VoiceActivityDetectionService } from './VoiceActivityDetectionService';
export { MultiLanguageDetectionService } from './MultiLanguageDetectionService';
export { VoiceCommandService } from './VoiceCommandService';
export { VoiceCalibrationService } from './VoiceCalibrationService';
export { NoiseCancellationService } from './NoiseCancellationService';
export { AdvancedVoiceFeaturesService } from './AdvancedVoiceFeaturesService';

// Export types from VoiceActivityDetectionService
export type {
  VoiceActivityResult,
  VoiceActivityConfig,
  IVoiceActivityDetectionService
} from './VoiceActivityDetectionService';

// Export types from MultiLanguageDetectionService
export type {
  LanguageDetectionResult,
  LanguageDetectionConfig,
  IMultiLanguageDetectionService
} from './MultiLanguageDetectionService';

// Export types from VoiceCommandService
export type {
  VoiceCommand,
  VoiceCommandResult,
  VoiceCommandConfig,
  IVoiceCommandService
} from './VoiceCommandService';

// Export types from VoiceCalibrationService
export type {
  VoiceProfile,
  CalibrationSession,
  CalibrationConfig,
  IVoiceCalibrationService
} from './VoiceCalibrationService';

// Export types from NoiseCancellationService
export type {
  NoiseProfile,
  NoiseAnalysis,
  NoiseCancellationConfig,
  INoiseCancellationService
} from './NoiseCancellationService';

// Export types from AdvancedVoiceFeaturesService
export type {
  AdvancedVoiceFeaturesConfig,
  VoiceProcessingResult,
  IAdvancedVoiceFeaturesService
} from './AdvancedVoiceFeaturesService';

// Export types from basic services
export type {
  SpeechResult,
  SpeechRecognitionError,
  ISpeechRecognitionService
} from './SpeechRecognitionService';

export type {
  SpeechOptions,
  ISpeechSynthesisService
} from './SpeechSynthesisService';