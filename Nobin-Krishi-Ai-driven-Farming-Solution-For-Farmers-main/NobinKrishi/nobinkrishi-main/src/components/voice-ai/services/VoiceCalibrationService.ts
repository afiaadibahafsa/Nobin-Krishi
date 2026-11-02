// Voice Calibration Service - Handles voice training and calibration
export interface VoiceProfile {
  id: string;
  name: string;
  language: 'bn' | 'en';
  createdAt: Date;
  lastUpdated: Date;
  calibrationData: {
    averageVolume: number;
    frequencyRange: { min: number; max: number };
    speechRate: number;
    pauseDuration: number;
    noiseFloor: number;
    voiceCharacteristics: {
      pitch: { min: number; max: number; average: number };
      formants: number[];
      spectralCentroid: number;
    };
  };
  recognitionAccuracy: number;
  sampleCount: number;
}

export interface CalibrationSession {
  id: string;
  profileId: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
  currentStep: number;
  totalSteps: number;
  samples: CalibrationSample[];
}

export interface CalibrationSample {
  id: string;
  text: string;
  expectedText: string;
  audioData: Float32Array;
  recognizedText: string;
  confidence: number;
  duration: number;
  volume: number;
  frequency: number;
  timestamp: Date;
}

export interface CalibrationConfig {
  minSamples: number;
  maxSamples: number;
  sampleDuration: number; // seconds
  volumeThreshold: number;
  noiseThreshold: number;
  accuracyThreshold: number;
  autoSave: boolean;
}

export interface IVoiceCalibrationService {
  createProfile(name: string, language: 'bn' | 'en'): Promise<VoiceProfile>;
  getProfile(profileId: string): VoiceProfile | null;
  getAllProfiles(): VoiceProfile[];
  deleteProfile(profileId: string): boolean;
  startCalibration(profileId: string): Promise<CalibrationSession>;
  addCalibrationSample(sessionId: string, sample: Omit<CalibrationSample, 'id' | 'timestamp'>): Promise<void>;
  completeCalibration(sessionId: string): Promise<VoiceProfile>;
  cancelCalibration(sessionId: string): void;
  getCalibrationSession(sessionId: string): CalibrationSession | null;
  updateProfile(profileId: string, updates: Partial<VoiceProfile>): boolean;
  getOptimalSettings(profileId: string): {
    speechRecognition: any;
    speechSynthesis: any;
    voiceActivity: any;
  } | null;
  exportProfile(profileId: string): string;
  importProfile(profileData: string): Promise<VoiceProfile>;
}

export class VoiceCalibrationService implements IVoiceCalibrationService {
  private profiles: Map<string, VoiceProfile> = new Map();
  private sessions: Map<string, CalibrationSession> = new Map();
  private config: CalibrationConfig = {
    minSamples: 5,
    maxSamples: 20,
    sampleDuration: 3, // 3 seconds per sample
    volumeThreshold: 0.01,
    noiseThreshold: 0.005,
    accuracyThreshold: 0.8,
    autoSave: true
  };

  // Calibration phrases for different languages
  private readonly calibrationPhrases = {
    bn: [
      'আমি একজন কৃষক',
      'আমার জমিতে ধান চাষ করি',
      'আবহাওয়া কেমন আছে',
      'ফসলের যত্ন নিতে হবে',
      'বীজ বপনের সময় হয়েছে',
      'সার দিতে হবে জমিতে',
      'পানি সেচ দেওয়া দরকার',
      'কীটপতঙ্গ দমন করতে হবে',
      'ফসল কাটার সময় এসেছে',
      'বাজারে ভাল দাম পাওয়া যাবে'
    ],
    en: [
      'I am a farmer',
      'I grow rice in my field',
      'How is the weather today',
      'Need to take care of crops',
      'Time to plant the seeds',
      'Apply fertilizer to the soil',
      'Irrigation is necessary now',
      'Control pests and diseases',
      'Harvest time has arrived',
      'Good price in the market'
    ]
  };

