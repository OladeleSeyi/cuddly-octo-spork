import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      try {
        const publicPaths = ["/", "/about", "/login", "/signup", "/api/public"];
        const isPublicPage = publicPaths.some((path) =>
          nextUrl.pathname.startsWith(path)
        );

        if (isPublicPage) {
          return true;
        }

        const isLoggedIn = !!auth?.user;

        if (isLoggedIn) {
          return true;
        } else {
          return Response.redirect(new URL("/login", nextUrl));
        }
      } catch (error) {
        console.error("error in authorized callback", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        session.user.id = token.id;
      }
      return session;
    },
  },

  session: {
    maxAge: 60 * 60, // 60 minutes
    strategy: "jwt",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          const parsedCredentials = z
            .object({ email: z.string().email(), password: z.string().min(6) })
            .safeParse(credentials);

          if (!parsedCredentials.success) {
            throw new Error("Invalid credentials");
          }

          const { email, password } = parsedCredentials.data;

          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
          });

          if (!user || !user.password) {
            throw new Error("Invalid email or password");
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) {
            throw new Error("Invalid email or password");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error("error in auth", error?.message);
          } 
          throw new Error( "Authentication failed");
        }
      },
    }),
  ],
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
