export type Loan = {
  id: string;
  borrowerId: string;
  borrowerName?: string;
  borrower?: { name: string; image: string };
  amount: string;
  interestRate: string;
  termMonths: string;
  startDate: Date;
  endDate: Date;
  status: "PENDING" | "APPROVED" | "ACTIVE" | "COMPLETED" | "DEFAULTED";
  monthlyPayment: string;
  totalPaid: string;
  lateFees: string;
  outstandingBalance: string;
  lenderId: string;
  lenderName?: string;
  lender?: { name: string; image: string };
  paymentSchedule?: {
    paymentNumber: number;
    dueDate: string;
    payment: number;
    principal: number;
    interest: number;
    remainingBalance: number;
  }[];
  notes?: string;
};

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

export const statusColors = {
  PENDING: "bg-yellow-500",
  APPROVED: "bg-blue-500",
  ACTIVE: "bg-green-500",
  COMPLETED: "bg-gray-500",
  DEFAULTED: "bg-red-500",
} as const;
