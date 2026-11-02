import React, { createContext, useContext, useEffect } from 'react';
import { useAccessibility, AccessibilityOptions, AccessibilityState } from '../hooks/useAccessibility';

interface AccessibilityContextType {
  state: AccessibilityState;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  manageFocus: (elementId: string, options?: { preventScroll?: boolean; restorePrevious?: boolean }) => void;
  restoreFocus: () => void;
  getAccessibilityClasses: (baseClasses?: string) => string;
  getAriaLabel: (key: string, context?: Record<string, any>) => string;
  getKeyboardShortcuts: () => Array<{ key: string; description: string }>;
  isHighContrastMode: boolean;
  isReducedMotionMode: boolean;
  isScreenReaderActive: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export interface AccessibilityProviderProps {
  children: React.ReactNode;
  language: 'bn' | 'en';
  options?: Partial<AccessibilityOptions>;
}

/**
 * Accessibility Provider for Voice AI Chat System
 * Implements Requirements 7.4 - Accessibility features
 */
export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
  language,
  options = {}
}) => {
  const defaultOptions: AccessibilityOptions = {
    announceStateChanges: true,
    manageFocus: true,
    enableKeyboardNavigation: true,
    highContrastMode: true,
    reducedMotion: true,
    language,
    ...options
  };

  const accessibility = useAccessibility(defaultOptions);

  // Apply high contrast styles to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (accessibility.isHighContrastMode) {
      root.classList.add('high-contrast-mode');
    } else {
      root.classList.remove('high-contrast-mode');
    }

    if (accessibility.isReducedMotionMode) {
      root.classList.add('reduced-motion-mode');
    } else {
      root.classList.remove('reduced-motion-mode');
    }

    return () => {
      root.classList.remove('high-contrast-mode', 'reduced-motion-mode');
    };
  }, [accessibility.isHighContrastMode, accessibility.isReducedMotionMode]);

  // Add global accessibility styles
  useEffect(() => {
    const styleId = 'voice-ai-accessibility-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = `
      /* High Contrast Mode Styles */
      .high-contrast-mode {
        --color-primary: #000000;
        --color-secondary: #ffffff;
        --color-accent: #ffff00;
        --color-error: #ff0000;
        --color-success: #00ff00;
        --color-warning: #ff8800;
        --border-width: 2px;
        --focus-outline: 3px solid #ffff00;
      }

      .high-contrast-mode * {
        border-color: var(--color-primary) !important;
        color: var(--color-primary) !important;
      }

      .high-contrast-mode .bg-white,
      .high-contrast-mode .bg-gray-50,
      .high-contrast-mode .bg-blue-50,
      .high-contrast-mode .bg-green-50 {
        background-color: var(--color-secondary) !important;
        border: var(--border-width) solid var(--color-primary) !important;
      }

      .high-contrast-mode .bg-blue-500,
      .high-contrast-mode .bg-green-500,
      .high-contrast-mode .bg-primary {
        background-color: var(--color-primary) !important;
        color: var(--color-secondary) !important;
      }

      .high-contrast-mode button:focus,
      .high-contrast-mode input:focus,
      .high-contrast-mode [tabindex]:focus {
        outline: var(--focus-outline) !important;
        outline-offset: 2px !important;
      }

      .high-contrast-mode .text-red-500,
      .high-contrast-mode .text-red-600 {
        color: var(--color-error) !important;
      }

      .high-contrast-mode .text-green-500,
      .high-contrast-mode .text-green-600 {
        color: var(--color-success) !important;
      }

      /* Reduced Motion Mode Styles */
      .reduced-motion-mode *,
      .reduced-motion-mode *::before,
      .reduced-motion-mode *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }

      .reduced-motion-mode .animate-pulse,
      .reduced-motion-mode .animate-ping,
      .reduced-motion-mode .animate-spin {
        animation: none !important;
      }

      /* Focus Management Styles */
      .voice-ai-focus-trap {
        position: relative;
      }

      .voice-ai-focus-trap::before,
      .voice-ai-focus-trap::after {
        content: '';
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      /* Screen Reader Only Content */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      /* Enhanced Focus Indicators */
      .voice-ai-enhanced-focus:focus {
        outline: 3px solid #2ECC71;
        outline-offset: 2px;
        box-shadow: 0 0 0 6px rgba(46, 204, 113, 0.2);
      }

      .high-contrast-mode .voice-ai-enhanced-focus:focus {
        outline: var(--focus-outline);
        box-shadow: 0 0 0 6px rgba(255, 255, 0, 0.3);
      }

      /* Touch Target Accessibility */
      .voice-ai-touch-target {
        min-width: 44px;
        min-height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Skip Links */
      .voice-ai-skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #2ECC71;
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
      }

      .voice-ai-skip-link:focus {
        top: 6px;
      }

      /* Keyboard Navigation Indicators */
      .voice-ai-keyboard-nav {
        position: relative;
      }

      .voice-ai-keyboard-nav::after {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border: 2px solid transparent;
        border-radius: inherit;
        pointer-events: none;
        transition: border-color 0.2s;
      }

      .voice-ai-keyboard-nav:focus-visible::after {
        border-color: #2ECC71;
      }

      .high-contrast-mode .voice-ai-keyboard-nav:focus-visible::after {
        border-color: var(--color-accent);
      }
    `;

    return () => {
      if (styleElement && document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  return (
    <AccessibilityContext.Provider value={accessibility}>
      {/* Skip Links for Keyboard Navigation */}
      <a 
        href="#voice-ai-main-content" 
        className="voice-ai-skip-link"
        onFocus={() => accessibility.announce(
          language === 'bn' ? 'মূল কন্টেন্টে যেতে এন্টার চাপুন' : 'Press Enter to skip to main content'
        )}
      >
        {language === 'bn' ? 'মূল কন্টেন্টে যান' : 'Skip to main content'}
      </a>
      
      <a 
        href="#voice-ai-input-field" 
        className="voice-ai-skip-link"
        onFocus={() => accessibility.announce(
          language === 'bn' ? 'ইনপুট ফিল্ডে যেতে এন্টার চাপুন' : 'Press Enter to skip to input field'
        )}
      >
        {language === 'bn' ? 'ইনপুট ফিল্ডে যান' : 'Skip to input field'}
      </a>

      {/* Keyboard Shortcuts Help */}
      <div 
        id="voice-ai-keyboard-shortcuts" 
        className="sr-only"
        aria-label={language === 'bn' ? 'কীবোর্ড শর্টকাট' : 'Keyboard shortcuts'}
      >
        <h2>{language === 'bn' ? 'কীবোর্ড শর্টকাট' : 'Keyboard Shortcuts'}</h2>
        <ul>
          {accessibility.getKeyboardShortcuts().map((shortcut, index) => (
            <li key={index}>
              {shortcut.key}: {shortcut.description}
            </li>
          ))}
        </ul>
      </div>

      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibilityContext = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    // Provide default values for testing or when used outside provider
    return {
      state: {
        isListening: false,
        isSpeaking: false,
        isProcessing: false,
        currentLanguage: 'en',
        lastAnnouncement: null,
        focusHistory: [],
        keyboardShortcuts: []
      },
      announce: () => {},
      manageFocus: () => {},
      restoreFocus: () => {},
      getAccessibilityClasses: (baseClasses = '') => baseClasses,
      getAriaLabel: (key: string) => key,
      getKeyboardShortcuts: () => [],
      isHighContrastMode: false,
      isReducedMotionMode: false,
      isScreenReaderActive: false
    };
  }
  return context;
};

export default AccessibilityProvider;