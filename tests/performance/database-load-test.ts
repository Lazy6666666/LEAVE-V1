// Database Performance Load Testing Script
// Tests database performance under various load scenarios

import { PrismaClient } from "@prisma/client";
import { performance } from "perf_hooks";
import { DatabaseMonitoringService } from "@/lib/services/database-monitoring";

interface LoadTestConfig {
  concurrentUsers: number;
  requestsPerUser: number;
  rampUpTime: number; // seconds
  testDuration: number; // seconds
}

interface LoadTestResult {
  testName: string;
  config: LoadTestConfig;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerSecond: number;
  errors: string[];
}

interface QueryPerformance {
  query: string;
  avgTime: number;
  p95Time: number;
  p99Time: number;
  totalCalls: number;
  errorRate: number;
}

export class DatabaseLoadTester {
  private prisma: PrismaClient;
  private monitoringService: DatabaseMonitoringService;

  constructor() {
    this.prisma = new PrismaClient();
    this.monitoringService = new DatabaseMonitoringService();
  }

  /**
   * Test leave query performance
   */
  async testLeaveQueries(): Promise<QueryPerformance[]> {
    const tests = [
      {
        name: "Get User Leaves",
        query: async () => {
          return this.prisma.leave.findMany({
            where: { user_id: "test-user-id" },
            include: {
              user: { include: { profile: true } },
              leave_type: true,
            },
          });
        },
      },
      {
        name: "Get Pending Leaves",
        query: async () => {
          return this.prisma.leave.findMany({
            where: { status: "PENDING" },
            include: {
              user: { include: { profile: true } },
              leave_type: true,
            },
            orderBy: { created_at: "desc" },
          });
        },
      },
      {
        name: "Calendar Date Range Query",
        query: async () => {
          const startDate = new Date();
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 1);

          return this.prisma.leave.findMany({
            where: {
              status: "APPROVED",
              AND: [
                { start_date: { lte: endDate } },
                { end_date: { gte: startDate } },
              ],
            },
            include: {
              user: { include: { profile: true } },
              leave_type: true,
            },
          });
        },
      },
      {
        name: "Department Leaves Query",
        query: async () => {
          return this.prisma.leave.findMany({
            where: {
              user: {
                profile: {
                  department: "Engineering",
                },
              },
            },
            include: {
              user: { include: { profile: true } },
              leave_type: true,
            },
          });
        },
      },
    ];

    const results: QueryPerformance[] = [];

    for (const test of tests) {
      console.log(`Testing: ${test.name}`);
      const times: number[] = [];
      const errors: number[] = [];
      const iterations = 50;

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        try {
          await test.query();
          const endTime = performance.now();
          times.push(endTime - startTime);
        } catch (error) {
          errors.push(1);
        }
      }

      times.sort((a, b) => a - b);

