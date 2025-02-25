import { LoansTable } from "@/components/loans-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getPendingLoans } from "@/lib/actions";

export default async function LoansPage() {
  const loans = await getPendingLoans({ limit: 50 });

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Available Opportunities
          </h1>
          <p className="text-muted-foreground">Back Projects of your Choice</p>
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
