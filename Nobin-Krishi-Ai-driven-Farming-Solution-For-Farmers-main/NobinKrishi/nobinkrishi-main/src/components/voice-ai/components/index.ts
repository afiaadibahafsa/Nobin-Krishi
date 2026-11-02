// UI State Management Components
export { default as useUIStateManager } from '../hooks/useUIStateManager';
export type { UIState, UIFeedbackType, UIStateInfo, UIStateManagerOptions } from '../hooks/useUIStateManager';

// UI State Indicators
export { 
  UIStateIndicator, 
  FloatingStateIndicator, 
  InlineStateIndicator, 
  StatusBarIndicator 
} from './UIStateIndicator';
export type { UIStateIndicatorProps } from './UIStateIndicator';

// Loading Indicators
export { 
  LoadingIndicator,
  SpeechLoadingIndicator,
  ProcessingLoadingIndicator,
  ThinkingLoadingIndicator,
  NetworkLoadingIndicator,
  OverlayLoadingIndicator,
  InlineLoadingIndicator
} from './LoadingIndicator';
export type { LoadingIndicatorProps } from './LoadingIndicator';

// Status Text Components
export { 
  StatusText,
  ListeningStatusText,
  ProcessingStatusText,
  SpeakingStatusText,
  ErrorStatusText,
  SuccessStatusText,
  LiveStatusText
} from './StatusText';
export type { StatusTextProps } from './StatusText';

// Animation Components
export { 
  AnimationWrapper,
  FadeInWrapper,
  SlideUpWrapper,
  ScaleInWrapper,
  BounceWrapper,
  PulseWrapper,
  SpinWrapper,
  StateAnimationWrapper
} from './AnimationWrapper';
export type { AnimationWrapperProps } from './AnimationWrapper';

// Browser Compatibility Components
export { default as CompatibilityWarning } from './CompatibilityWarning';
export { default as FeatureDetection, FeatureGate, FeatureStatusIndicator, withFeatureDetection } from './FeatureDetection';

// Existing Components
export { MicrophoneButton } from './MicrophoneButton';
export { LanguageToggle } from './LanguageToggle';
export { ChatInterface } from './ChatInterface';
export { ChatMessage } from './ChatMessage';
export { SpeechControls } from './SpeechControls';
export { default as SettingsPanel } from './SettingsPanel';

// Mobile Optimization Components
export { default as MobileOptimizedContainer } from './MobileOptimizedContainer';
export { default as SwipeableMessageContainer } from './SwipeableMessageContainer';
export { default as MobileVoiceControls } from './MobileVoiceControls';