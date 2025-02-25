import { Loan } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { addMonths } from "date-fns";

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

export function generatePaymentSchedule(
  amount: number,
  interestRate: number,
  termMonths: number,
  startDate: Date
) {
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment =
    (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  let balance = amount;
  const schedule: Record<string, string | number | Date>[] = [];

  for (let i = 0; i < termMonths; i++) {
    const interest = balance * monthlyRate;
    const principal = monthlyPayment - interest;
    balance -= principal;

    schedule.push({
      paymentNumber: i + 1,
      dueDate: addMonths(startDate, i),
      payment: monthlyPayment,
      principal: principal,
      interest: interest,
      remainingBalance: Math.max(0, balance),
    });
  }

  return schedule;
}
