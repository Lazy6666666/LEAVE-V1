import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  BarChart3,
  Shield,
  CheckCircle,
  ArrowRight,
  Star,
  Clock,
  Globe,
  Zap,
  Target,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white" suppressHydrationWarning>
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg feature-icon">
                <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                LeaveFlow
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/login" className="nav-link">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="btn-hover-primary">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-bg relative overflow-hidden py-12 sm:py-16 md:py-20 px-4">
        <div className="container mx-auto relative content-layer">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors badge-glow">
              <Zap className="w-3 h-3 mr-1" />
              Streamline Your Leave Management
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 text-gradient-primary break-words hyphens-auto">
              Smart Leave Management for Modern Teams
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
              Transform how your team manages time off. Request, approve, and
              track leave with our intuitive platform designed for the modern
              workplace.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-medium shadow-xl hover:shadow-2xl transition-all duration-200 btn-hover-primary"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-medium border-2 hover:bg-slate-50 transition-all duration-200 nav-link"
                >
                  Sign In to Demo
                </Button>
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                <span className="whitespace-nowrap">
                  No credit card required
                </span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                <span className="whitespace-nowrap">14-day free trial</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                <span className="whitespace-nowrap">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 break-words">
              Everything You Need to Manage Leave
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto px-4">
              Powerful features that make leave management effortless for
              everyone.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <Card className="group card-hover feature-card shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center feature-icon">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="break-words">Smart Calendar</CardTitle>
                <CardDescription className="break-words">
                  Visual leave calendar with team availability and conflict
                  detection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Real-time updates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Conflict prevention</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group card-hover feature-card shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center feature-icon">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="break-words">Team Management</CardTitle>
                <CardDescription className="break-words">
                  Manage leave for your entire team with role-based access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Manager approvals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Team dashboard</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group card-hover feature-card shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center feature-icon">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="break-words">Analytics</CardTitle>
                <CardDescription className="break-words">
                  Insights and reports on leave trends and patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Usage analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Custom reports</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group card-hover feature-card shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center feature-icon">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="break-words">
                  Secure & Compliant
                </CardTitle>
                <CardDescription className="break-words">
                  Enterprise-grade security with data protection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>SOC 2 compliant</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>GDPR ready</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group card-hover feature-card shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center feature-icon">
                  <Clock className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle className="break-words">Automation</CardTitle>
                <CardDescription className="break-words">
                  Automated workflows and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Email alerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Slack integration</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group card-hover feature-card shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center feature-icon">
                  <Target className="w-6 h-6 text-cyan-600" />
                </div>
                <CardTitle className="break-words">Policy Management</CardTitle>
                <CardDescription className="break-words">
                  Configure leave policies and accrual rules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Custom policies</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Auto accrual</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 sm:py-16 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 break-words">
              Trusted by Leading Companies
            </h3>
            <p className="text-sm sm:text-base text-slate-600">
              Join thousands of teams managing leave smarter
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-4xl mx-auto">
            {["TechCorp", "DesignHub", "MarketingPro", "DataFlow"].map(
              (company, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center p-4 sm:p-6 bg-white rounded-xl shadow-sm border card-hover"
                >
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mr-2 flex-shrink-0" />
                  <span className="font-semibold text-sm sm:text-base text-slate-700 truncate">
                    {company}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div className="stats-card">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                10K+
              </div>
              <div className="text-xs sm:text-sm md:text-base text-blue-100">
                Active Users
              </div>
            </div>
            <div className="stats-card">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                500+
              </div>
              <div className="text-xs sm:text-sm md:text-base text-blue-100">
                Companies
              </div>
            </div>
            <div className="stats-card">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                50K+
              </div>
              <div className="text-xs sm:text-sm md:text-base text-blue-100">
                Leave Requests
              </div>
            </div>
            <div className="stats-card">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                99.9%
              </div>
              <div className="text-xs sm:text-sm md:text-base text-blue-100">
                Uptime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-green-100 text-green-800">
              Ready to get started?
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 break-words">
              Transform Your Leave Management Today
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-6 sm:mb-8 px-4">
              Join thousands of teams that trust LeaveFlow for their leave
              management needs.
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="h-12 sm:h-14 px-8 sm:px-12 text-base sm:text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 btn-hover-primary bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Start Your Free Trial
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
            </Link>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="text-sm sm:text-base text-slate-600 ml-2">
                  4.9/5 from 2,000+ reviews
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-slate-50 py-8 sm:py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">LeaveFlow</span>
              </div>
              <p className="text-slate-600 text-sm break-words">
                Making leave management simple and efficient for teams
                everywhere.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link href="#" className="nav-link hover:text-slate-900">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="nav-link hover:text-slate-900">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="nav-link hover:text-slate-900">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link href="#" className="nav-link hover:text-slate-900">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="nav-link hover:text-slate-900">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="nav-link hover:text-slate-900">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <Link href="#" className="nav-link hover:text-slate-900">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="nav-link hover:text-slate-900">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="nav-link hover:text-slate-900">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-sm text-slate-600">
            <p>&copy; 2024 LeaveFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
