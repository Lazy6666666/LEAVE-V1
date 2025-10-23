/**
 * Performance Optimization Utilities
 * Provides hooks and utilities for optimizing animations and interactions
 * Application performance monitoring and Web Vitals tracking
 */

import { useEffect, useState, useCallback, useRef } from "react";

// Web Vitals types
export interface WebVitalsMetrics {
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  FCP?: number; // First Contentful Paint
  TTFB?: number; // Time to First Byte
  INP?: number; // Interaction to Next Paint
}

// Performance metrics interface
export interface PerformanceMetrics {
  webVitals: WebVitalsMetrics;
  resourceTiming: PerformanceResourceTiming[];
  navigationTiming: PerformanceNavigationTiming;
  memoryUsage?: any;
  networkInfo?: any;
  renderTime: number;
  frameRate: number;
}

// Application monitoring class
export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private observers: PerformanceObserver[] = [];
  private frameCount = 0;
  private lastFrameTime = 0;
  private callbacks: ((metrics: PerformanceMetrics) => void)[] = [];
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = typeof window !== "undefined";
    this.metrics = this.initializeMetrics();
    this.startMonitoring();
  }

  private initializeMetrics(): PerformanceMetrics {
    if (!this.isBrowser) {
      return {
        webVitals: {},
        resourceTiming: [],
        navigationTiming: {} as PerformanceNavigationTiming,
        renderTime: 0,
        frameRate: 0,
      };
    }

    return {
      webVitals: {},
      resourceTiming: [],
      navigationTiming: performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming,
      memoryUsage: (performance as any).memory,
      networkInfo: (navigator as any).connection,
      renderTime: 0,
      frameRate: 0,
    };
  }

  private startMonitoring(): void {
    if (!this.isBrowser) {
      return;
    }
    this.observeWebVitals();
    this.observeFrameRate();
    this.observeResourceTiming();
    this.observeLongTasks();
  }

  private observeWebVitals(): void {
    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.webVitals.LCP = lastEntry.startTime;
      this.notifyCallbacks();
    });
    lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    this.observers.push(lcpObserver);

    // First Input Delay (FID) - deprecated, using INP instead
    this.observeInteractionToNextPaint();

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.metrics.webVitals.CLS = clsValue;
      this.notifyCallbacks();
    });
    clsObserver.observe({ entryTypes: ["layout-shift"] });
    this.observers.push(clsObserver);

    // First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(
        (entry) => entry.name === "first-contentful-paint"
      );
      if (fcpEntry) {
        this.metrics.webVitals.FCP = fcpEntry.startTime;
        this.notifyCallbacks();
      }
    });
    fcpObserver.observe({ entryTypes: ["paint"] });
    this.observers.push(fcpObserver);
  }

  private observeInteractionToNextPaint(): void {
    // INP is not fully supported yet, fallback to FID for now
    if (this.isBrowser && "PerformanceEventTiming" in window) {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if ((entry as any).processingStart && (entry as any).startTime) {
            this.metrics.webVitals.FID =
              (entry as any).processingStart - (entry as any).startTime;
            this.notifyCallbacks();
            break;
          }
        }
      });
      fidObserver.observe({ entryTypes: ["first-input"] });
      this.observers.push(fidObserver);
    }
  }

  private observeFrameRate(): void {
    if (!this.isBrowser) {
      return;
    }

    this.lastFrameTime = performance.now();
    const measureFrameRate = () => {
      this.frameCount++;
      const currentTime = performance.now();

      if (currentTime - this.lastFrameTime >= 1000) {
        this.metrics.frameRate = Math.round(
          (this.frameCount * 1000) / (currentTime - this.lastFrameTime)
        );
        this.frameCount = 0;
        this.lastFrameTime = currentTime;
        this.notifyCallbacks();
      }

      requestAnimationFrame(measureFrameRate);
    };

    requestAnimationFrame(measureFrameRate);
  }

  private observeResourceTiming(): void {
    const resourceObserver = new PerformanceObserver((list) => {
      this.metrics.resourceTiming =
        list.getEntries() as PerformanceResourceTiming[];
      this.notifyCallbacks();
    });
    resourceObserver.observe({ entryTypes: ["resource"] });
    this.observers.push(resourceObserver);
  }

  private observeLongTasks(): void {
    if ("PerformanceLongTaskTiming" in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        // Log long tasks for debugging
        list.getEntries().forEach((entry) => {
          console.warn("Long task detected:", {
            duration: entry.duration,
            startTime: entry.startTime,
          });
        });
      });
      longTaskObserver.observe({ entryTypes: ["longtask"] });
      this.observers.push(longTaskObserver);
    }
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach((callback) => callback(this.metrics));
  }

  public subscribe(
    callback: (metrics: PerformanceMetrics) => void
  ): () => void {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public calculatePerformanceScore(): number {
    const { webVitals } = this.metrics;
    let score = 100;

    // LCP scoring (good: <2.5s, needs improvement: 2.5-4s, poor: >4s)
    if (webVitals.LCP) {
      if (webVitals.LCP > 4000) score -= 30;
      else if (webVitals.LCP > 2500) score -= 15;
    }

    // FID scoring (good: <100ms, needs improvement: 100-300ms, poor: >300ms)
    if (webVitals.FID) {
      if (webVitals.FID > 300) score -= 30;
      else if (webVitals.FID > 100) score -= 15;
    }

    // CLS scoring (good: <0.1, needs improvement: 0.1-0.25, poor: >0.25)
    if (webVitals.CLS) {
      if (webVitals.CLS > 0.25) score -= 30;
      else if (webVitals.CLS > 0.1) score -= 15;
    }

    // Frame rate scoring
    if (this.metrics.frameRate < 30) score -= 25;
    else if (this.metrics.frameRate < 45) score -= 10;

    return Math.max(0, score);
  }

  public getPerformanceReport(): {
    score: number;
    metrics: PerformanceMetrics;
    recommendations: string[];
  } {
    const score = this.calculatePerformanceScore();
    const recommendations: string[] = [];

    // Generate recommendations based on metrics
    if (this.metrics.webVitals.LCP && this.metrics.webVitals.LCP > 2500) {
      recommendations.push(
        "Optimize largest contentful paint by preloading critical resources and optimizing images"
      );
    }

    if (this.metrics.webVitals.FID && this.metrics.webVitals.FID > 100) {
      recommendations.push(
        "Reduce first input delay by minimizing JavaScript execution time"
      );
    }

    if (this.metrics.webVitals.CLS && this.metrics.webVitals.CLS > 0.1) {
      recommendations.push(
        "Reduce cumulative layout shift by specifying dimensions for media and ads"
      );
    }

    if (this.metrics.frameRate < 45) {
      recommendations.push(
        "Optimize rendering performance to improve frame rate"
      );
    }

    if (
      this.metrics.memoryUsage &&
      this.metrics.memoryUsage.usedJSHeapSize > 50 * 1024 * 1024
    ) {
      recommendations.push(
        "Monitor memory usage - consider implementing memory optimization strategies"
      );
    }

    return {
      score,
      metrics: this.metrics,
      recommendations,
    };
  }

  public destroy(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
    this.callbacks = [];
  }
}

