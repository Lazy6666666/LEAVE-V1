"use client";

import { PageTransition, FadeIn, SlideUp } from "@/components/ui/motion";
import {
  AnimatedDashboardStats,
  AnimatedLeaveBalance,
  AnimatedRecentActivity,
  AnimatedQuickActions,
} from "@/components/analytics/animated-dashboard-cards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Download, FileText } from "lucide-react";

export default function EnhancedDashboardPage() {
  // Mock stats
  const stats = {
    totalLeaveDays: 24,
    usedLeaveDays: 8,
    pendingRequests: 2,
    approvedRequests: 12,
    teamSize: 15,
    teamOnLeave: 3,
    notifications: 5,
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Welcome Section */}
        <FadeIn delay={0.1}>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gradient-enhanced">
              Welcome back! 👋
            </h1>
            <p className="text-muted-foreground text-enhanced text-lg">
              Here&apos;s your personalized leave management dashboard
            </p>
          </div>
        </FadeIn>

        {/* Quick Actions */}
        <AnimatedQuickActions />

        {/* Animated Stats Overview */}
        <AnimatedDashboardStats stats={stats} />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Leave Balance & Recent Activity */}
          <div className="space-y-6">
            <SlideUp delay={0.3}>
              <AnimatedLeaveBalance />
            </SlideUp>

            <SlideUp delay={0.4}>
              <AnimatedRecentActivity />
            </SlideUp>
          </div>

          {/* Charts and Analytics */}
          <div className="lg:col-span-2 space-y-6">
            <SlideUp delay={0.5}>
              <Card className="glass-advanced h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-gradient-enhanced">
                      Leave Analytics
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/analytics">
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="trends">Trends</TabsTrigger>
                      <TabsTrigger value="team">Team</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Card className="elevation-1">
                          <CardContent className="p-6">
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">
                                Leave Utilization
                              </p>
                              <p className="text-3xl font-bold text-gradient-enhanced">
                                33%
                              </p>
                              <p className="text-xs text-success">
                                8 of 24 days used
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="elevation-1">
                          <CardContent className="p-6">
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">
                                Approval Rate
                              </p>
                              <p className="text-3xl font-bold text-gradient-enhanced">
                                86%
                              </p>
                              <p className="text-xs text-success">
                                12 of 14 approved
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                        <p className="text-muted-foreground">
                          Chart visualization goes here
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="trends" className="space-y-4">
                      <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                        <p className="text-muted-foreground">
                          Trends visualization goes here
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="team" className="space-y-4">
                      <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                        <p className="text-muted-foreground">
                          Team analytics goes here
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </SlideUp>

            {/* Quick Actions Panel */}
            <SlideUp delay={0.6}>
              <Card className="glass-advanced">
                <CardHeader>
                  <CardTitle className="text-lg text-gradient-enhanced">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button className="elevation-hover-1" asChild>
                      <Link href="/dashboard/employee/leaves/new">
                        <FileText className="w-4 h-4 mr-2" />
                        New Request
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="elevation-hover-1"
                      asChild
                    >
                      <Link href="/dashboard/documents">
                        <FileText className="w-4 h-4 mr-2" />
                        Documents
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="elevation-hover-1"
                      asChild
                    >
                      <Link href="/dashboard/calendar">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Calendar
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="elevation-hover-1"
                      asChild
                    >
                      <Link href="/dashboard/employee/leaves">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        History
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </SlideUp>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
