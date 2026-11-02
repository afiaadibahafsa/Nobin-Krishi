// Voice Command Service - Handles voice shortcuts and commands
export interface VoiceCommand {
  id: string;
  trigger: string | RegExp;
  action: string;
  description: string;
  language: 'bn' | 'en' | 'both';
  enabled: boolean;
  parameters?: string[];
}

export interface VoiceCommandResult {
  command: VoiceCommand;
  matched: boolean;
  confidence: number;
  parameters: { [key: string]: string };
  originalText: string;
}

export interface VoiceCommandConfig {
  enabled: boolean;
  confidenceThreshold: number;
  caseSensitive: boolean;
  fuzzyMatching: boolean;
  maxEditDistance: number;
}

export interface IVoiceCommandService {
  addCommand(command: VoiceCommand): void;
  removeCommand(commandId: string): void;
  updateCommand(commandId: string, updates: Partial<VoiceCommand>): void;
  processText(text: string, language: 'bn' | 'en'): VoiceCommandResult | null;
  getCommands(language?: 'bn' | 'en' | 'both'): VoiceCommand[];
  getConfig(): VoiceCommandConfig;
  updateConfig(config: Partial<VoiceCommandConfig>): void;
  onCommandDetected(callback: (result: VoiceCommandResult) => void): void;
}

export class VoiceCommandService implements IVoiceCommandService {
  private commands: Map<string, VoiceCommand> = new Map();
  private config: VoiceCommandConfig = {
    enabled: true,
    confidenceThreshold: 0.7,
    caseSensitive: false,
    fuzzyMatching: true,
    maxEditDistance: 2
  };

  private onCommandDetectedCallback?: (result: VoiceCommandResult) => void;

  constructor() {
    this.initializeDefaultCommands();
  }