      results.push({
        query: test.name,
        avgTime: times.reduce((a, b) => a + b, 0) / times.length,
        p95Time: times[Math.floor(times.length * 0.95)],
        p99Time: times[Math.floor(times.length * 0.99)],
        totalCalls: iterations,
        errorRate: (errors.length / iterations) * 100,
      });
    }

    return results;
  }

  /**
   * Simulate concurrent user load
   */
  async runLoadTest(config: LoadTestConfig): Promise<LoadTestResult> {
    console.log(
      `Starting load test with ${config.concurrentUsers} concurrent users`
    );

    const startTime = performance.now();
    const results: Array<{
      responseTime: number;
      success: boolean;
      error?: string;
    }> = [];
    const errors: string[] = [];

    // Create concurrent users
    const userPromises = Array.from(
      { length: config.concurrentUsers },
      (_, userIndex) =>
        this.simulateUserLoad(config, userIndex, results, errors)
    );

    await Promise.all(userPromises);

    const endTime = performance.now();
    const totalDuration = (endTime - startTime) / 1000;

    const successfulRequests = results.filter((r) => r.success).length;
    const failedRequests = results.length - successfulRequests;
    const responseTimes = results
      .filter((r) => r.success)
      .map((r) => r.responseTime);

    responseTimes.sort((a, b) => a - b);

    return {
      testName: "Database Load Test",
      config,
      totalRequests: results.length,
      successfulRequests,
      failedRequests,
      averageResponseTime:
        responseTimes.length > 0
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          : 0,
      p95ResponseTime:
        responseTimes.length > 0
          ? responseTimes[Math.floor(responseTimes.length * 0.95)]
          : 0,
      p99ResponseTime:
        responseTimes.length > 0
          ? responseTimes[Math.floor(responseTimes.length * 0.99)]
          : 0,
      requestsPerSecond: results.length / totalDuration,
      errors,
    };
  }

  /**
   * Simulate a single user's load
   */
  private async simulateUserLoad(
    config: LoadTestConfig,
    userIndex: number,
    results: Array<{ responseTime: number; success: boolean; error?: string }>,
    errors: string[]
  ): Promise<void> {
    // Ramp up delay
    const rampUpDelay =
      (config.rampUpTime / config.concurrentUsers) * userIndex * 1000;
    await new Promise((resolve) => setTimeout(resolve, rampUpDelay));

    const queries = [
      async () => {
        const startTime = performance.now();
        try {
          await this.prisma.leave.findMany({
            where: { user_id: `user-${userIndex}` },
            take: 10,
          });
          const endTime = performance.now();
          results.push({ responseTime: endTime - startTime, success: true });
        } catch (error) {
          results.push({
            responseTime: 0,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
          errors.push(`User ${userIndex}: ${error}`);
        }
      },
      async () => {
        const startTime = performance.now();
        try {
          await this.prisma.notificationLog.findMany({
            where: { user_id: `user-${userIndex}` },
            orderBy: { created_at: "desc" },
            take: 20,
          });
          const endTime = performance.now();
          results.push({ responseTime: endTime - startTime, success: true });
        } catch (error) {
          results.push({
            responseTime: 0,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      },
      async () => {
        const startTime = performance.now();
        try {
          await this.prisma.companyDocument.findMany({
            where: { access_level: "PUBLIC" },
            take: 15,
          });
          const endTime = performance.now();
          results.push({ responseTime: endTime - startTime, success: true });
        } catch (error) {
          results.push({
            responseTime: 0,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      },
    ];

    // Execute queries for this user
    for (let i = 0; i < config.requestsPerUser; i++) {
      const randomQuery = queries[Math.floor(Math.random() * queries.length)];
      await randomQuery();

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));
    }
  }

  /**
   * Test database connection pool performance
   */
  async testConnectionPoolPerformance(): Promise<{
    maxConnections: number;
    avgConnectionTime: number;
    connectionErrors: number;
  }> {
    const connectionTests = 100;
    const times: number[] = [];
    let errors = 0;

    for (let i = 0; i < connectionTests; i++) {
      const startTime = performance.now();
      try {
        const client = new PrismaClient();
        await client.$connect();
        await client.$queryRaw`SELECT 1`;
        await client.$disconnect();
        const endTime = performance.now();
        times.push(endTime - startTime);
      } catch (error) {
        errors++;
      }
    }

    return {
      maxConnections: connectionTests,
      avgConnectionTime:
        times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
      connectionErrors: errors,
    };
  }

  /**
   * Get comprehensive performance report
   */
  async getPerformanceReport(): Promise<{
    queryPerformance: QueryPerformance[];
    loadTest: LoadTestResult;
    connectionPoolTest: any;
    databaseMetrics: any;
  }> {
    console.log("Running comprehensive performance tests...");

    const [queryPerformance, loadTest, connectionPoolTest, databaseMetrics] =
      await Promise.all([
        this.testLeaveQueries(),
        this.runLoadTest({
          concurrentUsers: 10,
          requestsPerUser: 5,
          rampUpTime: 5,
          testDuration: 30,
        }),
        this.testConnectionPoolPerformance(),
        this.monitoringService.getPerformanceMetrics(),
      ]);

    return {
      queryPerformance,
      loadTest,
      connectionPoolTest,
      databaseMetrics,
    };
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations(report: any): string[] {
    const recommendations: string[] = [];

    // Query performance recommendations
    const slowQueries = report.queryPerformance.filter(
      (q: QueryPerformance) => q.avgTime > 100
    );
    if (slowQueries.length > 0) {
      recommendations.push(
        `⚠️ Found ${slowQueries.length} slow queries (>100ms avg). Consider adding indexes or optimizing queries.`
      );
    }

    // Load test recommendations
    if (report.loadTest.averageResponseTime > 200) {
      recommendations.push(
        "⚠️ High average response time under load. Consider connection pooling optimization."
      );
    }

    if (report.loadTest.failedRequests > 0) {
      recommendations.push(
        `❌ ${report.loadTest.failedRequests} requests failed during load test. Check database capacity.`
      );
    }

    // Database metrics recommendations
    if (report.databaseMetrics.cacheHitRate < 95) {
      recommendations.push(
        "⚠️ Low cache hit rate. Consider increasing shared_buffers or optimizing queries."
      );
    }

    if (report.databaseMetrics.slowQueries.length > 0) {
      recommendations.push(
        `⚠️ Found ${report.databaseMetrics.slowQueries.length} slow queries in pg_stat_statements.`
      );
    }

    // Connection pool recommendations
    if (report.connectionPoolTest.connectionErrors > 0) {
      recommendations.push(
        "❌ Connection pool errors detected. Consider increasing pool_size or reducing timeout."
      );
    }

    if (recommendations.length === 0) {
      recommendations.push("✅ Database performance looks good!");
    }

    return recommendations;
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new DatabaseLoadTester();

  tester
    .getPerformanceReport()
    .then((report) => {
      console.log("\n=== Database Performance Report ===");
      console.log("\nQuery Performance:");
      report.queryPerformance.forEach((q: QueryPerformance) => {
        console.log(`${q.query}:`);
        console.log(`  Average: ${q.avgTime.toFixed(2)}ms`);
        console.log(`  P95: ${q.p95Time.toFixed(2)}ms`);
        console.log(`  P99: ${q.p99Time.toFixed(2)}ms`);
        console.log(`  Error Rate: ${q.errorRate.toFixed(2)}%\n`);
      });

      console.log("Load Test Results:");
      console.log(`  Total Requests: ${report.loadTest.totalRequests}`);
      console.log(`  Successful: ${report.loadTest.successfulRequests}`);
      console.log(`  Failed: ${report.loadTest.failedRequests}`);
      console.log(
        `  Average Response Time: ${report.loadTest.averageResponseTime.toFixed(2)}ms`
      );
      console.log(
        `  Requests/sec: ${report.loadTest.requestsPerSecond.toFixed(2)}`
      );

      console.log("\nRecommendations:");
      tester.generateRecommendations(report).forEach((rec) => console.log(rec));

      return tester.cleanup();
    })
    .catch((error) => {
      console.error("Performance test failed:", error);
      return tester.cleanup();
    });
}
