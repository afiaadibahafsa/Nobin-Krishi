import React from 'react';
import { Loader2, Brain, Mic, Volume2, Wifi, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingIndicatorProps {
  type?: 'default' | 'speech' | 'processing' | 'network' | 'thinking';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  progress?: number; // 0-100
  language?: 'bn' | 'en';
  className?: string;
  showMessage?: boolean;
  showProgress?: boolean;
  variant?: 'spinner' | 'dots' | 'pulse' | 'wave' | 'bars';
}

// Default messages for different loading types
const LOADING_MESSAGES = {
  bn: {
    default: 'লোড হচ্ছে...',
    speech: 'শুনছি...',
    processing: 'প্রক্রিয়াকরণ...',
    network: 'সংযোগ করছি...',
    thinking: 'AI চিন্তা করছে...'
  },
  en: {
    default: 'Loading...',
    speech: 'Listening...',
    processing: 'Processing...',
    network: 'Connecting...',
    thinking: 'AI is thinking...'
  }
};

// Icon mapping for different types
const TYPE_ICONS = {
  default: Loader2,
  speech: Mic,
  processing: MessageSquare,
  network: Wifi,
  thinking: Brain
};

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  type = 'default',
  size = 'md',
  message,
  progress,
  language = 'en',
  className = '',
  showMessage = true,
  showProgress = true,
  variant = 'spinner'
}) => {
  const Icon = TYPE_ICONS[type];
  const defaultMessage = LOADING_MESSAGES[language][type];
  const displayMessage = message || defaultMessage;

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          icon: 'w-4 h-4',
          text: 'text-sm',
          container: 'gap-2 p-2',
          dot: 'w-1 h-1',
          bar: 'h-1'
        };
      case 'lg':
        return {
          icon: 'w-8 h-8',
          text: 'text-lg',
          container: 'gap-4 p-4',
          dot: 'w-3 h-3',
          bar: 'h-3'
        };
      case 'xl':
        return {
          icon: 'w-12 h-12',
          text: 'text-xl',
          container: 'gap-6 p-6',
          dot: 'w-4 h-4',
          bar: 'h-4'
        };
      default:
        return {
          icon: 'w-6 h-6',
          text: 'text-base',
          container: 'gap-3 p-3',
          dot: 'w-2 h-2',
          bar: 'h-2'
        };
    }
  };

  // Get color classes based on type
  const getColorClasses = () => {
    switch (type) {
      case 'speech':
        return {
          primary: 'text-green-500',
          secondary: 'text-green-400',
          bg: 'bg-green-500'
        };
      case 'processing':
        return {
          primary: 'text-blue-500',
          secondary: 'text-blue-400',
          bg: 'bg-blue-500'
        };
      case 'network':
        return {
          primary: 'text-purple-500',
          secondary: 'text-purple-400',
          bg: 'bg-purple-500'
        };
      case 'thinking':
        return {
          primary: 'text-orange-500',
          secondary: 'text-orange-400',
          bg: 'bg-orange-500'
        };
      default:
        return {
          primary: 'text-gray-500',
          secondary: 'text-gray-400',
          bg: 'bg-gray-500'
        };
    }
  };

  const sizes = getSizeClasses();
  const colors = getColorClasses();

  // Render different variants
  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex items-center gap-1">
            <div className={cn(sizes.dot, colors.bg, 'rounded-full animate-bounce')} style={{ animationDelay: '0ms' }} />
            <div className={cn(sizes.dot, colors.bg, 'rounded-full animate-bounce')} style={{ animationDelay: '150ms' }} />
            <div className={cn(sizes.dot, colors.bg, 'rounded-full animate-bounce')} style={{ animationDelay: '300ms' }} />
          </div>
        );

      case 'pulse':
        return (
          <div className={cn('rounded-full animate-pulse', colors.bg, sizes.icon)} />
        );

      case 'wave':
        return (
          <div className="flex items-end gap-1">
            <div className={cn('w-1 bg-current rounded-full animate-pulse', colors.primary)} style={{ height: '8px', animationDelay: '0ms' }} />
            <div className={cn('w-1 bg-current rounded-full animate-pulse', colors.primary)} style={{ height: '16px', animationDelay: '100ms' }} />
            <div className={cn('w-1 bg-current rounded-full animate-pulse', colors.primary)} style={{ height: '12px', animationDelay: '200ms' }} />
            <div className={cn('w-1 bg-current rounded-full animate-pulse', colors.primary)} style={{ height: '20px', animationDelay: '300ms' }} />
            <div className={cn('w-1 bg-current rounded-full animate-pulse', colors.primary)} style={{ height: '10px', animationDelay: '400ms' }} />
          </div>
        );

      case 'bars':
        return (
          <div className="flex items-center gap-1">
            <div className={cn('w-1 h-4 rounded-full animate-pulse', colors.bg)} style={{ animationDelay: '0ms' }} />
            <div className={cn('w-1 h-6 rounded-full animate-pulse', colors.bg)} style={{ animationDelay: '150ms' }} />
            <div className={cn('w-1 h-4 rounded-full animate-pulse', colors.bg)} style={{ animationDelay: '300ms' }} />
          </div>
        );

      default: // spinner
        return (
          <Icon className={cn(sizes.icon, colors.primary, 'animate-spin')} />
        );
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', sizes.container, className)}>
      {/* Loading Animation */}
      <div className="flex items-center justify-center">
        {renderVariant()}
      </div>

      {/* Message */}
      {showMessage && displayMessage && (
        <p className={cn('font-medium text-center', sizes.text, colors.primary)}>
          {displayMessage}
        </p>
      )}

      {/* Progress Bar */}
      {showProgress && progress !== undefined && progress >= 0 && (
        <div className="w-full max-w-xs mt-2">
          <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizes.bar)}>
            <div
              className={cn('transition-all duration-300 ease-out rounded-full', colors.bg, sizes.bar)}
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center mt-1">
            {Math.round(progress)}%
          </p>
        </div>
      )}
    </div>
  );
};

