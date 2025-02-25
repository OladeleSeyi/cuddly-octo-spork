"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface LogoutButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  showIcon?: boolean;
}

export function LogoutButton({
  variant = "default",
  showIcon = true,
  className,
  children,
  ...props
}: LogoutButtonProps) {
  const [isPending, startTransition] = React.useTransition();

  return (
    <Button
      variant={variant}
      className={className}
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          signOut();
        });
      }}
      {...props}
    >
      {isPending ? (
        "Logging out..."
      ) : (
        <>
          {showIcon && <LogOut className="mr-2 h-4 w-4" />}
          {children || "Logout"}
        </>
      )}
    </Button>
  );
}
