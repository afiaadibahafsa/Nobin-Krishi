// Browser Compatibility Service - Comprehensive feature detection and browser support
export interface BrowserCapabilities {
  speechRecognition: {
    supported: boolean;
    available: boolean;
    vendor: 'webkit' | 'standard' | 'none';
    permissions: 'granted' | 'denied' | 'prompt' | 'unknown';
    languages: string[];
    continuous: boolean;
    interimResults: boolean;
  };
  speechSynthesis: {
    supported: boolean;
    available: boolean;
    voices: SpeechSynthesisVoice[];
    voicesLoaded: boolean;
    languages: string[];
    ssml: boolean;
  };
  microphone: {
    supported: boolean;
    available: boolean;
    permissions: 'granted' | 'denied' | 'prompt' | 'unknown';
  };
  audio: {
    supported: boolean;
    available: boolean;
    formats: string[];
    autoplay: boolean;
  };
  browser: {
    name: string;
    version: string;
    engine: string;
    mobile: boolean;
    os: string;
    webkitBased: boolean;
  };
  network: {
    online: boolean;
    connection: string;
    effectiveType?: string;
  };
}

export interface CompatibilityIssue {
  type: 'error' | 'warning' | 'info';
  feature: string;
  message: string;
  fallback?: string;
  recommendation?: string;
}

export interface BrowserOptimizations {
  speechRecognition: {
    useWebkit: boolean;
    maxAlternatives: number;
    continuous: boolean;
    interimResults: boolean;
    grammars: boolean;
  };
  speechSynthesis: {
    chunkSize: number;
    pauseBetweenChunks: number;
    voiceURI: string | null;
    ssmlSupport: boolean;
  };
  audio: {
    preload: boolean;
    autoplay: boolean;
    crossOrigin: string | null;
  };
}

export class BrowserCompatibilityService {
  private capabilities: BrowserCapabilities | null = null;
  private issues: CompatibilityIssue[] = [];
  private optimizations: BrowserOptimizations | null = null;
  private voicesLoadedPromise: Promise<SpeechSynthesisVoice[]> | null = null;

  constructor() {
    this.detectCapabilities();
  }

  // Main capability detection method
  public async detectCapabilities(): Promise<BrowserCapabilities> {
    if (this.capabilities) {
      return this.capabilities;
    }

    const browser = this.detectBrowser();
    const speechRecognition = await this.detectSpeechRecognition();
    const speechSynthesis = await this.detectSpeechSynthesis();
    const microphone = await this.detectMicrophone();
    const audio = this.detectAudio();
    const network = this.detectNetwork();

    this.capabilities = {
      speechRecognition,
      speechSynthesis,
      microphone,
      audio,
      browser,
      network
    };

    // Generate compatibility issues and optimizations
    this.analyzeCompatibility();
    this.generateOptimizations();

    return this.capabilities;
  }

