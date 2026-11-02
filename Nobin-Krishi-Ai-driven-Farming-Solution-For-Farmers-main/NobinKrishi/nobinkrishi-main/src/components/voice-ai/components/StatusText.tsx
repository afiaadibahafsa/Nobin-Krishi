import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Brain, 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

export interface StatusTextProps {
  status: string;
  type?: 'default' | 'listening' | 'processing' | 'speaking' | 'error' | 'success' | 'warning';
  language?: 'bn' | 'en';
  showIcon?: boolean;
  showTimestamp?: boolean;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  duration?: number; // Auto-hide duration in ms
  onExpire?: () => void;
}

// Icon mapping for different status types
const STATUS_ICONS = {
  default: null,
  listening: Mic,
  processing: Brain,
  speaking: Volume2,
  error: AlertCircle,
  success: CheckCircle,
  warning: AlertCircle
};

// Enhanced status messages with context
const ENHANCED_STATUS_MESSAGES = {
  bn: {
    // Speech Recognition
    'listening-start': 'শুনতে শুরু করছি...',
    'listening-active': 'শুনছি... কথা বলুন',
    'listening-interim': 'আপনার কথা বুঝছি...',
    'listening-complete': 'শোনা সম্পন্ন',
    'listening-timeout': 'সময় শেষ - আবার চেষ্টা করুন',
    'listening-no-speech': 'কোনো কথা শোনা যায়নি',
    'listening-error': 'শোনার সমস্যা হয়েছে',
    
    // API Processing
    'processing-start': 'প্রক্রিয়াকরণ শুরু...',
    'processing-api': 'AI এর সাথে যোগাযোগ করছি...',
    'processing-thinking': 'AI চিন্তা করছে...',
    'processing-generating': 'উত্তর তৈরি করছি...',
    'processing-complete': 'প্রক্রিয়াকরণ সম্পন্ন',
    'processing-retry': 'পুনরায় চেষ্টা করছি...',
    'processing-error': 'প্রক্রিয়াকরণে সমস্যা',
    
    // Speech Synthesis
    'speaking-prepare': 'বক্তৃতা প্রস্তুত করছি...',
    'speaking-active': 'বলছি...',
    'speaking-paused': 'বিরতি',
    'speaking-complete': 'বক্তৃতা সম্পন্ন',
    'speaking-error': 'বক্তৃতায় সমস্যা',
    
    // Network & Connection
    'network-connecting': 'সংযোগ করছি...',
    'network-connected': 'সংযুক্ত',
    'network-disconnected': 'সংযোগ বিচ্ছিন্ন',
    'network-error': 'সংযোগ সমস্যা',
    'network-retry': 'পুনরায় সংযোগ করছি...',
    
    // General States
    'ready': 'প্রস্তুত',
    'idle': 'অপেক্ষমান',
    'loading': 'লোড হচ্ছে...',
    'success': 'সফল',
    'error': 'ত্রুটি',
    'warning': 'সতর্কতা'
  },
  en: {
    // Speech Recognition
    'listening-start': 'Starting to listen...',
    'listening-active': 'Listening... Please speak',
    'listening-interim': 'Understanding your speech...',
    'listening-complete': 'Listening complete',
    'listening-timeout': 'Timeout - Please try again',
    'listening-no-speech': 'No speech detected',
    'listening-error': 'Listening error occurred',
    
    // API Processing
    'processing-start': 'Starting processing...',
    'processing-api': 'Connecting to AI...',
    'processing-thinking': 'AI is thinking...',
    'processing-generating': 'Generating response...',
    'processing-complete': 'Processing complete',
    'processing-retry': 'Retrying...',
    'processing-error': 'Processing error',
    
    // Speech Synthesis
    'speaking-prepare': 'Preparing speech...',
    'speaking-active': 'Speaking...',
    'speaking-paused': 'Paused',
    'speaking-complete': 'Speech complete',
    'speaking-error': 'Speech error',
    
    // Network & Connection
    'network-connecting': 'Connecting...',
    'network-connected': 'Connected',
    'network-disconnected': 'Disconnected',
    'network-error': 'Connection error',
    'network-retry': 'Reconnecting...',
    
    // General States
    'ready': 'Ready',
    'idle': 'Idle',
    'loading': 'Loading...',
    'success': 'Success',
    'error': 'Error',
    'warning': 'Warning'
  }
};

