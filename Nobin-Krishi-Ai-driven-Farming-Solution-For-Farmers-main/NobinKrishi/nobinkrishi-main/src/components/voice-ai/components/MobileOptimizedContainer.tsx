import React, { useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useMobileOptimization, SwipeCallbacks } from '../hooks/useMobileOptimization';

export interface MobileOptimizedContainerProps {
  children: ReactNode;
  className?: string;
  enableSwipeGestures?: boolean;
  enableHapticFeedback?: boolean;
  enableTouchOptimization?: boolean;
  swipeCallbacks?: SwipeCallbacks;
  onKeyboardVisibilityChange?: (isVisible: boolean) => void;
  preventZoom?: boolean;
  enableSmoothScrolling?: boolean;
  safeAreaPadding?: boolean;
  adaptiveLayout?: boolean;
}

export const MobileOptimizedContainer: React.FC<MobileOptimizedContainerProps> = ({
  children,
  className = '',
  enableSwipeGestures = true,
  enableHapticFeedback = true,
  enableTouchOptimization = true,
  swipeCallbacks,
  onKeyboardVisibilityChange,
  preventZoom = true,
  enableSmoothScrolling = true,
  safeAreaPadding = true,
  adaptiveLayout = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [mobileState, mobileActions] = useMobileOptimization({
    enableHapticFeedback,
    enableSwipeGestures,
    touchTargetMinSize: 44,
    enableDoubleTapZoom: !preventZoom,
    enableTouchScrolling: enableSmoothScrolling
  });

  // Apply mobile optimizations when container mounts
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const cleanupFunctions: (() => void)[] = [];

    // Enable touch target optimization
    if (enableTouchOptimization && mobileState.isMobile) {
      mobileActions.optimizeTouchTargets(container);
    }

    // Enable swipe gestures
    if (enableSwipeGestures && swipeCallbacks && mobileState.isTouch) {
      const cleanup = mobileActions.enableSwipeGestures(container, swipeCallbacks);
      cleanupFunctions.push(cleanup);
    }

    // Prevent zoom if requested
    if (preventZoom && mobileState.isMobile) {
      mobileActions.preventZoom(container);
    }

    // Enable smooth scrolling
    if (enableSmoothScrolling) {
      mobileActions.enableSmoothScrolling(container);
    }

    // Handle keyboard visibility changes
    if (onKeyboardVisibilityChange) {
      const cleanup = mobileActions.handleKeyboardVisibility(onKeyboardVisibilityChange);
      cleanupFunctions.push(cleanup);
    }

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [
    mobileState.isMobile,
    mobileState.isTouch,
    enableTouchOptimization,
    enableSwipeGestures,
    swipeCallbacks,
    preventZoom,
    enableSmoothScrolling,
    onKeyboardVisibilityChange,
    mobileActions
  ]);

  // Generate responsive classes based on device state
  const getResponsiveClasses = () => {
    const classes = [];

    // Base mobile optimizations
    if (mobileState.isMobile) {
      classes.push('mobile-optimized');
    }

    if (mobileState.isTablet) {
      classes.push('tablet-optimized');
    }

    // Orientation-specific classes
    classes.push(`orientation-${mobileState.orientation}`);

    // Touch-specific optimizations
    if (mobileState.isTouch) {
      classes.push('touch-enabled');
    }

    // Keyboard visibility adjustments
    if (mobileState.isKeyboardVisible) {
      classes.push('keyboard-visible');
    }

    // Safe area padding
    if (safeAreaPadding && (mobileState.safeAreaInsets.top > 0 || mobileState.safeAreaInsets.bottom > 0)) {
      classes.push('safe-area-padding');
    }

    // Adaptive layout classes
    if (adaptiveLayout) {
      if (mobileState.isMobile) {
        classes.push('layout-mobile');
      } else if (mobileState.isTablet) {
        classes.push('layout-tablet');
      } else {
        classes.push('layout-desktop');
      }
    }

    return classes.join(' ');
  };

  // Generate inline styles for safe area and dynamic adjustments
  const getInlineStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {};

    // Safe area insets
    if (safeAreaPadding) {
      if (mobileState.safeAreaInsets.top > 0) {
        styles.paddingTop = `max(1rem, env(safe-area-inset-top))`;
      }
      if (mobileState.safeAreaInsets.bottom > 0) {
        styles.paddingBottom = `max(1rem, env(safe-area-inset-bottom))`;
      }
      if (mobileState.safeAreaInsets.left > 0) {
        styles.paddingLeft = `max(1rem, env(safe-area-inset-left))`;
      }
      if (mobileState.safeAreaInsets.right > 0) {
        styles.paddingRight = `max(1rem, env(safe-area-inset-right))`;
      }
    }

    // Keyboard visibility adjustments
    if (mobileState.isKeyboardVisible && mobileState.isMobile) {
      styles.paddingBottom = '0';
      styles.marginBottom = '0';
    }

    // Touch action for gesture handling
    if (enableSwipeGestures && mobileState.isTouch) {
      styles.touchAction = 'pan-y'; // Allow vertical scrolling but capture horizontal swipes
    } else if (preventZoom) {
      styles.touchAction = 'manipulation';
    }

    return styles;
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        // Base container classes
        'mobile-optimized-container',
        'relative w-full',
        
        // Responsive classes
        getResponsiveClasses(),
        
        // Mobile-specific optimizations
        mobileState.isMobile && [
          'touch-none', // Prevent default touch behaviors
          'select-none', // Prevent text selection on touch
          'overscroll-none', // Prevent overscroll bounce
        ],
        
        // Touch-friendly spacing
        mobileState.isTouch && [
          'space-y-2', // Increased spacing for touch targets
        ],
        
        // Keyboard visibility adjustments
        mobileState.isKeyboardVisible && [
          'pb-0', // Remove bottom padding when keyboard is visible
        ],
        
        // Orientation-specific adjustments
        mobileState.orientation === 'landscape' && mobileState.isMobile && [
          'landscape:py-2', // Reduced vertical padding in landscape
        ],
        
        // Custom className
        className
      )}
      style={getInlineStyles()}
      data-mobile={mobileState.isMobile}
      data-tablet={mobileState.isTablet}
      data-touch={mobileState.isTouch}
      data-orientation={mobileState.orientation}
      data-keyboard-visible={mobileState.isKeyboardVisible}
      role="main"
      aria-label="Mobile optimized voice AI interface"
    >
      {children}
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-0 left-0 bg-black/80 text-white text-xs p-2 z-50 max-w-xs">
          <div>Mobile: {mobileState.isMobile ? 'Yes' : 'No'}</div>
          <div>Touch: {mobileState.isTouch ? 'Yes' : 'No'}</div>
          <div>Orientation: {mobileState.orientation}</div>
          <div>Keyboard: {mobileState.isKeyboardVisible ? 'Visible' : 'Hidden'}</div>
          <div>Screen: {mobileState.screenSize.width}x{mobileState.screenSize.height}</div>
          {mobileState.touchGesture.swipeDirection && (
            <div>Last Swipe: {mobileState.touchGesture.swipeDirection}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileOptimizedContainer;