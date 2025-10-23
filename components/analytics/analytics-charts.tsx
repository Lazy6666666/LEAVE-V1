"use client";

import { useState, useRef } from "react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Optimized lucide-react imports for tree-shaking
import {
  Calendar as CalendarIcon,
  TrendingUp,
  Users,
  BarChart3,
  Activity,
} from "@/lib/utils/icons";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import ChartFilters, { ChartFiltersState } from "./chart-filters";

interface ChartData {
  name: string;
  value: number;
  color?: string;
  [key: string]: any;
}

interface AnalyticsChartsProps {
  className?: string;
}

const COLORS = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#84cc16", // lime-500
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
            {entry.dataKey?.includes("Rate") && "%"}
            {entry.dataKey?.includes("Days") && " days"}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show label for small slices

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function AnalyticsCharts({ className }: AnalyticsChartsProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<ChartFiltersState>({
    period: "year",
    department: "all",
    leaveType: "all",
    dateRange: { from: undefined, to: undefined },
    comparisonMode: false,
  });

  // Mock data for leave type distribution
  const leaveTypeData: ChartData[] = [
    { name: "Annual Leave", value: 45, color: "#3b82f6" },
    { name: "Sick Leave", value: 25, color: "#10b981" },
    { name: "Personal Leave", value: 15, color: "#f59e0b" },
    { name: "Maternity/Paternity", value: 10, color: "#ec4899" },
    { name: "Study Leave", value: 5, color: "#8b5cf6" },
  ];

  // Mock data for monthly trends
  const monthlyTrendData = [
    { month: "Jan", annual: 12, sick: 8, personal: 5, total: 25 },
    { month: "Feb", annual: 15, sick: 12, personal: 3, total: 30 },
    { month: "Mar", annual: 18, sick: 6, personal: 8, total: 32 },
    { month: "Apr", annual: 22, sick: 10, personal: 6, total: 38 },
    { month: "May", annual: 20, sick: 8, personal: 4, total: 32 },
    { month: "Jun", annual: 25, sick: 15, personal: 10, total: 50 },
    { month: "Jul", annual: 28, sick: 5, personal: 7, total: 40 },
    { month: "Aug", annual: 30, sick: 12, personal: 9, total: 51 },
    { month: "Sep", annual: 22, sick: 8, personal: 5, total: 35 },
    { month: "Oct", annual: 18, sick: 10, personal: 6, total: 34 },
    { month: "Nov", annual: 20, sick: 7, personal: 8, total: 35 },
    { month: "Dec", annual: 35, sick: 5, personal: 15, total: 55 },
  ];

  // Mock data for team comparison
  const teamComparisonData = [
    { name: "Engineering", utilized: 85, available: 15, total: 100 },
    { name: "Marketing", utilized: 72, available: 28, total: 100 },
    { name: "Sales", utilized: 90, available: 10, total: 100 },
    { name: "HR", utilized: 65, available: 35, total: 100 },
    { name: "Finance", utilized: 78, available: 22, total: 100 },
    { name: "Operations", utilized: 88, available: 12, total: 100 },
  ];

  // Mock data for year-over-year comparison
  const yearlyComparisonData = [
    { year: "2019", leaves: 245, rate: 3.2, employees: 76 },
    { year: "2020", leaves: 189, rate: 2.8, employees: 68 },
    { year: "2021", leaves: 267, rate: 3.9, employees: 69 },
    { year: "2022", leaves: 298, rate: 4.1, employees: 73 },
    { year: "2023", leaves: 312, rate: 4.3, employees: 73 },
    { year: "2024", leaves: 328, rate: 4.5, employees: 73 },
  ];

  // Mock data for department-wise analysis
  const departmentData = [
    {
      department: "Engineering",
      annual: 120,
      sick: 45,
      personal: 30,
      other: 15,
    },
    { department: "Marketing", annual: 85, sick: 32, personal: 20, other: 8 },
    { department: "Sales", annual: 95, sick: 38, personal: 25, other: 12 },
    { department: "HR", annual: 45, sick: 20, personal: 12, other: 5 },
    { department: "Finance", annual: 65, sick: 28, personal: 18, other: 7 },
    {
      department: "Operations",
      annual: 110,
      sick: 42,
      personal: 28,
      other: 14,
    },
  ];

  const handleExportChart = async () => {
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: "#ffffff",
          scale: 2,
        });
        canvas.toBlob((blob) => {
          if (blob) {
            saveAs(
              blob,
              `leave-analytics-${new Date().toISOString().split("T")[0]}.png`
            );
          }
        });
      } catch (error) {
        console.error("Error exporting chart:", error);
      }
    }
  };

  const handleFiltersChange = (newFilters: ChartFiltersState) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    // In a real app, this would refetch data based on current filters
    console.log("Refreshing data with filters:", filters);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters */}
      <ChartFilters
        onFiltersChange={handleFiltersChange}
        onExport={handleExportChart}
        onRefresh={handleRefresh}
      />

      {/* Charts Section */}
      <div ref={chartRef} className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leave Analytics</h2>
          <p className="text-muted-foreground">
            Interactive charts and insights for leave management
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-700">
                  Total Leave Days
                </CardTitle>
                <CalendarIcon className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">328</div>
              <p className="text-xs text-blue-600">+5.2% from last year</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-700">
                  Approval Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">94.5%</div>
              <p className="text-xs text-green-600">+2.1% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-purple-700">
                  Active Employees
                </CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">73</div>
              <p className="text-xs text-purple-600">12 currently on leave</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-orange-700">
                  Avg. Days/Employee
                </CardTitle>
                <Activity className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800">4.5</div>
              <p className="text-xs text-orange-600">Per year</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Leave Type Distribution - Pie Chart */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Leave Type Distribution
              </CardTitle>
              <CardDescription>
                Breakdown of leave types taken this {filters.period}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leaveTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {leaveTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Trends - Bar Chart */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Leave Trends
              </CardTitle>
              <CardDescription>
                Leave patterns throughout the year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="annual"
                    stackId="a"
                    fill="#3b82f6"
                    name="Annual"
                  />
                  <Bar dataKey="sick" stackId="a" fill="#10b981" name="Sick" />
                  <Bar
                    dataKey="personal"
                    stackId="a"
                    fill="#f59e0b"
                    name="Personal"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Team Comparison - Horizontal Bar Chart */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Department Leave Utilization
              </CardTitle>
              <CardDescription>
                Percentage of leave utilized by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={teamComparisonData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="utilized" fill="#3b82f6" name="Utilized %" />
                  <Bar dataKey="available" fill="#e5e7eb" name="Available %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Year-over-Year Comparison - Line Chart */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Year-over-Year Analysis
              </CardTitle>
              <CardDescription>
                Leave trends and rates over the past 6 years
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={yearlyComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="leaves"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Total Leaves"
                    dot={{ fill: "#3b82f6", r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="rate"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Leave Rate (%)"
                    dot={{ fill: "#ef4444", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Department-wise Analysis - Area Chart */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Department-wise Leave Analysis
            </CardTitle>
            <CardDescription>
              Detailed breakdown of leave types by department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="department" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="annual"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                  name="Annual Leave"
                />
                <Area
                  type="monotone"
                  dataKey="sick"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                  name="Sick Leave"
                />
                <Area
                  type="monotone"
                  dataKey="personal"
                  stackId="1"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.6}
                  name="Personal Leave"
                />
                <Area
                  type="monotone"
                  dataKey="other"
                  stackId="1"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                  name="Other Leave"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
