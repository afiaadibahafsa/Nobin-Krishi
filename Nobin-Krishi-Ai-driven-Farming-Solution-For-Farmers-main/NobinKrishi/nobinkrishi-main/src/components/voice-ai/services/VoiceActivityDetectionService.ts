// Voice Activity Detection Service - Detects when user is speaking vs silence
export interface VoiceActivityConfig {
  threshold: number; // Volume threshold for voice detection (0-1)
  minSpeechDuration: number; // Minimum duration to consider as speech (ms)
  maxSilenceDuration: number; // Maximum silence before stopping (ms)
  sampleRate: number; // Audio sample rate
  fftSize: number; // FFT size for frequency analysis
}

export interface VoiceActivityResult {
  isVoiceActive: boolean;
  volume: number;
  frequency: number;
  confidence: number;
  timestamp: number;
}

export interface IVoiceActivityDetectionService {
  start(config?: Partial<VoiceActivityConfig>): Promise<void>;
  stop(): void;
  isActive(): boolean;
  onVoiceActivity(callback: (result: VoiceActivityResult) => void): void;
  onSpeechStart(callback: () => void): void;
  onSpeechEnd(callback: () => void): void;
  getCurrentVolume(): number;
  getConfig(): VoiceActivityConfig;
  updateConfig(config: Partial<VoiceActivityConfig>): void;
}

export class VoiceActivityDetectionService implements IVoiceActivityDetectionService {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private isRunning = false;
  private animationFrame: number | null = null;
  
  private config: VoiceActivityConfig = {
    threshold: 0.01, // Low threshold for sensitive detection
    minSpeechDuration: 300, // 300ms minimum speech
    maxSilenceDuration: 2000, // 2 seconds max silence
    sampleRate: 16000,
    fftSize: 2048
  };

  private currentVolume = 0;
  private currentFrequency = 0;
  private speechStartTime = 0;
  private lastVoiceTime = 0;
  private isSpeechActive = false;

  // Callbacks
  private onVoiceActivityCallback?: (result: VoiceActivityResult) => void;
  private onSpeechStartCallback?: () => void;
  private onSpeechEndCallback?: () => void;

  // Audio analysis buffers
  private dataArray: Uint8Array = new Uint8Array(0);
  private frequencyData: Uint8Array = new Uint8Array(0);

  public async start(config?: Partial<VoiceActivityConfig>): Promise<void> {
    if (this.isRunning) {
      return;
    }

    // Update configuration
    if (config) {
      this.updateConfig(config);
    }

    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.config.sampleRate
      });

      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.config.fftSize;
      this.analyser.smoothingTimeConstant = 0.8;
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;

      // Connect microphone to analyser
      this.microphone = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.microphone.connect(this.analyser);

      // Initialize data arrays
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

      this.isRunning = true;
      this.startAnalysis();

    } catch (error) {
      console.error('Failed to start voice activity detection:', error);
      throw new Error('Could not access microphone for voice activity detection');
    }
  }

  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    // Stop animation frame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    // Clean up audio resources
    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.analyser = null;
    this.currentVolume = 0;
    this.currentFrequency = 0;
    this.isSpeechActive = false;
  }

  public isActive(): boolean {
    return this.isRunning;
  }

  public onVoiceActivity(callback: (result: VoiceActivityResult) => void): void {
    this.onVoiceActivityCallback = callback;
  }

  public onSpeechStart(callback: () => void): void {
    this.onSpeechStartCallback = callback;
  }

  public onSpeechEnd(callback: () => void): void {
    this.onSpeechEndCallback = callback;
  }

  public getCurrentVolume(): number {
    return this.currentVolume;
  }

  public getConfig(): VoiceActivityConfig {
    return { ...this.config };
  }

  public updateConfig(config: Partial<VoiceActivityConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private startAnalysis(): void {
    if (!this.isRunning || !this.analyser) {
      return;
    }

    // Get frequency and time domain data
    this.analyser.getByteFrequencyData(this.frequencyData);
    this.analyser.getByteTimeDomainData(this.dataArray);

    // Calculate volume (RMS)
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const sample = (this.dataArray[i] - 128) / 128;
      sum += sample * sample;
    }
    this.currentVolume = Math.sqrt(sum / this.dataArray.length);

    // Calculate dominant frequency
    let maxIndex = 0;
    let maxValue = 0;
    for (let i = 0; i < this.frequencyData.length; i++) {
      if (this.frequencyData[i] > maxValue) {
        maxValue = this.frequencyData[i];
        maxIndex = i;
      }
    }
    this.currentFrequency = (maxIndex * this.audioContext!.sampleRate) / (2 * this.frequencyData.length);

    // Voice activity detection logic
    const isVoiceDetected = this.currentVolume > this.config.threshold;
    const now = Date.now();

    if (isVoiceDetected) {
      this.lastVoiceTime = now;
      
      // Check if speech just started
      if (!this.isSpeechActive) {
        if (this.speechStartTime === 0) {
          this.speechStartTime = now;
        } else if (now - this.speechStartTime >= this.config.minSpeechDuration) {
          this.isSpeechActive = true;
          if (this.onSpeechStartCallback) {
            this.onSpeechStartCallback();
          }
        }
      }
    } else {
      // Check if speech ended (silence detected)
      if (this.isSpeechActive && now - this.lastVoiceTime >= this.config.maxSilenceDuration) {
        this.isSpeechActive = false;
        this.speechStartTime = 0;
        if (this.onSpeechEndCallback) {
          this.onSpeechEndCallback();
        }
      } else if (!this.isSpeechActive) {
        this.speechStartTime = 0;
      }
    }

    // Calculate confidence based on volume and frequency characteristics
    const volumeConfidence = Math.min(this.currentVolume / this.config.threshold, 1);
    const frequencyConfidence = this.currentFrequency > 80 && this.currentFrequency < 8000 ? 1 : 0.5;
    const confidence = (volumeConfidence + frequencyConfidence) / 2;

    // Create result
    const result: VoiceActivityResult = {
      isVoiceActive: isVoiceDetected,
      volume: this.currentVolume,
      frequency: this.currentFrequency,
      confidence,
      timestamp: now
    };

    // Call callback if provided
    if (this.onVoiceActivityCallback) {
      this.onVoiceActivityCallback(result);
    }

    // Continue analysis
    this.animationFrame = requestAnimationFrame(() => this.startAnalysis());
  }

  // Utility method to check if browser supports voice activity detection
  public static isSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      (window.AudioContext || (window as any).webkitAudioContext)
    );
  }

  // Get audio processing capabilities
  public getCapabilities(): {
    sampleRate: number;
    channelCount: number;
    echoCancellation: boolean;
    noiseSuppression: boolean;
    autoGainControl: boolean;
  } | null {
    if (!this.mediaStream) {
      return null;
    }

    const audioTrack = this.mediaStream.getAudioTracks()[0];
    if (!audioTrack) {
      return null;
    }

    const settings = audioTrack.getSettings();
    return {
      sampleRate: settings.sampleRate || this.config.sampleRate,
      channelCount: settings.channelCount || 1,
      echoCancellation: settings.echoCancellation || false,
      noiseSuppression: settings.noiseSuppression || false,
      autoGainControl: settings.autoGainControl || false
    };
  }
}