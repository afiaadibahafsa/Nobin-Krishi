import React from 'react';
import { 
  Mic, 
  MicOff, 
  Loader2, 
  Volume2, 
  VolumeX, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle,
  Wifi,
  WifiOff,
  MessageSquare,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UIStateInfo, UIState, UIFeedbackType } from '../hooks/useUIStateManager';

export interface UIStateIndicatorProps {
  stateInfo: UIStateInfo;
  isVisible: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'detailed';
  showProgress?: boolean;
  showIcon?: boolean;
  showAnimation?: boolean;
}

// Icon mapping for different states
const STATE_ICONS = {
  idle: MessageSquare,
  listening: Mic,
  processing: Brain,
  speaking: Volume2,
  error: AlertCircle,
  loading: Loader2,
  success: CheckCircle,
  warning: AlertTriangle
};

// Type-based icon mapping
const TYPE_ICONS = {
  status: Info,
  progress: Loader2,
  error: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info
};

export const UIStateIndicator: React.FC<UIStateIndicatorProps> = ({
  stateInfo,
  isVisible,
  className = '',
  size = 'md',
  variant = 'default',
  showProgress = true,
  showIcon = true,
  showAnimation = true
}) => {
  const { state, message, progress, type, timestamp } = stateInfo;

  // Get appropriate icon
  const getIcon = () => {
    if (type === 'progress' && progress !== undefined) {
      return Loader2;
    }
    return STATE_ICONS[state] || TYPE_ICONS[type] || Info;
  };

  // Get color classes based on state and type
  const getColorClasses = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-600',
          icon: 'text-red-500',
          progress: 'bg-red-500'
        };
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-600',
          icon: 'text-green-500',
          progress: 'bg-green-500'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-600',
          icon: 'text-yellow-500',
          progress: 'bg-yellow-500'
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-600',
          icon: 'text-blue-500',
          progress: 'bg-blue-500'
        };
      default:
        switch (state) {
          case 'listening':
            return {
              bg: 'bg-green-50 border-green-200',
              text: 'text-green-600',
              icon: 'text-green-500',
              progress: 'bg-green-500'
            };
          case 'processing':
            return {
              bg: 'bg-blue-50 border-blue-200',
              text: 'text-blue-600',
              icon: 'text-blue-500',
              progress: 'bg-blue-500'
            };
          case 'speaking':
            return {
              bg: 'bg-purple-50 border-purple-200',
              text: 'text-purple-600',
              icon: 'text-purple-500',
              progress: 'bg-purple-500'
            };
          case 'error':
            return {
              bg: 'bg-red-50 border-red-200',
              text: 'text-red-600',
              icon: 'text-red-500',
              progress: 'bg-red-500'
            };
          default:
            return {
              bg: 'bg-gray-50 border-gray-200',
              text: 'text-gray-600',
              icon: 'text-gray-500',
              progress: 'bg-gray-500'
            };
        }
    }
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-2 text-xs',
          icon: 'w-3 h-3',
          progress: 'h-1'
        };
      case 'lg':
        return {
          container: 'p-4 text-base',
          icon: 'w-6 h-6',
          progress: 'h-3'
        };
      default:
        return {
          container: 'p-3 text-sm',
          icon: 'w-4 h-4',
          progress: 'h-2'
        };
    }
  };

  // Get animation classes
  const getAnimationClasses = () => {
    if (!showAnimation) return '';
    
    switch (state) {
      case 'listening':
        return 'animate-pulse';
      case 'processing':
      case 'loading':
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

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'rounded-lg border transition-all duration-300 ease-in-out',
        colors.bg,
        sizes.container,
        getAnimationClasses(),
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        className
      )}
    >
      <div className="flex items-center gap-2">
        {/* Icon */}
        {showIcon && (
          <div className="flex-shrink-0">
            <Icon 
              className={cn(
                sizes.icon,
                colors.icon,
                state === 'processing' || state === 'loading' ? 'animate-spin' : '',
                state === 'listening' ? 'animate-pulse' : ''
              )} 
            />
          </div>
        )}

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className={cn('font-medium truncate', colors.text)}>
            {message}
          </p>
          
          {/* Progress Bar */}
          {showProgress && progress !== undefined && progress >= 0 && (
            <div className="mt-2">
              <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizes.progress)}>
                <div
                  className={cn('transition-all duration-300 ease-out rounded-full', colors.progress, sizes.progress)}
                  style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(progress)}%
              </p>
            </div>
          )}

          {/* Detailed variant - show timestamp */}
          {variant === 'detailed' && (
            <p className="text-xs text-gray-400 mt-1">
              {new Date(timestamp).toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* State-specific additional indicators */}
        {state === 'listening' && showAnimation && (
          <div className="flex-shrink-0">
            <div className="flex items-center gap-1">
              <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {state === 'speaking' && showAnimation && (
          <div className="flex-shrink-0">
            <div className="flex items-center gap-1">
              <div className="w-1 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
              <div className="w-1 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
              <div className="w-1 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Floating state indicator for overlay display
export const FloatingStateIndicator: React.FC<UIStateIndicatorProps & {
  position?: 'top' | 'bottom' | 'center';
}> = ({
  position = 'top',
  ...props
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50';
      case 'center':
        return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50';
      default:
        return 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50';
    }
  };

  return (
    <div className={getPositionClasses()}>
      <UIStateIndicator {...props} />
    </div>
  );
};

// Inline state indicator for embedding in components
export const InlineStateIndicator: React.FC<UIStateIndicatorProps> = (props) => {
  return <UIStateIndicator {...props} variant="minimal" size="sm" />;
};

// Status bar indicator for persistent display
export const StatusBarIndicator: React.FC<UIStateIndicatorProps & {
  compact?: boolean;
}> = ({
  compact = false,
  ...props
}) => {
  return (
    <UIStateIndicator 
      {...props} 
      variant={compact ? "minimal" : "default"}
      size={compact ? "sm" : "md"}
      showProgress={!compact}
      className={cn(
        'w-full',
        compact ? 'rounded-none border-x-0' : '',
        props.className
      )}
    />
  );
};

export default UIStateIndicator;