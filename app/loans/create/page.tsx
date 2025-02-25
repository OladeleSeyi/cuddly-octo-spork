import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CreateLoanForm } from "@/components/create-loan-form";

export default async function CreateLoanPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container max-w-3xl py-10">
      <CreateLoanForm userId={session?.user?.id as string} />
    </div>
  );
}
