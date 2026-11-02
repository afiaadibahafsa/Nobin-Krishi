# Voice AI Chat System

This directory contains the core Voice AI infrastructure and services for the NobinKrishi platform. The system provides voice-to-voice conversation capabilities with AI assistance for agricultural queries in both Bangla and English.

## Architecture

The Voice AI system consists of three main services:

1. **SpeechRecognitionService** - Handles voice input using Web Speech API
2. **SpeechSynthesisService** - Handles text-to-speech output using Web Speech API  
3. **DhenuAPIClient** - Handles communication with the Dhenu AI service

## Core Components

### VoiceAIChat Hook

The main hook that provides all Voice AI functionality:

```typescript
import { useVoiceAIChat } from '@/components/voice-ai';

const MyComponent = () => {
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
  } = useVoiceAIChat({ 
    apiKey: 'your-dhenu-api-key',
    defaultLanguage: 'bn',
    maxHistoryLength: 5
  });

  // Use the hook functionality in your component
};
```

### Services

#### SpeechRecognitionService

Handles voice input with automatic language detection and error handling:

```typescript
import { SpeechRecognitionService } from '@/components/voice-ai';

const speechService = new SpeechRecognitionService();

// Check if supported
if (speechService.isSupported()) {
  // Set up callbacks
  speechService.onResult((text, isFinal) => {
    console.log('Transcript:', text, 'Final:', isFinal);
  });

  speechService.onError((error) => {
    console.error('Speech error:', error);
  });

  // Start listening
  await speechService.startListening('bn-BD'); // or 'en-US'
}
```

#### SpeechSynthesisService

Handles text-to-speech output with voice customization:

```typescript
import { SpeechSynthesisService } from '@/components/voice-ai';

const ttsService = new SpeechSynthesisService();

if (ttsService.isSupported()) {
  await ttsService.speak('Hello world', 'en-US', {
    rate: 0.9,
    pitch: 1.0,
    volume: 1.0
  });
}
```

#### DhenuAPIClient

Handles AI communication with proper authentication:

```typescript
import { DhenuAPIClient } from '@/components/voice-ai';

const apiClient = new DhenuAPIClient('your-api-key');

const messages = [
  { role: 'user', content: 'What crops should I plant this season?' }
];

const response = await apiClient.sendMessage(messages);
console.log('AI Response:', response);
```

## Features

### Language Support
- **Bangla (bn-BD)**: Native support for Bangla voice input and output
- **English (en-US)**: Full English language support
- **Dynamic switching**: Users can switch languages mid-conversation

### Voice Recognition
- **Continuous listening**: Real-time speech recognition with interim results
- **Auto-stop**: Automatically stops listening after 2 seconds of silence
- **Error handling**: Comprehensive error handling for various failure modes
- **Browser compatibility**: Works with both Chrome and Safari speech APIs

### Text-to-Speech
- **Natural voices**: Uses system voices optimized for each language
- **Customizable settings**: Adjustable rate, pitch, and volume
- **Long text handling**: Automatically chunks long responses for better synthesis
- **Playback controls**: Pause, resume, stop, and replay functionality

### AI Integration
- **Agricultural context**: Specialized system prompts for farming advice
- **Conversation memory**: Maintains context of last 5 messages
- **Error recovery**: Robust error handling with retry functionality
- **Rate limiting**: Built-in protection against API abuse

## Browser Compatibility

### Speech Recognition
- ✅ Chrome 25+
- ✅ Edge 79+
- ✅ Safari 14.1+
- ❌ Firefox (not supported)

### Speech Synthesis
- ✅ Chrome 33+
- ✅ Firefox 49+
- ✅ Safari 7+
- ✅ Edge 14+

## Error Handling

The system includes comprehensive error handling for:

- **Microphone permission denied**
- **Network connectivity issues**
- **API authentication failures**
- **Speech recognition timeouts**
- **Text-to-speech failures**
- **Browser compatibility issues**

## Usage Example

See `VoiceAIChatExample.tsx` for a complete implementation example showing how to integrate all the Voice AI functionality into a React component.

## Requirements Validation

This implementation satisfies the following requirements:

- **1.1**: ✅ Web Speech API integration for voice input
- **2.1**: ✅ Dhenu API integration with proper authentication
- **3.1**: ✅ Speech synthesis for voice output
- **Language support**: ✅ Bangla (bn-BD) and English (en-US)
- **Error handling**: ✅ Comprehensive fallback systems
- **TypeScript interfaces**: ✅ Fully typed implementation

## Next Steps

This infrastructure is ready for integration into the main VoiceAI page. The next tasks will build upon these services to create the complete user interface and additional features like conversation memory, settings panels, and advanced voice controls.