import React, { ReactNode } from 'react';
import { useBrowserCompatibility } from '../hooks/useBrowserCompatibility';
import { Loader2, AlertCircle, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface FeatureDetectionProps {
  children: ReactNode;
  language: 'bn' | 'en';
  showLoadingState?: boolean;
  showCompatibilityWarning?: boolean;
  fallbackComponent?: ReactNode;
  className?: string;
}

interface FeatureGateProps {
  feature: 'speechRecognition' | 'speechSynthesis' | 'microphone' | 'audio';
  children: ReactNode;
  fallback?: ReactNode;
  language: 'bn' | 'en';
}

// Feature gate component for individual features
export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  language
}) => {
  const { checkFeatureSupport, isReady } = useBrowserCompatibility();

  if (!isReady) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        <span className="text-sm text-gray-600">
          {language === 'bn' ? 'ফিচার চেক করা হচ্ছে...' : 'Checking features...'}
        </span>
      </div>
    );
  }

  const isSupported = checkFeatureSupport(feature);

  if (!isSupported && fallback) {
    return <>{fallback}</>;
  }

  if (!isSupported) {
    return null;
  }

  return <>{children}</>;
};

// Main feature detection wrapper
const FeatureDetection: React.FC<FeatureDetectionProps> = ({
  children,
  language,
  showLoadingState = true,
  showCompatibilityWarning = true,
  fallbackComponent,
  className = ''
}) => {
  const {
    isLoading,
    isReady,
    error,
    fallbackMode,
    compatibilityIssues,
    browserInfo
  } = useBrowserCompatibility();

  const translations = {
    bn: {
      loading: 'ব্রাউজার ক্ষমতা পরীক্ষা করা হচ্ছে...',
      error: 'ব্রাউজার ক্ষমতা পরীক্ষা করতে ব্যর্থ',
      retry: 'আবার চেষ্টা করুন',
      textOnlyMode: 'টেক্সট-শুধু মোড',
      textOnlyDescription: 'ভয়েস ফিচার উপলব্ধ নেই। আপনি টেক্সট ইনপুট ব্যবহার করতে পারেন।',
      speechOutputOnlyMode: 'শুধুমাত্র ভয়েস আউটপুট',
      speechOutputOnlyDescription: 'ভয়েস ইনপুট উপলব্ধ নেই। AI উত্তর শুনতে পারবেন কিন্তু টাইপ করতে হবে।',
      speechInputOnlyMode: 'শুধুমাত্র ভয়েস ইনপুট',
      speechInputOnlyDescription: 'ভয়েস আউটপুট উপলব্ধ নেই। কথা বলতে পারবেন কিন্তু উত্তর পড়তে হবে।',
      unsupportedBrowser: 'অসমর্থিত ব্রাউজার',
      unsupportedBrowserDescription: 'আপনার ব্রাউজার ভয়েস ফিচার সাপোর্ট করে না।'
    },
    en: {
      loading: 'Checking browser capabilities...',
      error: 'Failed to check browser capabilities',
      retry: 'Retry',
      textOnlyMode: 'Text-Only Mode',
      textOnlyDescription: 'Voice features are not available. You can use text input instead.',
      speechOutputOnlyMode: 'Speech Output Only',
      speechOutputOnlyDescription: 'Voice input is not available. You can hear AI responses but need to type.',
      speechInputOnlyMode: 'Speech Input Only',
      speechInputOnlyDescription: 'Voice output is not available. You can speak but need to read responses.',
      unsupportedBrowser: 'Unsupported Browser',
      unsupportedBrowserDescription: 'Your browser does not support voice features.'
    }
  };

  const t = translations[language];

  // Loading state
  if (isLoading && showLoadingState) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
        <p className="text-gray-600 text-center">{t.loading}</p>
        {browserInfo && (
          <p className="text-sm text-gray-500 mt-2">
            {browserInfo.name} {browserInfo.version}
          </p>
        )}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <AlertCircle className="w-8 h-8 mb-4 text-red-500" />
        <p className="text-red-600 text-center mb-4">{t.error}</p>
        <p className="text-sm text-gray-600 text-center mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {t.retry}
        </button>
      </div>
    );
  }

  // Not ready state
  if (!isReady) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        <span className="text-sm text-gray-600">{t.loading}</span>
      </div>
    );
  }

  // Fallback modes with custom UI
  const renderFallbackMode = () => {
    const getFallbackIcon = () => {
      switch (fallbackMode) {
        case 'text-only':
          return (
            <div className="flex items-center gap-2 mb-4">
              <MicOff className="w-6 h-6 text-gray-400" />
              <VolumeX className="w-6 h-6 text-gray-400" />
            </div>
          );
        case 'speech-output-only':
          return (
            <div className="flex items-center gap-2 mb-4">
              <MicOff className="w-6 h-6 text-gray-400" />
              <Volume2 className="w-6 h-6 text-green-500" />
            </div>
          );
        case 'speech-input-only':
          return (
            <div className="flex items-center gap-2 mb-4">
              <Mic className="w-6 h-6 text-green-500" />
              <VolumeX className="w-6 h-6 text-gray-400" />
            </div>
          );
        default:
          return null;
      }
    };

    const getFallbackContent = () => {
      switch (fallbackMode) {
        case 'text-only':
          return (
            <div className="text-center">
              <h3 className="font-medium text-gray-800 mb-2">{t.textOnlyMode}</h3>
              <p className="text-sm text-gray-600">{t.textOnlyDescription}</p>
            </div>
          );
        case 'speech-output-only':
          return (
            <div className="text-center">
              <h3 className="font-medium text-gray-800 mb-2">{t.speechOutputOnlyMode}</h3>
              <p className="text-sm text-gray-600">{t.speechOutputOnlyDescription}</p>
            </div>
          );
        case 'speech-input-only':
          return (
            <div className="text-center">
              <h3 className="font-medium text-gray-800 mb-2">{t.speechInputOnlyMode}</h3>
              <p className="text-sm text-gray-600">{t.speechInputOnlyDescription}</p>
            </div>
          );
        default:
          return null;
      }
    };

    // Show fallback UI for limited modes
    if (fallbackMode !== 'full-voice' && showCompatibilityWarning) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex flex-col items-center">
            {getFallbackIcon()}
            {getFallbackContent()}
          </div>
        </div>
      );
    }

    return null;
  };

  // Custom fallback component
  if (fallbackMode === 'text-only' && fallbackComponent) {
    return (
      <div className={className}>
        {renderFallbackMode()}
        {fallbackComponent}
      </div>
    );
  }

  // Render children with fallback mode indicator
  return (
    <div className={className}>
      {renderFallbackMode()}
      {children}
    </div>
  );
};

