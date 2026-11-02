import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Send, Settings, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useMobileOptimization } from '../hooks/useMobileOptimization';

export interface MobileVoiceControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  inputText: string;
  interimText: string;
  currentLanguage: 'bn' | 'en';
  isSupported: boolean;
  onMicrophoneToggle: () => void;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onSettingsToggle?: () => void;
  onRetry?: () => void;
  className?: string;
  showRetryButton?: boolean;
  enableHapticFeedback?: boolean;
}

export const MobileVoiceControls: React.FC<MobileVoiceControlsProps> = ({
  isListening,
  isSpeaking,
  isProcessing,
  inputText,
  interimText,
  currentLanguage,
  isSupported,
  onMicrophoneToggle,
  onInputChange,
  onSend,
  onSettingsToggle,
  onRetry,
  className = '',
  showRetryButton = false,
  enableHapticFeedback = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showInterimText, setShowInterimText] = useState(false);

  const [mobileState, mobileActions] = useMobileOptimization({
    enableHapticFeedback,
    touchTargetMinSize: 44
  });

  // Show interim text with animation
  useEffect(() => {
    if (interimText) {
      setShowInterimText(true);
    } else {
      const timer = setTimeout(() => setShowInterimText(false), 300);
      return () => clearTimeout(timer);
    }
  }, [interimText]);

  // Auto-expand input when keyboard is visible
  useEffect(() => {
    if (mobileState.isKeyboardVisible) {
      setIsExpanded(true);
    }
  }, [mobileState.isKeyboardVisible]);

  const handleMicrophoneClick = () => {
    onMicrophoneToggle();
    mobileActions.triggerHapticFeedback(isListening ? 'medium' : 'light');
  };

  const handleSendClick = () => {
    if (inputText.trim()) {
      onSend();
      mobileActions.triggerHapticFeedback('impact');
    }
  };

  const handleInputFocus = () => {
    setIsExpanded(true);
    mobileActions.triggerHapticFeedback('selection');
  };

  const handleInputBlur = () => {
    if (!inputText && !mobileState.isKeyboardVisible) {
      setIsExpanded(false);
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
      mobileActions.triggerHapticFeedback('medium');
    }
  };

  const handleSettingsToggle = () => {
    if (onSettingsToggle) {
      onSettingsToggle();
      mobileActions.triggerHapticFeedback('selection');
    }
  };

  const texts = {
    bn: {
      tapToSpeak: 'কথা বলতে ট্যাপ করুন',
      listening: 'শুনছি...',
      processing: 'প্রক্রিয়াকরণ...',
      speaking: 'বলছি...',
      typeMessage: 'আপনার বার্তা টাইপ করুন...',
      send: 'পাঠান',
      retry: 'আবার চেষ্টা',
      settings: 'সেটিংস',
      voiceNotSupported: 'ভয়েস সাপোর্ট নেই'
    },
    en: {
      tapToSpeak: 'Tap to speak',
      listening: 'Listening...',
      processing: 'Processing...',
      speaking: 'Speaking...',
      typeMessage: 'Type your message...',
      send: 'Send',
      retry: 'Retry',
      settings: 'Settings',
      voiceNotSupported: 'Voice not supported'
    }
  };

  const t = texts[currentLanguage];

  const getStatusText = () => {
    if (!isSupported) return t.voiceNotSupported;
    if (isListening) return t.listening;
    if (isProcessing) return t.processing;
    if (isSpeaking) return t.speaking;
    return t.tapToSpeak;
  };

  const getMicrophoneButtonClasses = () => {
    const baseClasses = 'relative transition-all duration-300 voice-ai-touch-target voice-ai-enhanced-focus';
    
    if (!isSupported || isProcessing) {
      return cn(baseClasses, 'bg-gray-400 cursor-not-allowed');
    }
    
    if (isListening) {
      return cn(baseClasses, 'bg-red-500 animate-pulse scale-110 shadow-lg');
    }
    
    return cn(baseClasses, 'bg-[#2ECC71] hover:bg-[#27AE60] hover:scale-105 shadow-md');
  };

  return (
    <div
      className={cn(
        'mobile-voice-controls',
        'bg-white border-t border-[#E5E7EB] shadow-lg',
        'transition-all duration-300 ease-in-out',
        mobileState.isKeyboardVisible && 'pb-0',
        className
      )}
      style={{
        paddingBottom: mobileState.safeAreaInsets.bottom > 0 
          ? `max(1rem, env(safe-area-inset-bottom))` 
          : '1rem'
      }}
    >
      {/* Status Bar */}
      {(isListening || isProcessing || isSpeaking || !isSupported) && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-center gap-2">
            {isListening && (
              <div className="flex items-center gap-1">
                <div className="w-1 h-3 bg-[#2ECC71] rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-4 bg-[#2ECC71] rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-3 bg-[#2ECC71] rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            )}
            {isSpeaking && <Volume2 className="w-4 h-4 text-[#2ECC71] animate-pulse" />}
            {isProcessing && (
              <div className="w-4 h-4 border-2 border-[#2ECC71] border-t-transparent rounded-full animate-spin" />
            )}
            {!isSupported && <VolumeX className="w-4 h-4 text-gray-400" />}
            
            <span className="text-sm font-medium text-[#2C3E50]">
              {getStatusText()}
            </span>
          </div>
        </div>
      )}

      {/* Main Controls */}
      <div className="p-4 space-y-4">
        {/* Input Section */}
        <div className={cn(
          'transition-all duration-300 ease-in-out',
          isExpanded ? 'opacity-100 max-h-20' : 'opacity-70 max-h-12'
        )}>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder={t.typeMessage}
                value={inputText}
                onChange={(e) => onInputChange(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleSendClick()}
                className={cn(
                  'h-12 text-base border-[#E5E7EB] rounded-xl',
                  'focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20',
                  'transition-all duration-300',
                  'voice-ai-enhanced-focus',
                  isListening && 'border-[#2ECC71] bg-green-50',
                  isExpanded && 'shadow-md'
                )}
                disabled={isProcessing}
                style={{ minHeight: '44px' }}
              />
              
              {/* Interim Text Overlay */}
              {showInterimText && interimText && (
                <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
                  <span className="text-[#2ECC71] opacity-70 italic animate-pulse">
                    {interimText}
                  </span>
                </div>
              )}
            </div>
            
            {/* Send Button */}
            <Button
              onClick={handleSendClick}
              disabled={!inputText.trim() || isProcessing}
              className={cn(
                'bg-[#2ECC71] hover:bg-[#27AE60] text-white',
                'h-12 px-4 rounded-xl',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-all duration-300 hover:scale-105',
                'voice-ai-touch-target voice-ai-enhanced-focus'
              )}
              style={{ minHeight: '44px', minWidth: '44px' }}
              aria-label={t.send}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Voice Control Section */}
        <div className="flex items-center justify-center gap-4">
          {/* Settings Button */}
          {onSettingsToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSettingsToggle}
              className="voice-ai-touch-target voice-ai-enhanced-focus text-[#2C3E50] hover:bg-gray-100"
              style={{ minHeight: '44px', minWidth: '44px' }}
              aria-label={t.settings}
            >
              <Settings className="w-5 h-5" />
            </Button>
          )}

          {/* Retry Button */}
          {showRetryButton && onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              className="voice-ai-touch-target voice-ai-enhanced-focus text-orange-600 hover:bg-orange-50"
              style={{ minHeight: '44px', minWidth: '44px' }}
              aria-label={t.retry}
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          )}

          {/* Microphone Button */}
          <div className="relative">
            <Button
              onClick={handleMicrophoneClick}
              disabled={!isSupported || isProcessing}
              className={getMicrophoneButtonClasses()}
              style={{ 
                minHeight: '56px', 
                minWidth: '56px',
                borderRadius: '50%'
              }}
              aria-label={getStatusText()}
              aria-pressed={isListening}
            >
              {isListening ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </Button>
            
            {/* Pulsing Ring for Listening State */}
            {isListening && (
              <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-75 pointer-events-none" />
            )}
            
            {/* Processing Ring */}
            {isProcessing && (
              <div className="absolute inset-0 rounded-full border-2 border-[#2ECC71] border-t-transparent animate-spin pointer-events-none" />
            )}
          </div>

          {/* Spacer for symmetry */}
          <div style={{ minWidth: '44px' }} />
        </div>

        {/* Voice Control Hint */}
        {mobileState.isMobile && isSupported && !isListening && !isProcessing && (
          <div className="text-center">
            <p className="text-xs text-[#2C3E50]/60">
              {currentLanguage === 'bn' 
                ? 'মাইক্রোফোন বোতামে ট্যাপ করুন বা টাইপ করুন'
                : 'Tap microphone button or type your message'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileVoiceControls;