'use client';

/**
 * Leave Request Form Component
 * T-009: Leave request submission with validation
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, differenceInBusinessDays, addDays } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Form schema
const leaveFormSchema = z.object({
  leave_type_id: z.string({
    required_error: 'Please select a leave type',
  }),
  start_date: z.date({
    required_error: 'Start date is required',
  }),
  end_date: z.date({
    required_error: 'End date is required',
  }),
  reason: z.string().optional(),
}).refine(
  (data) => data.end_date >= data.start_date,
  {
    message: 'End date must be after or equal to start date',
    path: ['end_date'],
  }
);

type LeaveFormValues = z.infer<typeof leaveFormSchema>;

interface LeaveType {
  id: string;
  name: string;
  annual_quota: number;
}

interface LeaveRequestFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function LeaveRequestForm({ onSuccess, onCancel }: LeaveRequestFormProps) {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [workingDays, setWorkingDays] = useState(0);

  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveFormSchema),
  });

  // Fetch leave types
  useEffect(() => {
    async function fetchLeaveTypes() {
      try {
        const response = await fetch('/api/leave-types');
        if (response.ok) {
          const data = await response.json();
          setLeaveTypes(data.leave_types || []);
        }
      } catch (error) {
        console.error('Error fetching leave types:', error);
      }
    }
    fetchLeaveTypes();
  }, []);

  // Calculate working days when dates change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'start_date' || name === 'end_date') {
        const { start_date, end_date } = value;
        if (start_date && end_date) {
          const days = differenceInBusinessDays(
            addDays(end_date, 1),
            start_date
          );
          setWorkingDays(Math.max(0, days));
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  async function onSubmit(data: LeaveFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leave_type_id: data.leave_type_id,
          start_date: data.start_date.toISOString(),
          end_date: data.end_date.toISOString(),
          days_count: workingDays,
          reason: data.reason,
        }),
      });

      if (response.ok) {
        form.reset();
        onSuccess?.();
      } else {
        const error = await response.json();
        form.setError('root', {
          message: error.error || 'Failed to submit leave request',
        });
      }
    } catch (error) {
      form.setError('root', {
        message: 'An error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl glass-card">
      <CardHeader>
        <CardTitle>New Leave Request</CardTitle>
        <CardDescription>
          Submit a leave request for approval
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Leave Type */}
            <FormField
              control={form.control}
              name="leave_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} ({type.annual_quota} days/year)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date */}
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
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
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm font-medium">
                  Duration: <span className="text-lg font-bold">{workingDays}</span> working days
                </p>
              </div>
            )}

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide a reason for your leave request..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This information helps managers process your request
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Error Message */}
            {form.formState.errors.root && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {form.formState.errors.root.message}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