  private initializeDefaultCommands(): void {
    // Default voice commands for the Voice AI Chat system
    const defaultCommands: VoiceCommand[] = [
      // Language switching commands
      {
        id: 'switch-to-bangla',
        trigger: /(?:switch to|change to|use) (?:bangla|bengali)/i,
        action: 'switch_language',
        description: 'Switch to Bangla language',
        language: 'en',
        enabled: true,
        parameters: ['bn']
      },
      {
        id: 'switch-to-english',
        trigger: /(?:switch to|change to|use) english/i,
        action: 'switch_language',
        description: 'Switch to English language',
        language: 'en',
        enabled: true,
        parameters: ['en']
      },
      {
        id: 'bangla-te-jao',
        trigger: /বাংলা(?:\s+তে)?\s+(?:যাও|চলো|করো)/,
        action: 'switch_language',
        description: 'বাংলায় পরিবর্তন করুন',
        language: 'bn',
        enabled: true,
        parameters: ['bn']
      },
      {
        id: 'english-e-jao',
        trigger: /ইংরেজি(?:\s+তে)?\s+(?:যাও|চলো|করো)/,
        action: 'switch_language',
        description: 'ইংরেজিতে পরিবর্তন করুন',
        language: 'bn',
        enabled: true,
        parameters: ['en']
      },

      // Speech control commands
      {
        id: 'stop-speaking',
        trigger: /(?:stop|pause|quiet)/i,
        action: 'stop_speech',
        description: 'Stop current speech output',
        language: 'en',
        enabled: true
      },
      {
        id: 'stop-speaking-bn',
        trigger: /(?:বন্ধ|থামো|চুপ)\s*(?:করো|কর)?/,
        action: 'stop_speech',
        description: 'বর্তমান বক্তৃতা বন্ধ করুন',
        language: 'bn',
        enabled: true
      },
      {
        id: 'repeat-last',
        trigger: /(?:repeat|say again|replay)/i,
        action: 'replay_speech',
        description: 'Repeat the last AI response',
        language: 'en',
        enabled: true
      },
      {
        id: 'repeat-last-bn',
        trigger: /(?:আবার|পুনরায়|রিপিট)\s*(?:বলো|বল|করো|কর)?/,
        action: 'replay_speech',
        description: 'শেষ AI উত্তর পুনরায় বলুন',
        language: 'bn',
        enabled: true
      },

      // Conversation management
      {
        id: 'clear-conversation',
        trigger: /(?:clear|delete|remove) (?:conversation|chat|history)/i,
        action: 'clear_conversation',
        description: 'Clear conversation history',
        language: 'en',
        enabled: true
      },
      {
        id: 'clear-conversation-bn',
        trigger: /(?:কথোপকথন|চ্যাট|ইতিহাস)\s*(?:মুছে|সাফ|ক্লিয়ার)\s*(?:দাও|করো|কর)/,
        action: 'clear_conversation',
        description: 'কথোপকথনের ইতিহাস মুছে দিন',
        language: 'bn',
        enabled: true
      },

      // Help commands
      {
        id: 'help',
        trigger: /(?:help|what can you do|commands)/i,
        action: 'show_help',
        description: 'Show available voice commands',
        language: 'en',
        enabled: true
      },
      {
        id: 'help-bn',
        trigger: /(?:সাহায্য|হেল্প|কি\s*করতে\s*পারো|কমান্ড)/,
        action: 'show_help',
        description: 'উপলব্ধ ভয়েস কমান্ড দেখান',
        language: 'bn',
        enabled: true
      },

      // Settings commands
      {
        id: 'speak-faster',
        trigger: /(?:speak|talk) (?:faster|quickly)/i,
        action: 'adjust_speech_rate',
        description: 'Increase speech rate',
        language: 'en',
        enabled: true,
        parameters: ['increase']
      },
      {
        id: 'speak-slower',
        trigger: /(?:speak|talk) (?:slower|slowly)/i,
        action: 'adjust_speech_rate',
        description: 'Decrease speech rate',
        language: 'en',
        enabled: true,
        parameters: ['decrease']
      },
      {
        id: 'speak-faster-bn',
        trigger: /(?:দ্রুত|তাড়াতাড়ি)\s*(?:বলো|বল)/,
        action: 'adjust_speech_rate',
        description: 'বক্তৃতার গতি বাড়ান',
        language: 'bn',
        enabled: true,
        parameters: ['increase']
      },
      {
        id: 'speak-slower-bn',
        trigger: /(?:ধীরে|আস্তে)\s*(?:বলো|বল)/,
        action: 'adjust_speech_rate',
        description: 'বক্তৃতার গতি কমান',
        language: 'bn',
        enabled: true,
        parameters: ['decrease']
      },

      // Volume commands
      {
        id: 'volume-up',
        trigger: /(?:volume|sound) (?:up|higher|louder)/i,
        action: 'adjust_volume',
        description: 'Increase volume',
        language: 'en',
        enabled: true,
        parameters: ['increase']
      },
      {
        id: 'volume-down',
        trigger: /(?:volume|sound) (?:down|lower|quieter)/i,
        action: 'adjust_volume',
        description: 'Decrease volume',
        language: 'en',
        enabled: true,
        parameters: ['decrease']
      },
      {
        id: 'volume-up-bn',
        trigger: /(?:আওয়াজ|ভলিউম)\s*(?:বাড়াও|বেশি|উঁচু)\s*(?:করো|কর)?/,
        action: 'adjust_volume',
        description: 'আওয়াজ বাড়ান',
        language: 'bn',
        enabled: true,
        parameters: ['increase']
      },
      {
        id: 'volume-down-bn',
        trigger: /(?:আওয়াজ|ভলিউম)\s*(?:কমাও|কম|নিচু)\s*(?:করো|কর)?/,
        action: 'adjust_volume',
        description: 'আওয়াজ কমান',
        language: 'bn',
        enabled: true,
        parameters: ['decrease']
      }
    ];

    // Add default commands
    for (const command of defaultCommands) {
      this.commands.set(command.id, command);
    }
  }

  public addCommand(command: VoiceCommand): void {
    this.commands.set(command.id, command);
  }

  public removeCommand(commandId: string): void {
    this.commands.delete(commandId);
  }

  public updateCommand(commandId: string, updates: Partial<VoiceCommand>): void {
    const existingCommand = this.commands.get(commandId);
    if (existingCommand) {
      this.commands.set(commandId, { ...existingCommand, ...updates });
    }
  }

  public processText(text: string, language: 'bn' | 'en'): VoiceCommandResult | null {
    if (!this.config.enabled || !text.trim()) {
      return null;
    }

    const cleanText = this.config.caseSensitive ? text.trim() : text.trim().toLowerCase();
    let bestMatch: VoiceCommandResult | null = null;
    let highestConfidence = 0;

    // Check each command
    for (const command of this.commands.values()) {
      if (!command.enabled) {
        continue;
      }

      // Check if command applies to current language
      if (command.language !== 'both' && command.language !== language) {
        continue;
      }

      const matchResult = this.matchCommand(command, cleanText);
      if (matchResult && matchResult.confidence > highestConfidence && 
          matchResult.confidence >= this.config.confidenceThreshold) {
        highestConfidence = matchResult.confidence;
        bestMatch = matchResult;
      }
    }

    // Notify callback if command detected
    if (bestMatch && this.onCommandDetectedCallback) {
      this.onCommandDetectedCallback(bestMatch);
    }

    return bestMatch;
  }

