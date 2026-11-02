// Noise Cancellation Service - Provides noise reduction for voice input
export interface NoiseProfile {
  id: string;
  name: string;
  noiseFloor: number;
  frequencyProfile: Float32Array;
  adaptiveThreshold: number;
  createdAt: Date;
  environment: 'quiet' | 'moderate' | 'noisy' | 'outdoor' | 'indoor';
}

export interface NoiseCancellationConfig {
  enabled: boolean;
  aggressiveness: number; // 0-1, how aggressive the noise reduction is
  adaptiveMode: boolean; // Whether to adapt to changing noise conditions
  preserveVoiceQuality: boolean; // Balance between noise reduction and voice quality
  frequencyRange: { min: number; max: number }; // Focus on specific frequency range
  updateInterval: number; // How often to update noise profile (ms)
}

export interface NoiseAnalysis {
  noiseLevel: number;
  signalToNoiseRatio: number;
  dominantNoiseFrequencies: number[];
  voicePresent: boolean;
  confidence: number;
  timestamp: number;
}

export interface INoiseCancellationService {
  start(config?: Partial<NoiseCancellationConfig>): Promise<void>;
  stop(): void;
  isActive(): boolean;
  processAudioData(inputData: Float32Array): Float32Array;
  analyzeNoise(audioData: Float32Array): NoiseAnalysis;
  createNoiseProfile(name: string, environment: NoiseProfile['environment']): Promise<NoiseProfile>;
  updateNoiseProfile(profileId: string, audioData: Float32Array): void;
  setNoiseProfile(profileId: string): boolean;
  getCurrentProfile(): NoiseProfile | null;
  getConfig(): NoiseCancellationConfig;
  updateConfig(config: Partial<NoiseCancellationConfig>): void;
  onNoiseAnalysis(callback: (analysis: NoiseAnalysis) => void): void;
}

export class NoiseCancellationService implements INoiseCancellationService {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private gainNode: GainNode | null = null;
  private isRunning = false;

  private config: NoiseCancellationConfig = {
    enabled: true,
    aggressiveness: 0.5,
    adaptiveMode: true,
    preserveVoiceQuality: true,
    frequencyRange: { min: 80, max: 8000 }, // Human voice range
    updateInterval: 100 // Update every 100ms
  };

  private currentProfile: NoiseProfile | null = null;
  private noiseProfiles: Map<string, NoiseProfile> = new Map();
  private noiseBuffer: Float32Array = new Float32Array(0);
  private voiceBuffer: Float32Array = new Float32Array(0);
  private lastUpdateTime = 0;

  // Callbacks
  private onNoiseAnalysisCallback?: (analysis: NoiseAnalysis) => void;

  // Audio processing parameters
  private readonly bufferSize = 4096;
  private readonly sampleRate = 44100;
  private readonly fftSize = 2048;