  // Browser detection
  private detectBrowser(): BrowserCapabilities['browser'] {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    let name = 'Unknown';
    let version = 'Unknown';
    let engine = 'Unknown';
    let webkitBased = false;

    // Detect browser name and version
    if (userAgent.includes('Chrome')) {
      name = 'Chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      version = match ? match[1] : 'Unknown';
      engine = 'Blink';
      webkitBased = true;
    } else if (userAgent.includes('Firefox')) {
      name = 'Firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      version = match ? match[1] : 'Unknown';
      engine = 'Gecko';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      name = 'Safari';
      const match = userAgent.match(/Version\/(\d+)/);
      version = match ? match[1] : 'Unknown';
      engine = 'WebKit';
      webkitBased = true;
    } else if (userAgent.includes('Edge')) {
      name = 'Edge';
      const match = userAgent.match(/Edge\/(\d+)/);
      version = match ? match[1] : 'Unknown';
      engine = 'EdgeHTML';
    } else if (userAgent.includes('Edg')) {
      name = 'Edge Chromium';
      const match = userAgent.match(/Edg\/(\d+)/);
      version = match ? match[1] : 'Unknown';
      engine = 'Blink';
      webkitBased = true;
    }

    // Detect mobile
    const mobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    // Detect OS
    let os = 'Unknown';
    if (platform.includes('Win')) os = 'Windows';
    else if (platform.includes('Mac')) os = 'macOS';
    else if (platform.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

    return { name, version, engine, mobile, os, webkitBased };
  }

  // Speech Recognition detection
  private async detectSpeechRecognition(): Promise<BrowserCapabilities['speechRecognition']> {
    const hasStandard = 'SpeechRecognition' in window;
    const hasWebkit = 'webkitSpeechRecognition' in window;
    const supported = hasStandard || hasWebkit;
    
    let vendor: 'webkit' | 'standard' | 'none' = 'none';
    if (hasStandard) vendor = 'standard';
    else if (hasWebkit) vendor = 'webkit';

    let permissions: 'granted' | 'denied' | 'prompt' | 'unknown' = 'unknown';
    let available = false;
    let languages: string[] = [];
    let continuous = false;
    let interimResults = false;

    if (supported) {
      try {
        // Check microphone permissions
        if (navigator.permissions) {
          try {
            const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            permissions = permissionStatus.state as 'granted' | 'denied' | 'prompt';
          } catch (error) {
            console.warn('Could not query microphone permissions:', error);
          }
        }

        // Test speech recognition creation
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          available = true;
          continuous = 'continuous' in recognition;
          interimResults = 'interimResults' in recognition;
          
          // Get supported languages (this is browser-dependent)
          languages = this.getSpeechRecognitionLanguages();
        }
      } catch (error) {
        console.warn('Speech recognition detection failed:', error);
        available = false;
      }
    }

    return {
      supported,
      available,
      vendor,
      permissions,
      languages,
      continuous,
      interimResults
    };
  }

  // Speech Synthesis detection
  private async detectSpeechSynthesis(): Promise<BrowserCapabilities['speechSynthesis']> {
    const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    let available = false;
    let voices: SpeechSynthesisVoice[] = [];
    let voicesLoaded = false;
    let languages: string[] = [];
    let ssml = false;

    if (supported) {
      try {
        available = true;
        
        // Load voices (may be asynchronous)
        voices = await this.loadSpeechSynthesisVoices();
        voicesLoaded = voices.length > 0;
        
        // Extract unique languages
        languages = [...new Set(voices.map(voice => voice.lang))];
        
        // Test SSML support (basic test)
        ssml = this.testSSMLSupport();
        
      } catch (error) {
        console.warn('Speech synthesis detection failed:', error);
        available = false;
      }
    }

    return {
      supported,
      available,
      voices,
      voicesLoaded,
      languages,
      ssml
    };
  }

  // Microphone detection
  private async detectMicrophone(): Promise<BrowserCapabilities['microphone']> {
    const supported = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    let available = false;
    let permissions: 'granted' | 'denied' | 'prompt' | 'unknown' = 'unknown';

    if (supported) {
      try {
        // Check permissions
        if (navigator.permissions) {
          try {
            const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            permissions = permissionStatus.state as 'granted' | 'denied' | 'prompt';
          } catch (error) {
            console.warn('Could not query microphone permissions:', error);
          }
        }

        // Test microphone availability (without actually accessing it)
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const audioInputs = devices.filter(device => device.kind === 'audioinput');
          available = audioInputs.length > 0;
        } catch (error) {
          console.warn('Could not enumerate media devices:', error);
          // Assume available if we can't check
          available = true;
        }
      } catch (error) {
        console.warn('Microphone detection failed:', error);
        available = false;
      }
    }

