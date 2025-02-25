"use server";

import { z } from "zod";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signUpSchema } from "./validation-schema";
import { addMonths } from "date-fns";
import { CreateLoanData, Loan } from "@/types";
import { sanitizeLoan } from "./utils";

export type SignUpFormType = z.infer<typeof signUpSchema>;

export async function signUp(prevState: any, formData: FormData) {
  try {
    const validatedFields = signUpSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedFields.email },
    });

    if (existingUser) {
      return { error: "User with this email already exists" };
    }

    const hashedPassword = await hash(validatedFields.password, 10);

    await prisma.user.create({
      data: {
        name: validatedFields.name,
        email: validatedFields.email,
        password: hashedPassword,
      },
    });

    // Sign in the user
    try {
      await signIn("credentials", {
        email: validatedFields.email,
        password: validatedFields.password,
        redirect: false,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case "CredentialsSignin":
            return { error: "Invalid credentials" };
          default:
            return { error: "Something went wrong" };
        }
      }
      throw error;
    }

    redirect("/dashboard");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }

    return { error: "Something went wrong" };
  }
}

export async function createLoan(data: CreateLoanData) {
  try {
    const endDate = addMonths(data.startDate, data.termMonths);

    const paymentSchedule = generatePaymentSchedule(
      data.amount,
      data.interestRate,
      data.termMonths,
      data.startDate
    );

    const preSave = {
      amount: data.amount,
      interestRate: data.interestRate,
      termMonths: data.termMonths,
      startDate: data.startDate,
      endDate: endDate,
      status: "PENDING",
      outstandingBalance: data.amount,
      monthlyPayment: data.monthlyPayment,
      totalPaid: 0,
      lateFees: 0,
      collateral: data.collateral,
      riskRating: data.riskRating,
      notes: data.notes,
      paymentSchedule: paymentSchedule || {},
    };

    const loan = await prisma.loan.create({
      data: {
        borrower: {
          connect: { id: data.borrowerId },
        },
        ...preSave,
      },
    });

    revalidatePath("/loans");
    return loan;
  } catch (error) {
    console.error("Error creating loan:", error);
    throw new Error("Failed to create loan");
  }
}

function generatePaymentSchedule(
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
  const schedule: any[] = [];

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

export async function getUserLoans({
  userId,
  page = 1,
  limit = 25,
}: {
  userId: string;
  page?: number;
  limit?: number;
}): Promise<{
  loans: Loan[];
  totalLoans: number;
  totalPages: number;
  currentPage: number;
}> {
  try {
    const offset = (page - 1) * limit;

    let where: any;

    if (userId) {
      where = {
        OR: [{ lenderId: userId }, { borrowerId: userId }],
      };
    }

    const rawLoans = (await prisma.loan.findMany({
      where,
      include: {
        borrower: {
          select: {
            name: true,
            image: true,
          },
        },
        lender: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      skip: offset,
      take: limit,
    })) as Loan[];

    const totalLoans = await prisma.loan.count({
      where: {
        OR: [{ lenderId: userId }, { borrowerId: userId }],
      },
    });

    const loans = rawLoans.map((loan: Loan) => ({
      ...loan,
      amount: loan.amount.toString(),
      interestRate: loan.interestRate.toString(),
      termMonths: loan.termMonths.toString(),
      monthlyPayment: loan.monthlyPayment.toString(),
      totalPaid: loan.totalPaid.toString(),
      outstandingBalance: loan.outstandingBalance.toString(),
      lateFees: loan.lateFees.toString(),
      borrowerName: loan.borrower?.name,
      lenderName: loan?.lender?.name,
    })) as Loan[];

    const result = {
      loans,
      totalLoans,
      totalPages: Math.ceil(totalLoans / limit),
      currentPage: page,
    };
    return result;
  } catch (error) {
    console.error("Error fetching loans:", error);
    throw new Error("Failed to fetch loans");
  }
}

export async function getPendingLoans({
  page = 1,
  limit = 50,
}: {
  page?: number;
  limit?: number;
}): Promise<{
  loans: Loan[];
  totalLoans: number;
  totalPages: number;
  currentPage: number;
}> {
  try {
    if (limit > 100) {
      limit = 100;
    }
    const offset = (page - 1) * limit;

    const rawLoans = (await prisma.loan.findMany({
      where: {
        lenderId: null,
        status: "PENDING",
      },
      include: {
        borrower: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      skip: offset,
      take: limit,
    })) as Loan[];

    const totalLoans = await prisma.loan.count({
      where: {
        lenderId: null,
        status: "PENDING",
      },
    });

    const loans = rawLoans.map((loan: Loan) => sanitizeLoan(loan)) as Loan[];

    const result = {
      loans,
      totalLoans,
      totalPages: Math.ceil(totalLoans / limit),
      currentPage: page,
    };
    return result;
  } catch (error) {
    console.error("Error fetching pending loans:", error);
    throw new Error("Failed to fetch pending loans");
  }
}

export async function acceptLoanRequest(data: {
  loanId: string;
  lenderId: string;
}) {
  try {
    const loan = await prisma.loan.update({
      where: { id: data.loanId },
      data: {
        lenderId: data.lenderId,
        status: "APPROVED",
      },
    });

    revalidatePath(`/loans/${data.loanId}`);
    return sanitizeLoan(loan);
  } catch (error) {
    console.error("Error accepting loan request:", error);
    throw new Error("Failed to accept loan request");
  }
}

export async function updateLoanStatus(data: {
  loanId: string;
  status: string;
}) {
  try {
    const loan = await prisma.loan.update({
      where: { id: data.loanId },
      data: {
        status: data.status,
      },
    });

    revalidatePath(`/loans/${data.loanId}`);
    return sanitizeLoan(loan);
  } catch (error) {
    console.error("Error updating loan status:", error);
    throw new Error("Failed to update loan status");
  }
}

export async function getLoanById(id: string): Promise<Loan> {
  try {
    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        borrower: {
          select: {
            name: true,
            image: true,
          },
        },
        lender: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return sanitizeLoan(loan);
  } catch (error) {
    console.error("Error fetching loan:", error);
    throw new Error("Failed to fetch loan");
  }
}
