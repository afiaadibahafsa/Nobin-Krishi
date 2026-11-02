import React, { useEffect, useRef, useMemo } from 'react';
import { ChatMessage as ChatMessageType } from '../VoiceAIChat';
import { ChatMessage } from './ChatMessage';
import { Button } from '@/components/ui/button';
import { Trash2, MessageSquare } from 'lucide-react';
import { useVirtualScrolling } from '../hooks/useVirtualScrolling';
import { useAccessibilityContext } from './AccessibilityProvider';

export interface ChatInterfaceProps {
  messages: ChatMessageType[];
  onReplayMessage?: (text: string, language: 'bn' | 'en') => void;
  onClearConversation?: () => void;
  language: 'bn' | 'en';
  className?: string;
  maxHeight?: string;
  enableVirtualScrolling?: boolean;
  estimatedMessageHeight?: number;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onReplayMessage,
  onClearConversation,
  language,
  className = '',
  maxHeight = '400px',
  enableVirtualScrolling = false,
  estimatedMessageHeight = 80
}) => {
  const { announce, getAriaLabel, getAccessibilityClasses, manageFocus } = useAccessibilityContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse maxHeight to get numeric value for virtual scrolling
  const containerHeight = useMemo(() => {
    const heightValue = parseInt(maxHeight.replace('px', ''));
    return isNaN(heightValue) ? 400 : heightValue;
  }, [maxHeight]);

  // Virtual scrolling for performance optimization with large conversation histories
  const virtualScrolling = useVirtualScrolling(messages, {
    itemHeight: estimatedMessageHeight,
    containerHeight: containerHeight - 120, // Account for header and footer
    overscan: 3,
    estimatedItemHeight: estimatedMessageHeight,
    getItemHeight: (index, message) => {
      // Estimate height based on message content length
      const baseHeight = 60;
      const contentHeight = Math.ceil(message.content.length / 50) * 20;
      return Math.max(baseHeight, Math.min(contentHeight, 200));
    }
  });

  // Announce new messages for screen readers
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        announce(
          language === 'bn' 
            ? `AI এর নতুন উত্তর: ${lastMessage.content.substring(0, 100)}${lastMessage.content.length > 100 ? '...' : ''}`
            : `New AI response: ${lastMessage.content.substring(0, 100)}${lastMessage.content.length > 100 ? '...' : ''}`,
          'polite'
        );
      }
    }
  }, [messages, announce, language]);

  // Auto-scroll to bottom when new messages arrive (only if not using virtual scrolling or if at bottom)
  useEffect(() => {
    if (enableVirtualScrolling) {
      // For virtual scrolling, use the built-in scroll to bottom functionality
      if (virtualScrolling.isScrolledToBottom || messages.length === 1) {
        virtualScrolling.scrollToBottom();
      }
    } else {
      // Traditional scrolling
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    }
  }, [messages, enableVirtualScrolling, virtualScrolling]);

  const handleClearConversation = () => {
    if (onClearConversation) {
      // Show confirmation for clearing conversation
      const confirmMessage = language === 'bn' 
        ? 'আপনি কি নিশ্চিত যে আপনি কথোপকথন মুছে ফেলতে চান?'
        : 'Are you sure you want to clear the conversation?';
      
      if (window.confirm(confirmMessage)) {
        onClearConversation();
        announce(
          language === 'bn' ? 'কথোপকথন মুছে ফেলা হয়েছে' : 'Conversation cleared',
          'assertive'
        );
      }
    }
  };

  return (
    <section 
      className={getAccessibilityClasses(`bg-white rounded-2xl border border-[#E5E7EB] shadow-sm ${className}`)}
      aria-labelledby="chat-interface-title"
      role="log"
      aria-live="polite"
      aria-atomic="false"
    >
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#2ECC71]" aria-hidden="true" />
          <h2 id="chat-interface-title" className="text-lg font-semibold text-[#2C3E50]">
            {language === 'bn' ? 'কথোপকথন' : 'Conversation'}
          </h2>
          {messages.length > 0 && (
            <span className="text-sm text-[#2C3E50]/60 ml-2" aria-label={
              language === 'bn' 
                ? `${messages.length} টি বার্তা`
                : `${messages.length} messages`
            }>
              ({messages.length} {language === 'bn' ? 'বার্তা' : 'messages'})
            </span>
          )}
        </div>

        {/* Clear Conversation Button */}
        {messages.length > 0 && (
          <Button
            id="clear-conversation-button"
            data-testid="clear-conversation"
            variant="ghost"
            size="sm"
            onClick={handleClearConversation}
            className={getAccessibilityClasses("text-red-500 hover:bg-red-50 hover:text-red-600 voice-ai-touch-target voice-ai-enhanced-focus")}
            title={language === 'bn' ? 'কথোপকথন মুছুন' : 'Clear Conversation'}
            aria-label={getAriaLabel('clearConversation')}
            aria-describedby="clear-conversation-help"
            type="button"
          >
            <Trash2 className="w-4 h-4 mr-1" aria-hidden="true" />
            <span className="text-sm">
              {language === 'bn' ? 'মুছুন' : 'Clear'}
            </span>
          </Button>
        )}
        
        {/* Screen reader help for clear button */}
        <div id="clear-conversation-help" className="sr-only">
          {language === 'bn' 
            ? 'Ctrl+Alt+C চেপে কথোপকথন মুছুন'
            : 'Press Ctrl+Alt+C to clear conversation'
          }
        </div>
      </header>

      {/* Messages Container */}
      <div 
        id="chat-messages-container"
        ref={enableVirtualScrolling ? virtualScrolling.containerRef : containerRef}
        className={getAccessibilityClasses("p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-[#E5E7EB] scrollbar-track-transparent")}
        style={{ maxHeight }}
        onScroll={enableVirtualScrolling ? virtualScrolling.handleScroll : undefined}
        role="log"
        aria-label={language === 'bn' ? 'চ্যাট বার্তাসমূহ' : 'Chat messages'}
        tabIndex={0}
      >
        {messages.length === 0 ? (
          /* Empty State */
          <div 
            className="flex flex-col items-center justify-center py-12 text-center"
            role="status"
            aria-label={language === 'bn' ? 'কোনো কথোপকথন নেই' : 'No conversation'}
          >
            <MessageSquare className="w-12 h-12 text-[#E5E7EB] mb-4" aria-hidden="true" />
            <p className="text-[#2C3E50]/60 text-base mb-2">
              {language === 'bn' 
                ? 'এখনো কোনো কথোপকথন নেই' 
                : 'No conversation yet'}
            </p>
            <p className="text-[#2C3E50]/40 text-sm">
              {language === 'bn' 
                ? 'আপনার প্রশ্ন জিজ্ঞাসা করে শুরু করুন' 
                : 'Start by asking your question'}
            </p>
          </div>
        ) : enableVirtualScrolling ? (
          /* Virtual Scrolling Messages List */
          <div style={virtualScrolling.contentStyle} role="log">
            <div style={virtualScrolling.itemsStyle}>
              {virtualScrolling.state.visibleItems.map((item, index) => (
                <div 
                  key={item.id} 
                  style={{ height: item.height }}
                  role="listitem"
                >
                  <ChatMessage
                    message={item.data}
                    onReplay={onReplayMessage}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Traditional Messages List */
          <div className="space-y-1" role="log">
            {messages.map((message, index) => (
              <div 
                key={message.id}
                role="listitem"
                data-testid={`chat-message-${index}`}
                tabIndex={0}
                aria-label={getAriaLabel('chatMessage', { role: message.role })}
              >
                <ChatMessage
                  message={message}
                  onReplay={onReplayMessage}
                />
              </div>
            ))}
            {/* Scroll anchor */}
            <div ref={messagesEndRef} aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Footer with enhanced conversation stats and virtual scrolling info */}
      {messages.length > 0 && (
        <footer className="px-4 py-2 border-t border-[#E5E7EB] bg-[#F9FAFB] rounded-b-2xl">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#2C3E50]/50" role="status">
              {language === 'bn' 
                ? `শেষ ${Math.min(5, messages.filter(m => m.role !== 'system').length)} টি বার্তা AI এর স্মৃতিতে রয়েছে`
                : `Last ${Math.min(5, messages.filter(m => m.role !== 'system').length)} messages are in AI memory`}
            </p>
            <div className="flex items-center gap-2">
              {messages.filter(m => m.role !== 'system').length > 5 && (
                <p className="text-xs text-[#2C3E50]/40" role="status">
                  {language === 'bn' 
                    ? `(${messages.filter(m => m.role !== 'system').length - 5} টি পুরানো বার্তা সরানো হয়েছে)`
                    : `(${messages.filter(m => m.role !== 'system').length - 5} older messages removed)`}
                </p>
              )}
              {enableVirtualScrolling && messages.length > 10 && (
                <p className="text-xs text-[#2C3E50]/30" role="status">
                  {language === 'bn' 
                    ? `ভার্চুয়াল স্ক্রলিং সক্রিয়`
                    : `Virtual scrolling active`}
                </p>
              )}
            </div>
          </div>
        </footer>
      )}
    </section>
  );
};

export default ChatInterface;