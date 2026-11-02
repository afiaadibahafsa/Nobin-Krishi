import { useEffect, useRef, useCallback, useState } from 'react';

export interface AccessibilityOptions {
  announceStateChanges?: boolean;
  manageFocus?: boolean;
  enableKeyboardNavigation?: boolean;
  highContrastMode?: boolean;
  reducedMotion?: boolean;
  language: 'bn' | 'en';
}

export interface AccessibilityState {
  isHighContrast: boolean;
  isReducedMotion: boolean;
  isScreenReaderActive: boolean;
  currentFocus: string | null;
  announcements: string[];
}

/**
 * Custom hook for managing accessibility features in Voice AI Chat
 * Implements Requirements 7.4 - Accessibility features
 */
export const useAccessibility = (options: AccessibilityOptions) => {
  const [state, setState] = useState<AccessibilityState>({
    isHighContrast: false,
    isReducedMotion: false,
    isScreenReaderActive: false,
    currentFocus: null,
    announcements: []
  });

  const announcementRef = useRef<HTMLDivElement | null>(null);
  const focusHistoryRef = useRef<string[]>([]);

  // Detect system preferences
  useEffect(() => {
    const detectSystemPreferences = () => {
      const highContrast = window.matchMedia('(prefers-contrast: high)').matches ||
                          window.matchMedia('(-ms-high-contrast: active)').matches;
      
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Detect screen reader by checking for common screen reader indicators
      const screenReader = !!(
        window.navigator.userAgent.includes('NVDA') ||
        window.navigator.userAgent.includes('JAWS') ||
        window.speechSynthesis?.speaking ||
        document.querySelector('[aria-live]')
      );

      setState(prev => ({
        ...prev,
        isHighContrast: highContrast,
        isReducedMotion: reducedMotion,
        isScreenReaderActive: screenReader
      }));
    };

    detectSystemPreferences();

    // Listen for preference changes
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setState(prev => ({ ...prev, isHighContrast: e.matches }));
    };

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setState(prev => ({ ...prev, isReducedMotion: e.matches }));
    };

    highContrastQuery.addEventListener('change', handleHighContrastChange);
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    return () => {
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  // Create announcement region for screen readers
  useEffect(() => {
    if (!announcementRef.current) {
      const announcementDiv = document.createElement('div');
      announcementDiv.setAttribute('aria-live', 'polite');
      announcementDiv.setAttribute('aria-atomic', 'true');
      announcementDiv.setAttribute('id', 'voice-ai-announcements');
      announcementDiv.style.position = 'absolute';
      announcementDiv.style.left = '-10000px';
      announcementDiv.style.width = '1px';
      announcementDiv.style.height = '1px';
      announcementDiv.style.overflow = 'hidden';
      document.body.appendChild(announcementDiv);
      announcementRef.current = announcementDiv;
    }

    return () => {
      if (announcementRef.current && document.body.contains(announcementRef.current)) {
        document.body.removeChild(announcementRef.current);
      }
    };
  }, []);

  // Announce state changes to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!options.announceStateChanges || !announcementRef.current) return;

    // Clear previous announcement
    announcementRef.current.textContent = '';
    announcementRef.current.setAttribute('aria-live', priority);
    
    // Add new announcement after a brief delay to ensure screen readers pick it up
    setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = message;
      }
    }, 100);

    // Update state
    setState(prev => ({
      ...prev,
      announcements: [...prev.announcements.slice(-4), message] // Keep last 5 announcements
    }));
  }, [options.announceStateChanges]);

  // Focus management utilities
  const manageFocus = useCallback((elementId: string, options?: { 
    preventScroll?: boolean;
    restorePrevious?: boolean;
  }) => {
    if (!options?.manageFocus) return;

    const element = document.getElementById(elementId);
    if (!element) return;

    // Store previous focus for restoration
    if (document.activeElement && document.activeElement.id) {
      focusHistoryRef.current.push(document.activeElement.id);
    }

    // Focus the element
    element.focus({ preventScroll: options?.preventScroll });
    
    setState(prev => ({ ...prev, currentFocus: elementId }));
  }, []);

  const restoreFocus = useCallback(() => {
    const previousFocus = focusHistoryRef.current.pop();
    if (previousFocus) {
      const element = document.getElementById(previousFocus);
      if (element) {
        element.focus();
        setState(prev => ({ ...prev, currentFocus: previousFocus }));
      }
    }
  }, []);

  // Keyboard navigation handler
  const handleKeyboardNavigation = useCallback((event: KeyboardEvent) => {
    if (!options.enableKeyboardNavigation) return;

    const { key, ctrlKey, altKey, shiftKey } = event;

    // Voice AI specific keyboard shortcuts
    switch (key) {
      case 'Enter':
        if (ctrlKey) {
          // Ctrl+Enter: Start/stop listening
          const micButton = document.querySelector('[data-testid="microphone-button"]') as HTMLButtonElement;
          if (micButton) {
            micButton.click();
            event.preventDefault();
          }
        }
        break;

      case 'Escape':
        // Escape: Stop current voice operation
        const stopButton = document.querySelector('[data-testid="stop-speech-button"]') as HTMLButtonElement;
        if (stopButton) {
          stopButton.click();
          event.preventDefault();
        }
        break;

      case 'l':
        if (ctrlKey && altKey) {
          // Ctrl+Alt+L: Toggle language
          const languageToggle = document.querySelector('[data-testid="language-toggle"]') as HTMLButtonElement;
          if (languageToggle) {
            languageToggle.click();
            event.preventDefault();
          }
        }
        break;

      case 'c':
        if (ctrlKey && altKey) {
          // Ctrl+Alt+C: Clear conversation
          const clearButton = document.querySelector('[data-testid="clear-conversation"]') as HTMLButtonElement;
          if (clearButton) {
            clearButton.click();
            event.preventDefault();
          }
        }
        break;

      case 'ArrowUp':
      case 'ArrowDown':
        // Navigate through messages
        if (altKey) {
          const messages = document.querySelectorAll('[data-testid^="chat-message-"]');
          const currentIndex = Array.from(messages).findIndex(msg => 
            msg.contains(document.activeElement)
          );
          
          let nextIndex = currentIndex;
          if (key === 'ArrowUp' && currentIndex > 0) {
            nextIndex = currentIndex - 1;
          } else if (key === 'ArrowDown' && currentIndex < messages.length - 1) {
            nextIndex = currentIndex + 1;
          }
          
          if (nextIndex !== currentIndex && messages[nextIndex]) {
            (messages[nextIndex] as HTMLElement).focus();
            event.preventDefault();
          }
        }
        break;
    }
  }, [options.enableKeyboardNavigation]);

  // Set up keyboard event listeners
  useEffect(() => {
    if (options.enableKeyboardNavigation) {
      document.addEventListener('keydown', handleKeyboardNavigation);
      return () => {
        document.removeEventListener('keydown', handleKeyboardNavigation);
      };
    }
  }, [handleKeyboardNavigation, options.enableKeyboardNavigation]);

  // Get accessibility-friendly class names
  const getAccessibilityClasses = useCallback((baseClasses: string = '') => {
    const classes = [baseClasses];

    if (state.isHighContrast) {
      classes.push('high-contrast');
    }

    if (state.isReducedMotion) {
      classes.push('reduced-motion');
    }

    return classes.filter(Boolean).join(' ');
  }, [state.isHighContrast, state.isReducedMotion]);

  // Generate ARIA labels based on language
  const getAriaLabel = useCallback((key: string, context?: Record<string, any>) => {
    const labels = {
      bn: {
        microphoneButton: 'মাইক্রোফোন বোতাম',
        microphoneListening: 'শুনছি, বন্ধ করতে ক্লিক করুন',
        microphoneStart: 'কথা বলা শুরু করতে ক্লিক করুন',
        microphoneDisabled: 'মাইক্রোফোন উপলব্ধ নেই',
        languageToggle: 'ভাষা পরিবর্তন করুন',
        sendMessage: 'বার্তা পাঠান',
        clearConversation: 'কথোপকথন মুছুন',
        replayMessage: 'বার্তা আবার শুনুন',
        pauseSpeech: 'বক্তৃতা বিরতি দিন',
        resumeSpeech: 'বক্তৃতা চালিয়ে যান',
        stopSpeech: 'বক্তৃতা বন্ধ করুন',
        settingsPanel: 'সেটিংস প্যানেল',
        voiceSpeedSlider: 'কণ্ঠস্বরের গতি নিয়ন্ত্রণ',
        autoSpeakToggle: 'স্বয়ংক্রিয় বক্তৃতা চালু/বন্ধ',
        chatMessage: context?.role === 'user' ? 'আপনার বার্তা' : 'AI এর উত্তর',
        inputField: 'আপনার প্রশ্ন টাইপ করুন বা বলুন'
      },
      en: {
        microphoneButton: 'Microphone button',
        microphoneListening: 'Listening, click to stop',
        microphoneStart: 'Click to start speaking',
        microphoneDisabled: 'Microphone not available',
        languageToggle: 'Toggle language',
        sendMessage: 'Send message',
        clearConversation: 'Clear conversation',
        replayMessage: 'Replay message',
        pauseSpeech: 'Pause speech',
        resumeSpeech: 'Resume speech',
        stopSpeech: 'Stop speech',
        settingsPanel: 'Settings panel',
        voiceSpeedSlider: 'Voice speed control',
        autoSpeakToggle: 'Toggle auto-speak',
        chatMessage: context?.role === 'user' ? 'Your message' : 'AI response',
        inputField: 'Type or speak your question'
      }
    };

    return labels[options.language]?.[key] || key;
  }, [options.language]);

  // Generate keyboard shortcut descriptions
  const getKeyboardShortcuts = useCallback(() => {
    const shortcuts = {
      bn: [
        { key: 'Ctrl + Enter', description: 'মাইক্রোফোন চালু/বন্ধ' },
        { key: 'Escape', description: 'বক্তৃতা বন্ধ করুন' },
        { key: 'Ctrl + Alt + L', description: 'ভাষা পরিবর্তন' },
        { key: 'Ctrl + Alt + C', description: 'কথোপকথন মুছুন' },
        { key: 'Alt + ↑/↓', description: 'বার্তাগুলির মধ্যে নেভিগেট করুন' }
      ],
      en: [
        { key: 'Ctrl + Enter', description: 'Toggle microphone' },
        { key: 'Escape', description: 'Stop speech' },
        { key: 'Ctrl + Alt + L', description: 'Toggle language' },
        { key: 'Ctrl + Alt + C', description: 'Clear conversation' },
        { key: 'Alt + ↑/↓', description: 'Navigate through messages' }
      ]
    };

    return shortcuts[options.language] || shortcuts.en;
  }, [options.language]);

  return {
    state,
    announce,
    manageFocus,
    restoreFocus,
    getAccessibilityClasses,
    getAriaLabel,
    getKeyboardShortcuts,
    
    // Utility functions
    isHighContrastMode: state.isHighContrast,
    isReducedMotionMode: state.isReducedMotion,
    isScreenReaderActive: state.isScreenReaderActive
  };
};

export default useAccessibility;