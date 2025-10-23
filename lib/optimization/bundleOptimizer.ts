/**
 * Bundle Optimization Utilities
 * Advanced optimization strategies for smaller bundle sizes
 */

// Performance budgets and targets
export const PERFORMANCE_BUDGETS = {
  // Bundle sizes in KB
  BUNDLE_TOTAL: 350, // Target: <350KB
  BUNDLE_VENDOR: 300, // Target: <300KB
  BUNDLE_LARGEST_ROUTE: 5, // Target: <5KB

  // Performance metrics
  FIRST_CONTENTFUL_PAINT: 1500, // 1.5s
  LARGEST_CONTENTFUL_PAINT: 2500, // 2.5s
  TIME_TO_INTERACTIVE: 3000, // 3s

  // Memory usage
  JS_HEAP_SIZE: 50 * 1024 * 1024, // 50MB
} as const;

// Optimization strategies
export class BundleOptimizer {
  private static instance: BundleOptimizer;
  private metrics: {
    bundleSize: Record<string, number>;
    loadingTime: Record<string, number>;
    compressionRatio: number;
  };

  private constructor() {
    this.metrics = {
      bundleSize: {},
      loadingTime: {},
      compressionRatio: 0,
    };
  }

  public static getInstance(): BundleOptimizer {
    if (!BundleOptimizer.instance) {
      BundleOptimizer.instance = new BundleOptimizer();
    }
    return BundleOptimizer.instance;
  }

