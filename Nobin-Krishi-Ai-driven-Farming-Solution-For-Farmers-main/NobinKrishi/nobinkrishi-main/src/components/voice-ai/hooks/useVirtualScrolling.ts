// Virtual scrolling hook for efficient rendering of large conversation histories
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

export interface VirtualScrollItem {
  id: string;
  height: number;
  data: any;
}

export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  estimatedItemHeight?: number;
  getItemHeight?: (index: number, item: any) => number;
}

export interface VirtualScrollState {
  startIndex: number;
  endIndex: number;
  visibleItems: VirtualScrollItem[];
  totalHeight: number;
  offsetY: number;
}

/**
 * Hook for implementing virtual scrolling to efficiently render large lists
 * Used for conversation history when there are many messages
 */
export const useVirtualScrolling = <T>(
  items: T[],
  options: VirtualScrollOptions
) => {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    estimatedItemHeight = itemHeight,
    getItemHeight
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const itemHeightsRef = useRef<Map<number, number>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate item heights
  const itemHeights = useMemo(() => {
    return items.map((item, index) => {
      if (getItemHeight) {
        return getItemHeight(index, item);
      }
      return itemHeightsRef.current.get(index) || estimatedItemHeight;
    });
  }, [items, getItemHeight, estimatedItemHeight]);

  // Calculate total height
  const totalHeight = useMemo(() => {
    return itemHeights.reduce((sum, height) => sum + height, 0);
  }, [itemHeights]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    let startIndex = 0;
    let endIndex = 0;
    let accumulatedHeight = 0;

    // Find start index
    for (let i = 0; i < items.length; i++) {
      if (accumulatedHeight + itemHeights[i] > scrollTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
      accumulatedHeight += itemHeights[i];
    }

    // Find end index
    accumulatedHeight = 0;
    for (let i = 0; i < items.length; i++) {
      if (i >= startIndex) {
        if (accumulatedHeight > containerHeight + overscan * estimatedItemHeight) {
          endIndex = Math.min(items.length - 1, i + overscan);
          break;
        }
      }
      if (i >= startIndex) {
        accumulatedHeight += itemHeights[i];
      }
    }

    if (endIndex === 0) {
      endIndex = Math.min(items.length - 1, startIndex + Math.ceil(containerHeight / estimatedItemHeight) + overscan);
    }

    return { startIndex, endIndex };
  }, [items.length, itemHeights, scrollTop, containerHeight, overscan, estimatedItemHeight]);

  // Calculate offset for visible items
  const offsetY = useMemo(() => {
    let offset = 0;
    for (let i = 0; i < visibleRange.startIndex; i++) {
      offset += itemHeights[i];
    }
    return offset;
  }, [visibleRange.startIndex, itemHeights]);

  // Get visible items
  const visibleItems = useMemo(() => {
    const result: VirtualScrollItem[] = [];
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex && i < items.length; i++) {
      result.push({
        id: `item-${i}`,
        height: itemHeights[i],
        data: items[i]
      });
    }
    return result;
  }, [items, visibleRange, itemHeights]);

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set scrolling to false after scroll ends
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  // Update item height (for dynamic heights)
  const updateItemHeight = useCallback((index: number, height: number) => {
    itemHeightsRef.current.set(index, height);
  }, []);

  // Scroll to specific item
  const scrollToItem = useCallback((index: number, align: 'start' | 'center' | 'end' = 'start') => {
    if (!containerRef.current) return;

    let targetScrollTop = 0;
    for (let i = 0; i < index; i++) {
      targetScrollTop += itemHeights[i];
    }

    if (align === 'center') {
      targetScrollTop -= (containerHeight - itemHeights[index]) / 2;
    } else if (align === 'end') {
      targetScrollTop -= containerHeight - itemHeights[index];
    }

    targetScrollTop = Math.max(0, Math.min(targetScrollTop, totalHeight - containerHeight));

    containerRef.current.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
  }, [itemHeights, containerHeight, totalHeight]);

  // Scroll to bottom (useful for chat interfaces)
  const scrollToBottom = useCallback(() => {
    if (!containerRef.current) return;

    containerRef.current.scrollTo({
      top: totalHeight,
      behavior: 'smooth'
    });
  }, [totalHeight]);

  // Check if scrolled to bottom
  const isScrolledToBottom = useMemo(() => {
    return scrollTop + containerHeight >= totalHeight - 10; // 10px threshold
  }, [scrollTop, containerHeight, totalHeight]);

  // Auto-scroll to bottom when new items are added (if already at bottom)
  const [wasAtBottom, setWasAtBottom] = useState(true);
  
  useEffect(() => {
    if (wasAtBottom && items.length > 0) {
      scrollToBottom();
    }
    setWasAtBottom(isScrolledToBottom);
  }, [items.length, wasAtBottom, isScrolledToBottom, scrollToBottom]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const state: VirtualScrollState = {
    startIndex: visibleRange.startIndex,
    endIndex: visibleRange.endIndex,
    visibleItems,
    totalHeight,
    offsetY
  };

  return {
    state,
    containerRef,
    isScrolling,
    isScrolledToBottom,
    handleScroll,
    updateItemHeight,
    scrollToItem,
    scrollToBottom,
    // Style props for the container
    containerStyle: {
      height: containerHeight,
      overflow: 'auto'
    },
    // Style props for the inner content
    contentStyle: {
      height: totalHeight,
      position: 'relative' as const
    },
    // Style props for visible items wrapper
    itemsStyle: {
      transform: `translateY(${offsetY}px)`
    }
  };
};

/**
 * Simplified virtual scrolling hook for fixed-height items
 */
export const useSimpleVirtualScrolling = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  return useVirtualScrolling(items, {
    itemHeight,
    containerHeight,
    overscan,
    estimatedItemHeight: itemHeight
  });
};