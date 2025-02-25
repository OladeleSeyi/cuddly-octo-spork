"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptLoanRequest, updateLoanStatus } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LoanActionsProps {
  loanId: string;
  status: string;
  isLender: boolean;
  canAccept: boolean;
  userId: string;
}

export function LoanActions({
  loanId,
  status,
  isLender,
  canAccept,
  userId,
}: LoanActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleAcceptLoan = async () => {
    setIsLoading(true);
    try {
      await acceptLoanRequest({
        loanId,
        lenderId: userId,
      });
      toast.success("Loan request accepted successfully");
      router.push("/loans/user");
    } catch {
      toast.error("Failed to accept loan request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setIsLoading(true);
    try {
      await updateLoanStatus({
        loanId,
        status: newStatus,
      });
      toast.success("Loan status updated successfully");
      router.push("/loans/user");
    } catch {
      toast.error("Failed to update loan status");
    } finally {
      setIsLoading(false);
    }
  };

  if (canAccept) {
    return (
      <Button
        className="w-full"
        onClick={handleAcceptLoan}
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Accept Loan Request
      </Button>
    );
  }

  if (isLender && status === "PENDING") {
    return (
      <>
        <Button
          className="flex-1"
          onClick={() => handleStatusUpdate("APPROVED")}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Approve
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          onClick={() => handleStatusUpdate("REJECTED")}
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reject
        </Button>
      </>
    );
  }

  return null;
}
