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
    <div className="min-h-screen bg-white text-container" suppressHydrationWarning>
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg feature-icon">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                LeaveFlow
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="nav-link">
                <Button
                  variant="outline"
                  className="border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="btn-hover-primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-bg relative overflow-hidden py-20 px-4">
        <div className="container mx-auto relative content-layer">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors badge-glow">
              <Zap className="w-3 h-3 mr-1" />
              Streamline Your Leave Management
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-gradient-primary">
              Smart Leave Management
              <br />
              for Modern Teams
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed text-container">
              Transform how your team manages time off. Request, approve, and
              track leave with our intuitive platform designed for the modern
              workplace.
            </p>
            <div className="flex-container gap-4 justify-center mb-12">
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-14 px-8 text-base font-medium shadow-xl hover:shadow-2xl transition-all duration-200 btn-hover-primary"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-base font-medium border-2 hover:bg-slate-50 transition-all duration-200 nav-link"
                >
                  Sign In to Demo
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                No credit card required
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                14-day free trial
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Manage Leave
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features that make leave management effortless for
              everyone.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="group card-hover feature-card shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center feature-icon">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Smart Calendar</CardTitle>
                <CardDescription>
                  Visual leave calendar with team availability and conflict
                  detection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Real-time updates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Conflict prevention
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group card-hover feature-card shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center feature-icon">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>
                  Manage leave for your entire team with role-based access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Manager approvals
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Team dashboard
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group card-hover feature-card shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center feature-icon">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Insights and reports on leave trends and patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Usage analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Custom reports
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group card-hover feature-card shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center feature-icon">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Secure & Compliant</CardTitle>
                <CardDescription>
                  Enterprise-grade security with data protection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    SOC 2 compliant
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    GDPR ready
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group card-hover feature-card shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center feature-icon">
                  <Clock className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle>Automation</CardTitle>
                <CardDescription>
                  Automated workflows and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Email alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Slack integration
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group card-hover feature-card shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center feature-icon">
                  <Target className="w-6 h-6 text-cyan-600" />
                </div>
                <CardTitle>Policy Management</CardTitle>
                <CardDescription>
                  Configure leave policies and accrual rules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Custom policies
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Auto accrual
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-4">
              Trusted by Leading Companies
            </h3>
            <p className="text-slate-600">
              Join thousands of teams managing leave smarter
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {["TechCorp", "DesignHub", "MarketingPro", "DataFlow"].map(
              (company, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center p-6 bg-white rounded-xl shadow-sm border card-hover"
                >
                  <Globe className="w-5 h-5 text-slate-400 mr-2" />
                  <span className="font-semibold text-slate-700">
                    {company}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="stats-card">
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-blue-100">Active Users</div>
            </div>
            <div className="stats-card">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Companies</div>
            </div>
            <div className="stats-card">
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Leave Requests</div>
            </div>
            <div className="stats-card">
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-green-100 text-green-800">
              Ready to get started?
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Transform Your Leave Management Today
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              Join thousands of teams that trust LeaveFlow for their leave
              management needs.
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="h-14 px-12 text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-200 btn-hover-primary bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <div className="flex items-center justify-center gap-6 mt-8">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="text-slate-600 ml-2">
                  4.9/5 from 2,000+ reviews
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-slate-50 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">LeaveFlow</span>
              </div>
              <p className="text-slate-600 text-sm">
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
          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-slate-600">
            <p>&copy; 2024 LeaveFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
