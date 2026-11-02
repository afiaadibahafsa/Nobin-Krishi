import React, { useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAccessibilityContext } from './AccessibilityProvider';

export interface LanguageToggleProps {
  currentLanguage: 'bn' | 'en';
  onLanguageChange: (language: 'bn' | 'en') => void;
  variant?: 'button' | 'dropdown' | 'switch';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showFlag?: boolean;
  className?: string;
}

const languageConfig = {
  bn: {
    label: 'বাংলা',
    flag: '🇧🇩',
    code: 'bn-BD',
    nativeName: 'বাংলা'
  },
  en: {
    label: 'English',
    flag: '🇬🇧',
    code: 'en-US',
    nativeName: 'English'
  }
};

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  currentLanguage,
  onLanguageChange,
  variant = 'button',
  size = 'md',
  showIcon = true,
  showFlag = true,
  className = ''
}) => {
  const { announce, getAriaLabel, getAccessibilityClasses } = useAccessibilityContext();
  const currentConfig = languageConfig[currentLanguage];
  const otherLanguage = currentLanguage === 'bn' ? 'en' : 'bn';
  const otherConfig = languageConfig[otherLanguage];

  // Announce language changes for screen readers
  useEffect(() => {
    announce(
      currentLanguage === 'bn' 
        ? `ভাষা পরিবর্তন হয়েছে: ${currentConfig.nativeName}`
        : `Language changed to: ${currentConfig.nativeName}`,
      'polite'
    );
  }, [currentLanguage, announce, currentConfig.nativeName]);

  const handleToggle = () => {
    onLanguageChange(otherLanguage);
  };

  // Size classes
  const sizeClasses = {
    sm: 'h-8 px-2 text-sm',
    md: 'h-10 px-3 text-base',
    lg: 'h-12 px-4 text-lg'
  };

  // Switch variant - simple toggle button
  if (variant === 'switch') {
    return (
      <Button
        id="language-toggle"
        data-testid="language-toggle"
        variant="outline"
        size="sm"
        onClick={handleToggle}
        className={getAccessibilityClasses(`${sizeClasses[size]} border-[#E5E7EB] text-[#2C3E50] hover:bg-[#F9FAFB] hover:border-[#2ECC71] transition-all duration-200 voice-ai-touch-target voice-ai-enhanced-focus ${className}`)}
        title={`Switch to ${otherConfig.nativeName}`}
        aria-label={getAriaLabel('languageToggle')}
        aria-describedby="language-help"
        type="button"
      >
        {showIcon && <Globe className="w-4 h-4 mr-2" aria-hidden="true" />}
        {showFlag && (
          <span className="mr-1" role="img" aria-label={`${currentConfig.nativeName} flag`}>
            {currentConfig.flag}
          </span>
        )}
        <span className="font-medium">{currentConfig.label}</span>
        <span className="mx-2 text-[#94A3B8]" aria-hidden="true">⇄</span>
        {showFlag && (
          <span className="mr-1 opacity-60" role="img" aria-label={`${otherConfig.nativeName} flag`}>
            {otherConfig.flag}
          </span>
        )}
        <span className="opacity-60">{otherConfig.label}</span>
        
        {/* Screen reader help text */}
        <div id="language-help" className="sr-only">
          {currentLanguage === 'bn' 
            ? 'Ctrl+Alt+L চেপে ভাষা পরিবর্তন করুন'
            : 'Press Ctrl+Alt+L to toggle language'
          }
        </div>
      </Button>
    );
  }

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            id="language-dropdown-trigger"
            data-testid="language-toggle"
            variant="outline"
            className={getAccessibilityClasses(`${sizeClasses[size]} border-[#E5E7EB] text-[#2C3E50] hover:bg-[#F9FAFB] hover:border-[#2ECC71] transition-all duration-200 voice-ai-touch-target voice-ai-enhanced-focus ${className}`)}
            aria-label={getAriaLabel('languageToggle')}
            aria-describedby="language-dropdown-help"
            aria-haspopup="menu"
            aria-expanded="false"
            type="button"
          >
            {showIcon && <Globe className="w-4 h-4 mr-2" aria-hidden="true" />}
            {showFlag && (
              <span className="mr-2" role="img" aria-label={`${currentConfig.nativeName} flag`}>
                {currentConfig.flag}
              </span>
            )}
            <span className="font-medium">{currentConfig.label}</span>
            <ChevronDown className="w-4 h-4 ml-2" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-48"
          role="menu"
          aria-labelledby="language-dropdown-trigger"
        >
          <DropdownMenuItem
            onClick={() => onLanguageChange('bn')}
            className={`flex items-center gap-3 ${currentLanguage === 'bn' ? 'bg-[#F0F9F7] text-[#2ECC71]' : ''}`}
            role="menuitem"
            aria-current={currentLanguage === 'bn' ? 'true' : 'false'}
          >
            <span role="img" aria-label="Bangladesh flag">🇧🇩</span>
            <div className="flex flex-col">
              <span className="font-medium">বাংলা</span>
              <span className="text-xs text-[#94A3B8]">Bangla</span>
            </div>
            {currentLanguage === 'bn' && (
              <div className="ml-auto w-2 h-2 bg-[#2ECC71] rounded-full" aria-hidden="true"></div>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onLanguageChange('en')}
            className={`flex items-center gap-3 ${currentLanguage === 'en' ? 'bg-[#F0F9F7] text-[#2ECC71]' : ''}`}
            role="menuitem"
            aria-current={currentLanguage === 'en' ? 'true' : 'false'}
          >
            <span role="img" aria-label="UK flag">🇬🇧</span>
            <div className="flex flex-col">
              <span className="font-medium">English</span>
              <span className="text-xs text-[#94A3B8]">English</span>
            </div>
            {currentLanguage === 'en' && (
              <div className="ml-auto w-2 h-2 bg-[#2ECC71] rounded-full" aria-hidden="true"></div>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
        
        {/* Screen reader help text */}
        <div id="language-dropdown-help" className="sr-only">
          {currentLanguage === 'bn' 
            ? 'ভাষা নির্বাচনের জন্য মেনু খুলুন'
            : 'Open menu to select language'
          }
        </div>
      </DropdownMenu>
    );
  }

  // Default button variant - simple toggle
  return (
    <Button
      id="language-toggle"
      data-testid="language-toggle"
      variant="outline"
      onClick={handleToggle}
      className={getAccessibilityClasses(`${sizeClasses[size]} border-[#E5E7EB] text-[#2C3E50] hover:bg-[#F9FAFB] hover:border-[#2ECC71] transition-all duration-200 relative voice-ai-touch-target voice-ai-enhanced-focus ${className}`)}
      title={`Switch to ${otherConfig.nativeName}`}
      aria-label={getAriaLabel('languageToggle')}
      aria-describedby="language-button-help"
      type="button"
    >
      {showIcon && <Globe className="w-4 h-4 mr-2" aria-hidden="true" />}
      {showFlag && (
        <span className="mr-2" role="img" aria-label={`${currentConfig.nativeName} flag`}>
          {currentConfig.flag}
        </span>
      )}
      <span className="font-medium">{currentConfig.label}</span>
      
      {/* Visual indicator for current selection */}
      <div 
        className="absolute -top-1 -right-1 w-3 h-3 bg-[#2ECC71] rounded-full border-2 border-white shadow-sm" 
        aria-hidden="true"
      ></div>
      
      {/* Screen reader help text */}
      <div id="language-button-help" className="sr-only">
        {currentLanguage === 'bn' 
          ? 'Ctrl+Alt+L চেপে ভাষা পরিবর্তন করুন'
          : 'Press Ctrl+Alt+L to toggle language'
        }
      </div>
    </Button>
  );
};

// Helper function to get language configuration
export const getLanguageConfig = (language: 'bn' | 'en') => {
  return languageConfig[language];
};

// Helper function to get speech recognition language code
export const getSpeechLanguageCode = (language: 'bn' | 'en'): string => {
  return languageConfig[language].code;
};

export default LanguageToggle;