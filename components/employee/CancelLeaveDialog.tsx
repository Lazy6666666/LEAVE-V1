'use client';

/**
 * Cancel Leave Dialog Component
 * T-015: Leave cancellation feature
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle } from 'lucide-react';

interface CancelLeaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
  leaveDetails: {
    leaveType: string;
    startDate: string;
    endDate: string;
    status: string;
  };
}

export function CancelLeaveDialog({
  isOpen,
  onClose,
  onConfirm,
  leaveDetails,
}: CancelLeaveDialogProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(reason || undefined);
      setReason('');
      onClose();
    } catch (error) {
      console.error('Error cancelling leave:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Cancel Leave Request
          </DialogTitle>
          <DialogDescription>
            You are about to cancel your {leaveDetails.leaveType} request from{' '}
            {leaveDetails.startDate} to {leaveDetails.endDate}.
            {leaveDetails.status === 'APPROVED' && (
              <span className="block mt-2 text-yellow-600 font-medium">
                This leave has already been approved. Cancelling it will notify your manager.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Cancellation (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="You can provide a reason for cancelling this leave request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              disabled={isSubmitting}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Keep Request
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cancel Leave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
