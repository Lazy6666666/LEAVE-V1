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
import { Eye, EyeOff, LogIn, Mail, Shield, Sparkles } from "lucide-react";

// Animated character component
function AnimatedCharacter({
  mood,
  isWatching,
  showPassword,
}: {
  mood: "happy" | "excited" | "wink" | "sleeping";
  isWatching: boolean;
  showPassword: boolean;
}) {
  const [bounce, setBounce] = useState(false);
  const [sparkle, setSparkle] = useState(false);

  useEffect(() => {
    const bounceInterval = setInterval(() => {
      setBounce(true);
      setTimeout(() => setBounce(false), 500);
    }, 3000);

    const sparkleInterval = setInterval(() => {
      setSparkle(true);
      setTimeout(() => setSparkle(false), 1000);
    }, 5000);

    return () => {
      clearInterval(bounceInterval);
      clearInterval(sparkleInterval);
    };
  }, []);

  const getEyePosition = () => {
    if (mood === "sleeping") return "h-1";
    if (showPassword) return "h-2";
    return "h-3";
  };

  const getMouthShape = () => {
    switch (mood) {
      case "happy":
        return "w-8 h-4 border-b-4 border-primary rounded-b-full";
      case "excited":
        return "w-12 h-6 border-b-4 border-primary rounded-b-full";
      case "wink":
        return "w-6 h-3 border-b-2 border-primary rounded-b-full";
      case "sleeping":
        return "w-4 h-1 bg-primary rounded-full";
      default:
        return "w-8 h-4 border-b-4 border-primary rounded-b-full";
    }
  };

  return (
    <div className="relative">
      {/* Sparkle effects */}
      {sparkle && (
        <div className="absolute -top-2 -right-2 animate-ping">
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </div>
      )}

      {/* Character body */}
      <div
        className={`
          relative w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500
          rounded-full shadow-lg transition-all duration-300
          ${bounce ? "animate-bounce" : ""}
          ${isWatching ? "scale-110" : "scale-100"}
        `}
      >
        {/* Face */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Eyes */}
            <div className="flex gap-2 mb-2">
              {/* Left eye */}
              <div
                className={`
                relative w-4 bg-white rounded-full transition-all duration-200
                ${isWatching ? "animate-pulse" : ""}
              `}
              >
                <div
                  className={`
                  absolute inset-1 bg-gray-800 rounded-full transition-all duration-300
                  ${getEyePosition()}
                `}
                />
              </div>

              {/* Right eye */}
              <div
                className={`
                relative w-4 bg-white rounded-full transition-all duration-200
                ${mood === "wink" ? "h-1" : ""}
                ${isWatching ? "animate-pulse" : ""}
              `}
              >
                <div
                  className={`
                  absolute inset-1 bg-gray-800 rounded-full transition-all duration-300
                  ${getEyePosition()}
                `}
                />
              </div>
            </div>

            {/* Mouth */}
            <div
              className={`
              mx-auto transition-all duration-300
              ${getMouthShape()}
            `}
            />

            {/* Cheeks (when happy/excited) */}
            {(mood === "happy" || mood === "excited") && (
              <>
                <div className="absolute -left-6 top-4 w-3 h-3 bg-pink-300 rounded-full opacity-60" />
                <div className="absolute -right-6 top-4 w-3 h-3 bg-pink-300 rounded-full opacity-60" />
              </>
            )}
          </div>
        </div>

        {/* Shadow */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-black/10 rounded-full blur-sm" />
      </div>
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
  const [characterMood, setCharacterMood] = useState<
    "happy" | "excited" | "wink" | "sleeping"
  >("happy");
  const [isWatching, setIsWatching] = useState(false);
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
      setIsWatching(true);
      if (value.length > 0 && value.includes("@")) {
        setCharacterMood("excited");
      } else if (value.length > 3) {
        setCharacterMood("happy");
      } else {
        setCharacterMood("happy");
      }
    } else if (name === "password") {
      setIsWatching(true);
      if (value.length > 8) {
        setCharacterMood("wink");
      } else if (value.length > 0) {
        setCharacterMood("happy");
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

  const handleInputFocus = () => {
    setIsWatching(true);
    setCharacterMood("happy");
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setIsWatching(false);
      setCharacterMood("happy");
    }, 2000);
  };

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
    setCharacterMood(showPassword ? "wink" : "excited");

    // Make character react to password toggle
    setIsWatching(true);
    setTimeout(() => setIsWatching(false), 1000);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
      setCharacterMood("sleeping");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      setCharacterMood("sleeping");
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      setCharacterMood("sleeping");
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      setCharacterMood("sleeping");
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
    setCharacterMood("excited");

    try {
      // TODO: Implement actual authentication logic with Supabase
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call

      // For demo purposes, redirect to dashboard
      router.push("/dashboard");
    } catch {
      setErrors({ general: "Invalid email or password" });
      setCharacterMood("sleeping");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
      {/* Enhanced background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        {/* Floating bubbles animation */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-purple-200/30 rounded-full animate-pulse delay-75"></div>
        <div className="absolute top-40 right-40 w-20 h-20 bg-indigo-200/30 rounded-full animate-pulse delay-150"></div>
      </div>

      <div className="relative w-full max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* Left side - Characters and Welcome Message */}
        <div className="flex-1 text-center lg:text-left">
          {/* Logo and branding */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-xl mb-6 feature-icon lg:mx-0 lg:ml-0">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gradient-primary mb-4">
              Welcome back!
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-md">
              Your friendly security companion is here to help you sign in
              safely.
            </p>
          </div>

          {/* Animated Characters */}
          <div className="flex justify-center lg:justify-start gap-8 mb-8">
            <AnimatedCharacter
              mood={characterMood}
              isWatching={isWatching}
              showPassword={showPassword}
            />

            {/* Secondary character that mirrors the first */}
            <div className="relative">
              <div
                className={`
                  relative w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500
                  rounded-full shadow-lg transition-all duration-300
                  ${isWatching ? "scale-105" : "scale-100"}
                `}
              >
                {/* Simple face for secondary character */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-2xl">
                    {characterMood === "sleeping"
                      ? "😴"
                      : characterMood === "excited"
                        ? "🤗"
                        : characterMood === "wink"
                          ? "😉"
                          : "😊"}
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-black/10 rounded-full blur-sm" />
            </div>
          </div>

          {/* Character message */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 max-w-sm">
            <p className="text-sm text-slate-600 text-center lg:text-left">
              {characterMood === "sleeping" &&
                "🌙 Don&apos;t leave me waiting... I&apos;m getting sleepy!"}
              {characterMood === "happy" &&
                "😊 Great to see you! Let&apos;s get you signed in."}
              {characterMood === "excited" &&
                "🎉 Awesome! I can tell you&apos;re almost there!"}
              {characterMood === "wink" &&
                "😉 Good job keeping your password secure!"}
            </p>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex-1 max-w-md w-full">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm card-hover">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-center">
                Sign In
              </CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pb-4">
                {errors.general && (
                  <div
                    className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                    role="alert"
                  >
                    {errors.general}
                  </div>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium flex items-center gap-2"
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
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className={`h-11 ${errors.email ? "border-destructive focus:ring-destructive/20" : ""}`}
                    disabled={isLoading}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p
                      id="email-error"
                      className="text-sm text-destructive flex items-center gap-1"
                      role="alert"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium flex items-center gap-2"
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
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      className={`h-11 pr-10 ${errors.password ? "border-destructive focus:ring-destructive/20" : ""}`}
                      disabled={isLoading}
                      aria-describedby={
                        errors.password ? "password-error" : undefined
                      }
                      aria-invalid={!!errors.password}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-11 w-11 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={handlePasswordToggle}
                      disabled={isLoading}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
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
                      className="text-sm text-destructive flex items-center gap-1"
                      role="alert"
                    >
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
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
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Remember me
                    </Label>
                  </div>
                  <Link
                    href="/auth/reset-password"
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
              </CardContent>

              <CardFooter className="space-y-4">
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium btn-hover-primary"
                  disabled={isLoading}
                  aria-describedby={isLoading ? "loading-status" : undefined}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div
                        id="loading-status"
                        className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"
                        role="status"
                        aria-label="Loading"
                      ></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </div>
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth/register"
                    className="text-primary hover:underline font-medium"
                  >
                    Create account
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>

          {/* Demo credentials notice */}
          <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Demo Account:</strong> Use any email and password (min. 6
              characters) to access the dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