  constructor() {
    this.loadProfilesFromStorage();
  }

  public async createProfile(name: string, language: 'bn' | 'en'): Promise<VoiceProfile> {
    const profile: VoiceProfile = {
      id: this.generateId(),
      name,
      language,
      createdAt: new Date(),
      lastUpdated: new Date(),
      calibrationData: {
        averageVolume: 0,
        frequencyRange: { min: 0, max: 0 },
        speechRate: 0,
        pauseDuration: 0,
        noiseFloor: 0,
        voiceCharacteristics: {
          pitch: { min: 0, max: 0, average: 0 },
          formants: [],
          spectralCentroid: 0
        }
      },
      recognitionAccuracy: 0,
      sampleCount: 0
    };

    this.profiles.set(profile.id, profile);
    
    if (this.config.autoSave) {
      this.saveProfilesToStorage();
    }

    return profile;
  }

  public getProfile(profileId: string): VoiceProfile | null {
    return this.profiles.get(profileId) || null;
  }

  public getAllProfiles(): VoiceProfile[] {
    return Array.from(this.profiles.values());
  }

  public deleteProfile(profileId: string): boolean {
    const deleted = this.profiles.delete(profileId);
    
    if (deleted && this.config.autoSave) {
      this.saveProfilesToStorage();
    }

    return deleted;
  }

  public async startCalibration(profileId: string): Promise<CalibrationSession> {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    const session: CalibrationSession = {
      id: this.generateId(),
      profileId,
      startTime: new Date(),
      status: 'active',
      progress: 0,
      currentStep: 0,
      totalSteps: this.config.minSamples,
      samples: []
    };

    this.sessions.set(session.id, session);
    return session;
  }

  public async addCalibrationSample(
    sessionId: string, 
    sample: Omit<CalibrationSample, 'id' | 'timestamp'>
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'active') {
      throw new Error('Invalid or inactive calibration session');
    }

    const calibrationSample: CalibrationSample = {
      ...sample,
      id: this.generateId(),
      timestamp: new Date()
    };

    session.samples.push(calibrationSample);
    session.currentStep = session.samples.length;
    session.progress = (session.currentStep / session.totalSteps) * 100;

