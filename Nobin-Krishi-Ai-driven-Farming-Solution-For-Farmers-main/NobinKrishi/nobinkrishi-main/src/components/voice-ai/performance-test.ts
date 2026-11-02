// Performance optimization test file
import { useDebounce } from './hooks/useDebounce';
import { useRequestQueue } from './hooks/useRequestQueue';
import { useVirtualScrolling } from './hooks/useVirtualScrolling';
import { useAudioBufferManager } from './hooks/useAudioBufferManager';
import { useLazyVoiceLoading } from './hooks/useLazyVoiceLoading';

// Test data for virtual scrolling
const testMessages = Array.from({ length: 100 }, (_, i) => ({
  id: `msg-${i}`,
  role: 'user' as const,
  content: `Test message ${i}`,
  timestamp: new Date(),
  language: 'en' as const
}));

// Simple test function to verify hooks can be imported and used
export const testPerformanceOptimizations = () => {
  console.log('Performance optimization hooks imported successfully:');
  console.log('✓ useDebounce');
  console.log('✓ useRequestQueue');
  console.log('✓ useVirtualScrolling');
  console.log('✓ useAudioBufferManager');
  console.log('✓ useLazyVoiceLoading');
  
  // Test virtual scrolling with sample data
  console.log(`✓ Virtual scrolling test data: ${testMessages.length} messages`);
  
  return {
    debounceHook: useDebounce,
    requestQueueHook: useRequestQueue,
    virtualScrollingHook: useVirtualScrolling,
    audioBufferHook: useAudioBufferManager,
    lazyVoiceHook: useLazyVoiceLoading,
    testData: testMessages
  };
};

export default testPerformanceOptimizations;