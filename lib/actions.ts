"use server";

import { z } from "zod";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { auth, signIn } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signUpSchema } from "./validation-schema";
import { addMonths } from "date-fns";
import { CreateLoanData, Loan, LoanStatus } from "@/types";
import { generatePaymentSchedule, sanitizeLoan } from "./utils";

export type SignUpFormType = z.infer<typeof signUpSchema>;

export async function signUp(prevState: unknown, formData: FormData) {
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
    const res = await signIn("credentials", {
      email: validatedFields.email,
      password: validatedFields.password,
      redirect: false,
    });

    if (res?.error) {
      return { error: "Invalid credentials" };
    }
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    return { error: "Something went wrong during signup" };
  }
  redirect("/loans/create");
}

export async function createLoan(data: CreateLoanData) {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("Unauthorized: You must be logged in to create a loan.");
  }

  const borrowerId = session.user.id;

  const loanSchema = z.object({
    amount: z.number().min(1, "Amount must be greater than 0"),
    interestRate: z.number().min(0).max(100, "Invalid interest rate"),
    termMonths: z.number().min(1).max(360, "Invalid term duration"),
    startDate: z.date(),
    collateral: z.string().optional(),
    riskRating: z.number().optional(),
    notes: z.string().optional(),
  });

  const parsedData = loanSchema.safeParse(data);
  if (!parsedData.success) {
    throw new Error("Invalid loan data.");
  }
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
      status: "PENDING" as LoanStatus,
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
          connect: { id: borrowerId },
        },
        ...preSave,
      },
    });

    revalidatePath("/loans");
    return sanitizeLoan(loan as unknown as Loan);
  } catch (error) {
    console.error("Error creating loan:", error);
    throw new Error("Failed to create loan");
  }
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

    const session = await auth();

    if (!session || !session.user) {
      throw new Error("Unauthorized: You must be logged in");
    }

    userId = session.user.id as string;

    let where:
      | {
          OR: (
            | {
                lenderId: string;
              }
            | {
                borrowerId: string;
              }
          )[];
        }
      | undefined;

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
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    })) as unknown as Loan[];

    const totalLoans = await prisma.loan.count({
      where: {
        OR: [{ lenderId: userId }, { borrowerId: userId }],
      },
    });

    const loans = rawLoans.map((loan: Loan) =>
      sanitizeLoan(loan)
    ) as unknown as Loan[];

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
      orderBy: {
        createdAt: "desc",
      },
    })) as unknown as Loan[];

    const totalLoans = await prisma.loan.count({
      where: {
        lenderId: null,
        status: "PENDING",
      },
    });

    const loans = rawLoans.map((loan: unknown) =>
      sanitizeLoan(loan as unknown as Loan)
    ) as Loan[];

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
    const session = await auth();

    if (!session || !session.user) {
      throw new Error("Unauthorized: You must be logged in");
    }

    const userId = session.user.id as string;
    const loan = (await prisma.loan.update({
      where: { id: data.loanId },
      data: {
        lenderId: userId,
        status: "APPROVED",
      },
    })) as unknown as Loan;

    revalidatePath(`/loans/${data.loanId}`);
    return sanitizeLoan(loan) as unknown as Loan;
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
    const session = await auth();

    if (!session || !session.user) {
      throw new Error("Unauthorized: You must be logged in");
    }

    const userId = session.user.id as string;
    const loan = (await prisma.loan.update({
      where: { id: data.loanId, borrowerId: userId },
      data: {
        status: data.status as unknown as LoanStatus,
      },
    })) as unknown as Loan;

    if (!loan) {
      throw new Error("Invalid Data");
    }

    revalidatePath(`/loans/${data.loanId}`);
    return sanitizeLoan(loan) as unknown as Loan;
  } catch (error) {
    console.error("Error updating loan status:", error);
    throw new Error("Failed to update loan status");
  }
}

export async function getLoanById(id: string): Promise<Loan> {
  try {
    const session = await auth();

    if (!session || !session.user) {
      throw new Error("Unauthorized: You must be logged in");
    }
    const loan = (await prisma.loan.findUnique({
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
    })) as unknown as Loan;

    if (!loan) {
      throw new Error("Invalid Data");
    }

    return sanitizeLoan(loan) as unknown as Loan;
  } catch (error) {
    console.error("Error fetching loan:", error);
    throw new Error("Failed to fetch loan");
  }
}
