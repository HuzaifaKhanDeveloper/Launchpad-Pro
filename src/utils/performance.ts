import React from 'react';

// Performance optimization utilities

// Debounce function for expensive operations
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for scroll/resize events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Memoization for expensive calculations
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Preload images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Batch DOM updates
export const batchUpdates = (callback: () => void) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
};

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Optimize animations based on device capabilities
export const getOptimizedAnimationDuration = (baseDuration: number): number => {
  if (prefersReducedMotion()) return 0;
  
  // Reduce animations on low-end devices
  const isLowEndDevice = navigator.hardwareConcurrency <= 2;
  return isLowEndDevice ? baseDuration * 0.5 : baseDuration;
};

// Lazy load components
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => {
  return React.lazy(importFunc);
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Web Vitals tracking
export const trackWebVitals = () => {
  // Track Core Web Vitals
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  }).catch(() => {
    // Silently fail if web-vitals is not available
  });
};

// Image optimization utilities
export const getOptimizedImageUrl = (url: string, width?: number, height?: number): string => {
  if (url.includes('pexels.com')) {
    const baseUrl = url.split('?')[0];
    const params = new URLSearchParams();
    
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('auto', 'compress');
    params.set('cs', 'tinysrgb');
    params.set('fit', 'crop');
    
    return `${baseUrl}?${params.toString()}`;
  }
  
  return url;
};

// Intersection Observer utility
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) => {
  return new IntersectionObserver(callback, {
    threshold: 0.1,
    rootMargin: '50px',
    ...options
  });
};

// Virtual scrolling utility
export const calculateVisibleItems = (
  scrollTop: number,
  itemHeight: number,
  containerHeight: number,
  totalItems: number,
  overscan: number = 5
) => {
  const start = Math.floor(scrollTop / itemHeight);
  const end = Math.min(
    start + Math.ceil(containerHeight / itemHeight),
    totalItems - 1
  );

  return {
    start: Math.max(0, start - overscan),
    end: Math.min(totalItems - 1, end + overscan)
  };
};

// Memory management
export const cleanupResources = (resources: Array<() => void>) => {
  resources.forEach(cleanup => {
    try {
      cleanup();
    } catch (error) {
      console.warn('Error during cleanup:', error);
    }
  });
};

// Request idle callback polyfill
export const requestIdleCallback = (
  callback: (deadline: { timeRemaining: () => number }) => void,
  options?: { timeout?: number }
) => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  
  // Fallback for browsers that don't support requestIdleCallback
  return setTimeout(() => {
    callback({
      timeRemaining: () => 50 // Assume 50ms available
    });
  }, 1);
};

// Cancel idle callback polyfill
export const cancelIdleCallback = (id: number) => {
  if ('cancelIdleCallback' in window) {
    return window.cancelIdleCallback(id);
  }
  
  return clearTimeout(id);
};