  // Analyze and optimize bundle sizes
  public analyzeBundle(webpackStats: any): {
    total: number;
    vendor: number;
    lucide: number;
    recharts: number;
    admin: number;
    compressionRatio: number;
    recommendations: string[];
  } {
    const assets = webpackStats.assets || [];
    const analysis = {
      total: 0,
      vendor: 0,
      lucide: 0,
      recharts: 0,
      admin: 0,
      compressionRatio: 0,
      recommendations: [] as string[],
    };

    // Analyze each chunk
    assets.forEach((asset: any) => {
      const size = asset.size || 0;
      analysis.total += size;

      if (asset.name.includes("vendor")) {
        analysis.vendor = size;
      } else if (asset.name.includes("lucide")) {
        analysis.lucide = size;
      } else if (asset.name.includes("recharts")) {
        analysis.recharts = size;
      } else if (asset.name.includes("admin")) {
        analysis.admin = size;
      }

      this.metrics.bundleSize[asset.name] = size;
    });

    // Calculate compression ratio
    if (webpackStats.compressedSize) {
      analysis.compressionRatio = webpackStats.compressedSize / analysis.total;
    }

    // Generate optimization recommendations
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  private generateRecommendations(analysis: any): string[] {
    const recommendations: string[] = [];

    // Bundle size recommendations
    if (analysis.total > PERFORMANCE_BUDGETS.BUNDLE_TOTAL * 1024) {
      recommendations.push(
        `Total bundle size ${Math.round(analysis.total / 1024)}KB exceeds target of ${PERFORMANCE_BUDGETS.BUNDLE_TOTAL}KB. Consider further code splitting.`
      );
    }

    if (analysis.vendor > PERFORMANCE_BUDGETS.BUNDLE_VENDOR * 1024) {
      recommendations.push(
        `Vendor bundle ${Math.round(analysis.vendor / 1024)}KB exceeds target. Optimize third-party imports.`
      );
    }

    if (analysis.lucide > 50 * 1024) {
      recommendations.push(
        `Lucide-react icons ${Math.round(analysis.lucide / 1024)}KB. Implement more aggressive tree-shaking.`
      );
    }

    if (analysis.recharts > 80 * 1024) {
      recommendations.push(
        `Recharts bundle ${Math.round(analysis.recharts / 1024)}KB. Consider chart lazy loading.`
      );
    }

    if (analysis.admin > 40 * 1024) {
      recommendations.push(
        `Admin components ${Math.round(analysis.admin / 1024)}KB. Further admin route splitting needed.`
      );
    }

    // Compression recommendations
    if (analysis.compressionRatio > 0.3) {
      recommendations.push(
        "Enable gzip/brotli compression for better bundle compression."
      );
    }

    return recommendations;
  }

  // Implement performance monitoring
  public trackPerformance(): void {
    if (typeof window === "undefined") return;

    // Track Core Web Vitals
    if ("PerformanceObserver" in window) {
      try {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            this.metrics.loadingTime.LCP = lastEntry.startTime;
            this.checkPerformanceThreshold("LCP", lastEntry.startTime);
          }
        });
        lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

        // First Contentful Paint
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(
            (entry) => entry.name === "first-contentful-paint"
          );
          if (fcpEntry) {
            this.metrics.loadingTime.FCP = fcpEntry.startTime;
            this.checkPerformanceThreshold("FCP", fcpEntry.startTime);
          }
        });
        fcpObserver.observe({ entryTypes: ["paint"] });

        // Long tasks
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) {
              console.warn("Long task detected:", {
                duration: entry.duration,
                startTime: entry.startTime,
              });
            }
          });
        });

        if ("PerformanceLongTaskTiming" in window) {
          longTaskObserver.observe({ entryTypes: ["longtask"] });
        }
      } catch (error) {
        console.warn("Performance monitoring not available:", error);
      }
    }
  }

  private checkPerformanceThreshold(metric: string, value: number): void {
    const thresholds: Record<string, number> = {
      FCP: PERFORMANCE_BUDGETS.FIRST_CONTENTFUL_PAINT,
      LCP: PERFORMANCE_BUDGETS.LARGEST_CONTENTFUL_PAINT,
    };

    const threshold = thresholds[metric];
    if (threshold && value > threshold) {
      console.warn(
        `Performance warning: ${metric} ${Math.round(value)}ms exceeds threshold of ${threshold}ms`
      );
    }
  }

  // Get performance report
  public getPerformanceReport(): {
    score: number;
    metrics: typeof BundleOptimizer.prototype.metrics;
    status: "excellent" | "good" | "needs-improvement" | "poor";
    recommendations: string[];
  } {
    const { bundleSize, loadingTime } = this.metrics;

    let score = 100;

    // Bundle size scoring
    const totalBundleSize = Object.values(bundleSize).reduce(
      (a: number, b: number) => a + b,
      0
    );
    if (totalBundleSize > PERFORMANCE_BUDGETS.BUNDLE_TOTAL * 1024) {
      score -= 30;
    } else if (totalBundleSize > 300 * 1024) {
      score -= 15;
    }

    // Loading time scoring
    if (
      loadingTime.LCP &&
      loadingTime.LCP > PERFORMANCE_BUDGETS.LARGEST_CONTENTFUL_PAINT
    ) {
      score -= 25;
    } else if (loadingTime.LCP && loadingTime.LCP > 2000) {
      score -= 10;
    }

    if (
      loadingTime.FCP &&
      loadingTime.FCP > PERFORMANCE_BUDGETS.FIRST_CONTENTFUL_PAINT
    ) {
      score -= 25;
    } else if (loadingTime.FCP && loadingTime.FCP > 1200) {
      score -= 10;
    }

    // Determine status
    let status: "excellent" | "good" | "needs-improvement" | "poor" =
      "excellent";
    if (score < 60) status = "poor";
    else if (score < 75) status = "needs-improvement";
    else if (score < 90) status = "good";

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      total: totalBundleSize,
      vendor: bundleSize.vendor || 0,
      lucide: bundleSize.lucide || 0,
      recharts: bundleSize.recharts || 0,
      admin: bundleSize.admin || 0,
      compressionRatio: 0,
    });

    return {
      score: Math.max(0, score),
      metrics: { ...this.metrics },
      status,
      recommendations,
    };
  }

  // Optimization strategies
  public static getOptimizationStrategies(): Array<{
    name: string;
    description: string;
    impact: "high" | "medium" | "low";
    implementation: string;
  }> {
    return [
      {
        name: "Tree Shaking",
        description: "Remove unused code from bundles",
        impact: "high",
        implementation:
          "Use ES6 modules and direct imports for libraries like lucide-react",
      },
      {
        name: "Code Splitting",
        description: "Split code into smaller chunks loaded on demand",
        impact: "high",
        implementation:
          "Use Next.js dynamic imports for admin and heavy components",
      },
      {
        name: "Image Optimization",
        description: "Compress and lazy load images",
        impact: "medium",
        implementation: "Use Next.js Image component with WebP/AVIF formats",
      },
      {
        name: "Bundle Compression",
        description: "Enable gzip/brotli compression",
        impact: "medium",
        implementation: "Configure server to compress assets",
      },
      {
        name: "Cache Optimization",
        description: "Implement proper caching headers",
        impact: "medium",
        implementation: "Set Cache-Control headers for static assets",
      },
      {
        name: "Font Optimization",
        description: "Optimize font loading with display:swap",
        impact: "low",
        implementation: "Use font-display: swap in @font-face",
      },
      {
        name: "CSS Optimization",
        description: "Remove unused CSS and minify styles",
        impact: "low",
        implementation: "Use PurgeCSS and CSS minification",
      },
      {
        name: "Component Memoization",
        description: "Prevent unnecessary re-renders",
        impact: "medium",
        implementation: "Use React.memo, useMemo, and useCallback",
      },
    ];
  }

  // Automatic optimizations
  public enableAutoOptimizations(): void {
    // Enable resource hints
    this.addResourceHints();

    // Optimize font loading
    this.optimizeFontLoading();

    // Preload critical resources
    this.preloadCriticalResources();
  }

  private addResourceHints(): void {
    if (typeof document === "undefined") return;

    // DNS prefetch for external domains
    const domains = [
      "fonts.googleapis.com",
      "fonts.gstatic.com",
      // Add other external domains
    ];

    domains.forEach((domain) => {
      const link = document.createElement("link");
      link.rel = "dns-prefetch";
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });
  }

  private optimizeFontLoading(): void {
    if (typeof document === "undefined") return;

    const fontLink = document.createElement("link");
    fontLink.rel = "preload";
    fontLink.href = "/fonts/inter.woff2";
    fontLink.as = "font";
    fontLink.type = "font/woff2";
    fontLink.crossOrigin = "anonymous";
    document.head.appendChild(fontLink);
  }

  private preloadCriticalResources(): void {
    if (typeof document === "undefined") return;

    // Preload critical JavaScript
    const criticalResources = ["/vendors.js", "/common.js"];

    criticalResources.forEach((resource) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = resource;
      link.as = "script";
      document.head.appendChild(link);
    });
  }
}

// Singleton instance
export const bundleOptimizer = BundleOptimizer.getInstance();
