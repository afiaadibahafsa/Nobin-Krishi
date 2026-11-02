import React from 'react';
import { Play, Pause, Square, RotateCcw, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SpeechControlsProps {
  isSpeaking: boolean;
  isPaused: boolean;
  canReplay: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onReplay?: () => void;
  language: 'bn' | 'en';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export const SpeechControls: React.FC<SpeechControlsProps> = ({
  isSpeaking,
  isPaused,
  canReplay,
  onPlay,
  onPause,
  onStop,
  onReplay,
  language,
  className = '',
  size = 'md',
  variant = 'outline'
}) => {
  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8';
      case 'lg': return 'h-12 w-12';
      default: return 'h-10 w-10';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'w-3 h-3';
      case 'lg': return 'w-6 h-6';
      default: return 'w-4 h-4';
    }
  };

  const getTooltipText = (action: string) => {
    const tooltips = {
      bn: {
        play: 'চালু করুন',
        pause: 'বিরতি',
        stop: 'বন্ধ করুন',
        replay: 'আবার শুনুন'
      },
      en: {
        play: 'Play',
        pause: 'Pause',
        stop: 'Stop',
        replay: 'Replay'
      }
    };
    return tooltips[language][action as keyof typeof tooltips[typeof language]];
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Play/Pause Button */}
      {isSpeaking && !isPaused ? (
        <Button
          variant={variant}
          size="icon"
          className={`${getButtonSize()} text-[#2ECC71] border-[#2ECC71] hover:bg-[#2ECC71] hover:text-white`}
          onClick={onPause}
          title={getTooltipText('pause')}
        >
          <Pause className={getIconSize()} />
        </Button>
      ) : (
        <Button
          variant={variant}
          size="icon"
          className={`${getButtonSize()} text-[#2ECC71] border-[#2ECC71] hover:bg-[#2ECC71] hover:text-white`}
          onClick={onPlay}
          disabled={!isPaused && !canReplay}
          title={getTooltipText('play')}
        >
          <Play className={getIconSize()} />
        </Button>
      )}

      {/* Stop Button */}
      <Button
        variant={variant}
        size="icon"
        className={`${getButtonSize()} text-red-500 border-red-500 hover:bg-red-500 hover:text-white`}
        onClick={onStop}
        disabled={!isSpeaking && !isPaused}
        title={getTooltipText('stop')}
      >
        <Square className={getIconSize()} />
      </Button>

      {/* Replay Button */}
      <Button
        variant={variant}
        size="icon"
        className={`${getButtonSize()} text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white`}
        onClick={onReplay}
        disabled={!canReplay}
        title={getTooltipText('replay')}
      >
        <RotateCcw className={getIconSize()} />
      </Button>

      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="flex items-center gap-2 ml-2">
          <Volume2 className={`${getIconSize()} text-[#2ECC71] animate-pulse`} />
          <span className="text-sm text-[#2ECC71] font-medium">
            {language === 'bn' ? 'বলছি...' : 'Speaking...'}
          </span>
        </div>
      )}
    </div>
  );
};

export default SpeechControls;