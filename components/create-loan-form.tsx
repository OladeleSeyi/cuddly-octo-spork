"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { createLoan } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loanFormSchema } from "@/lib/validation-schema";

type LoanFormValues = z.infer<typeof loanFormSchema>;

export function CreateLoanForm({ userId }: { userId: string }) {
  const router = useRouter();
  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      amount: "",
      interestRate: "",
      termMonths: "",
      collateral: "",
      description: "",
      startDate: new Date(),
      purpose: "",
    },
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [monthlyPayment, setMonthlyPayment] = React.useState<number | null>(
    null
  );

  const watchAmount = form.watch("amount");
  const watchInterestRate = form.watch("interestRate");
  const watchTermMonths = form.watch("termMonths");

  // Calculate monthly payment when amount, interest rate, or term changes
  React.useEffect(() => {
    const amount = Number(form.watch("amount"));
    const interestRate = Number(form.watch("interestRate"));
    const termMonths = Number(form.watch("termMonths"));

    if (amount && interestRate && termMonths) {
      const monthlyRate = interestRate / 100 / 12;
      const payment =
        (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
        (Math.pow(1 + monthlyRate, termMonths) - 1);
      setMonthlyPayment(Number(payment.toFixed(2)));
    } else {
      setMonthlyPayment(null);
    }
  }, [form, watchAmount, watchInterestRate, watchTermMonths]);

  async function onSubmit(data: LoanFormValues) {
    setIsLoading(true);
    try {
      await createLoan({
        ...data,
        borrowerId: userId,
        amount: Number(data.amount),
        interestRate: Number(data.interestRate),
        termMonths: Number(data.termMonths),
        monthlyPayment: monthlyPayment || 0,
      });
      toast.success("Loan request created successfully");
      router.push("/loans");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create loan request");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request a Loan</CardTitle>
        <CardDescription>
          Fill out the form below to request a loan. Lenders will review your
          request and may choose to fund it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Purpose *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Home renovation, Business expansion"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Briefly describe what the loan will be used for
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requested Amount ($) *</FormLabel>
                    <FormControl>
                      <Input placeholder="10000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interestRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Interest Rate (%) *</FormLabel>
                    <FormControl>
                      <Input placeholder="5.5" {...field} />
                    </FormControl>
                    <FormDescription>
                      The highest interest rate you&apos;re willing to accept
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="termMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term (Months) *</FormLabel>
                    <FormControl>
                      <Input placeholder="12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Desired Start Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="collateral"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collateral</FormLabel>
                  <FormControl>
                    <Input placeholder="Asset description" {...field} />
                  </FormControl>
                  <FormDescription>
                    Describe any assets being used as collateral for this loan
                    (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide detailed information about your loan request, including how you plan to use the funds and your repayment plan"
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <Button
              // type="submit"
              className="w-full"
              disabled={isLoading}
              onClick={() => form.handleSubmit(onSubmit)}
            >
              {isLoading ? "Creating Request..." : "Submit Loan Request"}
            </Button> */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Request..." : "Submit Loan Request"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        {monthlyPayment && (
          <div className="w-full p-4 bg-muted rounded-lg">
            <div className="text-sm font-medium">Estimated Monthly Payment</div>
            <div className="text-2xl font-semibold text-primary">
              ${monthlyPayment.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Based on your requested amount, term, and maximum interest rate
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
