"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Home,
  Search,
  ArrowLeft,
  FileQuestion,
  Calendar,
  FileText,
} from "lucide-react";
import { useEffect } from "react";

export default function NotFound() {
  useEffect(() => {
    // Log 404 error for analytics
    console.error("404: Page not found");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md mx-auto text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full shadow-xl">
            <span className="text-4xl font-bold text-slate-600">404</span>
          </div>
        </div>

        {/* Content */}
        <Card className="glass-card p-8">
          <CardHeader className="text-center pb-4">
            <FileQuestion className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <CardTitle className="text-2xl">Page Not Found</CardTitle>
            <CardDescription>
              The page you're looking for doesn't exist or has been moved.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This could be due to:
            </p>
            <ul className="text-left text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>A broken or
                outdated link
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                An incorrect URL address
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>A page that hasn't
                been implemented yet
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                Insufficient permissions to access this page
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link href="/dashboard" className="flex-1">
                <Button variant="default" className="w-full btn-hover-primary">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>

              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous Page
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="glass-card mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/calendar">
                <Button variant="ghost" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendar
                </Button>
              </Link>
              <Link href="/dashboard/employee/leaves/new">
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  New Request
                </Button>
              </Link>
              <Link href="/dashboard/documents">
                <Button variant="ghost" className="w-full justify-start">
                  <Search className="w-4 h-4 mr-2" />
                  Documents
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="glass-card mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you believe this is an error, please contact our support team.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Search Help
              </Button>
              <Button variant="outline" size="sm">
                <FileQuestion className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
