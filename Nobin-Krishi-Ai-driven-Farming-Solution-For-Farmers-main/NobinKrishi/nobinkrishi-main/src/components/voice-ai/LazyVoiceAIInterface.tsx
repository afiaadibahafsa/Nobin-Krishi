import React, { useState, useEffect, Suspense } from 'react';
import { useVoiceAIChat } from './VoiceAIChat';
import { ChatInterface } from './components/ChatInterface';
import { SpeechControls } from './components/SpeechControls';
import SettingsPanel from './components/SettingsPanel';
import { UIStateIndicator, FloatingStateIndicator } from './components/UIStateIndicator';
import { ProcessingLoadingIndicator, ThinkingLoadingIndicator } from './components/LoadingIndicator';
import { StatusText } from './components/StatusText';
import { AnimationWrapper, FadeInWrapper } from './components/AnimationWrapper';
import { useBrowserCompatibility } from './hooks/useBrowserCompatibility';
import { AccessibilityProvider } from './components/AccessibilityProvider';
import MobileOptimizedContainer from './components/MobileOptimizedContainer';
import SwipeableMessageContainer from './components/SwipeableMessageContainer';
import MobileVoiceControls from './components/MobileVoiceControls';
import { useMobileOptimization } from './hooks/useMobileOptimization';
import { MicrophoneButton } from './components/MicrophoneButton';
import { LanguageToggle } from './components/LanguageToggle';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Send, Loader2 } from 'lucide-react';

interface LazyVoiceAIInterfaceProps {
  isMobile: boolean;
  isOnline: boolean;
  currentMessageIndex: number;
  setCurrentMessageIndex: (index: number) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}

const VoiceAILoader = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-[#2ECC71]" />
      <span className="text-[#2C3E50] font-medium">{message}</span>
    </div>
  </div>
);

