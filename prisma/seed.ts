import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Ensure the user exists
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      name: "Test User",
    },
  });

  console.log({ user });

  // Create another user for lending/borrowing purposes
  const otherUser = await prisma.user.upsert({
    where: { email: "otheruser@example.com" },
    update: {},
    create: {
      email: "otheruser@example.com",
      name: "Other User",
    },
  });

  console.log({ otherUser });

  // Create 3 loans where the user is the borrower
  for (let i = 1; i <= 3; i++) {
    await prisma.loan.create({
      data: {
        borrowerId: user.id,
        lenderId: otherUser.id,
        amount: 1000 * i,
        interestRate: 5 + i,
        termMonths: 12,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)),
        status: "PENDING",
        outstandingBalance: 1000 * i,
        monthlyPayment: (1000 * i) / 12,
      },
    });
  }

  for (let i = 1; i <= 3; i++) {
    await prisma.loan.create({
      // @ts-ignore
      data: {
        borrower: {
          connect: { id: user.id },
        },
        amount: 1000 * i,
        interestRate: 5 + i,
        termMonths: 12,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)),
        status: "PENDING",
        outstandingBalance: 1000 * i,
        monthlyPayment: (1000 * i) / 12,
      },
    });
  }

  // Create 2 loans where the user is the lender
  for (let i = 1; i <= 2; i++) {
    await prisma.loan.create({
      data: {
        borrowerId: otherUser.id,
        lenderId: user.id,
        amount: 2000 * i,
        interestRate: 4 + i,
        termMonths: 24,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 24)),
        status: "APPROVED",
        outstandingBalance: 2000 * i,
        monthlyPayment: (2000 * i) / 24,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