    return {
      supported,
      available,
      permissions
    };
  }

  // Audio detection
  private detectAudio(): BrowserCapabilities['audio'] {
    const supported = 'Audio' in window;
    let available = false;
    let formats: string[] = [];
    let autoplay = false;

    if (supported) {
      try {
        const audio = new Audio();
        available = true;

        // Test supported formats
        const testFormats = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];
        formats = testFormats.filter(format => audio.canPlayType(format) !== '');

        // Test autoplay (basic heuristic)
        autoplay = this.testAutoplaySupport();
      } catch (error) {
        console.warn('Audio detection failed:', error);
        available = false;
      }
    }

    return {
      supported,
      available,
      formats,
      autoplay
    };
  }

  // Network detection
  private detectNetwork(): BrowserCapabilities['network'] {
    const online = navigator.onLine;
    let connection = 'unknown';
    let effectiveType: string | undefined;

    // Network Information API (experimental)
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn) {
        connection = conn.type || conn.effectiveType || 'unknown';
        effectiveType = conn.effectiveType;
      }
    }

    return {
      online,
      connection,
      effectiveType
    };
  }

  // Helper methods
  private getSpeechRecognitionLanguages(): string[] {
    // Common languages supported by most browsers
    return [
      'en-US', 'en-GB', 'en-AU', 'en-CA', 'en-IN',
      'bn-BD', 'bn-IN',
      'hi-IN', 'ur-PK', 'ur-IN',
      'es-ES', 'es-MX', 'fr-FR', 'de-DE', 'it-IT',
      'pt-BR', 'ru-RU', 'ja-JP', 'ko-KR', 'zh-CN'
    ];
  }

  private async loadSpeechSynthesisVoices(): Promise<SpeechSynthesisVoice[]> {
    if (this.voicesLoadedPromise) {
      return this.voicesLoadedPromise;
    }

    this.voicesLoadedPromise = new Promise((resolve) => {
      const getVoices = () => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          resolve(voices);
        } else {
          // Some browsers load voices asynchronously
          speechSynthesis.onvoiceschanged = () => {
            const asyncVoices = speechSynthesis.getVoices();
            if (asyncVoices.length > 0) {
              resolve(asyncVoices);
            }
          };
          
          // Fallback timeout
          setTimeout(() => {
            resolve(speechSynthesis.getVoices());
          }, 1000);
        }
      };

      getVoices();
    });

    return this.voicesLoadedPromise;
  }

  private testSSMLSupport(): boolean {
    // Basic SSML support test
    try {
      const utterance = new SpeechSynthesisUtterance('<speak>Test</speak>');
      return utterance.text === '<speak>Test</speak>';
    } catch (error) {
      return false;
    }
  }

  private testAutoplaySupport(): boolean {
    // Basic autoplay detection (heuristic)
    try {
      const audio = new Audio();
      audio.muted = true;
      const promise = audio.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {});
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Compatibility analysis
  private analyzeCompatibility(): void {
    this.issues = [];

    if (!this.capabilities) return;

    const { speechRecognition, speechSynthesis, microphone, browser } = this.capabilities;

    // Speech Recognition issues
    if (!speechRecognition.supported) {
      this.issues.push({
        type: 'error',
        feature: 'Speech Recognition',
        message: 'Speech Recognition is not supported in this browser',
        fallback: 'Text input will be used instead',
        recommendation: 'Use Chrome, Edge, or Safari for voice input support'
      });
    } else if (!speechRecognition.available) {
      this.issues.push({
        type: 'warning',
        feature: 'Speech Recognition',
        message: 'Speech Recognition is supported but not available',
        fallback: 'Text input will be used instead',
        recommendation: 'Check microphone permissions and availability'
      });
    } else if (speechRecognition.permissions === 'denied') {
      this.issues.push({
        type: 'warning',
        feature: 'Microphone',
        message: 'Microphone access is denied',
        fallback: 'Text input will be used instead',
        recommendation: 'Allow microphone access in browser settings'
      });
    }

    // Speech Synthesis issues
    if (!speechSynthesis.supported) {
      this.issues.push({
        type: 'error',
        feature: 'Speech Synthesis',
        message: 'Text-to-speech is not supported in this browser',
        fallback: 'Text responses will be displayed only',
        recommendation: 'Use a modern browser for voice output support'
      });
    } else if (!speechSynthesis.voicesLoaded) {
      this.issues.push({
        type: 'warning',
        feature: 'Speech Synthesis',
        message: 'Speech voices are not loaded yet',
        fallback: 'Default system voice will be used',
        recommendation: 'Wait for voices to load or refresh the page'
      });
    }

    // Browser-specific issues
    if (browser.name === 'Firefox') {
      this.issues.push({
        type: 'info',
        feature: 'Speech Recognition',
        message: 'Firefox has limited speech recognition support',
        recommendation: 'Consider using Chrome or Edge for better voice features'
      });
    }

    if (browser.mobile) {
      this.issues.push({
        type: 'info',
        feature: 'Mobile Browser',
        message: 'Mobile browsers may have limited voice features',
        recommendation: 'Some features may work better on desktop browsers'
      });
    }

    // Network issues
    if (!this.capabilities.network.online) {
      this.issues.push({
        type: 'error',
        feature: 'Network',
        message: 'No internet connection detected',
        fallback: 'Voice AI features will not work offline',
        recommendation: 'Check your internet connection'
      });
    }
  }

  // Generate browser-specific optimizations
  private generateOptimizations(): void {
    if (!this.capabilities) return;

    const { browser, speechRecognition, speechSynthesis } = this.capabilities;

    this.optimizations = {
      speechRecognition: {
        useWebkit: speechRecognition.vendor === 'webkit',
        maxAlternatives: browser.name === 'Chrome' ? 5 : 1,
        continuous: speechRecognition.continuous,
        interimResults: speechRecognition.interimResults,
        grammars: browser.name === 'Chrome' && parseInt(browser.version) >= 25
      },
      speechSynthesis: {
        chunkSize: browser.mobile ? 100 : 200,
        pauseBetweenChunks: browser.mobile ? 200 : 100,
        voiceURI: this.getBestVoiceURI(),
        ssmlSupport: speechSynthesis.ssml
      },
      audio: {
        preload: !browser.mobile,
        autoplay: this.capabilities.audio.autoplay,
        crossOrigin: browser.name === 'Safari' ? 'anonymous' : null
      }
    };
  }

  private getBestVoiceURI(): string | null {
    if (!this.capabilities?.speechSynthesis.voices.length) return null;

    const voices = this.capabilities.speechSynthesis.voices;
    
    // Prefer local voices over remote ones
    const localVoices = voices.filter(voice => voice.localService);
    if (localVoices.length > 0) {
      return localVoices[0].voiceURI;
    }

    return voices[0]?.voiceURI || null;
  }

  // Public API methods
  public getCapabilities(): BrowserCapabilities | null {
    return this.capabilities;
  }

  public getCompatibilityIssues(): CompatibilityIssue[] {
    return this.issues;
  }

  public getOptimizations(): BrowserOptimizations | null {
    return this.optimizations;
  }

  public isFeatureSupported(feature: keyof BrowserCapabilities): boolean {
    if (!this.capabilities) return false;
    
    switch (feature) {
      case 'speechRecognition':
        return this.capabilities.speechRecognition.supported && this.capabilities.speechRecognition.available;
      case 'speechSynthesis':
        return this.capabilities.speechSynthesis.supported && this.capabilities.speechSynthesis.available;
      case 'microphone':
        return this.capabilities.microphone.supported && this.capabilities.microphone.available;
      case 'audio':
        return this.capabilities.audio.supported && this.capabilities.audio.available;
      default:
        return false;
    }
  }

  public getFallbackMode(): 'text-only' | 'speech-output-only' | 'speech-input-only' | 'full-voice' {
    if (!this.capabilities) return 'text-only';

    const speechInputAvailable = this.isFeatureSupported('speechRecognition') && 
                                this.isFeatureSupported('microphone');
    const speechOutputAvailable = this.isFeatureSupported('speechSynthesis');

    if (speechInputAvailable && speechOutputAvailable) {
      return 'full-voice';
    } else if (speechInputAvailable) {
      return 'speech-input-only';
    } else if (speechOutputAvailable) {
      return 'speech-output-only';
    } else {
      return 'text-only';
    }
  }

  public async refreshCapabilities(): Promise<BrowserCapabilities> {
    this.capabilities = null;
    this.issues = [];
    this.optimizations = null;
    this.voicesLoadedPromise = null;
    return this.detectCapabilities();
  }

  // Event listeners for capability changes
  public onCapabilityChange(callback: (capabilities: BrowserCapabilities) => void): () => void {
    const handleOnline = () => {
      this.refreshCapabilities().then(callback);
    };

    const handleOffline = () => {
      this.refreshCapabilities().then(callback);
    };

    const handleVoicesChanged = () => {
      this.refreshCapabilities().then(callback);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if ('speechSynthesis' in window) {
      speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    }

    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('speechSynthesis' in window) {
        speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      }
    };
  }
}

// Singleton instance
export const browserCompatibility = new BrowserCompatibilityService();