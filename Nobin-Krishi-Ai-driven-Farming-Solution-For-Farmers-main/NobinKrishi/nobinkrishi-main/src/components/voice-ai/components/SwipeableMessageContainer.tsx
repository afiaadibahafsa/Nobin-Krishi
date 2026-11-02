import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMobileOptimization } from '../hooks/useMobileOptimization';
import { ChatMessage } from '../VoiceAIChat';

export interface SwipeableMessageContainerProps {
  messages: ChatMessage[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onReplayMessage?: (text: string, language: 'bn' | 'en') => void;
  language: 'bn' | 'en';
  className?: string;
  enableHapticFeedback?: boolean;
  showNavigationHints?: boolean;
}

export const SwipeableMessageContainer: React.FC<SwipeableMessageContainerProps> = ({
  messages,
  currentIndex,
  onIndexChange,
  onReplayMessage,
  language,
  className = '',
  enableHapticFeedback = true,
  showNavigationHints = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showHints, setShowHints] = useState(showNavigationHints);

  const [mobileState, mobileActions] = useMobileOptimization({
    enableHapticFeedback,
    enableSwipeGestures: true
  });

  // Auto-hide navigation hints after first interaction
  useEffect(() => {
    if (showHints) {
      const timer = setTimeout(() => {
        setShowHints(false);
      }, 5000); // Hide after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [showHints]);

  // Setup swipe gestures for message navigation
  useEffect(() => {
    if (!containerRef.current || !mobileState.isTouch || messages.length <= 1) return;

    const cleanup = mobileActions.enableSwipeGestures(containerRef.current, {
      onSwipeLeft: () => {
        if (currentIndex < messages.length - 1) {
          handleNext();
        }
      },
      onSwipeRight: () => {
        if (currentIndex > 0) {
          handlePrevious();
        }
      },
      onSwipeStart: () => {
        setIsAnimating(true);
        setShowHints(false); // Hide hints on first interaction
      },
      onSwipeEnd: () => {
        setTimeout(() => setIsAnimating(false), 300);
      }
    });

    return cleanup;
  }, [mobileState.isTouch, messages.length, currentIndex, mobileActions]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setIsAnimating(true);
      onIndexChange(currentIndex - 1);
      mobileActions.triggerHapticFeedback('selection');
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const handleNext = () => {
    if (currentIndex < messages.length - 1) {
      setIsAnimating(true);
      onIndexChange(currentIndex + 1);
      mobileActions.triggerHapticFeedback('selection');
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const handleReplay = () => {
    const currentMessage = messages[currentIndex];
    if (currentMessage && onReplayMessage) {
      onReplayMessage(currentMessage.content, currentMessage.language);
      mobileActions.triggerHapticFeedback('impact');
    }
  };

  if (messages.length === 0) {
    return null;
  }

  const currentMessage = messages[currentIndex];
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < messages.length - 1;

  const texts = {
    bn: {
      previousMessage: 'পূর্ববর্তী বার্তা',
      nextMessage: 'পরবর্তী বার্তা',
      replayMessage: 'বার্তা পুনরায় চালান',
      swipeHint: 'বার্তা নেভিগেট করতে সোয়াইপ করুন',
      messageCount: 'বার্তা'
    },
    en: {
      previousMessage: 'Previous message',
      nextMessage: 'Next message',
      replayMessage: 'Replay message',
      swipeHint: 'Swipe to navigate messages',
      messageCount: 'message'
    }
  };

  const t = texts[language];

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden',
        'touch-pan-y', // Allow vertical scrolling but capture horizontal swipes
        isAnimating && 'transition-transform duration-300 ease-out',
        className
      )}
      role="region"
      aria-label={`${t.messageCount} ${currentIndex + 1} of ${messages.length}`}
      aria-live="polite"
    >
      {/* Navigation Hints */}
      {showHints && mobileState.isTouch && messages.length > 1 && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-black/70 text-white text-xs px-3 py-1 rounded-full animate-pulse">
            {t.swipeHint}
          </div>
        </div>
      )}

      {/* Message Content */}
      <div className="p-4">
        {/* Message Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-3 h-3 rounded-full',
              currentMessage.role === 'user' ? 'bg-blue-500' : 'bg-green-500'
            )} />
            <span className="text-sm font-medium text-[#2C3E50]">
              {currentMessage.role === 'user' 
                ? (language === 'bn' ? 'আপনি' : 'You')
                : (language === 'bn' ? 'AI সহায়ক' : 'AI Assistant')
              }
            </span>
            <span className="text-xs text-[#2C3E50]/60">
              {currentMessage.timestamp.toLocaleTimeString()}
            </span>
          </div>

          {/* Message Counter */}
          <div className="text-xs text-[#2C3E50]/60">
            {currentIndex + 1} / {messages.length}
          </div>
        </div>

        {/* Message Text */}
        <div className="text-base text-[#2C3E50] leading-relaxed mb-4">
          {currentMessage.content}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              className={cn(
                'voice-ai-touch-target voice-ai-enhanced-focus',
                !canGoPrevious && 'opacity-50 cursor-not-allowed'
              )}
              style={{ minHeight: '44px', minWidth: '44px' }}
              aria-label={t.previousMessage}
              title={t.previousMessage}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              disabled={!canGoNext}
              className={cn(
                'voice-ai-touch-target voice-ai-enhanced-focus',
                !canGoNext && 'opacity-50 cursor-not-allowed'
              )}
              style={{ minHeight: '44px', minWidth: '44px' }}
              aria-label={t.nextMessage}
              title={t.nextMessage}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Replay Button for AI Messages */}
          {currentMessage.role === 'assistant' && onReplayMessage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReplay}
              className="voice-ai-touch-target voice-ai-enhanced-focus text-[#2ECC71] hover:bg-[#2ECC71]/10"
              style={{ minHeight: '44px', minWidth: '44px' }}
              aria-label={t.replayMessage}
              title={t.replayMessage}
            >
              <Volume2 className="w-4 h-4 mr-1" />
              <span className="text-sm">
                {language === 'bn' ? 'শুনুন' : 'Play'}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Swipe Indicators */}
      {mobileState.isTouch && messages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-1">
            {messages.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors duration-200',
                  index === currentIndex ? 'bg-[#2ECC71]' : 'bg-[#E5E7EB]'
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Touch Gesture Visual Feedback */}
      {isAnimating && (
        <div className="absolute inset-0 bg-[#2ECC71]/5 pointer-events-none animate-pulse" />
      )}
    </div>
  );
};

export default SwipeableMessageContainer;