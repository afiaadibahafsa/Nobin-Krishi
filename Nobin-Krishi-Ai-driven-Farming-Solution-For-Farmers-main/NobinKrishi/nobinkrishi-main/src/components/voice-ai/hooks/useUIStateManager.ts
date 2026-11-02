import { useState, useCallback, useRef, useEffect } from 'react';

// UI State Types
export type UIState = 
  | 'idle'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'error'
  | 'loading'
  | 'success'
  | 'warning';

export type UIFeedbackType = 
  | 'status'
  | 'progress'
  | 'error'
  | 'success'
  | 'warning'
  | 'info';

export interface UIStateInfo {
  state: UIState;
  message: string;
  progress?: number; // 0-100 for progress indicators
  type: UIFeedbackType;
  timestamp: number;
  autoHide?: boolean;
  duration?: number; // milliseconds
}

export interface UIStateManagerOptions {
  language: 'bn' | 'en';
  autoHideDelay?: number;
  maxHistoryLength?: number;
}

// Predefined state messages for different languages
const STATE_MESSAGES = {
  bn: {
    idle: 'প্রস্তুত',
    listening: 'শুনছি...',
    processing: 'প্রক্রিয়াকরণ...',
    speaking: 'বলছি...',
    error: 'ত্রুটি ঘটেছে',
    loading: 'লোড হচ্ছে...',
    success: 'সফল',
    warning: 'সতর্কতা'
  },
  en: {
    idle: 'Ready',
    listening: 'Listening...',
    processing: 'Processing...',
    speaking: 'Speaking...',
    error: 'Error occurred',
    loading: 'Loading...',
    success: 'Success',
    warning: 'Warning'
  }
};

// Enhanced status messages for specific scenarios
const ENHANCED_MESSAGES = {
  bn: {
    // Speech Recognition States
    'speech-starting': 'শুরু হচ্ছে...',
    'speech-listening': 'শুনছি... কথা বলুন',
    'speech-processing': 'আপনার কথা বুঝছি...',
    'speech-complete': 'সম্পন্ন',
    'speech-timeout': 'সময় শেষ - আবার চেষ্টা করুন',
    'speech-no-input': 'কোনো কথা শোনা যায়নি',
    
    // API Processing States
    'api-connecting': 'AI এর সাথে সংযোগ করছি...',
    'api-thinking': 'AI চিন্তা করছে...',
    'api-generating': 'উত্তর তৈরি করছি...',
    'api-complete': 'উত্তর প্রস্তুত',
    'api-retry': 'পুনরায় চেষ্টা করছি...',
    
    // Speech Synthesis States
    'tts-preparing': 'বক্তৃতা প্রস্তুত করছি...',
    'tts-speaking': 'বলছি...',
    'tts-paused': 'বিরতি',
    'tts-complete': 'বক্তৃতা সম্পন্ন',
    
    // Network States
    'network-checking': 'সংযোগ পরীক্ষা করছি...',
    'network-offline': 'ইন্টারনেট সংযোগ নেই',
    'network-reconnecting': 'পুনরায় সংযোগ করছি...',
    'network-connected': 'সংযুক্ত',
    
    // Error States
    'error-microphone': 'মাইক্রোফোন অ্যাক্সেস প্রয়োজন',
    'error-speech-not-supported': 'ভয়েস সাপোর্ট নেই',
    'error-api-failed': 'AI সেবা সমস্যা',
    'error-network': 'সংযোগ সমস্যা'
  },
  en: {
    // Speech Recognition States
    'speech-starting': 'Starting...',
    'speech-listening': 'Listening... Please speak',
    'speech-processing': 'Understanding your speech...',
    'speech-complete': 'Complete',
    'speech-timeout': 'Timeout - Please try again',
    'speech-no-input': 'No speech detected',
    
    // API Processing States
    'api-connecting': 'Connecting to AI...',
    'api-thinking': 'AI is thinking...',
    'api-generating': 'Generating response...',
    'api-complete': 'Response ready',
    'api-retry': 'Retrying...',
    
    // Speech Synthesis States
    'tts-preparing': 'Preparing speech...',
    'tts-speaking': 'Speaking...',
    'tts-paused': 'Paused',
    'tts-complete': 'Speech complete',
    
    // Network States
    'network-checking': 'Checking connection...',
    'network-offline': 'No internet connection',
    'network-reconnecting': 'Reconnecting...',
    'network-connected': 'Connected',
    
    // Error States
    'error-microphone': 'Microphone access required',
    'error-speech-not-supported': 'Speech not supported',
    'error-api-failed': 'AI service issue',
    'error-network': 'Connection issue'
  }
};

