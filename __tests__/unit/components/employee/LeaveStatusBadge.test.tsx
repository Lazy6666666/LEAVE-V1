import { render, screen } from "@testing-library/react";
import { LeaveStatusBadge } from "@/components/employee/LeaveStatusBadge";

describe("LeaveStatusBadge", () => {
  describe("renders correctly for each status", () => {
    it("renders PENDING status with correct styling and icon", () => {
      render(<LeaveStatusBadge status="PENDING" />);
      const badge = screen.getByText("Pending");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("bg-yellow-500/20", "text-yellow-700");
    });

    it("renders APPROVED status with correct styling and icon", () => {
      render(<LeaveStatusBadge status="APPROVED" />);
      const badge = screen.getByText("Approved");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("bg-green-500/20", "text-green-700");
    });

    it("renders REJECTED status with correct styling and icon", () => {
      render(<LeaveStatusBadge status="REJECTED" />);
      const badge = screen.getByText("Rejected");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("bg-red-500/20", "text-red-700");
    });

    it("renders CANCELLED status with correct styling and icon", () => {
      render(<LeaveStatusBadge status="CANCELLED" />);
      const badge = screen.getByText("Cancelled");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("bg-gray-500/20", "text-gray-700");
    });
  });

  describe("custom className", () => {
    it("applies custom className in addition to default classes", () => {
      render(<LeaveStatusBadge status="PENDING" className="custom-class" />);
      const badge = screen.getByText("Pending");
      expect(badge).toHaveClass("custom-class");
      expect(badge).toHaveClass("bg-yellow-500/20"); // Default class should still be present
    });
  });

  describe("accessibility", () => {
    it("has appropriate icon for each status", () => {
      const { rerender } = render(<LeaveStatusBadge status="PENDING" />);
      expect(screen.getByText("Pending")).toBeInTheDocument();

      rerender(<LeaveStatusBadge status="APPROVED" />);
      expect(screen.getByText("Approved")).toBeInTheDocument();

      rerender(<LeaveStatusBadge status="REJECTED" />);
      expect(screen.getByText("Rejected")).toBeInTheDocument();

      rerender(<LeaveStatusBadge status="CANCELLED" />);
      expect(screen.getByText("Cancelled")).toBeInTheDocument();
    });
  });

  describe("badge structure", () => {
    it("renders as a Badge component with flex layout", () => {
      render(<LeaveStatusBadge status="PENDING" />);
      const badge = screen.getByText("Pending").parentElement;
      expect(badge).toHaveClass("flex", "items-center", "gap-1.5");
    });
  });
});
