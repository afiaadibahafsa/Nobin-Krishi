import React, { useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccessibilityContext } from './AccessibilityProvider';

interface MicrophoneButtonProps {
  isListening: boolean;
  isProcessing: boolean;
  isSupported: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  language: 'bn' | 'en';
}

export const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  isListening,
  isProcessing,
  isSupported,
  onClick,
  size = 'md',
  className = '',
  language
}) => {
  const { announce, getAriaLabel, getAccessibilityClasses } = useAccessibilityContext();

  // Announce state changes for screen readers
  useEffect(() => {
    if (isListening) {
      announce(
        language === 'bn' ? 'মাইক্রোফোন চালু, শুনছি' : 'Microphone active, listening',
        'assertive'
      );
    } else if (isProcessing) {
      announce(
        language === 'bn' ? 'প্রক্রিয়াকরণ চলছে' : 'Processing',
        'polite'
      );
    }
  }, [isListening, isProcessing, announce, language]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-10 h-10';
      case 'lg':
        return 'w-14 h-14';
      default:
        return 'w-12 h-12';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-7 h-7';
      default:
        return 'w-5 h-5';
    }
  };

  const getButtonClasses = () => {
    const baseClasses = `${getSizeClasses()} rounded-full flex items-center justify-center transition-all duration-300 voice-ai-touch-target voice-ai-enhanced-focus ${className}`;
    const accessibilityClasses = getAccessibilityClasses(baseClasses);
    
    if (!isSupported || isProcessing) {
      return `${accessibilityClasses} bg-[#94A3B8] cursor-not-allowed`;
    }
    
    if (isListening) {
      return `${accessibilityClasses} bg-[#E74C3C] animate-pulse scale-110 hover:bg-[#C0392B]`;
    }
    
    return `${accessibilityClasses} bg-[#2ECC71] hover:bg-[#27AE60] hover:scale-105`;
  };

  const getStatusText = () => {
    if (!isSupported) {
      return language === 'bn' ? 'ভয়েস সাপোর্ট নেই - টাইপ করুন' : 'Voice not supported - Type instead';
    }
    
    if (isProcessing) {
      return language === 'bn' ? 'প্রক্রিয়াকরণ...' : 'Processing...';
    }
    
    if (isListening) {
      return language === 'bn' ? 'শুনছি...' : 'Listening...';
    }
    
    return language === 'bn' ? 'কথা বলুন' : 'Tap to speak';
  };

  const getAriaLabelText = () => {
    if (!isSupported) {
      return getAriaLabel('microphoneDisabled');
    }
    
    if (isListening) {
      return getAriaLabel('microphoneListening');
    }
    
    return getAriaLabel('microphoneStart');
  };

  const getTooltipText = () => {
    if (!isSupported) {
      return language === 'bn' 
        ? 'এই ব্রাউজারে ভয়েস রিকগনিশন সাপোর্ট করা হয় না - অনুগ্রহ করে টাইপ করুন' 
        : 'Speech recognition not supported in this browser - please type your message';
    }
    
    if (isProcessing) {
      return language === 'bn' ? 'অনুগ্রহ করে অপেক্ষা করুন...' : 'Please wait...';
    }
    
    if (isListening) {
      return language === 'bn' ? 'শোনা বন্ধ করতে ক্লিক করুন' : 'Click to stop listening';
    }
    
    return language === 'bn' ? 'ভয়েস ইনপুট শুরু করতে ক্লিক করুন' : 'Click to start voice input';
  };

  return (
    <div className="flex flex-col items-center gap-2" role="group" aria-labelledby="microphone-status">
      <Button
        id="microphone-button"
        data-testid="microphone-button"
        onClick={onClick}
        disabled={!isSupported || isProcessing}
        className={getButtonClasses()}
        title={getTooltipText()}
        aria-label={getAriaLabelText()}
        aria-describedby="microphone-status microphone-help"
        aria-pressed={isListening}
        variant="ghost"
        size="icon"
        type="button"
      >
        {isListening ? (
          <MicOff 
            className={`${getIconSize()} text-white`} 
            aria-hidden="true"
          />
        ) : (
          <Mic 
            className={`${getIconSize()} text-white`} 
            aria-hidden="true"
          />
        )}
      </Button>
      
      {/* Status Text with proper ARIA labeling */}
      {(isListening || !isSupported || isProcessing) && (
        <p 
          id="microphone-status"
          className="text-xs text-center text-[#2C3E50]/70 max-w-32 leading-tight"
          aria-live="polite"
          aria-atomic="true"
        >
          {getStatusText()}
        </p>
      )}

      {/* Screen reader help text */}
      <div id="microphone-help" className="sr-only">
        {language === 'bn' 
          ? 'Ctrl+Enter চেপে মাইক্রোফোন চালু/বন্ধ করুন'
          : 'Press Ctrl+Enter to toggle microphone'
        }
      </div>
      
      {/* Pulsing Visual Feedback with reduced motion support */}
      {isListening && (
        <div 
          className="absolute inset-0 rounded-full border-2 border-[#E74C3C] animate-ping opacity-75 pointer-events-none" 
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default MicrophoneButton;