  public async start(config?: Partial<NoiseCancellationConfig>): Promise<void> {
    if (this.isRunning) {
      return;
    }

    // Update configuration
    if (config) {
      this.updateConfig(config);
    }

    if (!this.config.enabled) {
      return;
    }

    try {
      // Request microphone access with noise suppression
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: false, // We'll handle this ourselves
          autoGainControl: false // We'll handle gain control
        }
      });

      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.sampleRate
      });

      // Create audio nodes
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.gainNode = this.audioContext.createGain();
      this.scriptProcessor = this.audioContext.createScriptProcessor(this.bufferSize, 1, 1);

      // Set up audio processing chain
      this.sourceNode.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);

      // Set up audio processing callback
      this.scriptProcessor.onaudioprocess = (event) => {
        this.processAudioBuffer(event);
      };

      // Initialize noise buffer
      this.noiseBuffer = new Float32Array(this.bufferSize);
      this.voiceBuffer = new Float32Array(this.bufferSize);

      this.isRunning = true;
      console.log('Noise cancellation service started');

    } catch (error) {
      console.error('Failed to start noise cancellation:', error);
      throw new Error('Could not initialize noise cancellation');
    }
  }

  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    // Clean up audio nodes
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    console.log('Noise cancellation service stopped');
  }

  public isActive(): boolean {
    return this.isRunning && this.config.enabled;
  }

  public processAudioData(inputData: Float32Array): Float32Array {
    if (!this.config.enabled || inputData.length === 0) {
      return inputData;
    }

    // Create output buffer
    const outputData = new Float32Array(inputData.length);

    // Apply noise cancellation algorithm
    if (this.currentProfile) {
      this.applySpectralSubtraction(inputData, outputData);
    } else {
      this.applyBasicNoiseReduction(inputData, outputData);
    }

    return outputData;
  }

  public analyzeNoise(audioData: Float32Array): NoiseAnalysis {
    const analysis = this.performNoiseAnalysis(audioData);
    
    if (this.onNoiseAnalysisCallback) {
      this.onNoiseAnalysisCallback(analysis);
    }

    return analysis;
  }

  public async createNoiseProfile(name: string, environment: NoiseProfile['environment']): Promise<NoiseProfile> {
    const profile: NoiseProfile = {
      id: this.generateId(),
      name,
      noiseFloor: 0,
      frequencyProfile: new Float32Array(this.fftSize / 2),
      adaptiveThreshold: 0.01,
      createdAt: new Date(),
      environment
    };

    this.noiseProfiles.set(profile.id, profile);
    return profile;
  }

  public updateNoiseProfile(profileId: string, audioData: Float32Array): void {
    const profile = this.noiseProfiles.get(profileId);
    if (!profile) {
      return;
    }

    // Update noise profile with new audio data
    const analysis = this.performNoiseAnalysis(audioData);
    
    // Update noise floor (exponential moving average)
    const alpha = 0.1; // Learning rate
    profile.noiseFloor = profile.noiseFloor * (1 - alpha) + analysis.noiseLevel * alpha;

    // Update frequency profile
    const frequencyData = this.calculateFrequencySpectrum(audioData);
    for (let i = 0; i < profile.frequencyProfile.length && i < frequencyData.length; i++) {
      profile.frequencyProfile[i] = profile.frequencyProfile[i] * (1 - alpha) + frequencyData[i] * alpha;
    }

    // Update adaptive threshold
    profile.adaptiveThreshold = Math.max(0.005, profile.noiseFloor * 1.5);

    this.noiseProfiles.set(profileId, profile);
  }

  public setNoiseProfile(profileId: string): boolean {
    const profile = this.noiseProfiles.get(profileId);
    if (!profile) {
      return false;
    }

    this.currentProfile = profile;
    return true;
  }

  public getCurrentProfile(): NoiseProfile | null {
    return this.currentProfile;
  }

  public getConfig(): NoiseCancellationConfig {
    return { ...this.config };
  }

  public updateConfig(config: Partial<NoiseCancellationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public onNoiseAnalysis(callback: (analysis: NoiseAnalysis) => void): void {
    this.onNoiseAnalysisCallback = callback;
  }

  private processAudioBuffer(event: AudioProcessingEvent): void {
    const inputBuffer = event.inputBuffer.getChannelData(0);
    const outputBuffer = event.outputBuffer.getChannelData(0);

    // Process audio data
    const processedData = this.processAudioData(inputBuffer);
    
    // Copy processed data to output
    for (let i = 0; i < outputBuffer.length; i++) {
      outputBuffer[i] = processedData[i];
    }

    // Analyze noise if enough time has passed
    const now = Date.now();
    if (now - this.lastUpdateTime >= this.config.updateInterval) {
      this.analyzeNoise(inputBuffer);
      this.lastUpdateTime = now;

      // Update noise profile if in adaptive mode
      if (this.config.adaptiveMode && this.currentProfile) {
        this.updateNoiseProfile(this.currentProfile.id, inputBuffer);
      }
    }
  }

  private applySpectralSubtraction(inputData: Float32Array, outputData: Float32Array): void {
    // Spectral subtraction algorithm using current noise profile
    const frequencyData = this.calculateFrequencySpectrum(inputData);
    const noiseProfile = this.currentProfile!.frequencyProfile;

    // Apply spectral subtraction
    for (let i = 0; i < frequencyData.length && i < noiseProfile.length; i++) {
      const signalPower = frequencyData[i] * frequencyData[i];
      const noisePower = noiseProfile[i] * noiseProfile[i];
      
      // Spectral subtraction with over-subtraction factor
      const alpha = this.config.aggressiveness * 2; // Over-subtraction factor
      const beta = 0.01; // Spectral floor factor
      
      let cleanPower = signalPower - alpha * noisePower;
      cleanPower = Math.max(cleanPower, beta * signalPower);
      
      frequencyData[i] = Math.sqrt(cleanPower) * Math.sign(frequencyData[i]);
    }

    // Convert back to time domain (simplified)
    this.frequencyToTimeDomain(frequencyData, outputData);
  }

  private applyBasicNoiseReduction(inputData: Float32Array, outputData: Float32Array): void {
    // Basic noise gate and smoothing
    const threshold = 0.01 * (1 - this.config.aggressiveness);
    
    for (let i = 0; i < inputData.length; i++) {
      const sample = inputData[i];
      const amplitude = Math.abs(sample);
      
      if (amplitude < threshold) {
        // Apply noise gate
        outputData[i] = sample * (this.config.preserveVoiceQuality ? 0.1 : 0);
      } else {
        // Apply gentle compression
        const compressionRatio = 1 - (this.config.aggressiveness * 0.3);
        outputData[i] = sample * compressionRatio;
      }
    }

    // Apply smoothing filter
    this.applySmoothingFilter(outputData);
  }

  private performNoiseAnalysis(audioData: Float32Array): NoiseAnalysis {
    // Calculate RMS (noise level)
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    const noiseLevel = Math.sqrt(sum / audioData.length);

    // Calculate frequency spectrum
    const frequencyData = this.calculateFrequencySpectrum(audioData);
    
    // Find dominant noise frequencies
    const dominantFrequencies: number[] = [];
    const threshold = Math.max(...frequencyData) * 0.7;
    
    for (let i = 0; i < frequencyData.length; i++) {
      if (Math.abs(frequencyData[i]) > threshold) {
        const frequency = (i * this.sampleRate) / (2 * frequencyData.length);
        if (frequency >= this.config.frequencyRange.min && frequency <= this.config.frequencyRange.max) {
          dominantFrequencies.push(frequency);
        }
      }
    }

    // Detect voice presence (heuristic based on frequency content)
    const voiceFrequencyRange = { min: 80, max: 3400 };
    let voiceEnergy = 0;
    let totalEnergy = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      const frequency = (i * this.sampleRate) / (2 * frequencyData.length);
      const energy = frequencyData[i] * frequencyData[i];
      
      totalEnergy += energy;
      
      if (frequency >= voiceFrequencyRange.min && frequency <= voiceFrequencyRange.max) {
        voiceEnergy += energy;
      }
    }

    const voicePresent = totalEnergy > 0 && (voiceEnergy / totalEnergy) > 0.3;
    const signalToNoiseRatio = this.currentProfile ? 
      Math.max(0, 20 * Math.log10(noiseLevel / Math.max(this.currentProfile.noiseFloor, 0.001))) : 0;

    // Calculate confidence based on signal strength and consistency
    const confidence = Math.min(1, Math.max(0, (noiseLevel - 0.001) / 0.1));

    return {
      noiseLevel,
      signalToNoiseRatio,
      dominantNoiseFrequencies: dominantFrequencies,
      voicePresent,
      confidence,
      timestamp: Date.now()
    };
  }

  private calculateFrequencySpectrum(audioData: Float32Array): Float32Array {
    // Simplified FFT implementation (in production, use a proper FFT library)
    const N = Math.min(audioData.length, this.fftSize);
    const spectrum = new Float32Array(N / 2);
    
    // Apply window function (Hamming window)
    const windowedData = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const window = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (N - 1));
      windowedData[i] = audioData[i] * window;
    }

    // Simple DFT (replace with proper FFT in production)
    for (let k = 0; k < spectrum.length; k++) {
      let real = 0;
      let imag = 0;
      
      for (let n = 0; n < N; n++) {
        const angle = -2 * Math.PI * k * n / N;
        real += windowedData[n] * Math.cos(angle);
        imag += windowedData[n] * Math.sin(angle);
      }
      
      spectrum[k] = Math.sqrt(real * real + imag * imag) / N;
    }

    return spectrum;
  }

  private frequencyToTimeDomain(frequencyData: Float32Array, outputData: Float32Array): void {
    // Simplified inverse FFT (in production, use proper IFFT)
    const N = Math.min(outputData.length, frequencyData.length * 2);
    
    for (let n = 0; n < outputData.length; n++) {
      let sample = 0;
      
      for (let k = 0; k < frequencyData.length; k++) {
        const angle = 2 * Math.PI * k * n / N;
        sample += frequencyData[k] * Math.cos(angle);
      }
      
      outputData[n] = sample / frequencyData.length;
    }
  }

  private applySmoothingFilter(data: Float32Array): void {
    // Simple low-pass filter for smoothing
    const alpha = 0.1; // Filter coefficient
    
    for (let i = 1; i < data.length; i++) {
      data[i] = data[i] * alpha + data[i - 1] * (1 - alpha);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get noise cancellation statistics
  public getStats(): {
    isActive: boolean;
    currentNoiseLevel: number;
    profilesCount: number;
    processingLatency: number;
  } {
    return {
      isActive: this.isActive(),
      currentNoiseLevel: this.currentProfile?.noiseFloor || 0,
      profilesCount: this.noiseProfiles.size,
      processingLatency: this.bufferSize / this.sampleRate * 1000 // ms
    };
  }

  // Create default noise profiles for common environments
  public async createDefaultProfiles(): Promise<void> {
    const environments: Array<{ name: string; env: NoiseProfile['environment'] }> = [
      { name: 'Quiet Indoor', env: 'quiet' },
      { name: 'Moderate Indoor', env: 'moderate' },
      { name: 'Noisy Indoor', env: 'noisy' },
      { name: 'Outdoor Environment', env: 'outdoor' }
    ];

    for (const { name, env } of environments) {
      await this.createNoiseProfile(name, env);
    }
  }

  // Static method to check if noise cancellation is supported
  public static isSupported(): boolean {
    return !!(
      typeof window !== 'undefined' &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      (window.AudioContext || (window as any).webkitAudioContext)
    );
  }
}