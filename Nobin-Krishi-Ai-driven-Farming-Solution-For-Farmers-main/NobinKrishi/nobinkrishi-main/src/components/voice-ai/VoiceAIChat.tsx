import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SpeechRecognitionService } from './services/SpeechRecognitionService';
import { SpeechSynthesisService } from './services/SpeechSynthesisService';
import { DhenuAPIClient } from './services/DhenuAPIClient';
import { getSpeechLanguageCode } from './components/LanguageToggle';
import { useUIStateManager } from './hooks/useUIStateManager';
import { useBrowserCompatibility } from './hooks/useBrowserCompatibility';
import { useDebounce } from './hooks/useDebounce';
import { useRequestQueue } from './hooks/useRequestQueue';
import { useAudioBufferManager } from './hooks/useAudioBufferManager';
import { useLazyVoiceLoading } from './hooks/useLazyVoiceLoading';
import { AdvancedVoiceFeaturesService, VoiceProcessingResult, AdvancedVoiceFeaturesConfig, VoiceCommandResult } from './services';

// Core interfaces for Voice AI Chat System
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  language: 'bn' | 'en';
  audioUrl?: string; // For replay functionality
}

export interface VoiceAIChatProps {
  apiKey: string;
  defaultLanguage?: 'bn' | 'en';
  maxHistoryLength?: number;
  advancedFeatures?: Partial<AdvancedVoiceFeaturesConfig>;
}

export interface VoiceAIChatState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  currentLanguage: 'bn' | 'en';
  messages: ChatMessage[];
  inputText: string;
  interimText: string; // For live transcription display
  error: string | null;
  statusText: string; // For visual feedback
}

export interface VoiceSettings {
  rate: number; // 0.1 to 10
  pitch: number; // 0 to 2
  volume: number; // 0 to 1
  autoSpeak: boolean;
  selectedVoice?: string;
}