  public getCommands(language?: 'bn' | 'en' | 'both'): VoiceCommand[] {
    const commands = Array.from(this.commands.values());
    
    if (!language) {
      return commands;
    }

    return commands.filter(cmd => cmd.language === language || cmd.language === 'both');
  }

  public getConfig(): VoiceCommandConfig {
    return { ...this.config };
  }

  public updateConfig(config: Partial<VoiceCommandConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public onCommandDetected(callback: (result: VoiceCommandResult) => void): void {
    this.onCommandDetectedCallback = callback;
  }

  private matchCommand(command: VoiceCommand, text: string): VoiceCommandResult | null {
    let confidence = 0;
    let parameters: { [key: string]: string } = {};

    if (command.trigger instanceof RegExp) {
      // Regular expression matching
      const match = text.match(command.trigger);
      if (match) {
        confidence = 1.0; // Exact regex match
        
        // Extract parameters from regex groups
        if (match.groups) {
          parameters = match.groups;
        } else if (match.length > 1) {
          // Use numbered groups
          for (let i = 1; i < match.length; i++) {
            parameters[`param${i}`] = match[i];
          }
        }
      }
    } else {
      // String matching with fuzzy matching support
      const trigger = this.config.caseSensitive ? command.trigger : command.trigger.toLowerCase();
      
      if (text === trigger) {
        confidence = 1.0; // Exact match
      } else if (text.includes(trigger)) {
        confidence = 0.9; // Contains trigger
      } else if (this.config.fuzzyMatching) {
        // Fuzzy matching using edit distance
        const editDistance = this.calculateEditDistance(text, trigger);
        const maxLength = Math.max(text.length, trigger.length);
        
        if (editDistance <= this.config.maxEditDistance && maxLength > 0) {
          confidence = 1 - (editDistance / maxLength);
        }
      }
    }

    if (confidence > 0) {
      // Add command parameters if specified
      if (command.parameters) {
        for (let i = 0; i < command.parameters.length; i++) {
          parameters[`param${i}`] = command.parameters[i];
        }
      }

      return {
        command,
        matched: true,
        confidence,
        parameters,
        originalText: text
      };
    }

    return null;
  }

  private calculateEditDistance(str1: string, str2: string): number {
    // Levenshtein distance algorithm
    const matrix: number[][] = [];
    
    // Initialize matrix
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    // Fill matrix
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Get help text for available commands
  public getHelpText(language: 'bn' | 'en'): string {
    const commands = this.getCommands(language);
    const enabledCommands = commands.filter(cmd => cmd.enabled);
    
    if (language === 'bn') {
      let helpText = 'উপলব্ধ ভয়েস কমান্ড:\n\n';
      for (const cmd of enabledCommands) {
        helpText += `• ${cmd.description}\n`;
      }
      return helpText;
    } else {
      let helpText = 'Available voice commands:\n\n';
      for (const cmd of enabledCommands) {
        helpText += `• ${cmd.description}\n`;
      }
      return helpText;
    }
  }

  // Enable/disable specific command categories
  public toggleCommandCategory(category: string, enabled: boolean): void {
    for (const command of this.commands.values()) {
      if (command.action.startsWith(category)) {
        command.enabled = enabled;
      }
    }
  }

  // Get command statistics
  public getCommandStats(): {
    total: number;
    enabled: number;
    byLanguage: { bn: number; en: number; both: number };
    byAction: { [action: string]: number };
  } {
    const commands = Array.from(this.commands.values());
    const stats = {
      total: commands.length,
      enabled: commands.filter(cmd => cmd.enabled).length,
      byLanguage: { bn: 0, en: 0, both: 0 },
      byAction: {} as { [action: string]: number }
    };

    for (const cmd of commands) {
      stats.byLanguage[cmd.language]++;
      stats.byAction[cmd.action] = (stats.byAction[cmd.action] || 0) + 1;
    }

    return stats;
  }

  // Static method to check if voice commands are supported
  public static isSupported(): boolean {
    return typeof window !== 'undefined' && typeof RegExp !== 'undefined';
  }
}