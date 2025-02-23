import { SignUpForm } from "@/components/signup-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  // If the user is already logged in, redirect to the dashboard
  // const session = await auth();
  // if (session) {
  //   redirect("/dashboard");
  // }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  );
}
