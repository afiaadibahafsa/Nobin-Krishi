// Request queue hook for managing API calls and preventing concurrent requests
import { useCallback, useRef, useState } from 'react';

export interface QueuedRequest<T = any> {
  id: string;
  request: () => Promise<T>;
  priority: number;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

export interface RequestQueueOptions {
  maxConcurrent?: number;
  maxQueueSize?: number;
  defaultPriority?: number;
  defaultMaxRetries?: number;
  retryDelay?: number;
}

export interface RequestQueueState {
  isProcessing: boolean;
  queueLength: number;
  activeRequests: number;
  completedRequests: number;
  failedRequests: number;
}

/**
 * Hook for managing API request queue to prevent overwhelming the server
 * and ensure proper request ordering
 */
export const useRequestQueue = (options: RequestQueueOptions = {}) => {
  const {
    maxConcurrent = 2,
    maxQueueSize = 10,
    defaultPriority = 1,
    defaultMaxRetries = 2,
    retryDelay = 1000
  } = options;

  const queueRef = useRef<QueuedRequest[]>([]);
  const activeRequestsRef = useRef<Set<string>>(new Set());
  const [state, setState] = useState<RequestQueueState>({
    isProcessing: false,
    queueLength: 0,
    activeRequests: 0,
    completedRequests: 0,
    failedRequests: 0
  });

  const updateState = useCallback(() => {
    setState({
      isProcessing: queueRef.current.length > 0 || activeRequestsRef.current.size > 0,
      queueLength: queueRef.current.length,
      activeRequests: activeRequestsRef.current.size,
      completedRequests: state.completedRequests,
      failedRequests: state.failedRequests
    });
  }, [state.completedRequests, state.failedRequests]);

  const processQueue = useCallback(async () => {
    if (activeRequestsRef.current.size >= maxConcurrent || queueRef.current.length === 0) {
      return;
    }

    // Sort queue by priority (higher priority first) and timestamp (older first)
    queueRef.current.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.timestamp - b.timestamp;
    });

    const request = queueRef.current.shift();
    if (!request) return;

    activeRequestsRef.current.add(request.id);
    updateState();

    try {
      const result = await request.request();
      
      // Request completed successfully
      activeRequestsRef.current.delete(request.id);
      setState(prev => ({
        ...prev,
        completedRequests: prev.completedRequests + 1
      }));
      
      // Process next request in queue
      processQueue();
      
      return result;
    } catch (error) {
      activeRequestsRef.current.delete(request.id);
      
      // Retry logic
      if (request.retries < request.maxRetries) {
        const retryRequest: QueuedRequest = {
          ...request,
          retries: request.retries + 1,
          timestamp: Date.now() + retryDelay
        };
        
        // Add back to queue with delay
        setTimeout(() => {
          queueRef.current.push(retryRequest);
          updateState();
          processQueue();
        }, retryDelay);
      } else {
        // Max retries reached
        setState(prev => ({
          ...prev,
          failedRequests: prev.failedRequests + 1
        }));
      }
      
      // Process next request in queue
      processQueue();
      
      throw error;
    }
  }, [maxConcurrent, retryDelay, updateState]);

  const enqueue = useCallback(<T>(
    requestFn: () => Promise<T>,
    options: {
      priority?: number;
      maxRetries?: number;
      id?: string;
    } = {}
  ): Promise<T> => {
    const {
      priority = defaultPriority,
      maxRetries = defaultMaxRetries,
      id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    } = options;

    return new Promise((resolve, reject) => {
      // Check queue size limit
      if (queueRef.current.length >= maxQueueSize) {
        reject(new Error('Request queue is full'));
        return;
      }

      // Cancel any existing request with the same ID
      queueRef.current = queueRef.current.filter(req => req.id !== id);

      const queuedRequest: QueuedRequest<T> = {
        id,
        request: async () => {
          try {
            const result = await requestFn();
            resolve(result);
            return result;
          } catch (error) {
            reject(error);
            throw error;
          }
        },
        priority,
        timestamp: Date.now(),
        retries: 0,
        maxRetries
      };

      queueRef.current.push(queuedRequest);
      updateState();
      processQueue();
    });
  }, [defaultPriority, defaultMaxRetries, maxQueueSize, updateState, processQueue]);

  const clear = useCallback(() => {
    queueRef.current = [];
    setState(prev => ({
      ...prev,
      queueLength: 0
    }));
  }, []);

  const cancel = useCallback((id: string) => {
    queueRef.current = queueRef.current.filter(req => req.id !== id);
    updateState();
  }, [updateState]);

  const getQueueInfo = useCallback(() => {
    return {
      queue: queueRef.current.map(req => ({
        id: req.id,
        priority: req.priority,
        timestamp: req.timestamp,
        retries: req.retries,
        maxRetries: req.maxRetries
      })),
      activeRequests: Array.from(activeRequestsRef.current),
      state
    };
  }, [state]);

  return {
    enqueue,
    clear,
    cancel,
    getQueueInfo,
    state
  };
};