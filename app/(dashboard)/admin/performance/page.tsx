"use client";

import { useState, useEffect } from "react";
import { Metric } from "web-vitals";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import dynamic from "next/dynamic";

// Lazy load recharts components individually
const LineChart = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.LineChart })),
  { ssr: false }
);
const BarChart = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.BarChart })),
  { ssr: false }
);
const PieChart = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.PieChart })),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () =>
    import("recharts").then((mod) => ({ default: mod.ResponsiveContainer })),
  { ssr: false }
);
const Line = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Line })),
  { ssr: false }
);
const Bar = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Bar })),
  { ssr: false }
);
const Pie = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Pie })),
  { ssr: false }
);
const XAxis = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.XAxis })),
  { ssr: false }
);
const YAxis = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.YAxis })),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.CartesianGrid })),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Tooltip })),
  { ssr: false }
);
const Legend = dynamic(
  () => import("recharts").then((mod) => ({ default: (mod as any).Legend })),
  { ssr: false }
);
const Cell = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Cell })),
  { ssr: false }
);
import {
  Activity,
  AlertTriangle,
  Gauge,
  MemoryStick,
  RefreshCw,
  Wifi,
} from "lucide-react";
import { usePerformanceMonitor } from "@/lib/performance";
import { logger } from "@/lib/utils/logger";

export default function PerformanceDashboard() {
  const { metrics, report } = usePerformanceMonitor();
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Store historical data
    const interval = setInterval(() => {
      setHistoricalData((prev) => {
        const newData = {
          timestamp: new Date().toLocaleTimeString(),
          frameRate: metrics.frameRate,
          score: report.score,
          memoryUsage: metrics.memoryUsage
            ? Math.round(metrics.memoryUsage.usedJSHeapSize / 1048576)
            : 0,
        };

        const updated = [...prev, newData];
        return updated.slice(-20); // Keep last 20 data points
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [metrics, report]);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      // Force refresh of performance data
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      logger.error("Failed to refresh performance data", { error });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreVariant = (
    score: number
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 90) return "default";
    if (score >= 70) return "secondary";
    return "destructive";
  };

  const formatWebVitalValue = (
    value: number | undefined,
    metric: string
  ): string => {
    if (value === undefined) return "N/A";

    switch (metric) {
      case "LCP":
      case "FCP":
      case "TTFB":
        return `${Math.round(value)}ms`;
      case "FID":
      case "INP":
        return `${Math.round(value)}ms`;
      case "CLS":
        return value.toFixed(3);
      default:
        return Math.round(value).toString();
    }
  };

  const getWebVitalStatus = (
    value: number | undefined,
    metric: string
  ): "good" | "needs-improvement" | "poor" | "unknown" => {
    if (value === undefined) return "unknown";

    switch (metric) {
      case "LCP":
        if (value <= 2500) return "good";
        if (value <= 4000) return "needs-improvement";
        return "poor";
      case "FID":
      case "INP":
        if (value <= 100) return "good";
        if (value <= 300) return "needs-improvement";
        return "poor";
      case "CLS":
        if (value <= 0.1) return "good";
        if (value <= 0.25) return "needs-improvement";
        return "poor";
      case "FCP":
        if (value <= 1800) return "good";
        if (value <= 3000) return "needs-improvement";
        return "poor";
      case "TTFB":
        if (value <= 800) return "good";
        if (value <= 1800) return "needs-improvement";
        return "poor";
      default:
        return "unknown";
    }
  };

  const getWebVitalColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-600";
      case "needs-improvement":
        return "text-yellow-600";
      case "poor":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  const resourceTimingData = metrics.resourceTiming
    .slice(0, 10)
    .map((resource) => ({
      name: resource.name.split("/").pop() || resource.name,
      duration: Math.round(resource.duration),
      size: resource.transferSize
        ? Math.round(resource.transferSize / 1024)
        : 0,
    }));

  const performanceDistribution = [
    { name: "Excellent", value: report.score >= 90 ? 1 : 0, color: "#22c55e" },
    {
      name: "Good",
      value: report.score >= 70 && report.score < 90 ? 1 : 0,
      color: "#eab308",
    },
    { name: "Poor", value: report.score < 70 ? 1 : 0, color: "#ef4444" },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time application performance metrics and Web Vitals
          </p>
        </div>
        <Button onClick={refreshData} disabled={isRefreshing}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Performance Score Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Performance Score
            </CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getScoreColor(report.score)}`}
            >
              {report.score}
            </div>
            <Badge variant={getScoreVariant(report.score)} className="mt-1">
              {report.score >= 90
                ? "Excellent"
                : report.score >= 70
                  ? "Good"
                  : "Needs Improvement"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frame Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.frameRate}</div>
            <p className="text-xs text-muted-foreground">FPS</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.memoryUsage
                ? Math.round(metrics.memoryUsage.usedJSHeapSize / 1048576)
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">MB</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Type</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.networkInfo
                ? metrics.networkInfo.effectiveType || "Unknown"
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Connection</p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Performance Recommendations</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1">
              {report.recommendations.map((rec, index) => (
                <li key={index} className="text-sm">
                  • {rec}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="web-vitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="web-vitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="resources">Resource Timing</TabsTrigger>
          <TabsTrigger value="history">Historical Data</TabsTrigger>
        </TabsList>

        {/* Web Vitals Tab */}
        <TabsContent value="web-vitals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(metrics.webVitals).map(([key, value]) => {
              const status = getWebVitalStatus(value, key);
              return (
                <Card key={key}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{key}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${getWebVitalColor(status)}`}
                    >
                      {formatWebVitalValue(value, key as keyof Metric)}
                    </div>
                    <Badge
                      variant={
                        status === "good"
                          ? "default"
                          : status === "needs-improvement"
                            ? "secondary"
                            : "destructive"
                      }
                      className="mt-1"
                    >
                      {status.replace("-", " ")}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Performance Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={performanceDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {performanceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Real-time Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Frame Rate</span>
                      <span>{metrics.frameRate} FPS</span>
                    </div>
                    <Progress
                      value={Math.min((metrics.frameRate / 60) * 100, 100)}
                      className="mt-1"
                    />
                  </div>

                  {metrics.memoryUsage && (
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Memory Usage</span>
                        <span>
                          {Math.round(
                            metrics.memoryUsage.usedJSHeapSize / 1048576
                          )}{" "}
                          MB
                        </span>
                      </div>
                      <Progress
                        value={
                          (metrics.memoryUsage.usedJSHeapSize /
                            metrics.memoryUsage.jsHeapSizeLimit) *
                          100
                        }
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Resource Timing Tab */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Loading Times</CardTitle>
              <CardDescription>Top 10 slowest resources</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={resourceTimingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="duration" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historical Data Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Last 20 data points (updated every 5 seconds)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="frameRate"
                    stroke="#8884d8"
                    name="Frame Rate"
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#82ca9d"
                    name="Performance Score"
                  />
                  <Line
                    type="monotone"
                    dataKey="memoryUsage"
                    stroke="#ffc658"
                    name="Memory (MB)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
