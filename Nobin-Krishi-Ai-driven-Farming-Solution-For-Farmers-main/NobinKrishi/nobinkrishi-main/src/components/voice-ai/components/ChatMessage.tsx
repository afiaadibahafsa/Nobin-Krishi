import React from 'react';
import { RotateCcw, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage as ChatMessageType } from '../VoiceAIChat';
import { useAccessibilityContext } from './AccessibilityProvider';

export interface ChatMessageProps {
  message: ChatMessageType;
  onReplay?: (text: string, language: 'bn' | 'en') => void;
  className?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onReplay,
  className = ''
}) => {
  const { getAriaLabel, getAccessibilityClasses } = useAccessibilityContext();
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getLanguageFlag = (language: 'bn' | 'en') => {
    return language === 'bn' ? '🇧🇩' : '🇬🇧';
  };

  const handleReplay = () => {
    if (onReplay && isAssistant) {
      onReplay(message.content, message.language);
    }
  };

  const getMessageAriaLabel = () => {
    const roleText = isUser 
      ? (message.language === 'bn' ? 'আপনার বার্তা' : 'Your message')
      : (message.language === 'bn' ? 'AI এর উত্তর' : 'AI response');
    
    const timeText = formatTimestamp(message.timestamp);
    const languageText = message.language === 'bn' ? 'বাংলায়' : 'in English';
    
    return `${roleText} ${timeText} ${languageText}: ${message.content}`;
  };

  return (
    <article 
      className={getAccessibilityClasses(`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 ${className}`)}
      role="article"
      aria-label={getMessageAriaLabel()}
      tabIndex={0}
    >
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Message Bubble */}
        <div
          className={getAccessibilityClasses(`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-[#3B82F6] text-white rounded-br-md'
              : 'bg-[#2ECC71] text-white rounded-bl-md shadow-sm'
          }`)}
          role="region"
          aria-labelledby={`message-content-${message.id}`}
        >
          {/* Message Content */}
          <p 
            id={`message-content-${message.id}`}
            className="text-base leading-relaxed whitespace-pre-wrap"
            lang={message.language === 'bn' ? 'bn' : 'en'}
          >
            {message.content}
          </p>

          {/* Message Footer */}
          <footer className={`flex items-center justify-between mt-2 pt-2 border-t ${
            isUser ? 'border-white/20' : 'border-white/20'
          }`}>
            {/* Timestamp and Language */}
            <div className="flex items-center gap-2">
              <time 
                className={`text-xs ${
                  isUser ? 'text-white/80' : 'text-white/80'
                }`}
                dateTime={message.timestamp.toISOString()}
                aria-label={`Sent at ${formatTimestamp(message.timestamp)}`}
              >
                {formatTimestamp(message.timestamp)}
              </time>
              <span 
                className="text-xs"
                role="img"
                aria-label={`Message in ${message.language === 'bn' ? 'Bangla' : 'English'}`}
              >
                {getLanguageFlag(message.language)}
              </span>
            </div>

            {/* Replay Button for AI Messages */}
            {isAssistant && onReplay && (
              <Button
                variant="ghost"
                size="sm"
                className={getAccessibilityClasses("h-6 px-2 text-white/90 hover:bg-white/20 hover:text-white voice-ai-touch-target voice-ai-enhanced-focus")}
                onClick={handleReplay}
                title={message.language === 'bn' ? 'আবার শুনুন' : 'Replay'}
                aria-label={getAriaLabel('replayMessage')}
                type="button"
              >
                <RotateCcw className="w-3 h-3 mr-1" aria-hidden="true" />
                <span className="text-xs">
                  {message.language === 'bn' ? 'আবার' : 'Replay'}
                </span>
              </Button>
            )}
          </footer>
        </div>

        {/* Avatar */}
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mt-2`}>
          <div 
            className={getAccessibilityClasses(`w-8 h-8 rounded-full flex items-center justify-center ${
              isUser 
                ? 'bg-[#3B82F6] text-white' 
                : 'bg-[#2ECC71] text-white'
            }`)}
            role="img"
            aria-label={isUser 
              ? (message.language === 'bn' ? 'ব্যবহারকারী' : 'User')
              : (message.language === 'bn' ? 'AI সহায়ক' : 'AI Assistant')
            }
          >
            {isUser ? (
              <User className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Bot className="w-4 h-4" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default ChatMessage;