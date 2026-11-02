import React from 'react';
import { useVoiceAIChat } from './VoiceAIChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Send, Globe } from 'lucide-react';

interface VoiceAIChatExampleProps {
  apiKey: string;
}

const VoiceAIChatExample: React.FC<VoiceAIChatExampleProps> = ({ apiKey }) => {
  const {
    state,
    voiceSettings,
    startListening,
    stopListening,
    sendMessage,
    speakText,
    toggleLanguage,
    clearConversation,
    handleInputChange,
    handleSend,
    toggleMicrophone,
    setVoiceSettings,
    isSpeechRecognitionSupported,
    isSpeechSynthesisSupported
  } = useVoiceAIChat({ apiKey });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Voice AI Chat</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLanguage}
          >
            <Globe className="w-4 h-4 mr-2" />
            {state.currentLanguage === 'bn' ? 'বাংলা' : 'English'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearConversation}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Service Status */}
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Speech Recognition: </span>
            <span className={isSpeechRecognitionSupported ? 'text-green-600' : 'text-red-600'}>
              {isSpeechRecognitionSupported ? 'Supported' : 'Not Supported'}
            </span>
          </div>
          <div>
            <span className="font-medium">Speech Synthesis: </span>
            <span className={isSpeechSynthesisSupported ? 'text-green-600' : 'text-red-600'}>
              {isSpeechSynthesisSupported ? 'Supported' : 'Not Supported'}
            </span>
          </div>
        </div>
      </Card>

      {/* Error Display */}
      {state.error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-600">{state.error}</p>
        </Card>
      )}

      {/* Messages */}
      <Card className="p-4 min-h-[300px] max-h-[400px] overflow-y-auto">
        {state.messages.length === 0 ? (
          <p className="text-gray-500 text-center">No messages yet. Start a conversation!</p>
        ) : (
          <div className="space-y-4">
            {state.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  <p>{message.content}</p>
                  <div className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString()} • {message.language === 'bn' ? '🇧🇩' : '🇬🇧'}
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => speakText(message.content, message.language)}
                        className="ml-2 underline"
                      >
                        Replay
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Input Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Input
            type="text"
            placeholder={
              state.currentLanguage === 'bn'
                ? 'আপনার প্রশ্ন লিখুন...'
                : 'Type your question...'
            }
            value={state.inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
            disabled={state.isProcessing}
          />
          <Button
            onClick={handleSend}
            disabled={!state.inputText.trim() || state.isProcessing}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Microphone Button */}
        <div className="flex justify-center">
          <Button
            onClick={toggleMicrophone}
            disabled={!isSpeechRecognitionSupported || state.isProcessing}
            className={`w-16 h-16 rounded-full ${
              state.isListening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {state.isListening ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </Button>
        </div>

        {/* Status */}
        <div className="text-center text-sm text-gray-600">
          {state.isListening && 'Listening...'}
          {state.isProcessing && 'AI is thinking...'}
          {state.isSpeaking && 'Speaking...'}
          {!state.isListening && !state.isProcessing && !state.isSpeaking && 'Ready'}
        </div>
      </div>

      {/* Voice Settings */}
      <Card className="p-4">
        <h3 className="font-medium mb-3">Voice Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Speed: {voiceSettings.rate}</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voiceSettings.rate}
              onChange={(e) =>
                setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              <input
                type="checkbox"
                checked={voiceSettings.autoSpeak}
                onChange={(e) =>
                  setVoiceSettings(prev => ({ ...prev, autoSpeak: e.target.checked }))
                }
                className="mr-2"
              />
              Auto-speak responses
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VoiceAIChatExample;