// Custom hook for Voice AI Chat functionality with browser compatibility
export const useVoiceAIChat = ({
  apiKey,
  defaultLanguage = 'bn',
  maxHistoryLength = 5,
  advancedFeatures
}: VoiceAIChatProps) => {
  // Browser compatibility hook
  const {
    isReady: isBrowserReady,
    isSpeechRecognitionSupported,
    isSpeechSynthesisSupported,
    isMicrophoneSupported,
    fallbackMode,
    compatibilityIssues,
    isOnline
  } = useBrowserCompatibility();

  // Performance optimization hooks
  const requestQueue = useRequestQueue({
    maxConcurrent: 1, // Only one API request at a time for voice AI
    maxQueueSize: 5,
    defaultPriority: 1,
    defaultMaxRetries: 2,
    retryDelay: 1000
  });

  const audioBufferManager = useAudioBufferManager({
    maxBufferSize: 512 * 1024, // 512KB for voice data
    sampleRate: 16000, // Optimized for speech recognition
    channelCount: 1,
    bufferDuration: 10000 // 10 seconds max
  });

  const lazyVoiceLoading = useLazyVoiceLoading({
    maxCachedVoices: 5,
    preloadPriority: ['bn-BD', 'en-US', 'bn', 'en'],
    cacheTimeout: 300000, // 5 minutes
    loadTimeout: 5000 // 5 seconds
  });

  // Advanced Voice Features Service (Requirements 6.6, 7.6)
  const advancedVoiceFeaturesRef = useRef<AdvancedVoiceFeaturesService | null>(null);
  const [advancedFeaturesReady, setAdvancedFeaturesReady] = useState(false);
  const [voiceProcessingResult, setVoiceProcessingResult] = useState<VoiceProcessingResult | null>(null);
  // State management
  const [state, setState] = useState<VoiceAIChatState>({
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    currentLanguage: defaultLanguage,
    messages: [],
    inputText: '',
    interimText: '',
    error: null,
    statusText: ''
  });

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    rate: 0.9,
    pitch: 1.0,
    volume: 1.0,
    autoSpeak: true
  });

  // Initialize UI State Manager (Requirements 1.2, 2.4, 3.5, 7.3)
  const uiStateManager = useUIStateManager({
    language: state.currentLanguage,
    autoHideDelay: 3000,
    maxHistoryLength: 10
  });

  // Debounced transcription updates for performance optimization (Requirements 7.2)
  const debouncedTranscriptionUpdate = useDebounce((text: string, isFinal: boolean) => {
    if (isFinal) {
      // Final result - update input text and clear interim
      setState(prev => ({
        ...prev,
        inputText: text,
        interimText: '',
        statusText: prev.currentLanguage === 'bn' ? 'সম্পন্ন' : 'Complete'
      }));
      
      // Update UI state for completion
      uiStateManager.updateEnhancedState('speech-complete', { 
        type: 'success', 
        autoHide: true, 
        duration: 2000 
      });
    } else {
      // Interim result - show live transcription with debouncing
      setState(prev => ({
        ...prev,
        interimText: text,
        statusText: prev.currentLanguage === 'bn' ? 'শুনছি...' : 'Listening...'
      }));
      
      // Update UI state for interim results
      uiStateManager.updateEnhancedState('speech-processing', { autoHide: false });
    }
  }, 100, { leading: false, trailing: true }); // 100ms debounce for smooth updates

  // Service instances
  const speechRecognitionRef = useRef<SpeechRecognitionService | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisService | null>(null);
  const apiClientRef = useRef<DhenuAPIClient | null>(null);

  // Initialize services with browser compatibility checks
  useEffect(() => {
    // Wait for browser compatibility detection to complete
    if (!isBrowserReady) {
      return;
    }

    speechRecognitionRef.current = new SpeechRecognitionService();
    speechSynthesisRef.current = new SpeechSynthesisService();
    apiClientRef.current = new DhenuAPIClient(apiKey);

    // Initialize Advanced Voice Features Service (Requirements 6.6, 7.6)
    const initializeAdvancedFeatures = async () => {
      try {
        advancedVoiceFeaturesRef.current = new AdvancedVoiceFeaturesService();
        await advancedVoiceFeaturesRef.current.initialize(advancedFeatures);
        
        // Set up advanced features callbacks
        advancedVoiceFeaturesRef.current.onLanguageDetected((result) => {
          console.log('Language detected:', result);
          
          // Auto-switch language if recommended (Requirements 6.6)
          if (result.confidence > 0.8 && result.detectedLanguage !== state.currentLanguage) {
            const switchMessage = result.detectedLanguage === 'bn' 
              ? `Switching to ${result.detectedLanguage}` 
              : `Switching to ${result.detectedLanguage}`;
            
            updateState({
              currentLanguage: result.detectedLanguage,
              statusText: `Warning: ${switchMessage}`
            });
            
            // Add system message for context
            const languageSwitchMessage: ChatMessage = {
              id: `auto-lang-switch-${Date.now()}`,
              role: 'system',
              content: `Language automatically switched to ${result.detectedLanguage === 'bn' ? 'Bangla' : 'English'} based on detection.`,
              timestamp: new Date(),
              language: result.detectedLanguage
            };
            
            setState(prev => ({
              ...prev,
              messages: [...prev.messages, languageSwitchMessage]
            }));
          }
        });

        advancedVoiceFeaturesRef.current.onVoiceCommand((result) => {
          console.log('Voice command detected:', result);
          handleVoiceCommand(result);
        });

        advancedVoiceFeaturesRef.current.onVoiceActivity((result) => {
          // Handle voice activity detection for better speech recognition timing
          if (result.isVoiceActive && !state.isListening) {
            // Auto-start listening when voice activity detected
            console.log('Voice activity detected, auto-starting listening');
          }
        });

        advancedVoiceFeaturesRef.current.onNoiseAnalysis((analysis) => {
          // Provide feedback on audio quality
          if (analysis.noiseLevel > 0.1) {
            console.warn('High noise level detected:', analysis.noiseLevel);
          }
        });

        setAdvancedFeaturesReady(true);
        console.log('Advanced voice features initialized successfully');
        
      } catch (error) {
        console.warn('Advanced voice features initialization failed:', error);
        // Continue without advanced features
        setAdvancedFeaturesReady(false);
      }
    };

    initializeAdvancedFeatures();

    // Setup speech recognition callbacks
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.onResult((text: string, isFinal: boolean) => {
        // Use debounced transcription updates for performance optimization
        debouncedTranscriptionUpdate(text, isFinal);
      });

      speechRecognitionRef.current.onError((error) => {
        setState(prev => ({
          ...prev,
          isListening: false,
          interimText: '',
          error: error.message,
          statusText: ''
        }));
        
        // Update UI state for error
        uiStateManager.updateState('error', error.message, { 
          type: 'error', 
          autoHide: true, 
          duration: 5000 
        });
      });
    }

    // Setup speech synthesis callbacks for visual feedback (Requirements 3.5)
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.onSpeakingStateChanged((isSpeaking: boolean) => {
        setState(prev => ({
          ...prev,
          isSpeaking,
          statusText: isSpeaking 
            ? (prev.currentLanguage === 'bn' ? 'বলছি...' : 'Speaking...')
            : ''
        }));
        
        // Update UI state for speaking state changes
        if (isSpeaking) {
          uiStateManager.updateEnhancedState('tts-speaking', { autoHide: false });
        } else {
          uiStateManager.updateEnhancedState('tts-complete', { 
            type: 'success', 
            autoHide: true, 
            duration: 2000 
          });
        }
      });

      speechSynthesisRef.current.onSpeechStarted(() => {
        setState(prev => ({
          ...prev,
          statusText: prev.currentLanguage === 'bn' ? 'বলছি...' : 'Speaking...'
        }));
        
        uiStateManager.updateEnhancedState('tts-speaking', { autoHide: false });
      });

      speechSynthesisRef.current.onSpeechEnded(() => {
        setState(prev => ({
          ...prev,
          statusText: ''
        }));
        
        uiStateManager.updateEnhancedState('tts-complete', { 
          type: 'success', 
          autoHide: true, 
          duration: 1500 
        });
      });

      speechSynthesisRef.current.onSpeechErrorOccurred((error: string) => {
        console.error('Speech synthesis error:', error);
        
        // Enhanced speech synthesis error handling (Requirements 6.4)
        let userFriendlyError = error;
        
        if (error.includes('Speech synthesis not supported')) {
          userFriendlyError = state.currentLanguage === 'bn' 
            ? 'বক্তৃতা সংশ্লেষণ সাপোর্ট করা হয় না' 
            : 'Speech synthesis not supported';
        } else if (error.includes('Audio system is busy')) {
          userFriendlyError = state.currentLanguage === 'bn' 
            ? 'অডিও সিস্টেম ব্যস্ত' 
            : 'Audio system is busy';
        } else if (error.includes('Audio hardware error')) {
          userFriendlyError = state.currentLanguage === 'bn' 
            ? 'অডিও হার্ডওয়্যার ত্রুটি' 
            : 'Audio hardware error';
        } else if (error.includes('Voice for selected language unavailable')) {
          userFriendlyError = state.currentLanguage === 'bn' 
            ? 'নির্বাচিত ভাষার জন্য ভয়েস উপলব্ধ নেই' 
            : 'Voice for selected language unavailable';
        } else if (error.includes('Speech synthesis unavailable')) {
          userFriendlyError = state.currentLanguage === 'bn' 
            ? 'বক্তৃতা সংশ্লেষণ উপলব্ধ নেই' 
            : 'Speech synthesis unavailable';
        } else {
          userFriendlyError = state.currentLanguage === 'bn' 
            ? 'বক্তৃতা সংশ্লেষণ ত্রুটি' 
            : 'Speech synthesis error';
        }
        
        setState(prev => ({
          ...prev,
          isSpeaking: false,
          statusText: '',
          error: userFriendlyError
        }));
        
        // Update UI state for speech synthesis error
        uiStateManager.updateState('error', userFriendlyError, { 
          type: 'error', 
          autoHide: true, 
          duration: 5000 
        });
      });
    }

    return () => {
      // Cleanup services
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stopListening();
      }
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.stop();
      }
      // Cleanup advanced features
      if (advancedVoiceFeaturesRef.current) {
        advancedVoiceFeaturesRef.current.shutdown();
      }
      // Cancel any pending debounced calls
      if (debouncedTranscriptionUpdate.cancel) {
        debouncedTranscriptionUpdate.cancel();
      }
    };
  }, [apiKey, isBrowserReady, debouncedTranscriptionUpdate, advancedFeatures]); // Add advancedFeatures dependency

  // Update state helper with UI state management integration
  const updateState = useCallback((updates: Partial<VoiceAIChatState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      
      // Update UI state manager based on state changes (Requirements 1.2, 2.4, 3.5, 7.3)
      if (updates.isListening !== undefined) {
        if (updates.isListening) {
          uiStateManager.updateEnhancedState('speech-listening', { autoHide: false });
        } else {
          uiStateManager.updateEnhancedState('speech-complete', { autoHide: true, duration: 2000 });
        }
      }
      
      if (updates.isProcessing !== undefined) {
        if (updates.isProcessing) {
          uiStateManager.updateEnhancedState('api-thinking', { autoHide: false });
        } else {
          uiStateManager.updateEnhancedState('api-complete', { autoHide: true, duration: 2000 });
        }
      }
      
      if (updates.isSpeaking !== undefined) {
        if (updates.isSpeaking) {
          uiStateManager.updateEnhancedState('tts-speaking', { autoHide: false });
        } else {
          uiStateManager.updateEnhancedState('tts-complete', { autoHide: true, duration: 2000 });
        }
      }
      
      if (updates.error) {
        uiStateManager.updateState('error', updates.error, { 
          type: 'error', 
          autoHide: true, 
          duration: 5000 
        });
      }
      
      // Update status text based on enhanced state messages
      if (updates.statusText) {
        const statusKey = updates.statusText.toLowerCase().includes('listening') ? 'speech-listening' :
                         updates.statusText.toLowerCase().includes('thinking') ? 'api-thinking' :
                         updates.statusText.toLowerCase().includes('speaking') ? 'tts-speaking' :
                         updates.statusText.toLowerCase().includes('processing') ? 'processing-start' :
                         'idle';
        
        uiStateManager.updateEnhancedState(statusKey as any, { autoHide: false });
      }
      
      return newState;
    });
  }, [uiStateManager]);

  // Toggle language with context preservation (Requirements 5.4)
  const toggleLanguage = useCallback(() => {
    const newLanguage = state.currentLanguage === 'bn' ? 'en' : 'bn';
    
    // Preserve conversation context when switching languages
    // Add a system message to indicate language switch for better AI understanding
    const languageSwitchMessage: ChatMessage = {
      id: `lang-switch-${Date.now()}`,
      role: 'system',
      content: `Language switched to ${newLanguage === 'bn' ? 'Bangla' : 'English'}. Please respond in ${newLanguage === 'bn' ? 'Bangla' : 'English'} from now on.`,
      timestamp: new Date(),
      language: newLanguage
    };

    // Update language and add context preservation message
    updateState({ 
      currentLanguage: newLanguage,
      messages: [...state.messages, languageSwitchMessage]
    });
  }, [state.currentLanguage, state.messages, updateState]);

  // Clear conversation with enhanced functionality (Requirements 5.3)
  const clearConversation = useCallback(() => {
    updateState({ 
      messages: [], 
      error: null,
      inputText: '',
      interimText: '',
      statusText: ''
    });
  }, [updateState]);

  // Speech control methods (Requirements 3.6)
  const stopSpeech = useCallback(() => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.stop();
    }
  }, []);

  const replaySpeech = useCallback(async () => {
    if (speechSynthesisRef.current) {
      try {
        await speechSynthesisRef.current.replay();
      } catch (error) {
        console.error('Replay failed:', error);
      }
    }
  }, []);

  // Handle voice commands (Requirements 6.6, 7.6)
  const handleVoiceCommand = useCallback((commandResult: VoiceCommandResult) => {
    const { command, parameters } = commandResult;
    
    switch (command.action) {
      case 'switch_language': {
        const newLang = parameters.param0 || (state.currentLanguage === 'bn' ? 'en' : 'bn');
        toggleLanguage();
        break;
      }
        
      case 'stop_speech':
        stopSpeech();
        break;
        
      case 'replay_speech':
        replaySpeech();
        break;
        
      case 'clear_conversation':
        clearConversation();
        break;
        
      case 'show_help': {
        const helpText = advancedVoiceFeaturesRef.current?.voiceCommandService?.getHelpText(state.currentLanguage) || 
          (state.currentLanguage === 'bn' ? 'সাহায্য উপলব্ধ নেই' : 'Help not available');
        
        const helpMessage: ChatMessage = {
          id: `help-${Date.now()}`,
          role: 'assistant',
          content: helpText,
          timestamp: new Date(),
          language: state.currentLanguage
        };
        
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, helpMessage]
        }));
        break;
      }
        
      case 'adjust_speech_rate': {
        const adjustment = parameters.param0;
        const currentRate = voiceSettings.rate;
        const newRate = adjustment === 'increase' 
          ? Math.min(2.0, currentRate + 0.2)
          : Math.max(0.5, currentRate - 0.2);
        
        setVoiceSettings(prev => ({ ...prev, rate: newRate }));
        
        const rateMessage = state.currentLanguage === 'bn' 
          ? `বক্তৃতার গতি ${adjustment === 'increase' ? 'বাড়ানো' : 'কমানো'} হয়েছে`
          : `Speech rate ${adjustment === 'increase' ? 'increased' : 'decreased'}`;
        
        updateState({ statusText: rateMessage });
        break;
      }
        
      case 'adjust_volume': {
        const volumeAdjustment = parameters.param0;
        const currentVolume = voiceSettings.volume;
        const newVolume = volumeAdjustment === 'increase' 
          ? Math.min(1.0, currentVolume + 0.1)
          : Math.max(0.1, currentVolume - 0.1);
        
        setVoiceSettings(prev => ({ ...prev, volume: newVolume }));
        
        const volumeMessage = state.currentLanguage === 'bn' 
          ? `আওয়াজ ${volumeAdjustment === 'increase' ? 'বাড়ানো' : 'কমানো'} হয়েছে`
          : `Volume ${volumeAdjustment === 'increase' ? 'increased' : 'decreased'}`;
        
        updateState({ statusText: volumeMessage });
        break;
      }
        
      default:
        console.log('Unknown voice command:', command.action);
    }
  }, [state.currentLanguage, voiceSettings, toggleLanguage, stopSpeech, replaySpeech, clearConversation, updateState, setVoiceSettings]);

  // Start listening for voice input with enhanced error handling and browser compatibility
  const startListening = useCallback(async () => {
    // Check browser compatibility first
    if (!isBrowserReady) {
      const errorMessage = state.currentLanguage === 'bn' 
        ? 'ব্রাউজার ক্ষমতা পরীক্ষা করা হচ্ছে...' 
        : 'Checking browser capabilities...';
      
      updateState({ error: errorMessage });
      return;
    }

    if (!isSpeechRecognitionSupported || !isMicrophoneSupported) {
      const errorMessage = state.currentLanguage === 'bn' 
        ? 'ভয়েস ইনপুট সাপোর্ট করা হয় না, অনুগ্রহ করে আপনার বার্তা টাইপ করুন' 
        : 'Voice input not supported, please type your message';
      
      updateState({ error: errorMessage });
      uiStateManager.updateEnhancedState('error-speech-not-supported', { 
        type: 'error', 
        autoHide: true, 
        duration: 5000 
      });
      return;
    }

    if (!isOnline) {
      const errorMessage = state.currentLanguage === 'bn' 
        ? 'ইন্টারনেট সংযোগ নেই' 
        : 'No internet connection';
      
      updateState({ error: errorMessage });
      uiStateManager.updateEnhancedState('error-network', { 
        type: 'error', 
        autoHide: true, 
        duration: 5000 
      });
      return;
    }

    if (!speechRecognitionRef.current) {
      const errorMessage = state.currentLanguage === 'bn' 
        ? 'ভয়েস ইনপুট সাপোর্ট করা হয় না, অনুগ্রহ করে আপনার বার্তা টাইপ করুন' 
        : 'Voice input not supported, please type your message';
      
      updateState({ error: errorMessage });
      uiStateManager.updateEnhancedState('error-speech-not-supported', { 
        type: 'error', 
        autoHide: true, 
        duration: 5000 
      });
      return;
    }

    try {
      // Show starting state with progress
      uiStateManager.updateEnhancedState('speech-starting', { 
        progress: 0, 
        autoHide: false 
      });
      
      updateState({ 
        isListening: true, 
        error: null, 
        interimText: '',
        statusText: state.currentLanguage === 'bn' ? 'শুরু হচ্ছে...' : 'Starting...'
      });
      
      // Use the helper function to get the correct language code
      const languageCode = getSpeechLanguageCode(state.currentLanguage);
      await speechRecognitionRef.current.startListening(languageCode);
      
      // Update to active listening state
      uiStateManager.updateEnhancedState('speech-listening', { 
        progress: 50, 
        autoHide: false 
      });
      
      updateState({ 
        statusText: state.currentLanguage === 'bn' ? 'শুনছি...' : 'Listening...'
      });
      
    } catch (error) {
      console.error('Speech recognition error:', error);
      
      let errorMessage = 'Speech recognition failed';
      let enhancedErrorKey: keyof typeof import('./hooks/useUIStateManager').ENHANCED_MESSAGES['bn'] = 'error-speech-not-supported';
      
      if (error instanceof Error) {
        // Handle specific speech recognition errors
        if (error.message.includes('Please allow microphone access')) {
          errorMessage = state.currentLanguage === 'bn' 
            ? 'অনুগ্রহ করে মাইক্রোফোন অ্যাক্সেসের অনুমতি দিন' 
            : 'Please allow microphone access';
          enhancedErrorKey = 'error-microphone';
        } else if (error.message.includes('No speech detected')) {
          errorMessage = state.currentLanguage === 'bn' 
            ? 'কোনো কথা শোনা যায়নি, অনুগ্রহ করে আবার চেষ্টা করুন' 
            : 'No speech detected, please try again';
          enhancedErrorKey = 'speech-no-input';
        } else if (error.message.includes('Microphone not available')) {
          errorMessage = state.currentLanguage === 'bn' 
            ? 'মাইক্রোফোন উপলব্ধ নেই' 
            : 'Microphone not available';
          enhancedErrorKey = 'error-microphone';
        } else if (error.message.includes('Connection issue')) {
          errorMessage = state.currentLanguage === 'bn' 
            ? 'সংযোগ সমস্যা, অনুগ্রহ করে ইন্টারনেট চেক করুন' 
            : 'Connection issue, please check internet';
          enhancedErrorKey = 'error-network';
        } else if (error.message.includes('Speech recognition not supported')) {
          errorMessage = state.currentLanguage === 'bn' 
            ? 'ভয়েস ইনপুট সাপোর্ট করা হয় না, অনুগ্রহ করে আপনার বার্তা টাইপ করুন' 
            : 'Voice input not supported, please type your message';
          enhancedErrorKey = 'error-speech-not-supported';
        } else {
          errorMessage = state.currentLanguage === 'bn' 
            ? 'ভয়েস রিকগনিশন ত্রুটি ঘটেছে' 
            : 'Speech recognition error occurred';
          enhancedErrorKey = 'error-speech-not-supported';
        }
      }
      
      updateState({ 
        isListening: false, 
        interimText: '',
        statusText: '',
        error: errorMessage
      });
      
      // Update UI state for error
      uiStateManager.updateEnhancedState(enhancedErrorKey as any, { 
        type: 'error', 
        autoHide: true, 
        duration: 5000 
      });
    }
  }, [state.currentLanguage, updateState, uiStateManager, isBrowserReady, isSpeechRecognitionSupported, isMicrophoneSupported, isOnline]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stopListening();
      updateState({ 
        isListening: false, 
        interimText: '',
        statusText: ''
      });
    }
  }, [updateState]);

  // Send message to AI with enhanced error handling and retry functionality
  const sendMessage = useCallback(async (text: string, retryCount = 0) => {
    // Input validation and empty input handling (Requirements 6.6)
    if (!text.trim()) {
      updateState({
        error: state.currentLanguage === 'bn' 
          ? 'দয়া করে আপনার প্রশ্ন বলুন বা টাইপ করুন' 
          : 'Please speak or type your question'
      });
      return;
    }

    if (!apiClientRef.current) {
      updateState({
        error: state.currentLanguage === 'bn' 
          ? 'API ক্লায়েন্ট উপলব্ধ নেই' 
          : 'API client not available'
      });
      return;
    }

    // Network connectivity check (Requirements 6.5)
    if (!navigator.onLine) {
      updateState({
        error: state.currentLanguage === 'bn' 
          ? 'ইন্টারনেট সংযোগ নেই। অনুগ্রহ করে আপনার সংযোগ চেক করুন।' 
          : 'No internet connection. Please check your connection.'
      });
      return;
    }

    // Process with advanced voice features if available (Requirements 6.6, 7.6)
    let processedText = text.trim();
    let detectedLanguage = state.currentLanguage;
    
    if (advancedFeaturesReady && advancedVoiceFeaturesRef.current) {
      try {
        const processingResult = await advancedVoiceFeaturesRef.current.processVoiceInput(
          text, 
          undefined, // Audio data would be provided if available
          state.currentLanguage
        );
        
        setVoiceProcessingResult(processingResult);
        processedText = processingResult.processedText;
        detectedLanguage = processingResult.detectedLanguage;
        
        // Handle voice commands if detected
        if (processingResult.voiceCommand) {
          handleVoiceCommand(processingResult.voiceCommand);
          return; // Don't send to API if it was a command
        }
        
        // Show recommendations if any
        if (processingResult.recommendations.length > 0) {
          console.log('Voice processing recommendations:', processingResult.recommendations);
        }
        
        // Handle language detection conflicts (Requirements 6.6)
        if (detectedLanguage !== state.currentLanguage && processingResult.languageConfidence > 0.8) {
          const switchWarning = state.currentLanguage === 'bn' 
            ? `Switching to ${detectedLanguage}` 
            : `Switching to ${detectedLanguage}`;
          
          updateState({
            currentLanguage: detectedLanguage,
            statusText: `Warning: ${switchWarning}`
          });
          
          // Add system message for language switch
          const languageSwitchMessage: ChatMessage = {
            id: `lang-detect-switch-${Date.now()}`,
            role: 'system',
            content: `Language detection conflict resolved. Switched to ${detectedLanguage === 'bn' ? 'Bangla' : 'English'}.`,
            timestamp: new Date(),
            language: detectedLanguage
          };
          
          setState(prev => ({
            ...prev,
            messages: [...prev.messages, languageSwitchMessage]
          }));
        }
        
      } catch (error) {
        console.warn('Advanced voice processing failed:', error);
        // Continue with basic processing
      }
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: processedText,
      timestamp: new Date(),
      language: detectedLanguage
    };

    // Add user message and start processing with enhanced loading feedback
    updateState({
      messages: [...state.messages, userMessage],
      inputText: '',
      isProcessing: true,
      error: null,
      statusText: state.currentLanguage === 'bn' ? 'AI চিন্তা করছে...' : 'AI is thinking...'
    });
    
    // Enhanced UI feedback for API processing with progress
    uiStateManager.updateEnhancedState('api-connecting', { 
      progress: 10, 
      autoHide: false 
    });

    try {
      // Use request queue for API calls to prevent overwhelming the server
      const response = await requestQueue.enqueue(async () => {
        // Show API thinking state
        uiStateManager.updateEnhancedState('api-thinking', { 
          progress: 30, 
          autoHide: false 
        });
        
        // Enhanced conversation context management (Requirements 5.1, 5.2, 5.5)
        const allMessages = [...state.messages, userMessage];
        
        // Automatic context window management - keep last maxHistoryLength messages
        // Filter out system messages for language switching from context count
        const conversationMessages = allMessages.filter(msg => msg.role !== 'system' || !msg.content.includes('Language switched'));
        const contextMessages = conversationMessages
          .slice(-maxHistoryLength)
          .map(msg => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content
          }));

        // Add language context if recent language switch occurred
        const recentLanguageSwitch = allMessages
          .slice(-3) // Check last 3 messages
          .find(msg => msg.role === 'system' && msg.content.includes('Language switched'));
        
        if (recentLanguageSwitch) {
          contextMessages.unshift({
            role: 'system',
            content: recentLanguageSwitch.content
          });
        }

        // Show generating response state
        uiStateManager.updateEnhancedState('api-generating', { 
          progress: 60, 
          autoHide: false 
        });

        // Send to API with proper request formatting
        return await apiClientRef.current!.sendMessage(contextMessages, {
          model: 'dhenu2-in-8b-preview',
          temperature: 0.7,
          maxTokens: 500
        });
      }, {
        priority: 2, // High priority for user messages
        maxRetries: 2,
        id: `api_request_${userMessage.id}`
      });

      // Show completion progress
      uiStateManager.updateEnhancedState('api-complete', { 
        progress: 100, 
        type: 'success',
        autoHide: true, 
        duration: 2000 
      });

      // Validate response
      if (!response || response.trim() === '') {
        throw new Error(state.currentLanguage === 'bn' 
          ? 'AI থেকে কোনো উত্তর পাওয়া যায়নি' 
          : 'No response from AI service');
      }

      // Create AI response message
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        language: state.currentLanguage
      };

      // Add AI message and manage conversation history (Requirements 5.1)
      const updatedMessages = [...state.messages, userMessage, aiMessage];
      
      // Automatic context window management - keep conversation within limits
      // Keep system messages for language switching but limit conversation messages
      const systemMessages = updatedMessages.filter(msg => msg.role === 'system');
      const allConversationMessages = updatedMessages.filter(msg => msg.role !== 'system');
      
      // Keep only the most recent conversation messages within maxHistoryLength
      // Ensure we maintain user-AI message pairs when possible
      let trimmedConversationMessages: ChatMessage[];
      
      if (maxHistoryLength >= 2) {
        // For maxHistoryLength >= 2, try to keep complete user-AI pairs
        const pairs = Math.floor(maxHistoryLength / 2);
        const remainder = maxHistoryLength % 2;
        
        // Take the last 'pairs' complete user-AI pairs
        const messagePairs = [];
        for (let i = allConversationMessages.length - 2; i >= 0 && messagePairs.length < pairs * 2; i -= 2) {
          if (i >= 0 && allConversationMessages[i].role === 'user' && 
              i + 1 < allConversationMessages.length && allConversationMessages[i + 1].role === 'assistant') {
            messagePairs.unshift(allConversationMessages[i], allConversationMessages[i + 1]);
          }
        }
        
        // If we have remainder space and there are more messages, add the most recent one
        if (remainder > 0 && messagePairs.length < maxHistoryLength && allConversationMessages.length > messagePairs.length) {
          const lastMessage = allConversationMessages[allConversationMessages.length - 1];
          if (!messagePairs.includes(lastMessage)) {
            messagePairs.push(lastMessage);
          }
        }
        
        trimmedConversationMessages = messagePairs.slice(-maxHistoryLength);
      } else {
        // For maxHistoryLength = 1, just take the most recent message
        trimmedConversationMessages = allConversationMessages.slice(-maxHistoryLength);
      }
      
      // Combine system messages with trimmed conversation, keeping recent system messages
      const recentSystemMessages = systemMessages.slice(-2); // Keep last 2 system messages
      const finalMessages = [...recentSystemMessages, ...trimmedConversationMessages]
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // Sort by timestamp

      updateState({
        messages: finalMessages,
        isProcessing: false,
        statusText: ''
      });

      // Auto-speak if enabled with enhanced error handling and browser compatibility
      if (voiceSettings.autoSpeak && speechSynthesisRef.current && isSpeechSynthesisSupported) {
        try {
          // Show TTS preparation state
          uiStateManager.updateEnhancedState('tts-preparing', { 
            progress: 0, 
            autoHide: false 
          });
          
          updateState({ 
            isSpeaking: true,
            statusText: state.currentLanguage === 'bn' ? 'বলছি...' : 'Speaking...'
          });
          
          // Use lazy voice loading for optimal performance
          const voice = await lazyVoiceLoading.getBestVoiceForLanguage(
            getSpeechLanguageCode(state.currentLanguage)
          );
          
          // Show active speaking state
          uiStateManager.updateEnhancedState('tts-speaking', { 
            progress: 50, 
            autoHide: false 
          });
          
          await speechSynthesisRef.current.speak(response, getSpeechLanguageCode(state.currentLanguage), {
            rate: voiceSettings.rate,
            pitch: voiceSettings.pitch,
            volume: voiceSettings.volume
          });
          
          // Show completion
          uiStateManager.updateEnhancedState('tts-complete', { 
            progress: 100, 
            type: 'success',
            autoHide: true, 
            duration: 2000 
          });
        } catch (speechError) {
          console.error('Speech synthesis failed:', speechError);
          
          // Enhanced speech error handling with UI feedback
          let speechErrorMessage = 'Speech synthesis error';
          if (speechError instanceof Error && speechError.message.includes('not supported')) {
            speechErrorMessage = state.currentLanguage === 'bn' 
              ? 'বক্তৃতা সংশ্লেষণ উপলব্ধ নেই' 
              : 'Speech synthesis unavailable';
          }
          
          updateState({
            error: speechErrorMessage
          });
          
          uiStateManager.updateState('error', speechErrorMessage, { 
            type: 'error', 
            autoHide: true, 
            duration: 4000 
          });
        } finally {
          updateState({ 
            isSpeaking: false,
            statusText: ''
          });
        }
      }

    } catch (error) {
      console.error('API Error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Enhanced error handling with user-friendly messages (Requirements 2.7, 6.2, 6.3, 6.4, 6.5)
      let userFriendlyError = errorMessage;
      
      if (errorMessage.includes('Invalid API key')) {
        userFriendlyError = state.currentLanguage === 'bn' 
          ? 'API কী সমস্যা। অনুগ্রহ করে পরে চেষ্টা করুন।' 
          : 'API authentication issue. Please try again later.';
      } else if (errorMessage.includes('Rate limit')) {
        userFriendlyError = state.currentLanguage === 'bn' 
          ? 'অনেক অনুরোধ। কিছুক্ষণ পর চেষ্টা করুন।' 
          : 'Too many requests. Please try again in a moment.';
      } else if (errorMessage.includes('Connection issue') || errorMessage.includes('NetworkError') || errorMessage.includes('Failed to fetch')) {
        userFriendlyError = state.currentLanguage === 'bn' 
          ? 'ইন্টারনেট সংযোগ সমস্যা। অনুগ্রহ করে আপনার ইন্টারনেট চেক করুন।' 
          : 'Connection issue, please check internet';
      } else if (errorMessage.includes('temporarily unavailable') || errorMessage.includes('AI service temporarily unavailable')) {
        userFriendlyError = state.currentLanguage === 'bn' 
          ? 'AI সেবা সাময়িকভাবে বন্ধ। পরে চেষ্টা করুন।' 
          : 'AI service temporarily unavailable. Please try again.';
      } else if (errorMessage.includes('Request timeout') || errorMessage.includes('timeout')) {
        userFriendlyError = state.currentLanguage === 'bn' 
          ? 'অনুরোধ সময়সীমা শেষ। অনুগ্রহ করে আবার চেষ্টা করুন।' 
          : 'Request timeout. Please try again.';
      } else if (errorMessage.includes('Please speak or type your question')) {
        userFriendlyError = state.currentLanguage === 'bn' 
          ? 'দয়া করে আপনার প্রশ্ন বলুন বা টাইপ করুন' 
          : 'Please speak or type your question';
      } else {
        userFriendlyError = state.currentLanguage === 'bn' 
          ? 'সংযোগ সমস্যা, অনুগ্রহ করে আবার চেষ্টা করুন' 
          : 'Connection issue, please try again';
      }
      
      updateState({
        isProcessing: false,
        statusText: '',
        error: userFriendlyError
      });
      
      // Enhanced UI feedback for different error types
      let errorType: keyof typeof import('./hooks/useUIStateManager').ENHANCED_MESSAGES['bn'] = 'error-api-failed';
      
      if (userFriendlyError.includes('API authentication') || userFriendlyError.includes('API কী')) {
        errorType = 'error-api-failed';
      } else if (userFriendlyError.includes('Connection issue') || userFriendlyError.includes('ইন্টারনেট সংযোগ')) {
        errorType = 'error-network';
      } else if (userFriendlyError.includes('Rate limit') || userFriendlyError.includes('অনেক অনুরোধ')) {
        errorType = 'error-api-failed';
      } else {
        errorType = 'error-api-failed';
      }
      
      uiStateManager.updateEnhancedState(errorType as any, { 
        type: 'error', 
        autoHide: true, 
        duration: 6000 
      });
    }
  }, [state.messages, state.currentLanguage, maxHistoryLength, voiceSettings, updateState, requestQueue, lazyVoiceLoading]);

  // Speak text using TTS with browser compatibility checks and lazy voice loading
  const speakText = useCallback(async (text: string, language: 'bn' | 'en') => {
    if (!isSpeechSynthesisSupported || !speechSynthesisRef.current) {
      console.warn('Speech synthesis not supported or available');
      return;
    }

    try {
      updateState({ isSpeaking: true });
      
      // Use lazy voice loading for optimal performance
      const voice = await lazyVoiceLoading.getBestVoiceForLanguage(
        getSpeechLanguageCode(language)
      );
      
      await speechSynthesisRef.current.speak(text, getSpeechLanguageCode(language), {
        rate: voiceSettings.rate,
        pitch: voiceSettings.pitch,
        volume: voiceSettings.volume
      });
    } catch (error) {
      console.error('Speech synthesis failed:', error);
    } finally {
      updateState({ isSpeaking: false });
    }
  }, [voiceSettings, updateState, isSpeechSynthesisSupported, lazyVoiceLoading]);

  // Handle input change
  const handleInputChange = useCallback((value: string) => {
    updateState({ inputText: value });
  }, [updateState]);

  // Handle send button click
  const handleSend = useCallback(() => {
    if (state.inputText.trim()) {
      sendMessage(state.inputText);
    }
  }, [state.inputText, sendMessage]);

  // Retry last failed message
  const retryLastMessage = useCallback(() => {
    const lastUserMessage = state.messages
      .slice()
      .reverse()
      .find(msg => msg.role === 'user');
    
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content);
    }
  }, [state.messages, sendMessage]);

  // Toggle microphone
  const toggleMicrophone = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  // Speech control methods (Requirements 3.6)
  const pauseSpeech = useCallback(() => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.pause();
    }
  }, []);

  const resumeSpeech = useCallback(() => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.resume();
    }
  }, []);

  // Replay specific message (for chat interface) with browser compatibility and lazy voice loading
  const replayMessage = useCallback(async (text: string, language: 'bn' | 'en') => {
    if (!speechSynthesisRef.current || !isSpeechSynthesisSupported) {
      const errorMessage = language === 'bn' 
        ? 'বক্তৃতা সংশ্লেষণ উপলব্ধ নেই' 
        : 'Speech synthesis not available';
      
      updateState({ error: errorMessage });
      return;
    }

    if (speechSynthesisRef.current) {
      try {
        updateState({ 
          isSpeaking: true,
          statusText: language === 'bn' ? 'বলছি...' : 'Speaking...'
        });
        
        // Use lazy voice loading for optimal performance
        const voice = await lazyVoiceLoading.getBestVoiceForLanguage(
          getSpeechLanguageCode(language)
        );
        
        await speechSynthesisRef.current.speak(text, getSpeechLanguageCode(language), {
          rate: voiceSettings.rate,
          pitch: voiceSettings.pitch,
          volume: voiceSettings.volume
        });
      } catch (error) {
        console.error('Message replay failed:', error);
        updateState({
          error: language === 'bn' 
            ? 'বার্তা পুনরায় চালানো ব্যর্থ হয়েছে' 
            : 'Message replay failed'
        });
      } finally {
        updateState({ 
          isSpeaking: false,
          statusText: ''
        });
      }
    }
  }, [voiceSettings, updateState, isSpeechSynthesisSupported, lazyVoiceLoading]);

  // Get speech synthesis state
  const getSpeechState = useCallback(() => {
    if (speechSynthesisRef.current) {
      return {
        isSpeaking: speechSynthesisRef.current.isSpeaking(),
        isPaused: speechSynthesisRef.current.isPausedState(),
        currentSpeech: speechSynthesisRef.current.getCurrentSpeechInfo()
      };
    }
    return {
      isSpeaking: false,
      isPaused: false,
      currentSpeech: null
    };
  }, []);

  // Get conversation statistics for debugging and user feedback
  const getConversationStats = useCallback(() => {
    const totalMessages = state.messages.length;
    const userMessages = state.messages.filter(msg => msg.role === 'user').length;
    const aiMessages = state.messages.filter(msg => msg.role === 'assistant').length;
    const systemMessages = state.messages.filter(msg => msg.role === 'system').length;
    
    return {
      total: totalMessages,
      user: userMessages,
      ai: aiMessages,
      system: systemMessages,
      inMemory: Math.min(maxHistoryLength, totalMessages - systemMessages)
    };
  }, [state.messages, maxHistoryLength]);

  // Get conversation context for API calls (used internally)
  const getConversationContext = useCallback(() => {
    const conversationMessages = state.messages.filter(msg => msg.role !== 'system' || !msg.content.includes('Language switched'));
    return conversationMessages.slice(-maxHistoryLength);
  }, [state.messages, maxHistoryLength]);

  // Check if conversation needs context management
  const needsContextManagement = useCallback(() => {
    const conversationMessages = state.messages.filter(msg => msg.role !== 'system');
    return conversationMessages.length > maxHistoryLength;
  }, [state.messages, maxHistoryLength]);

  return {
    // State
    state,
    voiceSettings,
    
    // UI State Management (Requirements 1.2, 2.4, 3.5, 7.3)
    uiState: uiStateManager.currentState,
    isUIStateVisible: uiStateManager.isVisible,
    uiStateHistory: uiStateManager.stateHistory,
    updateUIState: uiStateManager.updateState,
    updateEnhancedUIState: uiStateManager.updateEnhancedState,
    clearUIState: uiStateManager.clearState,
    showUIState: uiStateManager.showState,
    hideUIState: uiStateManager.hideState,
    
    // Actions
    startListening,
    stopListening,
    sendMessage,
    speakText,
    toggleLanguage,
    clearConversation,
    handleInputChange,
    handleSend,
    toggleMicrophone,
    retryLastMessage,
    
    // Speech controls (Requirements 3.6)
    pauseSpeech,
    resumeSpeech,
    stopSpeech,
    replaySpeech,
    replayMessage,
    getSpeechState,
    
    // Conversation memory utilities (Requirements 5.1, 5.2, 5.5)
    getConversationStats,
    getConversationContext,
    needsContextManagement,
    
    // Settings
    setVoiceSettings,
    
    // Service availability with browser compatibility
    isSpeechRecognitionSupported: isSpeechRecognitionSupported,
    isSpeechSynthesisSupported: isSpeechSynthesisSupported,
    isMicrophoneSupported: isMicrophoneSupported,
    
    // Browser compatibility information
    isBrowserReady,
    fallbackMode,
    compatibilityIssues,
    isOnline,
    
    // Performance optimization information
    requestQueueState: requestQueue.state,
    audioBufferState: audioBufferManager.state,
    lazyVoiceState: lazyVoiceLoading.state,
    
    // Advanced Voice Features (Requirements 6.6, 7.6)
    advancedFeaturesReady,
    voiceProcessingResult,
    advancedFeaturesService: advancedVoiceFeaturesRef.current,
    
    // Advanced feature controls
    startVoiceActivityDetection: useCallback(async () => {
      if (advancedVoiceFeaturesRef.current) {
        try {
          await advancedVoiceFeaturesRef.current.startVoiceActivityDetection();
        } catch (error) {
          console.error('Failed to start voice activity detection:', error);
        }
      }
    }, []),
    
    stopVoiceActivityDetection: useCallback(() => {
      if (advancedVoiceFeaturesRef.current) {
        advancedVoiceFeaturesRef.current.stopVoiceActivityDetection();
      }
    }, []),
    
    startNoiseReduction: useCallback(async () => {
      if (advancedVoiceFeaturesRef.current) {
        try {
          await advancedVoiceFeaturesRef.current.startNoiseReduction();
        } catch (error) {
          console.error('Failed to start noise reduction:', error);
        }
      }
    }, []),
    
    stopNoiseReduction: useCallback(() => {
      if (advancedVoiceFeaturesRef.current) {
        advancedVoiceFeaturesRef.current.stopNoiseReduction();
      }
    }, []),
    
    createVoiceProfile: useCallback(async (name: string, language: 'bn' | 'en') => {
      if (advancedVoiceFeaturesRef.current) {
        try {
          return await advancedVoiceFeaturesRef.current.createVoiceProfile(name, language);
        } catch (error) {
          console.error('Failed to create voice profile:', error);
          return null;
        }
      }
      return null;
    }, []),
    
    startVoiceCalibration: useCallback(async (profileId: string) => {
      if (advancedVoiceFeaturesRef.current) {
        try {
          return await advancedVoiceFeaturesRef.current.startCalibration(profileId);
        } catch (error) {
          console.error('Failed to start voice calibration:', error);
          return null;
        }
      }
      return null;
    }, []),
    
    getAdvancedFeatureStats: useCallback(() => {
      if (advancedVoiceFeaturesRef.current) {
        return advancedVoiceFeaturesRef.current.getStats();
      }
      return null;
    }, []),
    
    getVoiceRecommendations: useCallback(() => {
      if (advancedVoiceFeaturesRef.current) {
        return advancedVoiceFeaturesRef.current.getRecommendations();
      }
      return [];
    }, [])
  };
};

// Simple wrapper component that provides the hook functionality
const VoiceAIChat: React.FC<VoiceAIChatProps & { children: (hookResult: ReturnType<typeof useVoiceAIChat>) => React.ReactNode }> = ({
  children,
  ...props
}) => {
  const hookResult = useVoiceAIChat(props);
  return <>{children(hookResult)}</>;
};

export default VoiceAIChat;