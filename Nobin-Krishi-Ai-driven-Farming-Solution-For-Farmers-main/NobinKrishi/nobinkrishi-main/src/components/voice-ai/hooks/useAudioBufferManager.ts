// Audio buffer management hook for efficient audio processing
import { useCallback, useRef, useEffect, useState } from 'react';

export interface AudioBufferConfig {
  maxBufferSize: number;
  sampleRate: number;
  channelCount: number;
  bufferDuration: number;
}

export interface AudioBufferState {
  isRecording: boolean;
  bufferSize: number;
  bufferUsage: number;
  audioLevel: number;
  hasAudioData: boolean;
}

/**
 * Hook for managing audio buffers efficiently to minimize memory usage
 * and optimize audio processing performance
 */
export const useAudioBufferManager = (config: Partial<AudioBufferConfig> = {}) => {
  const {
    maxBufferSize = 1024 * 1024, // 1MB default
    sampleRate = 44100,
    channelCount = 1,
    bufferDuration = 5000 // 5 seconds
  } = config;

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const bufferRef = useRef<Float32Array[]>([]);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const animationFrameRef = useRef<number>();

  const [state, setState] = useState<AudioBufferState>({
    isRecording: false,
    bufferSize: 0,
    bufferUsage: 0,
    audioLevel: 0,
    hasAudioData: false
  });

  // Initialize audio context
  const initializeAudioContext = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate,
          latencyHint: 'interactive'
        });
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      return audioContextRef.current;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw new Error('Audio context initialization failed');
    }
  }, [sampleRate]);

  // Get microphone stream
  const getMicrophoneStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate,
          channelCount,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      mediaStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.error('Failed to get microphone stream:', error);
      throw new Error('Microphone access failed');
    }
  }, [sampleRate, channelCount]);

  // Create audio analyser for level monitoring
  const createAnalyser = useCallback((audioContext: AudioContext, source: MediaStreamAudioSourceNode) => {
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    
    source.connect(analyser);
    analyserRef.current = analyser;
    
    return analyser;
  }, []);

  // Monitor audio levels
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate RMS (Root Mean Square) for audio level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const audioLevel = rms / 255; // Normalize to 0-1
      
      setState(prev => ({
        ...prev,
        audioLevel
      }));
      
      if (state.isRecording) {
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      }
    };
    
    updateLevel();
  }, [state.isRecording]);

  // Add audio data to buffer
  const addToBuffer = useCallback((audioData: Float32Array) => {
    // Check buffer size limit
    const currentBufferSize = bufferRef.current.reduce((size, buffer) => size + buffer.length * 4, 0);
    
    if (currentBufferSize + audioData.length * 4 > maxBufferSize) {
      // Remove oldest buffer chunks to make space
      while (bufferRef.current.length > 0 && 
             currentBufferSize + audioData.length * 4 > maxBufferSize) {
        const removed = bufferRef.current.shift();
        if (removed) {
          // Update buffer size calculation
          break;
        }
      }
    }

    // Add new audio data
    bufferRef.current.push(new Float32Array(audioData));
    
    // Update state
    const newBufferSize = bufferRef.current.reduce((size, buffer) => size + buffer.length * 4, 0);
    setState(prev => ({
      ...prev,
      bufferSize: newBufferSize,
      bufferUsage: (newBufferSize / maxBufferSize) * 100,
      hasAudioData: bufferRef.current.length > 0
    }));
  }, [maxBufferSize]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const audioContext = await initializeAudioContext();
      const stream = await getMicrophoneStream();
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = createAnalyser(audioContext, source);
      
      // Create script processor for audio data capture
      const bufferSize = 4096;
      const processor = audioContext.createScriptProcessor(bufferSize, channelCount, channelCount);
      
      processor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer;
        const audioData = inputBuffer.getChannelData(0);
        addToBuffer(audioData);
      };
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      
      processorRef.current = processor;
      
      setState(prev => ({
        ...prev,
        isRecording: true
      }));
      
      // Start monitoring audio levels
      monitorAudioLevel();
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }, [initializeAudioContext, getMicrophoneStream, createAnalyser, channelCount, addToBuffer, monitorAudioLevel]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setState(prev => ({
      ...prev,
      isRecording: false,
      audioLevel: 0
    }));
  }, []);

  // Get buffered audio data
  const getBufferedAudio = useCallback(() => {
    if (bufferRef.current.length === 0) return null;

    // Concatenate all buffer chunks
    const totalLength = bufferRef.current.reduce((length, buffer) => length + buffer.length, 0);
    const result = new Float32Array(totalLength);
    
    let offset = 0;
    for (const buffer of bufferRef.current) {
      result.set(buffer, offset);
      offset += buffer.length;
    }
    
    return result;
  }, []);

  // Clear buffer
  const clearBuffer = useCallback(() => {
    bufferRef.current = [];
    setState(prev => ({
      ...prev,
      bufferSize: 0,
      bufferUsage: 0,
      hasAudioData: false
    }));
  }, []);

  // Get buffer statistics
  const getBufferStats = useCallback(() => {
    const totalSamples = bufferRef.current.reduce((count, buffer) => count + buffer.length, 0);
    const durationSeconds = totalSamples / sampleRate;
    const memoryUsage = bufferRef.current.reduce((size, buffer) => size + buffer.length * 4, 0);
    
    return {
      totalSamples,
      durationSeconds,
      memoryUsage,
      bufferChunks: bufferRef.current.length,
      maxBufferSize,
      usagePercentage: (memoryUsage / maxBufferSize) * 100
    };
  }, [sampleRate, maxBufferSize]);

  // Optimize buffer (remove silence, compress, etc.)
  const optimizeBuffer = useCallback(() => {
    if (bufferRef.current.length === 0) return;

    const silenceThreshold = 0.01;
    const optimizedBuffers: Float32Array[] = [];

    for (const buffer of bufferRef.current) {
      // Remove leading and trailing silence
      let start = 0;
      let end = buffer.length - 1;

      // Find start of audio
      while (start < buffer.length && Math.abs(buffer[start]) < silenceThreshold) {
        start++;
      }

      // Find end of audio
      while (end > start && Math.abs(buffer[end]) < silenceThreshold) {
        end--;
      }

      if (start < end) {
        const trimmedBuffer = buffer.slice(start, end + 1);
        optimizedBuffers.push(trimmedBuffer);
      }
    }

    bufferRef.current = optimizedBuffers;
    
    // Update state
    const newBufferSize = bufferRef.current.reduce((size, buffer) => size + buffer.length * 4, 0);
    setState(prev => ({
      ...prev,
      bufferSize: newBufferSize,
      bufferUsage: (newBufferSize / maxBufferSize) * 100
    }));
  }, [maxBufferSize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      clearBuffer();
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopRecording, clearBuffer]);

  return {
    state,
    startRecording,
    stopRecording,
    getBufferedAudio,
    clearBuffer,
    getBufferStats,
    optimizeBuffer,
    isSupported: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  };
};