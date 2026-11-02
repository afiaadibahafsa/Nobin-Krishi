// Custom debounce hook for performance optimization
import { useCallback, useRef } from 'react';

export interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

/**
 * Custom hook for debouncing function calls
 * Used for optimizing transcription updates and API calls
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: DebounceOptions = {}
): T => {
  const { leading = false, trailing = true, maxWait } = options;
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallTimeRef = useRef<number>(0);
  const lastInvokeTimeRef = useRef<number>(0);
  const argsRef = useRef<Parameters<T>>();
  const resultRef = useRef<ReturnType<T>>();

  const invokeFunc = useCallback((args: Parameters<T>) => {
    const result = func(...args);
    lastInvokeTimeRef.current = Date.now();
    resultRef.current = result;
    return result;
  }, [func]);

  const leadingEdge = useCallback((args: Parameters<T>) => {
    lastInvokeTimeRef.current = Date.now();
    timeoutRef.current = setTimeout(() => timerExpired(), delay);
    return leading ? invokeFunc(args) : resultRef.current;
  }, [delay, leading, invokeFunc]);

  const remainingWait = useCallback((time: number) => {
    const timeSinceLastCall = time - lastCallTimeRef.current;
    const timeSinceLastInvoke = time - lastInvokeTimeRef.current;
    const timeWaiting = delay - timeSinceLastCall;

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }, [delay, maxWait]);

  const shouldInvoke = useCallback((time: number) => {
    const timeSinceLastCall = time - lastCallTimeRef.current;
    const timeSinceLastInvoke = time - lastInvokeTimeRef.current;

    return (
      lastCallTimeRef.current === 0 ||
      timeSinceLastCall >= delay ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }, [delay, maxWait]);

  const timerExpired = useCallback(() => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeoutRef.current = setTimeout(timerExpired, remainingWait(time));
  }, [shouldInvoke, remainingWait]);

  const trailingEdge = useCallback((time: number) => {
    timeoutRef.current = null;

    if (trailing && argsRef.current) {
      return invokeFunc(argsRef.current);
    }
    argsRef.current = undefined;
    return resultRef.current;
  }, [trailing, invokeFunc]);

  const cancel = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current !== null) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
    lastInvokeTimeRef.current = 0;
    lastCallTimeRef.current = 0;
    argsRef.current = undefined;
    resultRef.current = undefined;
  }, []);

  const flush = useCallback(() => {
    return timeoutRef.current === null ? resultRef.current : trailingEdge(Date.now());
  }, [trailingEdge]);

  const debounced = useCallback((...args: Parameters<T>) => {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastCallTimeRef.current = time;
    argsRef.current = args;

    if (isInvoking) {
      if (timeoutRef.current === null) {
        return leadingEdge(args);
      }
      if (maxWait !== undefined) {
        timeoutRef.current = setTimeout(timerExpired, delay);
        maxTimeoutRef.current = setTimeout(() => {
          if (argsRef.current) {
            invokeFunc(argsRef.current);
          }
        }, maxWait);
        return invokeFunc(args);
      }
    }
    if (timeoutRef.current === null) {
      timeoutRef.current = setTimeout(timerExpired, delay);
    }
    return resultRef.current;
  }, [shouldInvoke, leadingEdge, timerExpired, delay, maxWait, invokeFunc]) as T;

  // Attach cancel and flush methods
  (debounced as any).cancel = cancel;
  (debounced as any).flush = flush;

  return debounced;
};

/**
 * Simple debounce hook for basic use cases
 */
export const useSimpleDebounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  return useDebounce(func, delay, { leading: false, trailing: true });
};

/**
 * Debounce hook with leading edge execution
 */
export const useLeadingDebounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  return useDebounce(func, delay, { leading: true, trailing: false });
};