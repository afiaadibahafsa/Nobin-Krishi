import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Send, Mic, MicOff, Loader2, Volume2, VolumeX, Trash2 } from 'lucide-react';
import { AiServiceError, requestFarmingChat, requestVoiceAssistant } from '@/services/ai/invokeFunction';

// TypeScript declarations for Speech APIs
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SimpleVoiceAIInterfaceProps {
  isMobile: boolean;
  isOnline: boolean;
  currentLanguage: 'bn' | 'en';
  onLanguageChange: (lang: 'bn' | 'en') => void;
  initialQuestion?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  language: 'bn' | 'en';
}

const SimpleVoiceAIInterface: React.FC<SimpleVoiceAIInterfaceProps> = ({
  isMobile,
  isOnline,
  currentLanguage,
  onLanguageChange,
  initialQuestion
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interimText, setInterimText] = useState('');
  const inFlightRef = useRef(false);
  const lastInputWasVoiceRef = useRef(false);

  // Check for speech recognition support
  const isSpeechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  const isSpeechSynthesisSupported = 'speechSynthesis' in window;

  // Handle initial question
  useEffect(() => {
    if (initialQuestion && initialQuestion.trim()) {
      setInputText(initialQuestion);
      // Auto-send the initial question after a short delay
      const timer = setTimeout(() => {
        sendMessageWithText(initialQuestion);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [initialQuestion]);

  // Clear selected question after it's been processed
  useEffect(() => {
    if (messages.length > 0 && initialQuestion) {
      // Clear the initial question after it's been sent
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user' && lastMessage.content === initialQuestion) {
        // Question has been processed, we can clear it
        // This prevents re-sending when component re-renders
      }
    }
  }, [messages, initialQuestion]);

  const sendMessageWithText = async (text: string, fromVoice = false) => {
    if (!text.trim() || inFlightRef.current) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      language: currentLanguage
    };

    const history = [...messages, userMessage].map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    inFlightRef.current = true;
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);
    setError(null);

    try {
      const useVoiceEndpoint = fromVoice || lastInputWasVoiceRef.current;
      lastInputWasVoiceRef.current = false;

      const aiResponseContent = useVoiceEndpoint
        ? await requestVoiceAssistant(history, currentLanguage)
        : await requestFarmingChat(history, currentLanguage);

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponseContent.trim(),
        timestamp: new Date(),
        language: currentLanguage
      };

      setMessages(prev => [...prev, aiResponse]);
      speakText(aiResponse.content);
    } catch (error) {
      let userFriendlyError = currentLanguage === 'bn'
        ? 'সংযোগ সমস্যা, অনুগ্রহ করে আবার চেষ্টা করুন'
        : 'Connection issue, please try again';

      if (error instanceof AiServiceError) {
        if (error.code === 'RATE_LIMIT') {
          userFriendlyError = currentLanguage === 'bn'
            ? 'ফ্রি AI কোটা এখন ব্যস্ত। কিছুক্ষণ পর আবার চেষ্টা করুন।'
            : 'The free AI quota is currently busy. Please wait a moment and try again.';
        } else if (error.code === 'NOT_CONFIGURED' || error.code === 'AUTH') {
          userFriendlyError = currentLanguage === 'bn'
            ? 'AI সেবা এখনো কনফিগার করা হয়নি। পরে চেষ্টা করুন।'
            : 'AI service is not configured yet. Please try again later.';
        } else if (error.code === 'TIMEOUT') {
          userFriendlyError = currentLanguage === 'bn'
            ? 'অনুরোধ সময়সীমা শেষ। অনুগ্রহ করে আবার চেষ্টা করুন।'
            : 'Request timeout. Please try again.';
        } else if (error.code === 'NETWORK') {
          userFriendlyError = currentLanguage === 'bn'
            ? 'ইন্টারনেট সংযোগ সমস্যা। অনুগ্রহ করে আপনার ইন্টারনেট চেক করুন।'
            : 'Connection issue, please check internet';
        } else if (error.message) {
          userFriendlyError = error.message;
        }
      } else if (error instanceof Error) {
        if (error.name === 'AbortError') {
          userFriendlyError = currentLanguage === 'bn'
            ? 'অনুরোধ সময়সীমা শেষ। অনুগ্রহ করে আবার চেষ্টা করুন।'
            : 'Request timeout. Please try again.';
        }
      }

      setError(userFriendlyError);
    } finally {
      inFlightRef.current = false;
      setIsProcessing(false);
    }
  };

  // Simple speech recognition
  const startListening = async () => {
    if (!isSpeechRecognitionSupported) {
      setError(currentLanguage === 'bn' 
        ? 'ভয়েস ইনপুট সাপোর্ট করা হয় না, অনুগ্রহ করে আপনার বার্তা টাইপ করুন' 
        : 'Voice input not supported, please type your message');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = currentLanguage === 'bn' ? 'bn-BD' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          lastInputWasVoiceRef.current = true;
          setInputText(finalTranscript);
          setInterimText('');
        } else {
          setInterimText(interimTranscript);
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        setInterimText('');
        
        let errorMessage = 'Speech recognition error';
        if (event.error === 'not-allowed') {
          errorMessage = currentLanguage === 'bn' 
            ? 'অনুগ্রহ করে মাইক্রোফোন অ্যাক্সেসের অনুমতি দিন' 
            : 'Please allow microphone access';
        } else if (event.error === 'no-speech') {
          errorMessage = currentLanguage === 'bn' 
            ? 'কোনো কথা শোনা যায়নি, অনুগ্রহ করে আবার চেষ্টা করুন' 
            : 'No speech detected, please try again';
        }
        
        setError(errorMessage);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognition.start();
    } catch (error) {
      setIsListening(false);
      setError(currentLanguage === 'bn' 
        ? 'ভয়েস রিকগনিশন ত্রুটি ঘটেছে' 
        : 'Speech recognition error occurred');
    }
  };

  const stopListening = () => {
    setIsListening(false);
    setInterimText('');
  };

  // Simple text-to-speech
  const speakText = (text: string) => {
    if (!isSpeechSynthesisSupported) return;

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLanguage === 'bn' ? 'bn-BD' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  };

  const stopSpeaking = () => {
    if (isSpeechSynthesisSupported) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Actual Dhenu API integration
  const sendMessage = async () => {
    if (!inputText.trim()) {
      setError(currentLanguage === 'bn' 
        ? 'দয়া করে আপনার প্রশ্ন বলুন বা টাইপ করুন' 
        : 'Please speak or type your question');
      return;
    }

    if (!isOnline) {
      setError(currentLanguage === 'bn' 
        ? 'ইন্টারনেট সংযোগ নেই। অনুগ্রহ করে আপনার সংযোগ চেক করুন।' 
        : 'No internet connection. Please check your connection.');
      return;
    }

    const currentInput = inputText;
    setInputText('');
    await sendMessageWithText(currentInput, lastInputWasVoiceRef.current);
  };

  const clearConversation = () => {
    setMessages([]);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Error Display */}
      {error && (
        <Card className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-600 flex-1">{error}</p>
            <Button
              onClick={() => setError(null)}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-100"
            >
              ✕
            </Button>
          </div>
        </Card>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <Card className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-blue-600 font-medium">
              {currentLanguage === 'bn' ? 'AI চিন্তা করছে...' : 'AI is thinking...'}
            </span>
          </div>
        </Card>
      )}

      {/* Chat Messages */}
      {messages.length > 0 && (
        <Card className="bg-white shadow-md rounded-2xl p-6 mb-6 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#2C3E50]">
              {currentLanguage === 'bn' ? 'কথোপকথন' : 'Conversation'}
            </h3>
            <Button
              onClick={clearConversation}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] p-3 rounded-lg",
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.role === 'assistant' && (
                      <Button
                        onClick={() => speakText(message.content)}
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto text-xs opacity-70 hover:opacity-100"
                      >
                        <Volume2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Input Section */}
      <Card className="bg-white shadow-md rounded-2xl p-6">
        {/* Input Field */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder={currentLanguage === 'bn' 
                ? 'আবহাওয়া, বাজার মূল্য বা চাষের পরামর্শ সম্পর্কে জিজ্ঞাসা করুন...' 
                : 'Ask about weather, market prices, or farming advice...'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              className={cn(
                "h-12 text-base border-[#E5E7EB] rounded-xl focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20 transition-all duration-300",
                isListening && "border-[#2ECC71] bg-green-50"
              )}
              disabled={isProcessing}
            />
            
            {/* Live Transcription */}
            {interimText && (
              <div className="absolute inset-0 flex items-center px-3 pointer-events-none">
                <span className="text-[#2ECC71] opacity-70 italic">
                  {interimText}
                </span>
              </div>
            )}
            
            {/* Listening Indicator */}
            {isListening && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-2 bg-[#2ECC71] rounded-full animate-pulse" />
                  <div className="w-1 h-3 bg-[#2ECC71] rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-2 bg-[#2ECC71] rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
          
          <Button
            onClick={sendMessage}
            disabled={!inputText.trim() || isProcessing}
            className="bg-[#2ECC71] hover:bg-[#27AE60] text-white h-12 px-4 rounded-xl disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex-1 h-px border-t-2 border-dotted border-[#E5E7EB]"></div>
          
          {/* Microphone Button */}
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={!isSpeechRecognitionSupported || isProcessing}
            className={cn(
              "w-16 h-16 rounded-full transition-all duration-300",
              isListening
                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                : "bg-[#2ECC71] hover:bg-[#27AE60] text-white hover:scale-105",
              (!isSpeechRecognitionSupported || isProcessing) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </Button>
          
          {/* Speech Control */}
          {isSpeechSynthesisSupported && (
            <Button
              onClick={isSpeaking ? stopSpeaking : () => {}}
              disabled={!isSpeaking}
              variant="outline"
              className="w-12 h-12 rounded-full"
            >
              {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          )}
          
          <div className="flex-1 h-px border-t-2 border-dotted border-[#E5E7EB]"></div>
        </div>

        {/* Status Text */}
        {(isListening || isSpeaking || isProcessing) && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              {isListening && (currentLanguage === 'bn' ? 'শুনছি...' : 'Listening...')}
              {isSpeaking && (currentLanguage === 'bn' ? 'বলছি...' : 'Speaking...')}
              {isProcessing && (currentLanguage === 'bn' ? 'প্রক্রিয়াকরণ...' : 'Processing...')}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SimpleVoiceAIInterface;