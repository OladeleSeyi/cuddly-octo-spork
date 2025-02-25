import { Loan } from "@/types";
import { format } from "date-fns";
import { LoanActions } from "./loan-actions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card";

export function LoanDescription({
  loan,
  canAcceptLoan,
  isLender,
  userId,
}: {
  loan: Loan;
  canAcceptLoan: boolean;
  isLender: boolean;
  userId: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Information</CardTitle>
        <CardDescription>Basic loan details and terms</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Amount
            </div>
            <div className="text-2xl font-bold">
              ${loan.amount.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Monthly Payment
            </div>
            <div className="text-2xl font-bold">
              ${loan.monthlyPayment.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Interest Rate
            </div>
            <div>{loan.interestRate}%</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Term
            </div>
            <div>{loan.termMonths} months</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              Start Date
            </div>
            <div>{format(new Date(loan.startDate), "PP")}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              End Date
            </div>
            <div>{format(new Date(loan.endDate), "PP")}</div>
          </div>
        </div>
      </CardContent>
      {(canAcceptLoan || (isLender && loan.status === "PENDING")) && (
        <CardFooter className="flex gap-2">
          <LoanActions
            loanId={loan.id}
            status={loan.status}
            isLender={isLender}
            canAccept={canAcceptLoan}
            userId={userId as string}
          />
        </CardFooter>
      )}
    </Card>
  );
}
