"use client";

/**
 * New Leave Request Page
 * Uses the LeaveRequestForm component
 */

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Lazy load the optimized leave form component
const OptimizedLeaveForm = dynamic(
  () =>
    import("@/components/optimized/OptimizedLeaveForm").then((mod) => ({
      default: mod.OptimizedLeaveForm,
    })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading form...</span>
      </div>
    ),
    ssr: false,
  }
);

// Load icon separately for minimal bundle impact
const ArrowLeft = dynamic(
  () => import("lucide-react").then((mod) => ({ default: mod.ArrowLeft })),
  {
    ssr: false,
  }
);

export default function NewLeaveRequestPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/employee/leaves");
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/employee/leaves">
            {ArrowLeft && <ArrowLeft className="h-4 w-4 mr-2" />}
            Back to My Leaves
          </Link>
        </Button>
      </div>

      <div className="flex justify-center">
        <OptimizedLeaveForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
}
