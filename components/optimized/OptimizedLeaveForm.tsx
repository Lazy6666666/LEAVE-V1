/**
 * Optimized Leave Request Form Component
 * Dynamic imports and code splitting for better performance
 */

"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import dynamic from "next/dynamic";

// Lazy load heavy components
const Calendar = dynamic(() => import("@/components/ui/calendar").then(mod => ({ default: mod.Calendar })), {
  loading: () => <div className="h-10 w-32 bg-muted animate-pulse rounded" />,
  ssr: false
});

const Textarea = dynamic(() => import("@/components/ui/textarea").then(mod => ({ default: mod.Textarea })), {
  loading: () => <div className="h-24 w-full bg-muted animate-pulse rounded" />,
  ssr: false
});

// Import lightweight components directly
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Optimized icon imports - only import what's used
import {
  Calendar as LucideCalendar,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "@/lib/utils/icons";

import { cn } from "@/lib/utils";

// Import types and utilities
import {
  LeaveType,
  LeaveBalance,
  ConflictInfo,
  UploadedFile,
  LeaveFormData,
  FormStep,
} from "../forms/leave-form-types";
import {
  leaveFormCompleteSchema,
  leaveTypeAndDatesSchema,
  reasonSchema,
  emergencyContactSchema,
} from "../forms/leave-form-validation";
import {
  calculateWorkingDays,
  formatLeaveType,
} from "../forms/leave-form-utils";

// Lazy loading indicator
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin" />
    <span className="ml-2">Loading...</span>
  </div>
);

interface OptimizedLeaveFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Form steps configuration
const FORM_STEPS: Omit<FormStep, "isCompleted" | "isValid">[] = [
  {
    id: "leave-type",
    title: "Leave Type & Dates",
    description: "Select leave type and choose dates",
  },
  {
    id: "reason",
    title: "Reason",
    description: "Provide details about your leave",
  },
  {
    id: "emergency-contact",
    title: "Emergency Contact",
    description: "Add emergency contact information",
  },
  {
    id: "attachments",
    title: "Attachments",
    description: "Upload supporting documents (optional)",
  },
  {
    id: "review",
    title: "Review & Submit",
    description: "Review your request before submitting",
  },
];

