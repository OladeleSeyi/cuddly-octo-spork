import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LoansTable } from "@/components/loans-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getUserLoans } from "@/lib/actions";

export default async function LoansPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const userId = session.user?.id as string;
  const loans = await getUserLoans({ userId });

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Your Loans
          </h1>
          <p className="text-muted-foreground">
            Manage and monitor all your loans
          </p>
        </div>
        <Button asChild>
          <Link href="/loans/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Loan
          </Link>
        </Button>
      </div>
      <div className="overflow-x-auto">
        <LoansTable loansData={loans} isLoading={false} />
      </div>
    </div>
  );
}