export const useUIStateManager = ({
  language,
  autoHideDelay = 3000,
  maxHistoryLength = 10
}: UIStateManagerOptions) => {
  const [currentState, setCurrentState] = useState<UIStateInfo>({
    state: 'idle',
    message: STATE_MESSAGES[language].idle,
    type: 'status',
    timestamp: Date.now()
  });

  const [stateHistory, setStateHistory] = useState<UIStateInfo[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear existing timeout
  const clearAutoHide = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Set auto-hide timeout
  const setAutoHide = useCallback((duration: number = autoHideDelay) => {
    clearAutoHide();
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, duration);
  }, [autoHideDelay, clearAutoHide]);

  // Update UI state with enhanced messaging
  const updateState = useCallback((
    state: UIState,
    customMessage?: string,
    options?: {
      progress?: number;
      autoHide?: boolean;
      duration?: number;
      type?: UIFeedbackType;
    }
  ) => {
    const message = customMessage || STATE_MESSAGES[language][state];
    const type = options?.type || (state === 'error' ? 'error' : 'status');
    
    const newStateInfo: UIStateInfo = {
      state,
      message,
      progress: options?.progress,
      type,
      timestamp: Date.now(),
      autoHide: options?.autoHide,
      duration: options?.duration
    };

    setCurrentState(newStateInfo);
    setIsVisible(true);

    // Add to history
    setStateHistory(prev => {
      const updated = [...prev, newStateInfo];
      return updated.slice(-maxHistoryLength);
    });

    // Handle auto-hide
    if (options?.autoHide !== false) {
      const hideDelay = options?.duration || autoHideDelay;
      if (type === 'success' || type === 'info') {
        setAutoHide(hideDelay);
      } else if (type === 'error' || type === 'warning') {
        setAutoHide(hideDelay * 2); // Show errors longer
      }
    } else {
      clearAutoHide();
    }
  }, [language, autoHideDelay, maxHistoryLength, setAutoHide, clearAutoHide]);

  // Enhanced state update with predefined messages
  const updateEnhancedState = useCallback((
    enhancedKey: keyof typeof ENHANCED_MESSAGES['bn'],
    options?: {
      progress?: number;
      autoHide?: boolean;
      duration?: number;
      type?: UIFeedbackType;
    }
  ) => {
    const message = ENHANCED_MESSAGES[language][enhancedKey];
    const state: UIState = enhancedKey.startsWith('error-') ? 'error' : 
                          enhancedKey.includes('complete') || enhancedKey.includes('success') ? 'success' :
                          enhancedKey.includes('warning') ? 'warning' :
                          enhancedKey.includes('connecting') || enhancedKey.includes('loading') ? 'loading' :
                          enhancedKey.includes('listening') ? 'listening' :
                          enhancedKey.includes('speaking') || enhancedKey.includes('tts-') ? 'speaking' :
                          enhancedKey.includes('processing') || enhancedKey.includes('thinking') ? 'processing' :
                          'idle';

    updateState(state, message, options);
  }, [language, updateState]);

  // Progress update for long-running operations
  const updateProgress = useCallback((progress: number, message?: string) => {
    setCurrentState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
      message: message || prev.message,
      timestamp: Date.now()
    }));
  }, []);

  // Clear current state
  const clearState = useCallback(() => {
    clearAutoHide();
    setIsVisible(false);
    setCurrentState({
      state: 'idle',
      message: STATE_MESSAGES[language].idle,
      type: 'status',
      timestamp: Date.now()
    });
  }, [language, clearAutoHide]);

  // Show/hide state manually
  const showState = useCallback(() => {
    setIsVisible(true);
    clearAutoHide();
  }, [clearAutoHide]);

  const hideState = useCallback(() => {
    setIsVisible(false);
    clearAutoHide();
  }, [clearAutoHide]);

  // Get state color based on type and state
  const getStateColor = useCallback(() => {
    switch (currentState.type) {
      case 'error':
        return '#E74C3C';
      case 'success':
        return '#2ECC71';
      case 'warning':
        return '#F39C12';
      case 'info':
        return '#3498DB';
      default:
        switch (currentState.state) {
          case 'listening':
            return '#2ECC71';
          case 'processing':
            return '#3498DB';
          case 'speaking':
            return '#9B59B6';
          case 'error':
            return '#E74C3C';
          default:
            return '#2C3E50';
        }
    }
  }, [currentState.type, currentState.state]);

  // Get animation class based on state
  const getAnimationClass = useCallback(() => {
    switch (currentState.state) {
      case 'listening':
        return 'animate-pulse';
      case 'processing':
        return 'animate-spin';
      case 'speaking':
        return 'animate-bounce';
      case 'loading':
        return 'animate-pulse';
      default:
        return '';
    }
  }, [currentState.state]);

  // Check if state should show progress bar
  const shouldShowProgress = useCallback(() => {
    return currentState.progress !== undefined && currentState.progress >= 0;
  }, [currentState.progress]);

  // Get recent state history
  const getRecentHistory = useCallback((count: number = 5) => {
    return stateHistory.slice(-count);
  }, [stateHistory]);

  // Check if current state is critical (error/warning)
  const isCriticalState = useCallback(() => {
    return currentState.type === 'error' || currentState.type === 'warning';
  }, [currentState.type]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAutoHide();
    };
  }, [clearAutoHide]);

  return {
    // Current state
    currentState,
    isVisible,
    stateHistory,
    
    // State management
    updateState,
    updateEnhancedState,
    updateProgress,
    clearState,
    showState,
    hideState,
    
    // State utilities
    getStateColor,
    getAnimationClass,
    shouldShowProgress,
    getRecentHistory,
    isCriticalState,
    
    // Manual control
    clearAutoHide
  };
};

export default useUIStateManager;