// Check if user prefers reduced motion
export const usePrefersReducedMotion = () => {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReduced(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReduced;
};

// Intersection Observer for lazy loading
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [entries, setEntries] = useState<IntersectionObserverEntry[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const observe = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.observe(element);
    }
  }, []);

  const unobserve = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element);
    }
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        setEntries(entries);
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
        ...options,
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [options]);

  return { entries, observe, unobserve };
};

// Debounce hook for performance
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

// Throttle hook for performance
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
};

// Lazy load images
export const useLazyImage = (
  src: string,
  options?: IntersectionObserverInit
) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const img = new Image();
        img.src = src;

        img.onload = () => {
          setImageSrc(src);
          setIsLoading(false);
        };

        img.onerror = () => {
          setError("Failed to load image");
          setIsLoading(false);
        };

        if (imgRef.current) {
          observer.unobserve(imgRef.current);
        }
      }
    }, options);

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, options]);

  return { ref: imgRef, src: imageSrc, isLoading, error };
};

// Optimized animation props based on device capabilities
export const useOptimizedAnimation = () => {
  const prefersReduced = usePrefersReducedMotion();
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);

  useEffect(() => {
    // Check for low-end device indicators
    const checkDevicePerformance = () => {
      const connection = (navigator as any).connection;
      const isSlowConnection =
        connection &&
        (connection.effectiveType === "slow-2g" ||
          connection.effectiveType === "2g");
      const isLowMemory =
        "deviceMemory" in navigator && (navigator as any).deviceMemory < 4;
      const isLowCores =
        "hardwareConcurrency" in navigator && navigator.hardwareConcurrency < 4;

      setIsLowEndDevice(isSlowConnection || isLowMemory || isLowCores);
    };

    checkDevicePerformance();
  }, []);

  const getAnimationProps = useCallback(
    (defaultProps: any) => {
      if (prefersReduced || isLowEndDevice) {
        return {
          ...defaultProps,
          transition: { duration: 0.01 },
          whileHover: undefined,
          whileTap: undefined,
          initial: false,
        };
      }

      return defaultProps;
    },
    [prefersReduced, isLowEndDevice]
  );

  return { getAnimationProps, isLowEndDevice, prefersReduced };
};

