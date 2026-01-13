"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        /* Logística de Foco e Tema */
        "w-full rounded-xl border border-input bg-background px-4 py-2 text-sm text-foreground transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    />
  );
}