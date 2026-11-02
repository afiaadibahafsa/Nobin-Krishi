import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Send, Mic, MicOff, Loader2, Volume2, VolumeX, RotateCcw, Trash2 } from 'lucide-react';

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

  // Helper function to send message with specific text
  const sendMessageWithText = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      language: currentLanguage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);
    setError(null);

    try {
      // Use actual Dhenu API
      const apiKey = "dh-6N16jV-_8pQfntwCAmcAGmqmxLpz3vWsplNZwGSB_lU";
      const baseURL = "https://api.dhenu.ai/v1";
      
      // Prepare system message for agricultural context
      const systemMessage = {
        role: 'system',
        content: 'You are a helpful agricultural assistant for farmers in Bangladesh. Provide practical, accurate advice about farming, crops, weather, market prices, and agricultural best practices. Respond in the same language as the user\'s question (Bangla or English). Keep responses concise and actionable.'
      };

      // Prepare conversation context (last 5 messages)
      const contextMessages = messages.slice(-4).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const requestBody = {
        model: 'dhenu2-in-8b-preview',
        messages: [
          systemMessage,
          ...contextMessages,
          { role: 'user', content: text }
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: false
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData.error && errorData.error.message) {
            errorMessage = errorData.error.message;
          }
        } catch (parseError) {
          // If we can't parse the error response, use the status text
        }

        // Handle specific HTTP status codes
        switch (response.status) {
          case 400:
            throw new Error('Invalid request format');
          case 401:
            throw new Error('Invalid API key');
          case 403:
            throw new Error('API access forbidden');
          case 404:
            throw new Error('Dhenu API endpoint not found - API may be temporarily unavailable');
          case 429:
            throw new Error('Rate limit exceeded. Please try again later.');
          case 500:
            throw new Error('AI service temporarily unavailable');
          case 502:
          case 503:
          case 504:
            throw new Error('AI service temporarily unavailable');
          default:
            throw new Error(errorMessage);
        }
      }

      const data = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from AI service');
      }

      const aiResponseContent = data.choices[0].message.content;
      
      if (!aiResponseContent || aiResponseContent.trim() === '') {
        throw new Error('Empty response from AI service');
      }

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponseContent.trim(),
        timestamp: new Date(),
        language: currentLanguage
      };

      setMessages(prev => [...prev, aiResponse]);
      
      // Auto-speak the response
      speakText(aiResponse.content);
      
    } catch (error) {
      console.error('Dhenu API Error:', error);
      
      let userFriendlyError = 'Connection issue, please try again';
      let fallbackResponse = '';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          userFriendlyError = currentLanguage === 'bn' 
            ? 'অনুরোধ সময়সীমা শেষ। অনুগ্রহ করে আবার চেষ্টা করুন।' 
            : 'Request timeout. Please try again.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          userFriendlyError = currentLanguage === 'bn' 
            ? 'ইন্টারনেট সংযোগ সমস্যা। অনুগ্রহ করে আপনার ইন্টারনেট চেক করুন।' 
            : 'Connection issue, please check internet';
        } else if (error.message.includes('401') || error.message.includes('Invalid API key')) {
          userFriendlyError = currentLanguage === 'bn' 
            ? 'API কী সমস্যা। অনুগ্রহ করে পরে চেষ্টা করুন।' 
            : 'API authentication issue. Please try again later.';
        } else if (error.message.includes('429') || error.message.includes('Rate limit')) {
          userFriendlyError = currentLanguage === 'bn' 
            ? 'অনেক অনুরোধ। কিছুক্ষণ পর চেষ্টা করুন।' 
            : 'Too many requests. Please try again in a moment.';
        } else if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503') || error.message.includes('504') || error.message.includes('temporarily unavailable')) {
          userFriendlyError = currentLanguage === 'bn' 
            ? 'AI সেবা সাময়িকভাবে বন্ধ। পরে চেষ্টা করুন।' 
            : 'AI service temporarily unavailable. Please try again.';
        } else if (error.message.includes('404') || error.message.includes('endpoint not found')) {
          userFriendlyError = currentLanguage === 'bn' 
            ? 'Dhenu AI সেবা সাময়িকভাবে অনুপলব্ধ। আমরা সমস্যা সমাধানের চেষ্টা করছি।' 
            : 'Dhenu AI service temporarily unavailable. We are working to resolve this issue.';
          
          // Provide a helpful fallback response
          fallbackResponse = currentLanguage === 'bn' 
            ? `আপনার প্রশ্ন "${text}" এর জন্য ধন্যবাদ। দুঃখিত, AI সেবা এই মুহূর্তে অনুপলব্ধ। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন। এই সময়ে আপনি আমাদের ওয়েবসাইটের অন্যান্য বৈশিষ্ট্য ব্যবহার করতে পারেন।`
            : `Thank you for your question "${text}". Sorry, the AI service is currently unavailable. Please try again in a few moments. In the meantime, you can explore other features of our website.`;
        } else {
          userFriendlyError = currentLanguage === 'bn' 
            ? 'সংযোগ সমস্যা, অনুগ্রহ করে আবার চেষ্টা করুন' 
            : 'Connection issue, please try again';
        }
      }
      
      // If we have a fallback response, show it instead of just an error
      if (fallbackResponse) {
        const fallbackMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fallbackResponse,
          timestamp: new Date(),
          language: currentLanguage
        };

        setMessages(prev => [...prev, fallbackMessage]);
        speakText(fallbackResponse);
      } else {
        setError(userFriendlyError);
      }
    } finally {
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
    await sendMessageWithText(currentInput);
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