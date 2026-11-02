import React, { useState, useEffect } from 'react';
import { Settings, ChevronDown, ChevronUp, Volume2, Mic, Speaker } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useAccessibilityContext } from './AccessibilityProvider';

export interface VoiceSettings {
  rate: number; // 0.1 to 10
  pitch: number; // 0 to 2
  volume: number; // 0 to 1
  autoSpeak: boolean;
  selectedVoice?: string;
}

export interface SettingsPanelProps {
  voiceSettings: VoiceSettings;
  onVoiceSettingsChange: (settings: VoiceSettings) => void;
  language: 'bn' | 'en';
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  className?: string;
  availableVoices?: SpeechSynthesisVoice[];
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  voiceSettings,
  onVoiceSettingsChange,
  language,
  isOpen = false,
  onToggle,
  className,
  availableVoices = []
}) => {
  const { announce, getAriaLabel, getAccessibilityClasses } = useAccessibilityContext();
  const [internalIsOpen, setInternalIsOpen] = useState(isOpen);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(availableVoices);

  // Use internal state if onToggle is not provided
  const isControlled = onToggle !== undefined;
  const currentIsOpen = isControlled ? isOpen : internalIsOpen;

  // Announce settings panel state changes
  useEffect(() => {
    if (currentIsOpen) {
      announce(
        language === 'bn' ? 'সেটিংস প্যানেল খোলা হয়েছে' : 'Settings panel opened',
        'polite'
      );
    }
  }, [currentIsOpen, announce, language]);

  const handleToggle = () => {
    const newIsOpen = !currentIsOpen;
    if (isControlled) {
      onToggle?.(newIsOpen);
    } else {
      setInternalIsOpen(newIsOpen);
    }
  };

  // Load available voices on component mount
  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      }
    };

    // Load voices immediately
    loadVoices();

    // Also load when voices change (some browsers load voices asynchronously)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  // Filter voices by language
  const getFilteredVoices = () => {
    if (!voices.length) return [];
    
    const languageCode = language === 'bn' ? 'bn' : 'en';
    const filteredVoices = voices.filter(voice => 
      voice.lang.toLowerCase().startsWith(languageCode.toLowerCase())
    );
    
    // If no voices found for the specific language, return all voices
    return filteredVoices.length > 0 ? filteredVoices : voices;
  };

  const handleVoiceSpeedChange = (value: number[]) => {
    const newRate = value[0];
    onVoiceSettingsChange({
      ...voiceSettings,
      rate: newRate
    });
    
    // Announce speed change
    announce(
      language === 'bn' 
        ? `কণ্ঠস্বরের গতি ${newRate.toFixed(1)}x এ সেট করা হয়েছে`
        : `Voice speed set to ${newRate.toFixed(1)}x`,
      'polite'
    );
  };

  const handleAutoSpeakToggle = (checked: boolean) => {
    onVoiceSettingsChange({
      ...voiceSettings,
      autoSpeak: checked
    });
    
    // Announce auto-speak change
    announce(
      language === 'bn' 
        ? `স্বয়ংক্রিয় বক্তৃতা ${checked ? 'চালু' : 'বন্ধ'} করা হয়েছে`
        : `Auto-speak ${checked ? 'enabled' : 'disabled'}`,
      'polite'
    );
  };

  const handleVoiceSelection = (voiceName: string) => {
    onVoiceSettingsChange({
      ...voiceSettings,
      selectedVoice: voiceName
    });
    
    // Announce voice selection
    const selectedVoice = voices.find(v => v.name === voiceName);
    announce(
      language === 'bn' 
        ? `কণ্ঠস্বর নির্বাচিত: ${selectedVoice?.name || 'ডিফল্ট'}`
        : `Voice selected: ${selectedVoice?.name || 'Default'}`,
      'polite'
    );
  };

  const filteredVoices = getFilteredVoices();

  const texts = {
    bn: {
      settings: 'সেটিংস',
      voiceSpeed: 'কণ্ঠস্বরের গতি',
      slow: 'ধীর',
      fast: 'দ্রুত',
      autoSpeak: 'স্বয়ংক্রিয় বক্তৃতা',
      autoSpeakDesc: 'AI উত্তর স্বয়ংক্রিয়ভাবে বলবে',
      voiceSelection: 'কণ্ঠস্বর নির্বাচন',
      selectVoice: 'একটি কণ্ঠস্বর নির্বাচন করুন',
      defaultVoice: 'ডিফল্ট কণ্ঠস্বর',
      noVoicesAvailable: 'কোনো কণ্ঠস্বর উপলব্ধ নেই'
    },
    en: {
      settings: 'Settings',
      voiceSpeed: 'Voice Speed',
      slow: 'Slow',
      fast: 'Fast',
      autoSpeak: 'Auto-speak',
      autoSpeakDesc: 'Automatically speak AI responses',
      voiceSelection: 'Voice Selection',
      selectVoice: 'Select a voice',
      defaultVoice: 'Default Voice',
      noVoicesAvailable: 'No voices available'
    }
  };

  const t = texts[language];

  return (
    <Card className={getAccessibilityClasses(cn("bg-white shadow-md rounded-2xl overflow-hidden", className))}>
      <Collapsible open={currentIsOpen} onOpenChange={handleToggle}>
        <CollapsibleTrigger asChild>
          <Button
            id="settings-panel-trigger"
            data-testid="settings-panel"
            variant="ghost"
            className={getAccessibilityClasses("w-full h-14 px-6 py-4 flex items-center justify-between hover:bg-gray-50 rounded-none voice-ai-touch-target voice-ai-enhanced-focus")}
            style={{ minHeight: '44px', minWidth: '44px' }} // Ensure 44px minimum touch target (Requirements 4.7)
            aria-label={getAriaLabel('settingsPanel')}
            aria-expanded={currentIsOpen}
            aria-controls="settings-panel-content"
            type="button"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-[#2ECC71]" aria-hidden="true" />
              <span className="text-lg font-semibold text-[#2C3E50]">
                {t.settings}
              </span>
            </div>
            {currentIsOpen ? (
              <ChevronUp className="w-5 h-5 text-[#2C3E50]" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#2C3E50]" aria-hidden="true" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent 
          id="settings-panel-content"
          className="px-6 pb-6"
          role="region"
          aria-labelledby="settings-panel-trigger"
        >
          <div className="space-y-6 pt-4">
            {/* Voice Speed Slider Control (Requirements 4.6) */}
            <fieldset className="space-y-3">
              <legend className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#2ECC71]" aria-hidden="true" />
                <span className="text-base font-medium text-[#2C3E50]">
                  {t.voiceSpeed}
                </span>
              </legend>
              
              <div className="space-y-2">
                <Slider
                  id="voice-speed-slider"
                  value={[voiceSettings.rate]}
                  onValueChange={handleVoiceSpeedChange}
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  className={getAccessibilityClasses("w-full voice-ai-enhanced-focus")}
                  style={{ minHeight: '44px' }} // Ensure 44px minimum touch target
                  aria-label={getAriaLabel('voiceSpeedSlider')}
                  aria-describedby="voice-speed-description"
                />
                
                <div id="voice-speed-description" className="flex justify-between text-sm text-[#2C3E50]/70">
                  <span>{t.slow}</span>
                  <span className="font-medium text-[#2ECC71]" aria-live="polite">
                    {voiceSettings.rate.toFixed(1)}x
                  </span>
                  <span>{t.fast}</span>
                </div>
              </div>
            </fieldset>

            {/* Auto-speak Toggle Functionality (Requirements 4.6) */}
            <fieldset className="space-y-3">
              <legend className="flex items-center gap-2">
                <Speaker className="w-4 h-4 text-[#2ECC71]" aria-hidden="true" />
                <span className="text-base font-medium text-[#2C3E50]">
                  {t.autoSpeak}
                </span>
              </legend>
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p id="auto-speak-description" className="text-sm text-[#2C3E50]/70">
                    {t.autoSpeakDesc}
                  </p>
                </div>
                <Switch
                  id="auto-speak-toggle"
                  checked={voiceSettings.autoSpeak}
                  onCheckedChange={handleAutoSpeakToggle}
                  className={getAccessibilityClasses("ml-4 voice-ai-enhanced-focus")}
                  style={{ minHeight: '44px', minWidth: '44px' }} // Ensure 44px minimum touch target
                  aria-label={getAriaLabel('autoSpeakToggle')}
                  aria-describedby="auto-speak-description"
                />
              </div>
            </fieldset>

            {/* Voice Selection Options (Requirements 4.6) */}
            <fieldset className="space-y-3">
              <legend className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-[#2ECC71]" aria-hidden="true" />
                <span className="text-base font-medium text-[#2C3E50]">
                  {t.voiceSelection}
                </span>
              </legend>
              
              <div className="space-y-2">
                {filteredVoices.length > 0 ? (
                  <Select
                    value={voiceSettings.selectedVoice || ''}
                    onValueChange={handleVoiceSelection}
                  >
                    <SelectTrigger 
                      id="voice-selection-trigger"
                      className={getAccessibilityClasses("w-full h-12 text-base voice-ai-enhanced-focus")}
                      style={{ minHeight: '44px' }} // Ensure 44px minimum touch target
                      aria-label={t.selectVoice}
                      aria-describedby="voice-selection-help"
                    >
                      <SelectValue placeholder={t.selectVoice} />
                    </SelectTrigger>
                    <SelectContent role="listbox" aria-labelledby="voice-selection-trigger">
                      <SelectItem value="" role="option">
                        {t.defaultVoice}
                      </SelectItem>
                      {filteredVoices.map((voice) => (
                        <SelectItem key={voice.name} value={voice.name} role="option">
                          <div className="flex flex-col">
                            <span className="font-medium">{voice.name}</span>
                            <span className="text-xs text-gray-500">
                              {voice.lang} {voice.localService ? '(Local)' : '(Remote)'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div 
                    className="p-3 text-center text-sm text-[#2C3E50]/70 bg-gray-50 rounded-lg"
                    role="status"
                    aria-live="polite"
                  >
                    {t.noVoicesAvailable}
                  </div>
                )}
                
                {/* Voice preview info */}
                {voiceSettings.selectedVoice && (
                  <div 
                    id="voice-selection-help" 
                    className="text-xs text-[#2C3E50]/60 mt-1"
                    role="status"
                    aria-live="polite"
                  >
                    {language === 'bn' 
                      ? `নির্বাচিত: ${voiceSettings.selectedVoice}`
                      : `Selected: ${voiceSettings.selectedVoice}`
                    }
                  </div>
                )}
              </div>
            </fieldset>

            {/* Additional Settings Info */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-[#2C3E50]/60 text-center" role="status">
                {language === 'bn' 
                  ? 'সেটিংস স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়'
                  : 'Settings are automatically saved'
                }
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default SettingsPanel;