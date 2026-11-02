// Lazy voice loading hook for speech synthesis optimization
import { useState, useEffect, useCallback, useRef } from 'react';

export interface VoiceInfo {
  voice: SpeechSynthesisVoice;
  isLoaded: boolean;
  isLoading: boolean;
  priority: number;
  lastUsed: number;
}

export interface LazyVoiceLoadingOptions {
  maxCachedVoices?: number;
  preloadPriority?: string[];
  cacheTimeout?: number;
  loadTimeout?: number;
}

export interface LazyVoiceLoadingState {
  availableVoices: SpeechSynthesisVoice[];
  loadedVoices: Map<string, VoiceInfo>;
  isInitialized: boolean;
  isLoading: boolean;
  loadingProgress: number;
}

/**
 * Hook for lazy loading and caching of speech synthesis voices
 * Optimizes performance by loading voices on demand and managing cache
 */
export const useLazyVoiceLoading = (options: LazyVoiceLoadingOptions = {}) => {
  const {
    maxCachedVoices = 10,
    preloadPriority = ['bn-BD', 'en-US', 'bn', 'en'],
    cacheTimeout = 300000, // 5 minutes
    loadTimeout = 10000 // 10 seconds
  } = options;

  const [state, setState] = useState<LazyVoiceLoadingState>({
    availableVoices: [],
    loadedVoices: new Map(),
    isInitialized: false,
    isLoading: false,
    loadingProgress: 0
  });

  const loadedVoicesRef = useRef<Map<string, VoiceInfo>>(new Map());
  const loadingPromisesRef = useRef<Map<string, Promise<SpeechSynthesisVoice | null>>>(new Map());
  const cleanupTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize voice loading system
  const initialize = useCallback(async () => {
    if (state.isInitialized) return;

    setState(prev => ({ ...prev, isLoading: true, loadingProgress: 0 }));

    try {
      // Wait for voices to be available
      const voices = await new Promise<SpeechSynthesisVoice[]>((resolve) => {
        const getVoices = () => {
          const voiceList = speechSynthesis.getVoices();
          if (voiceList.length > 0) {
            resolve(voiceList);
          } else {
            // Some browsers load voices asynchronously
            speechSynthesis.onvoiceschanged = () => {
              const updatedVoices = speechSynthesis.getVoices();
              if (updatedVoices.length > 0) {
                resolve(updatedVoices);
              }
            };
            
            // Fallback timeout
            setTimeout(() => {
              resolve(speechSynthesis.getVoices());
            }, 1000);
          }
        };
        getVoices();
      });

      setState(prev => ({
        ...prev,
        availableVoices: voices,
        isInitialized: true,
        isLoading: false,
        loadingProgress: 100
      }));

      // Preload priority voices
      await preloadVoices(voices);

    } catch (error) {
      console.error('Failed to initialize voice loading:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isInitialized: true
      }));
    }
  }, [state.isInitialized]);

  // Preload priority voices
  const preloadVoices = useCallback(async (voices: SpeechSynthesisVoice[]) => {
    const priorityVoices = preloadPriority
      .map(lang => voices.find(voice => 
        voice.lang === lang || voice.lang.startsWith(lang.split('-')[0])
      ))
      .filter(Boolean) as SpeechSynthesisVoice[];

    const loadPromises = priorityVoices.map((voice, index) => 
      loadVoice(voice, preloadPriority.length - index)
    );

    await Promise.allSettled(loadPromises);
  }, [preloadPriority]);

  // Load a specific voice
  const loadVoice = useCallback(async (
    voice: SpeechSynthesisVoice, 
    priority: number = 1
  ): Promise<SpeechSynthesisVoice | null> => {
    const voiceKey = `${voice.name}_${voice.lang}`;
    
    // Check if already loaded
    const existingVoice = loadedVoicesRef.current.get(voiceKey);
    if (existingVoice && existingVoice.isLoaded) {
      existingVoice.lastUsed = Date.now();
      return voice;
    }

    // Check if already loading
    const existingPromise = loadingPromisesRef.current.get(voiceKey);
    if (existingPromise) {
      return existingPromise;
    }

    // Start loading
    const loadingPromise = new Promise<SpeechSynthesisVoice | null>((resolve) => {
      const voiceInfo: VoiceInfo = {
        voice,
        isLoaded: false,
        isLoading: true,
        priority,
        lastUsed: Date.now()
      };

      loadedVoicesRef.current.set(voiceKey, voiceInfo);
      
      // Update state
      setState(prev => ({
        ...prev,
        loadedVoices: new Map(loadedVoicesRef.current)
      }));

      // Test voice loading by creating a small utterance
      const testUtterance = new SpeechSynthesisUtterance('');
      testUtterance.voice = voice;
      testUtterance.volume = 0; // Silent test
      testUtterance.rate = 10; // Fast test
      
      const timeout = setTimeout(() => {
        // Loading timeout
        voiceInfo.isLoading = false;
        loadingPromisesRef.current.delete(voiceKey);
        resolve(null);
      }, loadTimeout);

      testUtterance.onstart = () => {
        clearTimeout(timeout);
        speechSynthesis.cancel(); // Stop the test utterance
        
        voiceInfo.isLoaded = true;
        voiceInfo.isLoading = false;
        
        setState(prev => ({
          ...prev,
          loadedVoices: new Map(loadedVoicesRef.current)
        }));
        
        loadingPromisesRef.current.delete(voiceKey);
        resolve(voice);
      };

      testUtterance.onerror = () => {
        clearTimeout(timeout);
        voiceInfo.isLoading = false;
        loadingPromisesRef.current.delete(voiceKey);
        resolve(null);
      };

      // Start the test
      try {
        speechSynthesis.speak(testUtterance);
      } catch (error) {
        clearTimeout(timeout);
        voiceInfo.isLoading = false;
        loadingPromisesRef.current.delete(voiceKey);
        resolve(null);
      }
    });

    loadingPromisesRef.current.set(voiceKey, loadingPromise);
    return loadingPromise;
  }, [loadTimeout]);

  // Get voice for language with lazy loading
  const getVoiceForLanguage = useCallback(async (
    language: string,
    priority: number = 1
  ): Promise<SpeechSynthesisVoice | null> => {
    if (!state.isInitialized) {
      await initialize();
    }

    // Find matching voice
    const matchingVoice = state.availableVoices.find(voice => 
      voice.lang === language || voice.lang.startsWith(language.split('-')[0])
    );

    if (!matchingVoice) {
      return null;
    }

    // Load the voice if not already loaded
    return await loadVoice(matchingVoice, priority);
  }, [state.isInitialized, state.availableVoices, initialize, loadVoice]);

  // Get best voice for language (with fallbacks)
  const getBestVoiceForLanguage = useCallback(async (
    language: string
  ): Promise<SpeechSynthesisVoice | null> => {
    const languageVariants = [
      language,
      language.split('-')[0],
      language === 'bn-BD' ? 'bn' : language === 'bn' ? 'bn-BD' : null,
      language === 'en-US' ? 'en' : language === 'en' ? 'en-US' : null
    ].filter(Boolean) as string[];

    for (const variant of languageVariants) {
      const voice = await getVoiceForLanguage(variant, 2);
      if (voice) {
        return voice;
      }
    }

    return null;
  }, [getVoiceForLanguage]);

  // Cache management
  const cleanupCache = useCallback(() => {
    const now = Date.now();
    const sortedVoices = Array.from(loadedVoicesRef.current.entries())
      .sort(([, a], [, b]) => {
        // Sort by priority first, then by last used time
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return b.lastUsed - a.lastUsed;
      });

    // Remove old or low-priority voices if cache is full
    while (sortedVoices.length > maxCachedVoices) {
      const [key, voiceInfo] = sortedVoices.pop()!;
      
      // Don't remove recently used high-priority voices
      if (voiceInfo.priority > 1 && now - voiceInfo.lastUsed < cacheTimeout) {
        continue;
      }
      
      loadedVoicesRef.current.delete(key);
    }

    // Remove expired voices
    for (const [key, voiceInfo] of loadedVoicesRef.current.entries()) {
      if (now - voiceInfo.lastUsed > cacheTimeout && voiceInfo.priority <= 1) {
        loadedVoicesRef.current.delete(key);
      }
    }

    setState(prev => ({
      ...prev,
      loadedVoices: new Map(loadedVoicesRef.current)
    }));
  }, [maxCachedVoices, cacheTimeout]);

  // Periodic cache cleanup
  useEffect(() => {
    cleanupTimeoutRef.current = setInterval(cleanupCache, 60000); // Every minute
    
    return () => {
      if (cleanupTimeoutRef.current) {
        clearInterval(cleanupTimeoutRef.current);
      }
    };
  }, [cleanupCache]);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    const loadedCount = Array.from(loadedVoicesRef.current.values())
      .filter(v => v.isLoaded).length;
    const loadingCount = Array.from(loadedVoicesRef.current.values())
      .filter(v => v.isLoading).length;
    
    return {
      totalAvailable: state.availableVoices.length,
      cached: loadedVoicesRef.current.size,
      loaded: loadedCount,
      loading: loadingCount,
      maxCached: maxCachedVoices,
      cacheUsage: (loadedVoicesRef.current.size / maxCachedVoices) * 100
    };
  }, [state.availableVoices.length, maxCachedVoices]);

  // Clear cache
  const clearCache = useCallback(() => {
    loadedVoicesRef.current.clear();
    loadingPromisesRef.current.clear();
    
    setState(prev => ({
      ...prev,
      loadedVoices: new Map()
    }));
  }, []);

  return {
    state,
    initialize,
    getVoiceForLanguage,
    getBestVoiceForLanguage,
    loadVoice,
    getCacheStats,
    clearCache,
    cleanupCache,
    isSupported: 'speechSynthesis' in window
  };
};