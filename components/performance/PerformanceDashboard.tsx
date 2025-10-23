/**
 * Performance Dashboard Component
 * Real-time performance monitoring and optimization recommendations
 */

"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { bundleOptimizer } from "@/lib/optimization/bundleOptimizer";
import { usePerformanceMonitor } from "@/lib/performance";
import {
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
} from "@/lib/utils/icons";

export function PerformanceDashboard() {
  const { report, metrics } = usePerformanceMonitor();
  const [optimizationReport, setOptimizationReport] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Enable automatic optimizations
    bundleOptimizer.enableAutoOptimizations();
  }, []);

  const runPerformanceAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate bundle analysis (in real app, this would use webpack stats)
      const mockWebpackStats = {
        assets: [
          { name: "vendor.js", size: 390 * 1024 },
          { name: "lucide.js", size: 45 * 1024 },
          { name: "recharts.js", size: 80 * 1024 },
          { name: "admin.js", size: 35 * 1024 },
        ],
        compressedSize: 280 * 1024,
      };

      const analysis = bundleOptimizer.analyzeBundle(mockWebpackStats);
      setOptimizationReport(analysis);
    } catch (error) {
      console.error("Performance analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 75) return "text-yellow-600 bg-yellow-100";
    if (score >= 60) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getStatusIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-4 w-4" />;
    if (score >= 75) return <Info className="h-4 w-4" />;
    if (score >= 60) return <AlertTriangle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const formatSize = (bytes: number) => {
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };

  const currentScore = report?.score || 0;
  const lcp = metrics.webVitals.LCP || 0;
  const fcp = metrics.webVitals.FCP || 0;
  const frameRate = metrics.frameRate || 0;

  return (
    <div className="space-y-6">
      {/* Performance Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Performance Score</h3>
          <Button
            onClick={runPerformanceAnalysis}
            disabled={isAnalyzing}
            variant="outline"
            size="sm"
          >
            {isAnalyzing ? (
              <>
                <Activity className="h-4 w-4 mr-2 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="text-6xl font-bold">
              {currentScore.toFixed(0)}
            </div>
            <div className="text-2xl text-muted-foreground absolute top-0 ml-12">
              /100
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center mb-4">
          <Badge className={`px-3 py-1 ${getStatusColor(currentScore)}`}>
            {getStatusIcon(currentScore)}
            <span className="ml-2 capitalize">
              {currentScore >= 90 ? "Excellent" :
               currentScore >= 75 ? "Good" :
               currentScore >= 60 ? "Needs Improvement" : "Poor"}
            </span>
          </Badge>
        </div>

        <Progress value={currentScore} className="h-3" />
      </Card>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              First Contentful Paint
            </span>
            <Activity className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold mb-1">
            {formatTime(fcp)}
          </div>
          <div className="text-xs text-muted-foreground">
            {fcp <= 1500 ? "Good" : fcp <= 2500 ? "Needs Improvement" : "Poor"}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Largest Contentful Paint
            </span>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold mb-1">
            {formatTime(lcp)}
          </div>
          <div className="text-xs text-muted-foreground">
            {lcp <= 2500 ? "Good" : lcp <= 4000 ? "Needs Improvement" : "Poor"}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Frame Rate
            </span>
            <Activity className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold mb-1">
            {frameRate} fps
          </div>
          <div className="text-xs text-muted-foreground">
            {frameRate >= 55 ? "Excellent" : frameRate >= 30 ? "Good" : "Poor"}
          </div>
        </Card>
      </div>

      {/* Bundle Analysis */}
      {optimizationReport && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Bundle Analysis</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatSize(optimizationReport.total)}
              </div>
              <div className="text-sm text-muted-foreground">Total Bundle</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatSize(optimizationReport.vendor)}
              </div>
              <div className="text-sm text-muted-foreground">Vendor</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatSize(optimizationReport.lucide)}
              </div>
              <div className="text-sm text-muted-foreground">Lucide Icons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatSize(optimizationReport.recharts)}
              </div>
              <div className="text-sm text-muted-foreground">Charts</div>
            </div>
          </div>

          {optimizationReport.recommendations.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Optimization Recommendations:</div>
                <ul className="list-disc list-inside space-y-1">
                  {optimizationReport.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm">{rec}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </Card>
      )}

      {/* General Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Performance Recommendations
        </h3>

        <div className="space-y-3">
          {report?.recommendations.slice(0, 4).map((recommendation: string, index: number) => (
            <div key={index} className="flex items-start space-x-3">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">{recommendation}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Memory Usage */}
      {metrics.memoryUsage && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Memory Usage</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Used</div>
              <div className="text-xl font-bold">
                {((metrics.memoryUsage.usedJSHeapSize || 0) / 1024 / 1024).toFixed(1)} MB
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total</div>
              <div className="text-xl font-bold">
                {((metrics.memoryUsage.totalJSHeapSize || 0) / 1024 / 1024).toFixed(1)} MB
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Limit</div>
              <div className="text-xl font-bold">
                {((metrics.memoryUsage.jsHeapSizeLimit || 0) / 1024 / 1024).toFixed(0)} MB
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Heap Usage</span>
              <span className="text-sm text-muted-foreground">
                {Math.round((metrics.memoryUsage.usedJSHeapSize / metrics.memoryUsage.jsHeapSizeLimit) * 100)}%
              </span>
            </div>
            <Progress
              value={(metrics.memoryUsage.usedJSHeapSize / metrics.memoryUsage.jsHeapSizeLimit) * 100}
              className="h-2"
            />
          </div>
        </Card>
      )}
    </div>
  );
}