import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getLoanById } from "@/lib/actions";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Loan } from "@/types";
import { BorrowerInfo } from "@/components/borrower-information";
import { LoanPaymentInfo } from "@/components/loan-payment-info";
import { LoanDescription } from "@/components/loan-description";

export default async function LoanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const statusColors = {
    PENDING: "bg-yellow-500",
    APPROVED: "bg-blue-500",
    ACTIVE: "bg-green-500",
    COMPLETED: "bg-gray-500",
    DEFAULTED: "bg-red-500",
  } as const;

  const session = await auth();
  const { id } = await params;

  if (!session) {
    redirect("/login");
  }

  const loan: Loan = await getLoanById(id);

  if (!loan) {
    notFound();
  }

  const canView =
    loan.lenderId === null ||
    loan.borrowerId === session?.user?.id ||
    loan.lenderId === session?.user?.id;

  if (!canView) {
    redirect("/loans");
  }

  const isLender = session?.user?.id === loan.lenderId;
  const isBorrower = session?.user?.id === loan.borrowerId;
  const canAcceptLoan = !loan.lenderId && !isBorrower;

  return (
    <div className="container py-10">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Loan Details</h1>
            <p className="text-muted-foreground">
              View and manage loan information
            </p>
          </div>
          <Badge className={statusColors[loan.status]}>
            {loan.status.replace(/_/g, " ")}
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <LoanDescription
            loan={loan}
            isLender={isLender}
            userId={session?.user?.id as string}
            canAcceptLoan={canAcceptLoan}
          />
          <BorrowerInfo loan={loan} />
        </div>

        <LoanPaymentInfo loan={loan} />
      </div>
    </div>
  );
}