    // Update session
    this.sessions.set(sessionId, session);
  }

  public async completeCalibration(sessionId: string): Promise<VoiceProfile> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'active') {
      throw new Error('Invalid or inactive calibration session');
    }

    const profile = this.profiles.get(session.profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Analyze calibration samples and update profile
    const analysisResult = this.analyzeSamples(session.samples);
    
    // Update profile with calibration data
    profile.calibrationData = analysisResult.calibrationData;
    profile.recognitionAccuracy = analysisResult.accuracy;
    profile.sampleCount = session.samples.length;
    profile.lastUpdated = new Date();

    // Mark session as completed
    session.status = 'completed';
    session.endTime = new Date();
    session.progress = 100;

    // Save updates
    this.profiles.set(profile.id, profile);
    this.sessions.set(sessionId, session);

    if (this.config.autoSave) {
      this.saveProfilesToStorage();
    }

    return profile;
  }

  public cancelCalibration(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'cancelled';
      session.endTime = new Date();
      this.sessions.set(sessionId, session);
    }
  }

  public getCalibrationSession(sessionId: string): CalibrationSession | null {
    return this.sessions.get(sessionId) || null;
  }

  public updateProfile(profileId: string, updates: Partial<VoiceProfile>): boolean {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      return false;
    }

    const updatedProfile = { ...profile, ...updates, lastUpdated: new Date() };
    this.profiles.set(profileId, updatedProfile);

    if (this.config.autoSave) {
      this.saveProfilesToStorage();
    }

    return true;
  }

  public getOptimalSettings(profileId: string): {
    speechRecognition: any;
    speechSynthesis: any;
    voiceActivity: any;
  } | null {
    const profile = this.profiles.get(profileId);
    if (!profile || profile.sampleCount === 0) {
      return null;
    }

    const { calibrationData } = profile;

    return {
      speechRecognition: {
        continuous: true,
        interimResults: true,
        maxAlternatives: 3,
        lang: profile.language === 'bn' ? 'bn-BD' : 'en-US'
      },
      speechSynthesis: {
        rate: Math.max(0.5, Math.min(2.0, calibrationData.speechRate)),
        pitch: calibrationData.voiceCharacteristics.pitch.average / 100,
        volume: Math.max(0.1, Math.min(1.0, calibrationData.averageVolume * 2))
      },
      voiceActivity: {
        threshold: Math.max(calibrationData.noiseFloor * 2, 0.01),
        minSpeechDuration: Math.max(200, calibrationData.pauseDuration * 0.5),
        maxSilenceDuration: Math.max(1000, calibrationData.pauseDuration * 2)
      }
    };
  }

  public exportProfile(profileId: string): string {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    return JSON.stringify(profile, null, 2);
  }

  public async importProfile(profileData: string): Promise<VoiceProfile> {
    try {
      const profile: VoiceProfile = JSON.parse(profileData);
      
      // Validate profile structure
      if (!profile.id || !profile.name || !profile.language) {
        throw new Error('Invalid profile data');
      }

      // Generate new ID to avoid conflicts
      profile.id = this.generateId();
      profile.lastUpdated = new Date();

      this.profiles.set(profile.id, profile);

      if (this.config.autoSave) {
        this.saveProfilesToStorage();
      }

      return profile;
    } catch (error) {
      throw new Error('Failed to import profile: Invalid data format');
    }
  }

  // Get calibration phrases for a language
  public getCalibrationPhrases(language: 'bn' | 'en', count?: number): string[] {
    const phrases = this.calibrationPhrases[language];
    if (!count || count >= phrases.length) {
      return [...phrases];
    }

    // Return random selection of phrases
    const shuffled = [...phrases].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // Get recommended calibration settings
  public getRecommendedCalibrationSettings(language: 'bn' | 'en'): {
    sampleCount: number;
    phrases: string[];
    duration: number;
  } {
    const phrases = this.getCalibrationPhrases(language, this.config.minSamples);
    
    return {
      sampleCount: this.config.minSamples,
      phrases,
      duration: this.config.sampleDuration
    };
  }

  private analyzeSamples(samples: CalibrationSample[]): {
    calibrationData: VoiceProfile['calibrationData'];
    accuracy: number;
  } {
    if (samples.length === 0) {
      throw new Error('No samples to analyze');
    }

    // Calculate average volume
    const averageVolume = samples.reduce((sum, sample) => sum + sample.volume, 0) / samples.length;

    // Calculate frequency range
    const frequencies = samples.map(sample => sample.frequency);
    const frequencyRange = {
      min: Math.min(...frequencies),
      max: Math.max(...frequencies)
    };

    // Calculate speech rate (words per minute)
    const totalWords = samples.reduce((sum, sample) => {
      return sum + sample.expectedText.split(/\s+/).length;
    }, 0);
    const totalDuration = samples.reduce((sum, sample) => sum + sample.duration, 0);
    const speechRate = totalDuration > 0 ? (totalWords / totalDuration) * 60 : 0;

    // Calculate average pause duration (simplified)
    const pauseDuration = samples.reduce((sum, sample) => sum + sample.duration, 0) / samples.length;

    // Calculate noise floor (minimum volume)
    const noiseFloor = Math.min(...samples.map(sample => sample.volume));

    // Calculate pitch characteristics
    const pitches = frequencies.filter(f => f > 80 && f < 500); // Typical human voice range
    const pitch = {
      min: pitches.length > 0 ? Math.min(...pitches) : 0,
      max: pitches.length > 0 ? Math.max(...pitches) : 0,
      average: pitches.length > 0 ? pitches.reduce((sum, p) => sum + p, 0) / pitches.length : 0
    };

    // Calculate recognition accuracy
    let correctRecognitions = 0;
    for (const sample of samples) {
      const similarity = this.calculateTextSimilarity(sample.expectedText, sample.recognizedText);
      if (similarity > this.config.accuracyThreshold) {
        correctRecognitions++;
      }
    }
    const accuracy = samples.length > 0 ? correctRecognitions / samples.length : 0;

    // Calculate formants and spectral centroid (simplified)
    const formants = this.calculateFormants(samples);
    const spectralCentroid = this.calculateSpectralCentroid(samples);

    return {
      calibrationData: {
        averageVolume,
        frequencyRange,
        speechRate,
        pauseDuration,
        noiseFloor,
        voiceCharacteristics: {
          pitch,
          formants,
          spectralCentroid
        }
      },
      accuracy
    };
  }

  private calculateTextSimilarity(expected: string, recognized: string): number {
    // Simple similarity calculation using Levenshtein distance
    const expectedWords = expected.toLowerCase().split(/\s+/);
    const recognizedWords = recognized.toLowerCase().split(/\s+/);
    
    const maxLength = Math.max(expectedWords.length, recognizedWords.length);
    if (maxLength === 0) return 1;

    const editDistance = this.calculateEditDistance(expectedWords.join(' '), recognizedWords.join(' '));
    return 1 - (editDistance / Math.max(expected.length, recognized.length));
  }

  private calculateEditDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private calculateFormants(samples: CalibrationSample[]): number[] {
    // Simplified formant calculation
    // In a real implementation, this would use proper signal processing
    const frequencies = samples.map(sample => sample.frequency);
    const avgFreq = frequencies.reduce((sum, f) => sum + f, 0) / frequencies.length;
    
    // Estimate formants based on average frequency
    return [
      avgFreq * 0.8,  // F1 approximation
      avgFreq * 1.2,  // F2 approximation
      avgFreq * 1.8   // F3 approximation
    ];
  }

  private calculateSpectralCentroid(samples: CalibrationSample[]): number {
    // Simplified spectral centroid calculation
    const frequencies = samples.map(sample => sample.frequency);
    const volumes = samples.map(sample => sample.volume);
    
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (let i = 0; i < frequencies.length; i++) {
      weightedSum += frequencies[i] * volumes[i];
      totalWeight += volumes[i];
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private saveProfilesToStorage(): void {
    try {
      const profilesData = Array.from(this.profiles.entries());
      localStorage.setItem('voice_calibration_profiles', JSON.stringify(profilesData));
    } catch (error) {
      console.warn('Failed to save voice profiles to storage:', error);
    }
  }

  private loadProfilesFromStorage(): void {
    try {
      const stored = localStorage.getItem('voice_calibration_profiles');
      if (stored) {
        const profilesData = JSON.parse(stored);
        this.profiles = new Map(profilesData);
      }
    } catch (error) {
      console.warn('Failed to load voice profiles from storage:', error);
    }
  }

  // Get calibration statistics
  public getCalibrationStats(): {
    totalProfiles: number;
    profilesByLanguage: { bn: number; en: number };
    averageAccuracy: number;
    totalSamples: number;
  } {
    const profiles = Array.from(this.profiles.values());
    
    const stats = {
      totalProfiles: profiles.length,
      profilesByLanguage: { bn: 0, en: 0 },
      averageAccuracy: 0,
      totalSamples: 0
    };

    for (const profile of profiles) {
      stats.profilesByLanguage[profile.language]++;
      stats.averageAccuracy += profile.recognitionAccuracy;
      stats.totalSamples += profile.sampleCount;
    }

    if (profiles.length > 0) {
      stats.averageAccuracy /= profiles.length;
    }

    return stats;
  }

  // Static method to check if voice calibration is supported
  public static isSupported(): boolean {
    return !!(
      typeof window !== 'undefined' &&
      typeof localStorage !== 'undefined' &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    );
  }
}