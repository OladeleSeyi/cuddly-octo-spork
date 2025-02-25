-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED', 'DEFAULTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "password" TEXT,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" TEXT NOT NULL,
    "lenderId" TEXT,
    "borrowerId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "interestRate" DECIMAL(5,2) NOT NULL,
    "termMonths" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "LoanStatus" NOT NULL,
    "outstandingBalance" DECIMAL(10,2) NOT NULL,
    "monthlyPayment" DECIMAL(10,2) NOT NULL,
    "totalPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "lateFees" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "collateral" TEXT,
    "paymentSchedule" JSONB,
    "riskRating" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Loan_lenderId_idx" ON "Loan"("lenderId");

-- CreateIndex
CREATE INDEX "Loan_borrowerId_idx" ON "Loan"("borrowerId");

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
