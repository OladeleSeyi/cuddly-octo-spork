"use server";

import { z } from "zod";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signUpSchema } from "./validation-schema";

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
