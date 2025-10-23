"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, LogIn, Mail, Shield, Sparkles, ArrowRight } from "lucide-react";

// Professional animated character component
function SecurityCharacter({
  mood,
  isActive,
}: {
  mood: "idle" | "watching" | "success" | "thinking";
  isActive: boolean;
}) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 1000);
    }, 3000);

    return () => clearInterval(pulseInterval);
  }, []);

  return (
    <div className="relative">
      {/* Glow effect */}
      <div
        className={`
          absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20
          rounded-full blur-xl transition-opacity duration-500
          ${isActive ? "opacity-100" : "opacity-50"}
        `}
      />

      {/* Character body */}
      <div
        className={`
          relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600
          rounded-full shadow-2xl transition-all duration-500
          ${isActive ? "scale-110" : "scale-100"}
          ${pulse ? "animate-pulse" : ""}
        `}
      >
        {/* Shield icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield className="w-10 h-10 text-white drop-shadow-lg" />
        </div>

        {/* Status indicator */}
        <div
          className={`
            absolute -bottom-1 -right-1 w-6 h-6 rounded-full
            flex items-center justify-center text-xs font-bold
            transition-all duration-300
            ${
              mood === "success"
                ? "bg-green-500 text-white"
                : mood === "thinking"
                ? "bg-yellow-500 text-white"
                : mood === "watching"
                ? "bg-blue-500 text-white animate-pulse"
                : "bg-gray-400 text-white"
            }
          `}
        >
          {mood === "success" ? "✓" : mood === "thinking" ? "..." : mood === "watching" ? "👁" : "○"}
        </div>
      </div>

      {/* Floating particles */}
      {isActive && (
        <div className="absolute -top-4 -left-4">
          <Sparkles className="w-6 h-6 text-blue-400 animate-ping" />
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [characterMood, setCharacterMood] = useState<"idle" | "watching" | "success" | "thinking">("idle");
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Character reactions based on input
    if (name === "email") {
      setCharacterMood("watching");
      if (value.length > 0 && value.includes("@")) {
        setCharacterMood("success");
      } else if (value.length > 3) {
        setCharacterMood("thinking");
      }
    } else if (name === "password") {
      setCharacterMood("watching");
      if (value.length >= 6) {
        setCharacterMood("success");
      } else if (value.length > 0) {
        setCharacterMood("thinking");
      }
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleInputFocus = (field: "email" | "password") => {
    setCharacterMood("watching");
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setCharacterMood("idle");
    }, 1000);
  };

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
    setCharacterMood("thinking");
    setTimeout(() => setCharacterMood("idle"), 500);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
      setCharacterMood("idle");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      setCharacterMood("idle");
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      setCharacterMood("idle");
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      setCharacterMood("idle");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setCharacterMood("success");

    try {
      // TODO: Implement actual authentication logic with Supabase
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call

      // For demo purposes, redirect to dashboard
      router.push("/dashboard");
    } catch {
      setErrors({ general: "Invalid email or password" });
      setCharacterMood("idle");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-4 relative overflow-hidden">
      {/* Enhanced background with animated gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/20 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="relative w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Welcome Section */}
          <div className="text-center lg:text-left space-y-8">
            {/* Logo and branding */}
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center lg:justify-start gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white">
                  Leave Management
                </h1>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gradient mb-4">
                Welcome Back
              </h2>
              <p className="text-xl text-gray-300 max-w-lg">
                Secure access to your leave management dashboard with enterprise-grade protection.
              </p>
            </div>

            {/* Security Character */}
            <div className="flex justify-center lg:justify-start">
              <SecurityCharacter
                mood={characterMood}
                isActive={Object.keys(formData).some(key => formData[key as keyof typeof formData] !== "")}
              />
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 max-w-md lg:max-w-none mx-auto lg:mx-0">
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">Secure Authentication</p>
                  <p className="text-sm text-gray-400">Enterprise-grade security</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">Smart Dashboard</p>
                  <p className="text-sm text-gray-400">Intuitive leave management</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="max-w-md w-full mx-auto lg:mx-0">
            <Card className="glass-card-enhanced p-8 relative overflow-hidden">
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500" />

              <CardHeader className="space-y-2 pb-6">
                <CardTitle className="text-2xl font-bold text-center text-white">
                  Sign In
                </CardTitle>
                <CardDescription className="text-center text-gray-300">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <CardContent className="space-y-5 pb-6">
                  {errors.general && (
                    <div
                      className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                      role="alert"
                    >
                      {errors.general}
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-200 flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <Input
                      ref={emailInputRef}
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      onFocus={() => handleInputFocus("email")}
                      onBlur={handleInputBlur}
                      className={`
                        modern-input text-white placeholder-gray-400
                        ${errors.email ? "border-red-500 focus:border-red-500" : ""}
                      `}
                      disabled={isLoading}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && (
                      <p
                        id="email-error"
                        className="text-sm text-red-400 flex items-center gap-1"
                        role="alert"
                      >
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-200 flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        ref={passwordInputRef}
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        onFocus={() => handleInputFocus("password")}
                        onBlur={handleInputBlur}
                        className={`
                          modern-input pr-12 text-white placeholder-gray-400
                          ${errors.password ? "border-red-500 focus:border-red-500" : ""}
                        `}
                        disabled={isLoading}
                        aria-describedby={errors.password ? "password-error" : undefined}
                        aria-invalid={!!errors.password}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full w-12 text-gray-400 hover:text-white transition-colors"
                        onClick={handlePasswordToggle}
                        disabled={isLoading}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p
                        id="password-error"
                        className="text-sm text-red-400 flex items-center gap-1"
                        role="alert"
                      >
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Remember me & Forgot password */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            rememberMe: checked as boolean,
                          }))
                        }
                        disabled={isLoading}
                        className="border-gray-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      />
                      <Label
                        htmlFor="remember"
                        className="text-sm font-normal text-gray-300 cursor-pointer"
                      >
                        Remember me
                      </Label>
                    </div>
                    <Link
                      href="/auth/reset-password"
                      className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </CardContent>

                <CardFooter className="space-y-4 pt-0">
                  <Button
                    type="submit"
                    className="btn-primary w-full h-12 text-base font-semibold relative group"
                    disabled={isLoading}
                    aria-describedby={isLoading ? "loading-status" : undefined}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div
                          id="loading-status"
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin loading-spinner"
                          role="status"
                          aria-label="Loading"
                        ></div>
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Sign In
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>

                  <div className="text-center text-sm text-gray-400 pt-2">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/auth/register"
                      className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      Create account
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </Card>

            {/* Demo credentials */}
            <div className="mt-6 p-4 glass-card text-center">
              <p className="text-sm text-gray-300">
                <strong className="text-white">Demo Account:</strong> Use any email and password (min. 6 characters) to access the dashboard
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Blob animation styles */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}