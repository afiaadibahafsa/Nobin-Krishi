import { useState, useEffect, useCallback, useRef } from 'react';

export interface MobileOptimizationConfig {
  enableHapticFeedback?: boolean;
  enableSwipeGestures?: boolean;
  touchTargetMinSize?: number;
  enablePullToRefresh?: boolean;
  enableDoubleTapZoom?: boolean;
  enableTouchScrolling?: boolean;
}

export interface TouchGestureState {
  isSwipeEnabled: boolean;
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null;
  swipeDistance: number;
  touchStartX: number;
  touchStartY: number;
  touchEndX: number;
  touchEndY: number;
}

export interface MobileOptimizationState {
  isMobile: boolean;
  isTablet: boolean;
  isTouch: boolean;
  orientation: 'portrait' | 'landscape';
  screenSize: {
    width: number;
    height: number;
  };
  devicePixelRatio: number;
  hasHapticFeedback: boolean;
  touchGesture: TouchGestureState;
  isKeyboardVisible: boolean;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface MobileOptimizationActions {
  triggerHapticFeedback: (type?: 'light' | 'medium' | 'heavy' | 'selection' | 'impact' | 'notification') => void;
  enableSwipeGestures: (element: HTMLElement, callbacks: SwipeCallbacks) => () => void;
  optimizeTouchTargets: (element: HTMLElement) => void;
  handleKeyboardVisibility: (callback: (isVisible: boolean) => void) => () => void;
  preventZoom: (element: HTMLElement) => void;
  enableSmoothScrolling: (element: HTMLElement) => void;
}

export interface SwipeCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeStart?: (x: number, y: number) => void;
  onSwipeEnd?: (direction: string, distance: number) => void;
}

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;
const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 0.3;

