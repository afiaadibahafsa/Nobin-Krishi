import { useState, useEffect, useCallback } from 'react';
import { 
  BrowserCompatibilityService, 
  BrowserCapabilities, 
  CompatibilityIssue, 
  BrowserOptimizations,
  browserCompatibility 
} from '../services/BrowserCompatibilityService';

export interface UseBrowserCompatibilityResult {
  // Capabilities
  capabilities: BrowserCapabilities | null;
  isLoading: boolean;
  isReady: boolean;
  
  // Feature support
  isSpeechRecognitionSupported: boolean;
  isSpeechSynthesisSupported: boolean;
  isMicrophoneSupported: boolean;
  isAudioSupported: boolean;
  
  // Fallback mode
  fallbackMode: 'text-only' | 'speech-output-only' | 'speech-input-only' | 'full-voice';
  
  // Issues and optimizations
  compatibilityIssues: CompatibilityIssue[];
  optimizations: BrowserOptimizations | null;
  
  // Browser info
  browserInfo: {
    name: string;
    version: string;
    mobile: boolean;
    webkitBased: boolean;
  } | null;
  
  // Network status
  isOnline: boolean;
  
  // Actions
  refreshCapabilities: () => Promise<void>;
  checkFeatureSupport: (feature: keyof BrowserCapabilities) => boolean;
  getRecommendations: () => string[];
  
  // Error handling
  error: string | null;
}

export const useBrowserCompatibility = (): UseBrowserCompatibilityResult => {
  const [capabilities, setCapabilities] = useState<BrowserCapabilities | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Initialize capabilities
  const initializeCapabilities = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const caps = await browserCompatibility.detectCapabilities();
      setCapabilities(caps);
    } catch (err) {
      console.error('Failed to detect browser capabilities:', err);
      setError(err instanceof Error ? err.message : 'Failed to detect browser capabilities');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh capabilities
  const refreshCapabilities = useCallback(async () => {
    try {
      setError(null);
      const caps = await browserCompatibility.refreshCapabilities();
      setCapabilities(caps);
    } catch (err) {
      console.error('Failed to refresh browser capabilities:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh browser capabilities');
    }
  }, []);

  // Check feature support
  const checkFeatureSupport = useCallback((feature: keyof BrowserCapabilities): boolean => {
    return browserCompatibility.isFeatureSupported(feature);
  }, []);

  // Get recommendations based on issues
  const getRecommendations = useCallback((): string[] => {
    const issues = browserCompatibility.getCompatibilityIssues();
    return issues
      .filter(issue => issue.recommendation)
      .map(issue => issue.recommendation!)
      .filter((rec, index, arr) => arr.indexOf(rec) === index); // Remove duplicates
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeCapabilities();
  }, [initializeCapabilities]);

  // Listen for online/offline changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      refreshCapabilities();
    };

    const handleOffline = () => {
      setIsOnline(false);
      refreshCapabilities();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshCapabilities]);

  // Listen for capability changes
  useEffect(() => {
    const cleanup = browserCompatibility.onCapabilityChange((newCapabilities) => {
      setCapabilities(newCapabilities);
    });

    return cleanup;
  }, []);

  // Derived values
  const isReady = !isLoading && capabilities !== null;
  
  const isSpeechRecognitionSupported = capabilities?.speechRecognition.supported && 
                                      capabilities?.speechRecognition.available || false;
  
  const isSpeechSynthesisSupported = capabilities?.speechSynthesis.supported && 
                                    capabilities?.speechSynthesis.available || false;
  
  const isMicrophoneSupported = capabilities?.microphone.supported && 
                               capabilities?.microphone.available || false;
  
  const isAudioSupported = capabilities?.audio.supported && 
                          capabilities?.audio.available || false;

  const fallbackMode = browserCompatibility.getFallbackMode();
  
  const compatibilityIssues = browserCompatibility.getCompatibilityIssues();
  
  const optimizations = browserCompatibility.getOptimizations();
  
  const browserInfo = capabilities ? {
    name: capabilities.browser.name,
    version: capabilities.browser.version,
    mobile: capabilities.browser.mobile,
    webkitBased: capabilities.browser.webkitBased
  } : null;

  return {
    // Capabilities
    capabilities,
    isLoading,
    isReady,
    
    // Feature support
    isSpeechRecognitionSupported,
    isSpeechSynthesisSupported,
    isMicrophoneSupported,
    isAudioSupported,
    
    // Fallback mode
    fallbackMode,
    
    // Issues and optimizations
    compatibilityIssues,
    optimizations,
    
    // Browser info
    browserInfo,
    
    // Network status
    isOnline,
    
    // Actions
    refreshCapabilities,
    checkFeatureSupport,
    getRecommendations,
    
    // Error handling
    error
  };
};