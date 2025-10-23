"use client";

/**
 * Enhanced Leave Request Form Component
 * Multi-step form with validation, balance checking, file upload, and glassmorphism design
 */

import { useState, useEffect, useCallback } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
// Optimized lucide-react imports for tree-shaking
import {
  Calendar as CalendarIcon,
  Upload,
  X,
  FileText,
  User,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Info,
  Phone,
  Mail,
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
} from "./leave-form-types";
import {
  leaveFormCompleteSchema,
  leaveTypeAndDatesSchema,
  reasonSchema,
  emergencyContactSchema,
} from "./leave-form-validation";
import {
  calculateWorkingDays,
  formatDateRange,
  formatFileSize,
  generateFileId,
  formatLeaveType,
  getLeaveDurationText,
  getBalanceStatus,
  formatEmergencyContact,
} from "./leave-form-utils";

interface LeaveRequestFormProps {
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

export function LeaveRequestForm({
  onSuccess,
  onCancel,
}: LeaveRequestFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [conflicts, setConflicts] = useState<ConflictInfo | null>(null);
  const [workingDays, setWorkingDays] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
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

  // Fetch leave types and balances
  useEffect(() => {
    async function fetchLeaveData() {
      try {
        // Fetch leave types
        const leaveTypesResponse = await fetch("/api/leave-types");
        if (leaveTypesResponse.ok) {
          const data = await leaveTypesResponse.json();
          setLeaveTypes(data.leave_types || []);
        }

        // Fetch leave balances
        const balancesResponse = await fetch("/api/leaves/balance");
        if (balancesResponse.ok) {
          const data = await balancesResponse.json();
          setLeaveBalances(data.balances || []);
        }
      } catch (error) {
        console.error("Error fetching leave data:", error);
      }
    }
    fetchLeaveData();
  }, []);

  // Calculate working days and check conflicts when dates change
  useEffect(() => {
    const [, start_date, end_date] = watchedValues;
    if (start_date && end_date && start_date <= end_date) {
      const days = calculateWorkingDays(start_date, end_date);
      setWorkingDays(days);

      // Check for conflicts (mock data for now)
      async function checkConflicts() {
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
      }
      checkConflicts();
    }
  }, [watchedValues]);

  // Update step validation status
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

  // File upload functionality will be handled by the DocumentUploadForm component

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
    const currentAttachments = form.getValues("attachments") || [];
    form.setValue(
      "attachments",
      currentAttachments.filter((file) => file.id !== fileId)
    );
  };

  // Form submission
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

  // Get current leave balance
  const currentLeaveBalance = leaveBalances.find(
    (balance) => balance.leave_type_id === form.watch("leave_type_id")
  );

  // Calculate progress
  const progress = ((currentStep + 1) / FORM_STEPS.length) * 100;

  return (
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
              {/* Step 1: Leave Type & Dates */}
              {currentStep === 0 && (
                <div className="space-y-6">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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

                  {/* Duration Display */}
                  {workingDays > 0 && (
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium">
                          Duration: {getLeaveDurationText(workingDays)}
                        </div>
                        {currentLeaveBalance && (
                          <div
                            className={cn(
                              "text-sm mt-1",
                              getBalanceStatus(
                                workingDays,
                                currentLeaveBalance.available_days
                              ).color
                            )}
                          >
                            {
                              getBalanceStatus(
                                workingDays,
                                currentLeaveBalance.available_days
                              ).message
                            }
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Conflicts Display */}
                  {conflicts?.has_conflicts && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium mb-2">
                          Potential conflicts detected:
                        </div>
                        <ul className="space-y-1 text-sm">
                          {conflicts.conflicts
                            .slice(0, 3)
                            .map((conflict, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <span className="w-2 h-2 bg-warning rounded-full"></span>
                                {conflict.description}
                              </li>
                            ))}
                          {conflicts.conflicts.length > 3 && (
                            <li className="text-muted-foreground">
                              ...and {conflicts.conflicts.length - 3} more
                            </li>
                          )}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Step 2: Reason */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Reason for Leave
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Please provide a detailed reason for your leave request.
                      This helps your manager understand your situation and
                      process the request faster.
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
              )}

              {/* Step 3: Emergency Contact */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Emergency Contact
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Provide emergency contact information that can be reached
                      during your absence.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="emergency_contact.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Contact Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter contact name"
                              className="modern-input"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergency_contact.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Phone Number
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+1 (555) 123-4567"
                              className="modern-input"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergency_contact.email"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="contact@example.com"
                              className="modern-input"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      This information will only be used in case of emergency
                      during your leave period.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Step 4: Attachments */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Supporting Documents
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Upload any supporting documents for your leave request.
                      This step is optional but can help expedite the approval
                      process.
                    </p>
                  </div>

                  {/* File Upload Area */}
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                      "border-muted-foreground/25 hover:border-primary/50"
                    )}
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                  >
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const newFiles = files.map((file) => ({
                          id: generateFileId(),
                          name: file.name,
                          size: file.size,
                          type: file.type,
                          file,
                        }));
                        setUploadedFiles((prev) => [...prev, ...newFiles]);
                        form.setValue("attachments", [
                          ...(form.getValues("attachments") || []),
                          ...newFiles,
                        ]);
                      }}
                    />
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium">
                        Click to upload files
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, Word, or image files up to 5MB each
                      </p>
                    </div>
                  </div>

                  {/* Uploaded Files */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Uploaded Files</h4>
                      <div className="space-y-2">
                        {uploadedFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm">
                                  {file.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {uploadedFiles.length === 0 && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        No files uploaded yet. This step is optional, but
                        supporting documents can help with your leave approval.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Step 5: Review & Submit */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Review & Submit
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Please review your leave request details before
                      submitting.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Leave Details */}
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                          Leave Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Leave Type:
                          </span>
                          <span className="font-medium">
                            {
                              leaveTypes.find(
                                (t) => t.id === form.watch("leave_type_id")
                              )?.name
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Duration:
                          </span>
                          <span className="font-medium">
                            {formatDateRange(
                              form.watch("start_date"),
                              form.watch("end_date")
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Working Days:
                          </span>
                          <span className="font-medium">
                            {getLeaveDurationText(workingDays)}
                          </span>
                        </div>
                        {currentLeaveBalance && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Remaining Balance:
                            </span>
                            <span
                              className={cn(
                                "font-medium",
                                getBalanceStatus(
                                  workingDays,
                                  currentLeaveBalance.available_days
                                ).color
                              )}
                            >
                              {currentLeaveBalance.available_days} days
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Reason */}
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Reason</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed">
                          {form.watch("reason") || "No reason provided"}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Emergency Contact */}
                    <Card className="bg-muted/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                          Emergency Contact
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">
                          {formatEmergencyContact(
                            form.watch("emergency_contact") || {
                              name: "",
                              phone: "",
                              email: "",
                            }
                          )}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Attachments */}
                    {uploadedFiles.length > 0 && (
                      <Card className="bg-muted/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">
                            Attachments
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {uploadedFiles.map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center gap-2 text-sm"
                              >
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span>{file.name}</span>
                                <span className="text-muted-foreground">
                                  ({formatFileSize(file.size)})
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Submission Warning */}
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        By submitting this leave request, you confirm that all
                        provided information is accurate. Your request will be
                        sent to your manager for approval.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              )}

              {/* Form Error */}
              {form.formState.errors.root && (
                <Alert className="mt-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-destructive">
                    {form.formState.errors.root.message}
                  </AlertDescription>
                </Alert>
              )}
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
  );
}