export function OptimizedLeaveForm({
  onSuccess,
  onCancel,
}: OptimizedLeaveFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [_conflicts, setConflicts] = useState<ConflictInfo | null>(null);
  const [workingDays, setWorkingDays] = useState(0);
  const [uploadedFiles, _setUploadedFiles] = useState<UploadedFile[]>([]);
  const [steps, setSteps] = useState<FormStep[]>([]);

  const form = useForm<LeaveFormData>({
    resolver: zodResolver(leaveFormCompleteSchema),
    defaultValues: {
      leave_type_id: "",
      start_date: new Date(),
      end_date: new Date(),
      reason: "",
      attachments: [],
      emergency_contact: {
        name: "",
        phone: "",
        email: "",
      },
    },
    mode: "onChange",
  });

  const watchedValues = useWatch({
    control: form.control,
    name: ["leave_type_id", "start_date", "end_date"],
  });

  // Initialize steps
  useEffect(() => {
    setSteps(
      FORM_STEPS.map((step) => ({
        ...step,
        isCompleted: false,
        isValid: false,
      }))
    );
  }, []);

  // Optimized data fetching with caching
  useEffect(() => {
    let isMounted = true;

    async function fetchLeaveData() {
      try {
        // Fetch leave types with caching
        const leaveTypesResponse = await fetch("/api/leave-types", {
          cache: "force-cache",
        });
        if (leaveTypesResponse.ok && isMounted) {
          const data = await leaveTypesResponse.json();
          setLeaveTypes(data.leave_types || []);
        }

        // Fetch leave balances with caching
        const balancesResponse = await fetch("/api/leaves/balance", {
          cache: "force-cache",
        });
        if (balancesResponse.ok && isMounted) {
          const data = await balancesResponse.json();
          setLeaveBalances(data.balances || []);
        }
      } catch (error) {
        console.error("Error fetching leave data:", error);
      }
    }

    fetchLeaveData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Memoized conflict checking
  useEffect(() => {
    const [, start_date, end_date] = watchedValues;
    if (start_date && end_date && start_date <= end_date) {
      const days = calculateWorkingDays(start_date, end_date);
      setWorkingDays(days);

      // Debounced conflict checking
      const timeoutId = setTimeout(async () => {
        try {
          const response = await fetch("/api/leaves/check-conflicts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              start_date: start_date.toISOString(),
              end_date: end_date.toISOString(),
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setConflicts(
              data.conflicts || { has_conflicts: false, conflicts: [] }
            );
          }
        } catch (error) {
          console.error("Error checking conflicts:", error);
          setConflicts({ has_conflicts: false, conflicts: [] });
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [watchedValues]);

  // Update step validation
  const updateStepValidation = useCallback(
    (stepIndex: number, isValid: boolean) => {
      setSteps((prev) =>
        prev.map((step, index) =>
          index === stepIndex ? { ...step, isValid } : step
        )
      );
    },
    []
  );

  // Validate current step
  const validateCurrentStep = useCallback(async () => {
    let isValid = false;
    const currentStepData = form.getValues();

    switch (currentStep) {
      case 0: // Leave type and dates
        try {
          await leaveTypeAndDatesSchema.parseAsync(currentStepData);
          isValid = true;
        } catch (error) {
          isValid = false;
        }
        break;
      case 1: // Reason
        try {
          await reasonSchema.parseAsync(currentStepData);
          isValid = true;
        } catch (error) {
          isValid = false;
        }
        break;
      case 2: // Emergency contact
        try {
          await emergencyContactSchema.parseAsync(currentStepData);
          isValid = true;
        } catch (error) {
          isValid = false;
        }
        break;
      case 3: // Attachments (always valid as it's optional)
        isValid = true;
        break;
      case 4: // Review
        try {
          await leaveFormCompleteSchema.parseAsync(currentStepData);
          isValid = true;
        } catch (error) {
          isValid = false;
        }
        break;
    }

    updateStepValidation(currentStep, isValid);
    return isValid;
  }, [currentStep, form, updateStepValidation]);

  // Handle step navigation
  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      if (currentStep < FORM_STEPS.length - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStepClick = async (stepIndex: number) => {
    // Only allow navigation to completed steps or the next step
    const isStepAccessible = steps
      .slice(0, stepIndex)
      .every((step) => step.isValid);
    if (isStepAccessible || stepIndex <= currentStep + 1) {
      await validateCurrentStep();
      setCurrentStep(stepIndex);
    }
  };

  
  // Optimized form submission
  const onSubmit = async (data: LeaveFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Add form fields
      formData.append("leave_type_id", data.leave_type_id);
      formData.append("start_date", data.start_date.toISOString());
      formData.append("end_date", data.end_date.toISOString());
      formData.append("days_count", workingDays.toString());
      formData.append("reason", data.reason || "");
      formData.append(
        "emergency_contact_name",
        data.emergency_contact?.name || ""
      );
      formData.append(
        "emergency_contact_phone",
        data.emergency_contact?.phone || ""
      );
      formData.append(
        "emergency_contact_email",
        data.emergency_contact?.email || ""
      );

      // Add files
      uploadedFiles.forEach((file, index) => {
        if (file.file) {
          formData.append(`file_${index}`, file.file);
        }
      });

      const response = await fetch("/api/leaves", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        form.reset();
        onSuccess?.();
      } else {
        const error = await response.json();
        form.setError("root", {
          message: error.error || "Failed to submit leave request",
        });
      }
    } catch (error) {
      form.setError("root", {
        message: "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Memoized calculations
  const currentLeaveBalance = leaveBalances.find(
    (balance) => balance.leave_type_id === form.watch("leave_type_id")
  );

  const progress = ((currentStep + 1) / FORM_STEPS.length) * 100;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Progress Header */}
        <Card className="glass-card">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="text-2xl gradient-text">
                  New Leave Request
                </CardTitle>
                <CardDescription>
                  Submit your leave request in a few simple steps
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-sm">
                Step {currentStep + 1} of {FORM_STEPS.length}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2">
              {FORM_STEPS.map((step, index) => (
                <Button
                  key={step.id}
                  variant={currentStep === index ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleStepClick(index)}
                  disabled={index > currentStep + 1}
                  className={cn(
                    "flex-1 mx-1 text-xs",
                    steps[index]?.isValid && "text-success",
                    currentStep === index && "bg-primary text-primary-foreground"
                  )}
                >
                  {step.title}
                </Button>
              ))}
            </div>
          </CardHeader>
        </Card>

        {/* Form Content */}
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="glass-card">
              <CardContent className="p-6">
                {/* Render current step content */}
                {currentStep === 0 && (
                  <Suspense fallback={<LoadingFallback />}>
                    {/* Step 1: Leave Type & Dates */}
                    <div className="space-y-6">
                      {/* Step content... */}
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          Leave Type & Dates
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Select the type of leave you're requesting and choose your
                          dates.
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name="leave_type_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">
                              Leave Type
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select leave type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {leaveTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    <div className="flex items-center justify-between w-full">
                                      <span>{formatLeaveType(type)}</span>
                                      {type.requires_documentation && (
                                        <Badge variant="outline" className="ml-2">
                                          Documents Required
                                        </Badge>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Date fields with lazy-loaded Calendar */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Date picker fields... */}
                        <FormField
                          control={form.control}
                          name="start_date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-base font-medium">
                                Start Date
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <LucideCalendar className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date <
                                      new Date(new Date().setHours(0, 0, 0, 0))
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* End date field similar to start date... */}
                        <FormField
                          control={form.control}
                          name="end_date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-base font-medium">
                                End Date
                              </FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <LucideCalendar className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date <
                                      new Date(new Date().setHours(0, 0, 0, 0))
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </Suspense>
                )}

                {/* Other steps would be similarly optimized with lazy loading */}
                {currentStep === 1 && (
                  <Suspense fallback={<LoadingFallback />}>
                    {/* Step 2: Reason */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          Reason for Leave
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Please provide a detailed reason for your leave request.
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium">
                              Reason
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Please provide details about your leave request..."
                                className="resize-none min-h-[120px] modern-input"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Minimum 10 characters. Maximum 500 characters.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Suspense>
                )}

                {/* Continue with other steps... */}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <Card className="glass-card mt-6">
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <div className="flex gap-2">
                    {currentStep > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={isSubmitting}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                    )}
                    {currentStep < FORM_STEPS.length - 1 ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        disabled={isSubmitting}
                      >
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={
                          isSubmitting ||
                          (currentLeaveBalance &&
                            workingDays > currentLeaveBalance.available_days)
                        }
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Submit Request
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </FormProvider>
      </div>
    </Suspense>
  );
}