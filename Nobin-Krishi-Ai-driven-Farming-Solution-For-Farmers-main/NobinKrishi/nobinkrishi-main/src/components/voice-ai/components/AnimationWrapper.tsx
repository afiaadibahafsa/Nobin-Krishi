import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface AnimationWrapperProps {
  children: React.ReactNode;
  animation?: 'fade' | 'slide' | 'scale' | 'bounce' | 'pulse' | 'spin' | 'shake' | 'glow';
  direction?: 'up' | 'down' | 'left' | 'right' | 'in' | 'out';
  duration?: 'fast' | 'normal' | 'slow' | 'slower';
  delay?: number; // milliseconds
  trigger?: 'mount' | 'hover' | 'focus' | 'visible' | 'manual';
  isActive?: boolean; // for manual trigger
  repeat?: boolean | number; // true for infinite, number for specific count
  className?: string;
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
}

// Animation class mappings
const ANIMATIONS = {
  fade: {
    in: 'animate-fade-in',
    out: 'animate-fade-out',
    up: 'animate-fade-up',
    down: 'animate-fade-down',
    left: 'animate-fade-left',
    right: 'animate-fade-right'
  },
  slide: {
    in: 'animate-slide-in',
    out: 'animate-slide-out',
    up: 'animate-slide-up',
    down: 'animate-slide-down',
    left: 'animate-slide-left',
    right: 'animate-slide-right'
  },
  scale: {
    in: 'animate-scale-in',
    out: 'animate-scale-out',
    up: 'animate-scale-up',
    down: 'animate-scale-down'
  },
  bounce: {
    in: 'animate-bounce-in',
    out: 'animate-bounce-out',
    up: 'animate-bounce',
    down: 'animate-bounce'
  },
  pulse: {
    in: 'animate-pulse',
    out: 'animate-pulse',
    up: 'animate-pulse',
    down: 'animate-pulse'
  },
  spin: {
    in: 'animate-spin',
    out: 'animate-spin',
    up: 'animate-spin',
    down: 'animate-spin'
  },
  shake: {
    in: 'animate-shake',
    out: 'animate-shake',
    up: 'animate-shake',
    down: 'animate-shake'
  },
  glow: {
    in: 'animate-glow',
    out: 'animate-glow',
    up: 'animate-glow',
    down: 'animate-glow'
  }
};

// Duration class mappings
const DURATIONS = {
  fast: 'duration-150',
  normal: 'duration-300',
  slow: 'duration-500',
  slower: 'duration-700'
};

export const AnimationWrapper: React.FC<AnimationWrapperProps> = ({
  children,
  animation = 'fade',
  direction = 'in',
  duration = 'normal',
  delay = 0,
  trigger = 'mount',
  isActive = false,
  repeat = false,
  className = '',
  onAnimationStart,
  onAnimationEnd
}) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Handle visibility-based trigger
  useEffect(() => {
    if (trigger === 'visible' && elementRef.current) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setShouldAnimate(true);
          }
        },
        { threshold: 0.1 }
      );

      observerRef.current.observe(elementRef.current);

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }
  }, [trigger]);

  // Handle mount trigger
  useEffect(() => {
    if (trigger === 'mount') {
      const timer = setTimeout(() => {
        setShouldAnimate(true);
        onAnimationStart?.();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [trigger, delay, onAnimationStart]);

  // Handle manual trigger
  useEffect(() => {
    if (trigger === 'manual' && isActive) {
      const timer = setTimeout(() => {
        setShouldAnimate(true);
        onAnimationStart?.();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [trigger, isActive, delay, onAnimationStart]);

  // Handle animation end
  useEffect(() => {
    if (shouldAnimate) {
      const animationDuration = {
        fast: 150,
        normal: 300,
        slow: 500,
        slower: 700
      }[duration];

      const timer = setTimeout(() => {
        onAnimationEnd?.();
        
        // Handle repeat
        if (repeat === true) {
          setShouldAnimate(false);
          setTimeout(() => setShouldAnimate(true), 100);
        } else if (typeof repeat === 'number' && repeat > 1) {
          // Implementation for specific repeat count would go here
        }
      }, animationDuration);

      return () => clearTimeout(timer);
    }
  }, [shouldAnimate, duration, repeat, onAnimationEnd]);

  // Get animation class
  const getAnimationClass = () => {
    if (!shouldAnimate) return '';
    
    const animationSet = ANIMATIONS[animation];
    if (!animationSet) return '';
    
    return animationSet[direction as keyof typeof animationSet] || animationSet.in;
  };

  // Get repeat class
  const getRepeatClass = () => {
    if (repeat === true) return 'animate-infinite';
    return '';
  };

  // Handle hover trigger
  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setShouldAnimate(true);
      onAnimationStart?.();
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setShouldAnimate(false);
    }
  };

  // Handle focus trigger
  const handleFocus = () => {
    if (trigger === 'focus') {
      setShouldAnimate(true);
      onAnimationStart?.();
    }
  };

  const handleBlur = () => {
    if (trigger === 'focus') {
      setShouldAnimate(false);
    }
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        'transition-all ease-in-out',
        DURATIONS[duration],
        getAnimationClass(),
        getRepeatClass(),
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
    </div>
  );
};

// Specialized animation components
export const FadeInWrapper: React.FC<Omit<AnimationWrapperProps, 'animation'>> = (props) => (
  <AnimationWrapper {...props} animation="fade" direction="in" />
);

export const SlideUpWrapper: React.FC<Omit<AnimationWrapperProps, 'animation' | 'direction'>> = (props) => (
  <AnimationWrapper {...props} animation="slide" direction="up" />
);

export const ScaleInWrapper: React.FC<Omit<AnimationWrapperProps, 'animation'>> = (props) => (
  <AnimationWrapper {...props} animation="scale" direction="in" />
);

export const BounceWrapper: React.FC<Omit<AnimationWrapperProps, 'animation'>> = (props) => (
  <AnimationWrapper {...props} animation="bounce" />
);

export const PulseWrapper: React.FC<Omit<AnimationWrapperProps, 'animation'>> = (props) => (
  <AnimationWrapper {...props} animation="pulse" repeat={true} />
);

export const SpinWrapper: React.FC<Omit<AnimationWrapperProps, 'animation'>> = (props) => (
  <AnimationWrapper {...props} animation="spin" repeat={true} />
);

// State-based animation wrapper
export const StateAnimationWrapper: React.FC<AnimationWrapperProps & {
  state: 'idle' | 'active' | 'success' | 'error' | 'loading';
}> = ({ state, children, ...props }) => {
  const getAnimationForState = () => {
    switch (state) {
      case 'active':
        return { animation: 'pulse' as const, repeat: true };
      case 'success':
        return { animation: 'bounce' as const, direction: 'in' as const };
      case 'error':
        return { animation: 'shake' as const };
      case 'loading':
        return { animation: 'spin' as const, repeat: true };
      default:
        return { animation: 'fade' as const, direction: 'in' as const };
    }
  };

  const stateAnimation = getAnimationForState();

  return (
    <AnimationWrapper
      {...props}
      {...stateAnimation}
      isActive={state !== 'idle'}
      trigger="manual"
    >
      {children}
    </AnimationWrapper>
  );
};

export default AnimationWrapper;