const LazyVoiceAIInterface: React.FC<LazyVoiceAIInterfaceProps> = ({
  isMobile,
  isOnline,
  currentMessageIndex,
  setCurrentMessageIndex,
  isSettingsOpen,
  setIsSettingsOpen
}) => {
  // Mobile optimization
  const [mobileState, mobileActions] = useMobileOptimization({
    enableHapticFeedback: true,
    enableSwipeGestures: true,
    touchTargetMinSize: 44
  });

  // Browser compatibility hook
  const {
    isReady: isBrowserReady,
    fallbackMode,
    compatibilityIssues,
    browserInfo
  } = useBrowserCompatibility();

  // Initialize Voice AI Chat with dummy API key for now
  const voiceAI = useVoiceAIChat({
    apiKey: "dummy-api-key", // This should come from environment variables
    defaultLanguage: "bn",
    maxHistoryLength: 5
  });

  const { 
    state, 
    voiceSettings,
    setVoiceSettings,
    uiState,
    isUIStateVisible,
    updateUIState,
    updateEnhancedUIState,
    clearUIState,
    toggleMicrophone, 
    toggleLanguage, 
    handleInputChange, 
    handleSend,
    retryLastMessage,
    clearConversation,
    replayMessage,
    pauseSpeech,
    resumeSpeech,
    stopSpeech,
    replaySpeech,
    getSpeechState,
    getConversationStats,
    getConversationContext,
    needsContextManagement,
    isSpeechRecognitionSupported,
    isSpeechSynthesisSupported,
    isMicrophoneSupported,
    isBrowserReady: voiceAIBrowserReady,
    fallbackMode: voiceAIFallbackMode,
    compatibilityIssues: voiceAICompatibilityIssues,
    isOnline: voiceAIOnline
  } = voiceAI;

  const handleMicClick = () => {
    // Enhanced microphone permission handling with fallback (Requirements 6.1)
    if (isSpeechRecognitionSupported) {
      toggleMicrophone();
    } else {
      // Show fallback message for unsupported browsers
      console.warn("Speech recognition not supported in this browser");
      // The error will be handled by the VoiceAIChat component itself
    }
  };

  const handleSendClick = () => {
    handleSend();
    // Haptic feedback for mobile interactions
    if (mobileState.isMobile) {
      mobileActions.triggerHapticFeedback('medium');
    }
  };

  const handleKeyboardVisibilityChange = (isVisible: boolean) => {
    // Adjust UI when keyboard appears/disappears on mobile
    // Implementation can be added here if needed
  };

  // Swipe callbacks for message navigation
  const swipeCallbacks = {
    onSwipeLeft: () => {
      if (state.messages.length > 0 && currentMessageIndex < state.messages.length - 1) {
        setCurrentMessageIndex(currentMessageIndex + 1);
        mobileActions.triggerHapticFeedback('selection');
      }
    },
    onSwipeRight: () => {
      if (currentMessageIndex > 0) {
        setCurrentMessageIndex(currentMessageIndex - 1);
        mobileActions.triggerHapticFeedback('selection');
      }
    },
    onSwipeUp: () => {
      // Scroll to top of messages
      const messagesContainer = document.getElementById('chat-messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    onSwipeDown: () => {
      // Scroll to bottom of messages
      const messagesContainer = document.getElementById('chat-messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
      }
    }
  };

  return (
    <AccessibilityProvider language={state.currentLanguage}>
      <MobileOptimizedContainer
        enableSwipeGestures={true}
        enableHapticFeedback={true}
        enableTouchOptimization={true}
        swipeCallbacks={swipeCallbacks}
        onKeyboardVisibilityChange={handleKeyboardVisibilityChange}
        preventZoom={true}
        enableSmoothScrolling={true}
        safeAreaPadding={true}
        adaptiveLayout={true}
        className="w-full"
      >
        {/* Floating UI State Indicator for system feedback */}
        <FloatingStateIndicator
          stateInfo={uiState}
          isVisible={isUIStateVisible}
          position="top"
          size="md"
          variant="default"
          showProgress={true}
          showIcon={true}
          showAnimation={true}
        />

        {/* Fallback Mode Information */}
        {fallbackMode !== 'full-voice' && (
          <FadeInWrapper className="max-w-4xl mx-auto mb-8">
            <Card className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="text-2xl">⚠️</div>
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-1">
                    {state.currentLanguage === "bn" ? "সীমিত ভয়েস সাপোর্ট" : "Limited Voice Support"}
                  </h3>
                  <p className="text-sm text-yellow-700">
                    {fallbackMode === 'text-only' && (
                      state.currentLanguage === "bn" 
                        ? "ভয়েস ফিচার উপলব্ধ নেই। আপনি টেক্সট ইনপুট ব্যবহার করতে পারেন।"
                        : "Voice features are not available. You can use text input instead."
                    )}
                    {fallbackMode === 'speech-output-only' && (
                      state.currentLanguage === "bn" 
                        ? "ভয়েস ইনপুট উপলব্ধ নেই। AI উত্তর শুনতে পারবেন কিন্তু টাইপ করতে হবে।"
                        : "Voice input is not available. You can hear AI responses but need to type."
                    )}
                    {fallbackMode === 'speech-input-only' && (
                      state.currentLanguage === "bn" 
                        ? "ভয়েস আউটপুট উপলব্ধ নেই। কথা বলতে পারবেন কিন্তু উত্তর পড়তে হবে।"
                        : "Voice output is not available. You can speak but need to read responses."
                    )}
                  </p>
                </div>
              </div>
            </Card>
          </FadeInWrapper>
        )}

        {/* Processing State with Enhanced Loading Indicator */}
        {state.isProcessing && (
          <FadeInWrapper className="max-w-4xl mx-auto mb-8">
            <Card className="bg-white shadow-md rounded-2xl p-6">
              <div className="flex items-center justify-center">
                <ThinkingLoadingIndicator
                  message={state.currentLanguage === "bn" ? "AI চিন্তা করছে..." : "AI is thinking..."}
                  language={state.currentLanguage}
                  size="lg"
                  showMessage={true}
                  showProgress={false}
                />
              </div>
            </Card>
          </FadeInWrapper>
        )}

        {/* Chat Interface with Context Management Info */}
        {state.messages.length > 0 && (
          <FadeInWrapper className="max-w-4xl mx-auto mb-8">
            {/* Context Management Warning */}
            {needsContextManagement() && (
              <AnimationWrapper animation="slide" direction="down" trigger="mount">
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className={cn(
                    "text-blue-600 flex items-center gap-2",
                    mobileState.isMobile ? "text-sm" : "text-sm"
                  )}>
                    ℹ️ {state.currentLanguage === "bn" 
                      ? "কথোপকথন দীর্ঘ হয়েছে। AI শুধুমাত্র সাম্প্রতিক ৫টি বার্তা মনে রাখবে।"
                      : "Conversation is getting long. AI will only remember the most recent 5 messages."}
                  </p>
                </div>
              </AnimationWrapper>
            )}
            
            {/* Mobile: Use Swipeable Message Container, Desktop: Use Traditional Chat Interface */}
            {mobileState.isMobile && state.messages.length > 0 ? (
              <SwipeableMessageContainer
                messages={state.messages}
                currentIndex={currentMessageIndex}
                onIndexChange={setCurrentMessageIndex}
                onReplayMessage={replayMessage}
                language={state.currentLanguage}
                enableHapticFeedback={true}
                showNavigationHints={true}
              />
            ) : (
              <ChatInterface
                messages={state.messages}
                onReplayMessage={replayMessage}
                onClearConversation={clearConversation}
                language={state.currentLanguage}
                maxHeight="500px"
                enableVirtualScrolling={state.messages.length > 20} // Enable virtual scrolling for large conversations
                estimatedMessageHeight={85}
              />
            )}
          </FadeInWrapper>
        )}

        {/* Speech Controls - Show when there's active speech or recent AI message - Desktop only */}
        {!mobileState.isMobile && (state.isSpeaking || (state.messages.length > 0 && state.messages[state.messages.length - 1]?.role === 'assistant')) && (
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="bg-white shadow-md rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#2C3E50] flex items-center gap-2">
                  🔊 {state.currentLanguage === "bn" ? "বক্তৃতা নিয়ন্ত্রণ" : "Speech Controls"}
                </h3>
                <SpeechControls
                  isSpeaking={state.isSpeaking}
                  isPaused={getSpeechState().isPaused}
                  canReplay={getSpeechState().currentSpeech !== null || state.messages.some(m => m.role === 'assistant')}
                  onPlay={resumeSpeech}
                  onPause={pauseSpeech}
                  onStop={stopSpeech}
                  onReplay={replaySpeech}
                  language={state.currentLanguage}
                  size="md"
                />
              </div>
            </Card>
          </div>
        )}

        {/* Settings Panel and User Controls (Requirements 4.6, 4.7) - Desktop only */}
        {!mobileState.isMobile && (
          <div className="max-w-4xl mx-auto mb-8">
            <SettingsPanel
              voiceSettings={voiceSettings}
              onVoiceSettingsChange={setVoiceSettings}
              language={state.currentLanguage}
              className="w-full"
            />
          </div>
        )}

        {/* Fixed Bottom Input Section - Desktop only */}
        {!mobileState.isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] shadow-lg z-40">
            <div className="container mx-auto px-6 py-4">
              {/* Error Message with Retry Button - Enhanced with Animation */}
              {state.error && (
                <AnimationWrapper animation="slide" direction="down" trigger="mount">
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-red-600 flex-1">{state.error}</p>
                      {(state.error.includes('Connection issue') || 
                        state.error.includes('সংযোগ সমস্যা') ||
                        state.error.includes('temporarily unavailable') ||
                        state.error.includes('সাময়িকভাবে বন্ধ') ||
                        state.error.includes('Rate limit') ||
                        state.error.includes('অনেক অনুরোধ')) && (
                        <Button
                          onClick={retryLastMessage}
                          variant="outline"
                          size="sm"
                          className="ml-3 text-red-600 border-red-300 hover:bg-red-100"
                          disabled={state.isProcessing}
                        >
                          {state.currentLanguage === "bn" ? "আবার চেষ্টা" : "Retry"}
                        </Button>
                      )}
                    </div>
                  </div>
                </AnimationWrapper>
              )}

              {/* Processing Status with Enhanced Feedback and Animation */}
              {(state.isProcessing || state.statusText) && (
                <AnimationWrapper animation="fade" direction="in" trigger="mount">
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      {state.isProcessing && (
                        <ProcessingLoadingIndicator
                          size="sm"
                          showMessage={false}
                          language={state.currentLanguage}
                        />
                      )}
                      <p className="text-sm text-blue-600 flex-1">
                        {state.statusText || (state.currentLanguage === "bn" ? "AI চিন্তা করছে..." : "AI is thinking...")}
                      </p>
                    </div>
                  </div>
                </AnimationWrapper>
              )}

              {/* Input Field with Live Transcription - Enhanced */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder={state.currentLanguage === "bn" ? "আবহাওয়া, বাজার মূল্য বা চাষের পরামর্শ সম্পর্কে জিজ্ঞাসা করুন..." : "Ask about weather, market prices, or farming advice..."}
                    value={state.inputText}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendClick()}
                    className={`h-12 text-base border-[#E5E7EB] rounded-xl focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20 transition-all duration-300 ${
                      state.isListening ? "border-[#2ECC71] bg-green-50 animate-pulse" : ""
                    }`}
                    disabled={state.isProcessing}
                  />
                  
                  {/* Live Transcription Overlay with Animation */}
                  {state.interimText && (
                    <AnimationWrapper animation="fade" direction="in" trigger="mount">
                      <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
                        <span className="text-[#2ECC71] opacity-70 italic animate-pulse">
                          {state.interimText}
                        </span>
                      </div>
                    </AnimationWrapper>
                  )}
                  
                  {/* Enhanced Listening Status Indicator */}
                  {state.isListening && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-2 bg-[#2ECC71] rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                          <div className="w-1 h-3 bg-[#2ECC71] rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                          <div className="w-1 h-2 bg-[#2ECC71] rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                        </div>
                        <StatusText
                          status="listening-active"
                          type="listening"
                          language={state.currentLanguage}
                          showIcon={false}
                          animated={true}
                          size="sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={handleSendClick}
                  disabled={!state.inputText.trim() || state.isProcessing}
                  className="bg-[#2ECC71] hover:bg-[#27AE60] text-white h-12 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>

              {/* Enhanced Microphone Button with Dotted Lines and Animation */}
              <div className="flex items-center justify-center gap-4">
                <div className="flex-1 h-px border-t-2 border-dotted border-[#E5E7EB]"></div>
                
                <AnimationWrapper 
                  animation="scale" 
                  direction="in" 
                  trigger="mount" 
                  delay={800}
                  className="relative"
                >
                  <MicrophoneButton
                    isListening={state.isListening}
                    isProcessing={state.isProcessing}
                    isSupported={isSpeechRecognitionSupported}
                    onClick={handleMicClick}
                    size="lg"
                    language={state.currentLanguage}
                  />
                </AnimationWrapper>
                
                <div className="flex-1 h-px border-t-2 border-dotted border-[#E5E7EB]"></div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Voice Controls - Mobile only */}
        {mobileState.isMobile && (
          <div className="fixed bottom-0 left-0 right-0 z-40">
            <MobileVoiceControls
              isListening={state.isListening}
              isSpeaking={state.isSpeaking}
              isProcessing={state.isProcessing}
              inputText={state.inputText}
              interimText={state.interimText}
              currentLanguage={state.currentLanguage}
              isSupported={isSpeechRecognitionSupported}
              onMicrophoneToggle={handleMicClick}
              onInputChange={handleInputChange}
              onSend={handleSendClick}
              onSettingsToggle={() => setIsSettingsOpen(!isSettingsOpen)}
              onRetry={retryLastMessage}
              showRetryButton={!!state.error && (
                state.error.includes('Connection issue') || 
                state.error.includes('সংযোগ সমস্যা') ||
                state.error.includes('temporarily unavailable') ||
                state.error.includes('সাময়িকভাবে বন্ধ')
              )}
              enableHapticFeedback={true}
            />
            
            {/* Mobile Settings Panel Overlay */}
            {isSettingsOpen && (
              <div className="absolute bottom-full left-0 right-0 bg-white border-t border-[#E5E7EB] shadow-lg">
                <SettingsPanel
                  voiceSettings={voiceSettings}
                  onVoiceSettingsChange={setVoiceSettings}
                  language={state.currentLanguage}
                  isOpen={isSettingsOpen}
                  onToggle={setIsSettingsOpen}
                  className="w-full"
                />
              </div>
            )}
          </div>
        )}
      </MobileOptimizedContainer>
    </AccessibilityProvider>
  );
};

export default LazyVoiceAIInterface;