// Bundle size optimization utilities
export const preloadComponent = (importFunc: () => Promise<any>) => {
  // Preload component in background
  setTimeout(importFunc, 0);
};

// Critical resource preloading
export const preloadCriticalResources = () => {
  // Preload fonts
  const fontLink = document.createElement("link");
  fontLink.rel = "preload";
  fontLink.href = "/fonts/inter.woff2";
  fontLink.as = "font";
  fontLink.type = "font/woff2";
  fontLink.crossOrigin = "anonymous";
  document.head.appendChild(fontLink);

  // Preload critical images
  const images = ["/images/logo.svg", "/images/hero-bg.jpg"];
  images.forEach((src) => {
    const imgLink = document.createElement("link");
    imgLink.rel = "preload";
    imgLink.href = src;
    imgLink.as = "image";
    document.head.appendChild(imgLink);
  });
};

// Smooth scroll behavior with performance optimization
export const useSmoothScroll = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollTo = useCallback(
    (element: HTMLElement, options?: ScrollIntoViewOptions) => {
      if ("scrollBehavior" in document.documentElement.style) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
          ...options,
        });
      } else {
        // Fallback for older browsers
        const start = element.offsetTop;
        const startTime = performance.now();

        const animateScroll = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / 500, 1); // 500ms duration

          window.scrollTo(0, start * progress);

          if (progress < 1) {
            requestAnimationFrame(animateScroll);
          }
        };

        requestAnimationFrame(animateScroll);
      }
    },
    []
  );

  return { scrollContainerRef, scrollTo };
};