export const StatusText: React.FC<StatusTextProps> = ({
  status,
  type = 'default',
  language = 'en',
  showIcon = true,
  showTimestamp = false,
  animated = true,
  size = 'md',
  className = '',
  duration,
  onExpire
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timestamp] = useState(new Date());

  // Auto-hide functionality
  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onExpire?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onExpire]);

  // Get enhanced message if available
  const getDisplayMessage = () => {
    const enhancedMessage = ENHANCED_STATUS_MESSAGES[language][status as keyof typeof ENHANCED_STATUS_MESSAGES[typeof language]];
    return enhancedMessage || status;
  };

  // Get appropriate icon
  const getIcon = () => {
    if (!showIcon) return null;
    
    const IconComponent = STATUS_ICONS[type];
    return IconComponent ? IconComponent : null;
  };

  // Get color classes based on type
  const getColorClasses = () => {
    switch (type) {
      case 'listening':
        return {
          text: 'text-green-600',
          icon: 'text-green-500',
          bg: 'bg-green-50'
        };
      case 'processing':
        return {
          text: 'text-blue-600',
          icon: 'text-blue-500',
          bg: 'bg-blue-50'
        };
      case 'speaking':
        return {
          text: 'text-purple-600',
          icon: 'text-purple-500',
          bg: 'bg-purple-50'
        };
      case 'error':
        return {
          text: 'text-red-600',
          icon: 'text-red-500',
          bg: 'bg-red-50'
        };
      case 'success':
        return {
          text: 'text-green-600',
          icon: 'text-green-500',
          bg: 'bg-green-50'
        };
      case 'warning':
        return {
          text: 'text-yellow-600',
          icon: 'text-yellow-500',
          bg: 'bg-yellow-50'
        };
      default:
        return {
          text: 'text-gray-600',
          icon: 'text-gray-500',
          bg: 'bg-gray-50'
        };
    }
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          text: 'text-xs',
          icon: 'w-3 h-3',
          padding: 'px-2 py-1'
        };
      case 'lg':
        return {
          text: 'text-base',
          icon: 'w-5 h-5',
          padding: 'px-4 py-2'
        };
      default:
        return {
          text: 'text-sm',
          icon: 'w-4 h-4',
          padding: 'px-3 py-1.5'
        };
    }
  };

  // Get animation classes
  const getAnimationClasses = () => {
    if (!animated) return '';
    
    switch (type) {
      case 'listening':
        return 'animate-pulse';
      case 'processing':
        return 'animate-pulse';
      case 'speaking':
        return 'animate-bounce';
      default:
        return '';
    }
  };

  const Icon = getIcon();
  const colors = getColorClasses();
  const sizes = getSizeClasses();
  const displayMessage = getDisplayMessage();

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border transition-all duration-300',
        colors.bg,
        'border-transparent',
        sizes.padding,
        getAnimationClasses(),
        className
      )}
    >
      {/* Icon */}
      {Icon && (
        <Icon 
          className={cn(
            sizes.icon,
            colors.icon,
            type === 'processing' ? 'animate-spin' : '',
            type === 'listening' ? 'animate-pulse' : ''
          )} 
        />
      )}

      {/* Status Message */}
      <span className={cn('font-medium whitespace-nowrap', sizes.text, colors.text)}>
        {displayMessage}
      </span>

      {/* Timestamp */}
      {showTimestamp && (
        <span className={cn('text-xs opacity-60', colors.text)}>
          {timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          })}
        </span>
      )}

      {/* Activity Indicators */}
      {type === 'listening' && animated && (
        <div className="flex items-center gap-0.5">
          <div className="w-1 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-1 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      )}

      {type === 'speaking' && animated && (
        <div className="flex items-center gap-0.5">
          <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
          <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
        </div>
      )}

      {type === 'processing' && animated && (
        <div className="flex items-center">
          <div className="w-2 h-2 border border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

// Specialized status text components
export const ListeningStatusText: React.FC<Omit<StatusTextProps, 'type'>> = (props) => (
  <StatusText {...props} type="listening" />
);

export const ProcessingStatusText: React.FC<Omit<StatusTextProps, 'type'>> = (props) => (
  <StatusText {...props} type="processing" />
);

export const SpeakingStatusText: React.FC<Omit<StatusTextProps, 'type'>> = (props) => (
  <StatusText {...props} type="speaking" />
);

export const ErrorStatusText: React.FC<Omit<StatusTextProps, 'type'>> = (props) => (
  <StatusText {...props} type="error" />
);

export const SuccessStatusText: React.FC<Omit<StatusTextProps, 'type'>> = (props) => (
  <StatusText {...props} type="success" />
);

// Status text with auto-update capability
export const LiveStatusText: React.FC<StatusTextProps & {
  updateInterval?: number;
  statusProvider?: () => string;
}> = ({
  updateInterval = 1000,
  statusProvider,
  ...props
}) => {
  const [currentStatus, setCurrentStatus] = useState(props.status);

  useEffect(() => {
    if (!statusProvider) return;

    const interval = setInterval(() => {
      const newStatus = statusProvider();
      if (newStatus !== currentStatus) {
        setCurrentStatus(newStatus);
      }
    }, updateInterval);

    return () => clearInterval(interval);
  }, [statusProvider, currentStatus, updateInterval]);

  return <StatusText {...props} status={currentStatus} />;
};

export default StatusText;