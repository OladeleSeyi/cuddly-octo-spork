import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loanFormSchema = z.object({
  purpose: z
    .string()
    .min(10, "Purpose must be at least 10 characters")
    .max(200, "Purpose must not exceed 200 characters"),
  amount: z
    .string()
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Amount must be a positive number"
    ),
  interestRate: z
    .string()
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100,
      "Interest rate must be between 0 and 100"
    ),
  termMonths: z
    .string()
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 360,
      "Term must be between 1 and 360 months"
    ),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  collateral: z.string().optional(),
  description: z
    .string()
    .min(50, "Please provide a detailed description (minimum 50 characters)")
    .max(1000, "Description must not exceed 1000 characters"),
});
