'use client';

/**
 * New Leave Request Page
 * Uses the LeaveRequestForm component
 */

import { LeaveRequestForm } from '@/components/forms/LeaveRequestForm';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NewLeaveRequestPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/employee/leaves');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Link href="/employee/leaves">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Leaves
          </Button>
        </Link>
      </div>

      <div className="flex justify-center">
        <LeaveRequestForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
