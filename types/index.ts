export type LoanStatus =
  | "PENDING"
  | "APPROVED"
  | "ACTIVE"
  | "COMPLETED"
  | "DEFAULTED";

export interface Loan {
  id: string;
  borrowerId: string;
  borrowerName?: string;
  borrower?: { name: string | null; image: string | null };
  amount: string;
  interestRate: string;
  termMonths: string;
  startDate: Date;
  endDate: Date;
  status: LoanStatus;
  monthlyPayment: string;
  totalPaid: string;
  lateFees: string;
  outstandingBalance: string;
  lenderId: string;
  lenderName?: string;
  lender?: { name: string | null; image: string | null };
  paymentSchedule?: {
    paymentNumber: number;
    dueDate: string;
    payment: number;
    principal: number;
    interest: number;
    remainingBalance: number;
  }[];
  notes?: string;
}

export interface CreateLoanData {
  purpose: string;
  borrowerId: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  startDate: Date;
  collateral?: string;
  riskRating?: number;
  description: string;
  notes?: string;
  monthlyPayment: number;
}
