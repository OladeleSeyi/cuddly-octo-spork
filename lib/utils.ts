import { Loan } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sanitizeLoan = (loan: Loan) => ({
  ...loan,
  amount: loan.amount.toString(),
  interestRate: loan.interestRate.toString(),
  termMonths: loan.termMonths.toString(),
  monthlyPayment: loan.monthlyPayment.toString(),
  totalPaid: loan.totalPaid.toString(),
  outstandingBalance: loan.outstandingBalance.toString(),
  lateFees: loan.lateFees.toString(),
  borrowerName: loan.borrower?.name,
  paymentSchedule: loan.paymentSchedule?.map((schedule) => ({
    ...schedule,
    payment: Number(schedule.payment),
    principal: Number(schedule.principal),
    interest: Number(schedule.interest),
    remainingBalance: Number(schedule.remainingBalance),
  })),
});

export function createAvatarFallback(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}
