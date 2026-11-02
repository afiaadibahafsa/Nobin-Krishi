// Voice AI Chat System - Main exports
export { default as VoiceAIChat, useVoiceAIChat } from './VoiceAIChat';

// Performance optimization hooks
export { useDebounce, useSimpleDebounce, useLeadingDebounce } from './hooks/useDebounce';
export { useRequestQueue } from './hooks/useRequestQueue';
export { useVirtualScrolling, useSimpleVirtualScrolling } from './hooks/useVirtualScrolling';
export { useAudioBufferManager } from './hooks/useAudioBufferManager';
export { useLazyVoiceLoading } from './hooks/useLazyVoiceLoading';

// Components
export { MicrophoneButton } from './components/MicrophoneButton';
export { LanguageToggle, getLanguageConfig, getSpeechLanguageCode } from './components/LanguageToggle';
export { ChatInterface } from './components/ChatInterface';
export { ChatMessage } from './components/ChatMessage';
export { SpeechControls } from './components/SpeechControls';
export { default as SettingsPanel } from './components/SettingsPanel';

// Browser Compatibility Components
export { default as CompatibilityWarning } from './components/CompatibilityWarning';
export { default as FeatureDetection, FeatureGate, FeatureStatusIndicator, withFeatureDetection } from './components/FeatureDetection';

// Hooks
export { useBrowserCompatibility } from './hooks/useBrowserCompatibility';

// Core interfaces
export type {
  ChatMessage,
  VoiceAIChatProps,
  VoiceAIChatState,
  VoiceSettings
} from './VoiceAIChat';

// Component interfaces
export type { LanguageToggleProps } from './components/LanguageToggle';
export type { ChatInterfaceProps } from './components/ChatInterface';
export type { ChatMessageProps } from './components/ChatMessage';
export type { SpeechControlsProps } from './components/SpeechControls';
export type { SettingsPanelProps } from './components/SettingsPanel';

// Services
export { SpeechRecognitionService } from './services/SpeechRecognitionService';
export { SpeechSynthesisService } from './services/SpeechSynthesisService';
export { DhenuAPIClient } from './services/DhenuAPIClient';
export { BrowserCompatibilityService, browserCompatibility } from './services/BrowserCompatibilityService';

// Service interfaces
export type {
  SpeechResult,
  SpeechRecognitionError,
  ISpeechRecognitionService
} from './services/SpeechRecognitionService';

export type {
  SpeechOptions,
  ISpeechSynthesisService
} from './services/SpeechSynthesisService';

export type {
  APIOptions,
  APIMessage,
  DhenuAPIResponse,
  IDhenuAPIClient
} from './services/DhenuAPIClient';

// Browser Compatibility interfaces
export type {
  BrowserCapabilities,
  CompatibilityIssue,
  BrowserOptimizations
} from './services/BrowserCompatibilityService';

export type {
  UseBrowserCompatibilityResult
} from './hooks/useBrowserCompatibility';