// Optimized resize observer
export const useResizeObserver = (
  callback: (entries: ResizeObserverEntry[]) => void,
  options: ResizeObserverOptions = {}
) => {
  const observerRef = useRef<ResizeObserver | null>(null);
  const elementRef = useRef<Element | null>(null);

  const observe = useCallback(
    (element: Element) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      elementRef.current = element;
      observerRef.current = new ResizeObserver(callback);
      observerRef.current.observe(element, options);
    },
    [callback, options]
  );

  const unobserve = useCallback(() => {
    if (observerRef.current && elementRef.current) {
      observerRef.current.unobserve(elementRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { observe, unobserve };
};

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [monitor] = useState(() => new PerformanceMonitor());
  const [metrics, setMetrics] = useState<PerformanceMetrics>(
    monitor.getMetrics()
  );
  const [report, setReport] = useState(monitor.getPerformanceReport());

  useEffect(() => {
    const unsubscribe = monitor.subscribe((newMetrics) => {
      setMetrics(newMetrics);
      setReport(monitor.getPerformanceReport());
    });

    return () => {
      unsubscribe();
      monitor.destroy();
    };
  }, [monitor]);

  return {
    metrics,
    report,
    monitor,
  };
};

// Web Vitals tracking utility
export const trackWebVitals = (onMetric?: (metric: any) => void) => {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return;
  }

  // TTFB - Time to First Byte
  if (window.performance && window.performance.timing) {
    const ttfb =
      window.performance.timing.responseStart -
      window.performance.timing.requestStart;
    if (onMetric) {
      onMetric({
        name: "TTFB",
        value: ttfb,
        id: Math.random().toString(36).substr(2, 9),
      });
    }
  }

  // LCP - Largest Contentful Paint
  let lcpObserver: PerformanceObserver | undefined;
  if ("PerformanceObserver" in window) {
    lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (onMetric) {
        onMetric({
          name: "LCP",
          value: lastEntry.startTime,
          id: Math.random().toString(36).substr(2, 9),
        });
      }
    });
    lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
  }

  // FID - First Input Delay
  let fidObserver: PerformanceObserver | undefined;
  if ("PerformanceObserver" in window) {
    fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      for (const entry of entries) {
        if ((entry as any).processingStart && (entry as any).startTime) {
          if (onMetric) {
            onMetric({
              name: "FID",
              value: (entry as any).processingStart - (entry as any).startTime,
              id: Math.random().toString(36).substr(2, 9),
            });
          }
          break;
        }
      }
    });
    fidObserver.observe({ entryTypes: ["first-input"] });
  }

  // CLS - Cumulative Layout Shift
  let clsObserver: PerformanceObserver | undefined;
  if ("PerformanceObserver" in window) {
    let clsValue = 0;
    clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      if (onMetric) {
        onMetric({
          name: "CLS",
          value: clsValue,
          id: Math.random().toString(36).substr(2, 9),
        });
      }
    });
    clsObserver.observe({ entryTypes: ["layout-shift"] });
  }

  // FCP - First Contentful Paint
  let fcpObserver: PerformanceObserver | undefined;
  if ("PerformanceObserver" in window) {
    fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(
        (entry) => entry.name === "first-contentful-paint"
      );
      if (fcpEntry && onMetric) {
        onMetric({
          name: "FCP",
          value: fcpEntry.startTime,
          id: Math.random().toString(36).substr(2, 9),
        });
      }
    });
    fcpObserver.observe({ entryTypes: ["paint"] });
  }

  return () => {
    // Disconnect observers if they exist
    if (lcpObserver) lcpObserver.disconnect();
    if (fidObserver) fidObserver.disconnect();
    if (clsObserver) clsObserver.disconnect();
    if (fcpObserver) fcpObserver.disconnect();
  };
};

// Utility to send metrics to analytics
export const sendToAnalytics = (metric: any) => {
  // In production, send to your analytics service
  if (process.env.NODE_ENV === "production" && typeof window !== "undefined") {
    // Example: Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag("event", metric.name, {
        value: Math.round(metric.value),
        event_category: "Web Vitals",
        event_label: metric.id,
        non_interaction: true,
      });
    }

    // Example: Custom analytics endpoint
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metric),
      }).catch(() => {
        // Silently fail to not impact user experience
      });
    }
  }

  // Development logging
  if (process.env.NODE_ENV === "development") {
    console.log(`[Web Vitals] ${metric.name}:`, Math.round(metric.value));
  }
};

// Performance budget checker
export const checkPerformanceBudget = (
  metrics: PerformanceMetrics
): {
  passed: boolean;
  violations: Array<{
    metric: string;
    value: number;
    budget: number;
    severity: "high" | "medium" | "low";
  }>;
} => {
  const violations: Array<{
    metric: string;
    value: number;
    budget: number;
    severity: "high" | "medium" | "low";
  }> = [];

  // Performance budgets (adjust based on your requirements)
  const budgets = {
    LCP: 2500, // 2.5 seconds
    FID: 100, // 100 milliseconds
    CLS: 0.1, // 0.1
    FCP: 1800, // 1.8 seconds
    TTFB: 800, // 800 milliseconds
  };

  Object.entries(budgets).forEach(([metric, budget]) => {
    const value = metrics.webVitals[metric as keyof WebVitalsMetrics];
    if (value) {
      let severity: "high" | "medium" | "low" = "low";
      const ratio = value / budget;

      if (ratio > 2) severity = "high";
      else if (ratio > 1.5) severity = "medium";

      if (value > budget) {
        violations.push({
          metric,
          value,
          budget,
          severity,
        });
      }
    }
  });

  return {
    passed: violations.length === 0,
    violations,
  };
};