// Higher-order component for feature detection
export const withFeatureDetection = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    language: 'bn' | 'en';
    showLoadingState?: boolean;
    showCompatibilityWarning?: boolean;
    fallbackComponent?: ReactNode;
  }
) => {
  return (props: P) => (
    <FeatureDetection {...options}>
      <Component {...props} />
    </FeatureDetection>
  );
};

// Feature status indicator component
export const FeatureStatusIndicator: React.FC<{ language: 'bn' | 'en'; className?: string }> = ({
  language,
  className = ''
}) => {
  const {
    isSpeechRecognitionSupported,
    isSpeechSynthesisSupported,
    isMicrophoneSupported,
    isOnline
  } = useBrowserCompatibility();

  const getStatusIcon = (supported: boolean) => {
    return supported ? (
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
    ) : (
      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
    );
  };

  const translations = {
    bn: {
      voiceInput: 'ভয়েস ইনপুট',
      voiceOutput: 'ভয়েস আউটপুট',
      microphone: 'মাইক্রোফোন',
      network: 'নেটওয়ার্ক'
    },
    en: {
      voiceInput: 'Voice Input',
      voiceOutput: 'Voice Output',
      microphone: 'Microphone',
      network: 'Network'
    }
  };

  const t = translations[language];

  return (
    <div className={`flex items-center gap-4 text-xs text-gray-600 ${className}`}>
      <div className="flex items-center gap-1">
        {getStatusIcon(isSpeechRecognitionSupported)}
        <span>{t.voiceInput}</span>
      </div>
      <div className="flex items-center gap-1">
        {getStatusIcon(isSpeechSynthesisSupported)}
        <span>{t.voiceOutput}</span>
      </div>
      <div className="flex items-center gap-1">
        {getStatusIcon(isMicrophoneSupported)}
        <span>{t.microphone}</span>
      </div>
      <div className="flex items-center gap-1">
        {getStatusIcon(isOnline)}
        <span>{t.network}</span>
      </div>
    </div>
  );
};

export default FeatureDetection;