export const useMobileOptimization = (config: MobileOptimizationConfig = {}): [MobileOptimizationState, MobileOptimizationActions] => {
  const {
    enableHapticFeedback = true,
    enableSwipeGestures = true,
    touchTargetMinSize = 44,
    enablePullToRefresh = false,
    enableDoubleTapZoom = false,
    enableTouchScrolling = true
  } = config;

  const [state, setState] = useState<MobileOptimizationState>({
    isMobile: false,
    isTablet: false,
    isTouch: false,
    orientation: 'portrait',
    screenSize: { width: 0, height: 0 },
    devicePixelRatio: 1,
    hasHapticFeedback: false,
    touchGesture: {
      isSwipeEnabled: enableSwipeGestures,
      swipeDirection: null,
      swipeDistance: 0,
      touchStartX: 0,
      touchStartY: 0,
      touchEndX: 0,
      touchEndY: 0
    },
    isKeyboardVisible: false,
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 }
  });

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const keyboardHeightRef = useRef<number>(0);

  // Initialize mobile detection and device capabilities
  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < MOBILE_BREAKPOINT;
      const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const orientation = width > height ? 'landscape' : 'portrait';
      const devicePixelRatio = window.devicePixelRatio || 1;

      // Check for haptic feedback support
      const hasHapticFeedback = 'vibrate' in navigator || 
        ('hapticFeedback' in navigator) ||
        // @ts-ignore - Check for iOS haptic feedback
        ('webkitVibrate' in navigator);

      // Get safe area insets (for devices with notches, etc.)
      const computedStyle = getComputedStyle(document.documentElement);
      const safeAreaInsets = {
        top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0'),
        right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0')
      };

      setState(prev => ({
        ...prev,
        isMobile,
        isTablet,
        isTouch,
        orientation,
        screenSize: { width, height },
        devicePixelRatio,
        hasHapticFeedback,
        safeAreaInsets
      }));
    };

    // Initial detection
    updateDeviceInfo();

    // Listen for resize and orientation changes
    const handleResize = () => updateDeviceInfo();
    const handleOrientationChange = () => {
      // Delay to allow for orientation change to complete
      setTimeout(updateDeviceInfo, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Keyboard visibility detection for mobile devices
  useEffect(() => {
    if (!state.isMobile) return;

    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        const keyboardHeight = window.innerHeight - window.visualViewport.height;
        const isKeyboardVisible = keyboardHeight > 150; // Threshold for keyboard detection
        
        keyboardHeightRef.current = keyboardHeight;
        setState(prev => ({
          ...prev,
          isKeyboardVisible
        }));
      }
    };

    // Modern approach using Visual Viewport API
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
      return () => {
        window.visualViewport?.removeEventListener('resize', handleVisualViewportChange);
      };
    }

    // Fallback for older browsers
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const isKeyboardVisible = currentHeight < state.screenSize.height * 0.75;
      
      setState(prev => ({
        ...prev,
        isKeyboardVisible
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [state.isMobile, state.screenSize.height]);

  // Haptic feedback function
  const triggerHapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' | 'selection' | 'impact' | 'notification' = 'light') => {
    if (!enableHapticFeedback || !state.hasHapticFeedback) return;

    try {
      // iOS Haptic Feedback
      // @ts-ignore - iOS specific API
      if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
        // @ts-ignore - iOS Haptic Feedback API
        if (navigator.vibrate) {
          const patterns = {
            light: [10],
            medium: [20],
            heavy: [30],
            selection: [5],
            impact: [15],
            notification: [10, 50, 10]
          };
          navigator.vibrate(patterns[type]);
        }
      }
      // Android Vibration API
      else if (navigator.vibrate) {
        const patterns = {
          light: [50],
          medium: [100],
          heavy: [200],
          selection: [25],
          impact: [75],
          notification: [100, 50, 100]
        };
        navigator.vibrate(patterns[type]);
      }
    } catch (error) {
      console.warn('Haptic feedback not supported:', error);
    }
  }, [enableHapticFeedback, state.hasHapticFeedback]);

  // Swipe gesture detection
  const enableSwipeGesturesAction = useCallback((element: HTMLElement, callbacks: SwipeCallbacks) => {
    if (!enableSwipeGestures || !state.isTouch) return () => {};

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };

      setState(prev => ({
        ...prev,
        touchGesture: {
          ...prev.touchGesture,
          touchStartX: touch.clientX,
          touchStartY: touch.clientY
        }
      }));

      callbacks.onSwipeStart?.(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;
      const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;

      setState(prev => ({
        ...prev,
        touchGesture: {
          ...prev.touchGesture,
          touchEndX: touch.clientX,
          touchEndY: touch.clientY,
          swipeDistance: Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        }
      }));

      // Determine swipe direction and trigger callbacks
      if (velocity > SWIPE_VELOCITY_THRESHOLD) {
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        if (absDeltaX > SWIPE_THRESHOLD || absDeltaY > SWIPE_THRESHOLD) {
          let direction: 'left' | 'right' | 'up' | 'down';
          
          if (absDeltaX > absDeltaY) {
            direction = deltaX > 0 ? 'right' : 'left';
          } else {
            direction = deltaY > 0 ? 'down' : 'up';
          }

          setState(prev => ({
            ...prev,
            touchGesture: {
              ...prev.touchGesture,
              swipeDirection: direction
            }
          }));

          // Trigger appropriate callback
          switch (direction) {
            case 'left':
              callbacks.onSwipeLeft?.();
              break;
            case 'right':
              callbacks.onSwipeRight?.();
              break;
            case 'up':
              callbacks.onSwipeUp?.();
              break;
            case 'down':
              callbacks.onSwipeDown?.();
              break;
          }

          callbacks.onSwipeEnd?.(direction, Math.sqrt(deltaX * deltaX + deltaY * deltaY));
          
          // Trigger haptic feedback for successful swipe
          triggerHapticFeedback('selection');
        }
      }

      touchStartRef.current = null;
    };

    const handleTouchCancel = () => {
      touchStartRef.current = null;
      setState(prev => ({
        ...prev,
        touchGesture: {
          ...prev.touchGesture,
          swipeDirection: null,
          swipeDistance: 0
        }
      }));
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [enableSwipeGestures, state.isTouch, triggerHapticFeedback]);

  // Touch target optimization
  const optimizeTouchTargets = useCallback((element: HTMLElement) => {
    const touchTargets = element.querySelectorAll('button, a, input, [role="button"], [tabindex]');
    
    touchTargets.forEach((target) => {
      const htmlTarget = target as HTMLElement;
      const rect = htmlTarget.getBoundingClientRect();
      
      // Ensure minimum touch target size
      if (rect.width < touchTargetMinSize || rect.height < touchTargetMinSize) {
        htmlTarget.style.minWidth = `${touchTargetMinSize}px`;
        htmlTarget.style.minHeight = `${touchTargetMinSize}px`;
        htmlTarget.classList.add('voice-ai-touch-target');
      }
      
      // Add touch-friendly padding if needed
      const computedStyle = getComputedStyle(htmlTarget);
      const padding = parseInt(computedStyle.padding) || 0;
      if (padding < 8) {
        htmlTarget.style.padding = '8px';
      }
    });
  }, [touchTargetMinSize]);

  // Keyboard visibility handler
  const handleKeyboardVisibility = useCallback((callback: (isVisible: boolean) => void) => {
    const handleChange = () => {
      callback(state.isKeyboardVisible);
    };

    // Call immediately with current state
    handleChange();

    // Return cleanup function (no actual listener needed as state updates automatically)
    return () => {};
  }, [state.isKeyboardVisible]);

  // Prevent zoom on double tap
  const preventZoom = useCallback((element: HTMLElement) => {
    if (!enableDoubleTapZoom) {
      element.addEventListener('touchend', (e) => {
        e.preventDefault();
      }, { passive: false });
      
      // Add CSS to prevent zoom
      element.style.touchAction = 'manipulation';
    }
  }, [enableDoubleTapZoom]);

  // Enable smooth scrolling
  const enableSmoothScrolling = useCallback((element: HTMLElement) => {
    if (enableTouchScrolling) {
      element.style.webkitOverflowScrolling = 'touch';
      element.style.scrollBehavior = 'smooth';
    }
  }, [enableTouchScrolling]);

  const actions: MobileOptimizationActions = {
    triggerHapticFeedback,
    enableSwipeGestures: enableSwipeGesturesAction,
    optimizeTouchTargets,
    handleKeyboardVisibility,
    preventZoom,
    enableSmoothScrolling
  };

  return [state, actions];
};

export default useMobileOptimization;