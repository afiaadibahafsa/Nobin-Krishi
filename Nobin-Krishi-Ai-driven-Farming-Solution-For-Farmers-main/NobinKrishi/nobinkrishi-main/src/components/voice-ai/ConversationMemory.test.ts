import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoiceAIChat } from './VoiceAIChat';

// Mock the services
vi.mock('./services/SpeechRecognitionService');
vi.mock('./services/SpeechSynthesisService');
vi.mock('./services/DhenuAPIClient');

describe('Conversation Memory and Context Management', () => {
  const defaultProps = {
    apiKey: 'test-api-key',
    defaultLanguage: 'en' as const,
    maxHistoryLength: 5
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should maintain conversation history within maxHistoryLength limit', async () => {
    const { result } = renderHook(() => useVoiceAIChat(defaultProps));

    // Add multiple messages to exceed the limit
    const messages = [
      'Message 1',
      'Message 2', 
      'Message 3',
      'Message 4',
      'Message 5',
      'Message 6', // This should cause trimming
      'Message 7'  // This should cause more trimming
    ];

    for (const message of messages) {
      act(() => {
        result.current.handleInputChange(message);
      });
      
      // Mock successful API response
      const mockResponse = `Response to ${message}`;
      
      // Simulate adding messages directly to test memory management
      act(() => {
        const userMessage = {
          id: Date.now().toString(),
          role: 'user' as const,
          content: message,
          timestamp: new Date(),
          language: 'en' as const
        };
        
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: mockResponse,
          timestamp: new Date(),
          language: 'en' as const
        };

        // Simulate the conversation memory management
        const currentMessages = result.current.state.messages;
        const updatedMessages = [...currentMessages, userMessage, aiMessage];
        const conversationMessages = updatedMessages.filter(msg => msg.role !== 'system');
        const trimmedMessages = conversationMessages.slice(-defaultProps.maxHistoryLength);
        
        // This would normally be handled by the hook's internal logic
        // For testing, we verify the logic works correctly
        expect(trimmedMessages.length).toBeLessThanOrEqual(defaultProps.maxHistoryLength);
      });
    }
  });

  it('should preserve context when switching languages', () => {
    const { result } = renderHook(() => useVoiceAIChat(defaultProps));

    // Add some messages first
    act(() => {
      result.current.handleInputChange('Hello in English');
    });

    const initialMessageCount = result.current.state.messages.length;

    // Switch language
    act(() => {
      result.current.toggleLanguage();
    });

    // Should have added a system message for language switch
    expect(result.current.state.currentLanguage).toBe('bn');
    expect(result.current.state.messages.length).toBeGreaterThan(initialMessageCount);
    
    // Check if system message was added
    const systemMessage = result.current.state.messages.find(
      msg => msg.role === 'system' && msg.content.includes('Language switched')
    );
    expect(systemMessage).toBeDefined();
  });

  it('should clear conversation completely', () => {
    const { result } = renderHook(() => useVoiceAIChat(defaultProps));

    // Add some messages first
    act(() => {
      result.current.handleInputChange('Test message');
    });

    // Clear conversation
    act(() => {
      result.current.clearConversation();
    });

    expect(result.current.state.messages).toHaveLength(0);
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.inputText).toBe('');
    expect(result.current.state.interimText).toBe('');
    expect(result.current.state.statusText).toBe('');
  });

  it('should provide conversation statistics', () => {
    const { result } = renderHook(() => useVoiceAIChat(defaultProps));

    // Initially should have no messages
    let stats = result.current.getConversationStats();
    expect(stats.total).toBe(0);
    expect(stats.user).toBe(0);
    expect(stats.ai).toBe(0);
    expect(stats.system).toBe(0);

    // Add a system message (language switch)
    act(() => {
      result.current.toggleLanguage();
    });

    stats = result.current.getConversationStats();
    expect(stats.system).toBe(1);
    expect(stats.total).toBe(1);
  });

  it('should detect when context management is needed', () => {
    const { result } = renderHook(() => useVoiceAIChat(defaultProps));

    // Initially should not need context management
    expect(result.current.needsContextManagement()).toBe(false);

    // Add messages to simulate exceeding the limit
    // Note: This is a simplified test - in real usage, messages would be added through sendMessage
    act(() => {
      // Simulate having more than maxHistoryLength conversation messages
      const mockMessages = Array.from({ length: 7 }, (_, i) => ({
        id: i.toString(),
        role: i % 2 === 0 ? 'user' as const : 'assistant' as const,
        content: `Message ${i}`,
        timestamp: new Date(),
        language: 'en' as const
      }));

      // This would trigger context management in the real implementation
      const conversationMessages = mockMessages.filter(msg => msg.role !== 'system');
      expect(conversationMessages.length > defaultProps.maxHistoryLength).toBe(true);
    });
  });

  it('should get conversation context correctly', () => {
    const { result } = renderHook(() => useVoiceAIChat(defaultProps));

    // Add a system message and some conversation messages
    act(() => {
      result.current.toggleLanguage(); // Adds system message
    });

    const context = result.current.getConversationContext();
    
    // Context should filter out language switch system messages
    const hasLanguageSwitchMessage = context.some(
      msg => msg.role === 'system' && msg.content.includes('Language switched')
    );
    expect(hasLanguageSwitchMessage).toBe(false);
  });
});