// Specialized loading components for different use cases
export const SpeechLoadingIndicator: React.FC<Omit<LoadingIndicatorProps, 'type'>> = (props) => (
  <LoadingIndicator {...props} type="speech" variant="wave" />
);

export const ProcessingLoadingIndicator: React.FC<Omit<LoadingIndicatorProps, 'type'>> = (props) => (
  <LoadingIndicator {...props} type="processing" variant="dots" />
);

export const ThinkingLoadingIndicator: React.FC<Omit<LoadingIndicatorProps, 'type'>> = (props) => (
  <LoadingIndicator {...props} type="thinking" variant="pulse" />
);

export const NetworkLoadingIndicator: React.FC<Omit<LoadingIndicatorProps, 'type'>> = (props) => (
  <LoadingIndicator {...props} type="network" variant="bars" />
);

// Overlay loading component
export const OverlayLoadingIndicator: React.FC<LoadingIndicatorProps & {
  overlay?: boolean;
  backdrop?: boolean;
}> = ({
  overlay = true,
  backdrop = true,
  ...props
}) => {
  const content = <LoadingIndicator {...props} size="lg" />;

  if (!overlay) {
    return content;
  }

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center',
      backdrop ? 'bg-black/20 backdrop-blur-sm' : ''
    )}>
      <div className="bg-white rounded-lg shadow-lg p-6">
        {content}
      </div>
    </div>
  );
};

// Inline loading component for buttons and small spaces
export const InlineLoadingIndicator: React.FC<LoadingIndicatorProps> = (props) => (
  <LoadingIndicator 
    {...props} 
    size="sm" 
    showMessage={false} 
    showProgress={false}
    variant="spinner"
    className="inline-flex"
  />
);

export default LoadingIndicator;